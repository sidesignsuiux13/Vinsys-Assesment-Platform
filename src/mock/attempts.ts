import type { AuditLogEntry, TrainingSession } from '@/types';

export const AUDIT_LOG: AuditLogEntry[] = [
  { id: 'log-1', actor: 'Admin', action: 'created user Arjun Mehta', timestamp: '2026-03-02 09:14' },
  { id: 'log-2', actor: 'Admin', action: 'created user Priya Sharma', timestamp: '2026-03-02 09:18' },
  { id: 'log-3', actor: 'Admin', action: 'published assessment "FSWD Final Assessment"', timestamp: '2026-03-05 11:02' },
  { id: 'log-4', actor: 'Trainer', action: 'scheduled session "React Essentials"', timestamp: '2026-03-12 14:30' },
  { id: 'log-5', actor: 'Arjun Mehta', action: 'completed module "Node.js & APIs"', timestamp: '2026-04-18 16:45' },
  { id: 'log-6', actor: 'Arjun Mehta', action: 'submitted assessment "FSWD Final Assessment"', timestamp: '2026-04-20 10:32' },
  { id: 'log-7', actor: 'Priya Sharma', action: 'submitted assessment "FSWD Final Assessment"', timestamp: '2026-04-20 11:05' },
  { id: 'log-8', actor: 'HR', action: 'shortlisted candidate Arjun Mehta', timestamp: '2026-04-21 09:50' },
];

export const TRAINING_SESSIONS: TrainingSession[] = [
  { id: 'sess-1', date: '2026-03-08', course: 'Full Stack Web Development', module: 'HTML & CSS Fundamentals', mode: 'Online', duration: '2h', time: '10:00' },
  { id: 'sess-2', date: '2026-03-15', course: 'Full Stack Web Development', module: 'JavaScript Core', mode: 'Online', duration: '3h', time: '10:00' },
  { id: 'sess-3', date: '2026-03-29', course: 'Full Stack Web Development', module: 'React Essentials', mode: 'Hybrid', duration: '3h', time: '14:00' },
  { id: 'sess-4', date: '2026-04-12', course: 'Full Stack Web Development', module: 'Node.js & APIs', mode: 'Offline', duration: '2h', time: '11:00' },
];
