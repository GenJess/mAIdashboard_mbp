import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'demo123'
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemoUser(session.user.email === DEMO_CREDENTIALS.email);
        setLoading(false);
      } else {
        // No session found, auto-sign in demo user
        await autoSignInDemo();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsDemoUser(session?.user?.email === DEMO_CREDENTIALS.email);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const autoSignInDemo = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(DEMO_CREDENTIALS);
      
      if (error) {
        console.log('Demo user sign-in failed, will show auth form:', error.message);
        setLoading(false);
        return;
      }
      
      console.log('Auto-signed in demo user');
    } catch (error) {
      console.log('Demo auto-sign-in error:', error);
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    // After signing out, auto-sign in demo user again
    if (!error) {
      setTimeout(() => {
        autoSignInDemo();
      }, 500);
    }
    
    return { error };
  };

  const switchToRealAccount = async () => {
    // Sign out current user (demo) without auto-signing back in
    await supabase.auth.signOut();
    setUser(null);
    setIsDemoUser(false);
    setLoading(false);
  };

  return {
    user,
    loading,
    isDemoUser,
    signUp,
    signIn,
    signOut,
    switchToRealAccount,
    autoSignInDemo,
  };
}