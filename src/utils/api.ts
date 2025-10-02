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

// Fetch all users from users table
export async function fetchAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Search users by name or email
export async function searchUsers(searchTerm: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Add a friend (one-way follow)
export async function followUser(userId: string, friendId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friends')
      .insert({ user_id: userId, friend_id: friendId });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
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
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
}

// Get user's friends
export async function getUserFriends(userId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        friend_id,
        users!friend_id (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data?.map((item: any) => item.users as User).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching user friends:', error);
    return [];
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
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return !!data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export default { generateChallenges, chat, fetchAllUsers, searchUsers, followUser, unfollowUser, getUserFriends, isFollowing };
