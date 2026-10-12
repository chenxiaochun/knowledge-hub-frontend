import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { ApartmentOutlined } from '@ant-design/icons';

import GraphChart from '@/components/GraphChart';
import type { GraphSubgraphResultDto } from '@/service/api';

import type { GraphChatHit } from '../chatUiMessage';
import { parseToolPayload } from '../toolPayload';
import styles from './ChatMessageParts.module.scss';

type Props = {
  data: GraphChatHit;
  /** 流式输出中只展示过程摘要，结束后再挂载图表，避免闪动 */
  streaming?: boolean;
  onOpenDocument?: (documentId: string) => void;
};

/** 流式 data-graph 结果卡 */
function GraphRetrieveCard({ data, streaming = false, onOpenDocument }: Props) {
  const hitKey = graphHitFingerprint(data);
  // data 内容由 hitKey 表征
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hit = useMemo(() => normalizeHit(data), [hitKey]);
  return (
    <GraphHitView
      hit={hit}
      hitKey={hitKey}
      streaming={streaming}
      onOpenDocument={onOpenDocument}
    />
  );
}

export default memo(GraphRetrieveCard, (prev, next) => {
  return (
    graphHitFingerprint(prev.data) === graphHitFingerprint(next.data) &&
    prev.streaming === next.streaming
  );
});

/** tool retrieve_graph 过程卡（尚无 data-graph 时展示 pending / 失败） */
export function GraphRetrieveToolCard({
  part,
  streaming = false,
  onOpenDocument,
}: {
  part: {
    state: string;
    input?: unknown;
    output?: unknown;
    errorText?: string;
  };
  streaming?: boolean;
  onOpenDocument?: (documentId: string) => void;
}) {
  const input = asRecord(part.input);
  const queryFromInput = typeof input.query === 'string' ? input.query : '';
  const pending = part.state === 'input-streaming' || part.state === 'input-available';
  const output = asGraphHit(part.output);
  const failed = part.state === 'output-error' || Boolean(output?.error);

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
    const err = output?.error || part.errorText || '图谱检索失败';
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

  if (output && !output.error) {
    const hit = normalizeHit(output);
    return (
      <GraphHitView
        hit={hit}
        hitKey={graphHitFingerprint(hit)}
        streaming={streaming}
        onOpenDocument={onOpenDocument}
      />
    );
  }

  return null;
}

const GraphHitView = memo(
  function GraphHitView({
    hit,
    hitKey,
    streaming,
    onOpenDocument,
  }: {
    hit: GraphChatHit;
    hitKey: string;
    streaming: boolean;
    onOpenDocument?: (documentId: string) => void;
  }) {
    const entityCount = hit.entities.length;
    const relationCount = hit.relations.length;
    const empty = !entityCount && !relationCount;
    const label = empty ? '图谱无匹配实体' : '已检索图谱';
    // 流式阶段不挂载 ECharts；回答结束后再画一次
    const showChart = !streaming && !empty;

    const chartData = useMemo(
      () => (showChart ? toSubgraph(hit) : null),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- hit 由 hitKey 表征
      [showChart, hitKey],
    );

    const onOpenRef = useRef(onOpenDocument);
    useEffect(() => {
      onOpenRef.current = onOpenDocument;
    }, [onOpenDocument]);
    const handleDocClick = useCallback((documentId: string) => {
      onOpenRef.current?.(documentId);
    }, []);

    return (
      <details
        className={`${styles.web}${empty ? ` ${styles.pending}` : ''}`}
        open={showChart}
      >
        <summary>
          <ApartmentOutlined />
          <span className={styles.webLabel}>{label}</span>
          {hit.query ? <span className={styles.webQ}>{hit.query}</span> : null}
          {!empty ? (
            <span className={styles.webN}>
              {entityCount} 实体 · {relationCount} 关系
              {hit.documents.length ? ` · ${hit.documents.length} 文档` : ''}
            </span>
          ) : null}
        </summary>
        {showChart && chartData ? (
          <div className={styles.graphBody}>
            <div className={styles.graphChart}>
              <GraphChart data={chartData} height={300} onDocumentClick={handleDocClick} />
            </div>
            {relationCount ? (
              <ul className={styles.webList}>
                {hit.relations.map((rel, i) => (
                  <li key={`${rel.source}-${rel.relation}-${rel.target}-${i}`}>
                    {rel.source} —{rel.relation}→ {rel.target}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </details>
    );
  },
  (prev, next) => prev.hitKey === next.hitKey && prev.streaming === next.streaming,
);

function graphHitFingerprint(hit: GraphChatHit): string {
  return JSON.stringify({
    query: hit.query ?? '',
    entities: hit.entities ?? [],
    relations: hit.relations ?? [],
    documents: hit.documents ?? [],
  });
}

function toSubgraph(hit: GraphChatHit): GraphSubgraphResultDto {
  const nodes: GraphSubgraphResultDto['nodes'] = [];
  const edges: GraphSubgraphResultDto['edges'] = [];
  const nodeIds = new Set<string>();

  for (const ent of hit.entities) {
    const id = `entity:${ent.name}`;
    if (nodeIds.has(id)) continue;
    nodeIds.add(id);
    nodes.push({
      id,
      name: ent.name,
      label: 'KnowledgeEntity',
      type: ent.type,
    });
  }

  for (const doc of hit.documents) {
    const id = `doc:${doc.documentId}`;
    if (nodeIds.has(id)) continue;
    nodeIds.add(id);
    nodes.push({
      id,
      name: doc.title || doc.documentId,
      label: 'KnowledgeDocument',
      documentId: doc.documentId,
    });
  }

  for (const rel of hit.relations) {
    const source = `entity:${rel.source}`;
    const target = `entity:${rel.target}`;
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue;
    edges.push({
      source,
      target,
      relation: rel.relation || '关联',
      weight: 0.6,
    });
  }

  if (hit.documents.length && hit.entities.length) {
    for (const doc of hit.documents) {
      const docId = `doc:${doc.documentId}`;
      for (const ent of hit.entities) {
        edges.push({
          source: docId,
          target: `entity:${ent.name}`,
          relation: '提及',
          weight: 0.35,
        });
      }
    }
  }

  return { nodes, edges };
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
