import { lazy, startTransition, Suspense, useEffect, useState, type ReactNode } from 'react';

import { Descriptions, Drawer, Space, Spin, Tag, Typography } from 'antd';

import dayjs from 'dayjs';

import FileCardIcon from '@/components/FileCardIcon';
import { getDocumentStatusMeta } from '@/constants/document';
import { getApiDocumentId } from '@/service/api';
import type { DocumentDetail } from '@/types/document';

const MarkdownPreview = lazy(() => import('@/components/MarkdownPreview'));

function getSourceFileName(fileUrl: string, fallback?: string) {
  try {
    const name = decodeURIComponent(
      new URL(fileUrl).pathname.split('/').filter(Boolean).at(-1) || '',
    );
    return name || fallback || fileUrl;
  } catch {
    return fallback || fileUrl;
  }
}

type Props = {
  open: boolean;
  /** 传入后由抽屉内部拉详情；与受控 detail/loading 二选一 */
  documentId?: string | null;
  loading?: boolean;
  detail?: DocumentDetail | null;
  extra?: ReactNode;
  onClose: () => void;
};

export default function DocumentDetailDrawer({
  open,
  documentId,
  loading: loadingProp,
  detail: detailProp,
  extra,
  onClose,
}: Props) {
  const selfFetch = documentId != null && documentId !== '';
  const [innerLoading, setInnerLoading] = useState(false);
  const [innerDetail, setInnerDetail] = useState<DocumentDetail | null>(null);

  useEffect(() => {
    if (!open || !selfFetch || !documentId) {
      return;
    }

    let cancelled = false;
    setInnerDetail(null);
    setInnerLoading(true);

    void getApiDocumentId({ path: { id: documentId } })
      .then((res) => {
        if (cancelled) return;
        startTransition(() => {
          setInnerDetail(res as DocumentDetail);
          setInnerLoading(false);
        });
      })
      .catch(() => {
        if (cancelled) return;
        setInnerLoading(false);
        onClose();
      });

    return () => {
      cancelled = true;
    };
    // onClose 由调用方内联时勿列入依赖，避免重复请求
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅随 open/documentId 拉数
  }, [open, documentId, selfFetch]);

  useEffect(() => {
    if (open || !selfFetch) return;
    setInnerDetail(null);
    setInnerLoading(false);
  }, [open, selfFetch]);

  const loading = selfFetch ? innerLoading : Boolean(loadingProp);
  const detail = selfFetch ? innerDetail : (detailProp ?? null);

  return (
    <Drawer
      title={detail?.title || '文档详情'}
      size={720}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={extra}
      styles={{
        section: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
        body: {
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <Spin />
        </div>
      ) : detail ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            height: '100%',
            minHeight: 0,
          }}
        >
          <Descriptions
            size="small"
            column={2}
            style={{ flexShrink: 0 }}
            items={[
              {
                label: '状态',
                children: (
                  <Tag color={getDocumentStatusMeta(detail.status).color}>
                    {getDocumentStatusMeta(detail.status).label}
                  </Tag>
                ),
              },
              {
                label: '格式',
                children: detail.fileExt ? (
                  <Space size={6}>
                    <FileCardIcon ext={detail.fileExt} size={24} />
                    <span>.{detail.fileExt}</span>
                  </Space>
                ) : (
                  '—'
                ),
              },
              {
                label: '字数',
                children: detail.wordCount?.toLocaleString?.() ?? detail.wordCount ?? '—',
              },
              {
                label: '标签',
                children: detail.tags || '—',
              },
              {
                label: '创建时间',
                children: detail.createdAt
                  ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm')
                  : '—',
              },
              {
                label: '发布时间',
                children: detail.publishTime
                  ? dayjs(detail.publishTime).format('YYYY-MM-DD HH:mm')
                  : '—',
              },
              ...(detail.fileUrl
                ? [
                    {
                      label: '源文件',
                      span: 2 as const,
                      children: (
                        <Typography.Link
                          href={detail.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          ellipsis
                          style={{ maxWidth: '100%' }}
                        >
                          {getSourceFileName(
                            detail.fileUrl,
                            detail.fileExt ? `${detail.title}.${detail.fileExt}` : detail.title,
                          )}
                        </Typography.Link>
                      ),
                    },
                  ]
                : []),
            ]}
          />
          <Suspense
            fallback={
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Spin />
              </div>
            }
          >
            <MarkdownPreview
              content={detail.content}
              style={{
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
              }}
            />
          </Suspense>
        </div>
      ) : null}
    </Drawer>
  );
}
