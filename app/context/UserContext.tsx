"use client";
import React, { useState, useContext, createContext, useEffect } from "react";

export type AppUser = {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin:boolean,
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

  useEffect(() => {
    setReady(true);

    // Only validate if we have an initial user (from server-side cookie)
    // This prevents interfering with client-side login flow
    if (!initialUser) {
      return;
    }

    // Validate session periodically, not on initial mount
    // This checks if the session expired while user is browsing
    const validateSession = async () => {
      try {
        const res = await fetch("/api/session", {
          method: "GET",
          credentials: "include",
        });

        // Only clear user if we get a definitive 401 (unauthorized)
        if (res.status === 401) {
          setUser(null);
        }
      } catch (error) {
        // Don't clear user on network errors - could be temporary
        console.error("Session validation failed:", error);
      }
    };

    // Check session after 5 seconds, then every 5 minutes
    const initialTimer = setTimeout(() => {
      validateSession();
    }, 5000);

    const interval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

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
