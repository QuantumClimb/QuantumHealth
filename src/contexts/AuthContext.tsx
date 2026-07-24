import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  tenant_id?: string | null;
  profile?: any;
}

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string, role?: 'patient'|'doctor') => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    // Simple refresh - no auth needed for fresh slate
    setLoading(false);
  };

  // No useEffect needed for fresh slate

  const login = async (email: string, password: string, role: 'patient'|'doctor' = 'doctor') => {
    // Simple login for fresh slate - no auth needed
    setUser({
      id: 'admin-001',
      email: email,
      role: role,
      tenant_id: null,
      profile: null
    });
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


