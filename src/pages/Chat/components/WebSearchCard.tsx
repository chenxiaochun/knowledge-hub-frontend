import { SearchOutlined } from '@ant-design/icons';

import styles from './ChatMessageParts.module.scss';

type WebSearchHit = {
  title: string;
  url: string;
  snippet: string;
  siteName?: string;
};

type WebSearchResult = {
  query: string;
  items: WebSearchHit[];
  error?: string;
};

export default function WebSearchCard({
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
  const query = typeof input.query === 'string' ? input.query : '';
  const pending = part.state === 'input-streaming' || part.state === 'input-available';
  const output = asWebSearchResult(part.output);
  const failed = part.state === 'output-error' || Boolean(output?.error);
  const count = output?.items?.length ?? 0;
  const label = pending ? '正在搜索' : failed ? '搜索失败' : '已搜索';

  return (
    <details
      className={`${styles.web}${pending ? ` ${styles.pending}` : ''}${failed ? ` ${styles.failed}` : ''}`}
    >
      <summary>
        <SearchOutlined />
        <span className={styles.webLabel}>{label}</span>
        {query ? <span className={styles.webQ}>{query}</span> : null}
        {!pending && count ? <span className={styles.webN}>{count}</span> : null}
      </summary>
      {failed ? (
        <div className={styles.webErr}>{output?.error || part.errorText}</div>
      ) : count ? (
        <ul className={styles.webList}>
          {output?.items.map((hit) => (
            <li key={hit.url}>
              <a href={hit.url} target="_blank" rel="noreferrer">
                {hit.title}
              </a>
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

function asWebSearchResult(value: unknown): WebSearchResult | null {
  const rec = parseToolPayload(value);
  if (!rec) return null;
  return {
    query: typeof rec.query === 'string' ? rec.query : '',
    items: Array.isArray(rec.items) ? (rec.items as WebSearchHit[]) : [],
    error: typeof rec.error === 'string' ? rec.error : undefined,
  };
}

function parseToolPayload(value: unknown): Record<string, unknown> | null {
  if (typeof value === 'string') {
    try {
      return parseToolPayload(JSON.parse(value));
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object') return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.content === 'string') {
    const nested = parseToolPayload(rec.content);
    if (nested) return nested;
  }
  return rec;
}
