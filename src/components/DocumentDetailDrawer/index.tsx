import type { ReactNode } from 'react';

import { Descriptions, Drawer, Tag, Typography } from 'antd';

import dayjs from 'dayjs';

import MarkdownPreview from '@/components/MarkdownPreview';
import { getDocumentStatusMeta } from '@/constants/document';
import type { DocumentDetail } from '@/types/document';

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
  loading: boolean;
  detail: DocumentDetail | null;
  extra?: ReactNode;
  onClose: () => void;
};

export default function DocumentDetailDrawer({ open, loading, detail, extra, onClose }: Props) {
  return (
    <Drawer
      title={detail?.title || '文档详情'}
      width={720}
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
        <Typography.Text type="secondary">加载中…</Typography.Text>
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
                children: detail.fileExt ? `.${detail.fileExt}` : '—',
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
        </div>
      ) : null}
    </Drawer>
  );
}
