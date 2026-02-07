'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { UserManagement } from '@/components/settings/user-management';

export default function SettingsPage() {
  const { user, isAdmin, refreshProfile, logout } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfileMessage(null);

    try {
      await api.put('/users/me', { username, email: email || null });
      await refreshProfile();
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: 'error',
        text: 'Password must be at least 6 characters',
      });
      return;
    }

    setSaving(true);

    try {
      await api.post('/users/me/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({
        type: 'success',
        text: 'Password changed successfully',
      });
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to change password',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {profileMessage && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    profileMessage.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Role:{' '}
                  <span className="capitalize font-medium text-foreground">
                    {user?.role}
                  </span>
                </span>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordMessage && (
                <div
                  className={`rounded-md p-3 text-sm ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin: User Management */}
        {isAdmin && <UserManagement />}

        {/* Logout */}
        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Manage your session</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
