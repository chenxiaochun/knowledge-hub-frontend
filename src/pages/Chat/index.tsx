import { useCallback, useEffect, useState } from 'react';

import { Typography } from 'antd';

import type { DocumentDetail } from '@/types/document';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { getApiDocumentId } from '@/service/api';

import ChatInput from './components/ChatInput';
import ChatMessageList from './components/ChatMessageList';
import ChatSidebar from './components/ChatSidebar';
import { useChatPage } from './hooks/useChatPage';
import styles from './index.module.scss';

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

  const syncPinBottom = useCallback(() => {
    const dist =
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    logPinBottomRef.current = dist < 80;
  }, [logPinBottomRef]);

  useEffect(() => {
    window.addEventListener('scroll', syncPinBottom, { passive: true });
    return () => window.removeEventListener('scroll', syncPinBottom);
  }, [syncPinBottom]);

  useEffect(() => {
    if (!logPinBottomRef.current) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    });
  }, [messages, searchOnlyMessages, streaming, logPinBottomRef]);

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
          onOpenDocument={(id) => void openDocument(id)}
        />

        <div className={styles.inputSticky}>
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
