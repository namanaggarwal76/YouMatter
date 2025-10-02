import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { Groups } from './components/Groups';
import { Leaderboard } from './components/Leaderboard';
import { Challenges } from './components/Challenges';
import { Wallet } from './components/Wallet';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationBanner } from './components/NotificationBanner';
import { Award } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import Profile from './components/profile';

function AppContent() {
  const { user, addCoins } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleLoginSuccess = () => {
    setShowLogin(false);
  };

  const handleInviteFriend = () => {
    addCoins(20);
    setShowInviteModal(true);
    setTimeout(() => setShowInviteModal(false), 3000);
  };

  const handleShareBadge = () => {
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 3000);
  };

  if (!user || showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <NotificationBanner />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={
            <>
              {/* Main dashboard and tabs */}
              {(() => {
                switch (activeTab) {
                  case 'dashboard':
                    return <Dashboard />;
                  case 'chat':
                    return <Chatbot />;
                  case 'groups':
                    return <Groups />;
                  case 'leaderboard':
                    return <Leaderboard />;
                  case 'challenges':
                    return <Challenges />;
                  case 'wallet':
                    return <Wallet />;
                  default:
                    return <Dashboard />;
                }
              })()}
            </>
          } />
        </Routes>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Friend Invited!</h3>
            <p className="text-gray-600 mb-4">You earned +20 coins for inviting a friend!</p>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4">
              <p className="text-3xl font-bold text-amber-600">+20 Coins</p>
            </div>
          </div>
        </div>
      )}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-scale-in">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Badge Shared!</h3>
            <p className="text-gray-600 mb-4">Your achievement has been shared with your network!</p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">Share link copied to clipboard</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
