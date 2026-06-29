import { progressKey, practiceKey } from './constants';
import { COURSE } from '@/mock/courses';

export interface PracticeStats {
  attempted: number;
  correct: number;
  totalTimeSeconds: number;
}

export function getCompletedModules(userId: string): string[] {
  try {
    const raw = localStorage.getItem(progressKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setModuleComplete(userId: string, moduleId: string): string[] {
  const current = new Set(getCompletedModules(userId));
  current.add(moduleId);
  const list = [...current];
  localStorage.setItem(progressKey(userId), JSON.stringify(list));
  return list;
}

export function getProgressPercent(userId: string): number {
  const done = getCompletedModules(userId).length;
  return Math.round((done / COURSE.modules.length) * 100);
}

export function getPracticeStats(userId: string): PracticeStats {
  try {
    const raw = localStorage.getItem(practiceKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { attempted: 0, correct: 0, totalTimeSeconds: 0 };
}

export function recordPractice(userId: string, correct: boolean, timeSeconds = 30) {
  const stats = getPracticeStats(userId);
  const next: PracticeStats = {
    attempted: stats.attempted + 1,
    correct: stats.correct + (correct ? 1 : 0),
    totalTimeSeconds: stats.totalTimeSeconds + timeSeconds,
  };
  localStorage.setItem(practiceKey(userId), JSON.stringify(next));
  return next;
}
