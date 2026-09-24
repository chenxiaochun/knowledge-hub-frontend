import FileTypeIcon from '@/components/FileTypeIcon';

import type { ChatSourceDto } from '@/service/api';

import { citeAnchorId } from './AnswerMarkdown';

import styles from './SourceCiteList.module.scss';

function extFromTitle(title: string) {
  const dot = title.lastIndexOf('.');
  return dot >= 0 ? title.slice(dot + 1) : undefined;
}

type Props = {
  items: ChatSourceDto[];
  scope: string;
  activeIndex?: number | null;
  onSelect?: (index: number) => void;
  onOpenDocument?: (documentId: string) => void;
};

export default function SourceCiteList({
  items,
  scope,
  activeIndex,
  onSelect,
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
              onClick={() => onSelect?.(index)}
            >
              <FileTypeIcon ext={extFromTitle(s.documentTitle)} size={28} />
              <div className={styles.body}>
                <div className={styles.docTitle} title={s.documentTitle}>
                  [{index}] {s.documentTitle}
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
                {onOpenDocument ? (
                  <button
                    type="button"
                    className={styles.openBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocument(s.documentId);
                    }}
                  >
                    查看原文
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
