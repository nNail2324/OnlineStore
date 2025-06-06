import { createContext } from 'react';

function noop() {}

export const AuthContext = createContext({
  token: null,
  userId: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  role: null,
  cart: [],
  setCart: () => {},
});