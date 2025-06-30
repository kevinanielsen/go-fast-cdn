import axios from 'axios';

// Create a shared axios instance for admin endpoints
const adminApi = axios.create();

// Attach Authorization header with access token for every request
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const configService = {
  async getRegistrationEnabled(): Promise<boolean> {
    const res = await axios.get('/api/config/registration');
    return res.data.enabled;
  },
  async setRegistrationEnabled(enabled: boolean): Promise<boolean> {
    const res = await adminApi.post('/api/admin/config/registration', { enabled });
    return res.data.enabled;
  },
};

export default configService;
