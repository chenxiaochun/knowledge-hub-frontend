import { useCallback, useEffect, useState } from 'react';

import { ReloadOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import dayjs from 'dayjs';

import DocumentDetailDrawer from '@/components/DocumentDetailDrawer';
import { getDocumentStatusMeta } from '@/constants/document';
import { RoleCode } from '@/constants/roles';
import {
  getApiDocumentId,
  getApiDocumentReviewsPending,
  putApiDocumentReviewsReviewIdApprove,
  putApiDocumentReviewsReviewIdReject,
  type DocumentReviewEntity,
} from '@/service/api';
import type { DocumentDetail } from '@/types/document';
import { getUserInfo } from '@/utils/auth';

type RejectFormValues = {
  comment: string;
};

export default function ReviewsPage() {
  const user = getUserInfo();
  const canReview = Boolean(
    user?.roles?.includes(RoleCode.ADMIN) || user?.roles?.includes(RoleCode.REVIEWER),
  );

  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [data, setData] = useState<DocumentReviewEntity[]>([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReviewId, setRejectReviewId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getApiDocumentReviewsPending();
      setData(Array.isArray(res) ? res : []);
    } catch {
      // 错误已由拦截器提示
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canReview) void fetchList();
  }, [canReview, fetchList]);

  const openDocument = async (documentId: string) => {
    setDetailOpen(true);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = (await getApiDocumentId({ path: { id: documentId } })) as DocumentDetail;
      setDetail(res);
    } catch {
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActingId(reviewId);
    try {
      await putApiDocumentReviewsReviewIdApprove({
        path: { reviewId },
        body: { comment: '' },
      } as Parameters<typeof putApiDocumentReviewsReviewIdApprove>[0]);
      message.success('已通过审核并发布');
      await fetchList();
    } catch {
      // 错误已由拦截器提示
    } finally {
      setActingId(null);
    }
  };

  const openReject = (reviewId: string) => {
    setRejectReviewId(reviewId);
    rejectForm.resetFields();
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectReviewId) return;
    let values: RejectFormValues;
    try {
      values = await rejectForm.validateFields();
    } catch {
      return;
    }
    setActingId(rejectReviewId);
    try {
      await putApiDocumentReviewsReviewIdReject({
        path: { reviewId: rejectReviewId },
        body: { comment: values.comment.trim() },
      } as Parameters<typeof putApiDocumentReviewsReviewIdReject>[0]);
      message.success('已驳回，文档回到草稿');
      setRejectOpen(false);
      await fetchList();
    } catch {
      // 错误已由拦截器提示
    } finally {
      setActingId(null);
    }
  };

  if (!canReview) {
    return <Typography.Text type="secondary">当前账号无文档审核权限</Typography.Text>;
  }

  const columns: ColumnsType<DocumentReviewEntity> = [
    {
      title: '文档 ID',
      dataIndex: 'documentId',
      ellipsis: true,
      render: (id: string) => (
        <Button type="link" style={{ paddingInline: 0 }} onClick={() => void openDocument(id)}>
          {id}
        </Button>
      ),
    },
    {
      title: '提交前状态',
      dataIndex: 'beforeStatus',
      width: 120,
      render: (status: number) => {
        const meta = getDocumentStatusMeta(status);
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: '提交时间',
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
        <Space size={8} wrap>
          <Button size="small" onClick={() => void openDocument(record.documentId)}>
            查看文档
          </Button>
          <Popconfirm
            title="确认通过该文档审核？"
            description="通过后将正式发布"
            okText="通过"
            cancelText="取消"
            onConfirm={() => void handleApprove(record.id)}
          >
            <Button size="small" type="primary" loading={actingId === record.id}>
              通过
            </Button>
          </Popconfirm>
          <Button size="small" danger onClick={() => openReject(record.id)}>
            驳回
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-end' }}>
        <Button icon={<ReloadOutlined spin={loading} />} onClick={() => void fetchList()}>
          刷新
        </Button>
      </Space>

      <Table<DocumentReviewEntity>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 800 }}
        locale={{ emptyText: '暂无待审核文档' }}
      />

      <Modal
        title="驳回审核"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={() => void handleReject()}
        confirmLoading={Boolean(rejectReviewId && actingId === rejectReviewId)}
        destroyOnHidden
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item
            name="comment"
            label="驳回意见"
            rules={[{ required: true, message: '请填写驳回意见' }]}
          >
            <Input.TextArea rows={4} placeholder="请说明驳回原因" />
          </Form.Item>
        </Form>
      </Modal>

      <DocumentDetailDrawer
        open={detailOpen}
        loading={detailLoading}
        detail={detail}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
