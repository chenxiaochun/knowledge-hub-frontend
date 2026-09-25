import dayjs from 'dayjs';

import type { ChatSourceDto, RagChunkHitDto } from '@/service/api';

import type { KhUIMessage } from './components/ChatMessageParts';
import type { LocalMessage } from './types';

export function formatSessionTime(value: string) {
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export function citedSources(
  sources: ChatSourceDto[] | null | undefined,
  answer: string,
): ChatSourceDto[] {
  if (!sources?.length) return [];
  const used = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  if (!used.size) return sources;
  return sources.filter((s) => used.has(s.index));
}

export function ragHitsToSources(hits: RagChunkHitDto[]): ChatSourceDto[] {
  return hits.map((hit, i) => ({
    index: i + 1,
    documentId: hit.documentId,
    documentTitle: hit.documentTitle,
    heading: hit.heading,
    excerpt: excerpt(hit.content),
    score: hit.score,
  }));
}

function excerpt(content: string, max = 200) {
  const text = content.replace(/\s+/g, ' ').trim();
  return text.length <= max ? text : `${text.slice(0, max)}...`;
}

export function toLocalMessages(
  rows: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatSourceDto[] | null;
  }>,
): LocalMessage[] {
  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    sources: row.sources ?? null,
  }));
}

export function historyToUIMessages(
  rows: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatSourceDto[] | null;
  }>,
): KhUIMessage[] {
  return rows.map((row) => {
    if (row.role === 'user') {
      return {
        id: row.id,
        role: 'user',
        parts: [{ type: 'text', text: row.content }],
      };
    }
    const parts: KhUIMessage['parts'] = [];
    if (row.sources?.length) {
      parts.push({ type: 'data-sources', data: row.sources });
    }
    parts.push({ type: 'text', text: row.content });
    return { id: row.id, role: 'assistant', parts };
  });
}
