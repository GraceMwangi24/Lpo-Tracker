// client/src/pages/admin/ViewRequisitions.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function ViewRequisitions() {
  const { token } = useContext(AuthContext);
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:5000/requisitions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRequisitions(res.data))
      .catch(() => console.error('Error fetching requisitions'));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">View Requisitions</h1>
      <ul className="list-disc pl-5">
        {requisitions.map(req => (
          <li key={req.id}>
            #{req.id} — Status: {req.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
