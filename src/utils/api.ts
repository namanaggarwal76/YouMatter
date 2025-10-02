// Simple API helper for backend calls. The base URL can be changed for deployed backend.
// NOTE: In the browser `process` is not defined. Use Vite's import.meta.env (VITE_*) or
// define a window-level var. We check multiple places safely so this module can run
// both in Node (SSR) and the browser.
function resolveBaseUrl() {
  // 1) process.env if running under Node (SSR / tests)
  if (typeof process !== 'undefined' && process && (process as any).env && (process as any).env.REACT_APP_BACKEND_URL) {
    return (process as any).env.REACT_APP_BACKEND_URL as string;
  }

  // 2) Vite environment (preferred in this project). Vite exposes import.meta.env
  try {
    const v = (import.meta as any)?.env?.VITE_BACKEND_URL;
    if (v) return v as string;
  } catch (e) {
    // import.meta may not exist in some runtimes — ignore
  }

  // 3) window.__env__ or other runtime-injected global (optional)
  if (typeof window !== 'undefined' && (window as any).__env__ && (window as any).__env__.REACT_APP_BACKEND_URL) {
    return (window as any).__env__.REACT_APP_BACKEND_URL as string;
  }

  // Fallback to localhost for development
  return 'http://localhost:3001';
}

const BASE_URL = resolveBaseUrl();

export async function generateChallenges(query: string) {
  const res = await fetch(`${BASE_URL}/generate-challenges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`generateChallenges failed: ${res.status}`);
  return res.json();
}

export async function chat(message: string) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`chat failed: ${res.status}`);
  return res.json();
}

// Import Supabase client and types
import { supabase } from './supabaseClient';
import { User } from '../types/supabaseTypes';

// Mock data for testing when database is unavailable
const mockUsers: User[] = [
  {
    id: 'mock-user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    coins: 2500,
    xp: 1200,
    tier: 'Gold',
    daily_login_timestamp: Date.now()
  },
  {
    id: 'mock-user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    coins: 1800,
    xp: 900,
    tier: 'Silver',
    daily_login_timestamp: Date.now()
  },
  {
    id: 'mock-user-3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    coins: 3200,
    xp: 1500,
    tier: 'Platinum',
    daily_login_timestamp: Date.now()
  },
  {
    id: 'mock-user-4',
    name: 'David Wilson',
    email: 'david@example.com',
    coins: 1200,
    xp: 600,
    tier: 'Bronze',
    daily_login_timestamp: Date.now()
  }
];

// Mock friends data - stores which users are following each other
const mockFriends: Record<string, string[]> = {
  'mock-user-1': ['mock-user-2'],
  'mock-user-2': ['mock-user-3'],
};

// Fetch all users from users table
export async function fetchAllUsers(): Promise<User[]> {
  try {
    console.log('Fetching all users from Supabase users table...');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Supabase error fetching users:', error.message, error.details);
      // Only use mock data as last resort
      console.warn('Falling back to mock data due to database error');
      return mockUsers;
    }
    
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} users from database`);
      return data;
    } else {
      console.log('No users found in database, using mock data for demonstration');
      return mockUsers;
    }
  } catch (error) {
    console.error('Network or other error fetching users:', error);
    return mockUsers;
  }
}

