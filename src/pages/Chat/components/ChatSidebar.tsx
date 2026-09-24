import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Empty, Spin } from 'antd';
import type { MouseEvent } from 'react';

import type { AiSessionEntity } from '@/service/api';

import { formatSessionTime } from '../utils';

import styles from './ChatSidebar.module.scss';

type Props = {
  sessions: AiSessionEntity[];
  activeId?: string;
  loading: boolean;
  busy: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string, e: MouseEvent) => void;
};

export default function ChatSidebar({
  sessions,
  activeId,
  loading,
  busy,
  onNew,
  onSelect,
  onRemove,
}: Props) {
  return (
    <aside className={styles.sidebar}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        block
        disabled={busy}
        onClick={onNew}
      >
        新对话
      </Button>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size="small" />
          </div>
        ) : sessions.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有会话" />
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`${styles.item}${activeId === session.id ? ` ${styles.active}` : ''}${busy ? ` ${styles.disabled}` : ''}`}
              onClick={() => onSelect(session.id)}
            >
              <div className={styles.title}>{session.title}</div>
              <div className={styles.meta}>
                <span>{formatSessionTime(session.updatedAt)}</span>
                <DeleteOutlined
                  className={styles.delete}
                  onClick={(e) => onRemove(session.id, e)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
