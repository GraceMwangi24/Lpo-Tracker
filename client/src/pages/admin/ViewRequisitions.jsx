// client/src/pages/admin/ViewRequisitions.jsx
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function ViewRequisitions() {
  const { token } = useContext(AuthContext);
  const headers = { Authorization: `Bearer ${token}` };

  const [requisitions, setRequisitions] = useState([]);
  const [openId, setOpenId] = useState(null);

  // Fetch list
  const load = () => {
    axios
      .get('http://localhost:5000/requisitions', { headers })
      .then(r => setRequisitions(r.data))
      .catch(() => toast.error('Error fetching requisitions'));
  };
  useEffect(load, [token]);

  const toggle = id => setOpenId(openId === id ? null : id);

  const updateStatus = (id, status) => {
    axios
      .put(
        `http://localhost:5000/requisitions/${id}`,
        { status },
        { headers }
      )
      .then(() => {
        toast.success(`Requisition #${id} ${status}!`);
        load();
      })
      .catch(() => toast.error('Failed to update status'));
  };

  // Separate lists by status
  const pending  = requisitions.filter(r => r.status === 'pending');
  const approved = requisitions.filter(r => r.status === 'approved');
  const rejected = requisitions.filter(r => r.status === 'rejected');

  function renderSection(title, items) {
    return (
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">{title}</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">None.</p>
        ) : (
          <div className="space-y-4">
            {items.map(req => (
              <div
                key={req.id}
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <button
                  onClick={() => toggle(req.id)}
                  className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-lg focus:outline-none"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      Requisition #{req.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested by: {req.user_name}
                    </div>
                  </div>
                  <span className={`
                    px-2 py-1 text-sm rounded-full ${
                      req.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : req.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </button>

                {/* Details */}
                {openId === req.id && (
                  <div className="px-6 py-4 bg-white space-y-3">
                    <p className="text-sm text-gray-600">
                      <strong>Created:</strong>{' '}
                      {new Date(req.created_at).toLocaleString()}
                    </p>

                    {/* Products (no prices) */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Products:
                      </h3>
                      {(!req.products || req.products.length === 0) ? (
                        <p className="text-gray-500">No products linked.</p>
                      ) : (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {req.products.map(p => (
                            <li key={p.id}>
                              {p.name} × {p.quantity}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {req.notes && (
                      <p className="text-gray-700">
                        <strong>Notes:</strong> {req.notes}
                      </p>
                    )}

                    {/* Approve / Reject buttons */}
                    {req.status === 'pending' && (
                      <div className="pt-4 border-t flex space-x-2">
                        <button
                          onClick={() => updateStatus(req.id, 'approved')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(req.id, 'rejected')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Manage Requisitions
      </h1>
      {renderSection('🕒 Pending', pending)}
      {renderSection('✅ Approved', approved)}
      {renderSection('❌ Rejected', rejected)}
    </div>
  );
}
