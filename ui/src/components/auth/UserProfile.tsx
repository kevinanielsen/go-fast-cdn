import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useLocation, Link } from 'wouter';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  if (!user) return null;
  return (
    <div className="relative">
      <div className="flex items-center space-x-3 p-4">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.email}
          </p>
          <p className="text-sm text-gray-500 capitalize">
            {user.role}
          </p>
        </div>
        <Link
          href="/settings"
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500"
          title="User Settings"
        >
          <SettingsIcon className="h-5 w-5" strokeWidth={2} color="currentColor" />
        </Link>
        <button
          onClick={logout}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500"
          title="Logout"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} color="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
