import { Empty, Spin } from 'antd';
import { useState } from 'react';

import type { LocalMessage } from '../types';
import { citedSources, ragHitsToSources } from '../utils';

import AnswerMarkdown from './AnswerMarkdown';
import SourceCiteList from './SourceCiteList';

import styles from './ChatMessageList.module.scss';

type Props = {
  messages: LocalMessage[];
  loading: boolean;
  onOpenDocument?: (documentId: string) => void;
};

export default function ChatMessageList({ messages, loading, onOpenDocument }: Props) {
  const [activeCite, setActiveCite] = useState<{ scope: string; index: number } | null>(null);

  if (loading && messages.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <Spin />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="输入问题开始一段对话" />
      </div>
    );
  }

  return (
    <div className={styles.log}>
      {messages.map((msg) => {
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
                <Spin size="small" /> 正在生成回答…
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
                  onSelect={(index) => setActiveCite({ scope: msg.id, index })}
                  onOpenDocument={onOpenDocument}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
