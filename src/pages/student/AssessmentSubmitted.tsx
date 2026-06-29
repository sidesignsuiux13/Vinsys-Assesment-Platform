import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AssessmentSubmitted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-maroon-600">VINSYS</h1>
        <p className="text-xs text-neutral-400">Assessment Portal</p>
      </div>

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-semibold text-neutral-800">Assessment submitted</h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm">
        Your responses have been recorded. Results will be available shortly.
      </p>

      <Button className="mt-6" onClick={() => navigate('/student/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
