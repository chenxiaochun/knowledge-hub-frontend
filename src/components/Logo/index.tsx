type Props = {
  size?: number;
  className?: string;
};

export default function Logo({ size = 28, className }: Props) {
  return (
    <img
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={className}
      style={{ display: 'block' }}
    />
  );
}
