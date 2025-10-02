
import React, { useState, useRef } from 'react';
import { Award, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Make sure Header is rendered inside a <BrowserRouter> in your app entry point

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">YouMatter</h1>
              <p className="text-xs text-gray-500">{user.tier} Tier</p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Profile"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      // Use replace: false to push to history stack
                      navigate('/profile', { replace: false });
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
