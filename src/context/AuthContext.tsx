import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getUser, saveUser, clearUser } from '../utils/storage';
import { calculateTier, checkNewBadges, shouldShowDailyReward, calculateStreak } from '../utils/gamification';

interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  startChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (email: string, name: string) => {
    const existingUser = getUser();

    if (existingUser && existingUser.email === email) {
      const showReward = shouldShowDailyReward(existingUser.lastLoginDate);
      const newStreak = calculateStreak(existingUser.lastLoginDate, existingUser.streakCount);

      if (showReward) {
        const updatedUser: User = {
          ...existingUser,
          coins: existingUser.coins + 10,
          xp: existingUser.xp + 5,
          streakCount: newStreak,
          lastLoginDate: new Date().toISOString(),
        };

        const newTier = calculateTier(updatedUser.xp);
        if (newTier !== updatedUser.tier) {
          updatedUser.tier = newTier;
        }

        const newBadges = checkNewBadges(updatedUser);
        if (newBadges.length > 0) {
          updatedUser.badges = [...updatedUser.badges, ...newBadges];
        }

        saveUser(updatedUser);
        setUser(updatedUser);
      } else {
        setUser(existingUser);
      }
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        coins: 10,
        xp: 5,
        tier: 'Bronze',
        streakCount: 1,
        lastLoginDate: new Date().toISOString(),
        walletBalance: 10,
        badges: [
          {
            id: '1',
            name: 'Welcome Warrior',
            description: 'Complete your first login',
            icon: 'award',
            requiredXp: 0,
            earnedAt: new Date().toISOString(),
          },
        ],
        joinedGroups: [],
        activeChallenges: [],
      };

      saveUser(newUser);
      setUser(newUser);
    }
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    const newTier = calculateTier(updatedUser.xp);
    if (newTier !== updatedUser.tier) {
      updatedUser.tier = newTier;
    }

    const newBadges = checkNewBadges(updatedUser);
    if (newBadges.length > 0) {
      updatedUser.badges = [...updatedUser.badges, ...newBadges];
    }

    saveUser(updatedUser);
    setUser(updatedUser);
  };

  const addCoins = (amount: number) => {
    if (!user) return;
    updateUser({
      coins: user.coins + amount,
      walletBalance: user.walletBalance + amount,
    });
  };

  const addXP = (amount: number) => {
    if (!user) return;
    updateUser({ xp: user.xp + amount });
  };

  const joinGroup = (groupId: string) => {
    if (!user) return;
    if (user.joinedGroups.includes(groupId)) return;

    updateUser({
      joinedGroups: [...user.joinedGroups, groupId],
      coins: user.coins + 20,
      xp: user.xp + 10,
    });
  };

  const leaveGroup = (groupId: string) => {
    if (!user) return;
    updateUser({
      joinedGroups: user.joinedGroups.filter(id => id !== groupId),
    });
  };

  const startChallenge = (challengeId: string) => {
    if (!user) return;
    if (user.activeChallenges.find(c => c.challengeId === challengeId)) return;

    updateUser({
      activeChallenges: [
        ...user.activeChallenges,
        {
          challengeId,
          progress: 0,
          completed: false,
          startedAt: new Date().toISOString(),
        },
      ],
    });
  };

  const updateChallengeProgress = (challengeId: string, progress: number) => {
    if (!user) return;

    const updatedChallenges = user.activeChallenges.map(c => {
      if (c.challengeId === challengeId) {
        return { ...c, progress };
      }
      return c;
    });

    updateUser({ activeChallenges: updatedChallenges });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        addCoins,
        addXP,
        joinGroup,
        leaveGroup,
        startChallenge,
        updateChallengeProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
