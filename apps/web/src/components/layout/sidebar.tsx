'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Download,
  Library,
  Search,
  Settings,
  Home,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/downloads', label: 'Downloads', icon: Download },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card flex flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">P</span>
        </div>
        <span className="text-lg font-semibold">PeerFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center ${
                user.role === 'admin' ? 'bg-primary/10' : 'bg-muted'
              }`}
            >
              {user.role === 'admin' ? (
                <Shield className="h-4 w-4 text-primary" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      )}
    </aside>
  );
}
