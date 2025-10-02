import React from 'react';
import { Wallet as WalletIcon, TrendingUp, ArrowUpRight, Coins, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Wallet: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const recentTransactions = [
    { id: '1', type: 'Earned', description: 'Daily Login Reward', amount: 10, timestamp: 'Today, 9:00 AM' },
    { id: '2', type: 'Earned', description: 'Joined Community Group', amount: 20, timestamp: 'Today, 9:05 AM' },
    { id: '3', type: 'Earned', description: 'Chatbot Interaction', amount: 2, timestamp: 'Today, 9:15 AM' },
    { id: '4', type: 'Earned', description: 'Challenge Progress', amount: 15, timestamp: 'Today, 10:30 AM' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Blockchain Wallet</h1>
        <p className="text-gray-600">Track your wellness rewards on the blockchain</p>
      </div>

      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-blue-100 text-sm mb-1">Total Balance</p>
            <h2 className="text-5xl font-bold">{user.walletBalance}</h2>
            <p className="text-blue-100 text-sm mt-1">Wellness Coins</p>
          </div>

          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <WalletIcon className="w-8 h-8" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+{Math.round((user.coins / 100) * 12)}% this week</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/20">
          <p className="text-blue-100 text-xs mb-2">Wallet Address (Simulated)</p>
          <p className="font-mono text-sm break-all">0x{user.id}...{user.id.slice(-6)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Coins Earned</p>
          <p className="text-2xl font-bold text-gray-800">{user.coins}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total XP</p>
          <p className="text-2xl font-bold text-gray-800">{user.xp}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Transactions</h3>

        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 mb-1">{transaction.description}</h4>
                <p className="text-xs text-gray-500">{transaction.timestamp}</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">+{transaction.amount}</p>
                <p className="text-xs text-gray-500">coins</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 mb-2">Blockchain Integration</h4>
            <p className="text-sm text-gray-600 mb-3">
              Your wellness rewards are securely stored on our simulated blockchain. In production, these would be real crypto tokens you could trade or redeem.
            </p>
            <div className="flex gap-2 text-xs text-gray-600">
              <span className="bg-white px-3 py-1 rounded-full">Secure</span>
              <span className="bg-white px-3 py-1 rounded-full">Transparent</span>
              <span className="bg-white px-3 py-1 rounded-full">Decentralized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
