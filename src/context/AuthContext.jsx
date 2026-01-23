import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Check if user is already logged in on page load
  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. Login Action
  const login = (userData) => {
    // Save non-sensitive user info to LocalStorage
    localStorage.setItem("crm_user", JSON.stringify(userData));
    setUser(userData);
    navigate("/dashboard");
  };

  // 3. Logout Action
  const logout = () => {
    // Clear storage
    localStorage.removeItem("crm_user");
    setUser(null);
    
    // Optional: Call backend logout API to clear cookies
    navigate("/");
  };

  // 4. Helper to check permissions easily in components
  const canAccess = (module, subModule, action = "read") => {
    if (!user?.role?.permissions) return false;
    
    const modPerms = user.role.permissions[module];
    if (!modPerms) return false;

    if (!subModule) return modPerms[action] === true;
    
    return modPerms[subModule] && modPerms[subModule][action] === true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, canAccess, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);