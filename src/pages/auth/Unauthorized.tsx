import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { ROLE_HOME } from '@/lib/constants';

export default function Unauthorized() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon-50 mb-5">
        <ShieldAlert className="h-8 w-8 text-maroon-600" />
      </div>
      <h1 className="text-xl font-semibold text-neutral-800">Access denied</h1>
      <p className="mt-1 text-sm text-neutral-400 max-w-sm">
        You don't have permission to view this page with your current role.
      </p>
      <div className="mt-6 flex gap-2">
        {currentUser && (
          <Button onClick={() => navigate(ROLE_HOME[currentUser.role])}>Go to my dashboard</Button>
        )}
        <Button variant="secondary" onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </div>
    </div>
  );
}
