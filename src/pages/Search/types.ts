/** 文档检索查询（一次触发全文与语义检索） */
export type SearchQuery = {
  keyword: string;
  page: number;
  pageSize: number;
  topK: number;
};
