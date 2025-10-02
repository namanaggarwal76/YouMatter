import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { NOTIFICATIONS } from '../utils/mockData';

export const NotificationBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NOTIFICATIONS.length);
      setIsVisible(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg mb-6 animate-slide-down">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{NOTIFICATIONS[currentIndex]}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
