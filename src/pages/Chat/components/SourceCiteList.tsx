import FileTypeIcon from '@/components/FileTypeIcon';

import type { ChatSourceDto } from '@/service/api';

import { citeAnchorId } from './AnswerMarkdown';

import styles from './SourceCiteList.module.scss';

type Props = {
  items: ChatSourceDto[];
  scope: string;
  activeIndex?: number | null;
  fileExtMap?: Record<string, string | null>;
  onOpenDocument?: (documentId: string) => void;
};

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
          return (
            <div
              key={`${s.documentId}-${index}`}
              id={citeAnchorId(scope, index)}
              className={`${styles.card}${activeIndex === index ? ` ${styles.active}` : ''}`}
            >
              <div className={styles.cardHead}>
                <FileTypeIcon ext={fileExtMap?.[s.documentId] ?? undefined} size={20} />
                {onOpenDocument ? (
                  <button
                    type="button"
                    className={styles.docTitle}
                    title={s.documentTitle}
                    onClick={() => onOpenDocument(s.documentId)}
                  >
                    [{index}] {s.documentTitle}
                  </button>
                ) : (
                  <div className={styles.docTitle} title={s.documentTitle}>
                    [{index}] {s.documentTitle}
                  </div>
                )}
              </div>
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
          );
        })}
      </div>
    </div>
  );
}
