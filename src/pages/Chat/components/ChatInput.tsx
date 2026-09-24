import { Button, Input, InputNumber, Space, Tooltip } from 'antd';

import styles from './ChatInput.module.scss';

type Props = {
  value: string;
  topK: number;
  searchOnly: boolean;
  busy: boolean;
  onChange: (value: string) => void;
  onTopKChange: (value: number) => void;
  onSearchOnlyChange: (value: boolean) => void;
  onSend: () => void;
};

export default function ChatInput({
  value,
  topK,
  searchOnly,
  busy,
  onChange,
  onTopKChange,
  onSearchOnlyChange,
  onSend,
}: Props) {
  return (
    <div className={styles.bar}>
      <Space.Compact block className={styles.compact}>
        <Input
          autoFocus
          size="large"
          value={value}
          disabled={busy}
          allowClear
          placeholder="向知识库提问，例如：文档发布需要哪些步骤？"
          onChange={(e) => onChange(e.target.value)}
          onPressEnter={onSend}
        />
        <Tooltip title="混合检索召回条数（1-10）">
          <InputNumber
            min={1}
            max={10}
            size="large"
            className={styles.topK}
            value={topK}
            disabled={busy}
            onChange={(next) => onTopKChange(typeof next === 'number' ? next : 5)}
          />
        </Tooltip>
        <Button
          size="large"
          type={searchOnly ? 'primary' : 'default'}
          disabled={busy}
          onClick={() => onSearchOnlyChange(!searchOnly)}
        >
          仅检索
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={busy || !value.trim()}
          loading={busy}
          onClick={onSend}
        >
          发送
        </Button>
      </Space.Compact>
    </div>
  );
}
