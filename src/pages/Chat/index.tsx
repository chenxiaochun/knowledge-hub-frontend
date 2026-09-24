import { Typography } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { getApiDocumentId } from '@/service/api';
import type { DocumentDetail } from '@/types/document';

import ChatInput from './components/ChatInput';
import ChatMessageList from './components/ChatMessageList';
import ChatSidebar from './components/ChatSidebar';
import { useChatPage } from './hooks/useChatPage';

import styles from './index.module.scss';

export default function ChatPage() {
  const logRef = useRef<HTMLDivElement>(null);
  const {
    sessionId,
    sessions,
    messages,
    messagesLoading,
    input,
    topK,
    searchOnlyMode,
    busy,
    logPinBottomRef,
    setInput,
    setTopK,
    setSearchOnlyMode,
    switchSession,
    onNewSession,
    onRemoveSession,
    send,
  } = useChatPage();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const onLogScroll = useCallback(() => {
    const el = logRef.current;
    if (!el) return;
    logPinBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, [logPinBottomRef]);

  useEffect(() => {
    if (!logPinBottomRef.current) return;
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    });
  }, [messages, logPinBottomRef]);

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
        onRemove={onRemoveSession}
      />

      <div className={styles.main}>
        <Typography.Title level={4} className={styles.title}>
          知识问答
        </Typography.Title>
        <Typography.Paragraph type="secondary" className={styles.desc}>
          走混合检索后再生成。无召回不会调模型。问答会写入左侧会话，「仅检索」不落库。
        </Typography.Paragraph>

        <div className={styles.logWrap}>
          <ChatMessageList
            messages={messages}
            loading={messagesLoading}
            logRef={logRef}
            onLogScroll={onLogScroll}
            onOpenDocument={(id) => void openDocument(id)}
          />
        </div>

        <ChatInput
          value={input}
          topK={topK}
          searchOnly={searchOnlyMode}
          busy={busy}
          onChange={setInput}
          onTopKChange={setTopK}
          onSearchOnlyChange={setSearchOnlyMode}
          onSend={() => void send()}
        />
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
