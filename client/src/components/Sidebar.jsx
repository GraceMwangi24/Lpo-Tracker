import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Create LPO', path: '/admin/create-lpo' },
  { label: 'Manage Users', path: '/admin/manage-users' },
  { label: 'View LPOs', path: '/admin/lpos' },
  { label: 'View Requisitions', path: '/admin/requisitions' }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-2xl font-bold mb-8 text-center">Admin</h2>
      <nav className="space-y-4">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? 'bg-gray-700' : ''
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
