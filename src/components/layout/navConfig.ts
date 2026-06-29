import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileQuestion,
  ClipboardList,
  BarChart3,
  LineChart,
  Settings,
  GraduationCap,
  CalendarDays,
  Trophy,
  MessageSquare,
  Award,
  LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Question Bank', to: '/admin/questions', icon: FileQuestion },
    { label: 'Scheduled Assessments', to: '/admin/assessments', icon: ClipboardList },
    { label: 'Results', to: '/admin/results', icon: LineChart },
    { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
    { label: 'Admin Settings', to: '/admin/settings', icon: Settings },
  ],
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Course', to: '/student/course', icon: GraduationCap },
    { label: 'Assessment', to: '/student/assessment', icon: ClipboardList },
    { label: 'Results', to: '/student/results', icon: Award },
    { label: 'Feedbacks', to: '/student/feedbacks', icon: MessageSquare },
  ],
  trainer: [
    { label: 'Dashboard', to: '/trainer/dashboard', icon: LayoutDashboard },
    { label: 'Sessions', to: '/trainer/sessions', icon: CalendarDays },
    { label: 'Reports', to: '/trainer/reports', icon: BarChart3 },
    { label: 'Feedbacks', to: '/trainer/feedbacks', icon: MessageSquare },
  ],
  hr: [
    { label: 'Dashboard', to: '/hr/dashboard', icon: LayoutDashboard },
    { label: 'Rankings', to: '/hr/rankings', icon: Trophy },
    { label: 'Feedback Forms', to: '/hr/feedback-forms', icon: MessageSquare },
  ],
};

// Map a pathname to a page title for the TopNav.
export const TITLE_BY_PATH: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'User Management',
  '/admin/courses': 'Courses',
  '/admin/questions': 'Question Bank',
  '/admin/assessments': 'Scheduled Assessments',
  '/admin/results': 'Results',
  '/admin/reports': 'Reports & Analytics',
  '/admin/settings': 'Admin Settings',
  '/profile': 'My Profile',
  '/student/dashboard': 'Dashboard',
  '/student/course': 'My Course',
  '/student/assessment': 'Assessment',
  '/student/results': 'My Results',
  '/student/feedback': 'Feedbacks',
  '/student/feedbacks': 'Feedbacks',
  '/trainer/dashboard': 'Dashboard',
  '/trainer/sessions': 'Session Management',
  '/trainer/reports': 'Reports',
  '/trainer/feedbacks': 'Feedbacks',
  '/hr/dashboard': 'HR Dashboard',
  '/hr/rankings': 'Rankings & Reports',
  '/hr/feedback-forms': 'Feedback Forms',
};
