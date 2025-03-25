
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  freeChatsCount: number;
  incrementFreeChatsCount: () => void;
  resetFreeChatsCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [freeChatsCount, setFreeChatsCount] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored free chats count
    const storedCount = localStorage.getItem('freeChatsCount');
    if (storedCount) {
      setFreeChatsCount(parseInt(storedCount, 10));
    }

    // Set up Supabase auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          // Reset free chats count when user signs in
          resetFreeChatsCount();
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const incrementFreeChatsCount = () => {
    const newCount = freeChatsCount + 1;
    setFreeChatsCount(newCount);
    localStorage.setItem('freeChatsCount', newCount.toString());
  };

  const resetFreeChatsCount = () => {
    setFreeChatsCount(0);
    localStorage.setItem('freeChatsCount', '0');
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
      resetFreeChatsCount();
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed up successfully',
        description: 'Please check your email for confirmation!',
      });
      resetFreeChatsCount();
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: 'Signed out successfully',
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (!error) {
      toast({
        title: 'Password reset email sent',
        description: 'Check your email for the reset link',
      });
    }
    
    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    freeChatsCount,
    incrementFreeChatsCount,
    resetFreeChatsCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
