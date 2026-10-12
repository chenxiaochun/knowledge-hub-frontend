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
import EvalCard from './EvalCard';
import GenerateImageCard, { ChatImagePreview } from './GenerateImageCard';
import GraphRetrieveCard, { GraphRetrieveToolCard } from './GraphRetrieveCard';
import IntentCard from './IntentCard';
import LazyAnswerMarkdown from './LazyAnswerMarkdown';
import styles from './ChatMessageParts.module.scss';
import RetrieveKnowledgeCard from './RetrieveKnowledgeCard';
import RewriteQueryCard from './RewriteQueryCard';
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

  const hasRetrieve =
    parts.some((part) => part.type === 'data-retrieve') ||
    parts.some((part) => isToolUIPart(part) && getToolName(part) === 'retrieve_knowledge');
  const hasDataGraph = parts.some((part) => part.type === 'data-graph');
  const persistedImages = parts.filter(
    (part): part is { type: 'data-image'; data: ChatImageDto } => part.type === 'data-image',
  );
  const showGenerateTool = persistedImages.length === 0;

  return (
    <>
      {renderProcessParts(
        parts,
        hasRetrieve,
        showGenerateTool,
        hasDataGraph,
        streaming,
        onOpenDocument,
      )}
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

/**
 * 过程条固定顺序（与 Agent 检索环一致）：
 * 意图 → 搜库 → 图谱 → 评估 → 改词 → 联网 → 生图 → 其它 → 思考
 */
function processPartRank(part: KhUIMessage['parts'][number]): number {
  if (part.type === 'data-intent') return 10;
  if (part.type === 'data-status') return 20;
  if (part.type === 'data-retrieve') return 30;
  if (isToolUIPart(part) && getToolName(part) === 'retrieve_knowledge') return 30;
  if (part.type === 'data-graph') return 40;
  if (isToolUIPart(part) && getToolName(part) === 'retrieve_graph') return 40;
  if (part.type === 'data-eval') return 50;
  if (isToolUIPart(part) && getToolName(part) === 'rewrite_query') return 60;
  if (isToolUIPart(part) && getToolName(part) === 'web_search') return 70;
  if (part.type === 'source-url') return 75;
  if (isToolUIPart(part) && getToolName(part) === 'generate_image') return 80;
  if (part.type === 'reasoning' || part.type === 'data-think') return 90;
  return 100;
}

function renderProcessParts(
  parts: KhUIMessage['parts'],
  hasRetrieve: boolean,
  showGenerateTool: boolean,
  hasDataGraph: boolean,
  streaming: boolean,
  onOpenDocument?: (documentId: string) => void,
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

  const ordered = parts
    .map((part, index) => ({ part, index }))
    .sort((a, b) => {
      const rank = processPartRank(a.part) - processPartRank(b.part);
      return rank !== 0 ? rank : a.index - b.index;
    });

  ordered.forEach(({ part, index: i }) => {
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
      if (part.data.stage === 'intent') return;
      if (part.data.stage === 'retrieve' && hasRetrieve) return;
      if (part.data.stage === 'rewrite' && hasRewriteTool(parts)) return;
      nodes.push(
        <div key={i} className={styles.status}>
          {part.data.text}
        </div>,
      );
      return;
    }

    if (part.type === 'data-intent') {
      nodes.push(<IntentCard key={i} data={part.data} />);
      return;
    }

    if (part.type === 'data-eval') {
      nodes.push(<EvalCard key={i} data={part.data} />);
      return;
    }

    if (part.type === 'data-graph') {
      nodes.push(
        <GraphRetrieveCard
          key={i}
          data={part.data}
          streaming={streaming}
          onOpenDocument={onOpenDocument}
        />,
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

    if (isToolUIPart(part) && getToolName(part) === 'retrieve_knowledge') {
      nodes.push(<RetrieveKnowledgeCard key={i} part={part} />);
      return;
    }

    if (isToolUIPart(part) && getToolName(part) === 'retrieve_graph') {
      if (hasDataGraph) return;
      nodes.push(
        <GraphRetrieveToolCard
          key={i}
          part={part}
          streaming={streaming}
          onOpenDocument={onOpenDocument}
        />,
      );
      return;
    }

    if (isToolUIPart(part) && getToolName(part) === 'rewrite_query') {
      nodes.push(<RewriteQueryCard key={i} part={part} />);
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

function hasRewriteTool(parts: KhUIMessage['parts']) {
  return parts.some((part) => isToolUIPart(part) && getToolName(part) === 'rewrite_query');
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
