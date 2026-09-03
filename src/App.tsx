import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import HomePage from '@/pages/Home';
import UsersPage from '@/pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BasicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
