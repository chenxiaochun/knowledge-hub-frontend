import { Button, Popconfirm, Space } from 'antd';

import type { DocumentEntity } from '@/service/api';

import {
  canArchive,
  canEditContent,
  canSaveAsDraft,
  canSubmitReview,
  DocumentStatus,
} from '@/constants/document';

type Props = {
  record: DocumentEntity;
  isAdmin: boolean;
  drawer?: boolean;
  submittingId: string | null;
  archivingId: string | null;
  draftingId: string | null;
  deletingId: string | null;
  onDetail?: (id: string) => void;
  onEdit: (id: string) => void;
  onSubmitReview: (id: string) => void;
  onArchive: (id: string) => void;
  onSaveAsDraft: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function DocumentActions({
  record,
  isAdmin,
  drawer = false,
  submittingId,
  archivingId,
  draftingId,
  deletingId,
  onDetail,
  onEdit,
  onSubmitReview,
  onArchive,
  onSaveAsDraft,
  onDelete,
}: Props) {
  return (
    <Space size={8} wrap>
      {!drawer && onDetail ? (
        <Button size="small" onClick={() => onDetail(record.id)}>
          详情
        </Button>
      ) : null}
      {canEditContent(record.status) ? (
        <Button size="small" onClick={() => onEdit(record.id)}>
          编辑
        </Button>
      ) : null}
      {canSubmitReview(record.status) ? (
        <Popconfirm
          title={
            record.status === DocumentStatus.Archived ? '确认重新发布？' : '确认提交审核？'
          }
          description={
            record.status === DocumentStatus.Published
              ? '已发布文档提交后将先下架，待审核通过后再发布'
              : record.status === DocumentStatus.Archived
                ? '将进入待审核，通过后重新发布'
                : '提交后进入待审核状态'
          }
          okText={record.status === DocumentStatus.Archived ? '重新发布' : '提交'}
          cancelText="取消"
          onConfirm={() => onSubmitReview(record.id)}
        >
          <Button size="small" type="primary" loading={submittingId === record.id}>
            {record.status === DocumentStatus.Archived ? '重新发布' : '提交审核'}
          </Button>
        </Popconfirm>
      ) : null}
      {isAdmin && canArchive(record.status) ? (
        <Popconfirm
          title="确认归档该文档？"
          okText="归档"
          cancelText="取消"
          onConfirm={() => onArchive(record.id)}
        >
          <Button size="small" loading={archivingId === record.id}>
            归档
          </Button>
        </Popconfirm>
      ) : null}
      {canSaveAsDraft(record.status) ? (
        <Popconfirm
          title="确认转为草稿？"
          description="将从检索索引中下架"
          okText="转草稿"
          cancelText="取消"
          onConfirm={() => onSaveAsDraft(record.id)}
        >
          <Button size="small" loading={draftingId === record.id}>
            转草稿
          </Button>
        </Popconfirm>
      ) : null}
      {isAdmin ? (
        <Popconfirm
          title="确认删除该文档？"
          description="删除后将从列表移除；已发布文档会同步清理检索索引"
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
          onConfirm={() => onDelete(record.id)}
        >
          <Button size="small" danger loading={deletingId === record.id}>
            删除
          </Button>
        </Popconfirm>
      ) : null}
    </Space>
  );
}
