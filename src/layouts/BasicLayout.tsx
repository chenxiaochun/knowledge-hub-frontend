import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  BookOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Dropdown, Layout, Menu, Space, theme, Typography } from 'antd';
import type { MenuProps } from 'antd';

import { RoleCode } from '@/constants/roles';
import { postApiAuthLogout } from '@/service/api';
import { clearAuth, getUserInfo } from '@/utils/auth';

const { Header, Sider, Content } = Layout;

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();
  const isAdmin = Boolean(user?.roles?.includes(RoleCode.ADMIN));
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = useMemo(
    () => [
      { key: '/', icon: <HomeOutlined />, label: '首页' },
      { key: '/search', icon: <FileSearchOutlined />, label: '文档检索' },
      { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
      { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
      ...(isAdmin
        ? [{ key: '/rbac', icon: <SafetyCertificateOutlined />, label: '角色权限' }]
        : []),
    ],
    [isAdmin],
  );

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/search')) return ['/search'];
    if (location.pathname.startsWith('/documents')) return ['/documents'];
    if (location.pathname.startsWith('/users')) return ['/users'];
    if (location.pathname.startsWith('/rbac')) return ['/rbac'];
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={64}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          <BookOutlined style={{ fontSize: 20 }} />
          <span className="layout-brand-text">Knowledge Hub</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            paddingInline: 24,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 500 }}>知识库管理后台</span>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <Typography.Text>{displayName}</Typography.Text>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
