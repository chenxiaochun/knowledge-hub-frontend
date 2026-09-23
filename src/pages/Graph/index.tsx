import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Form } from 'antd';

import type { DocumentDetail } from '@/types/document';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import GraphChart from '@/components/GraphChart';
import { getApiDocumentId, getApiGraphOverview } from '@/service/api';

import { DEFAULT_DOC_LIMIT, EMPTY_OVERVIEW } from './constants';
import GraphFilterForm from './GraphFilterForm';
import GraphStatsPanel from './GraphStatsPanel';
import { toOverviewQuery } from './graphQuery';
import styles from './index.module.scss';
import { buildOverviewChartOption } from './overviewChartOption';
import type { GraphFilterFormValues, GraphOverviewQuery, GraphOverviewResultDto } from './types';

export default function GraphPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<GraphFilterFormValues>();
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

  const applyFilters = (values: GraphFilterFormValues) => {
    setQuery(
      toOverviewQuery(
        values.keyword,
        values.entityType ?? '',
        values.dateRange,
        DEFAULT_DOC_LIMIT,
      ),
    );
  };

  const resetFilters = () => {
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
      <GraphFilterForm
        form={form}
        loading={loading}
        entityTypeOptions={entityTypeOptions}
        onFinish={applyFilters}
        onReset={resetFilters}
      />

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
