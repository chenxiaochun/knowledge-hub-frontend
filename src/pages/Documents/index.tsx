import { useCallback, useEffect, useRef, useState } from 'react';

import { Button, Form, Input, Space, Table, Tag, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

import dayjs from 'dayjs';

import type { RequestOption } from '@/utils/request';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { canEditContent, getDocumentStatusMeta } from '@/constants/document';
import { RoleCode } from '@/constants/roles';
import {
  deleteApiDocumentId,
  getApiDocument,
  getApiDocumentId,
  postApiDocumentUploadParse,
  putApiDocumentId,
  putApiDocumentIdArchive,
  putApiDocumentIdSaveAsDraft,
  putApiDocumentIdSubmitReview,
  type DocumentEntity,
} from '@/service/api';
import type { DocumentDetail } from '@/types/document';
import { getUserInfo } from '@/utils/auth';

import DocumentActions from './DocumentActions';
import EditModal from './EditModal';
import type { EditFormValues, ListQuery, UploadFormValues } from './types';
import UploadModal from './UploadModal';

export default function DocumentsPage() {
  const user = getUserInfo();
  const isAdmin = Boolean(user?.roles?.includes(RoleCode.ADMIN));

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<DocumentEntity[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState<ListQuery>({ page: 1, pageSize: 10, keyword: '' });
  const [keywordInput, setKeywordInput] = useState('');
  const requestSeq = useRef(0);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadForm] = Form.useForm<UploadFormValues>();
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm<EditFormValues>();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const fetchList = useCallback(async (next: ListQuery) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await getApiDocument({
        query: {
          page: next.page,
          pageSize: next.pageSize,
          keyword: next.keyword || undefined,
        },
      });
      if (seq !== requestSeq.current) return;
      const pageRes = res as { list?: DocumentEntity[]; total?: number };
      setData(pageRes.list ?? []);
      setTotal(pageRes.total ?? 0);
    } catch {
      // 错误已由拦截器提示
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList(query);
  }, [fetchList, query]);

  const updateQuery = (patch: Partial<ListQuery>) => {
    setQuery((prev) => ({ ...prev, ...patch }));
  };

  const refreshDetail = async (id: string) => {
    const res = (await getApiDocumentId({ path: { id } })) as DocumentDetail;
    setDetail(res);
    return res;
  };

  const openDetail = async (id: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      await refreshDetail(id);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
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

  const openEdit = async (id: string) => {
    try {
      const res = detail?.id === id ? detail : await refreshDetail(id);
      if (!canEditContent(res.status)) {
        message.warning('当前状态不可编辑');
        return;
      }
      editForm.setFieldsValue({
        title: res.title,
        tags: res.tags ?? undefined,
        content: res.content ?? '',
      });
      setEditOpen(true);
    } catch {
      // 错误已由拦截器提示
    }
  };

  const handleEditSave = async () => {
    if (!detail) return;
    let values: EditFormValues;
    try {
      values = await editForm.validateFields();
    } catch {
      return;
    }
    setEditing(true);
    try {
      await putApiDocumentId({
        path: { id: detail.id },
        body: {
          title: values.title.trim(),
          content: values.content,
          tags: values.tags?.trim() || undefined,
        },
      });
      message.success('文档已保存');
      setEditOpen(false);
      await fetchList(query);
      await refreshDetail(detail.id);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setEditing(false);
    }
  };

  const handleSubmitReview = async (id: string) => {
    setSubmittingId(id);
    try {
      await putApiDocumentIdSubmitReview({ path: { id } });
      message.success('已提交审核');
      await fetchList(query);
      if (detail?.id === id) await refreshDetail(id);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setSubmittingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setArchivingId(id);
    try {
      await putApiDocumentIdArchive({ path: { id } });
      message.success('文档已归档');
      await fetchList(query);
      if (detail?.id === id) await refreshDetail(id);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setArchivingId(null);
    }
  };

  const handleSaveAsDraft = async (id: string) => {
    setDraftingId(id);
    try {
      await putApiDocumentIdSaveAsDraft({ path: { id } });
      message.success('已转为草稿');
      await fetchList(query);
      if (detail?.id === id) await refreshDetail(id);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setDraftingId(null);
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

  const actionProps = {
    isAdmin,
    submittingId,
    archivingId,
    draftingId,
    deletingId,
    onEdit: (id: string) => void openEdit(id),
    onSubmitReview: (id: string) => void handleSubmitReview(id),
    onArchive: (id: string) => void handleArchive(id),
    onSaveAsDraft: (id: string) => void handleSaveAsDraft(id),
    onDelete: (id: string) => void handleDelete(id),
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
      width: 140,
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
      width: 170,
      render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <DocumentActions record={record} onDetail={(id) => void openDetail(id)} {...actionProps} />
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: query.page,
    pageSize: query.pageSize,
    total,
    showSizeChanger: true,
    showTotal: (t) => `共 ${t} 条`,
    onChange: (nextPage, nextSize) => updateQuery({ page: nextPage, pageSize: nextSize }),
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
        <Button
          type="primary"
          onClick={() => {
            uploadForm.resetFields();
            setUploadOpen(true);
          }}
        >
          上传文档
        </Button>
      </Space>

      <Table<DocumentEntity>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        scroll={{ x: 1080 }}
      />

      <UploadModal
        open={uploadOpen}
        confirmLoading={uploading}
        form={uploadForm}
        onCancel={() => setUploadOpen(false)}
        onOk={() => void handleUpload()}
      />

      <EditModal
        open={editOpen}
        confirmLoading={editing}
        form={editForm}
        onCancel={() => setEditOpen(false)}
        onOk={() => void handleEditSave()}
      />

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
        extra={detail ? <DocumentActions record={detail} drawer {...actionProps} /> : null}
      />
    </div>
  );
}
