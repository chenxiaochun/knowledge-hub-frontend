import { ApartmentOutlined } from '@ant-design/icons';

import type { GraphChatHit } from '../chatUiMessage';
import { parseToolPayload } from '../toolPayload';
import styles from './ChatMessageParts.module.scss';

/** 流式 data-graph 结果卡 */
export default function GraphRetrieveCard({ data }: { data: GraphChatHit }) {
  return <GraphHitView hit={normalizeHit(data)} />;
}

/** tool retrieve_graph 过程卡（尚无 data-graph 时展示 pending / 失败） */
export function GraphRetrieveToolCard({
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
  const output = asGraphHit(part.output);
  const failed = part.state === 'output-error' || Boolean(output && 'error' in output && output.error);

  if (pending) {
    return (
      <div className={`${styles.web} ${styles.pending}`}>
        <div className={styles.genImageHead}>
          <ApartmentOutlined />
          <span className={styles.webLabel}>正在检索图谱</span>
          {queryFromInput ? <span className={styles.webQ}>{queryFromInput}</span> : null}
        </div>
      </div>
    );
  }

  if (failed) {
    const err =
      (output && typeof output.error === 'string' && output.error) || part.errorText || '图谱检索失败';
    return (
      <details className={`${styles.web} ${styles.failed}`}>
        <summary>
          <ApartmentOutlined />
          <span className={styles.webLabel}>图谱检索失败</span>
          {queryFromInput ? <span className={styles.webQ}>{queryFromInput}</span> : null}
        </summary>
        <div className={styles.webErr}>{err}</div>
      </details>
    );
  }

  if (output && !('error' in output && output.error)) {
    return <GraphHitView hit={normalizeHit(output)} />;
  }

  return null;
}

function GraphHitView({ hit }: { hit: GraphChatHit }) {
  const entityCount = hit.entities.length;
  const relationCount = hit.relations.length;
  const empty = !entityCount && !relationCount;
  const label = empty ? '图谱无匹配实体' : '已检索图谱';

  return (
    <details className={`${styles.web}${empty ? ` ${styles.pending}` : ''}`}>
      <summary>
        <ApartmentOutlined />
        <span className={styles.webLabel}>{label}</span>
        {hit.query ? <span className={styles.webQ}>{hit.query}</span> : null}
        {!empty ? (
          <span className={styles.webN}>
            {entityCount} 实体 · {relationCount} 关系
          </span>
        ) : null}
      </summary>
      {!empty ? (
        <div className={styles.graphBody}>
          {entityCount ? (
            <ul className={styles.webList}>
              {hit.entities.map((ent) => (
                <li key={ent.name}>
                  {ent.name}
                  {ent.type ? `（${ent.type}）` : ''}
                </li>
              ))}
            </ul>
          ) : null}
          {relationCount ? (
            <ul className={styles.webList}>
              {hit.relations.map((rel, i) => (
                <li key={`${rel.source}-${rel.relation}-${rel.target}-${i}`}>
                  {rel.source} —{rel.relation}→ {rel.target}
                </li>
              ))}
            </ul>
          ) : null}
          {hit.documents.length ? (
            <ul className={styles.webList}>
              {hit.documents.map((doc) => (
                <li key={doc.documentId}>{doc.title || doc.documentId}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </details>
  );
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function asGraphHit(value: unknown): (GraphChatHit & { error?: string; insufficient?: boolean }) | null {
  const rec = parseToolPayload(value);
  if (!rec) return null;
  return {
    query: typeof rec.query === 'string' ? rec.query : '',
    entities: Array.isArray(rec.entities) ? (rec.entities as GraphChatHit['entities']) : [],
    relations: Array.isArray(rec.relations) ? (rec.relations as GraphChatHit['relations']) : [],
    documents: Array.isArray(rec.documents) ? (rec.documents as GraphChatHit['documents']) : [],
    error: typeof rec.error === 'string' ? rec.error : undefined,
    insufficient: rec.insufficient === true,
  };
}

function normalizeHit(hit: GraphChatHit): GraphChatHit {
  return {
    query: hit.query ?? '',
    entities: Array.isArray(hit.entities) ? hit.entities : [],
    relations: Array.isArray(hit.relations) ? hit.relations : [],
    documents: Array.isArray(hit.documents) ? hit.documents : [],
  };
}
