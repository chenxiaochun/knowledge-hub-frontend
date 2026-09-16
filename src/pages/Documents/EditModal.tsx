import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd';

import type { EditFormValues } from './types';

type Props = {
  open: boolean;
  confirmLoading: boolean;
  form: FormInstance<EditFormValues>;
  onCancel: () => void;
  onOk: () => void;
};

export default function EditModal({ open, confirmLoading, form, onCancel, onOk }: Props) {
  return (
    <Modal
      title="编辑文档"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
      destroyOnHidden
      okText="保存"
      cancelText="取消"
      width={720}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input placeholder="文档标题" />
        </Form.Item>
        <Form.Item name="tags" label="标签">
          <Input placeholder="可选，多个标签可用逗号分隔" />
        </Form.Item>
        <Form.Item name="content" label="正文" rules={[{ required: true, message: '请输入正文' }]}>
          <Input.TextArea rows={14} placeholder="文档正文" style={{ fontFamily: 'inherit' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
