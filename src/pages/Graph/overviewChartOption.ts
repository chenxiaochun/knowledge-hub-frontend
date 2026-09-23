import type { EChartsOption } from 'echarts';

import type { GraphOverviewResultDto } from './types';

const KIND_COLOR: Record<string, string> = {
  doc: '#1677ff',
  entity: '#06b6d4',
  tag: '#722ed1',
};

const ENTITY_COLORS: Record<string, string> = {
  PERSON: '#f59e0b',
  ORGANIZATION: '#fa8c16',
  CONCEPT: '#06b6d4',
  DOCUMENT: '#64748b',
  PROCESS: '#10b981',
  PRODUCT: '#3b82f6',
};

type OverviewNodeDatum = {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  itemStyle: { color: string };
  documentId?: string;
  nodeKind: string;
};

function categoryIndex(id: string) {
  if (id.startsWith('doc:')) return 0;
  if (id.startsWith('tag:')) return 2;
  return 1;
}

function nodeColor(id: string, type?: string | null) {
  const prefix = id.split(':')[0];
  if (prefix === 'doc') return KIND_COLOR.doc;
  if (prefix === 'tag') return KIND_COLOR.tag;
  return ENTITY_COLORS[(type ?? '').toUpperCase()] ?? KIND_COLOR.entity;
}

export function buildOverviewChartOption(data: GraphOverviewResultDto): EChartsOption {
  const categories = [{ name: '文档' }, { name: '实体' }, { name: '标签' }];

  const nodes: OverviewNodeDatum[] = data.nodes.map((node) => ({
    id: node.id,
    name: node.name,
    category: categoryIndex(node.id),
    symbolSize: node.kind === 'document' ? 44 : node.kind === 'tag' ? 24 : 28,
    itemStyle: { color: nodeColor(node.id, node.type) },
    documentId: node.documentId ?? undefined,
    nodeKind: node.kind,
  }));

  const links = data.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    relation: edge.relation,
    label: { show: true, formatter: edge.relation, fontSize: 10 },
    lineStyle: {
      curveness: 0.12,
      color: edge.kind === 'related' ? '#94a3b8' : '#cbd5e1',
    },
  }));

  return {
    tooltip: {
      formatter: (params) => {
        const p = params as {
          dataType?: string;
          name?: string;
          data?: OverviewNodeDatum & { relation?: string };
        };
        if (p.dataType === 'edge') {
          return p.data?.relation || p.name || '关系';
        }
        const name = p.data?.name ?? p.name ?? '';
        return p.data?.documentId ? `${name}（文档，可点击）` : name;
      },
    },
    legend: [{ data: categories.map((c) => c.name) }],
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: 'move',
        scaleLimit: { min: 0.4, max: 4 },
        draggable: true,
        categories,
        data: nodes,
        links,
        label: { show: true, position: 'right', fontSize: 11 },
        force: { repulsion: 320, edgeLength: [90, 180], gravity: 0.06 },
        blur: {
          itemStyle: { opacity: 0.55 },
          lineStyle: { opacity: 0.35 },
          label: { opacity: 0.55 },
        },
        emphasis: {
          focus: 'adjacency',
          scale: 1.06,
          itemStyle: {
            shadowBlur: 6,
            shadowColor: 'rgba(22, 119, 255, 0.2)',
          },
          lineStyle: { width: 2.5, opacity: 0.9 },
        },
      },
    ],
  };
}
