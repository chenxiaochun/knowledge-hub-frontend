import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';

import type { AiSessionEntity } from '@/service/api';

import { formatSessionTime } from '../utils';

import styles from './ChatSidebar.module.scss';

type Props = {
  sessions: AiSessionEntity[];
  activeId?: string;
  busy: boolean;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
};

export default function ChatSidebar({
  sessions,
  activeId,
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

      {sessions.length > 0 ? (
        <div className={styles.list}>
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`${styles.item}${activeId === session.id ? ` ${styles.active}` : ''}${busy ? ` ${styles.disabled}` : ''}`}
              onClick={() => onSelect(session.id)}
            >
              <div className={styles.title}>{session.title}</div>
              <div className={styles.meta}>
                <span>{formatSessionTime(session.updatedAt)}</span>
                <Popconfirm
                  title="确定删除对话？"
                  description="删除后，聊天记录将不可恢复。"
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                  disabled={busy}
                  onConfirm={() => onRemove(session.id)}
                >
                  <span
                    className={styles.delete}
                    role="button"
                    tabIndex={0}
                    aria-label="删除对话"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <DeleteOutlined />
                  </span>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
