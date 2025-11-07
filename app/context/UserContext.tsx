"use client";
import React, { useState, useContext, createContext, useEffect } from "react";

export type AppUser = {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
} | null;
type UserContextType = {
  user: AppUser;
  setUser: React.Dispatch<React.SetStateAction<AppUser>>; // permet de set les paramètres dans le setter
  ready: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined); // creation du context

export function UserProvider({
  initialUser = null,
  children,
}: {
  initialUser?: AppUser;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser>(initialUser);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  return (
    <UserContext.Provider value={{ user, setUser, ready }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("User must be used within a userProvider");
  }

  return context;
};
