import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  ApartmentOutlined,
  AuditOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Layout, Menu, Space, theme, Typography } from 'antd';
import type { MenuProps } from 'antd';

import Logo from '@/components/Logo';
import { RoleCode } from '@/constants/roles';
import { postApiAuthLogout } from '@/service/api';
import { clearAuth, getUserInfo } from '@/utils/auth';

import AppFooter from './AppFooter';

const { Header, Content } = Layout;

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();
  const canReview = Boolean(
    user?.roles?.includes(RoleCode.ADMIN) || user?.roles?.includes(RoleCode.REVIEWER),
  );
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const headerBg = '#003eb3';
  const headerText = 'rgba(255, 255, 255, 0.95)';
  const headerMuted = 'rgba(255, 255, 255, 0.78)';

  const menuItems = useMemo<MenuProps['items']>(
    () => [
      { key: '/', icon: <HomeOutlined />, label: '工作台' },
      { key: '/search', icon: <FileSearchOutlined />, label: '文档检索' },
      { key: '/graph', icon: <ApartmentOutlined />, label: '知识图谱' },
      { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
      ...(canReview ? [{ key: '/reviews', icon: <AuditOutlined />, label: '文档审核' }] : []),
      { key: '/system', icon: <SettingOutlined />, label: '系统管理' },
    ],
    [canReview],
  );

  const footerLinks = useMemo(
    () => [
      { label: '工作台', path: '/' },
      { label: '文档检索', path: '/search' },
      { label: '知识图谱', path: '/graph' },
      { label: '文档管理', path: '/documents' },
      ...(canReview ? [{ label: '文档审核', path: '/reviews' }] : []),
      { label: '系统管理', path: '/system/users' },
    ],
    [canReview],
  );

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/search')) return ['/search'];
    if (location.pathname.startsWith('/graph')) return ['/graph'];
    if (location.pathname.startsWith('/documents')) return ['/documents'];
    if (location.pathname.startsWith('/reviews')) return ['/reviews'];
    if (
      location.pathname.startsWith('/system') ||
      location.pathname.startsWith('/users') ||
      location.pathname.startsWith('/rbac')
    ) {
      return ['/system'];
    }
    return ['/'];
  }, [location.pathname]);

  const displayName = user?.realName || user?.username || '用户';

  const onLogout = async () => {
    try {
      await postApiAuthLogout();
    } catch {
      // 即使 logout 接口失败也清理本地凭证
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        void onLogout();
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          paddingInline: 24,
          background: headerBg,
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.28)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Space
          size={8}
          align="center"
          style={{ flexShrink: 0, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Logo size={28} />
          <Typography.Text
            strong
            style={{ fontSize: 16, whiteSpace: 'nowrap', color: headerText }}
          >
            智能知识库
          </Typography.Text>
        </Space>

        <Menu
          theme="dark"
          mode="horizontal"
          className="layout-header-menu"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => {
            if (key === '/system') {
              navigate('/system/users');
              return;
            }
            if (key.startsWith('/')) navigate(key);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            borderBottom: 'none',
            background: 'transparent',
            color: headerMuted,
          }}
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ flexShrink: 0, cursor: 'pointer', color: headerText }}>
            <UserOutlined />
            <Typography.Text style={{ color: headerText }}>{displayName}</Typography.Text>
          </Space>
        </Dropdown>
      </Header>

      <Content
        style={{
          margin: 24,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: 24,
            flex: 1,
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </div>
      </Content>

      <AppFooter links={footerLinks} />
    </Layout>
  );
}
