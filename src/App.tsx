import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AuthGuard from '@/components/AuthGuard';
import BasicLayout from '@/layouts/BasicLayout';
import DocumentsPage from '@/pages/Documents';
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';
import RbacPage from '@/pages/Rbac';
import RegisterPage from '@/pages/Register';
import ReviewsPage from '@/pages/Reviews';
import SearchPage from '@/pages/Search';
import SystemPage from '@/pages/System';
import UsersPage from '@/pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<BasicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
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
    </BrowserRouter>
  );
}
