import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import { CodeHighlighter } from '@ant-design/x';
import XMarkdown, { type ComponentProps } from '@ant-design/x-markdown';
import '@ant-design/x-markdown/themes/light.css';

import type { ChatSourceDto } from '@/service/api';

import styles from './AnswerMarkdown.module.scss';

type Props = {
  text: string;
  sources?: ChatSourceDto[];
  scope: string;
  onCite?: (index: number) => void;
  streaming?: boolean;
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

function useMdComponents(
  byIndex: Map<number, ChatSourceDto>,
  handleCite: (index: number) => void,
) {
  return useMemo(() => {
    const wrap = (children: ReactNode) => injectCites(children, byIndex, handleCite);
    const withCites = (Tag: 'p' | 'li' | 'strong' | 'em' | 'td' | 'th' | 'h1' | 'h2' | 'h3' | 'h4') =>
      function CiteNode({ children }: ComponentProps) {
        return <Tag>{wrap(children)}</Tag>;
      };

    return {
      pre: ({ children }: ComponentProps) => <>{children}</>,
      p: withCites('p'),
      li: withCites('li'),
      strong: withCites('strong'),
      em: withCites('em'),
      h1: withCites('h1'),
      h2: withCites('h2'),
      h3: withCites('h3'),
      h4: withCites('h4'),
      td: withCites('td'),
      th: withCites('th'),
      code: ({ block, lang, className, children }: ComponentProps) => {
        if (!block) return <code>{wrap(children)}</code>;
        if (typeof children !== 'string') return null;
        const langFromClass = className?.match(/language-([\w-]+)/)?.[1];
        const resolvedLang = lang || langFromClass || 'text';
        return (
          <CodeHighlighter lang={resolvedLang}>{children.replace(/\n$/, '')}</CodeHighlighter>
        );
      },
    };
  }, [byIndex, handleCite]);
}

export default function AnswerMarkdown({ text, sources, scope, onCite, streaming }: Props) {
  const byIndex = useMemo(
    () => new Map((sources ?? []).filter((s) => s.index != null).map((s) => [s.index!, s])),
    [sources],
  );

  const handleCite = useCallback(
    (index: number) => {
      onCite?.(index);
      focusCite(scope, index);
    },
    [onCite, scope],
  );

  const components = useMdComponents(byIndex, handleCite);

  return (
    <XMarkdown
      content={text}
      className="x-markdown-light"
      openLinksInNewTab
      disableDefaultStyles={['pre', 'code']}
      streaming={{ hasNextChunk: streaming ?? false }}
      components={components}
    />
  );
}
