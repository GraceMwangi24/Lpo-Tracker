// client/src/pages/user/CreateRequisition.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

export default function CreateRequisition() {
  const { token, user } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  const [products,  setProducts]  = useState([]);
  const [lines,     setLines]     = useState([{ product_id: '', quantity: 1 }]);
  const [notes,     setNotes]     = useState('');

  useEffect(() => {
    axios
      .get('http://localhost:5000/products', { headers })
      .then(res => {
        // ensure we only set arrays
        setProducts(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        toast.error('Failed to load products');
        setProducts([]);
      });
  }, [token]);

  const addLine = () =>
    setLines(ls => [...ls, { product_id: '', quantity: 1 }]);

  const removeLine = idx =>
    setLines(ls => ls.filter((_, i) => i !== idx));

  const updateLine = (idx, field, val) =>
    setLines(ls => {
      const copy = [...ls];
      copy[idx][field] =
        field === 'quantity' ? Math.max(1, parseInt(val) || 1) : val;
      return copy;
    });

  const handleSubmit = async e => {
    e.preventDefault();
    // drop any empty product lines
    const valid = lines.filter(l => l.product_id);
    if (!valid.length) {
      toast.error('Add at least one product');
      return;
    }
    // expand by quantity
    const product_ids = valid.flatMap(l =>
      Array(l.quantity).fill(parseInt(l.product_id))
    );
    try {
      await axios.post(
        'http://localhost:5000/requisitions',
        { user_id: user.id, product_ids, notes },
        { headers }
      );
      toast.success('Requisition submitted!');
      navigate('/requisitions', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submit failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Create Requisition</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 items-center">
            <select
              value={l.product_id}
              onChange={e => updateLine(i, 'product_id', e.target.value)}
              required
              className="col-span-6 border rounded px-3 py-2"
            >
              <option value="">Select product…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={l.quantity}
              onChange={e => updateLine(i, 'quantity', e.target.value)}
              required
              className="col-span-4 border rounded px-3 py-2"
            />
            <div className="col-span-2 text-right">
              {i === 0 ? (
                <button
                  type="button"
                  onClick={addLine}
                  className="text-green-600 hover:text-green-800"
                >
                  + Add
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => removeLine(i)}
                  className="text-red-600 hover:text-red-800"
                >
                  – Remove
                </button>
              )}
            </div>
          </div>
        ))}

        <div>
          <label className="block mb-1 font-medium">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows="4"
            placeholder="Any extra details…"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-5 py-2"
        >
          Submit Requisition
        </button>
      </form>
    </div>
  );
}
