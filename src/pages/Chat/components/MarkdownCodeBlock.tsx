import { useEffect, useState, type ReactNode } from 'react';

import { codeToHtml } from 'shiki';

import CopyableBlock from './CopyableBlock';

import styles from './AnswerMarkdown.module.scss';

const LANG_ALIASES: Record<string, string> = {
  sh: 'bash',
  shell: 'bash',
  ts: 'typescript',
  js: 'javascript',
  yml: 'yaml',
};

function normalizeLang(className?: string) {
  const match = /language-([\w-]+)/.exec(className ?? '');
  if (!match) return 'text';
  const lang = match[1].toLowerCase();
  return LANG_ALIASES[lang] ?? lang;
}

function isBlockCode(className: string | undefined, children: ReactNode) {
  if (/language-/.test(className ?? '')) return true;
  return String(children).includes('\n');
}

export function MarkdownInlineCode({ children }: { children?: ReactNode }) {
  return <code className={styles.inlineCode}>{children}</code>;
}

export default function MarkdownCodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const code = String(children ?? '').replace(/\n$/, '');
  const lang = normalizeLang(className);
  const [html, setHtml] = useState('');

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const out = await codeToHtml(code, { lang, theme: 'github-light' });
        if (active) setHtml(out);
        return;
      } catch {
        /* 未知语言回退纯文本 */
      }
      if (active) setHtml('');
    })();

    return () => {
      active = false;
    };
  }, [code, lang]);

  if (!html) {
    return (
      <CopyableBlock text={code} compact className={styles.codeBlockWrap}>
        <pre className={styles.codeBlockFallback}>
          <code>{code}</code>
        </pre>
      </CopyableBlock>
    );
  }

  return (
    <CopyableBlock text={code} compact className={styles.codeBlockWrap}>
      <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: html }} />
    </CopyableBlock>
  );
}

export function MarkdownCode({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  if (!isBlockCode(className, children)) {
    return <MarkdownInlineCode>{children}</MarkdownInlineCode>;
  }
  return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
}
