// client/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import SignIn          from './pages/SignIn';
import Dashboard       from './pages/Dashboard';

import AdminLayout     from './layout/AdminLayout';
import AdminDashboard  from './pages/admin/AdminDashboard';
import CreateLpo       from './pages/admin/CreateLpo';
import ViewLpos        from './pages/admin/ViewLpos';
import ViewRequisitions from './pages/admin/ViewRequisitions';
import ManageUsers     from './pages/admin/ManageUsers';

// Protects routes that require login (and optional admin-only)
function PrivateRoute({ adminOnly = false }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default function App() {
  return (
    <>
    
      <Routes>
        {/* 1) Root always shows SignIn */}
        <Route path="/" element={<SignIn />} />

        {/* 2) Logged-in users see Dashboard */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* 3) Admin panel */}
        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Only one index → AdminDashboard */}
            <Route index element={<AdminDashboard />} />

            {/* Other admin pages */}
            <Route path="create-lpo"        element={<CreateLpo />} />
            <Route path="view-lpos"         element={<ViewLpos />} />
            <Route path="view-requisitions" element={<ViewRequisitions />} />
            <Route path="users"             element={<ManageUsers />} />
          </Route>
        </Route>

        {/* 4) Anything else → back to SignIn */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
