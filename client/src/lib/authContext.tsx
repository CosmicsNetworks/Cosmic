import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  isPremium: boolean;
  role: string;
  twoFactorEnabled?: boolean;
  settings?: any;
  tabCloaking?: any;
}

interface PremiumStatus {
  isPremium: boolean;
  expiresAt?: string;
}

interface LoginResult {
  success: boolean;
  requires2FA?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  premiumStatus: PremiumStatus | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  validate2FA: (username: string, token: string, recoveryCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (username: string, email: string, password: string, confirmPassword: string) => Promise<boolean>;
  redeemCode: (code: string) => Promise<boolean>;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPremiumStatus({
          isPremium: data.user.isPremium,
          expiresAt: data.user.premiumExpiry
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setPremiumStatus(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
      setPremiumStatus(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Check if 2FA is required
        if (data.requires2FA) {
          return { success: false, requires2FA: true };
        }

        setUser(data.user);
        setPremiumStatus({
          isPremium: data.user.isPremium,
          expiresAt: data.user.premiumExpiry
        });
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  };

  const validate2FA = async (username: string, token: string, recoveryCode?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/2fa/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          token: token || undefined,
          recoveryCode: recoveryCode || undefined 
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setPremiumStatus({
          isPremium: data.user.isPremium,
          expiresAt: data.user.premiumExpiry
        });
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('2FA validation error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      setPremiumStatus(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (
    username: string, 
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
        credentials: 'include'
      });

      if (response.ok) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const redeemCode = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/premium/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setPremiumStatus(data.premiumStatus);

        // Update the user object with the new premium status
        if (user) {
          setUser({
            ...user,
            isPremium: data.premiumStatus.isPremium
          });
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Redeem code error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      premiumStatus,
      login,
      validate2FA,
      logout,
      register,
      redeemCode,
      fetchUserData
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};