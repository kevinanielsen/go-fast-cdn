import AdminUsers from './AdminUsers';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <AdminUsers />
      {/* Add more admin widgets/components here in the future */}
    </div>
  );
}
