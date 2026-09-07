import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';
import BasicLayout from '@/layouts/BasicLayout';
import DocumentsPage from '@/pages/Documents';
import HomePage from '@/pages/Home';
import LoginPage from '@/pages/Login';
import RbacPage from '@/pages/Rbac';
import SearchPage from '@/pages/Search';
import UsersPage from '@/pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AuthGuard />}>
          <Route element={<BasicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="rbac" element={<RbacPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
