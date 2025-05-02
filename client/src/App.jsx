// client/src/App.jsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SignIn            from './pages/SignIn';
import Dashboard         from './pages/Dashboard';
import UserLayout        from './layout/UserLayout';
import CreateRequisition from './pages/User/CreateRequisition';
import UserRequisitions  from './pages/User/UserRequisitions';
import UserLpos          from './pages/User/UserLpos';

import AdminLayout        from './layout/AdminLayout';
import AdminDashboard     from './pages/admin/AdminDashboard';
import CreateLpo          from './pages/admin/CreateLpo';
import ViewLposAdmin      from './pages/admin/ViewLpos';
import ViewReqsAdmin      from './pages/admin/ViewRequisitions';
import ManageUsers        from './pages/admin/ManageUsers';

// Protects routes that require login (and optionally admin-only)
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
        {/* 1) Public */}
        <Route path="/" element={<SignIn />} />

        {/* 2) User area */}
        <Route element={<PrivateRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/requisitions"        element={<UserRequisitions />} />
            <Route path="/requisitions/new"    element={<CreateRequisition />} />
            <Route path="/lpos"                element={<UserLpos />} />
          </Route>
        </Route>

        {/* 3) Admin area */}
        <Route element={<PrivateRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index                       element={<AdminDashboard />} />
            <Route path="create-lpo"          element={<CreateLpo />} />
            <Route path="view-lpos"           element={<ViewLposAdmin />} />
            <Route path="view-requisitions"   element={<ViewReqsAdmin />} />
            <Route path="users"               element={<ManageUsers />} />
          </Route>
        </Route>

        {/* 4) Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
