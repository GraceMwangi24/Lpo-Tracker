// client/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    // Placeholder for initial fetch or welcome message
    setMessage(`Welcome back`);
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="text-gray-700">{message}</p>
      {/* TODO: insert KPI cards, recent activity, etc. */}
    </div>
  );
}
