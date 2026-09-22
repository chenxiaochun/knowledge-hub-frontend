import { getFileTypeMeta, normalizeFileExt } from './meta';

type Props = {
  ext?: string | null;
  size?: number;
  className?: string;
};

export { getFileTypeMeta, normalizeFileExt } from './meta';

export default function FileTypeIcon({ ext, size = 24, className }: Props) {
  const { label, color } = getFileTypeMeta(ext);
  const title = normalizeFileExt(ext) || '未知格式';
  const fontSize = label.length >= 4 ? 7.5 : 9;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path
        d="M7 1h13l7 7v21a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3z"
        fill={color}
      />
      <path d="M20 1v7h7L20 1z" fill="#fff" fillOpacity={0.35} />
      <rect x="4" y="17" width="24" height="12" rx="2" fill="#000" fillOpacity={0.14} />
      <text
        x="16"
        y="23.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing="0.02em"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {label}
      </text>
    </svg>
  );
}
