// client/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FiList,
  FiCheckCircle,
  FiPackage,
  FiPlus
} from 'react-icons/fi';

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [requisitions, setRequisitions] = useState([]);
  const [lpos, setLpos] = useState([]);

  useEffect(() => {
    // load user's requisitions
    axios.get('http://localhost:5000/requisitions', { headers })
      .then(res => setRequisitions(res.data))
      .catch(err => console.error('Failed loading requisitions', err));

    // load user's LPOs
    axios.get('http://localhost:5000/lpos', { headers })
      .then(res => setLpos(res.data))
      .catch(err => console.error('Failed loading LPOs', err));
  }, [token]);

  const pendingCount = requisitions.filter(r => r.status === 'pending').length;
  const approvedCount = requisitions.filter(r => r.status === 'approved').length;
  const lpoCount = lpos.length;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/requisitions"
          className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center">
            <FiList className="text-2xl text-yellow-500 mr-4" />
            <div>
              <p className="text-3xl font-semibold">{pendingCount}</p>
              <p className="text-gray-500">Pending Requisitions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/requisitions"
          className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center">
            <FiCheckCircle className="text-2xl text-green-500 mr-4" />
            <div>
              <p className="text-3xl font-semibold">{approvedCount}</p>
              <p className="text-gray-500">Approved Requisitions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/lpos"
          className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center">
            <FiPackage className="text-2xl text-purple-500 mr-4" />
            <div>
              <p className="text-3xl font-semibold">{lpoCount}</p>
              <p className="text-gray-500">Your LPOs</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <Link
          to="/requisitions/new"
          className="inline-flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          <FiPlus className="mr-2" /> Create Requisition
        </Link>
      </div>
    </div>
  );
}
