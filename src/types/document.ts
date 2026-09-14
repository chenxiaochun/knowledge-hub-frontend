/** 与后端 DocumentStatus 枚举值一致 */
export type DocumentStatusValue = 0 | 1 | 2 | 3;

export type DocumentStatusOption = {
  label: string;
  value: DocumentStatusValue;
  color: string;
};

/** 文档上传支持的扩展名 */
export type DocumentUploadExt = 'txt' | 'md' | 'docx' | 'pdf' | 'pptx' | 'xlsx';
