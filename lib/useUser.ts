"use client";

import { useEffect, useState, useCallback } from "react";
import { User, clearCurrentUser, getOrCreateUser, updateCurrentUser } from "./user";

export default function useUser() {
  const [user, setUser] = useState<User>(getOrCreateUser());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user on component mount
  useEffect(() => {
    const currentUser = getOrCreateUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const update = useCallback((updates: Partial<User>) => {
    try {
      const updated = updateCurrentUser(updates);
      setUser(updated);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }, []);

  const clear = useCallback(() => {
    clearCurrentUser();
  }, []);

  return { user, update, clear, isLoading } as const;
}
