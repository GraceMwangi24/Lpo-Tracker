import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
    axios.get('http://localhost:5000/users', { headers })
      .then(r => setCounts(c => ({ ...c, users: r.data.length })))
      .catch(console.error);

    // 2) Requisition counts + recent
    axios.get('http://localhost:5000/requisitions', { headers })
      .then(r => {
        const all = r.data.length;
        const pending = r.data.filter(x => x.status === 'pending').length;
        setCounts(c => ({ ...c, allReqs: all, pendingReqs: pending }));
        // grab last 5, sorted by created_at descending
        const sorted = [...r.data].sort((a,b) =>
          new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentReqs(sorted.slice(0,5));
      })
      .catch(console.error);

    // 3) LPO count
    axios.get('http://localhost:5000/lpos', { headers })
      .then(r => setCounts(c => ({ ...c, lpos: r.data.length })))
      .catch(console.error);

  }, [token]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 uppercase">Total Users</p>
          <p className="mt-2 text-2xl font-semibold">{counts.users}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 uppercase">All Requisitions</p>
          <p className="mt-2 text-2xl font-semibold">{counts.allReqs}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 uppercase">Pending Requisitions</p>
          <p className="mt-2 text-2xl font-semibold">{counts.pendingReqs}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500 uppercase">Total LPOs</p>
          <p className="mt-2 text-2xl font-semibold">{counts.lpos}</p>
        </div>
      </div>

      {/* Recent requisitions */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Requisitions</h3>
        <ul className="space-y-2">
          {recentReqs.map(r => (
            <li key={r.id} className="flex justify-between border p-3 rounded">
              <span>#{r.id} by User {r.user_id}</span>
              <span className="uppercase text-sm">{r.status}</span>
            </li>
          ))}
          {recentReqs.length === 0 && (
            <li className="text-gray-500 italic">No requisitions yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
