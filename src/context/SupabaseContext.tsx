import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '../types/supabaseTypes';
import { calculateStreak, getStreakBonus } from '../utils/streakUtils';

type SupabaseContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const updateDailyLogin = async (user: User) => {
    const streakData = calculateStreak(user.daily_login_timestamp, user.streak);
    
    if (streakData.isNewDay) {
      const streakBonus = getStreakBonus(streakData.newStreak);
      const updatedUser = {
        ...user,
        daily_login_timestamp: new Date().toISOString(),
        streak: streakData.newStreak,
        coins: user.coins + (streakData.isNewDay ? 10 : 0) + streakBonus, // Daily reward + streak bonus
        xp: user.xp + (streakData.isNewDay ? 5 : 0), // Daily XP reward
      };

      console.log(`[Supabase] Updating daily login. Streak: ${streakData.newStreak}, Bonus: ${streakBonus}, Broken: ${streakData.streakBroken}`);

      // Try to update with streak, if it fails, update without streak
      let { error } = await supabase
        .from('users')
        .update({
          daily_login_timestamp: updatedUser.daily_login_timestamp,
          streak: updatedUser.streak,
          coins: updatedUser.coins,
          xp: updatedUser.xp,
        })
        .eq('id', user.id);

      if (error && error.message.includes('streak')) {
        console.log('[Supabase] Streak column not found in update, trying without streak...');
        const { error: error2 } = await supabase
          .from('users')
          .update({
            daily_login_timestamp: updatedUser.daily_login_timestamp,
            coins: updatedUser.coins,
            xp: updatedUser.xp,
          })
          .eq('id', user.id);
        error = error2;
      }

      if (!error) {
        setUser(updatedUser);
        return updatedUser;
      } else {
        console.error('[Supabase] Error updating daily login:', error);
        setUser(user);
        return user;
      }
    } else {
      setUser(user);
      return user;
    }
  };

  const fetchUserProfile = async (id: string) => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    
    console.log('[Supabase] Query result:', { data, error });
    
    if (!error && data) {
      console.log('[Supabase] User found:', data);
      // Ensure streak exists in the data, default to 0 if not present
      const userData = {
        ...data,
        streak: data.streak !== undefined ? data.streak : 0
      };
      console.log('[Supabase] Processing user with streak:', userData.streak);
      // Update daily login and streak (this will call setUser internally)
      await updateDailyLogin(userData);
    } else {
      // fallback: create profile row
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email || '';
      const name = authData?.user?.user_metadata?.name || 'New User';
      const defaultUser = {
        id,
        email,
        name,
        coins: 0,
        xp: 0,
        tier: 'Bronze' as const,
        daily_login_timestamp: new Date().toISOString(),
        streak: 0, // Default value for streak
      };
      
      console.log('[Supabase] Attempting to insert user:', defaultUser);
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(defaultUser)
        .select()
        .single();
      
      if (insertError) {
        console.error('[Supabase] Failed to create user profile:', insertError);
        console.error('[Supabase] Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        setUser(null);
      } else {
        console.log('[Supabase] Successfully created user profile:', insertData);
        setUser(defaultUser);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      await fetchUserProfile(data.session.user.id);
    }
    return { data, error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('[Supabase] Starting signup process for:', email);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    console.log('[Supabase] Auth signup result:', { data: data?.user?.id, error });
    
    if (!error && data.user) {
      console.log('[Supabase] Creating user profile in users table...');
      
      // Simple user object - only essential fields
      const newUser = {
        id: data.user.id,
        email: email,
        name: name,
        coins: 0,
        xp: 0,
        tier: 'Bronze'
      };
      
      console.log('[Supabase] Attempting to insert user:', newUser);
      
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();
      
      if (insertError) {
        console.error('[Supabase] Failed to create user profile:', insertError);
        console.error('[Supabase] Error details:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
      } else {
        console.log('[Supabase] Successfully created user profile:', insertData);
      }
      
      // Always try to fetch the user profile regardless of insert result
      await fetchUserProfile(data.user.id);
    }
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <SupabaseContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within SupabaseProvider');
  return context;
};
