import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/utils/auth';

/** 未登录跳转登录页；已登录渲染子路由 */
export default function AuthGuard() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
