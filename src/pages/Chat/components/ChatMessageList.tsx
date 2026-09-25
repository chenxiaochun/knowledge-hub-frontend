import { Empty, Spin } from 'antd';
import { useMemo, useState, type RefObject } from 'react';

import { useDocumentFileExts } from '../hooks/useDocumentFileExts';
import type { KhUIMessage } from './ChatMessageParts';
import type { LocalMessage } from '../types';
import { citedSources, ragHitsToSources } from '../utils';

import AnswerMarkdown from './AnswerMarkdown';
import ChatMessageParts from './ChatMessageParts';
import SourceCiteList from './SourceCiteList';

import styles from './ChatMessageList.module.scss';

type Props = {
  messages: KhUIMessage[];
  searchOnlyMessages?: LocalMessage[];
  loading: boolean;
  streaming?: boolean;
  error?: Error;
  logEndRef?: RefObject<HTMLDivElement | null>;
  onOpenDocument?: (documentId: string) => void;
};

export default function ChatMessageList({
  messages,
  searchOnlyMessages = [],
  loading,
  streaming = false,
  error,
  logEndRef,
  onOpenDocument,
}: Props) {
  const [activeCite, setActiveCite] = useState<{ scope: string; index: number } | null>(null);

  const citeDocumentIds = useMemo(() => {
    const ids: string[] = [];
    for (const msg of messages) {
      if (msg.role !== 'assistant') continue;
      for (const part of msg.parts) {
        if (part.type === 'data-sources' && Array.isArray(part.data)) {
          for (const source of part.data) ids.push(source.documentId);
        }
      }
    }
    for (const msg of searchOnlyMessages) {
      if (msg.role !== 'assistant' || msg.pending) continue;
      const sources = msg.ragHits?.length
        ? ragHitsToSources(msg.ragHits)
        : citedSources(msg.sources, msg.content);
      for (const source of sources) ids.push(source.documentId);
    }
    return ids;
  }, [messages, searchOnlyMessages]);

  const fileExtMap = useDocumentFileExts(citeDocumentIds);
  const hasMessages = messages.length > 0 || searchOnlyMessages.length > 0;

  if (loading && !hasMessages) {
    return (
      <div className={styles.log}>
        <div className={styles.emptyWrap}>
          <Spin />
        </div>
      </div>
    );
  }

  if (!hasMessages) {
    return (
      <div className={styles.log}>
        <div className={styles.emptyWrap}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入问题开始一段对话" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.log}>
      {messages.map((msg, i) => {
        const liveAssistant =
          streaming && msg.role === 'assistant' && i === messages.length - 1;
        return (
          <div
            key={msg.id}
            className={`${styles.bubble} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >
            <ChatMessageParts
              messageId={msg.id}
              parts={msg.parts}
              role={msg.role}
              showSources={!liveAssistant}
              fileExtMap={fileExtMap}
              onOpenDocument={onOpenDocument}
            />
          </div>
        );
      })}

      {searchOnlyMessages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className={`${styles.bubble} ${styles.user}`}>
              {msg.content}
            </div>
          );
        }

        const sources = msg.ragHits?.length
          ? ragHitsToSources(msg.ragHits)
          : citedSources(msg.sources, msg.content);

        return (
          <div key={msg.id} className={`${styles.bubble} ${styles.assistant}`}>
            {msg.pending ? (
              <div className={styles.pending}>
                <Spin size="small" /> 正在检索…
              </div>
            ) : (
              <>
                {msg.ragHits?.length ? (
                  <div className={styles.searchOnlyHint}>
                    仅检索模式：共召回 {msg.ragHits.length} 条资料块，未调用大模型。
                  </div>
                ) : null}
                <AnswerMarkdown
                  text={msg.content}
                  sources={sources}
                  scope={msg.id}
                  onCite={(index) => setActiveCite({ scope: msg.id, index })}
                />
                <SourceCiteList
                  items={sources}
                  scope={msg.id}
                  activeIndex={activeCite?.scope === msg.id ? activeCite.index : null}
                  fileExtMap={fileExtMap}
                  onOpenDocument={onOpenDocument}
                />
              </>
            )}
          </div>
        );
      })}

      {error ? <div className={styles.error}>{error.message}</div> : null}
      <div ref={logEndRef} className={styles.logEnd} aria-hidden />
    </div>
  );
}
