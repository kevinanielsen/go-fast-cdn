import { useEffect, useState } from 'react';
import configService from '../services/configService';
import AdminUsers from './AdminUsers';

export default function AdminDashboard() {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configService.getRegistrationEnabled().then((enabled) => {
      setRegistrationEnabled(enabled);
      setLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    const newState = await configService.setRegistrationEnabled(!registrationEnabled);
    setRegistrationEnabled(newState);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="mb-6 flex items-center gap-4">
        <span className="font-semibold">Registration:</span>
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`px-4 py-2 rounded ${registrationEnabled ? 'bg-green-500' : 'bg-red-500'} text-white font-bold`}
        >
          {registrationEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
      <AdminUsers />
      {/* Add more admin widgets/components here in the future */}
    </div>
  );
}
