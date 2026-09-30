import { type UIMessage } from 'ai';

import type { ChatImageDto, ChatSourceDto } from '@/service/api';

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
    image: ChatImageDto;
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
