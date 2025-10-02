import React, { useState } from 'react';
import { UserPlus, Users, Trophy } from 'lucide-react';
import { Friends } from './Friends';
import { Groups } from './Groups';
import { Leaderboard } from './Leaderboard';

export const Socials: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('friends');

  const socialTabs = [
    { id: 'friends', icon: UserPlus, label: 'Friends' },
    { id: 'groups', icon: Users, label: 'Groups' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranks' }
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'friends':
        return <Friends />;
      case 'groups':
        return <Groups />;
      case 'leaderboard':
        return <Leaderboard />;
      default:
        return <Friends />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-1">
        <div className="flex space-x-1">
          {socialTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
};