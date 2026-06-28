import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import Library from './features/library/Library';
import UploadPage from './features/upload/Upload';
import Bookmarks from './features/bookmarks/Bookmarks';
import Profile from './features/profile/Profile';
import Settings from './features/settings/Settings';
import Reader from './features/reader/Reader';
import NotFound from './features/NotFound';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Private Vault routes enclosed in Auth Guards */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reader" element={<Reader />} />
        </Route>

        {/* Catch-all 404 route */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
