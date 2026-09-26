import { Button, InputNumber, Space, Tooltip } from 'antd';
import { Sender } from '@ant-design/x';

import styles from './ChatInput.module.scss';

type Props = {
  value: string;
  topK: number;
  searchOnly: boolean;
  busy: boolean;
  streaming?: boolean;
  onChange: (value: string) => void;
  onTopKChange: (value: number) => void;
  onSearchOnlyChange: (value: boolean) => void;
  onSend: () => void;
  onStop?: () => void;
};

export default function ChatInput({
  value,
  topK,
  searchOnly,
  busy,
  streaming = false,
  onChange,
  onTopKChange,
  onSearchOnlyChange,
  onSend,
  onStop,
}: Props) {
  return (
    <div className={styles.bar}>
      <Sender
        className={styles.sender}
        value={value}
        disabled={busy}
        loading={busy}
        placeholder="向知识库提问，例如：文档发布需要哪些步骤？"
        submitType="enter"
        onChange={(next) => onChange(next)}
        onSubmit={() => onSend()}
        onCancel={() => onStop?.()}
        footer={() => (
          <Space className={styles.footer} size={8} wrap>
            <Tooltip title="混合检索召回条数（1-10）">
              <InputNumber
                min={1}
                max={10}
                size="small"
                className={styles.topK}
                value={topK}
                disabled={busy}
                onChange={(next) => onTopKChange(typeof next === 'number' ? next : 5)}
              />
            </Tooltip>
            <Button
              size="small"
              type={searchOnly ? 'primary' : 'default'}
              disabled={busy}
              onClick={() => onSearchOnlyChange(!searchOnly)}
            >
              仅检索
            </Button>
            {streaming ? <span className={styles.streamingHint}>生成中，可点击停止</span> : null}
          </Space>
        )}
      />
    </div>
  );
}
