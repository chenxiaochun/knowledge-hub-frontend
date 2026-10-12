import { clsx } from 'clsx';
import { FileCard } from '@ant-design/x';

import type { ChatSourceDto } from '@/service/api';

import { citeAnchorId } from './citeAnchor';

import styles from './SourceCiteList.module.scss';

type Props = {
  items: ChatSourceDto[];
  scope: string;
  activeIndex?: number | null;
  fileExtMap?: Record<string, string | null>;
  onOpenDocument?: (documentId: string) => void;
};

function displayFileName(index: number, title: string, ext?: string | null) {
  const normalized = (ext ?? '').replace(/^\./, '').toLowerCase();
  // FileCard 按 name 后缀选彩色预设图标；无后缀会落成灰色 default
  return normalized ? `[${index}] ${title}.${normalized}` : `[${index}] ${title}`;
}

export default function SourceCiteList({
  items,
  scope,
  activeIndex,
  fileExtMap,
  onOpenDocument,
}: Props) {
  if (!items.length) return null;

  return (
    <div className={styles.list}>
      <div className={styles.title}>引用文档 ({items.length})</div>
      <div className={styles.rail}>
        {items.map((s, i) => {
          const index = s.index ?? i + 1;
          const hasSummary = Boolean(s.heading || s.excerpt);
          const ext = fileExtMap?.[s.documentId];
          const fileName = displayFileName(index, s.documentTitle, ext);

          return (
            <div
              key={`${s.documentId}-${index}`}
              id={citeAnchorId(scope, index)}
              className={clsx(styles.item, activeIndex === index && styles.active)}
            >
              <FileCard
                // ext 异步到位后需重挂载，FileCard 内部未把 icon 列入 memo 依赖
                key={fileName}
                className={styles.card}
                size="small"
                name={fileName}
                description={false}
                onClick={
                  onOpenDocument
                    ? (_info, event) => {
                        event.preventDefault();
                        onOpenDocument(s.documentId);
                      }
                    : undefined
                }
              />
              {hasSummary ? (
                <div className={styles.summary}>
                  {s.heading ? (
                    <div className={styles.heading} title={s.heading}>
                      {s.heading}
                    </div>
                  ) : null}
                  {s.excerpt ? (
                    <div className={styles.excerpt} title={s.excerpt}>
                      {s.excerpt}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
