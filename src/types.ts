export interface User {
  id: string;
  email: string;
  name: string;
  coins: number;
  xp: number;
  tier: Tier;
  streakCount: number;
  lastLoginDate: string;
  walletBalance: number;
  badges: Badge[];
  joinedGroups: string[];
  activeChallenges: UserChallenge[];
}

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredXp: number;
  earnedAt?: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'local' | 'corporate' | 'global' | 'sponsored';
  description: string;
  memberCount: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  durationDays: number;
}

export interface UserChallenge {
  challengeId: string;
  progress: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  coins: number;
  xp: number;
  rank: number;
}

export interface SocialPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
