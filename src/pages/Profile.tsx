import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { ROLE_LABELS } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';

export default function Profile() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const push = useToastStore((s) => s.push);
  const [profileForm, setProfileForm] = useState({
    full_name: currentUser?.full_name ?? '',
    email: currentUser?.email ?? '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  });

  useEffect(() => {
    if (!currentUser) return;
    setProfileForm({ full_name: currentUser.full_name, email: currentUser.email });
  }, [currentUser]);

  if (!currentUser) return null;

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!profileForm.full_name.trim()) {
      push('error', 'Full name is required.');
      return;
    }
    if (!profileForm.email.trim() || !profileForm.email.includes('@')) {
      push('error', 'Enter a valid email address.');
      return;
    }
    updateProfile({
      full_name: profileForm.full_name.trim(),
      email: profileForm.email.trim(),
    });
    push('success', 'Profile details updated.');
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      push('error', 'Complete all password fields.');
      return;
    }
    if (passwordForm.next.length < 6) {
      push('error', 'New password must be at least 6 characters.');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      push('error', 'New password and confirmation do not match.');
      return;
    }
    const changed = changePassword(passwordForm.current, passwordForm.next);
    if (!changed) {
      push('error', 'Current password is incorrect.');
      return;
    }
    setPasswordForm({ current: '', next: '', confirm: '' });
    push('success', 'Password changed successfully.');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-maroon-600 text-lg font-semibold text-white">
            {currentUser.full_name
              .split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-800">{currentUser.full_name}</h2>
            <p className="text-sm text-neutral-500">{currentUser.email}</p>
            <Badge variant="neutral" className="mt-2">{ROLE_LABELS[currentUser.role]}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-maroon-600" />
            <h2 className="text-sm font-semibold text-neutral-800">Profile Details</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profileForm.full_name}
              onChange={(event) => setProfileForm({ ...profileForm, full_name: event.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
            />
            <Input label="Role" value={ROLE_LABELS[currentUser.role]} disabled />
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit">
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </form>

        <form onSubmit={savePassword} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-maroon-600" />
            <h2 className="text-sm font-semibold text-neutral-800">Change Password</h2>
          </div>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.current}
              onChange={(event) => setPasswordForm({ ...passwordForm, current: event.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.next}
              onChange={(event) => setPasswordForm({ ...passwordForm, next: event.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirm}
              onChange={(event) => setPasswordForm({ ...passwordForm, confirm: event.target.value })}
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit">
              <KeyRound className="h-4 w-4" />
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
