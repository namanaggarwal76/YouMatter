import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface MoodPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mood: string) => void;
  userName: string;
}

export const MoodPrompt: React.FC<MoodPromptProps> = ({ isOpen, onClose, onSubmit, userName }) => {
  const [mood, setMood] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) {
      onSubmit(mood.trim());
      setMood('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h2>
          <p className="text-gray-600">Hi {userName}! We'd love to know how you're doing today. This helps us personalize your wellness goals.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <textarea
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Tell us about your mood, energy level, or how you're feeling today..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 transition-colors resize-none"
              rows={4}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{mood.length}/500 characters</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl"
            >
              Share
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Your response helps us create personalized wellness goals just for you!
        </p>
      </div>
    </div>
  );
};