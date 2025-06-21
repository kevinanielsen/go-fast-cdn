import React, { useEffect, useState } from 'react';
import { adminUserService } from '../services/adminUserService';
import { User } from '../types/auth';

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
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Admin User Management</h2>
      <form onSubmit={editingId ? handleUpdate : handleAdd} className="mb-6 flex gap-2 flex-wrap">
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input input-bordered" required />
        {!editingId && <input name="password" value={form.password || ''} onChange={handleChange} placeholder="Password" className="input input-bordered" required type="password" />}
        <select name="role" value={form.role} onChange={handleChange} className="input input-bordered">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button className="btn btn-primary" type="submit">{editingId ? 'Update' : 'Add'} User</button>
        {editingId && <button className="btn btn-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyUser); }}>Cancel</button>}
      </form>
      <table className="table w-full">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id ?? user.email}>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_verified ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn btn-xs btn-info mr-2" onClick={() => handleEdit(user)}>Edit</button>
                <button className="btn btn-xs btn-error" onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <div>Loading...</div>}
    </div>
  );
}
