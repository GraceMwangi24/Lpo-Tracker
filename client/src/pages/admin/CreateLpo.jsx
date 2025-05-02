// client/src/pages/admin/CreateLpo.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiChevronRight, FiCheckCircle, FiUser, FiBox } from 'react-icons/fi';

const API = 'http://localhost:5000';

export default function CreateLpo() {
  const { token } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };

  // Data
  const [users,     setUsers]     = useState([]);
  const [reqs,      setReqs]      = useState([]);
  const [lpos,      setLpos]      = useState([]);
  const [products,  setProducts]  = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // UI state
  const [activeReqId, setActiveReqId] = useState(null);
  const [supplierId,  setSupplierId]  = useState('');
  const [prices,      setPrices]      = useState({});

  // Load data
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const [u, r, l, p, s] = await Promise.all([
          axios.get(`${API}/users`,      { headers }),
          axios.get(`${API}/requisitions?status=approved`, { headers }),
          axios.get(`${API}/lpos`,       { headers }),
          axios.get(`${API}/products`),
          axios.get(`${API}/suppliers`,  { headers }),
        ]);
        setUsers(u.data);
        setReqs(r.data);
        setLpos(l.data);
        setProducts(p.data);
        setSuppliers(s.data);
      } catch {
        toast.error('Failed loading data');
      }
    })();
  }, [token]);

  // Init prices each time a req is selected
  useEffect(() => {
    if (!activeReqId) return;
    const req = reqs.find(r => r.id === activeReqId);
    if (!req) return;
    const init = {};
    req.products.forEach(p => { init[p.id] = 0; });
    setPrices(init);
    setSupplierId('');
  }, [activeReqId, reqs]);

  // Lookup maps
  const userMap     = useMemo(() => Object.fromEntries(users.map(u => [u.id, u.name])), [users]);
  const supplierMap = useMemo(() => Object.fromEntries(suppliers.map(s => [s.id, s.name])), [suppliers]);
  const lpoReqIds   = useMemo(() => new Set(lpos.map(l => l.requisition_id)), [lpos]);

  // Only approved & no LPO yet
  const pending = useMemo(
    () => reqs.filter(r => !lpoReqIds.has(r.id))
              .sort((a,b) => new Date(b.created_at) - new Date(a.created_at)),
    [reqs, lpoReqIds]
  );

  // Selected req details
  const selected = pending.find(r => r.id === activeReqId) || null;

  // Build product rows
  const rows = useMemo(() => {
    if (!selected) return [];
    return selected.products.map(p => ({
      id:   p.id,
      name: p.name,
      qty:  p.quantity,
      price: prices[p.id] || 0
    }));
  }, [selected, prices]);

  const total = rows.reduce((sum, r) => sum + r.qty * r.price, 0);

  // Actions
  const pick = id => setActiveReqId(prev => (prev === id ? null : id));
  const changePrice = (pid, v) => setPrices(pr => ({ ...pr, [pid]: parseFloat(v) }));
  const submitLpo = async () => {
    if (!supplierId) {
      toast.error('Please pick a supplier');
      return;
    }
    if (total <= 0) {
      toast.error('Please enter at least one price');
      return;
    }
    try {
      await axios.post(
        `${API}/lpos`,
        { requisition_id: selected.id, supplier_id: supplierId, total_value: total },
        { headers }
      );
      toast.success('LPO created!');
      // reload LPOs & reqs
      const [lRes, rRes] = await Promise.all([
        axios.get(`${API}/lpos`, { headers }),
        axios.get(`${API}/requisitions?status=approved`, { headers }),
      ]);
      setLpos(lRes.data);
      setReqs(rRes.data);
      setActiveReqId(null);
    } catch {
      toast.error('Couldn’t submit LPO');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">🛠 Create LPO</h1>
      <div className="grid lg:grid-cols-2 gap-8">

        {/* Left: Pending requisitions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">✅ Approved Reqs</h2>
          {pending.length === 0
            ? <p className="text-gray-500">Nothing pending.</p>
            : (
              <ul className="space-y-2">
                {pending.map(r => (
                  <li key={r.id}>
                    <button
                      onClick={() => pick(r.id)}
                      className={`
                        group flex justify-between items-center w-full p-4
                        rounded-xl shadow hover:shadow-lg transition
                        ${activeReqId === r.id ? 'ring-2 ring-blue-400 bg-blue-50' : 'bg-white'}
                      `}
                    >
                      <div>
                        <div className="font-medium">#{r.id}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <FiUser className="mr-1" /> {userMap[r.user_id]}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <FiChevronRight className="text-gray-400 transition group-hover:text-blue-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Right: Details & Submit */}
        <div>
          <h2 className="text-xl font-semibold mb-4">📋 Details & Submit</h2>
          <div className="bg-white rounded-xl shadow p-6 min-h-[300px]">
            {!selected
              ? <p className="text-gray-500">Select a requisition on the left.</p>
              : (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">Requisition #{selected.id}</div>
                    <div className="text-gray-600 flex items-center">
                      <FiUser className="mr-1" /> {userMap[selected.user_id]}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {new Date(selected.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Products & Prices */}
                  <div className="space-y-3">
                    <div className="font-medium">Products & Unit Prices</div>
                    {rows.map(r => (
                      <div key={r.id} className="grid grid-cols-3 gap-4 items-center">
                        <div className="flex items-center">
                          <FiBox className="mr-2" /> {r.name}
                        </div>
                        <div>Qty: {r.qty}</div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ksh 0.00"
                          value={prices[r.id] || ''}
                          onChange={e => changePrice(r.id, e.target.value)}
                          className="border rounded px-2 py-1 focus:ring focus:ring-blue-200 w-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block mb-1 font-medium">Supplier</label>
                    <select
                      value={supplierId}
                      onChange={e => setSupplierId(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200"
                    >
                      <option value="">⇨ choose…</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Total & Submit */}
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">Total: Ksh {total.toFixed(2)}</div>
                    <button
                      disabled={!supplierId || total <= 0}
                      onClick={submitLpo}
                      className="flex items-center bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2 rounded focus:ring focus:ring-green-300 transition"
                    >
                      <FiCheckCircle className="mr-2" /> Submit LPO
                    </button>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Recent LPOs */}
      <div>
        <h2 className="text-xl font-semibold mb-4">📦 Recent LPOs</h2>
        {lpos.length === 0
          ? <p className="text-gray-500">No LPOs yet.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow table-auto">
                <thead className="bg-gray-100">
                  <tr>
                    {['ID','Req #','Supplier','Total','Date'].map(h => (
                      <th key={h} className="px-4 py-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lpos
                    .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0,5)
                    .map(l => (
                      <tr key={l.id} className="even:bg-gray-50">
                        <td className="px-4 py-2">{l.id}</td>
                        <td className="px-4 py-2">{l.requisition_id}</td>
                        <td className="px-4 py-2">{supplierMap[l.supplier_id]}</td>
                        <td className="px-4 py-2">Ksh {l.total_value.toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(l.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
);
}
