// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");

    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
      setIsAuthenticated(true);
    }
  }, []);

  const updateProfile = (updatedProfile: any) => {
    setUserProfile(updatedProfile);
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile)); // Persist in localStorage
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
