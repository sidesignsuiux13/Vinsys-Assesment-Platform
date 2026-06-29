import type { Role } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  trainer: 'Trainer',
  hr: 'HR',
  student: 'Student',
};

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin/dashboard',
  trainer: '/trainer/dashboard',
  hr: '/hr/dashboard',
  student: '/student/dashboard',
};

export const AUTH_STORAGE_KEY = 'vinsys_auth';
export const ATTEMPT_STORAGE_KEY = 'vinsys_attempt';

export const progressKey = (userId: string) => `vinsys_progress_${userId}`;
export const practiceKey = (userId: string) => `vinsys_practice_${userId}`;
export const feedbackKey = (userId: string) => `vinsys_feedback_${userId}`;

export const MAX_VIOLATIONS = 3;

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function minutesFromSeconds(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}
