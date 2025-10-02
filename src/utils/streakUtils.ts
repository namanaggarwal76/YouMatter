/**
 * Utility functions for managing user login streaks
 */

/**
 * Calculate if the user should get a streak for today's login
 * @param lastLoginTimestamp - Last login timestamp (ISO string)
 * @param currentStreak - Current streak count
 * @returns Object with new streak count and whether it's a new day
 */
export function calculateStreak(lastLoginTimestamp: string | null, currentStreak: number): {
  newStreak: number;
  isNewDay: boolean;
  streakBroken: boolean;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // If no previous login or first login ever, start streak at 1
  if (!lastLoginTimestamp || currentStreak === 0) {
    return {
      newStreak: 1,
      isNewDay: true,
      streakBroken: false
    };
  }

  const lastLogin = new Date(lastLoginTimestamp);
  const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  
  // Calculate difference in days
  const daysDifference = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference === 0) {
    // Same day login - no streak change
    return {
      newStreak: currentStreak,
      isNewDay: false,
      streakBroken: false
    };
  } else if (daysDifference === 1) {
    // Next day login - increment streak
    return {
      newStreak: currentStreak + 1,
      isNewDay: true,
      streakBroken: false
    };
  } else {
    // More than 1 day gap - streak broken, reset to 1
    return {
      newStreak: 1,
      isNewDay: true,
      streakBroken: true
    };
  }
}

/**
 * Check if user should receive daily login rewards
 * @param lastLoginTimestamp - Last login timestamp (ISO string)
 * @returns Whether to show daily rewards
 */
export function shouldShowDailyReward(lastLoginTimestamp: string | null): boolean {
  if (!lastLoginTimestamp) {
    return true; // First login ever
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastLogin = new Date(lastLoginTimestamp);
  const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
  
  // Show reward if it's a different day
  return today.getTime() !== lastLoginDate.getTime();
}

/**
 * Get streak bonus coins based on streak length
 * @param streak - Current streak count
 * @returns Bonus coins for the streak
 */
export function getStreakBonus(streak: number): number {
  if (streak >= 30) return 50; // Monthly streak bonus
  if (streak >= 14) return 25; // Bi-weekly streak bonus
  if (streak >= 7) return 15;  // Weekly streak bonus
  if (streak >= 3) return 5;   // Mini streak bonus
  return 0; // No bonus for streaks less than 3
}