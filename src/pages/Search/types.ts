/** 统一检索查询（一次触发三种检索） */
export type SearchQuery = {
  keyword: string;
  page: number;
  pageSize: number;
  topK: number;
  graphLimit: number;
};
