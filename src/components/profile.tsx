import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, Award, TrendingUp, Trophy, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateProgress, getNextTierThreshold } from '../utils/gamification';

const Profile: React.FC = () => {
  const { user } = useAuth();
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
      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
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

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
          <Flame className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Streak</p>
          <p className="text-3xl font-bold">{user.streakCount} days</p>
        </div>

        <div className={`bg-gradient-to-br ${getTierColor(user.tier)} rounded-2xl p-6 text-white`}>
          <Trophy className="w-8 h-8 mb-3 opacity-90" />
          <p className="text-sm opacity-90 mb-1">Current Tier</p>
          <p className="text-3xl font-bold">{user.tier}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Tier Progress</h3>
            <p className="text-sm text-gray-500">
              {user.xp} / {nextThreshold} XP to next tier
            </p>
          </div>
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>

        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getTierColor(user.tier)} transition-all duration-500 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-right text-sm text-gray-600 mt-2">{Math.round(progress)}% Complete</p>
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

        {user.badges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No badges earned yet. Keep going!</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-400 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-600">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
