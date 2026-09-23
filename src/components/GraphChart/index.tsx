import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CompressOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { Button, Empty, Spin, Tooltip } from 'antd';
import ReactECharts from 'echarts-for-react';
import type EChartsReact from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

import { buildGraphChartOption } from '@/pages/Search/graphChartOption';
import type { GraphSubgraphResultDto } from '@/service/api';

const ZOOM_RATIO = 1.2;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 4;

type GraphChartData = {
  nodes: Array<{ id: string }>;
};

type Props = {
  data: GraphChartData | GraphSubgraphResultDto | null;
  chartOption?: EChartsOption;
  loading?: boolean;
  height?: number;
  onDocumentClick?: (documentId: string) => void;
};

type PanOffset = {
  x: number;
  y: number;
};

export default function GraphChart({
  data,
  chartOption,
  loading,
  height,
  onDocumentClick,
}: Props) {
  const fillParent = height == null;
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsReact>(null);
  const panRef = useRef<PanOffset>({ x: 0, y: 0 });
  const isDispatchingRoamRef = useRef(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewDirty, setViewDirty] = useState(false);

  const option = useMemo(() => {
    if (!data || data.nodes.length === 0) return {};
    if (chartOption) return chartOption;
    return buildGraphChartOption(data as GraphSubgraphResultDto);
  }, [chartOption, data]);

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

  const getRoamOrigin = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (chart) {
      return {
        originX: chart.getWidth() / 2,
        originY: chart.getHeight() / 2,
      };
    }

    const rect = containerRef.current?.getBoundingClientRect();
    return {
      originX: (rect?.width ?? 0) / 2,
      originY: (rect?.height ?? 0) / 2,
    };
  }, []);

  const dispatchRoam = useCallback(
    (payload: { zoom?: number; dx?: number; dy?: number }) => {
      const chart = chartRef.current?.getEchartsInstance();
      if (!chart) return;

      const { originX, originY } = getRoamOrigin();
      isDispatchingRoamRef.current = true;
      chart.dispatchAction({
        type: 'graphRoam',
        seriesIndex: 0,
        originX,
        originY,
        ...payload,
      });
      window.setTimeout(() => {
        isDispatchingRoamRef.current = false;
      }, 0);
    },
    [getRoamOrigin],
  );

  const handleZoomIn = useCallback(() => {
    if (zoomLevel >= MAX_ZOOM) return;
    dispatchRoam({ zoom: ZOOM_RATIO });
    setZoomLevel((prev) => Math.min(prev * ZOOM_RATIO, MAX_ZOOM));
    setViewDirty(true);
  }, [dispatchRoam, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomLevel <= MIN_ZOOM) return;
    dispatchRoam({ zoom: 1 / ZOOM_RATIO });
    setZoomLevel((prev) => Math.max(prev / ZOOM_RATIO, MIN_ZOOM));
    setViewDirty(true);
  }, [dispatchRoam, zoomLevel]);

  const handleResetZoom = useCallback(() => {
    if (!viewDirty) return;

    dispatchRoam({
      dx: -panRef.current.x,
      dy: -panRef.current.y,
      zoom: 1 / zoomLevel,
    });
    panRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    setViewDirty(false);
  }, [dispatchRoam, viewDirty, zoomLevel]);

  useEffect(() => {
    panRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    setViewDirty(false);
  }, [data]);

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart || !data?.nodes.length) return;

    const onGraphRoam = (...args: unknown[]) => {
      const params = args[0] as { dx?: number; dy?: number } | undefined;
      if (isDispatchingRoamRef.current || !params) return;
      if (params.dx) panRef.current.x += params.dx;
      if (params.dy) panRef.current.y += params.dy;
      setViewDirty(true);
    };

    chart.on('graphRoam', onGraphRoam);
    return () => {
      chart.off('graphRoam', onGraphRoam);
    };
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !fillParent) return;

    const resizeChart = () => {
      chartRef.current?.getEchartsInstance()?.resize();
    };

    const observer = new ResizeObserver(resizeChart);
    observer.observe(container);
    resizeChart();

    return () => {
      observer.disconnect();
    };
  }, [fillParent, loading, data]);

  const containerStyle = {
    position: 'relative' as const,
    width: '100%',
    height: fillParent ? '100%' : height,
    flex: fillParent ? 1 : undefined,
    minHeight: fillParent ? 0 : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: loading || !data?.nodes.length ? (loading ? '#fff' : '#fafafa') : undefined,
  };

  if (loading) {
    return (
      <div ref={containerRef} style={containerStyle}>
        <Spin tip="加载图谱…" />
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div ref={containerRef} style={containerStyle}>
        <Empty description="暂无图谱数据" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: fillParent ? '100%' : height,
        flex: fillParent ? 1 : undefined,
        minHeight: fillParent ? 0 : undefined,
      }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        notMerge
        lazyUpdate
        onEvents={onEvents}
        style={{
          width: '100%',
          height: '100%',
          background: '#fff',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: 12,
          bottom: 12,
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.92)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Tooltip title="放大">
          <Button
            type="text"
            size="small"
            icon={<ZoomInOutlined />}
            aria-label="放大"
            disabled={zoomLevel >= MAX_ZOOM}
            onClick={handleZoomIn}
          />
        </Tooltip>
        <Tooltip title="缩小">
          <Button
            type="text"
            size="small"
            icon={<ZoomOutOutlined />}
            aria-label="缩小"
            disabled={zoomLevel <= MIN_ZOOM}
            onClick={handleZoomOut}
          />
        </Tooltip>
        <Tooltip title="重置视图">
          <Button
            type="text"
            size="small"
            icon={<CompressOutlined />}
            aria-label="重置视图"
            disabled={!viewDirty}
            onClick={handleResetZoom}
          />
        </Tooltip>
      </div>
    </div>
  );
}
