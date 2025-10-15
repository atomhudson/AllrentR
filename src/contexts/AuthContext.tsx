import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pin_code: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check admin status when user changes
      if (session?.user) {
        setTimeout(() => {
          checkAdminStatus(session.user.id);
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    setIsAdmin(!!data);
  };

  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pin_code: string;
  }) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            pin_code: userData.pin_code,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Account created!",
        description: "Welcome to RentKaro! You can now list your items.",
      });

      // Log user activity
      if (data.user) {
        setTimeout(async () => {
          await supabase.from('user_activity_logs').insert({
            user_id: data.user!.id,
            action: 'USER_SIGNUP',
            details: {
              email: userData.email,
              timestamp: new Date().toISOString()
            }
          });
        }, 100);
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Unable to create account. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Welcome back!",
        description: `Logged in successfully`,
      });

      // Log user activity
      if (data.user) {
        setTimeout(async () => {
          await supabase.from('user_activity_logs').insert({
            user_id: data.user!.id,
            action: 'USER_LOGIN',
            details: {
              email: email,
              timestamp: new Date().toISOString()
            }
          });
        }, 100);
      }
      
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Unable to login. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    const userId = user?.id;
    
    // Log user activity before logout
    if (userId) {
      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        action: 'USER_LOGOUT',
        details: {
          timestamp: new Date().toISOString()
        }
      });
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
