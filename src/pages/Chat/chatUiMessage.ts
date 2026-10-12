import { type UIMessage } from 'ai';

import type { ChatImageDto, ChatSourceDto } from '@/service/api';

export type RetrieveHit = {
  index: number;
  documentId: string;
  documentTitle: string;
  heading: string | null;
};

/** 与后端 ChatRoutePlan / data-intent 对齐 */
export type IntentData = {
  intent: string;
  label: string;
  query: string;
  allowRetrieve: boolean;
  allowWeb: boolean;
  allowGraph?: boolean;
  graphQueries?: string[];
};

/** 与后端 RetrieveEval / data-eval 对齐 */
export type EvalData = {
  ok: boolean;
  reason: string;
  text: string;
  retried: boolean;
  query: string;
  retryQuery?: string;
};

/** 与后端 GraphChatHit / data-graph 对齐 */
export type GraphChatHit = {
  query: string;
  entities: Array<{
    name: string;
    type: string | null;
    description: string | null;
  }>;
  relations: Array<{ source: string; relation: string; target: string }>;
  documents: Array<{ documentId: string; title: string }>;
};

export type KhUIMessage = UIMessage<
  unknown,
  {
    status: { stage: string; text: string };
    think: { text: string };
    sources: ChatSourceDto[];
    retrieve: { query: string; items: RetrieveHit[] };
    session: { sessionId: string };
    image: ChatImageDto;
    intent: IntentData;
    eval: EvalData;
    graph: GraphChatHit;
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
