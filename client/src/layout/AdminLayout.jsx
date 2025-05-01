// client/src/layout/AdminLayout.jsx
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true }); // back to sign-in
  };

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
    }`;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/5 bg-gray-800 text-gray-300 flex-shrink-0">
        <div className="p-4 text-2xl font-bold text-white border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="p-4 space-y-2">
          <NavLink to="/admin/create-lpo"     className={linkClass}>Create LPO</NavLink>
          <NavLink to="/admin/view-lpos"      className={linkClass}>View LPOs</NavLink>
          <NavLink to="/admin/view-requisitions" className={linkClass}>View Requisitions</NavLink>
          <NavLink to="/admin/users"          className={linkClass}>Manage Users</NavLink>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <div className="text-lg font-medium text-gray-800">
            Welcome, Admin {user?.id}
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
