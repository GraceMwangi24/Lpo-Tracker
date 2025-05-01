// client/src/pages/admin/ManageUsers.jsx
import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AuthContext } from '../../context/AuthContext'

export default function ManageUsers() {
  const { token } = useContext(AuthContext)
  const headers = { Authorization: `Bearer ${token}` }

  const [users, setUsers]       = useState([])
  const [form, setForm]         = useState({ name:'', email:'', password:'', role:'user' })
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData]   = useState({})

  // Fetch users
  useEffect(() => {
    axios.get('http://localhost:5000/users', { headers })
      .then(r => {
        setUsers(r.data)
        // initialize edit payloads
        const init = {}
        r.data.forEach(u => {
          init[u.id] = { name:u.name, email:u.email, role:u.role }
        })
        setEditData(init)
      })
      .catch(() => toast.error('Could not load users'))
  }, [token])

  // Handlers for Add User form
  const handleFormChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreate = e => {
    e.preventDefault()
    axios.post('http://localhost:5000/users', form, { headers })
      .then(r => {
        toast.success('User created!')
        const newUser = r.data
        setUsers(u => [...u, newUser])
        setEditData(ed => ({
          ...ed,
          [newUser.id]: { name:newUser.name, email:newUser.email, role:newUser.role }
        }))
        setForm({ name:'', email:'', password:'', role:'user' })
      })
      .catch(err => {
        toast.error(err.response?.data?.error || 'Failed to create')
      })
  }

  // Inline edit handlers
  const startEdit = id => setEditingId(id)
  const cancelEdit = () => setEditingId(null)

  const handleEditChange = (id, field, val) =>
    setEditData(ed => ({
      ...ed,
      [id]: { ...ed[id], [field]: val }
    }))

  const handleSave = id => {
    const payload = editData[id]
    axios.put(`http://localhost:5000/users/${id}`, payload, { headers })
      .then(r => {
        toast.success('User updated!')
        setUsers(u => u.map(u => u.id===id ? r.data : u))
        setEditingId(null)
      })
      .catch(err => {
        toast.error(err.response?.data?.error || 'Update failed')
      })
  }

  // Reset password
  const resetPassword = id => {
    const pwd = prompt('New password:')
    if (!pwd) return
    axios.put(`http://localhost:5000/users/${id}/password`, { password: pwd }, { headers })
      .then(() => toast.success('Password reset!'))
      .catch(err => toast.error(err.response?.data?.error || 'Reset failed'))
  }

  return (
    <div className="space-y-8">

      {/* Add User Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Add New User</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            name="name" placeholder="Name"
            value={form.name} onChange={handleFormChange}
            required className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />
          <input
            name="email" placeholder="Email"
            value={form.email} onChange={handleFormChange}
            required className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />
          <input
            name="password" type="password" placeholder="Password"
            value={form.password} onChange={handleFormChange}
            required className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleFormChange}
            className="border rounded px-3 py-2 focus:ring focus:ring-blue-200"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Add User
          </button>
        </form>
      </div>

      {/* Existing Users Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Existing Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {['ID','Name','Email','Role','Actions'].map(h => (
                  <th key={h} className="border px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 even:bg-gray-50 odd:bg-white"
                >
                  <td className="border px-4 py-2">{u.id}</td>
                  {editingId === u.id ? (
                    <>
                      <td className="border px-4 py-2">
                        <input
                          type="text"
                          value={editData[u.id]?.name || ''}
                          onChange={e => handleEditChange(u.id, 'name', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="email"
                          value={editData[u.id]?.email || ''}
                          onChange={e => handleEditChange(u.id, 'email', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        />
                      </td>
                      <td className="border px-4 py-2">
                        <select
                          value={editData[u.id]?.role || 'user'}
                          onChange={e => handleEditChange(u.id, 'role', e.target.value)}
                          className="w-full border rounded px-2 py-1"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border px-4 py-2">{u.name}</td>
                      <td className="border px-4 py-2">{u.email}</td>
                      <td className="border px-4 py-2">{u.role}</td>
                    </>
                  )}
                  <td className="border px-4 py-2 space-x-2">
                    {editingId === u.id ? (
                      <>
                        <button
                          onClick={() => handleSave(u.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(u.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => resetPassword(u.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                        >
                          Reset Pwd
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
