import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Award, TrendingUp, Trophy, Flame } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { calculateProgress, getNextTierThreshold } from '../utils/gamification';

const Profile: React.FC = () => {
  const { user } = useSupabase();
  const navigate = useNavigate();

  if (!user) return null;

  const progress = calculateProgress(user.xp, user.tier);
  const nextThreshold = getNextTierThreshold(user.tier);

  const weeklyData = [120, 250, 180, 320, 280, 410, 350];
  const maxValue = Math.max(...weeklyData);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'from-orange-600 to-amber-700';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Gold': return 'from-amber-400 to-yellow-500';
      case 'Platinum': return 'from-cyan-400 to-blue-500';
      case 'Diamond': return 'from-blue-400 to-purple-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user.name}!</h1>
        <p className="text-gray-600">Here's your wellness progress overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
          <Coins className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total Coins</p>
          <p className="text-3xl font-bold">{user.coins}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
          <Award className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Total XP</p>
          <p className="text-3xl font-bold">{user.xp}</p>
        </div>

                <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-8 text-white text-center">
          <Flame className="w-10 h-10 mx-auto mb-3 opacity-90" />
          <p className="text-lg opacity-90 mb-1">Daily Streak</p>
          <p className="text-3xl font-bold">7 days</p>
        </div>

        <div className={`bg-gradient-to-br ${getTierColor(user.tier)} rounded-2xl p-6 text-white`}>
          <Trophy className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Current Tier</p>
          <p className="text-3xl font-bold">{user.tier}</p>
        </div>
      </div>



      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Weekly Activity</h3>

        <div className="flex items-end justify-between gap-2 h-48">
          {weeklyData.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end justify-center h-40">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 hover:from-blue-700 hover:to-blue-500"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{days[index]}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Coins earned this week</span>
            <span className="font-semibold text-gray-800">{weeklyData.reduce((a, b) => a + b, 0)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Badges Unlocked</h3>
        <p className="text-gray-500 text-center py-8">No badges earned yet. Keep going!</p>
      </div>
    </div>
  );
};

export default Profile;
