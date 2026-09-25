import { useState, type ReactNode } from 'react';

import { FileSearchOutlined } from '@ant-design/icons';

import { getToolName, isToolUIPart, type UIMessage } from 'ai';

import type { ChatSourceDto } from '@/service/api';

import { citedSources as filterCitedSources } from '../utils';
import AnswerMarkdown from './AnswerMarkdown';
import styles from './ChatMessageParts.module.scss';
import SourceCiteList from './SourceCiteList';
import WebSearchCard from './WebSearchCard';

export type RetrieveHit = {
  index: number;
  documentId: string;
  documentTitle: string;
  heading: string | null;
};

export type KhUIMessage = UIMessage<
  unknown,
  {
    status: { stage: string; text: string };
    think: { text: string };
    sources: ChatSourceDto[];
    retrieve: { query: string; items: RetrieveHit[] };
    session: { sessionId: string };
  }
>;

export function sourcesFromParts(parts: KhUIMessage['parts']): ChatSourceDto[] {
  for (const part of parts) {
    if (part.type === 'data-sources' && Array.isArray(part.data)) {
      return part.data;
    }
  }
  return [];
}

export function textFromParts(parts: KhUIMessage['parts']): string {
  return parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

type Props = {
  messageId: string;
  parts: KhUIMessage['parts'];
  role: KhUIMessage['role'];
  showSources?: boolean;
  fileExtMap?: Record<string, string | null>;
  onOpenDocument?: (documentId: string) => void;
};

export default function ChatMessageParts({
  messageId,
  parts,
  role,
  showSources = true,
  fileExtMap,
  onOpenDocument,
}: Props) {
  const sources = filterCitedSources(sourcesFromParts(parts), textFromParts(parts));
  const [activeCite, setActiveCite] = useState<number | null>(null);
  const texts = parts.filter((part) => part.type === 'text' && part.text);

  if (role === 'user') {
    return (
      <>
        {texts.map((part, i) =>
          part.type === 'text' ? (
            <div key={i} className={styles.userText}>
              {part.text}
            </div>
          ) : null,
        )}
      </>
    );
  }

  const hasRetrieve = parts.some((part) => part.type === 'data-retrieve');

  return (
    <>
      {renderProcessParts(parts, hasRetrieve)}
      {texts.map((part, i) =>
        part.type === 'text' ? (
          <div key={`text-${i}`}>
            <AnswerMarkdown
              text={part.text}
              sources={sources}
              scope={messageId}
              onCite={setActiveCite}
            />
          </div>
        ) : null,
      )}
      {showSources && sources.length ? (
        <SourceCiteList
          items={sources}
          scope={messageId}
          activeIndex={activeCite}
          fileExtMap={fileExtMap}
          onOpenDocument={onOpenDocument}
        />
      ) : null}
    </>
  );
}

function renderProcessParts(parts: KhUIMessage['parts'], hasRetrieve: boolean) {
  const nodes: ReactNode[] = [];
  let reasoningBuf: string[] = [];
  let reasoningStreaming = false;
  let thinkKey = 0;

  const flushReasoning = () => {
    if (!reasoningBuf.length) return;
    nodes.push(
      <ThinkBlock
        key={`think-${thinkKey}`}
        text={reasoningBuf.join('\n\n')}
        streaming={reasoningStreaming}
      />,
    );
    thinkKey += 1;
    reasoningBuf = [];
    reasoningStreaming = false;
  };

  parts.forEach((part, i) => {
    if (part.type === 'reasoning' || part.type === 'data-think') {
      const text = 'text' in part && typeof part.text === 'string' ? part.text : '';
      if (text) reasoningBuf.push(text);
      if ('state' in part && part.state === 'streaming') reasoningStreaming = true;
      return;
    }

    flushReasoning();

    if (
      part.type === 'step-start' ||
      part.type === 'data-session' ||
      part.type === 'data-sources' ||
      part.type === 'source-document' ||
      part.type === 'text'
    ) {
      return;
    }

    if (part.type === 'data-status') {
      if (part.data.stage === 'generate') return;
      if (part.data.stage === 'retrieve' && hasRetrieve) return;
      nodes.push(
        <div key={i} className={styles.status}>
          {part.data.text}
        </div>,
      );
      return;
    }

    if (part.type === 'data-retrieve') {
      nodes.push(<RetrieveCard key={i} query={part.data.query} items={part.data.items} />);
      return;
    }

    if (part.type === 'source-url') {
      nodes.push(
        <a key={i} className={styles.webLink} href={part.url} target="_blank" rel="noreferrer">
          {part.title || part.url}
        </a>,
      );
      return;
    }

    if (isToolUIPart(part) && getToolName(part) === 'web_search') {
      nodes.push(<WebSearchCard key={i} part={part} />);
    }
  });

  flushReasoning();
  return nodes;
}

function RetrieveCard({ query, items }: { query: string; items: RetrieveHit[] }) {
  const count = items.length;
  const label = count ? '已检索知识库' : '未检索到相关资料';

  return (
    <details className={styles.web}>
      <summary>
        <FileSearchOutlined />
        <span className={styles.webLabel}>{label}</span>
        {query ? <span className={styles.webQ}>{query}</span> : null}
        {count ? <span className={styles.webN}>{count}</span> : null}
      </summary>
      {count ? (
        <ul className={styles.webList}>
          {items.map((hit) => (
            <li key={`${hit.documentId}-${hit.index}`}>
              [{hit.index}] {hit.documentTitle}
              {hit.heading ? ` / ${hit.heading}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}

function ThinkBlock({ text, streaming }: { text: string; streaming?: boolean }) {
  return (
    <details className={styles.think} open>
      <summary>{streaming ? '思考中…' : '思考过程'}</summary>
      <div className={styles.thinkBody}>{text}</div>
    </details>
  );
}
