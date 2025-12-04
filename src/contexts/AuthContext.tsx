import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/database';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialiser la base de données et charger l'utilisateur
  useEffect(() => {
    const init = async () => {
      try {
        await db.init();
        
        // Charger l'utilisateur depuis localStorage (migration)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('currentUser');
          }
        }
      } catch (error) {
        console.error('Error initializing database:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      await db.init();
      const foundUser = await db.findUserByUsernameOrEmail(username);

      if (foundUser && foundUser.password === password) {
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          createdAt: foundUser.createdAt,
        };
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      await db.init();
      
      // Vérifier si l'utilisateur ou l'email existe déjà
      const existingUser = await db.getUserByUsername(username);
      if (existingUser) {
        throw new Error('Ce nom d\'utilisateur est déjà pris');
      }
      
      const existingEmail = await db.getUserByEmail(email);
      if (existingEmail) {
        throw new Error('Cet email est déjà utilisé');
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password, // En production, hasher le mot de passe
        createdAt: new Date().toISOString(),
      };

      await db.createUser(newUser);

      const userData: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!isInitialized) {
    return <div>Chargement...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

