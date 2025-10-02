import React, { useEffect, useState } from 'react';
import { Users, Heart, MessageCircle, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import { supabase } from '../utils/supabaseClient';

interface Group {
  id: string;
  name: string;
  description: string;
  password?: string | null;
  city?: string;
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
  const [userGroups, setUserGroups] = useState<string[]>(user?.joinedGroups || []);
  const [newPost, setNewPost] = useState<string>('');

  if (!user) return <p className="text-gray-500">Please login to see groups</p>;

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, description, password, city');

      if (error) console.error('Error fetching groups:', error.message);
      else if (data) {
        const groupsWithCounts = await Promise.all(
          data.map(async (group: Group) => {
            const { count, error: countError } = await supabase
              .from('group_members')
              .select('id', { count: 'exact', head: true })
              .eq('group_id', group.id);

            if (countError) return { ...group, memberCount: 0 };
            return { ...group, memberCount: count ?? 0 };
          })
        );
        setGroups(groupsWithCounts);
      }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  // Fetch social posts
  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('group_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSocialPosts(
          data.map((post: any) => ({
            id: post.id,
            author: post.author_name || 'Anonymous',
            content: post.content,
            likes: post.likes || 0,
            comments: post.comments || 0,
            timestamp: new Date(post.created_at).toLocaleString(),
          }))
        );
      }
    };
    fetchPosts();
  }, []);

  // Join or leave group
  const handleToggleMembership = async (groupId: string) => {
    const alreadyJoined = userGroups.includes(groupId);

    if (alreadyJoined) {
      await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', user.id);
      await supabase
        .from('users')
        .update({ groups: supabase.rpc('array_remove', { arr: 'groups', val: groupId }) })
        .eq('id', user.id);

      leaveGroup(groupId);
      setUserGroups(prev => prev.filter(id => id !== groupId));
      setGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, memberCount: Math.max((g.memberCount ?? 1) - 1, 0) } : g
        )
      );
    } else {
      await supabase.from('group_members').insert([{ group_id: groupId, user_id: user.id }]);
      await supabase
        .from('users')
        .update({ groups: supabase.rpc('array_append', { arr: 'groups', val: groupId }) })
        .eq('id', user.id);

      joinGroup(groupId);
      setUserGroups(prev => [...prev, groupId]);
      setGroups(prev =>
        prev.map(g => (g.id === groupId ? { ...g, memberCount: (g.memberCount ?? 0) + 1 } : g))
      );
    }
  };

  // Add new post locally
  const handleAddPost = () => {
    if (!newPost.trim()) return;
    const post: SocialPost = {
      id: `local-${Date.now()}`,
      author: user.name || 'You',
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: new Date().toLocaleString(),
    };
    setSocialPosts(prev => [post, ...prev]);
    setNewPost('');
  };

  const joinedGroups = groups.filter(g => userGroups.includes(g.id));
  const availableGroups = groups.filter(g => !userGroups.includes(g.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Groups & Communities</h1>
        <p className="text-gray-600">Connect with others on their wellness journey</p>
      </div>

      {/* My Groups */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Groups</h2>
        {joinedGroups.length === 0 ? (
          <p className="text-gray-500">You haven't joined any groups yet.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {joinedGroups.map(group => (
              <div key={group.id} className="bg-white rounded-2xl shadow-lg p-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800">{group.name}</h4>
                  <p className="text-gray-600 text-sm">{group.description}</p>
                  <span className="text-sm text-gray-500">
                    {(group.memberCount ?? 0).toLocaleString()} members
                  </span>
                </div>
                <button
                  onClick={() => handleToggleMembership(group.id)}
                  className="px-4 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-rose-600 text-white"
                >
                  Leave Group
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Groups */}
      {loading ? (
        <p className="text-gray-500">Loading groups...</p>
      ) : (
        <div className="space-y-4">
          {availableGroups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                    </div>
                    <button
                      onClick={() => handleToggleMembership(group.id)}
                      className="px-4 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                    >
                      Join Group
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
          ))}
        </div>
      )}

      {/* Community Feed */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Community Feed</h2>

        {/* Add post box */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share something with the community..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddPost}
            className="px-4 py-2 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> Post
          </button>
        </div>

        <div className="space-y-4">
          {socialPosts.map(post => (
            <div key={post.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">{post.author.charAt(0)}</span>
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
      </div>
    </div>
  );
};
