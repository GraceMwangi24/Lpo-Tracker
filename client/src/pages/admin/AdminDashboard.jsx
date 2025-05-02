// client/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [counts, setCounts] = useState({
    users: 0,
    allReqs: 0,
    pendingReqs: 0,
    lpos: 0,
  });
  const [recentReqs, setRecentReqs] = useState([]);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    // 1) Users count
    axios
      .get('http://localhost:5000/users', { headers })
      .then(res => {
        setCounts(c => ({ ...c, users: res.data.length }));
      })
      .catch(console.error);

    // 2) Requisition counts + recent
    axios
      .get('http://localhost:5000/requisitions', { headers })
      .then(res => {
        const all = res.data.length;
        const pending = res.data.filter(x => x.status === 'pending').length;
        setCounts(c => ({ ...c, allReqs: all, pendingReqs: pending }));
        // grab last 5, sorted by created_at descending
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentReqs(sorted.slice(0, 5));
      })
      .catch(console.error);

    // 3) LPO count
    axios
      .get('http://localhost:5000/lpos', { headers })
      .then(res => {
        setCounts(c => ({ ...c, lpos: res.data.length }));
      })
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/admin/users" className="block bg-white p-6 rounded shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500 uppercase">Total Users</p>
          <p className="mt-2 text-2xl font-semibold">{counts.users}</p>
        </Link>
        <Link to="/admin/view-requisitions" className="block bg-white p-6 rounded shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500 uppercase">All Requisitions</p>
          <p className="mt-2 text-2xl font-semibold">{counts.allReqs}</p>
        </Link>
        <Link to="/admin/create-lpo" className="block bg-white p-6 rounded shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500 uppercase">Pending LPOs</p>
          <p className="mt-2 text-2xl font-semibold">{counts.pendingReqs}</p>
        </Link>
        <Link to="/admin/view-lpos" className="block bg-white p-6 rounded shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500 uppercase">Total LPOs</p>
          <p className="mt-2 text-2xl font-semibold">{counts.lpos}</p>
        </Link>
      </div>

      {/* Recent requisitions */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Requisitions</h3>
        <ul className="space-y-2">
          {recentReqs.length > 0 ? (
            recentReqs.map(r => (
              <li
                key={r.id}
                className="flex justify-between border p-3 rounded hover:bg-gray-50 transition"
              >
                <Link
                  to="/admin/view-requisitions"
                  className="text-blue-600 hover:underline"
                >
                  #{r.id} by {r.user_name}
                </Link>
                <span className="uppercase text-sm">{r.status}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-500 italic">No requisitions yet.</li>
          )}
        </ul>
      </div>
    </div>
);
}
