import { useCallback, useEffect, useRef, useState } from 'react';

import { InboxOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';

import dayjs from 'dayjs';

import type { RequestOption } from '@/utils/request';

import {
  DOCUMENT_UPLOAD_ACCEPT,
  DOCUMENT_UPLOAD_HINT,
  DOCUMENT_UPLOAD_MAX_MB,
  DocumentStatus,
  getDocumentStatusMeta,
  isSupportedDocumentExt,
} from '@/constants/document';
import { RoleCode } from '@/constants/roles';
import {
  deleteApiDocumentId,
  getApiDocument,
  getApiDocumentId,
  postApiDocumentUploadParse,
  putApiDocumentIdPublish,
  type DocumentEntity,
} from '@/service/api';
import { getUserInfo } from '@/utils/auth';

type DocumentPageResult = {
  list: DocumentEntity[];
  total: number;
  page: number;
  pageSize: number;
};

type DocumentDetail = DocumentEntity & {
  content: string;
  contentLength: number;
};

type ListQuery = {
  page: number;
  pageSize: number;
  keyword: string;
};

type UploadFormValues = {
  file?: UploadFile[];
  tags?: string;
  remark?: string;
};

function normFile(e: { fileList: UploadFile[] } | UploadFile[]) {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
}

export default function DocumentsPage() {
  const user = getUserInfo();
  const isAdmin = Boolean(user?.roles?.includes(RoleCode.ADMIN));

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [data, setData] = useState<DocumentEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<ListQuery>({ page: 1, pageSize: 10, keyword: '' });
  const [keywordInput, setKeywordInput] = useState('');
  const requestSeq = useRef(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm] = Form.useForm<UploadFormValues>();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchList = useCallback(async (next: ListQuery) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = (await getApiDocument({
        query: {
          page: next.page,
          pageSize: next.pageSize,
          keyword: next.keyword || undefined,
        },
      })) as DocumentPageResult;
      if (seq !== requestSeq.current) return;
      setData(res.list ?? []);
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
    void fetchList(query);
  }, [fetchList, query]);

  const updateQuery = (patch: Partial<ListQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
  };

  const openUpload = () => {
    uploadForm.resetFields();
    setUploadOpen(true);
  };

  const handleUpload = async () => {
    let values: UploadFormValues;
    try {
      values = await uploadForm.validateFields();
    } catch {
      return;
    }

    const file = values.file?.[0]?.originFileObj;
    if (!file) return;

    setUploading(true);
    try {
      const tags = values.tags?.trim() || undefined;
      const remark = values.remark?.trim() || undefined;
      const formData: NonNullable<RequestOption['formData']> = { file };
      if (tags) formData.tags = tags;
      if (remark) formData.remark = remark;

      // swagger 未声明 multipart file；生成函数会把 option 透传给 request，故走 formData
      await postApiDocumentUploadParse({
        body: { tags, remark },
        formData,
        timeout: 60_000,
      } as Parameters<typeof postApiDocumentUploadParse>[0]);

      message.success('上传并解析成功');
      setUploadOpen(false);
      updateQuery({ page: 1 });
      await fetchList({ ...query, page: 1 });
    } catch {
      // 错误已由拦截器提示
    } finally {
      setUploading(false);
    }
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

  const handlePublish = async (id: string, republish = false) => {
    setPublishingId(id);
    try {
      await putApiDocumentIdPublish({ path: { id } });
      message.success(republish ? '重新发布成功' : '发布成功');
      await fetchList(query);
      if (detail?.id === id) {
        const res = (await getApiDocumentId({ path: { id } })) as DocumentDetail;
        setDetail(res);
      }
    } catch {
      // 错误已由拦截器提示
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteApiDocumentId({ path: { id } });
      message.success('文档已删除');
      if (detail?.id === id) {
        setDetailOpen(false);
        setDetail(null);
      }
      if (data.length === 1 && query.page > 1) {
        updateQuery({ page: query.page - 1 });
      } else {
        await fetchList(query);
      }
    } catch {
      // 错误已由拦截器提示
    } finally {
      setDeletingId(null);
    }
  };

  const canPublish = (status: number) =>
    status === DocumentStatus.Draft ||
    status === DocumentStatus.Published ||
    status === DocumentStatus.Archived;

  const isPublished = (status: number) => status === DocumentStatus.Published;

  const renderDeleteAction = (id: string, opts?: { drawer?: boolean }) => {
    if (!isAdmin) return null;
    return (
      <Popconfirm
        title="确认删除该文档？"
        description="删除后将从列表移除；已发布文档会同步清理检索索引"
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        onConfirm={() => void handleDelete(id)}
      >
        <Button
          type={opts?.drawer ? 'default' : 'link'}
          danger
          size={opts?.drawer ? 'middle' : 'small'}
          loading={deletingId === id}
        >
          删除
        </Button>
      </Popconfirm>
    );
  };

  const renderPublishAction = (id: string, status: number, opts?: { drawer?: boolean }) => {
    if (!isAdmin || !canPublish(status)) return null;

    const republish = isPublished(status);
    const loading = publishingId === id;

    if (republish) {
      return (
        <Popconfirm
          title="确认重新发布？"
          description="将刷新发布时间并重新建立检索索引"
          okText="重新发布"
          cancelText="取消"
          onConfirm={() => void handlePublish(id, true)}
        >
          <Button
            type={opts?.drawer ? 'primary' : 'link'}
            size={opts?.drawer ? 'middle' : 'small'}
            loading={loading}
          >
            重新发布
          </Button>
        </Popconfirm>
      );
    }

    return (
      <Button
        type={opts?.drawer ? 'primary' : 'link'}
        size={opts?.drawer ? 'middle' : 'small'}
        loading={loading}
        onClick={() => void handlePublish(id, false)}
      >
        发布
      </Button>
    );
  };

  const columns: ColumnsType<DocumentEntity> = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      render: (title: string, record) => (
        <Button type="link" style={{ paddingInline: 0 }} onClick={() => void openDetail(record.id)}>
          {title}
        </Button>
      ),
    },
    {
      title: '格式',
      dataIndex: 'fileExt',
      width: 80,
      render: (ext: string | null | undefined) => (ext ? `.${ext}` : '—'),
    },
    {
      title: '字数',
      dataIndex: 'wordCount',
      width: 100,
      render: (count: number) => count?.toLocaleString?.() ?? count,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 160,
      ellipsis: true,
      render: (tags: string | null | undefined) => tags || '—',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: number) => {
        const meta = getDocumentStatusMeta(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => void openDetail(record.id)}>
            详情
          </Button>
          {renderPublishAction(record.id, record.status)}
          {renderDeleteAction(record.id)}
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: query.page,
    pageSize: query.pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t) => `共 ${t} 条`,
    onChange: (nextPage, nextSize) => {
      updateQuery({ page: nextPage, pageSize: nextSize });
    },
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
        <Input.Search
          allowClear
          placeholder="搜索文档标题"
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          onSearch={(value) => {
            setKeywordInput(value);
            updateQuery({ page: 1, keyword: value.trim() });
          }}
          style={{ width: 260 }}
        />
        <Button type="primary" onClick={openUpload}>
          上传文档
        </Button>
      </Space>

      <Table<DocumentEntity>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        scroll={{ x: 960 }}
      />

      <Modal
        title="上传文档"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        onOk={() => void handleUpload()}
        confirmLoading={uploading}
        destroyOnHidden
        okText="上传并解析"
        cancelText="取消"
      >
        <Form form={uploadForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="file"
            label="文件"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              {
                required: true,
                validator: async (_, fileList?: UploadFile[]) => {
                  if (!fileList?.length || !fileList[0]?.originFileObj) {
                    return Promise.reject(new Error('请先选择文件'));
                  }
                },
              },
            ]}
          >
            <Upload.Dragger
              accept={DOCUMENT_UPLOAD_ACCEPT}
              maxCount={1}
              beforeUpload={(file) => {
                const maxBytes = DOCUMENT_UPLOAD_MAX_MB * 1024 * 1024;
                if (file.size > maxBytes) {
                  message.error(`文件不能超过 ${DOCUMENT_UPLOAD_MAX_MB}MB`);
                  return Upload.LIST_IGNORE;
                }
                const ext = file.name.split('.').pop()?.toLowerCase();
                if (!isSupportedDocumentExt(ext)) {
                  message.error(`仅支持 ${DOCUMENT_UPLOAD_HINT} 文件`);
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处</p>
              <p className="ant-upload-hint">
                支持 {DOCUMENT_UPLOAD_HINT}，最大 {DOCUMENT_UPLOAD_MAX_MB}MB
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="可选，多个标签可用逗号分隔" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={detail?.title || '文档详情'}
        width={720}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        destroyOnHidden
        extra={
          detail ? (
            <Space>
              {renderPublishAction(detail.id, detail.status, { drawer: true })}
              {renderDeleteAction(detail.id, { drawer: true })}
            </Space>
          ) : null
        }
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
              {detail.tags ? (
                <Typography.Text type="secondary">标签：{detail.tags}</Typography.Text>
              ) : null}
            </Space>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              创建于 {detail.createdAt ? dayjs(detail.createdAt).format('YYYY-MM-DD HH:mm') : '—'}
              {detail.publishTime
                ? ` · 发布于 ${dayjs(detail.publishTime).format('YYYY-MM-DD HH:mm')}`
                : ''}
            </Typography.Paragraph>
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
