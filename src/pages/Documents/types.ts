import type { DocumentEntity } from '@/service/api';

export type DocumentPageResult = {
  list: DocumentEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type DocumentDetail = DocumentEntity & {
  content: string;
  contentLength: number;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  keyword: string;
};

export type UploadFormValues = {
  file?: import('antd/es/upload/interface').UploadFile[];
  tags?: string;
  remark?: string;
};

export type EditFormValues = {
  title: string;
  tags?: string;
  content: string;
};
