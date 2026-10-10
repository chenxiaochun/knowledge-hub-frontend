import { CompassOutlined } from '@ant-design/icons';

import type { IntentData } from '../chatUiMessage';
import styles from './ChatMessageParts.module.scss';

export default function IntentCard({ data }: { data: IntentData }) {
  const route = [
    data.allowRetrieve ? '可搜库' : null,
    data.allowWeb ? '可联网' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.intent}>
      <CompassOutlined />
      <span className={styles.webLabel}>意图</span>
      <span className={styles.intentLabel}>{data.label || data.intent}</span>
      {route ? <span className={styles.webN}>{route}</span> : null}
      {data.query ? <span className={styles.webQ}>{data.query}</span> : null}
    </div>
  );
}