// Search users by name or email
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    console.log(`Searching users in database for term: "${searchTerm}"`);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) {
      console.error('Supabase error searching users:', error.message, error.details);
      // Fallback to mock data search
      const mockResults = mockUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.warn(`Database search failed, found ${mockResults.length} mock results`);
      return mockResults;
    }
    
    if (data) {
      console.log(`Database search successful: found ${data.length} users`);
      return data;
    } else {
      console.log('No users found in database search');
      return [];
    }
  } catch (error) {
    console.warn('Error searching users, using mock data:', error);
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

// Add a friend (one-way follow)
export async function followUser(userId: string, friendId: string): Promise<boolean> {
  try {
    console.log(`Following user: ${userId} -> ${friendId}`);
    
    // Check if already following to prevent duplicates
    const { data: existingFollow } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .single();
    
    if (existingFollow) {
      console.log('Already following this user');
      return true;
    }
    
    const { error } = await supabase
      .from('friends')
      .insert({ user_id: userId, friend_id: friendId });
    
    if (error) {
      console.error('Database error following user:', error.message, error.details);
      // Add to mock friends as fallback
      if (!mockFriends[userId]) {
        mockFriends[userId] = [];
      }
      if (!mockFriends[userId].includes(friendId)) {
        mockFriends[userId].push(friendId);
      }
      return true;
    }
    
    console.log('Successfully followed user in database');
    return true;
  } catch (error) {
    console.error('Network error following user:', error);
    // Add to mock friends as fallback
    if (!mockFriends[userId]) {
      mockFriends[userId] = [];
    }
    if (!mockFriends[userId].includes(friendId)) {
      mockFriends[userId].push(friendId);
    }
    return true;
  }
}

// Remove a friend (unfollow)
export async function unfollowUser(userId: string, friendId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId);
    
    if (error) {
      console.warn('Database error, using mock data for unfollow:', error);
      // Remove from mock friends
      if (mockFriends[userId]) {
        mockFriends[userId] = mockFriends[userId].filter(id => id !== friendId);
      }
      return true;
    }
    return true;
  } catch (error) {
    console.warn('Error unfollowing user, using mock data:', error);
    // Remove from mock friends
    if (mockFriends[userId]) {
      mockFriends[userId] = mockFriends[userId].filter(id => id !== friendId);
    }
    return true;
  }
}

// Get user's friends
export async function getUserFriends(userId: string): Promise<User[]> {
  try {
    console.log(`Fetching friends for user: ${userId}`);
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        users!friend_id (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Database error fetching friends:', error.message, error.details);
      // Return mock friends as fallback
      const friendIds = mockFriends[userId] || [];
      const mockResult = mockUsers.filter(user => friendIds.includes(user.id));
      console.warn(`Database friends fetch failed, returning ${mockResult.length} mock friends`);
      return mockResult;
    }
    
    if (data && data.length > 0) {
      const friends = data.map((item: any) => item.users as User).filter(Boolean);
      console.log(`Successfully fetched ${friends.length} friends from database`);
      return friends;
    } else {
      console.log('No friends found in database');
      return [];
    }
  } catch (error) {
    console.error('Network error fetching friends:', error);
    // Return mock friends as fallback
    const friendIds = mockFriends[userId] || [];
    return mockUsers.filter(user => friendIds.includes(user.id));
  }
}

// Check if user is following another user
export async function isFollowing(userId: string, friendId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select('*')
      .eq('user_id', userId)
      .eq('friend_id', friendId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No row found - not following
        return false;
      } else {
        console.error('Database error checking follow status:', error.message);
        // Check mock friends as fallback
        return mockFriends[userId]?.includes(friendId) || false;
      }
    }
    
    return !!data;
  } catch (error) {
    console.error('Network error checking follow status:', error);
    // Check mock friends as fallback
    return mockFriends[userId]?.includes(friendId) || false;
  }
}

// Create sample users in the database (for testing)
export async function createSampleUsers(): Promise<boolean> {
  try {
    console.log('Creating sample users in database...');
    
    const sampleUsers = [
      {
        id: 'sample-user-1',
        name: 'Alice Johnson',
        email: 'alice.sample@example.com',
        coins: 2500,
        xp: 1200,
        tier: 'Gold' as const,
        daily_login_timestamp: Date.now()
      },
      {
        id: 'sample-user-2', 
        name: 'Bob Smith',
        email: 'bob.sample@example.com',
        coins: 1800,
        xp: 900,
        tier: 'Silver' as const,
        daily_login_timestamp: Date.now()
      },
      {
        id: 'sample-user-3',
        name: 'Carol Davis', 
        email: 'carol.sample@example.com',
        coins: 3200,
        xp: 1500,
        tier: 'Platinum' as const,
        daily_login_timestamp: Date.now()
      }
    ];
    
    const { error } = await supabase
      .from('users')
      .upsert(sampleUsers);
    
    if (error) {
      console.error('Error creating sample users:', error);
      return false;
    }
    
    console.log('Sample users created successfully');
    return true;
  } catch (error) {
    console.error('Network error creating sample users:', error);
    return false;
  }
}

export default { generateChallenges, chat, fetchAllUsers, searchUsers, followUser, unfollowUser, getUserFriends, isFollowing, createSampleUsers };
