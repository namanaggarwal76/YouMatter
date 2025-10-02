import { useState } from 'react';
import { SupabaseProvider, useSupabase } from './context/SupabaseContext';
import { LoginWithNavigation } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { Challenges } from './components/Challenges';
import { Socials } from './components/Socials';
import { FriendProfile } from './components/FriendProfile';
import { Header } from './components/Header';
import Shop from './components/Shop';
import { BottomNav } from './components/BottomNav';
import { NotificationBanner } from './components/NotificationBanner';
import { Routes, Route } from 'react-router-dom';
import Profile from './components/profile';

function AppContent() {
  const { user, loading } = useSupabase();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your account...</h2>
          <p className="text-gray-500 mt-2">Please wait while we log you in.</p>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return <LoginWithNavigation />;
  }

  // Show dashboard if user is logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <NotificationBanner />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:friendId" element={<FriendProfile />} />
          <Route path="/" element={
            <>
              {/* Main dashboard and tabs */}
              {(() => {
                switch (activeTab) {
                  case 'dashboard':
                    return <Dashboard />;
                  case 'socials':
                    return <Socials />;
                  case 'chat':
                    return <Chatbot />;
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
      </div>
      {/* Show BottomNav on dashboard and profile routes */}
      <Routes>
        <Route path="/" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
        <Route path="/profile" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
        <Route path="/profile/:friendId" element={null} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <SupabaseProvider>
      <AppContent />
    </SupabaseProvider>
  );
}

export default App;
