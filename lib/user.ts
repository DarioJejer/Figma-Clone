import { v4 as uuidv4 } from "uuid";

/**
 * User object structure for client-side user representation
 * Contains minimal user information for presence indicators and UI personalization
 */
export interface User {
  id: string;
  name: string;
  avatarColor: string;
}

/**
 * Available avatar colors for presence indicators
 * Using distinct colors for better visual differentiation between users
 */
export const AVATAR_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Light Blue
  "#F8B88B", // Peach
  "#A9CCE3", // Soft Blue
];

/**
 * Generates a random avatar color from the predefined palette
 */
function generateAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/**
 * Creates a new user object with a generated ID and random avatar color
 * @param name - User's display name
 * @returns User object with unique ID and avatar color
 */
export function createUser(name: string): User {
  return {
    id: uuidv4(),
    name,
    avatarColor: generateAvatarColor(),
  };
}

/**
 * Storage key for volatile user data in localStorage for development/demo purposes.
 */
const USER_STORAGE_KEY = "figma-clone-user";

/**
 * Retrieves or creates the current user from volatile storage
 * On first load, generates a new user with demo data
 * @returns Current user object
 */
export function getOrCreateUser(): User {
  // Check if user exists in localStorage
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as User;
    } catch (e) {
      console.warn("Failed to parse stored user, creating new user", e);
    }
  }

  // Create new user if not found
  const newUser = createUser("Anonymous User");
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

/**
 * Clears the user from volatile storage
 * Useful for testing or resetting the application state
 */
export function clearCurrentUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
}

/**
 * Retrieves the current user from volatile storage without creating a new one
 * 
 */
export function getCurrentUser(): User | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as User;
    } catch (e) {
      console.warn("Failed to parse stored user, creating new user", e);
    }
  }
  return null;
}

/**
 * Updates specific user properties while preserving other data
 * @param updates - Partial user object with properties to update
 * @returns Updated user object
 */
export function updateCurrentUser(updates: Partial<User>): User {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error("No current user found to update.");
  }
  const updatedUser = { ...currentUser, ...updates };
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}
