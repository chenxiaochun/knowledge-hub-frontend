import { Button, Empty, List, Space, Tag, Typography } from 'antd';
import type { PaginationProps } from 'antd';
import dayjs from 'dayjs';

import { getDocumentStatusMeta } from '@/constants/document';
import type { SearchDocumentHitDto } from '@/service/api';

function HighlightHtml({ html }: { html: string }) {
  return (
    <span
      className="search-highlight"
      // 后端高亮片段为受控 HTML（仅含 em）
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

type Props = {
  loading: boolean;
  items: SearchDocumentHitDto[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpenDetail: (id: string) => void;
};

export default function KeywordResultList({
  loading,
  items,
  total,
  page,
  pageSize,
  onPageChange,
  onOpenDetail,
}: Props) {
  const pagination: PaginationProps | false =
    total > 0
      ? {
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: onPageChange,
        }
      : false;

  return (
    <List
      loading={loading}
      itemLayout="vertical"
      dataSource={items}
      locale={{ emptyText: <Empty description="未找到相关文档" /> }}
      pagination={pagination}
      renderItem={(item) => {
        const titleHtml = item.highlight?.title?.[0];
        const contentSnippets = item.highlight?.content ?? [];
        const statusMeta = getDocumentStatusMeta(item.status);

        return (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={
                <Button
                  type="link"
                  style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                  onClick={() => onOpenDetail(item.id)}
                >
                  {titleHtml ? <HighlightHtml html={titleHtml} /> : item.title}
                </Button>
              }
              description={
                <Space wrap size="small">
                  <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
                  {item.publishTime ? (
                    <Typography.Text type="secondary">
                      发布于 {dayjs(item.publishTime).format('YYYY-MM-DD HH:mm')}
                    </Typography.Text>
                  ) : null}
                  <Typography.Text type="secondary">
                    相关度 {(item.score ?? 0).toFixed(3)}
                  </Typography.Text>
                </Space>
              }
            />
            {contentSnippets.length > 0 ? (
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                {contentSnippets.slice(0, 2).map((snippet, index) => (
                  <Typography.Paragraph
                    key={`${item.id}-c-${index}`}
                    type="secondary"
                    style={{ marginBottom: 0 }}
                    ellipsis={{ rows: 2 }}
                  >
                    <HighlightHtml html={snippet} />
                  </Typography.Paragraph>
                ))}
              </Space>
            ) : item.summary ? (
              <Typography.Paragraph
                type="secondary"
                style={{ marginBottom: 0 }}
                ellipsis={{ rows: 2 }}
              >
                {item.summary}
              </Typography.Paragraph>
            ) : null}
          </List.Item>
        );
      }}
    />
  );
}
