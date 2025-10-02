import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Users, Facebook, X, Eye, UserMinus } from 'lucide-react';
import { useSupabase } from '../context/SupabaseContext';
import { User as SupabaseUser } from '../types/supabaseTypes';
import { 
  fetchAllUsers, 
  searchUsers, 
  followUser, 
  unfollowUser, 
  getUserFriends, 
  isFollowing,
  createSampleUsers
} from '../utils/api';

interface UserWithFollowStatus extends SupabaseUser {
  isFollowing?: boolean;
}

export const Friends: React.FC = () => {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState<'following' | 'explore' | 'search'>('following');
  const [allUsers, setAllUsers] = useState<UserWithFollowStatus[]>([]);
  const [myFriends, setMyFriends] = useState<SupabaseUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithFollowStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug user state
  useEffect(() => {
    console.log('Friends component - User state:', user);
    console.log('Friends component - User exists:', !!user);
    if (user) {
      console.log('Friends component - User details:', { id: user.id, email: user.email, name: user.name });
    }
  }, [user]);

  // Load users and friends on component mount
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading data');
      loadData();
    } else {
      console.log('No user found');
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setError('Please log in to view friends');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading friends data for user:', user.id, user.email);
      
      // Load all users and current user's friends in parallel
      const [users, friends] = await Promise.all([
        fetchAllUsers(),
        getUserFriends(user.id)
      ]);

      console.log('Fetched users:', users.length);
      console.log('Fetched friends:', friends.length);

      // Check if we're using mock data (mock users have specific IDs)
      const isUsingMockData = users.some(u => u.id.startsWith('mock-user-'));
      
      // Filter out current user from the list by email since IDs might not match
      const filteredUsers = users.filter(u => u.email !== user.email);
      
      // Mark which users are being followed
      const usersWithFollowStatus = await Promise.all(
        filteredUsers.map(async (u) => ({
          ...u,
          isFollowing: await isFollowing(user.id, u.id)
        }))
      );

      setAllUsers(usersWithFollowStatus);
      setMyFriends(friends);
      setIsInitialized(true);
      
      if (isUsingMockData) {
        setError('Demo Mode: Showing sample users. Add real users to your Supabase users table to see them here.');
      } else if (users.length > 0) {
        setError(null);
      } else {
        setError('No users found in your database. Add some users to the users table.');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Using sample data for demonstration. Database connection may be unavailable.');
    }
    setLoading(false);
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() && user) {
      setLoading(true);
      try {
        console.log('Searching for users:', term);
        const results = await searchUsers(term);
        console.log('Search results:', results.length);
        
        const filteredResults = results.filter(u => u.email !== user.email);
        
        // Add follow status to search results
        const resultsWithFollowStatus = await Promise.all(
          filteredResults.map(async (u) => ({
            ...u,
            isFollowing: await isFollowing(user.id, u.id)
          }))
        );
        
        setSearchResults(resultsWithFollowStatus);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Failed to search users. Please try again.');
        setSearchResults([]);
      }
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleFollowToggle = async (targetUserId: string) => {
    if (!user) {
      setError('Please log in to follow users');
      return;
    }

    try {
      console.log('Toggling follow status for user:', targetUserId);
      const currentlyFollowing = await isFollowing(user.id, targetUserId);
      console.log('Currently following:', currentlyFollowing);
      
      let success = false;
      if (currentlyFollowing) {
        success = await unfollowUser(user.id, targetUserId);
        console.log('Unfollow result:', success);
      } else {
        success = await followUser(user.id, targetUserId);
        console.log('Follow result:', success);
      }

      if (success) {
        // Refresh data to update UI
        await loadData();
        
        // Update search results if in search tab
        if (activeTab === 'search' && searchTerm) {
          handleSearch(searchTerm);
        }
      } else {
        setError('Failed to update follow status. Please try again.');
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError('Failed to update follow status. Please try again.');
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

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Friends...</h3>
          <p className="text-gray-600">
            Please wait while we load your friend data.
          </p>
        </div>
      </div>
    );
  }

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

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <X className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="space-y-4">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">
              {activeTab === 'search' ? 'Searching...' : 'Loading friends...'}
            </p>
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
                  <UserCard key={friend.id} user={{...friend, isFollowing: true}} showFollowButton={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'explore' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Discover Users</h3>
              {isInitialized && (
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              )}
            </div>
            {allUsers.length === 0 && !isInitialized ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Click the button below to load users from your database</p>
                <button
                  onClick={loadData}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Load Users from Database
                </button>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No users found in your database</p>
                <div className="space-y-2">
                  <button
                    onClick={loadData}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors mr-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      const success = await createSampleUsers();
                      if (success) {
                        await loadData();
                      } else {
                        setError('Failed to create sample users. Check console for details.');
                      }
                      setLoading(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Add Sample Users
                  </button>
                </div>
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