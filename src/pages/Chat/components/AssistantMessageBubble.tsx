import { CopyOutlined, LoadingOutlined, SoundOutlined } from '@ant-design/icons';
import { Actions, Bubble } from '@ant-design/x';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import styles from './AssistantMessageBubble.module.scss';

const bubbleStyles = {
  root: { width: '100%', maxWidth: '100%' },
  body: { width: '100%', maxWidth: '100%' },
  content: { width: '100%', maxWidth: '100%' },
} as const;

type Props = {
  messageId: string;
  copyText: string;
  speakText: string;
  speaking: boolean;
  speakLoading?: boolean;
  streaming?: boolean;
  showActions?: boolean;
  onSpeak: (messageId: string, text: string) => void;
  content: ReactNode;
};

export default function AssistantMessageBubble({
  messageId,
  copyText,
  speakText,
  speaking,
  speakLoading = false,
  streaming = false,
  showActions = true,
  onSpeak,
  content,
}: Props) {
  const trimmedCopy = copyText.trim();
  const canAct = showActions && trimmedCopy.length > 0;

  let speakLabel = '朗读回答';
  if (speakLoading) {
    speakLabel = '合成中…';
  } else if (speaking) {
    speakLabel = '朗读中…';
  }

  return (
    <Bubble
      placement="start"
      variant="outlined"
      streaming={streaming}
      rootClassName={clsx(styles.root, speaking && styles.speaking)}
      styles={bubbleStyles}
      content={content}
      footer={
        canAct ? (
          <Actions
            variant="borderless"
            items={[
              {
                key: 'copy',
                label: '复制',
                actionRender: () => (
                  <Actions.Copy text={trimmedCopy} icon={<CopyOutlined />} />
                ),
              },
              {
                key: 'speak',
                label: speakLabel,
                icon: speakLoading ? (
                  <LoadingOutlined spin />
                ) : (
                  <SoundOutlined />
                ),
                onItemClick: () => onSpeak(messageId, speakText),
              },
            ]}
          />
        ) : null
      }
    />
  );
}
