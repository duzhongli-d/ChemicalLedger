import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearAuthToken } from "./cookie";

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  setAuth: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

/**
 * Auth store for user data only.
 * Token is stored in HttpOnly cookie (set by backend on login/register).
 * We don't persist the token here - the browser handles cookie transmission.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,

      setAuth: (user: User) => {
        set({ user });
      },

      logout: async () => {
        try {
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/logout`,
            {
              method: "POST",
              credentials: "include",
            }
          );
        } catch {
          // Ignore network errors, proceed with local cleanup
        }
        set({ user: null });
        clearAuthToken();
      },

      isAuthenticated: () => !!get().user,

      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "auth",
      // Only persist user data, not token (token is in HttpOnly cookie)
      partialize: (state) => ({ user: state.user }),
    }
  )
);
