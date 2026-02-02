import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const demoUser = {
  id: "u1",
  name: "Avery Blake",
  handle: "@averyb",
  avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&w=200&h=200"
};

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
