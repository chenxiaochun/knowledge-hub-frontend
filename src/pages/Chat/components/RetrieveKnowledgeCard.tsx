import { FileSearchOutlined } from '@ant-design/icons';

import { parseToolPayload } from '../toolPayload';
import styles from './ChatMessageParts.module.scss';

type RetrieveHit = {
  index: number;
  documentId: string;
  documentTitle: string;
  heading: string | null;
};

type RetrieveResult = {
  query: string;
  items: RetrieveHit[];
  insufficient?: boolean;
  error?: string;
};

export default function RetrieveKnowledgeCard({
  part,
}: {
  part: {
    state: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
}) {
  const input = asRecord(part.input);
  const queryFromInput = typeof input.query === 'string' ? input.query : '';
  const pending = part.state === 'input-streaming' || part.state === 'input-available';
  const output = asRetrieveResult(part.output);
  const failed = part.state === 'output-error' || Boolean(output?.error);
  const insufficient = Boolean(output?.insufficient);
  const query = output?.query || queryFromInput;
  const count = output?.items?.length ?? 0;
  const label = pending
    ? '正在检索知识库'
    : failed
      ? '检索失败'
      : insufficient
        ? '已检索（不足）'
        : count
          ? '已检索知识库'
          : '未检索到相关资料';

  return (
    <details
      className={`${styles.web}${pending ? ` ${styles.pending}` : ''}${failed || insufficient ? ` ${styles.failed}` : ''}`}
    >
      <summary>
        <FileSearchOutlined />
        <span className={styles.webLabel}>{label}</span>
        {query ? <span className={styles.webQ}>{query}</span> : null}
        {!pending && count ? <span className={styles.webN}>{count}</span> : null}
      </summary>
      {failed ? (
        <div className={styles.webErr}>{output?.error || part.errorText}</div>
      ) : count ? (
        <ul className={styles.webList}>
          {output?.items.map((hit) => (
            <li key={`${hit.documentId}-${hit.index}`}>
              [{hit.index}] {hit.documentTitle}
              {hit.heading ? ` / ${hit.heading}` : ''}
            </li>
          ))}
        </ul>
      ) : null}
    </details>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function asRetrieveResult(value: unknown): RetrieveResult | null {
  const rec = parseToolPayload(value);
  if (!rec) return null;
  const items = Array.isArray(rec.items)
    ? (rec.items as RetrieveHit[]).filter(
        (item) => item && typeof item.documentId === 'string' && typeof item.index === 'number',
      )
    : [];
  return {
    query: typeof rec.query === 'string' ? rec.query : '',
    items,
    insufficient: rec.insufficient === true,
    error: typeof rec.error === 'string' ? rec.error : undefined,
  };
}
