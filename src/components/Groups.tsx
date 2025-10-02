import React from 'react';
import { Users, MapPin, Building, Globe, Star, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GROUPS, SOCIAL_POSTS } from '../utils/mockData';

export const Groups: React.FC = () => {
  const { user, joinGroup, leaveGroup } = useAuth();

  if (!user) return null;

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'local': return MapPin;
      case 'corporate': return Building;
      case 'global': return Globe;
      case 'sponsored': return Star;
      default: return Users;
    }
  };

  const getGroupColor = (type: string) => {
    switch (type) {
      case 'local': return 'from-green-500 to-emerald-600';
      case 'corporate': return 'from-blue-500 to-cyan-600';
      case 'global': return 'from-purple-500 to-pink-600';
      case 'sponsored': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isJoined = (groupId: string) => user.joinedGroups.includes(groupId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Groups & Communities</h1>
        <p className="text-gray-600">Connect with others on their wellness journey</p>
      </div>

      <div className="space-y-4">
        {GROUPS.map((group) => {
          const Icon = getGroupIcon(group.type);
          const joined = isJoined(group.id);

          return (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${getGroupColor(group.type)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{group.type} Group</p>
                    </div>

                    {joined ? (
                      <button
                        onClick={() => leaveGroup(group.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Joined</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => joinGroup(group.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        Join Group
                      </button>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm mb-3">{group.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount.toLocaleString()} members</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Community Feed</h2>

        <div className="space-y-4">
          {SOCIAL_POSTS.map((post) => (
            <div key={post.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {post.author.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-gray-800">{post.author}</h4>
                    <span className="text-xs text-gray-500">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{post.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 ml-13 text-sm text-gray-500">
                <button className="flex items-center gap-2 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>

                <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
            <input
              type="text"
              placeholder="Share your wellness journey..."
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
