import type { CSSProperties } from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import styles from './index.module.scss';

type Props = {
  content?: string | null;
  className?: string;
  style?: CSSProperties;
};

export default function MarkdownPreview({ content, className, style }: Props) {
  const text = content?.trim();
  if (!text) {
    return (
      <div className={[styles.root, className].filter(Boolean).join(' ')} style={style}>
        <p className={styles.empty}>（暂无正文）</p>
      </div>
    );
  }

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} style={style}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
