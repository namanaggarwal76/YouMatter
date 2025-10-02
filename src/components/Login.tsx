import React, { useState, useEffect } from 'react';
import { Award, Coins, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { shouldShowDailyReward } from '../utils/gamification';
import { getUser } from '../utils/storage';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showReward, setShowReward] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      const existingUser = getUser();
      if (existingUser && shouldShowDailyReward(existingUser.lastLoginDate)) {
        setShowReward(true);
      } else {
        onLoginSuccess();
      }
    }
  }, [user, onLoginSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      login(email, name);
    }
  };

  const handleRewardClose = () => {
    setShowReward(false);
    onLoginSuccess();
  };

  if (showReward && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mx-auto flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-2">Daily Reward!</h2>
          <p className="text-gray-600 mb-8">Welcome back, {user.name}!</p>

          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-amber-600" />
                <span className="text-lg font-semibold text-gray-800">Coins Earned</span>
              </div>
              <span className="text-2xl font-bold text-amber-600">+10</span>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-blue-600" />
                <span className="text-lg font-semibold text-gray-800">XP Earned</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">+5</span>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-600" />
                <span className="text-lg font-semibold text-gray-800">Current Streak</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{user.streakCount} days</span>
            </div>
          </div>

          <button
            onClick={handleRewardClose}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">YouMatter</h1>
          <p className="text-gray-600">Your wellness journey starts here</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Start Your Journey
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Track your wellness, earn rewards, join communities
        </p>
      </div>
    </div>
  );
};
