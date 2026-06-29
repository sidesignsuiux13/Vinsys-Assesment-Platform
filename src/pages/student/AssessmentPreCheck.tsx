import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, Camera, Mic, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import { ASSESSMENT } from '@/mock/assessments';

type CheckState = 'pending' | 'granted' | 'denied';

function CheckRow({ icon: Icon, label, state }: { icon: typeof Wifi; label: string; state: CheckState }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-neutral-400" />
        <span className="text-sm text-neutral-700">{label}</span>
      </div>
      {state === 'pending' && <Loader2 className="h-5 w-5 text-neutral-300 animate-spin" />}
      {state === 'granted' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
      {state === 'denied' && <XCircle className="h-5 w-5 text-red-500" />}
    </div>
  );
}

export default function AssessmentPreCheck() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser)!;
  const startAttempt = useAssessmentStore((s) => s.startAttempt);

  const [camera, setCamera] = useState<CheckState>('pending');
  const [mic, setMic] = useState<CheckState>('pending');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        if (cancelled) return;
        setCamera('granted');
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => !cancelled && setCamera('denied'));

    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((stream) => {
        if (cancelled) return;
        setMic('granted');
        stream.getTracks().forEach((t) => t.stop());
      })
      .catch(() => !cancelled && setMic('denied'));

    return () => {
      cancelled = true;
    };
  }, []);

  const canStart = camera === 'granted' && confirmed;

  const start = () => {
    startAttempt();
    navigate('/student/assessment/session');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-neutral-800">Before you begin</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {ASSESSMENT.title} · {ASSESSMENT.duration_minutes} minutes · {ASSESSMENT.total_marks} marks
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-2">System Readiness</h2>
        <CheckRow icon={Wifi} label="Internet Connection" state="granted" />
        <CheckRow icon={Camera} label="Camera Access" state={camera} />
        <CheckRow icon={Mic} label="Microphone Access" state={mic} />
        {camera === 'denied' && (
          <p className="text-xs text-red-600 mt-2">
            Camera access is required to start the assessment. Please allow access and reload.
          </p>
        )}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Identity Confirmation</h2>
        <div className="bg-neutral-100 rounded-lg p-4">
          <p className="text-sm font-medium text-neutral-800">{user.full_name}</p>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <label className="flex items-center gap-2 mt-4 text-sm text-neutral-700 cursor-pointer">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="accent-maroon-600 h-4 w-4" />
          I confirm this is my identity.
        </label>
      </div>

      <Button
        size="lg"
        onClick={start}
        disabled={!canStart}
        className={!canStart ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Start Assessment
      </Button>
    </div>
  );
}
