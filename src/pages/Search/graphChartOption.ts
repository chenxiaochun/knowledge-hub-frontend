import type { EChartsOption } from 'echarts';

import type { GraphSubgraphResultDto } from '@/service/api';

const ENTITY_COLORS: Record<string, string> = {
  PERSON: '#f59e0b',
  ORGANIZATION: '#0ea5e9',
  CONCEPT: '#06b6d4',
  DOCUMENT: '#64748b',
  PROCESS: '#10b981',
  PRODUCT: '#3b82f6',
};

type GraphNodeDatum = {
  id: string;
  name: string;
  category: number;
  symbolSize: number;
  itemStyle: { color: string };
  documentId?: string;
  nodeLabel: string;
};

export function buildGraphChartOption(data: GraphSubgraphResultDto): EChartsOption {
  const categories = [{ name: '文档' }, { name: '实体' }];

  const nodes: GraphNodeDatum[] = data.nodes.map((n) => ({
    id: n.id,
    name: n.name,
    category: n.label === 'KnowledgeDocument' ? 0 : 1,
    symbolSize: n.label === 'KnowledgeDocument' ? 42 : 28,
    itemStyle: {
      color:
        n.label === 'KnowledgeDocument'
          ? '#1677ff'
          : (ENTITY_COLORS[(n.type ?? '').toUpperCase()] ?? '#06b6d4'),
    },
    documentId: n.documentId,
    nodeLabel: n.label,
  }));

  const links = data.edges.map((e) => ({
    source: e.source,
    target: e.target,
    relation: e.relation,
    label: { show: true, formatter: e.relation, fontSize: 10 },
    lineStyle: {
      width: Math.max(1, (e.weight ?? 0.5) * 3),
      curveness: 0.15,
      color: 'rgba(0, 0, 0, 0.28)',
    },
  }));

  return {
    tooltip: {
      formatter: (params) => {
        const p = params as {
          dataType?: string;
          name?: string;
          data?: GraphNodeDatum & { relation?: string };
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
        draggable: true,
        categories,
        data: nodes,
        links,
        label: { show: true, position: 'right', fontSize: 11 },
        force: { repulsion: 280, edgeLength: [80, 160], gravity: 0.08 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 4 } },
      },
    ],
  };
}
