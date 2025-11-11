import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Define User interface locally since we're having issues with the db import
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
}

// Simple in-memory user storage
const users: User[] = [];

const db = {
  findUserByEmail: async (email: string): Promise<User | undefined> => {
    return users.find(user => user.email === email);
  },
  createUser: async (email: string, name: string, password: string): Promise<User> => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password, // In a real app, you should hash the password
      createdAt: new Date()
    };
    users.push(user);
    return user;
  }
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          // In a real app, you would have a getUserById method in your db
          // For now, we'll just set a basic user object
          setUser({
            id: userId,
            email: 'user@example.com',
            name: 'User',
            password: '',
            createdAt: new Date()
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await db.findUserByEmail(email);
      if (user && user.password === password) {
        setUser(user);
        localStorage.setItem('userId', String(user.id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const existingUser = await db.findUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('A user with this email already exists');
      }
      
      const user = await db.createUser(
        userData.email,
        userData.name,
        userData.password
      );
      setUser(user);
      localStorage.setItem('userId', user.id);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('userId');
    history.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
