import { createContext, useContext, useMemo, useState } from "react";
import { travelProfiles } from "../data/travelData";

const AuthContext = createContext(null);

const demoUser = travelProfiles[0];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(demoUser);

  const login = (profile) => {
    setUser(profile ?? demoUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
