import { Button, Input, InputNumber, Space, Tooltip } from 'antd';

import styles from './ChatInput.module.scss';

const { TextArea } = Input;

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
      <TextArea
        value={value}
        disabled={busy}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder="例如：上线前如何做金丝雀验证？"
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={(e) => {
          if (e.shiftKey) return;
          e.preventDefault();
          onSend();
        }}
      />
      <div className={styles.actions}>
        <Space size={8}>
          <Tooltip title="混合检索召回条数（1-10）">
            <InputNumber
              min={1}
              max={10}
              size="small"
              value={topK}
              disabled={busy}
              onChange={(next) => onTopKChange(typeof next === 'number' ? next : 5)}
            />
          </Tooltip>
          <Button
            size="small"
            type={searchOnly ? 'primary' : 'default'}
            ghost={searchOnly}
            disabled={busy}
            onClick={() => onSearchOnlyChange(!searchOnly)}
          >
            仅检索
          </Button>
        </Space>
        <Button type="primary" disabled={busy || !value.trim()} loading={busy} onClick={onSend}>
          发送
        </Button>
      </div>
    </div>
  );
}
