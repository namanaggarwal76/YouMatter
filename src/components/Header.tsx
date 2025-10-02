import React from 'react';
import { Award, LogOut, Share2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onInviteFriend: () => void;
  onShareBadge: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onInviteFriend, onShareBadge }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">YouMatter</h1>
              <p className="text-xs text-gray-500">{user.tier} Tier</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onInviteFriend}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Invite Friends"
            >
              <UserPlus className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={onShareBadge}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share Badge"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
