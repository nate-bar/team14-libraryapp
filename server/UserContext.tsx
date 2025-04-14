// src/context/UserContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface UserContextType {
  firstName: string;
  setFirstName: (firstName: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firstName, setFirstName] = useState<string>("");

  // Load firstName from the global context, or session if available
  useEffect(() => {
    const initialFirstName = window?.initialContext?.firstName || "";
    setFirstName(initialFirstName);
  }, []);

  return (
    <UserContext.Provider value={{ firstName, setFirstName }}>
      {children}
    </UserContext.Provider>
  );
};
