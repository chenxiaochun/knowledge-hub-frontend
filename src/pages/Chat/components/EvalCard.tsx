import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

import type { EvalData } from '../chatUiMessage';
import styles from './ChatMessageParts.module.scss';

export default function EvalCard({ data }: { data: EvalData }) {
  const failed = !data.ok;
  const Icon = data.ok ? CheckCircleOutlined : data.retried ? ReloadOutlined : CloseCircleOutlined;
  const label = data.ok ? '资料切题' : data.retried ? '再查仍不足' : '资料不足';

  return (
    <div className={`${styles.eval}${failed ? ` ${styles.failed}` : ` ${styles.ok}`}`}>
      <Icon />
      <span className={styles.webLabel}>{label}</span>
      {data.text ? <span className={styles.evalText}>{data.text}</span> : null}
      {data.retryQuery ? (
        <span className={styles.webN}>
          {data.query} → {data.retryQuery}
        </span>
      ) : data.query ? (
        <span className={styles.webQ}>{data.query}</span>
      ) : null}
    </div>
  );
}
