import { InboxOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Upload, message } from 'antd';
import type { FormInstance } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';

import {
  DOCUMENT_UPLOAD_ACCEPT,
  DOCUMENT_UPLOAD_HINT,
  DOCUMENT_UPLOAD_MAX_MB,
  isSupportedDocumentExt,
} from '@/constants/document';

import type { UploadFormValues } from './types';

function normFile(e: { fileList: UploadFile[] } | UploadFile[]) {
  if (Array.isArray(e)) return e;
  return e?.fileList ?? [];
}

type Props = {
  open: boolean;
  confirmLoading: boolean;
  form: FormInstance<UploadFormValues>;
  onCancel: () => void;
  onOk: () => void;
};

export default function UploadModal({ open, confirmLoading, form, onCancel, onOk }: Props) {
  return (
    <Modal
      title="上传文档"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={confirmLoading}
      destroyOnHidden
      okText="上传并解析"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
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
  );
}
