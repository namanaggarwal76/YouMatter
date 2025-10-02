import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '../types/supabaseTypes';
import { useSupabase } from './SupabaseContext';
import { User } from '../types';
import { saveUser, getUser, clearUser } from '../utils/storage';
import { calculateTier, checkNewBadges, shouldShowDailyReward, calculateStreak } from '../utils/gamification';

interface AuthContextType {
  user: User | null;
  logout: () => void;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  startChallenge: (challengeId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: supabaseUser, signOut } = useSupabase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }

    // Try to load gamified user from localStorage
    const stored = getUser();
    if (stored && stored.email === supabaseUser.email) {
      setUser(stored);
    } else {
      // create new gamification profile
      const newUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: (supabaseUser as any).name || 'Player',
        coins: 10,
        xp: 5,
        tier: 'Bronze',
        streakCount: 1,
        lastLoginDate: new Date().toISOString(),
        badges: [{
          id: '1',
          name: 'Welcome Warrior',
          description: 'Complete your first login',
          icon: 'award',
          requiredXp: 0,
          earnedAt: new Date().toISOString(),
        }],
        joinedGroups: [],
        activeChallenges: [],
      };
      saveUser(newUser);
      setUser(newUser);
    }
  }, [supabaseUser]);

  const logout = () => {
    clearUser();
    signOut();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    const newTier = calculateTier(updated.xp);
    if (newTier !== updated.tier) updated.tier = newTier;
    const newBadges = checkNewBadges(updated);
    if (newBadges.length > 0) updated.badges = [...updated.badges, ...newBadges];
    saveUser(updated);
    setUser(updated);
  };

  const addCoins = (amount: number) => user && updateUser({ coins: user.coins + amount });
  const addXP = (amount: number) => user && updateUser({ xp: user.xp + amount });
  const joinGroup = (gid: string) => user && !user.joinedGroups.includes(gid) &&
    updateUser({ joinedGroups: [...user.joinedGroups, gid], coins: user.coins + 20, xp: user.xp + 10 });
  const leaveGroup = (gid: string) => user && updateUser({ joinedGroups: user.joinedGroups.filter(id => id !== gid) });
  const startChallenge = (cid: string) => user && !user.activeChallenges.find(c => c.challengeId === cid) &&
    updateUser({ activeChallenges: [...user.activeChallenges, { challengeId: cid, progress: 0, completed: false, startedAt: new Date().toISOString() }] });
  const updateChallengeProgress = (cid: string, progress: number) => user &&
    updateUser({ activeChallenges: user.activeChallenges.map(c => c.challengeId === cid ? { ...c, progress } : c) });

  return (
    <AuthContext.Provider value={{ user, logout, addCoins, addXP, joinGroup, leaveGroup, startChallenge, updateChallengeProgress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
