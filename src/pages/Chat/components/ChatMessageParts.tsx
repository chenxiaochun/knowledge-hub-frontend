import { useMemo, useState, type ReactNode } from 'react';

import { FileSearchOutlined } from '@ant-design/icons';
import { Think } from '@ant-design/x';

import { getToolName, isToolUIPart } from 'ai';

import type { ChatImageDto } from '@/service/api';

import {
  sourcesFromParts,
  textFromParts,
  type KhUIMessage,
  type RetrieveHit,
} from '../chatUiMessage';
import { parseToolPayload } from '../toolPayload';
import { citedSources as filterCitedSources } from '../utils';
import LazyAnswerMarkdown from './LazyAnswerMarkdown';
import styles from './ChatMessageParts.module.scss';
import GenerateImageCard, { ChatImagePreview } from './GenerateImageCard';
import SourceCiteList from './SourceCiteList';
import WebSearchCard from './WebSearchCard';

type Props = {
  messageId: string;
  parts: KhUIMessage['parts'];
  role: KhUIMessage['role'];
  showSources?: boolean;
  streaming?: boolean;
  fileExtMap?: Record<string, string | null>;
  onOpenDocument?: (documentId: string) => void;
};

export default function ChatMessageParts({
  messageId,
  parts,
  role,
  showSources = true,
  streaming = false,
  fileExtMap,
  onOpenDocument,
}: Props) {
  const sources = filterCitedSources(sourcesFromParts(parts), textFromParts(parts));
  const [activeCite, setActiveCite] = useState<number | null>(null);
  const texts = parts.filter((part) => part.type === 'text' && part.text);
  const hideMarkdownImageUrls = useMemo(() => imageUrlsForMarkdownHide(parts), [parts]);

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
  const persistedImages = parts.filter(
    (part): part is { type: 'data-image'; data: ChatImageDto } => part.type === 'data-image',
  );
  const showGenerateTool = persistedImages.length === 0;

  return (
    <>
      {renderProcessParts(parts, hasRetrieve, showGenerateTool)}
      {persistedImages.map((part, i) => (
        <ChatImagePreview
          key={`img-${i}-${part.data.url}`}
          url={part.data.url}
          alt={part.data.prompt}
        />
      ))}
      {texts.map((part, i) =>
        part.type === 'text' ? (
          <div key={`text-${i}`}>
            <LazyAnswerMarkdown
              text={part.text}
              sources={sources}
              scope={messageId}
              streaming={streaming}
              hideImageUrls={hideMarkdownImageUrls}
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

function imageUrlsForMarkdownHide(parts: KhUIMessage['parts']): Set<string> {
  const urls = new Set<string>();
  for (const part of parts) {
    if (part.type === 'data-image' && part.data.url) urls.add(part.data.url);
    if (!isToolUIPart(part) || getToolName(part) !== 'generate_image') continue;
    if (part.state !== 'output-available') continue;
    const payload = parseToolPayload(part.output);
    if (payload && typeof payload.url === 'string') urls.add(payload.url);
  }
  return urls;
}

function renderProcessParts(
  parts: KhUIMessage['parts'],
  hasRetrieve: boolean,
  showGenerateTool: boolean,
) {
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
      part.type === 'data-image' ||
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
      return;
    }

    if (showGenerateTool && isToolUIPart(part) && getToolName(part) === 'generate_image') {
      nodes.push(<GenerateImageCard key={i} part={part} />);
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
    <Think
      className={styles.think}
      title={streaming ? '思考中…' : '思考过程'}
      loading={streaming}
      defaultExpanded
    >
      <div className={styles.thinkBody}>{text}</div>
    </Think>
  );
}
