import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function UserLpos() {
  const { token } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [lpos, setLpos] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/lpos', { headers }),
      axios.get('http://localhost:5000/suppliers')
    ])
      .then(([lres, sres]) => {
        setLpos(lres.data);
        // map supplierId → name
        const map = Object.fromEntries(sres.data.map(s => [s.id, s.name]));
        setSuppliers(map);
      })
      .catch(() => toast.error('Failed to load LPOs/suppliers'));
  }, [token]);

  const toggle = id => setOpenId(openId === id ? null : id);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Your LPOs</h1>
      {lpos.length === 0 ? (
        <p className="text-gray-500">No LPOs found.</p>
      ) : (
        <div className="space-y-4">
          {lpos.map(l => (
            <div key={l.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggle(l.id)}
                className="w-full flex justify-between items-center px-5 py-4 bg-gray-100 hover:bg-gray-200"
              >
                <div>
                  <span className="font-medium">LPO #{l.id}</span> — Req #{l.requisition_id}
                </div>
                <div className="text-sm text-gray-700">{suppliers[l.supplier_id]}</div>
              </button>
              {openId === l.id && (
                <div className="p-5 bg-white space-y-2">
                  <div>Created: {new Date(l.created_at).toLocaleString()}</div>
                  <div>Status: {l.status.charAt(0).toUpperCase() + l.status.slice(1)}</div>
                  <div>Total: ₦{l.total_value.toFixed(2)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
