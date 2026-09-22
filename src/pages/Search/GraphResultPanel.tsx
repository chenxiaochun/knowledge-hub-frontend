import { Button, Empty, List, Space, Tag, Typography } from 'antd';

import type { GraphSubgraphNodeDto, GraphSubgraphResultDto } from '@/service/api';

import GraphChart from '@/components/GraphChart';

type Props = {
  loading: boolean;
  data: GraphSubgraphResultDto | null;
  onDocumentClick: (documentId: string) => void;
};

export default function GraphResultPanel({ loading, data, onDocumentClick }: Props) {
  const nodes = data?.nodes ?? [];
  const edgeCount = data?.edges?.length ?? 0;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <GraphChart data={data} loading={loading} onDocumentClick={onDocumentClick} />

      <List<GraphSubgraphNodeDto>
        loading={loading}
        itemLayout="vertical"
        dataSource={nodes}
        locale={{ emptyText: <Empty description="未找到匹配的图谱节点" /> }}
        header={
          nodes.length > 0 ? (
            <Typography.Text type="secondary">
              共 {nodes.length} 个节点 · {edgeCount} 条关系
            </Typography.Text>
          ) : null
        }
        renderItem={(node) => {
          const isDoc = node.label === 'KnowledgeDocument' && Boolean(node.documentId);

          return (
            <List.Item key={node.id}>
              <List.Item.Meta
                title={
                  isDoc ? (
                    <Button
                      type="link"
                      style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                      onClick={() => onDocumentClick(node.documentId!)}
                    >
                      {node.name}
                    </Button>
                  ) : (
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      {node.name}
                    </Typography.Text>
                  )
                }
                description={
                  <Space wrap size="small">
                    <Tag color={isDoc ? 'blue' : 'cyan'}>{node.label}</Tag>
                    {node.type ? <Tag>{node.type}</Tag> : null}
                  </Space>
                }
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                ID：{node.id}
              </Typography.Text>
            </List.Item>
          );
        }}
      />
    </Space>
  );
}
