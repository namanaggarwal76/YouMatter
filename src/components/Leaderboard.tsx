import React, { useState } from 'react';
import { Trophy, Medal, Crown, Coins, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LEADERBOARD_FRIENDS, LEADERBOARD_GLOBAL } from '../utils/mockData';
import { LeaderboardEntry } from '../types';

type TabType = 'friends' | 'global' | 'group';

export const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const { user } = useAuth();

  if (!user) return null;

  const getLeaderboardData = (): LeaderboardEntry[] => {
    switch (activeTab) {
      case 'friends':
        return LEADERBOARD_FRIENDS;
      case 'global':
        return LEADERBOARD_GLOBAL;
      case 'group':
        return [
          { id: '1', name: 'Mike Johnson', coins: 2100, xp: 850, rank: 1 },
          { id: '2', name: user.name, coins: user.coins, xp: user.xp, rank: 2 },
          { id: '3', name: 'Alex Thompson', coins: 1420, xp: 580, rank: 3 },
          { id: '4', name: 'Jordan Lee', coins: 1280, xp: 520, rank: 4 },
          { id: '5', name: 'Taylor Swift', coins: 1150, xp: 480, rank: 5 },
        ];
      default:
        return LEADERBOARD_FRIENDS;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-gray-500 font-semibold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isUser: boolean) => {
    if (isUser) return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400';
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50';
    return 'bg-white';
  };

  const leaderboardData = getLeaderboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h1>
        <p className="text-gray-600">See how you rank against others</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Friends
        </button>

        <button
          onClick={() => setActiveTab('global')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'global'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Global
        </button>

        <button
          onClick={() => setActiveTab('group')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'group'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          My Group
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {leaderboardData.slice(0, 3).map((entry) => {
          const isUser = entry.name === user.name;
          return (
            <div
              key={entry.id}
              className={`${getRankBg(entry.rank, isUser)} p-6 border-b border-gray-200 last:border-0`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {entry.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 truncate">{entry.name}</h3>
                    {isUser && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">{entry.coins}</span>
                    </div>

                    <div className="flex items-center gap-1 text-blue-600">
                      <Award className="w-4 h-4" />
                      <span className="font-semibold">{entry.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Other Rankings</h3>

        <div className="space-y-3">
          {leaderboardData.slice(3).map((entry) => {
            const isUser = entry.name === user.name;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  isUser ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400' : 'bg-gray-50'
                }`}
              >
                <div className="w-8 text-center">
                  <span className="text-gray-600 font-semibold">{entry.rank}</span>
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {entry.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 truncate">{entry.name}</span>
                    {isUser && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      <span>{entry.coins}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>{entry.xp} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTab === 'global' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold mb-1">Your Global Rank</h3>
              <p className="text-blue-100">You're ranked #{user.coins > 2000 ? '1,247' : '2,847'} globally</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
