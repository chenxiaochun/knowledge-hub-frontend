import { useMemo } from 'react';

import { Empty, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';

import { buildGraphChartOption } from '@/pages/Search/graphChartOption';
import type { GraphSubgraphResultDto } from '@/service/api';

type Props = {
  data: GraphSubgraphResultDto | null;
  loading?: boolean;
  height?: number;
  onDocumentClick?: (documentId: string) => void;
};

export default function GraphChart({ data, loading, height = 420, onDocumentClick }: Props) {
  const option = useMemo(() => {
    if (!data || data.nodes.length === 0) return {};
    return buildGraphChartOption(data);
  }, [data]);

  const onEvents = useMemo(
    () => ({
      click: (params: { dataType?: string; data?: { documentId?: string } }) => {
        if (params.dataType === 'node' && params.data?.documentId) {
          onDocumentClick?.(params.data.documentId);
        }
      },
    }),
    [onDocumentClick],
  );

  if (loading) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <Spin tip="加载图谱…" />
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fafafa',
        }}
      >
        <Empty description="暂无图谱数据" />
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      onEvents={onEvents}
      style={{
        width: '100%',
        height,
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        background: '#fff',
      }}
    />
  );
}
