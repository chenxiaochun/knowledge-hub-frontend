import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Spin } from 'antd';

import AuthGuard from '@/components/AuthGuard';
import ScrollToTop from '@/components/ScrollToTop';
import BasicLayout from '@/layouts/BasicLayout';

const ChatPage = lazy(() => import('@/pages/Chat'));
const DocumentsPage = lazy(() => import('@/pages/Documents'));
const GraphPage = lazy(() => import('@/pages/Graph'));
const HomePage = lazy(() => import('@/pages/Home'));
const LoginPage = lazy(() => import('@/pages/Login'));
const RbacPage = lazy(() => import('@/pages/Rbac'));
const RegisterPage = lazy(() => import('@/pages/Register'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmail'));
const ReviewsPage = lazy(() => import('@/pages/Reviews'));
const SearchPage = lazy(() => import('@/pages/Search'));
const SystemPage = lazy(() => import('@/pages/System'));
const UsersPage = lazy(() => import('@/pages/Users'));

function PageFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<BasicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="graph" element={<GraphPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="system" element={<SystemPage />}>
                <Route index element={<Navigate to="users" replace />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="rbac" element={<RbacPage />} />
              </Route>
              <Route path="users" element={<Navigate to="/system/users" replace />} />
              <Route path="rbac" element={<Navigate to="/system/rbac" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
