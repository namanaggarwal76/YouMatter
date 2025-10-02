// Types for Supabase tables
export type User = {
  id: string;
  name: string;
  email: string;
  coins: number;
  xp: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  daily_login_timestamp: number;
};

export type Badge = {
  id: string;
  name: string;
};

export type UserBadge = {
  user_id: string;
  badge_id: string;
};

export type Challenge = {
  id: string;
  title: string;
  description?: string;
  type: string;
  duration?: number;
  target?: number;
  reward_coins?: number;
  reward_xp?: number;
  badge?: string;
  discount?: number;
};

export type UserChallenge = {
  user_id: string;
  challenge_id: string;
  progress: number;
  total: number;
  completed: boolean;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  type: 'open' | 'closed';
  password?: string;
  city?: string;
  lat?: number;
  lng?: number;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
};

export type GroupPost = {
  id: string;
  group_id: string;
  author_id?: string;
  text?: string;
  likes: number;
  timestamp: number;
};

export type PostComment = {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
};

export type Notification = {
  id: string;
  user_id: string;
  text: string;
  timestamp: number;
  read: boolean;
};

export type Friend = {
  user_id: string;
  friend_id: string;
};

export type DailyStat = {
  user_id: string;
  date: string;
  steps?: number;
  water?: number;
  sleep?: number;
  heart_rate?: number;
};

export type Leaderboard = {
  user_id: string;
  score: number;
};
