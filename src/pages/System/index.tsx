import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Tabs } from 'antd';

import { RoleCode } from '@/constants/roles';
import { getUserInfo } from '@/utils/auth';

export default function SystemPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserInfo();
  const isAdmin = Boolean(user?.roles?.includes(RoleCode.ADMIN));

  const activeKey = location.pathname.startsWith('/system/rbac') ? 'rbac' : 'users';

  const tabItems = useMemo(
    () => [
      { key: 'users', label: '用户管理' },
      ...(isAdmin ? [{ key: 'rbac', label: '角色管理' }] : []),
    ],
    [isAdmin],
  );

  useEffect(() => {
    if (!isAdmin && activeKey === 'rbac') {
      navigate('/system/users', { replace: true });
    }
  }, [activeKey, isAdmin, navigate]);

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={(key) => navigate(`/system/${key}`)}
        style={{ marginBottom: 8 }}
      />
      <Outlet />
    </div>
  );
}
