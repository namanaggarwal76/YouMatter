import { User, Tier, Badge } from '../types';
import { BADGES } from './mockData';

const TIER_THRESHOLDS: Record<Tier, number> = {
  Bronze: 0,
  Silver: 300,
  Gold: 600,
  Platinum: 1200,
  Diamond: 2000,
};

export const calculateTier = (xp: number): Tier => {
  if (xp >= TIER_THRESHOLDS.Diamond) return 'Diamond';
  if (xp >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (xp >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (xp >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

export const getNextTierThreshold = (currentTier: Tier): number => {
  const tiers: Tier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return TIER_THRESHOLDS.Diamond;
  return TIER_THRESHOLDS[tiers[currentIndex + 1]];
};

export const calculateProgress = (xp: number, tier: Tier): number => {
  const currentThreshold = TIER_THRESHOLDS[tier];
  const nextThreshold = getNextTierThreshold(tier);
  if (tier === 'Diamond') return 100;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

export const checkNewBadges = (user: User): Badge[] => {
  const earnedBadgeIds = user.badges.map(b => b.id);
  const newBadges: Badge[] = [];

  for (const badge of BADGES) {
    if (earnedBadgeIds.includes(badge.id)) continue;

    let shouldEarn = false;

    if (badge.requiredXp > 0 && user.xp >= badge.requiredXp) {
      shouldEarn = true;
    }

    if (badge.name === 'Streak Master' && user.streakCount >= 7) {
      shouldEarn = true;
    }

    if (badge.name === 'Community Builder' && user.joinedGroups.length >= 3) {
      shouldEarn = true;
    }

    if (badge.name === 'Challenge Crusher') {
      const completedChallenges = user.activeChallenges.filter(c => c.completed).length;
      if (completedChallenges >= 5) {
        shouldEarn = true;
      }
    }

    if (shouldEarn) {
      newBadges.push({ ...badge, earnedAt: new Date().toISOString() });
    }
  }

  return newBadges;
};

export const shouldShowDailyReward = (lastLoginDate: string | null): boolean => {
  if (!lastLoginDate) return true;
  const lastLogin = new Date(lastLoginDate);
  const today = new Date();
  lastLogin.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return lastLogin.getTime() !== today.getTime();
};

export const calculateStreak = (lastLoginDate: string | null, currentStreak: number): number => {
  if (!lastLoginDate) return 1;

  const lastLogin = new Date(lastLoginDate);
  const today = new Date();
  lastLogin.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return currentStreak + 1;
  } else if (diffDays === 0) {
    return currentStreak;
  } else {
    return 1;
  }
};
