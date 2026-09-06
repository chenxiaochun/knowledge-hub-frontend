import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Empty,
  Input,
  InputNumber,
  List,
  Segmented,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getApiDocumentId,
  getApiGraphSearch,
  getApiSearch,
  getApiSearchSemantic,
  type DocumentEntity,
} from '@/service/api';
import { getDocumentStatusMeta } from '@/constants/document';

type SearchMode = 'keyword' | 'semantic' | 'graph';

type KeywordHit = {
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

type KeywordResult = {
  items: KeywordHit[];
  total: number;
  page: number;
  pageSize: number;
};

/** 语义检索返回的是向量块命中 */
type SemanticHit = {
  id: string;
  score: number | null;
  document_id: string;
  document_title: string;
  content: string;
  chunk_index: number;
};

/** 图谱检索命中：Neo4j 节点 labels + properties */
type GraphHit = {
  labels: string[];
  props: {
    id?: string;
    title?: string;
    name?: string;
    type?: string;
    [key: string]: unknown;
  };
};

type DocumentDetail = DocumentEntity & {
  content: string;
  contentLength: number;
};

type KeywordQuery = {
  mode: 'keyword';
  keyword: string;
  page: number;
  pageSize: number;
};

type SemanticQuery = {
  mode: 'semantic';
  keyword: string;
  topK: number;
};

type GraphQuery = {
  mode: 'graph';
  keyword: string;
  limit: number;
};

type ActiveQuery = KeywordQuery | SemanticQuery | GraphQuery;

function HighlightHtml({ html }: { html: string }) {
  return (
    <span
      className="search-highlight"
      // 后端高亮片段为受控 HTML（仅含 em）
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function graphHitKey(item: GraphHit, index: number) {
  return String(item.props.id ?? item.props.name ?? index);
}

function graphHitTitle(item: GraphHit) {
  if (typeof item.props.title === 'string' && item.props.title) return item.props.title;
  if (typeof item.props.name === 'string' && item.props.name) return item.props.name;
  return '未命名节点';
}

function isDocumentNode(item: GraphHit) {
  return item.labels.includes('KnowledgeDocument') && Boolean(item.props.id);
}

export default function SearchPage() {
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [keywordInput, setKeywordInput] = useState('');
  const [topK, setTopK] = useState(5);
  const [graphLimit, setGraphLimit] = useState(20);
  const [query, setQuery] = useState<ActiveQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywordItems, setKeywordItems] = useState<KeywordHit[]>([]);
  const [semanticItems, setSemanticItems] = useState<SemanticHit[]>([]);
  const [graphItems, setGraphItems] = useState<GraphHit[]>([]);
  const [total, setTotal] = useState(0);
  const requestSeq = useRef(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchSearch = useCallback(async (next: ActiveQuery) => {
    if (!next.keyword.trim()) {
      setKeywordItems([]);
      setSemanticItems([]);
      setGraphItems([]);
      setTotal(0);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      if (next.mode === 'keyword') {
        const res = (await getApiSearch({
          query: {
            keyword: next.keyword.trim(),
            page: next.page,
            pageSize: next.pageSize,
          },
        })) as KeywordResult;
        if (seq !== requestSeq.current) return;
        setKeywordItems(res.items ?? []);
        setSemanticItems([]);
        setGraphItems([]);
        setTotal(res.total ?? 0);
      } else if (next.mode === 'semantic') {
        const res = (await getApiSearchSemantic({
          query: {
            query: next.keyword.trim(),
            topK: next.topK,
          },
        })) as SemanticHit[];
        if (seq !== requestSeq.current) return;
        const items = Array.isArray(res) ? res : [];
        setSemanticItems(items);
        setKeywordItems([]);
        setGraphItems([]);
        setTotal(items.length);
      } else {
        const res = (await getApiGraphSearch({
          query: {
            keyword: next.keyword.trim(),
            limit: String(next.limit),
          },
        })) as GraphHit[];
        if (seq !== requestSeq.current) return;
        const items = Array.isArray(res) ? res : [];
        setGraphItems(items);
        setKeywordItems([]);
        setSemanticItems([]);
        setTotal(items.length);
      }
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
      message.warning('请输入搜索内容');
      return;
    }
    setKeywordInput(keyword);
    if (mode === 'keyword') {
      setQuery({
        mode: 'keyword',
        keyword,
        page,
        pageSize: query?.mode === 'keyword' ? query.pageSize : 10,
      });
    } else if (mode === 'semantic') {
      setQuery({
        mode: 'semantic',
        keyword,
        topK,
      });
    } else {
      setQuery({
        mode: 'graph',
        keyword,
        limit: graphLimit,
      });
    }
  };

  const switchMode = (nextMode: SearchMode) => {
    setMode(nextMode);
    // 切换模式后清空结果，避免混读；保留输入词方便再次搜索
    setQuery(null);
    setKeywordItems([]);
    setSemanticItems([]);
    setGraphItems([]);
    setTotal(0);
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
  const activeMode = query?.mode ?? mode;

  const emptyHint =
    mode === 'keyword'
      ? '输入关键词后开始检索'
      : mode === 'semantic'
        ? '输入问题后开始语义检索'
        : '输入实体名或文档标题后开始图谱检索';

  const placeholder =
    mode === 'keyword'
      ? '输入关键词，例如 demo'
      : mode === 'semantic'
        ? '用自然语言描述问题，例如 如何发布文档'
        : '输入图谱节点关键词，例如 实体名或文档标题';

  return (
    <div>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        文档检索
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        支持全文检索、语义向量检索与知识图谱检索；图谱命中为实体或文档节点。
      </Typography.Paragraph>

      <Space direction="vertical" size={16} style={{ width: '100%', marginBottom: 24 }}>
        <Segmented
          value={mode}
          onChange={(value) => switchMode(value as SearchMode)}
          options={[
            { label: '全文检索', value: 'keyword' },
            { label: '语义检索', value: 'semantic' },
            { label: '图谱检索', value: 'graph' },
          ]}
        />

        <Space wrap align="center">
          <Space.Compact style={{ width: 560, maxWidth: '100%' }}>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined />}
              placeholder={placeholder}
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onPressEnter={() => runSearch(keywordInput)}
            />
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={() => runSearch(keywordInput)}
            >
              搜索
            </Button>
          </Space.Compact>

          {mode === 'semantic' ? (
            <Space>
              <Typography.Text type="secondary">返回条数</Typography.Text>
              <InputNumber
                min={1}
                max={20}
                value={topK}
                onChange={(value) => setTopK(typeof value === 'number' ? value : 5)}
              />
            </Space>
          ) : null}

          {mode === 'graph' ? (
            <Space>
              <Typography.Text type="secondary">返回条数</Typography.Text>
              <InputNumber
                min={1}
                max={100}
                value={graphLimit}
                onChange={(value) => setGraphLimit(typeof value === 'number' ? value : 20)}
              />
            </Space>
          ) : null}
        </Space>
      </Space>

      {!hasSearched ? (
        <Empty description={emptyHint} />
      ) : activeMode === 'semantic' ? (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={semanticItems}
          locale={{ emptyText: <Empty description="未找到语义相近的文档片段" /> }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  key="open"
                  type="link"
                  onClick={() => void openDetail(item.document_id)}
                >
                  查看文档
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Button
                    type="link"
                    style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                    onClick={() => void openDetail(item.document_id)}
                  >
                    {item.document_title || '未命名文档'}
                  </Button>
                }
                description={
                  <Space wrap size="small">
                    <Tag color="purple">语义片段 #{item.chunk_index + 1}</Tag>
                    <Typography.Text type="secondary">
                      相似度 {item.score == null ? '—' : item.score.toFixed(3)}
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
      ) : activeMode === 'graph' ? (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={graphItems}
          locale={{ emptyText: <Empty description="未找到匹配的图谱节点" /> }}
          header={
            total > 0 ? (
              <Typography.Text type="secondary">共 {total} 个节点</Typography.Text>
            ) : null
          }
          renderItem={(item, index) => {
            const title = graphHitTitle(item);
            const documentId = isDocumentNode(item) ? String(item.props.id) : null;

            return (
              <List.Item
                key={graphHitKey(item, index)}
                actions={
                  documentId
                    ? [
                        <Button key="open" type="link" onClick={() => void openDetail(documentId)}>
                          查看文档
                        </Button>,
                      ]
                    : undefined
                }
              >
                <List.Item.Meta
                  title={
                    documentId ? (
                      <Button
                        type="link"
                        style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                        onClick={() => void openDetail(documentId)}
                      >
                        {title}
                      </Button>
                    ) : (
                      <Typography.Text strong style={{ fontSize: 16 }}>
                        {title}
                      </Typography.Text>
                    )
                  }
                  description={
                    <Space wrap size="small">
                      {item.labels.map((label) => (
                        <Tag key={label} color={label === 'KnowledgeDocument' ? 'blue' : 'cyan'}>
                          {label}
                        </Tag>
                      ))}
                      {typeof item.props.type === 'string' && item.props.type ? (
                        <Tag>{item.props.type}</Tag>
                      ) : null}
                    </Space>
                  }
                />
                {typeof item.props.id === 'string' && item.props.id ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    ID：{item.props.id}
                  </Typography.Text>
                ) : null}
              </List.Item>
            );
          }}
        />
      ) : (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={keywordItems}
          locale={{ emptyText: <Empty description="未找到相关文档" /> }}
          pagination={
            total > 0
              ? {
                  current: query?.mode === 'keyword' ? query.page : 1,
                  pageSize: query?.mode === 'keyword' ? query.pageSize : 10,
                  total,
                  showSizeChanger: true,
                  showTotal: (t) => `共 ${t} 条`,
                  onChange: (page, pageSize) => {
                    if (!query || query.mode !== 'keyword') return;
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
                      <Typography.Text type="secondary">
                        相关度 {item.score.toFixed(3)}
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
