import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Award, Trophy, Calendar, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FriendProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  coins: number;
  xp: number;
  streakCount: number;
  joinDate: string;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }>;
  activeChallenges: Array<{
    name: string;
    progress: number;
    target: number;
  }>;
  stats: {
    completedChallenges: number;
    groupsJoined: number;
    friendsCount: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Mock profile data
const mockProfiles: Record<string, FriendProfile> = {
  '1': {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    tier: 'Gold',
    coins: 2450,
    xp: 980,
    streakCount: 14,
    joinDate: '2024-08-15',
    badges: [
      {
        id: '1',
        name: 'Welcome Warrior',
        description: 'Complete your first login',
        earnedAt: '2024-08-15',
      },
      {
        id: '2',
        name: 'Streak Master',
        description: 'Maintain a 7-day streak',
        earnedAt: '2024-08-22',
      },
      {
        id: '3',
        name: 'Gold Legend',
        description: 'Reach Gold tier',
        earnedAt: '2024-09-10',
      },
    ],
    activeChallenges: [
      {
        name: '30-Day Walking Challenge',
        progress: 18,
        target: 30,
      },
      {
        name: 'Hydration Hero',
        progress: 8,
        target: 14,
      },
    ],
    stats: {
      completedChallenges: 5,
      groupsJoined: 3,
      friendsCount: 12,
    },
    recentActivity: [
      {
        type: 'challenge_complete',
        description: 'Completed 7-Day Meditation Streak',
        timestamp: '2 days ago',
      },
      {
        type: 'badge_earned',
        description: 'Earned Gold Legend badge',
        timestamp: '1 week ago',
      },
      {
        type: 'friend_added',
        description: 'Added 2 new friends',
        timestamp: '2 weeks ago',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    tier: 'Silver',
    coins: 2100,
    xp: 850,
    streakCount: 7,
    joinDate: '2024-07-20',
    badges: [
      {
        id: '1',
        name: 'Welcome Warrior',
        description: 'Complete your first login',
        earnedAt: '2024-07-20',
      },
      {
        id: '4',
        name: 'Silver Star',
        description: 'Reach Silver tier',
        earnedAt: '2024-09-05',
      },
    ],
    activeChallenges: [
      {
        name: 'Sleep Master',
        progress: 5,
        target: 7,
      },
    ],
    stats: {
      completedChallenges: 3,
      groupsJoined: 2,
      friendsCount: 8,
    },
    recentActivity: [
      {
        type: 'streak_milestone',
        description: 'Reached 7-day login streak',
        timestamp: '1 day ago',
      },
      {
        type: 'challenge_progress',
        description: 'Made progress on Sleep Master challenge',
        timestamp: '3 days ago',
      },
    ],
  },
};

export const FriendProfile: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const profile = friendId ? mockProfiles[friendId] : null;

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'from-orange-600 to-amber-700';
      case 'Silver': return 'from-gray-400 to-gray-600';
      case 'Gold': return 'from-amber-400 to-yellow-500';
      case 'Platinum': return 'from-cyan-400 to-blue-500';
      case 'Diamond': return 'from-blue-400 to-purple-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{profile.name}'s Profile</h1>
              <p className="text-xs text-gray-500">Member since {formatDate(profile.joinDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{profile.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile.name}</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${getTierColor(profile.tier)}`}>
                <Trophy className="w-4 h-4 mr-1" />
                {profile.tier} Tier
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{profile.coins}</div>
              <div className="text-sm text-gray-500">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.xp}</div>
              <div className="text-sm text-gray-500">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{profile.streakCount}</div>
              <div className="text-sm text-gray-500">Day Streak</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add Friend
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600">{profile.stats.completedChallenges}</div>
              <div className="text-sm text-gray-500">Challenges</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-purple-600">{profile.stats.groupsJoined}</div>
              <div className="text-sm text-gray-500">Groups</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600">{profile.stats.friendsCount}</div>
              <div className="text-sm text-gray-500">Friends</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Badges ({profile.badges.length})</h3>
          <div className="grid grid-cols-2 gap-3">
            {profile.badges.map((badge) => (
              <div key={badge.id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{badge.description}</p>
                <p className="text-xs text-gray-500">Earned {formatDate(badge.earnedAt)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Challenges</h3>
          {profile.activeChallenges.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active challenges</p>
          ) : (
            <div className="space-y-3">
              {profile.activeChallenges.map((challenge, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{challenge.name}</h4>
                    <span className="text-sm text-gray-500">
                      {challenge.progress}/{challenge.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((challenge.progress / challenge.target) * 100)}% complete
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {profile.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'challenge_complete' && <Target className="w-4 h-4 text-white" />}
                  {activity.type === 'badge_earned' && <Award className="w-4 h-4 text-white" />}
                  {activity.type === 'friend_added' && <UserPlus className="w-4 h-4 text-white" />}
                  {activity.type === 'streak_milestone' && <Calendar className="w-4 h-4 text-white" />}
                  {activity.type === 'challenge_progress' && <Trophy className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};