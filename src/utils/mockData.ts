import { Badge, Group, Challenge, LeaderboardEntry, SocialPost } from '../types';

export const BADGES: Badge[] = [
  { id: '1', name: 'Welcome Warrior', description: 'Complete your first login', icon: 'award', requiredXp: 0 },
  { id: '2', name: 'Bronze Champion', description: 'Reach Bronze tier', icon: 'medal', requiredXp: 100 },
  { id: '3', name: 'Silver Star', description: 'Reach Silver tier', icon: 'star', requiredXp: 300 },
  { id: '4', name: 'Gold Legend', description: 'Reach Gold tier', icon: 'trophy', requiredXp: 600 },
  { id: '5', name: 'Streak Master', description: 'Maintain a 7-day streak', icon: 'flame', requiredXp: 200 },
  { id: '6', name: 'Community Builder', description: 'Join 3 groups', icon: 'users', requiredXp: 150 },
  { id: '7', name: 'Challenge Crusher', description: 'Complete 5 challenges', icon: 'target', requiredXp: 400 },
  { id: '8', name: 'Wellness Guru', description: 'Reach 1000 XP', icon: 'heart', requiredXp: 1000 },
];

export const GROUPS: Group[] = [
  { id: '1', name: 'Nearby Warriors', type: 'local', description: 'Connect with wellness enthusiasts in your area', memberCount: 156 },
  { id: '2', name: 'Corporate Wellness', type: 'corporate', description: 'Workplace health challenges and support', memberCount: 432 },
  { id: '3', name: 'Global Challenge 2024', type: 'global', description: 'Join millions in our worldwide wellness initiative', memberCount: 12847 },
  { id: '4', name: 'Mindfulness Masters', type: 'sponsored', description: 'Sponsored by WellnessPlus - Daily meditation challenges', memberCount: 2341 },
];

export const CHALLENGES: Challenge[] = [
  { id: '1', name: '7-Day Meditation Streak', description: 'Meditate for 10 minutes daily for 7 consecutive days', type: 'meditation', targetValue: 7, rewardCoins: 100, rewardXp: 50, durationDays: 7 },
  { id: '2', name: '30-Day Walking Challenge', description: 'Walk at least 10,000 steps daily for 30 days', type: 'walking', targetValue: 30, rewardCoins: 500, rewardXp: 200, durationDays: 30 },
  { id: '3', name: 'Hydration Hero', description: 'Drink 8 glasses of water daily for 14 days', type: 'hydration', targetValue: 14, rewardCoins: 150, rewardXp: 75, durationDays: 14 },
  { id: '4', name: 'Sleep Master', description: 'Get 8 hours of sleep for 7 nights', type: 'sleep', targetValue: 7, rewardCoins: 120, rewardXp: 60, durationDays: 7 },
  { id: '5', name: 'Insurance Saver', description: 'Walk 100,000 steps this month for 2% off insurance renewal', type: 'insurance', targetValue: 100000, rewardCoins: 1000, rewardXp: 500, durationDays: 30 },
];

export const LEADERBOARD_FRIENDS: LeaderboardEntry[] = [
  { id: '1', name: 'Sarah Chen', coins: 2450, xp: 980, rank: 1 },
  { id: '2', name: 'Mike Johnson', coins: 2100, xp: 850, rank: 2 },
  { id: '3', name: 'Emily Rodriguez', coins: 1890, xp: 720, rank: 3 },
  { id: '4', name: 'David Kim', coins: 1650, xp: 650, rank: 4 },
  { id: '5', name: 'Alex Thompson', coins: 1420, xp: 580, rank: 5 },
];

export const LEADERBOARD_GLOBAL: LeaderboardEntry[] = [
  { id: '1', name: 'WellnessKing2024', coins: 15820, xp: 5240, rank: 1 },
  { id: '2', name: 'FitQueen', coins: 14290, xp: 4890, rank: 2 },
  { id: '3', name: 'HealthHero88', coins: 13150, xp: 4520, rank: 3 },
  { id: '4', name: 'ZenMaster', coins: 12480, xp: 4180, rank: 4 },
  { id: '5', name: 'ActiveAce', coins: 11920, xp: 3950, rank: 5 },
  { id: '6', name: 'Sarah Chen', coins: 2450, xp: 980, rank: 2847 },
];

export const SOCIAL_POSTS: SocialPost[] = [
  { id: '1', author: 'Sarah Chen', content: 'Just completed my 7-day meditation streak! Feeling amazing 🧘', likes: 24, comments: 8, timestamp: '2h ago' },
  { id: '2', author: 'Mike Johnson', content: 'Hit 10,000 steps today! Who wants to join tomorrow\'s challenge?', likes: 18, comments: 5, timestamp: '4h ago' },
  { id: '3', author: 'Emily Rodriguez', content: 'Reached Silver tier! Thanks for all the support, team! 💪', likes: 42, comments: 12, timestamp: '6h ago' },
  { id: '4', author: 'David Kim', content: 'Daily reminder: Small steps lead to big changes. Keep going!', likes: 35, comments: 9, timestamp: '8h ago' },
];

export const NOTIFICATIONS = [
  "Don't miss your streak! Log in daily to keep it going.",
  "Your friend Sarah just beat your step count!",
  "New challenge available: 7-Day Meditation Streak",
  "You're 50 XP away from Silver tier!",
  "Join the Global Challenge and compete with thousands!",
  "Unlock a new badge by completing one more challenge!",
];

export const CHATBOT_RESPONSES: Record<string, string[]> = {
  'stressed': [
    "I hear you. Try 5 minutes of deep breathing exercises. Inhale for 4 counts, hold for 4, exhale for 4.",
    "Stress is tough. Would you like to try our 7-day meditation challenge? It helps many users.",
    "Take a moment for yourself. A short walk outside can work wonders for stress relief.",
  ],
  'sleep': [
    "Sleep is crucial for wellness. Try our 7-day sleep challenge to build better habits.",
    "Have you tried avoiding screens 1 hour before bed? It can significantly improve sleep quality.",
    "Consider creating a bedtime routine: dim lights, cool room, and relaxation exercises.",
  ],
  'motivation': [
    "You've got this! Remember, every small step counts toward your wellness journey.",
    "Check out your progress on the dashboard. You've already accomplished so much!",
    "Join a community group for extra support and motivation from others on the same path.",
  ],
  'exercise': [
    "Movement is medicine! Start with the 30-day walking challenge if you're new to exercise.",
    "Even 10 minutes of activity makes a difference. What type of exercise interests you most?",
    "Try to find activities you enjoy. Wellness should be fun, not a chore!",
  ],
  'default': [
    "I'm here to support your wellness journey! Try asking about stress, sleep, motivation, or exercise.",
    "How can I help you today? I can suggest challenges, provide wellness tips, or just listen.",
    "Remember: Small consistent actions lead to big results. What's one thing you can do today?",
  ],
};
