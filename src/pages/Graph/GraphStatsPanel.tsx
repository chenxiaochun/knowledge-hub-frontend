import {
  BulbOutlined,
  ClusterOutlined,
  FileTextOutlined,
  FolderOutlined,
  InfoCircleOutlined,
  ShareAltOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { Button, Empty, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

import FileTypeIcon from '@/components/FileTypeIcon';

import type {
  GraphOverviewRecentNodeDto,
  GraphOverviewStatsDto,
  GraphOverviewTopEntityDto,
} from './types';

import styles from './GraphStatsPanel.module.scss';

type Props = {
  loading?: boolean;
  stats: GraphOverviewStatsDto | null;
  topEntities: GraphOverviewTopEntityDto[];
  recentNodes: GraphOverviewRecentNodeDto[];
  onRecentClick?: (documentId: string) => void;
  onViewMoreRecent?: () => void;
};

function formatCount(value: number) {
  return value.toLocaleString('zh-CN');
}

function getEntityTypeCount(stats: GraphOverviewStatsDto | null, type: string) {
  if (!stats) return 0;
  return stats.entityTypes.find((item) => item.type.toUpperCase() === type.toUpperCase())?.count ?? 0;
}

function extractDocId(nodeId: string) {
  return nodeId.startsWith('doc:') ? nodeId.slice(4) : nodeId;
}

function extractFileExt(name: string) {
  const index = name.lastIndexOf('.');
  if (index <= 0 || index === name.length - 1) return undefined;
  return name.slice(index + 1);
}

type MetricItem = {
  key: string;
  label: string;
  value: number;
  icon: ReactNode;
  iconClass: string;
};

function buildMetrics(stats: GraphOverviewStatsDto | null): MetricItem[] {
  return [
    {
      key: 'nodeCount',
      label: '节点总数',
      value: stats?.nodeCount ?? 0,
      icon: <ClusterOutlined />,
      iconClass: styles.metricIconBlue,
    },
    {
      key: 'edgeCount',
      label: '关系总数',
      value: stats?.edgeCount ?? 0,
      icon: <ShareAltOutlined />,
      iconClass: styles.metricIconGreen,
    },
    {
      key: 'documentCount',
      label: '文档节点',
      value: stats?.documentCount ?? 0,
      icon: <FileTextOutlined />,
      iconClass: styles.metricIconBlue,
    },
    {
      key: 'conceptCount',
      label: '知识点',
      value: getEntityTypeCount(stats, 'CONCEPT'),
      icon: <BulbOutlined />,
      iconClass: styles.metricIconGreen,
    },
    {
      key: 'tagCount',
      label: '标签',
      value: stats?.tagCount ?? 0,
      icon: <TagOutlined />,
      iconClass: styles.metricIconPurple,
    },
    {
      key: 'organizationCount',
      label: '业务分类',
      value: getEntityTypeCount(stats, 'ORGANIZATION'),
      icon: <FolderOutlined />,
      iconClass: styles.metricIconOrange,
    },
  ];
}

export default function GraphStatsPanel({
  loading,
  stats,
  topEntities,
  recentNodes,
  onRecentClick,
  onViewMoreRecent,
}: Props) {
  const metrics = buildMetrics(stats);

  return (
    <aside className={styles.panel}>
      <Spin spinning={loading}>
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <Typography.Text strong>图谱数据统计</Typography.Text>
            <InfoCircleOutlined className={styles.sectionHint} />
          </div>

          <div className={styles.metricGrid}>
            {metrics.map((item) => (
              <div key={item.key} className={styles.metricCard}>
                <Typography.Text type="secondary" className={styles.metricLabel}>
                  {item.label}
                </Typography.Text>
                <div className={styles.metricRow}>
                  <span className={styles.metricValue}>{formatCount(item.value)}</span>
                  <span className={`${styles.metricIcon} ${item.iconClass}`}>{item.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Typography.Text strong className={styles.blockTitle}>
            热门知识点 Top 5
          </Typography.Text>

          {topEntities.length > 0 ? (
            <ul className={styles.rankList}>
              {topEntities.map((item, index) => (
                <li key={`${item.name}-${index}`} className={styles.rankItem}>
                  <span className={styles.rankBadge}>{index + 1}</span>
                  <Typography.Text className={styles.rankName} ellipsis={{ tooltip: item.name }}>
                    {item.name}
                  </Typography.Text>
                  <Typography.Text type="secondary" className={styles.rankMeta}>
                    关联数: {formatCount(item.degree)}
                  </Typography.Text>
                </li>
              ))}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无热门知识点" />
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <Typography.Text strong>最近更新的节点</Typography.Text>
            {onViewMoreRecent ? (
              <Button type="link" size="small" className={styles.moreBtn} onClick={onViewMoreRecent}>
                更多 &gt;
              </Button>
            ) : null}
          </div>

          {recentNodes.length > 0 ? (
            <ul className={styles.recentList}>
              {recentNodes.slice(0, 8).map((item) => {
                const docId = extractDocId(item.id);
                const ext = item.fileExt ?? extractFileExt(item.name);

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.recentItem}
                      onClick={() => onRecentClick?.(docId)}
                    >
                      <FileTypeIcon ext={ext} size={20} />
                      <Typography.Text className={styles.recentName} ellipsis={{ tooltip: item.name }}>
                        {item.name}
                      </Typography.Text>
                      <Typography.Text type="secondary" className={styles.recentTime}>
                        {item.updatedAt ? dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm') : '—'}
                      </Typography.Text>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无最近更新" />
          )}
        </section>
      </Spin>
    </aside>
  );
}
