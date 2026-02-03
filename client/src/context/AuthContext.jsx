import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { removeStoredUser } from "../utils/userStorage";

const AuthContext = createContext(null);

const TOKEN_KEY = "pulse-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get("/users/me")
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = ({ user: nextUser, token }) => {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    setUser(nextUser ?? null);
  };

  const logout = () => {
    if (user) {
      removeStoredUser(user);
    }
    window.localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const updateUser = (nextUser) => {
    setUser(nextUser ?? null);
  };

  const value = useMemo(
    () => ({ user, login, logout, updateUser, isLoading }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
