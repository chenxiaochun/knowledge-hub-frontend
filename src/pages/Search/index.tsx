import { useCallback, useEffect, useRef, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Typography, message, Collapse } from 'antd';

import type { DocumentDetail } from '@/types/document';

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

import type { SearchQuery } from './types';

import GraphResultPanel from './GraphResultPanel';
import KeywordResultList from './KeywordResultList';
import SemanticResultList from './SemanticResultList';

import styles from './index.module.scss';

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

  const [layoutActive, setLayoutActive] = useState(false);

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

  const hasAnyResults =
    keywordTotal > 0 ||
    semanticItems.length > 0 ||
    (graphSubgraph?.nodes?.length ?? 0) > 0;

  useEffect(() => {
    if (!query?.keyword) {
      setLayoutActive(false);
      return;
    }
    if (!loading && hasAnyResults) {
      setLayoutActive(true);
    }
  }, [query?.keyword, loading, hasAnyResults]);

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
  const showEmptyHint = hasSearched && !loading && !hasAnyResults;

  return (
    <div className={`${styles.page} ${layoutActive ? styles.pageActive : ''}`}>
      <div className={styles.searchArea}>
        <div className={styles.searchStack}>
          <div className={`${styles.searchBrand} ${layoutActive ? styles.searchBrandHidden : ''}`}>
            <Typography.Title level={2} className={styles.searchBrandTitle}>
              智能检索
            </Typography.Title>
            <Typography.Paragraph className={styles.searchBrandDesc}>
              一次搜索，同时检索全文、语义与知识图谱
            </Typography.Paragraph>
          </div>

          <div className={styles.searchBar}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                autoFocus
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
                className={styles.searchBtn}
                loading={loading}
                onClick={() => runSearch(keywordInput)}
              >
                搜索
              </Button>
            </Space.Compact>
          </div>

          {showEmptyHint ? (
            <Typography.Text type="secondary" className={styles.emptyHint}>
              未找到相关结果，请换个关键词试试
            </Typography.Text>
          ) : null}
        </div>
      </div>

      {layoutActive ? (
        <div className={styles.resultsArea}>
          <Collapse defaultActiveKey={['1', '2', '3']}>
            <Collapse.Panel key="1" header="全文检索">
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
            </Collapse.Panel>

            <Collapse.Panel key="2" header="语义检索">
              <SemanticResultList
                loading={loading}
                items={semanticItems}
                onOpenDetail={(id) => void openDetail(id)}
              />
            </Collapse.Panel>

            <Collapse.Panel key="3" header="图谱检索">
              <GraphResultPanel
                loading={loading}
                data={graphSubgraph}
                onDocumentClick={(id) => void openDetail(id)}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      ) : null}

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
