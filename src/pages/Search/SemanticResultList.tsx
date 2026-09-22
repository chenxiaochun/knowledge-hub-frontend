import { Button, Empty, List, Space, Tag, Typography } from 'antd';

import type { SemanticSearchHitDto } from '@/service/api';

type Props = {
  loading: boolean;
  items: SemanticSearchHitDto[];
  onOpenDetail: (id: string) => void;
};

export default function SemanticResultList({ loading, items, onOpenDetail }: Props) {
  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={items}
      locale={{ emptyText: <Empty description="未找到语义相近的文档片段" /> }}
      renderItem={(item) => (
        <List.Item key={item.chunkId}>
          <List.Item.Meta
            title={
              <Button
                type="link"
                style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                onClick={() => onOpenDetail(item.documentId)}
              >
                {item.documentTitle || '未命名文档'}
              </Button>
            }
            description={
              <Space wrap size="small">
                {item.heading ? <Tag color="processing">{item.heading}</Tag> : null}
                <Typography.Text type="secondary">
                  相似度 {item.score.toFixed(3)}
                </Typography.Text>
              </Space>
            }
          />
          <Typography.Paragraph
            type="secondary"
            style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
            ellipsis={{ rows: 4, expandable: true, symbol: '展开' }}
          >
            {item.content || '（空片段）'}
          </Typography.Paragraph>
        </List.Item>
      )}
    />
  );
}
