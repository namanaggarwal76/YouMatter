import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Facebook, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Friend {
  id: string;
  name: string;
  email: string;
  tier: string;
  coins: number;
  xp: number;
  status: 'pending' | 'accepted' | 'suggested';
  avatar?: string;
  mutualFriends?: number;
  lastActive?: string;
}

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

// Mock friends data
const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    tier: 'Gold',
    coins: 2450,
    xp: 980,
    status: 'accepted',
    mutualFriends: 3,
    lastActive: '2 hours ago',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    tier: 'Silver',
    coins: 2100,
    xp: 850,
    status: 'accepted',
    mutualFriends: 5,
    lastActive: '1 day ago',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    tier: 'Bronze',
    coins: 1890,
    xp: 720,
    status: 'pending',
    mutualFriends: 2,
    lastActive: '3 days ago',
  },
];

const suggestedFriends: Friend[] = [
  {
    id: '4',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    tier: 'Silver',
    coins: 1420,
    xp: 580,
    status: 'suggested',
    mutualFriends: 1,
    lastActive: '5 hours ago',
  },
  {
    id: '5',
    name: 'Jordan Lee',
    email: 'jordan@example.com',
    tier: 'Gold',
    coins: 1280,
    xp: 520,
    status: 'suggested',
    mutualFriends: 4,
    lastActive: '2 days ago',
  },
];

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export const Friends: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'suggestions' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [facebookFriends, setFacebookFriends] = useState<FacebookUser[]>([]);
  const [isLoadingFacebook, setIsLoadingFacebook] = useState(false);

  // Initialize Facebook SDK
  useEffect(() => {
    // Load Facebook SDK
    if (!window.FB) {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id', // Replace with your Facebook App ID
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      // Load the SDK script
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.head.appendChild(script);
    }
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      // Mock search results - in real app, this would be an API call
      const mockSearchResults: Friend[] = [
        {
          id: '6',
          name: 'Taylor Swift',
          email: 'taylor@example.com',
          tier: 'Diamond',
          coins: 3500,
          xp: 1200,
          status: 'suggested' as const,
          mutualFriends: 0,
          lastActive: '1 hour ago',
        },
        {
          id: '7',
          name: 'John Smith',
          email: 'john@example.com',
          tier: 'Bronze',
          coins: 800,
          xp: 300,
          status: 'suggested' as const,
          mutualFriends: 2,
          lastActive: '4 hours ago',
        },
      ].filter(friend => 
        friend.name.toLowerCase().includes(term.toLowerCase()) ||
        friend.email.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(mockSearchResults);
    } else {
      setSearchResults([]);
    }
  };

  const connectWithFacebook = () => {
    setIsLoadingFacebook(true);
    
    if (window.FB) {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          // Get user's Facebook friends
          window.FB.api('/me/friends', { fields: 'name,email,picture' }, (friendsResponse: any) => {
            if (friendsResponse.data) {
              setFacebookFriends(friendsResponse.data);
              setShowFacebookModal(true);
            } else {
              // Fallback with mock data for demo purposes
              setFacebookFriends([
                {
                  id: 'fb1',
                  name: 'Jessica Wilson',
                  email: 'jessica@facebook.com',
                  picture: { data: { url: 'https://via.placeholder.com/50' } }
                },
                {
                  id: 'fb2',
                  name: 'Ryan Davis',
                  email: 'ryan@facebook.com',
                  picture: { data: { url: 'https://via.placeholder.com/50' } }
                },
              ]);
              setShowFacebookModal(true);
            }
            setIsLoadingFacebook(false);
          });
        } else {
          setIsLoadingFacebook(false);
          alert('Facebook login was cancelled.');
        }
      }, { scope: 'email,user_friends' });
    } else {
      // Fallback for demo
      setTimeout(() => {
        setFacebookFriends([
          {
            id: 'fb1',
            name: 'Jessica Wilson',
            email: 'jessica@facebook.com',
            picture: { data: { url: 'https://via.placeholder.com/50' } }
          },
          {
            id: 'fb2',
            name: 'Ryan Davis', 
            email: 'ryan@facebook.com',
            picture: { data: { url: 'https://via.placeholder.com/50' } }
          },
        ]);
        setShowFacebookModal(true);
        setIsLoadingFacebook(false);
      }, 1000);
    }
  };

  const addFriend = (friendToAdd: Friend) => {
    const updatedFriend = { ...friendToAdd, status: 'pending' as const };
    setFriends(prev => [...prev, updatedFriend]);
    
    // Remove from suggestions or search results
    if (activeTab === 'search') {
      setSearchResults(prev => prev.filter(f => f.id !== friendToAdd.id));
    }
  };

  const acceptFriend = (friendId: string) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === friendId ? { ...friend, status: 'accepted' } : friend
      )
    );
  };

  const viewProfile = (friendId: string) => {
    navigate(`/profile/${friendId}`);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-cyan-600 bg-cyan-100';
      case 'Diamond': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const currentFriends = friends.filter(f => f.status === 'accepted');
  const pendingFriends = friends.filter(f => f.status === 'pending');

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Friends</h1>
        <p className="text-gray-600">Connect with friends and track wellness together</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'friends'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          My Friends ({currentFriends.length})
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'suggestions'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Suggestions
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Search
        </button>
      </div>

      {/* Facebook Connect Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Facebook className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold mb-1">Connect with Facebook</h3>
              <p className="text-blue-100">Find friends from your Facebook network</p>
            </div>
          </div>
          <button
            onClick={connectWithFacebook}
            disabled={isLoadingFacebook}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {isLoadingFacebook ? 'Loading...' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Search Bar (for search tab) */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search friends by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="space-y-4">
        {activeTab === 'friends' && (
          <>
            {/* Pending Friend Requests */}
            {pendingFriends.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{friend.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{friend.name}</h4>
                          <p className="text-sm text-gray-500">{friend.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriend(friend.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => viewProfile(friend.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Friends */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">My Friends</h3>
              {currentFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No friends yet. Start connecting!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{friend.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{friend.name}</h4>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(friend.tier)}`}>
                              {friend.tier}
                            </span>
                            <span className="text-gray-500">{friend.coins} coins</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-500">{friend.lastActive}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewProfile(friend.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'suggestions' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested Friends</h3>
            <div className="space-y-3">
              {suggestedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{friend.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{friend.name}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(friend.tier)}`}>
                          {friend.tier}
                        </span>
                        <span className="text-gray-500">{friend.mutualFriends} mutual friends</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewProfile(friend.id)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addFriend(friend)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h3>
            {searchResults.length === 0 && searchTerm ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found matching "{searchTerm}"</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Enter a name or email to search for friends</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{friend.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{friend.name}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(friend.tier)}`}>
                            {friend.tier}
                          </span>
                          <span className="text-gray-500">{friend.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewProfile(friend.id)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => addFriend(friend)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Facebook Friends Modal */}
      {showFacebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Facebook Friends</h3>
              <button
                onClick={() => setShowFacebookModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {facebookFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Facebook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No Facebook friends found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {facebookFriends.map((fbFriend) => (
                    <div key={fbFriend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{fbFriend.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{fbFriend.name}</h4>
                          {fbFriend.email && (
                            <p className="text-xs text-gray-500">{fbFriend.email}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Add Facebook friend
                          const newFriend: Friend = {
                            id: `fb_${fbFriend.id}`,
                            name: fbFriend.name,
                            email: fbFriend.email || '',
                            tier: 'Bronze',
                            coins: 0,
                            xp: 0,
                            status: 'pending',
                            mutualFriends: 0,
                            lastActive: 'Recently joined',
                          };
                          addFriend(newFriend);
                          setShowFacebookModal(false);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};