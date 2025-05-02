// client/src/pages/admin/ViewLpos.jsx
import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AuthContext } from '../../context/AuthContext'

export default function ViewLpos() {
  const { token } = useContext(AuthContext)
  const headers   = { Authorization: `Bearer ${token}` }

  const [lpos, setLpos]     = useState([])
  const [openId, setOpenId] = useState(null)

  // load all LPOs
  const load = () => {
    axios
      .get('http://localhost:5000/lpos', { headers })
      .then(res => setLpos(res.data))
      .catch(() => toast.error('Error fetching LPOs'))
  }
  useEffect(load, [token])

  const toggle = id => setOpenId(openId === id ? null : id)

  const updateStatus = (id, status) => {
    axios
      .put(`http://localhost:5000/lpos/${id}`, { status }, { headers })
      .then(() => {
        toast.success(`LPO #${id} marked ${status}!`)
        load()
      })
      .catch(() => toast.error('Failed to update status'))
  }

  // split into sections
  const pending      = lpos.filter(l => l.status === 'pending')
  const delivered    = lpos.filter(l => l.status === 'delivered')
  const notDelivered = lpos.filter(l => l.status === 'not_delivered')

  function renderSection(title, items) {
    return (
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">{title}</h2>
        {items.length === 0 ? (
          <p className="text-gray-500">None.</p>
        ) : (
          <div className="space-y-4">
            {items.map(l => (
              <div
                key={l.id}
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggle(l.id)}
                  className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 rounded-t-lg focus:outline-none"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      LPO #{l.id} (Req #{l.requisition_id})
                    </div>
                    <div className="text-sm text-gray-600">
                      Supplier: {l.supplier_id}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      l.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : l.status === 'not_delivered'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {l.status.replace('_', ' ').replace(/\b\w/g,c=>c.toUpperCase())}
                  </span>
                </button>

                {openId === l.id && (
                  <div className="px-6 py-4 bg-white space-y-3">
                    <p className="text-sm text-gray-600">
                      <strong>Created:</strong>{' '}
                      {new Date(l.created_at).toLocaleString()}
                    </p>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">
                        Products:
                      </h3>
                      {(!l.products || l.products.length === 0) ? (
                        <p className="text-gray-500">No products linked.</p>
                      ) : (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {l.products.map(p => (
                            <li key={p.product_id}>
                              {p.product_name} × {p.quantity} @ ₦
                              {p.price.toFixed(2)} = ₦
                              {(p.quantity * p.price).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <p className="text-gray-800">
                      <strong>Total Value:</strong> ₦{l.total_value.toFixed(2)}
                    </p>

                    {/* Action buttons */}
                    <div className="pt-4 border-t flex space-x-2">
                      {l.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(l.id, 'delivered')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                          >
                            Mark Delivered
                          </button>
                          <button
                            onClick={() => updateStatus(l.id, 'not_delivered')}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                          >
                            Mark Not Delivered
                          </button>
                        </>
                      )}
                      {l.status === 'delivered' && (
                        <button
                          onClick={() => updateStatus(l.id, 'not_delivered')}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                        >
                          Mark Not Delivered
                        </button>
                      )}
                      {l.status === 'not_delivered' && (
                        <button
                          onClick={() => updateStatus(l.id, 'delivered')}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage LPOs</h1>
      {renderSection('🕒 Pending', pending)}
      {renderSection('📦 Delivered', delivered)}
      {renderSection('🚫 Not Delivered', notDelivered)}
    </div>
  )
}
