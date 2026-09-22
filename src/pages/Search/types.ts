/** 检索页 UI 状态（非后端 DTO） */
export type SearchMode = 'keyword' | 'semantic' | 'graph';

export type KeywordQuery = {
  mode: 'keyword';
  keyword: string;
  page: number;
  pageSize: number;
};

export type SemanticQuery = {
  mode: 'semantic';
  keyword: string;
  topK: number;
};

export type GraphQuery = {
  mode: 'graph';
  keyword: string;
  limit: number;
};

export type ActiveQuery = KeywordQuery | SemanticQuery | GraphQuery;
