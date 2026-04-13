import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedPermissions = localStorage.getItem('permissions');
    
    if (savedUser && savedPermissions) {
      setUser(JSON.parse(savedUser));
      setPermissions(JSON.parse(savedPermissions));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
        setUser(response.data.user);
        setPermissions(response.data.permissions);
        return { success: true, user: response.data.user };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setPermissions({});
  };

  const hasPermission = (permission) => {
    if (user?.role === 'admin') return true;
    return permissions[permission] === true;
  };

  const canAccessModule = (moduleName) => {
    if (user?.role === 'admin') return true;
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      loading,
      login,
      logout,
      hasPermission,
      canAccessModule
    }}>
      {children}
    </AuthContext.Provider>
  );
};