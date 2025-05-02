// client/src/pages/user/UserRequisitions.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function UserRequisitions() {
  const { token } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [requisitions, setRequisitions] = useState([]);
  const [openId, setOpenId]         = useState(null);

  // Load your requisitions
  const load = () => {
    axios
      .get('http://localhost:5000/requisitions', { headers })
      .then(r => setRequisitions(r.data))
      .catch(() => toast.error('Could not load requisitions'));
  };
  useEffect(load, [token]);

  // Delete (recall) a pending requisition
  const recall = id => {
    if (!window.confirm(`Recall requisition #${id}?`)) return;
    axios
      .delete(`http://localhost:5000/requisitions/${id}`, { headers })
      .then(() => {
        toast.success(`Requisition #${id} recalled`);
        load();
      })
      .catch(() => toast.error('Recall failed'));
  };

  // Toggle expanded view
  const toggle = id => setOpenId(openId === id ? null : id);

  // Split by status
  const pending  = requisitions.filter(r => r.status === 'pending');
  const approved = requisitions.filter(r => r.status === 'approved');
  const rejected = requisitions.filter(r => r.status === 'rejected');

  function renderSection(title, items) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold mt-8 mb-4">{title}</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">None.</p>
        ) : (
          <div className="space-y-2">
            {items.map(r => (
              <div
                key={r.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(r.id)}
                  className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 focus:outline-none"
                >
                  <div>
                    <span className="font-medium">Requisition #{r.id}</span>
                    <span className="ml-4 text-sm text-gray-600">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  {openId === r.id
                    ? <FiChevronUp className="text-gray-600" />
                    : <FiChevronDown className="text-gray-600" />}
                </button>

                {openId === r.id && (
                  <div className="px-6 py-4 bg-white space-y-3">
                    {/* Products */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">Products</h3>
                      {r.products.length === 0
                        ? <p className="text-gray-500">No products.</p>
                        : (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {r.products.map(p => (
                              <li key={p.id}>
                                {p.name} × {p.quantity}
                              </li>
                            ))}
                          </ul>
                        )
                      }
                    </div>

                    {/* Notes */}
                    {r.notes && (
                      <p className="text-gray-700">
                        <strong>Notes:</strong> {r.notes}
                      </p>
                    )}

                    {/* Recall button for pending */}
                    {r.status === 'pending' && (
                      <div className="pt-4 border-t flex justify-end">
                        <button
                          onClick={() => recall(r.id)}
                          className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                        >
                          <FiTrash2 className="mr-2" /> Recall
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Requisitions</h1>
      {renderSection('🕒 Pending', pending)}
      {renderSection('✅ Approved', approved)}
      {renderSection('❌ Rejected', rejected)}
    </div>
  );
}
