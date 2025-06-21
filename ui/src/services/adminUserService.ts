import axios from 'axios';
import { User } from '../types/auth';

const api = axios.create({ baseURL: '/api/admin/users' });

export const adminUserService = {
  async listUsers(): Promise<User[]> {
    const res = await api.get('/');
    return res.data;
  },
  async createUser(data: { email: string; password: string; role: string }): Promise<User> {
    const res = await api.post('/', data);
    return res.data;
  },
  async updateUser(id: number, data: Partial<{ email: string; role: string; is_verified: boolean }>): Promise<User> {
    const res = await api.put(`/${id}`, data);
    return res.data;
  },
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/${id}`);
  },
};
