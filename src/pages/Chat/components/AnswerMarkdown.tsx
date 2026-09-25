import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  type ReactNode,
} from 'react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatSourceDto } from '@/service/api';

import CopyableBlock from './CopyableBlock';
import { MarkdownCode } from './MarkdownCodeBlock';

import styles from './AnswerMarkdown.module.scss';

type Props = {
  text: string;
  sources?: ChatSourceDto[];
  scope: string;
  onCite?: (index: number) => void;
};

export function citeAnchorId(scope: string, index: number) {
  return `chat-cite-${scope}-${index}`;
}

export function focusCite(scope: string, index: number) {
  const el = document.getElementById(citeAnchorId(scope, index));
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  el.classList.remove(styles.flash);
  void el.offsetWidth;
  el.classList.add(styles.flash);
}

export default function AnswerMarkdown({ text, sources, scope, onCite }: Props) {
  const byIndex = new Map(
    (sources ?? []).filter((s) => s.index != null).map((s) => [s.index, s]),
  );

  const handleCite = useCallback(
    (index: number) => {
      onCite?.(index);
      focusCite(scope, index);
    },
    [onCite, scope],
  );

  const wrap = (children: ReactNode) => injectCites(children, byIndex, handleCite);

  return (
    <CopyableBlock text={text} className={`${styles.root} ${styles.prose}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{wrap(children)}</p>,
          li: ({ children }) => <li>{wrap(children)}</li>,
          strong: ({ children }) => <strong>{wrap(children)}</strong>,
          em: ({ children }) => <em>{wrap(children)}</em>,
          h1: ({ children }) => <h3>{wrap(children)}</h3>,
          h2: ({ children }) => <h3>{wrap(children)}</h3>,
          h3: ({ children }) => <h4>{wrap(children)}</h4>,
          h4: ({ children }) => <h4>{wrap(children)}</h4>,
          table: ({ children }) => <div className={styles.tableWrap}><table>{children}</table></div>,
          td: ({ children }) => <td>{wrap(children)}</td>,
          th: ({ children }) => <th>{wrap(children)}</th>,
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children }) => (
            <MarkdownCode className={className}>{children}</MarkdownCode>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {wrap(children)}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </CopyableBlock>
  );
}

function injectCites(
  children: ReactNode,
  byIndex: Map<number, ChatSourceDto>,
  onCite: (index: number) => void,
): ReactNode {
  return Children.map(children, (child, i) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return <CiteChips key={i} text={String(child)} byIndex={byIndex} onCite={onCite} />;
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children != null) {
      return cloneElement(child, {
        children: injectCites(child.props.children, byIndex, onCite),
      });
    }
    return child;
  });
}

function CiteChips({
  text,
  byIndex,
  onCite,
}: {
  text: string;
  byIndex: Map<number, ChatSourceDto>;
  onCite: (index: number) => void;
}) {
  const parts = text.split(/(\[\d+\])/);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (!match) return <span key={i}>{part}</span>;
        const index = Number(match[1]);
        if (!byIndex.has(index)) return <span key={i}>{part}</span>;
        return (
          <button
            key={i}
            type="button"
            className={styles.citeInline}
            title="查看本条用到的资料块"
            onClick={() => onCite(index)}
          >
            {part}
          </button>
        );
      })}
    </>
  );
}
