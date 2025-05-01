// client/src/pages/admin/CreateLpo.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function CreateLpo() {
  const { token } = useContext(AuthContext);
  const [requisitions, setRequisitions] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    requisition_id: '',
    supplier_id: '',
    total_value: ''
  });

  // Fetch approved requisitions & all suppliers
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get('http://localhost:5000/requisitions?status=approved', { headers })
      .then(res => setRequisitions(res.data))
      .catch(() => toast.error('Failed to load requisitions'));

    axios
      .get('http://localhost:5000/suppliers', { headers })
      .then(res => setSuppliers(res.data))
      .catch(() => toast.error('Failed to load suppliers'));
  }, [token]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${token}` };
    axios
      .post('http://localhost:5000/lpos', form, { headers })
      .then(() => {
        toast.success('LPO created');
        setForm({ requisition_id: '', supplier_id: '', total_value: '' });
      })
      .catch(() => toast.error('Error creating LPO'));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Create LPO</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block">Requisition</label>
          <select
            name="requisition_id"
            value={form.requisition_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select one</option>
            {requisitions.map(r => (
              <option key={r.id} value={r.id}>
                #{r.id} — {r.status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Supplier</label>
          <select
            name="supplier_id"
            value={form.supplier_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select one</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">Total Value</label>
          <input
            type="number"
            name="total_value"
            value={form.total_value}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create LPO
        </button>
      </form>
    </div>
  );
}
