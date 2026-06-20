// Auth state for the single AutoBat mobile app. Token persists in secure store;
// role drives which screens the user can see (RBAC is also enforced server-side).

import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "./api";

const TOKEN_KEY = "autobat.token";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (token: string, user: AuthUser) => Promise<void>;
  hydrate: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: async (token, user) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    set({ token, user });
  },

  hydrate: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({ token, hydrated: true });
  },

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ token: null, user: null });
  }
}));
