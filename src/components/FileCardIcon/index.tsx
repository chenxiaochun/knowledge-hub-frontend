import { FileCard } from '@ant-design/x';
import type { FileCardProps } from '@ant-design/x';

import styles from './index.module.scss';

type Props = {
  ext?: string | null;
  /** 用于推导图标的文件名（可无扩展名） */
  name?: string;
  size?: number;
  className?: string;
};

function resolveFileCardIcon(ext?: string | null): FileCardProps['icon'] {
  const e = (ext ?? '').replace(/^\./, '').toLowerCase();
  switch (e) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'xlsx':
      return 'excel';
    case 'ppt':
    case 'pptx':
      return 'ppt';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'zip':
    case 'rar':
    case '7z':
      return 'zip';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg':
    case 'bmp':
      return 'image';
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
    case 'webm':
      return 'video';
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return 'javascript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    default:
      return 'default';
  }
}

/** 仅展示 Ant Design X FileCard 预设文件图标 */
export default function FileCardIcon({ ext, name = 'file', size = 24, className }: Props) {
  const normalized = (ext ?? '').replace(/^\./, '').toLowerCase();
  const fileName = normalized ? `${name}.${normalized}` : name;

  return (
    <FileCard
      className={`${styles.iconOnly}${className ? ` ${className}` : ''}`}
      size="small"
      name={fileName}
      // 强制 file：否则 jpg/png 等会走 Image 缩略图且无 src 导致空白
      type="file"
      icon={resolveFileCardIcon(ext)}
      description={false}
      styles={{ icon: { fontSize: size, lineHeight: 1 } }}
    />
  );
}
