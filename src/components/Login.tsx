import React, { useState, useEffect } from 'react';
import { Award, Coins, Flame } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { supabase } from '../utils/supabaseClient';
import { shouldShowDailyReward } from '../utils/gamification';
import { getUser } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const LoginWithNavigation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Login
      onLoginSuccess={() => {
        navigate('/dashboard');
      }}
    />
  );
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showReward, setShowReward] = useState(false);
  const [error, setError] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user, signIn, signUp } = useSupabase();

  // Prevent infinite loop: only call onLoginSuccess once after login
  useEffect(() => {
    if (user) {
      const existingUser = getUser();
      if (existingUser && shouldShowDailyReward(existingUser.lastLoginDate)) {
        setShowReward(true);
      } else {
        onLoginSuccess();
      }
    }
  }, [user]); // Remove onLoginSuccess from dependencies to prevent re-runs

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    console.log('[Login] handleLogin called with:', { email, password });
    try {
      // Check if user exists in Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      console.log('[Login] userData:', userData, 'userError:', userError);
      if (userError || !userData) {
        setError('User does not exist. Please create an account.');
        setLoading(false);
        return;
      }
      const result = await signIn(email, password);
      console.log('[Login] Supabase signIn result:', result);
      if (result.error) {
        setError('Login failed: ' + result.error.message);
      } else if (!result.data.session) {
        setError('Login failed: No session returned.');
      }
      // Don't call onLoginSuccess here - let useEffect handle it
    } catch (err) {
      setError('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
      console.error('[Login] Unexpected error:', err);
    }
    setLoading(false);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAccountCreated(false);
    // Check if user already exists
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (userData) {
      setError('User already exists. Please login.');
      setLoading(false);
      return;
    }
    const { error: signupError } = await signUp(email, password, name);
    if (signupError) {
      setError(signupError.message);
    } else {
      setAccountCreated(true);
    }
    setLoading(false);
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
              <span className="text-2xl font-bold text-orange-600">Streak feature coming soon</span>
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

        {isCreating ? (
          accountCreated ? (
            <div className="space-y-6 text-center">
              <div className="text-green-600 text-lg font-semibold">Account created! Go to login.</div>
              <button
                type="button"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => { setIsCreating(false); setAccountCreated(false); }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-6">
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
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                type="button"
                className="w-full mt-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
                onClick={() => setIsCreating(false)}
              >
                Back to Login
              </button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </form>
          )
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              className="w-full mt-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
              onClick={() => setIsCreating(true)}
            >
              Create Account
            </button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Track your wellness, earn rewards, join communities
        </p>
      </div>
    </div>
  );
};

export default Login;