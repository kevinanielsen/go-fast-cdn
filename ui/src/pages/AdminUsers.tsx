import React, { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminUserService';
import { User } from '@/types/auth';

const emptyUser = { email: '', password: '', role: 'user' };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<any>(emptyUser);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setUsers(await adminUserService.listUsers());
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminUserService.createUser(form);
    setForm(emptyUser);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ email: user.email, role: user.role, is_verified: user.is_verified });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await adminUserService.updateUser(editingId, form);
      setEditingId(null);
      setForm(emptyUser);
      fetchUsers();
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (typeof id !== 'number' || isNaN(id)) {
      alert('Invalid user ID. Cannot delete user.');
      return;
    }
    if (window.confirm('Delete this user?')) {
      await adminUserService.deleteUser(id);
      fetchUsers();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin User Management</h1>
      <form
        onSubmit={editingId ? handleUpdate : handleAdd}
        className="mb-6 flex flex-wrap gap-3 bg-gray-50 p-4 rounded-lg border border-gray-100"
      >
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="input input-bordered w-full md:w-auto flex-1"
          required
        />
        {!editingId && (
          <input
            name="password"
            value={form.password || ''}
            onChange={handleChange}
            placeholder="Password"
            className="input input-bordered w-full md:w-auto flex-1"
            required
            type="password"
          />
        )}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="input input-bordered w-full md:w-auto flex-1"
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="btn btn-primary w-full" type="submit">
            {editingId ? 'Update' : 'Add'} User
          </button>
          {editingId && (
            <button
              className="btn btn-secondary w-full"
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyUser);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="overflow-x-auto rounded-lg border border-gray-100 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Verified</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id ?? user.email} className="hover:bg-gray-50 transition">
                <td className="py-3 px-4 text-gray-900">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {user.is_verified ? (
                    <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  ) : (
                    <span className="inline-block w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                  )}
                  {user.is_verified ? 'Yes' : 'No'}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="btn btn-xs btn-info"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <div className="mt-4 text-center text-gray-500">Loading...</div>}
    </div>
  );
}
