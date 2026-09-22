export type FileTypeMeta = {
  label: string;
  color: string;
};

/** 扩展名 → 图标配置（小写，不含点） */
export const FILE_TYPE_META: Record<string, FileTypeMeta> = {
  // 文本
  txt: { label: 'TXT', color: '#737373' },
  text: { label: 'TXT', color: '#737373' },
  md: { label: 'MD', color: '#722ed1' },

  // Word
  doc: { label: 'DOC', color: '#1677ff' },
  docx: { label: 'DOC', color: '#1677ff' },

  // 其他文档
  pdf: { label: 'PDF', color: '#f24b4b' },
  xlsx: { label: 'XLS', color: '#52c41a' },
  xls: { label: 'XLS', color: '#52c41a' },
  pptx: { label: 'PPT', color: '#fa8c16' },
  ppt: { label: 'PPT', color: '#fa8c16' },

  // 图片
  jpg: { label: 'IMG', color: '#13c2c2' },
  jpeg: { label: 'IMG', color: '#13c2c2' },
  png: { label: 'IMG', color: '#13c2c2' },
  gif: { label: 'IMG', color: '#13c2c2' },
  webp: { label: 'IMG', color: '#13c2c2' },
  svg: { label: 'IMG', color: '#13c2c2' },
  bmp: { label: 'IMG', color: '#13c2c2' },
  image: { label: 'IMG', color: '#13c2c2' },

  // 视频
  mp4: { label: 'VID', color: '#9254de' },
  mov: { label: 'VID', color: '#9254de' },
  avi: { label: 'VID', color: '#9254de' },
  mkv: { label: 'VID', color: '#9254de' },
  webm: { label: 'VID', color: '#9254de' },
  video: { label: 'VID', color: '#9254de' },
};

const DEFAULT_META: FileTypeMeta = { label: 'FILE', color: '#999999' };

export function normalizeFileExt(ext?: string | null): string {
  return ext?.replace(/^\./, '').toLowerCase() ?? '';
}

export function getFileTypeMeta(ext?: string | null): FileTypeMeta {
  const normalized = normalizeFileExt(ext);
  if (normalized && FILE_TYPE_META[normalized]) {
    return FILE_TYPE_META[normalized];
  }
  if (normalized) {
    return {
      label: normalized.slice(0, 4).toUpperCase(),
      color: '#999999',
    };
  }
  return DEFAULT_META;
}
