import type { ReactNode } from 'react';

import { Card, Typography } from 'antd';

import loginHero from '@/assets/login-hero.png';

import styles from './index.module.scss';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className={styles.page}>
      <section className={styles.brand}>
        <div className={styles.brandInner}>
          <h1 className={styles.brandTitle}>企业智能知识库系统</h1>
          <p className={styles.brandDesc}>
            构建企业知识中枢，赋能智能决策与高效协作
            <br />
            让知识管理更简单，知识价值最大化
          </p>
          <img className={styles.brandHero} src={loginHero} alt="" draggable={false} />
        </div>
      </section>

      <section className={styles.panel}>
        <Card className={styles.card} styles={{ body: { padding: '40px 36px' } }}>
          <h2 className={styles.cardTitle}>{title}</h2>
          <Typography.Text className={styles.cardSubtitle}>{subtitle}</Typography.Text>
          {children}
        </Card>
      </section>
    </div>
  );
}
