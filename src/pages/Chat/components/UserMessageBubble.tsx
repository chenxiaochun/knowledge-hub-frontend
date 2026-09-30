import { CopyOutlined, EditOutlined } from '@ant-design/icons';
import { Actions, Bubble } from '@ant-design/x';

import styles from './UserMessageBubble.module.scss';

type Props = {
  text: string;
  onRefill: (text: string) => void;
};

export default function UserMessageBubble({ text, onRefill }: Props) {
  const trimmed = text.trim();
  const showActions = trimmed.length > 0;

  return (
    <Bubble
      placement="end"
      variant="filled"
      rootClassName={styles.root}
      content={text}
      footer={
        showActions ? (
          <Actions
            variant="borderless"
            items={[
              {
                key: 'copy',
                label: '复制',
                actionRender: () => (
                  <Actions.Copy text={trimmed} icon={<CopyOutlined />} />
                ),
              },
              {
                key: 'refill',
                label: '回填到输入框',
                icon: <EditOutlined />,
                onItemClick: () => onRefill(trimmed),
              },
            ]}
          />
        ) : null
      }
    />
  );
}
