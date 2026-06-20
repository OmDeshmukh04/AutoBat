// Auth state for the single AutoBat mobile app. Token + user persist in secure
// store; role drives which screens the user can see (RBAC is also enforced
// server-side).

import { create } from "zustand";
import { getItem, removeItem, setItem } from "./secure-storage";
import type { AuthUser } from "./api";

const TOKEN_KEY = "autobat.token";
const USER_KEY = "autobat.user";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  setUser: (user: AuthUser) => Promise<void>;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: async (token, user) => {
    await setItem(TOKEN_KEY, token);
    await setItem(USER_KEY, JSON.stringify(user));
    set({ token, user });
  },

  // Persist a refreshed profile (e.g. from api.me()) so it survives restarts.
  setUser: async (user) => {
    await setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  hydrate: async () => {
    const token = await getItem(TOKEN_KEY);
    const rawUser = await getItem(USER_KEY);
    let user: AuthUser | null = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser) as AuthUser;
      } catch {
        user = null;
      }
    }
    set({ token, user, hydrated: true });
  },

  signOut: async () => {
    await removeItem(TOKEN_KEY);
    await removeItem(USER_KEY);
    set({ token: null, user: null });
  }
}));
