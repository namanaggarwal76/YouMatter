import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Coins, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

type TabType = 'friends' | 'global';

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  coins: number;
  xp: number;
  tier: string;
  daily_login_timestamp: string;
  streak: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      try {
        // Fetch all users
        let { data: usersData, error } = await supabase
          .from('users')
          .select('id, name, email, coins, xp, tier, daily_login_timestamp, streak');

        if (error || !usersData) {
          console.error('Error fetching users:', error);
          return;
        }

        // Filter friends if needed
        if (activeTab === 'friends') {
          const { data: friendsData, error: friendsError } = await supabase
            .from('friends')
            .select('user_id, friend_id')
            .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

          if (friendsError || !friendsData) {
            console.error('Error fetching friends:', friendsError);
            return;
          }

          const friendIds = friendsData.map(f =>
            f.user_id === user.id ? f.friend_id : f.user_id
          );
          usersData = usersData.filter(u => friendIds.includes(u.id));
        }

        // Sort by coins + xp as score (or customize)
        const sorted = usersData
          .map((u, idx) => ({ ...u, rank: idx + 1 }))
          .sort((a, b) => (b.coins + b.xp) - (a.coins + a.xp))
          .map((u, idx) => ({ ...u, rank: idx + 1 }));

        setLeaderboardData(sorted);
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      }
    };

    fetchLeaderboard();
  }, [user, activeTab]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-amber-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <span className="text-gray-500 font-semibold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isUser: boolean) => {
    if (isUser) return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400';
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50';
    return 'bg-white';
  };

  if (!user) return null;

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
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {leaderboardData.map((entry) => {
          const isUser = entry.id === user.id;
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
                  <span className="text-white font-bold text-lg">{entry.name.charAt(0)}</span>
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

                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-xs">{entry.tier}</span>
                      <span className="text-xs">• Streak: {entry.streak}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
