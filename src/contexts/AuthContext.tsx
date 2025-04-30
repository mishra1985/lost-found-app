import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabaseClient';
import { userStorage } from '../utils/supabaseStorage';
import { User, AuthState, LoginCredentials, SignupCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  signup: (credentials: SignupCredentials) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const loadUser = async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      const dbUser = await userStorage.getById(data.user.id);
      if (dbUser) {
        setState({
          user: dbUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data?.user) {
      const message = error?.message || 'Login failed';
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: message,
      });
      throw new Error(message);
    }

    const dbUser = await userStorage.getById(data.user.id);
    if (!dbUser) {
      throw new Error('User profile not found in DB');
    }

    setState({
      user: dbUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return dbUser;
  };
  const signup = async (credentials: SignupCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
  
    // Step 1: Create user with Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
  
    if (signUpError || !signUpData.user) {
      const msg = signUpError?.message || 'Signup failed';
      setState({ user: null, isAuthenticated: false, isLoading: false, error: msg });
      throw new Error(msg);
    }
  
    const authUser = signUpData.user;
  
    // Optional: Set display name in Supabase Auth metadata (not required for your DB, but useful for Auth UI)
    await supabase.auth.updateUser({
      data: { full_name: credentials.username },
    });
  
    // Step 2: Insert profile into your own users table
    const newUser: User = {
      id: authUser.id,
      email: credentials.email,
      username: credentials.username,
      role: 'user',
      created_at: new Date().toISOString(),
    };
  
    console.log('🔥 New user to insert:', newUser);
  
    try {
      await userStorage.add(newUser);
    } catch (err) {
      console.error('❌ Failed to insert user into DB:', err);
      throw new Error('Could not save user profile to DB');
    }
  
    // Step 3: Set context state
    setState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  
    return newUser;
  };
  
  
  
  
  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
