import type { ChatSourceDto, RagChunkHitDto } from '@/service/api';

export type { AiMessageEntity, ChatResponseDto, ChatSourceDto, RagChunkHitDto, SessionPageDto } from '@/service/api';

/** 页面内消息（含仅检索临时态） */
export type LocalMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSourceDto[] | null;
  /** 仅检索模式下的召回块，不落库 */
  ragHits?: RagChunkHitDto[];
  pending?: boolean;
};
