import type { Dayjs } from 'dayjs';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Input, Select, Space } from 'antd';

import type { DocumentDetail } from '@/types/document';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import GraphChart from '@/components/GraphChart';
import { getApiDocumentId, getApiGraphOverview } from '@/service/api';

import type { GraphOverviewQuery, GraphOverviewResultDto } from './types';

import GraphStatsPanel from './GraphStatsPanel';
import styles from './index.module.scss';
import { buildOverviewChartOption } from './overviewChartOption';

const DEFAULT_DOC_LIMIT = 80;

const EMPTY_OVERVIEW: GraphOverviewResultDto = {
  nodes: [],
  edges: [],
  stats: {
    nodeCount: 0,
    edgeCount: 0,
    documentCount: 0,
    entityCount: 0,
    tagCount: 0,
    mentionCount: 0,
    relatedCount: 0,
    entityTypes: [],
  },
  topEntities: [],
  recentNodes: [],
  entityTypes: [],
};

function toOverviewQuery(
  keywordInput: string,
  entityType: string,
  dateRange: [Dayjs | null, Dayjs | null] | null,
  docLimit: number,
): GraphOverviewQuery {
  return {
    keyword: keywordInput.trim() || ' ',
    entityType: entityType || '',
    from: dateRange?.[0]?.startOf('day').toISOString() ?? '',
    to: dateRange?.[1]?.endOf('day').toISOString() ?? '',
    docLimit,
  };
}

export default function GraphPage() {
  const navigate = useNavigate();
  const [keywordInput, setKeywordInput] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [query, setQuery] = useState<GraphOverviewQuery>(() =>
    toOverviewQuery('', '', null, DEFAULT_DOC_LIMIT),
  );
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<GraphOverviewResultDto>(EMPTY_OVERVIEW);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchOverview = useCallback(async (nextQuery: GraphOverviewQuery) => {
    setLoading(true);
    try {
      const res = (await getApiGraphOverview({ query: nextQuery })) as GraphOverviewResultDto;
      setOverview({
        nodes: Array.isArray(res?.nodes) ? res.nodes : [],
        edges: Array.isArray(res?.edges) ? res.edges : [],
        stats: {
          ...EMPTY_OVERVIEW.stats,
          ...res?.stats,
          entityTypes: Array.isArray(res?.stats?.entityTypes) ? res.stats.entityTypes : [],
        },
        topEntities: Array.isArray(res?.topEntities) ? res.topEntities : [],
        recentNodes: Array.isArray(res?.recentNodes) ? res.recentNodes : [],
        entityTypes: Array.isArray(res?.entityTypes) ? res.entityTypes : [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview(query);
  }, [fetchOverview, query]);

  const chartOption = useMemo(() => {
    if (overview.nodes.length === 0) return undefined;
    return buildOverviewChartOption(overview);
  }, [overview]);

  const chartData = useMemo(
    () => ({
      nodes: overview.nodes.map((node) => ({ id: node.id })),
    }),
    [overview.nodes],
  );

  const entityTypeOptions = useMemo(
    () => [
      { label: '全部实体类型', value: '' },
      ...overview.entityTypes.map((type) => ({ label: type, value: type })),
    ],
    [overview.entityTypes],
  );

  const applyFilters = () => {
    setQuery(toOverviewQuery(keywordInput, entityType, dateRange, DEFAULT_DOC_LIMIT));
  };

  const resetFilters = () => {
    setKeywordInput('');
    setEntityType('');
    setDateRange(null);
    setQuery(toOverviewQuery('', '', null, DEFAULT_DOC_LIMIT));
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = (await getApiDocumentId({ path: { id } })) as DocumentDetail;
      setDetail(res);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Input
          allowClear
          className={styles.keywordField}
          placeholder="搜索节点、文档或标签"
          prefix={<SearchOutlined />}
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onPressEnter={applyFilters}
        />
        <Select
          allowClear
          className={styles.entityTypeField}
          placeholder="实体类型"
          value={entityType || undefined}
          options={entityTypeOptions}
          onChange={(value) => setEntityType(value ?? '')}
        />
        <DatePicker.RangePicker
          className={styles.dateRangeField}
          value={dateRange}
          onChange={(values) => setDateRange(values)}
        />
        <Space className={styles.toolbarActions}>
          <Button type="primary" icon={<SearchOutlined />} loading={loading} onClick={applyFilters}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetFilters}>
            重置
          </Button>
        </Space>
      </div>

      <div className={styles.content}>
        <div className={styles.graphArea}>
          <GraphChart
            data={chartData}
            chartOption={chartOption}
            loading={loading}
            onDocumentClick={(id) => void openDetail(id)}
          />
        </div>

        <GraphStatsPanel
          loading={loading}
          stats={overview.stats}
          topEntities={overview.topEntities}
          recentNodes={overview.recentNodes}
          onRecentClick={(id) => void openDetail(id)}
          onViewMoreRecent={() => navigate('/documents')}
        />
      </div>

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
