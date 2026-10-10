import { EditOutlined } from '@ant-design/icons';

import { parseToolPayload } from '../toolPayload';
import styles from './ChatMessageParts.module.scss';

type RewriteResult = {
  query?: string;
  previousQuery?: string;
  reason?: string;
  error?: string;
};

export default function RewriteQueryCard({
  part,
}: {
  part: {
    state: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}) {
  const pending = part.state === 'input-streaming' || part.state === 'input-available';
  const output = asRewriteResult(part.output);
  const failed = part.state === 'output-error' || Boolean(output?.error);
  const label = pending ? '正在改写检索词' : failed ? '改写失败' : '已改写检索词';

  return (
    <div
      className={`${styles.rewrite}${pending ? ` ${styles.pending}` : ''}${failed ? ` ${styles.failed}` : ''}`}
    >
      <EditOutlined />
      <span className={styles.webLabel}>{label}</span>
      {failed ? (
        <span className={styles.webErrInline}>{output?.error || part.errorText}</span>
      ) : output?.previousQuery && output?.query ? (
        <span className={styles.rewritePair}>
          <span className={styles.webQ}>{output.previousQuery}</span>
          <span className={styles.rewriteArrow}>→</span>
          <span className={styles.webQ}>{output.query}</span>
        </span>
      ) : output?.query ? (
        <span className={styles.webQ}>{output.query}</span>
      ) : null}
    </div>
  );
}

function asRewriteResult(value: unknown): RewriteResult | null {
  const rec = parseToolPayload(value);
  if (!rec) return null;
  return {
    query: typeof rec.query === 'string' ? rec.query : undefined,
    previousQuery: typeof rec.previousQuery === 'string' ? rec.previousQuery : undefined,
    reason: typeof rec.reason === 'string' ? rec.reason : undefined,
    error: typeof rec.error === 'string' ? rec.error : undefined,
  };
}
