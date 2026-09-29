import { useState } from 'react';

import { FileSearchOutlined, SlidersOutlined, SoundOutlined } from '@ant-design/icons';
import { Sender } from '@ant-design/x';
import { Button, InputNumber, Popover, Space, Tooltip } from 'antd';

import { useBackendSpeechAsr } from '../hooks/useBackendSpeechAsr';
import styles from './ChatInput.module.scss';
import SpeechWaveOverlay from './SpeechWaveOverlay';

type Props = {
  value: string;
  topK: number;
  searchOnly: boolean;
  ttsEnabled: boolean;
  ttsSpeaking?: boolean;
  busy: boolean;
  streaming?: boolean;
  onChange: (value: string) => void;
  onTopKChange: (value: number) => void;
  onSearchOnlyChange: (value: boolean) => void;
  onTtsEnabledChange: (value: boolean) => void;
  onSend: () => void;
  onSpeechSend: (text: string) => void;
  onStop?: () => void;
};

export default function ChatInput({
  value,
  topK,
  searchOnly,
  ttsEnabled,
  ttsSpeaking = false,
  busy,
  streaming = false,
  onChange,
  onTopKChange,
  onSearchOnlyChange,
  onTtsEnabledChange,
  onSend,
  onSpeechSend,
  onStop,
}: Props) {
  const { allowSpeech, processing, recording, audioLevels, stopRecording } = useBackendSpeechAsr(
    onSpeechSend,
    busy,
  );
  const [topKOpen, setTopKOpen] = useState(false);
  const inputDisabled = busy || processing;
  const speechActive = recording || processing;

  const footerIconClass = (active: boolean) =>
    active ? `${styles.iconBtn} ${styles.iconBtnActive}` : styles.iconBtn;

  return (
    <div className={styles.bar}>
      <div className={`${styles.senderWrap} ${speechActive ? styles.senderWrapActive : ''}`}>
        {speechActive ? (
          <SpeechWaveOverlay
            mode={processing ? 'processing' : 'recording'}
            levels={recording ? audioLevels : undefined}
            onStop={recording ? stopRecording : undefined}
          />
        ) : null}
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
              <Tooltip
                title={
                  processing
                    ? '语音识别中…，Esc 取消'
                    : recording
                      ? '录音中，点击波形或麦克风结束，Esc 取消'
                      : '语音输入'
                }
              >
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
                <Tooltip title="混合检索召回条数" open={topKOpen ? false : undefined}>
                  <span className={styles.iconBtnWrap}>
                    <Button
                      type="text"
                      color="primary"
                      variant="text"
                      icon={<SlidersOutlined />}
                      disabled={inputDisabled}
                      className={footerIconClass(topKOpen)}
                    />
                  </span>
                </Tooltip>
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
              <Tooltip
                title={
                  ttsSpeaking
                    ? '朗读中…'
                    : ttsEnabled
                      ? '已开启朗读'
                      : '朗读回答'
                }
              >
                <span className={styles.iconBtnWrap}>
                  <Button
                    type="text"
                    color="primary"
                    variant="text"
                    icon={<SoundOutlined />}
                    disabled={inputDisabled}
                    className={footerIconClass(ttsEnabled || ttsSpeaking)}
                    onClick={() => onTtsEnabledChange(!ttsEnabled)}
                  />
                </span>
              </Tooltip>
              {streaming ? <span className={styles.streamingHint}>生成中，可点击停止</span> : null}
            </Space>
          )}
        />
      </div>
    </div>
  );
}
