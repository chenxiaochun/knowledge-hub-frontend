import { Button, Empty, List, Listy, Pagination, Space, Spin, Tag, Typography } from 'antd';
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

  const showEmpty = !loading && items.length === 0;

  return (
    <>
      <Spin spinning={loading}>
        {showEmpty ? (
          <Empty description="未找到相关文档" />
        ) : (
          <div className="ant-list ant-list-vertical ant-list-split">
            <Listy
              items={items}
              rowKey="id"
              itemRender={(item) => {
                const titleHtml = item.highlight?.title?.[0];
                const contentSnippets = item.highlight?.content ?? [];
                const statusMeta = getDocumentStatusMeta(item.status);

                return (
                  <List.Item>
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
                      <Space orientation="vertical" size={4} style={{ width: '100%' }}>
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
          </div>
        )}
      </Spin>
      {pagination ? (
        <Pagination {...pagination} style={{ marginTop: 16, textAlign: 'right' }} />
      ) : null}
    </>
  );
}
