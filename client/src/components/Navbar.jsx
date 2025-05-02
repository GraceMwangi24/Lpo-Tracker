import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <header className="bg-white shadow mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex space-x-6">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                : 'text-gray-700 hover:text-blue-600'
            }
          >
            Dashboard
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-700 hover:text-blue-600'
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
