import type { DocumentEntity } from '@/service/api';

/** 与后端 DocumentStatus 枚举值一致 */
export type DocumentStatusValue = 0 | 1 | 2 | 3;

export type DocumentStatusOption = {
  label: string;
  value: DocumentStatusValue;
  color: string;
};

/** 文档上传支持的扩展名 */
export type DocumentUploadExt = 'txt' | 'md' | 'docx' | 'pdf' | 'pptx' | 'xlsx';

/** 文档详情（含正文） */
export type DocumentDetail = DocumentEntity & {
  content: string;
  contentLength: number;
};
