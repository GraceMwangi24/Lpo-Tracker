// client/src/pages/admin/ViewLpos.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function ViewLpos() {
  const { token } = useContext(AuthContext);
  const [lpos, setLpos] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/lpos', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setLpos(res.data))
      .catch(() => console.error('Error fetching LPOs'));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">View LPOs</h1>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Req ID</th>
            <th className="p-2 border">Supplier</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Value</th>
          </tr>
        </thead>
        <tbody>
          {lpos.map(lpo => (
            <tr key={lpo.id} className="text-center border-t">
              <td className="p-2 border">{lpo.id}</td>
              <td className="p-2 border">{lpo.requisition_id}</td>
              <td className="p-2 border">{lpo.supplier_id}</td>
              <td className="p-2 border">{lpo.status}</td>
              <td className="p-2 border">{lpo.total_value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
