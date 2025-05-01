import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="w-full bg-white shadow flex justify-between items-center px-6 py-3">
      <h1 className="text-xl font-semibold text-gray-800">LPO Tracker Admin Panel</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600">Hello, {user?.name}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
