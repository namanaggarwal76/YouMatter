import React, { useEffect, useState } from 'react';
import { Users, MapPin, Building, Globe, Star, Heart, MessageCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  city?: string;
  lat?: number;
  lng?: number;
  password?: string | null;
  memberCount?: number;
}

interface SocialPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export const Groups: React.FC = () => {
  const { user, joinGroup, leaveGroup } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);

  if (!user) return null;

  // Fetch groups from Supabase
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, type, city, lat, lng, password');

      if (error) {
        console.error('Error fetching groups:', error.message);
      } else if (data) {
        // For each group, fetch member count
        const groupsWithCounts = await Promise.all(
          data.map(async (group: Group) => {
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', group.id);

            if (countError) {
              console.error('Error fetching member count:', countError.message);
              return { ...group, memberCount: 0 };
            }

            return { ...group, memberCount: count ?? 0 };
          })
        );
        setGroups(groupsWithCounts);
      }
      setLoading(false);
    };

    fetchGroups();
  }, []);

  // Fetch social posts from Supabase (replace with actual table if you have one)
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('group_posts').select('*').order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error.message);
      } else if (data) {
        const mappedPosts: SocialPost[] = data.map((post: any) => ({
          id: post.id,
          author: post.author_name || 'Anonymous',
          content: post.content,
          likes: post.likes || 0,
          comments: post.comments || 0,
          timestamp: new Date(post.created_at).toLocaleString(),
        }));
        setSocialPosts(mappedPosts);
      }
    };

    fetchPosts();
  }, []);

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

  const isJoined = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user?.id)
      .single();

    return !error && !!data;
  };

  const handleJoin = async (groupId: string) => {
    await supabase.from('group_members').insert([{ group_id: groupId, user_id: user?.id }]);
    joinGroup(groupId); // update local auth state
    setGroups(prev =>
      prev.map(g => g.id === groupId ? { ...g, memberCount: (g.memberCount ?? 0) + 1 } : g)
    );
  };

  const handleLeave = async (groupId: string) => {
    await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user?.id);
    leaveGroup(groupId); // update local auth state
    setGroups(prev =>
      prev.map(g => g.id === groupId ? { ...g, memberCount: Math.max((g.memberCount ?? 1) - 1, 0) } : g)
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Groups & Communities</h1>
        <p className="text-gray-600">Connect with others on their wellness journey</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading groups...</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const Icon = getGroupIcon(group.type);

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

                      <button
                        onClick={async () => {
                          const joined = await isJoined(group.id);
                          if (joined) {
                            handleLeave(group.id);
                          } else {
                            handleJoin(group.id);
                          }
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        {user.joinedGroups.includes(group.id) ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Joined</span>
                          </div>
                        ) : (
                          'Join Group'
                        )}
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-3">{group.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{(group.memberCount ?? 0).toLocaleString()} members</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Community Feed</h2>

        <div className="space-y-4">
          {socialPosts.map((post) => (
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
