import { IUserCreateRequest, TUser } from "@/types/user";
import axios from "axios";

const api = axios.create({ baseURL: "/api/admin/users" });

// Attach Authorization header with access token for every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminUserService = {
  async listUsers(): Promise<TUser[]> {
    const res = await api.get("/");
    return res.data;
  },
  async createUser(data: IUserCreateRequest): Promise<TUser> {
    const res = await api.post("/", data);
    return res.data;
  },
  async updateUser(
    id: number,
    data: Partial<{ email: string; role: string; is_verified: boolean }>
  ): Promise<TUser> {
    const res = await api.put(`/${id}`, data);
    return res.data;
  },
  async deleteUser(id: number): Promise<void> {
    if (!id && id !== 0) throw new Error("User ID is required");
    await api.delete(`/${id}`);
  },
};
