import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ApartmentOutlined,
  AuditOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

import { RoleCode } from '@/constants/roles';
import { getUserInfo } from '@/utils/auth';

import styles from './index.module.scss';

type QuickEntry = {
  key: string;
  path: string;
  title: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
};

const FEATURES = [
  {
    title: '多维检索',
    description: '支持关键词、语义向量与图谱子图联合查询，快速定位所需知识。',
  },
  {
    title: '知识图谱',
    description: '自动抽取实体与关系，以力导向图可视化呈现文档之间的知识网络。',
  },
  {
    title: '文档协同',
    description: '覆盖上传解析、审核发布与权限管控，保障知识资产规范流转。',
  },
] as const;

function getGreeting() {
  const hour = dayjs().hour();
  if (hour < 12) return '早上好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

export default function HomePage() {
  const navigate = useNavigate();
  const user = getUserInfo();
  const displayName = user?.realName || user?.username || '用户';
  const canReview = Boolean(
    user?.roles?.includes(RoleCode.ADMIN) || user?.roles?.includes(RoleCode.REVIEWER),
  );

  const quickEntries = useMemo<QuickEntry[]>(() => {
    const entries: QuickEntry[] = [
      {
        key: 'search',
        path: '/search',
        title: '文档检索',
        description: '关键词 · 语义 · 图谱',
        icon: <FileSearchOutlined />,
        iconClass: styles.iconBlue,
      },
      {
        key: 'graph',
        path: '/graph',
        title: '知识图谱',
        description: '实体关系全景浏览',
        icon: <ApartmentOutlined />,
        iconClass: styles.iconPurple,
      },
      {
        key: 'documents',
        path: '/documents',
        title: '文档管理',
        description: '上传编辑与发布',
        icon: <FileTextOutlined />,
        iconClass: styles.iconGreen,
      },
    ];

    if (canReview) {
      entries.push({
        key: 'reviews',
        path: '/reviews',
        title: '文档审核',
        description: '处理待审提交',
        icon: <AuditOutlined />,
        iconClass: styles.iconOrange,
      });
    }

    entries.push({
      key: 'system',
      path: '/system/users',
      title: '系统管理',
      description: '用户与角色权限',
      icon: <SettingOutlined />,
      iconClass: styles.iconCyan,
    });

    return entries;
  }, [canReview]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Typography.Title level={3} className={styles.heroTitle}>
          {getGreeting()}，{displayName}
        </Typography.Title>
        <Typography.Paragraph className={styles.heroDesc}>
          在这里集中管理文档资产、探索知识关联，并通过检索与图谱快速找到答案。
        </Typography.Paragraph>
      </section>

      <section className={styles.section}>
        <Typography.Title level={5} className={styles.sectionTitle}>
          快捷入口
        </Typography.Title>
        <div className={styles.shortcutRow}>
          {quickEntries.map((item) => (
            <button
              key={item.key}
              type="button"
              className={styles.shortcutCard}
              onClick={() => navigate(item.path)}
            >
              <span className={`${styles.shortcutIcon} ${item.iconClass}`}>{item.icon}</span>
              <span className={styles.shortcutName}>{item.title}</span>
              <span className={styles.shortcutDesc}>{item.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Typography.Title level={5} className={styles.sectionTitle}>
          平台能力
        </Typography.Title>
        <div className={styles.featureGrid}>
          {FEATURES.map((item) => (
            <article key={item.title} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{item.title}</h3>
              <p className={styles.featureDesc}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
