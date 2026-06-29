import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { Role } from '@/types';

interface RoleGuardProps {
  role: Role;
  children: ReactNode;
}

export function RoleGuard({ role, children }: RoleGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
