import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
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
import dayjs from 'dayjs';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { getDocumentStatusMeta } from '@/constants/document';
import {
  getApiDocumentId,
  getApiGraphSearchSubgraph,
  getApiSearch,
  getApiSearchSemantic,
  type GraphSubgraphResultDto,
  type SearchDocumentHitDto,
  type SemanticSearchHitDto,
} from '@/service/api';
import type { DocumentDetail } from '@/types/document';

import GraphResultPanel from './GraphResultPanel';
import type { ActiveQuery, SearchMode } from './types';

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
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [keywordInput, setKeywordInput] = useState('');
  const [topK, setTopK] = useState(5);
  const [graphLimit, setGraphLimit] = useState(20);
  const [query, setQuery] = useState<ActiveQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywordItems, setKeywordItems] = useState<SearchDocumentHitDto[]>([]);
  const [semanticItems, setSemanticItems] = useState<SemanticSearchHitDto[]>([]);
  const [graphSubgraph, setGraphSubgraph] = useState<GraphSubgraphResultDto | null>(null);
  const [total, setTotal] = useState(0);
  const requestSeq = useRef(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchSearch = useCallback(async (next: ActiveQuery) => {
    if (!next.keyword.trim()) {
      setKeywordItems([]);
      setSemanticItems([]);
      setGraphSubgraph(null);
      setTotal(0);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      if (next.mode === 'keyword') {
        const res = await getApiSearch({
          query: {
            keyword: next.keyword.trim(),
            page: next.page,
            pageSize: next.pageSize,
          },
        });
        if (seq !== requestSeq.current) return;
        setKeywordItems(res.items ?? []);
        setSemanticItems([]);
        setGraphSubgraph(null);
        setTotal(res.total ?? 0);
      } else if (next.mode === 'semantic') {
        const res = await getApiSearchSemantic({
          query: {
            query: next.keyword.trim(),
            topK: next.topK,
          },
        });
        if (seq !== requestSeq.current) return;
        const items = Array.isArray(res) ? res : [];
        setSemanticItems(items);
        setKeywordItems([]);
        setGraphSubgraph(null);
        setTotal(items.length);
      } else {
        const res = await getApiGraphSearchSubgraph({
          query: {
            keyword: next.keyword.trim(),
            limit: next.limit,
          },
        });
        if (seq !== requestSeq.current) return;
        const subgraph: GraphSubgraphResultDto = {
          nodes: Array.isArray(res?.nodes) ? res.nodes : [],
          edges: Array.isArray(res?.edges) ? res.edges : [],
        };
        setGraphSubgraph(subgraph);
        setKeywordItems([]);
        setSemanticItems([]);
        setTotal(subgraph.nodes.length);
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
    setQuery(null);
    setKeywordItems([]);
    setSemanticItems([]);
    setGraphSubgraph(null);
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
            <List.Item key={item.chunkId}>
              <List.Item.Meta
                title={
                  <Button
                    type="link"
                    style={{ paddingInline: 0, height: 'auto', fontSize: 16 }}
                    onClick={() => void openDetail(item.documentId)}
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
      ) : activeMode === 'graph' ? (
        <GraphResultPanel
          loading={loading}
          data={graphSubgraph}
          onDocumentClick={(id) => void openDetail(id)}
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
              <List.Item key={item.id}>
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
      )}

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
