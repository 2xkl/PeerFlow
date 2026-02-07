'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@peerflow/shared';

interface AuthState {
  token: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (token: string, user: UserDto) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: UserDto) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'peerflow-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          state.isLoading = false;
        }
      },
    },
  ),
);
