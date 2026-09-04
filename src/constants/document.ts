/** 与后端 DocumentStatus 保持一致 */
export const DocumentStatus = {
  Draft: 0,
  Published: 1,
  Archived: 2,
  PendingReview: 3,
} as const;

export type DocumentStatusValue = (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const DOCUMENT_STATUS_OPTIONS: {
  label: string;
  value: DocumentStatusValue;
  color: string;
}[] = [
  { label: '草稿', value: DocumentStatus.Draft, color: 'default' },
  { label: '已发布', value: DocumentStatus.Published, color: 'success' },
  { label: '已归档', value: DocumentStatus.Archived, color: 'warning' },
  { label: '待审核', value: DocumentStatus.PendingReview, color: 'processing' },
];

const STATUS_MAP = Object.fromEntries(
  DOCUMENT_STATUS_OPTIONS.map((item) => [item.value, item]),
) as Record<number, (typeof DOCUMENT_STATUS_OPTIONS)[number]>;

export function getDocumentStatusMeta(status: number) {
  return (
    STATUS_MAP[status] ?? {
      label: `未知(${status})`,
      value: status as DocumentStatusValue,
      color: 'default',
    }
  );
}

/** 后端当前解析支持的扩展名 */
export const DOCUMENT_UPLOAD_ACCEPT = '.txt,.md';
export const DOCUMENT_UPLOAD_MAX_MB = 10;
