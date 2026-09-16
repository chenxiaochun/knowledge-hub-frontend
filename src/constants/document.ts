import type {
  DocumentStatusOption,
  DocumentStatusValue,
  DocumentUploadExt,
} from '@/types/document';

/** 与后端 DocumentStatus 保持一致 */
export const DocumentStatus = {
  Draft: 0,
  Published: 1,
  Archived: 2,
  PendingReview: 3,
} as const satisfies Record<string, DocumentStatusValue>;

export const DOCUMENT_STATUS_OPTIONS: DocumentStatusOption[] = [
  { label: '草稿', value: DocumentStatus.Draft, color: 'default' },
  { label: '已发布', value: DocumentStatus.Published, color: 'success' },
  { label: '已归档', value: DocumentStatus.Archived, color: 'warning' },
  { label: '待审核', value: DocumentStatus.PendingReview, color: 'processing' },
];

const STATUS_MAP = Object.fromEntries(
  DOCUMENT_STATUS_OPTIONS.map((item) => [item.value, item]),
) as Record<number, DocumentStatusOption>;

export function getDocumentStatusMeta(status: number): DocumentStatusOption {
  return (
    STATUS_MAP[status] ?? {
      label: `未知(${status})`,
      value: status as DocumentStatusValue,
      color: 'default',
    }
  );
}

/** 草稿 / 已发布 可提交审核 */
export function canSubmitReview(status: number): boolean {
  return status === DocumentStatus.Draft || status === DocumentStatus.Published;
}

/** 仅已发布可归档 */
export function canArchive(status: number): boolean {
  return status === DocumentStatus.Published;
}

/** 仅已发布可转回草稿 */
export function canSaveAsDraft(status: number): boolean {
  return status === DocumentStatus.Published;
}

/** 待审核期间禁止改正文/标题 */
export function canEditContent(status: number): boolean {
  return (
    status === DocumentStatus.Draft ||
    status === DocumentStatus.Published ||
    status === DocumentStatus.Archived
  );
}

/** 后端当前解析支持的扩展名 */
export const DOCUMENT_UPLOAD_EXTS = [
  'txt',
  'md',
  'docx',
  'pdf',
  'pptx',
  'xlsx',
] as const satisfies readonly DocumentUploadExt[];

export const DOCUMENT_UPLOAD_ACCEPT = DOCUMENT_UPLOAD_EXTS.map((ext) => `.${ext}`).join(',');

export const DOCUMENT_UPLOAD_HINT = DOCUMENT_UPLOAD_EXTS.map((ext) => `.${ext}`).join(' / ');

export const DOCUMENT_UPLOAD_MAX_MB = 10;

export function isSupportedDocumentExt(ext: string | undefined | null): ext is DocumentUploadExt {
  return Boolean(ext && (DOCUMENT_UPLOAD_EXTS as readonly string[]).includes(ext.toLowerCase()));
}
