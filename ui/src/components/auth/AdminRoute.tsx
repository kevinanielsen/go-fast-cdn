import { useAuth } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user || user.role !== 'admin') return <div className="text-center text-red-600 text-2xl mt-12">Access Denied</div>;
  return <>{children}</>;
}
