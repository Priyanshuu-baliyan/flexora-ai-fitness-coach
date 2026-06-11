import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('flexora_token');
    const savedUser = localStorage.getItem('flexora_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await authService.login(credentials);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('flexora_token', data.token);
      localStorage.setItem('flexora_user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await authService.register(userData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('flexora_token', data.token);
      localStorage.setItem('flexora_user', JSON.stringify(data.user));
      toast.success('Account created successfully!');
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('flexora_token');
    localStorage.removeItem('flexora_user');
    toast.success('Logged out');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('flexora_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
