import { Typography } from 'antd';
import type { ReactNode } from 'react';

import styles from './CopyableBlock.module.scss';

type Props = {
  text: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export default function CopyableBlock({ text, children, className, compact }: Props) {
  return (
    <Typography.Paragraph
      copyable={{ text, tooltips: ['复制', '已复制'] }}
      className={`${styles.block}${compact ? ` ${styles.compact}` : ''}${className ? ` ${className}` : ''}`}
      component="div"
    >
      {children}
    </Typography.Paragraph>
  );
}
