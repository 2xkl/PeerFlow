'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import type { UserDto, UserRole } from '@peerflow/shared';

export function UserManagement() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    role: 'user' as UserRole,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get<UserDto[]>('/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post('/users', newUser);
      setDialogOpen(false);
      setNewUser({ username: '', password: '', email: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleToggleRole = async (user: UserDto) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/users/${user.id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const handleToggleActive = async (user: UserDto) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading users...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users and their permissions</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <Input
                  id="newUsername"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">Email (optional)</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRole">Role</Label>
                <select
                  id="newRole"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as UserRole })
                  }
                  className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
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
                <div>
                  <p className="font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.email || 'No email'} &bull; {user.role} &bull;{' '}
                    {user.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleRole(user)}
                  title={
                    user.role === 'admin'
                      ? 'Demote to user'
                      : 'Promote to admin'
                  }
                >
                  <Shield
                    className={`h-4 w-4 ${user.role === 'admin' ? 'text-primary' : ''}`}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleActive(user)}
                >
                  {user.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUser(user.id)}
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
