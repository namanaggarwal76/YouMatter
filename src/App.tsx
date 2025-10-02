import React, { useState } from 'react';
import { useSupabase } from './context/SupabaseContext';
import { LoginWithNavigation } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
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
      {/* Temporarily removed Header to bypass cache issue */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <NotificationBanner />
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Routes>
        <Route path="/" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
        <Route path="/profile" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
        <Route path="/dashboard" element={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />} />
      </Routes>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
