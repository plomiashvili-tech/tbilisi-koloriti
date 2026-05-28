import React, { createContext, useContext } from 'react';
import { AuthUser } from './auth.web';

interface AuthCtxValue {
  user: AuthUser | null;
  signOut: () => void;
  refreshUser: () => void;
}

export const AuthContext = createContext<AuthCtxValue>({
  user: null,
  signOut: () => {},
  refreshUser: () => {},
});

export const useAuth = () => useContext(AuthContext);
