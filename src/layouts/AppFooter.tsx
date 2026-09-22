import { Col, Row, Space, Typography } from 'antd';

import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';

import styles from './AppFooter.module.scss';

const CURRENT_YEAR = new Date().getFullYear();

type FooterLink = {
  label: string;
  path: string;
};

type Props = {
  links: FooterLink[];
};

export default function AppFooter({ links }: Props) {
  const navigate = useNavigate();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Row gutter={[48, 32]}>
          <Col xs={24} md={10} lg={9}>
            <Space size={10} align="center" className={styles.brand}>
              <Logo size={32} className={styles.brandIcon} />
              <div>
                <Typography.Title level={4} className={styles.brandTitle}>
                  智能知识库
                </Typography.Title>
                <Typography.Paragraph className={styles.brandDesc}>
                  面向企业内部知识沉淀与智能检索的统一平台，覆盖全文检索、语义检索与知识图谱能力，
                  支撑文档全生命周期管理与合规审核。
                </Typography.Paragraph>
              </div>
            </Space>
          </Col>

          <Col xs={12} md={7} lg={5}>
            <div className={styles.sectionTitle}>功能导航</div>
            <ul className={styles.linkList}>
              {links.map((item) => (
                <li key={item.path}>
                  <button type="button" className={styles.linkBtn} onClick={() => navigate(item.path)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={12} md={7} lg={5}>
            <div className={styles.sectionTitle}>平台能力</div>
            <ul className={styles.linkList}>
              <li>文档上传与结构化解析</li>
              <li>多模态智能检索</li>
              <li>审核发布与归档流转</li>
              <li>角色权限统一管控</li>
            </ul>
          </Col>

          <Col xs={24} lg={5}>
            <div className={styles.sectionTitle}>服务说明</div>
            <ul className={styles.linkList}>
              <li>仅限内部授权账号访问</li>
              <li>操作行为受权限策略约束</li>
              <li>文档数据按企业规范保管</li>
            </ul>
          </Col>
        </Row>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <Typography.Text className={styles.copy}>
            © {CURRENT_YEAR} 智能知识库 · Knowledge Hub. All rights reserved.
          </Typography.Text>
          <Typography.Text className={styles.copy}>企业内部知识管理系统</Typography.Text>
        </div>
      </div>
    </footer>
  );
}
