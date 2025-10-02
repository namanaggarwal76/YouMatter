import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { User } from '../types/supabaseTypes';

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
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data.session) {
        fetchUserProfile(data.session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
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

  const fetchUserProfile = async (id: string) => {
    console.log('[Supabase] Fetching user profile for id:', id);
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (!error && data) {
      setUser(data);
    } else {
      console.warn('[Supabase] User row not found, creating default user row.');
      // Fetch email and name from auth user
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email || '';
      const name = authData?.user?.user_metadata?.name || 'New User';
      // Insert default user row
      const defaultUser = {
        id,
        email,
        name,
        coins: 0,
        xp: 0,
        tier: 'Bronze',
        daily_login_timestamp: Date.now(),
      };
      const { error: insertError } = await supabase.from('users').insert(defaultUser);
      if (insertError) {
        console.error('[Supabase] Failed to create user row:', insertError.message);
      } else {
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error && data.user) {
      // Create user profile row
      await supabase.from('users').insert({ id: data.user.id, email, name });
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
}