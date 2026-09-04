import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Empty,
  Input,
  List,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getApiDocumentId, postApiSearch, type DocumentEntity } from '@/service/api';
import { getDocumentStatusMeta } from '@/constants/document';

type SearchHit = {
  id: string;
  score: number;
  title: string;
  summary?: string;
  authorId?: string | null;
  status: number;
  publishTime?: string | null;
  indexedAt?: string | null;
  highlight?: {
    title?: string[];
    content?: string[];
  };
};

type SearchResult = {
  items: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
};

type DocumentDetail = DocumentEntity & {
  content: string;
  contentLength: number;
};

type SearchQuery = {
  keyword: string;
  page: number;
  pageSize: number;
};

function HighlightHtml({ html }: { html: string }) {
  return (
    <span
      className="search-highlight"
      // 后端高亮片段为受控 HTML（仅含 em）
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function SearchPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const requestSeq = useRef(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchSearch = useCallback(async (next: SearchQuery) => {
    if (!next.keyword.trim()) {
      setItems([]);
      setTotal(0);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = (await postApiSearch({
        body: {
          keyword: next.keyword.trim(),
          page: next.page,
          pageSize: next.pageSize,
        },
      })) as SearchResult;
      if (seq !== requestSeq.current) return;
      setItems(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch {
      // 错误已由拦截器提示
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!query) return;
    void fetchSearch(query);
  }, [fetchSearch, query]);

  const runSearch = (raw: string, page = 1) => {
    const keyword = raw.trim();
    if (!keyword) {
      message.warning('请输入搜索关键词');
      return;
    }
    setKeywordInput(keyword);
    setQuery({ keyword, page, pageSize: query?.pageSize ?? 10 });
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

  const hasSearched = Boolean(query?.keyword);

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        文档检索
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        按关键词全文检索已索引文档，支持标题与正文匹配高亮。
      </Typography.Paragraph>

      <Space.Compact style={{ width: '100%', maxWidth: 560, marginBottom: 24 }}>
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="输入关键词，例如 demo"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onPressEnter={() => runSearch(keywordInput)}
        />
        <Button type="primary" size="large" loading={loading} onClick={() => runSearch(keywordInput)}>
          搜索
        </Button>
      </Space.Compact>

      {!hasSearched ? (
        <Empty description="输入关键词后开始检索" />
      ) : (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={items}
          locale={{ emptyText: <Empty description="未找到相关文档" /> }}
          pagination={
            total > 0
              ? {
                  current: query?.page ?? 1,
                  pageSize: query?.pageSize ?? 10,
                  total,
                  showSizeChanger: true,
                  showTotal: (t) => `共 ${t} 条`,
                  onChange: (page, pageSize) => {
                    if (!query) return;
                    setQuery({ ...query, page, pageSize });
                  },
                }
              : false
          }
          renderItem={(item) => {
            const titleHtml = item.highlight?.title?.[0];
            const contentSnippets = item.highlight?.content ?? [];
            const statusMeta = getDocumentStatusMeta(item.status);

            return (
              <List.Item
                key={item.id}
                actions={[
                  <Button key="open" type="link" onClick={() => void openDetail(item.id)}>
                    查看详情
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Button
                      type="link"
                      style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                      onClick={() => void openDetail(item.id)}
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
                      <Typography.Text type="secondary">相关度 {item.score.toFixed(3)}</Typography.Text>
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
                  <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }} ellipsis={{ rows: 2 }}>
                    {item.summary}
                  </Typography.Paragraph>
                ) : null}
              </List.Item>
            );
          }}
        />
      )}

      <Drawer
        title={detail?.title || '文档详情'}
        width={720}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
      >
        {detailLoading ? (
          <Typography.Text type="secondary">加载中…</Typography.Text>
        ) : detail ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color={getDocumentStatusMeta(detail.status).color}>
                {getDocumentStatusMeta(detail.status).label}
              </Tag>
              {detail.fileExt ? <Tag>{`.${detail.fileExt}`}</Tag> : null}
              <Typography.Text type="secondary">
                字数 {detail.wordCount?.toLocaleString?.() ?? detail.wordCount}
              </Typography.Text>
            </Space>
            <Typography.Paragraph
              style={{
                whiteSpace: 'pre-wrap',
                marginBottom: 0,
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
                maxHeight: 'calc(100vh - 240px)',
                overflow: 'auto',
              }}
            >
              {detail.content || '（暂无正文）'}
            </Typography.Paragraph>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
