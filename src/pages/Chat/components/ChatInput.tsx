import { useState } from 'react';

import { FileSearchOutlined, SlidersOutlined } from '@ant-design/icons';
import { Button, InputNumber, Popover, Space, Tooltip } from 'antd';
import { Sender } from '@ant-design/x';

import { useBackendSpeechAsr } from '../hooks/useBackendSpeechAsr';

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
  onSpeechSend: (text: string) => void;
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
  onSpeechSend,
  onStop,
}: Props) {
  const { allowSpeech, processing, recording } = useBackendSpeechAsr(onSpeechSend, busy);
  const [topKOpen, setTopKOpen] = useState(false);
  const inputDisabled = busy || processing;

  const footerIconClass = (active: boolean) =>
    active ? `${styles.iconBtn} ${styles.iconBtnActive}` : styles.iconBtn;

  return (
    <div className={styles.bar}>
      <Sender
        className={styles.sender}
        value={value}
        disabled={inputDisabled}
        loading={busy || processing}
        allowSpeech={allowSpeech}
        placeholder="向知识库提问，例如：文档发布需要哪些步骤？"
        submitType="enter"
        onChange={(next) => onChange(next)}
        onSubmit={() => onSend()}
        onCancel={() => onStop?.()}
        suffix={(_, { components: { SendButton, LoadingButton } }) =>
          busy || processing ? <LoadingButton /> : <SendButton />
        }
        footer={(_, { components: { SpeechButton } }) => (
          <Space className={styles.footer} size={4} wrap>
            <Tooltip title={processing ? '语音识别中…' : recording ? '录音中，点击结束' : '语音输入'}>
              <span className={styles.iconBtnWrap}>
                <SpeechButton
                  disabled={inputDisabled}
                  className={footerIconClass(recording || processing)}
                />
              </span>
            </Tooltip>
            <Popover
              trigger="click"
              placement="topLeft"
              open={topKOpen}
              onOpenChange={setTopKOpen}
              title="混合检索召回条数"
              content={
                <InputNumber
                  min={1}
                  max={10}
                  size="small"
                  className={styles.topKInput}
                  value={topK}
                  disabled={inputDisabled}
                  onChange={(next) => onTopKChange(typeof next === 'number' ? next : 5)}
                />
              }
            >
              <Button
                type="text"
                color="primary"
                variant="text"
                icon={<SlidersOutlined />}
                disabled={inputDisabled}
                className={footerIconClass(topKOpen)}
              />
            </Popover>
            <Tooltip title={searchOnly ? '已开启仅检索' : '仅检索'}>
              <span className={styles.iconBtnWrap}>
                <Button
                  type="text"
                  color="primary"
                  variant="text"
                  icon={<FileSearchOutlined />}
                  disabled={inputDisabled}
                  className={footerIconClass(searchOnly)}
                  onClick={() => onSearchOnlyChange(!searchOnly)}
                />
              </span>
            </Tooltip>
            {streaming ? <span className={styles.streamingHint}>生成中，可点击停止</span> : null}
          </Space>
        )}
      />
    </div>
  );
}
