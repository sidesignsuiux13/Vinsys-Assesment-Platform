import type { User } from '@/types';

export const USERS: User[] = [
  {
    id: 'user-admin',
    full_name: 'Admin User',
    email: 'admin@vinsys.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'user-trainer',
    full_name: 'Sneha Kulkarni',
    email: 'trainer@vinsys.com',
    password: 'Trainer@123',
    role: 'trainer',
    status: 'active',
  },
  {
    id: 'user-hr',
    full_name: 'Vikram Desai',
    email: 'hr@vinsys.com',
    password: 'HR@123',
    role: 'hr',
    status: 'active',
  },
  {
    id: 'user-student1',
    full_name: 'Arjun Mehta',
    email: 'student1@vinsys.com',
    password: 'Student@123',
    role: 'student',
    status: 'active',
    course_id: 'course-1',
    training_status: 'completed',
    enrollment_date: '2026-03-02',
  },
  {
    id: 'user-student2',
    full_name: 'Priya Sharma',
    email: 'student2@vinsys.com',
    password: 'Student@123',
    role: 'student',
    status: 'active',
    course_id: 'course-1',
    training_status: 'completed',
    enrollment_date: '2026-03-02',
  },
  {
    id: 'user-student3',
    full_name: 'Rahul Nair',
    email: 'student3@vinsys.com',
    password: 'Student@123',
    role: 'student',
    status: 'active',
    course_id: 'course-1',
    training_status: 'in_progress',
    enrollment_date: '2026-03-10',
  },
];

// Set by login; not persisted here (authStore + localStorage own session state).
export let CURRENT_USER: User | null = null;

export function setCurrentUser(user: User | null) {
  CURRENT_USER = user;
}

export function findUserByEmail(email: string): User | undefined {
  return USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export const DEMO_CREDENTIALS = [
  { role: 'Admin', email: 'admin@vinsys.com', password: 'Admin@123' },
  { role: 'Trainer', email: 'trainer@vinsys.com', password: 'Trainer@123' },
  { role: 'HR', email: 'hr@vinsys.com', password: 'HR@123' },
  { role: 'Student', email: 'student1@vinsys.com', password: 'Student@123' },
  { role: 'Student', email: 'student2@vinsys.com', password: 'Student@123' },
  { role: 'Student', email: 'student3@vinsys.com', password: 'Student@123' },
];
