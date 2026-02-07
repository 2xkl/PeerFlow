'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type {
  LoginResponseDto,
  SystemStatusDto,
  UserDto,
} from '@peerflow/shared';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setAuth, clearAuth, updateUser } =
    useAuthStore();

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await api.post<LoginResponseDto>('/auth/login', {
        username,
        password,
      });
      setAuth(response.accessToken, response.user);
      router.push('/');
    },
    [setAuth, router],
  );

  const register = useCallback(
    async (username: string, password: string, email?: string) => {
      const response = await api.post<LoginResponseDto>('/auth/register', {
        username,
        password,
        email,
      });
      setAuth(response.accessToken, response.user);
      router.push('/');
    },
    [setAuth, router],
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  const checkSystemStatus = useCallback(async () => {
    const response = await api.get<SystemStatusDto>('/auth/status');
    return response;
  }, []);

  const refreshProfile = useCallback(async () => {
    const updatedUser = await api.get<UserDto>('/users/me');
    updateUser(updatedUser);
    return updatedUser;
  }, [updateUser]);

  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    checkSystemStatus,
    refreshProfile,
  };
}
