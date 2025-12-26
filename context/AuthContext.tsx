
import React, { useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';
import { AuthContext, AuthContextType } from './AuthContextDefinition';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        const user: User = {
          id: data.id,
          username: data.username || email,
          passwordHash: '', // Not used in Supabase
          role: data.role as any,
          name: data.name || '',
          email: data.email || email,
          phone: data.phone || '',
          address: data.address || '',
        };
        setCurrentUser(user);
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) throw error;
    if (data.session) {
      // Optimistic update or wait for subscription
      await fetchProfile(data.session.user.id, data.session.user.email!);
      return currentUser; // Might be stale but state updates
    }
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    updateCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
