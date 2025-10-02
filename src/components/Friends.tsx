import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Facebook, X, Eye, UserMinus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types/supabaseTypes';
import { 
  fetchAllUsers, 
  searchUsers, 
  followUser, 
  unfollowUser, 
  getUserFriends, 
  isFollowing 
} from '../utils/api';

interface UserWithFollowStatus extends User {
  isFollowing?: boolean;
}

export const Friends: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'following' | 'explore' | 'search'>('following');
  const [allUsers, setAllUsers] = useState<UserWithFollowStatus[]>([]);
  const [myFriends, setMyFriends] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);

  // Load users and friends on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all users and current user's friends in parallel
      const [users, friends] = await Promise.all([
        fetchAllUsers(),
        getUserFriends(user!.id)
      ]);

      // Filter out current user from the list
      const filteredUsers = users.filter(u => u.id !== user!.id);
      
      // Mark which users are being followed
      const usersWithFollowStatus = await Promise.all(
        filteredUsers.map(async (u) => ({
          ...u,
          isFollowing: await isFollowing(user!.id, u.id)
        }))
      );

      setAllUsers(usersWithFollowStatus);
      setMyFriends(friends);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() && user) {
      try {
        const results = await searchUsers(term);
        const filteredResults = results.filter(u => u.id !== user.id);
        
        // Add follow status to search results
        const resultsWithFollowStatus = await Promise.all(
          filteredResults.map(async (u) => ({
            ...u,
            isFollowing: await isFollowing(user.id, u.id)
          }))
        );
        
        setSearchResults(resultsWithFollowStatus);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) return;

    try {
      const currentlyFollowing = await isFollowing(user.id, targetUserId);
      
      if (currentlyFollowing) {
        await unfollowUser(user.id, targetUserId);
      } else {
        await followUser(user.id, targetUserId);
      }

      // Refresh data to update UI
      await loadData();
      
      // Update search results if in search tab
      if (activeTab === 'search' && searchTerm) {
        handleSearch(searchTerm);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const viewProfile = (userId: string) => {
    // Navigate to user profile or show profile modal
    console.log('View profile for user:', userId);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-600 bg-orange-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Platinum': return 'text-cyan-600 bg-cyan-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Facebook connect functionality (dummy implementation)
  const connectWithFacebook = () => {
    setShowFacebookModal(true);
  };

  const UserCard: React.FC<{ user: UserWithFollowStatus; showFollowButton?: boolean }> = ({ 
    user: userItem, 
    showFollowButton = false 
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">{userItem.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{userItem.name}</h4>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(userItem.tier)}`}>
              {userItem.tier}
            </span>
            <span className="text-gray-500">{userItem.coins} coins</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-500">{userItem.email}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => viewProfile(userItem.id)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-1"
        >
          <Eye className="w-4 h-4" />
          View
        </button>
        {showFollowButton && (
          <button
            onClick={() => handleFollowToggle(userItem.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              userItem.isFollowing
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {userItem.isFollowing ? (
              <>
                <UserMinus className="w-4 h-4" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Friends</h1>
        <p className="text-gray-600">Connect with friends and track wellness together</p>
      </div>

      {/* Facebook Connect Button */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Facebook className="w-12 h-12" />
            <div>
              <h3 className="text-xl font-bold mb-1">Connect with Facebook</h3>
              <p className="text-blue-100">Find friends from your Facebook network (Demo)</p>
            </div>
          </div>
          <button
            onClick={connectWithFacebook}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Connect
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('following')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'following'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Following ({myFriends.length})
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
            activeTab === 'explore'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Explore Users
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

      {/* Search Bar (for search tab) */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        )}

        {!loading && activeTab === 'following' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">People You Follow</h3>
            {myFriends.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You're not following anyone yet. Start exploring!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myFriends.map((friend) => (
                  <UserCard key={friend.id} user={friend} showFollowButton={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'explore' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Discover Users</h3>
            {allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allUsers.map((userItem) => (
                  <UserCard key={userItem.id} user={userItem} showFollowButton={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'search' && (
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
                <p className="text-gray-500">Enter a name or email to search for users</p>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map((userItem) => (
                  <UserCard key={userItem.id} user={userItem} showFollowButton={true} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Facebook Modal (Dummy) */}
      {showFacebookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Facebook Integration</h3>
              <button
                onClick={() => setShowFacebookModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="text-center py-8">
              <Facebook className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                This is a demo button. Facebook integration would allow you to find friends from your Facebook network.
              </p>
              <button
                onClick={() => setShowFacebookModal(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};