import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input, Space, Typography, message } from 'antd';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
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
import KeywordResultList from './KeywordResultList';
import SemanticResultList from './SemanticResultList';
import type { SearchQuery } from './types';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_TOP_K = 5;
const DEFAULT_GRAPH_LIMIT = 20;

export default function SearchPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [query, setQuery] = useState<SearchQuery | null>(null);
  const [loading, setLoading] = useState(false);
  const [keywordItems, setKeywordItems] = useState<SearchDocumentHitDto[]>([]);
  const [keywordTotal, setKeywordTotal] = useState(0);
  const [semanticItems, setSemanticItems] = useState<SemanticSearchHitDto[]>([]);
  const [graphSubgraph, setGraphSubgraph] = useState<GraphSubgraphResultDto | null>(null);
  const requestSeq = useRef(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchSearch = useCallback(async (next: SearchQuery) => {
    const keyword = next.keyword.trim();
    if (!keyword) {
      setKeywordItems([]);
      setKeywordTotal(0);
      setSemanticItems([]);
      setGraphSubgraph(null);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const [keywordRes, semanticRes, graphRes] = await Promise.allSettled([
        getApiSearch({
          query: {
            keyword,
            page: next.page,
            pageSize: next.pageSize,
          },
        }),
        getApiSearchSemantic({
          query: {
            query: keyword,
            topK: next.topK,
          },
        }),
        getApiGraphSearchSubgraph({
          query: {
            keyword,
            limit: next.graphLimit,
          },
        }),
      ]);

      if (seq !== requestSeq.current) return;

      if (keywordRes.status === 'fulfilled') {
        setKeywordItems(keywordRes.value.items ?? []);
        setKeywordTotal(keywordRes.value.total ?? 0);
      } else {
        setKeywordItems([]);
        setKeywordTotal(0);
      }

      if (semanticRes.status === 'fulfilled') {
        setSemanticItems(Array.isArray(semanticRes.value) ? semanticRes.value : []);
      } else {
        setSemanticItems([]);
      }

      if (graphRes.status === 'fulfilled') {
        const res = graphRes.value;
        setGraphSubgraph({
          nodes: Array.isArray(res?.nodes) ? res.nodes : [],
          edges: Array.isArray(res?.edges) ? res.edges : [],
        });
      } else {
        setGraphSubgraph(null);
      }
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

  const runSearch = (raw: string, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    const keyword = raw.trim();
    if (!keyword) {
      message.warning('请输入搜索内容');
      return;
    }
    setKeywordInput(keyword);
    setQuery({
      keyword,
      page,
      pageSize,
      topK: DEFAULT_TOP_K,
      graphLimit: DEFAULT_GRAPH_LIMIT,
    });
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
      <Space style={{ marginBottom: 24, width: '100%' }} wrap>
        <Space.Compact style={{ width: 560, maxWidth: '100%' }}>
          <Input
            allowClear
            size="large"
            prefix={<SearchOutlined />}
            placeholder="输入关键词，同时检索全文、语义与知识图谱"
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
      </Space>

      {!hasSearched ? (
        <Empty description="输入关键词后开始检索" />
      ) : (
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          <section>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              全文检索
            </Typography.Title>
            <KeywordResultList
              loading={loading}
              items={keywordItems}
              total={keywordTotal}
              page={query?.page ?? 1}
              pageSize={query?.pageSize ?? DEFAULT_PAGE_SIZE}
              onPageChange={(page, pageSize) => {
                if (!query) return;
                setQuery({ ...query, page, pageSize });
              }}
              onOpenDetail={(id) => void openDetail(id)}
            />
          </section>

          <section>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              语义检索
            </Typography.Title>
            <SemanticResultList
              loading={loading}
              items={semanticItems}
              onOpenDetail={(id) => void openDetail(id)}
            />
          </section>

          <section>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              图谱检索
            </Typography.Title>
            <GraphResultPanel
              loading={loading}
              data={graphSubgraph}
              onDocumentClick={(id) => void openDetail(id)}
            />
          </section>
        </Space>
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
