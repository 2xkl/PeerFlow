'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import type { SystemStatusDto } from '@peerflow/shared';

const publicPaths = ['/login', '/setup'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check system status (no auth required)
        const status = await api.get<SystemStatusDto>('/auth/status');

        // If no users exist, redirect to setup
        if (!status.isSetupComplete && pathname !== '/setup') {
          router.replace('/setup');
          return;
        }

        // If on setup but users exist, redirect to login
        if (status.isSetupComplete && pathname === '/setup') {
          router.replace('/login');
          return;
        }

        // If authenticated, allow access
        if (isAuthenticated) {
          if (publicPaths.includes(pathname)) {
            router.replace('/');
          }
          return;
        }

        // If not authenticated and not on public path, redirect to login
        if (!publicPaths.includes(pathname)) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!publicPaths.includes(pathname)) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
        setChecking(false);
      }
    };

    checkAuth();
  }, [pathname, isAuthenticated, router, setLoading]);

  if (checking || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
