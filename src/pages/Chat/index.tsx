import { useCallback, useEffect, useRef, useState } from 'react';

import { Typography } from 'antd';

import type { DocumentDetail } from '@/types/document';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { getApiDocumentId } from '@/service/api';

import ChatInput from './components/ChatInput';
import ChatMessageList from './components/ChatMessageList';
import ChatSidebar from './components/ChatSidebar';
import { useChatPage } from './hooks/useChatPage';
import styles from './index.module.scss';

function alignChatViewport(logEndEl: HTMLElement | null, inputEl: HTMLElement | null) {
  if (logEndEl) {
    logEndEl.scrollIntoView({ block: 'end', behavior: 'instant' });
    return;
  }
  inputEl?.scrollIntoView({ block: 'end', behavior: 'instant' });
}

export default function ChatPage() {
  const {
    sessionId,
    sessions,
    messages,
    searchOnlyMessages,
    messagesLoading,
    input,
    topK,
    searchOnlyMode,
    busy,
    streaming,
    streamError,
    logPinBottomRef,
    setInput,
    setTopK,
    setSearchOnlyMode,
    switchSession,
    onNewSession,
    onRemoveSession,
    send,
    stop,
  } = useChatPage();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const inputRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const pendingAlignRef = useRef(false);

  const syncInputReserve = useCallback(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const reserve = inputEl.offsetHeight + 16;
    inputEl.style.setProperty('--chat-input-reserve', `${reserve}px`);
    logEndRef.current?.style.setProperty('--chat-input-reserve', `${reserve}px`);
  }, []);

  const syncPinBottom = useCallback(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const dist = inputEl.getBoundingClientRect().bottom - window.innerHeight;
    logPinBottomRef.current = dist <= 80;
  }, [logPinBottomRef]);

  useEffect(() => {
    syncInputReserve();
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const observer = new ResizeObserver(syncInputReserve);
    observer.observe(inputEl);
    return () => observer.disconnect();
  }, [syncInputReserve]);

  useEffect(() => {
    pendingAlignRef.current = true;
  }, [sessionId]);

  useEffect(() => {
    if (!pendingAlignRef.current || messagesLoading) return;
    pendingAlignRef.current = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncInputReserve();
        alignChatViewport(logEndRef.current, inputRef.current);
      });
    });
  }, [sessionId, messagesLoading, messages.length, searchOnlyMessages.length, syncInputReserve]);

  useEffect(() => {
    window.addEventListener('scroll', syncPinBottom, { passive: true });
    return () => window.removeEventListener('scroll', syncPinBottom);
  }, [syncPinBottom]);

  useEffect(() => {
    if (!logPinBottomRef.current) return;
    requestAnimationFrame(() => {
      syncInputReserve();
      alignChatViewport(logEndRef.current, inputRef.current);
    });
  }, [messages, searchOnlyMessages, streaming, logPinBottomRef, syncInputReserve]);

  const openDocument = async (documentId: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = (await getApiDocumentId({ path: { id: documentId } })) as DocumentDetail;
      setDetail(res);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <ChatSidebar
        sessions={sessions}
        activeId={sessionId}
        busy={busy}
        onNew={() => void onNewSession()}
        onSelect={switchSession}
        onRemove={(id) => void onRemoveSession(id)}
      />

      <div className={styles.main}>
        <Typography.Title level={4} className={styles.title}>
          知识问答
        </Typography.Title>
        <Typography.Paragraph type="secondary" className={styles.desc}>
          流式回答会展示知识库检索、思考与联网搜索过程，并写入左侧会话。「仅检索」不落库。
        </Typography.Paragraph>

        <ChatMessageList
          messages={messages}
          searchOnlyMessages={searchOnlyMessages}
          loading={messagesLoading}
          streaming={streaming}
          error={streamError}
          logEndRef={logEndRef}
          onOpenDocument={(id) => void openDocument(id)}
        />

        <div ref={inputRef} className={styles.inputSticky}>
          <ChatInput
            value={input}
            topK={topK}
            searchOnly={searchOnlyMode}
            busy={busy}
            streaming={streaming}
            onChange={setInput}
            onTopKChange={setTopK}
            onSearchOnlyChange={setSearchOnlyMode}
            onSend={() => void send()}
            onStop={() => void stop()}
          />
        </div>
      </div>

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
