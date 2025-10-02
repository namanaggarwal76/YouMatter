import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { Groups } from './components/Groups';
import { Leaderboard } from './components/Leaderboard';
<<<<<<< HEAD
=======
import { Challenges } from './components/Challenges';
>>>>>>> 60677eeeab90ca569c01c3ba1a4e68b70b02a729
import { Header } from './components/Header';
import Shop from './components/Shop';
import { BottomNav } from './components/BottomNav';
import { NotificationBanner } from './components/NotificationBanner';
import { Award } from 'lucide-react';
<<<<<<< HEAD
import { DailyChallenge } from './components/DailyChallenge';
=======
import { Routes, Route } from 'react-router-dom';
import Profile from './components/profile';
>>>>>>> 60677eeeab90ca569c01c3ba1a4e68b70b02a729

function AppContent() {
  const { user, addCoins } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // New state to store challenges from backend
  const [dailyChallenges, setDailyChallenges] = useState<string[]>([]);
  const [chatReply, setChatReply] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    setShowLogin(false);
    fetchDailyChallenges(); // fetch challenges immediately after login
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

  // Fetch daily challenges from backend
  const fetchDailyChallenges = async () => {
    try {
      const data = await (await import('./utils/api')).generateChallenges('generate daily challenges');
      // Backend may return 'challenges' as string or array
      let challengesArray: string[] = [];
      if (Array.isArray(data.challenges)) challengesArray = data.challenges;
      else if (typeof data.challenges === 'string') challengesArray = data.challenges.split('\n').filter((c: string) => c.trim() !== '');
      else if (typeof data === 'string') challengesArray = data.split('\n').filter((c: string) => c.trim() !== '');
      setDailyChallenges(challengesArray);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  };

  // In App.tsx

  const sendChatMessage = async (message: string) => {
    try {
      const api = await import('./utils/api');
      const data = await api.chat(message);
      // Ensure we use 'reply' from your backend, as your server.ts returns { reply: ... }
      setChatReply(data.reply || 'No reply text received.'); 
    } catch (err) {
      console.error('Chat failed:', err);
      setChatReply('Chat failed');
    }
  };

  if (!user || showLogin) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

<<<<<<< HEAD
  const renderContent = () => {
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
        return <DailyChallenge challenges={dailyChallenges} />;
      default:
        return <Dashboard />;
    }
  };

=======
>>>>>>> 60677eeeab90ca569c01c3ba1a4e68b70b02a729
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <NotificationBanner />
<<<<<<< HEAD
        {renderContent()}
        
=======
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
                  case 'shop':
                    return <Shop coins={user?.coins ?? 0} />;
                  default:
                    return <Dashboard />;
                }
              })()}
            </>
          } />
        </Routes>
>>>>>>> 60677eeeab90ca569c01c3ba1a4e68b70b02a729
      </div>
      {/* Show BottomNav on dashboard and profile routes */}
      <Routes>
        <Route path="/" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
        <Route path="/profile" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
      </Routes>
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
