// client/src/pages/SignIn.jsx
import { useState, useContext } from 'react';
import { useNavigate }         from 'react-router-dom';
import { toast }               from 'react-toastify';
import { AuthContext }         from '../context/AuthContext';

// decode the JWT payload
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function SignIn() {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      // login() now returns the JWT string
      const jwt = await login(email, password);
      toast.success('Logged in!');

      // extract the 'sub' claim
      const decoded = decodeToken(jwt);
      const role    = decoded?.sub?.role;

      // route based on role
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // show either server error or generic message
      const msg = err.response?.data?.error || err.message;
      setError(msg);
      toast.error('Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          LPO Tracker
        </h1>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          &copy; 2025 LPO Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
