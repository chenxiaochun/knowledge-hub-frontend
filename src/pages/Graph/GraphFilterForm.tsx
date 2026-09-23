import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Select, Space } from 'antd';
import type { FormInstance } from 'antd';

import { DEFAULT_FILTER_VALUES } from './constants';
import styles from './GraphFilterForm.module.scss';
import type { GraphFilterFormValues } from './types';

type EntityTypeOption = {
  label: string;
  value: string;
};

type Props = {
  form: FormInstance<GraphFilterFormValues>;
  loading: boolean;
  entityTypeOptions: EntityTypeOption[];
  onFinish: (values: GraphFilterFormValues) => void;
  onReset: () => void;
};

export default function GraphFilterForm({
  form,
  loading,
  entityTypeOptions,
  onFinish,
  onReset,
}: Props) {
  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form
      form={form}
      className={styles.toolbar}
      layout="inline"
      initialValues={DEFAULT_FILTER_VALUES}
      onFinish={onFinish}
    >
      <Form.Item name="keyword" className={styles.keywordField}>
        <Input
          allowClear
          placeholder="搜索节点、文档或标签"
          prefix={<SearchOutlined />}
          onPressEnter={() => form.submit()}
        />
      </Form.Item>
      <Form.Item name="entityType" className={styles.entityTypeField}>
        <Select allowClear placeholder="实体类型" options={entityTypeOptions} />
      </Form.Item>
      <Form.Item name="dateRange" className={styles.dateRangeField}>
        <DatePicker.RangePicker />
      </Form.Item>
      <Form.Item className={styles.toolbarActions}>
        <Space>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
