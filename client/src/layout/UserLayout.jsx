// client/src/layout/UserLayout.jsx
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const userLinks = [
  { to: '/dashboard',        label: 'Dashboard' },
  { to: '/requisitions/new', label: 'Create Requisition' },
  { to: '/requisitions',     label: 'My Requisitions' },
  { to: '/lpos',             label: 'My LPOs' },
];

export default function UserLayout() {
  const { logout } = useContext(AuthContext);
  const navigate   = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {}
      <nav className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <ul className="flex space-x-6 flex-1">
            {userLinks.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) =>
                    isActive
                      ? 'text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold'
                      : 'text-gray-700 hover:text-blue-600'
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="ml-auto bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
