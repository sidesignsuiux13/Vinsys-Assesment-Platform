import { useNavigate } from 'react-router-dom';
import { Lock, Rocket, CheckCircle2, Target, Clock, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAuthStore } from '@/store/authStore';
import { COURSE } from '@/mock/courses';
import { getCompletedModules, getProgressPercent, getPracticeStats } from '@/lib/progress';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.currentUser)!;

  const completed = getCompletedModules(user.id);
  const percent = getProgressPercent(user.id);
  const unlocked = percent === 100;
  const practice = getPracticeStats(user.id);
  const avgTime = practice.attempted ? Math.round(practice.totalTimeSeconds / practice.attempted) : 0;
  const firstName = user.full_name.split(' ')[0];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-neutral-800">Welcome back, {firstName}</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Here's where you stand in your training.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 border-l-4 border-l-maroon-600">
          <h2 className="text-sm font-semibold text-neutral-800">{COURSE.title}</h2>
          <p className="text-xs text-neutral-400 mt-0.5">{COURSE.duration_hours} hours · {COURSE.modules.length} modules</p>
          <div className="mt-4">
            <ProgressBar value={percent} label="Course progress" showPercentage />
          </div>
          <p className="text-xs text-neutral-400 mt-2">{completed.length} of {COURSE.modules.length} modules completed</p>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/student/course')}>
            Continue learning
          </Button>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          {unlocked ? (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <Rocket className="h-5 w-5" />
                <h2 className="text-sm font-semibold text-neutral-800">Ready to attempt</h2>
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                You've completed all modules. The final assessment is now unlocked.
              </p>
              <Button className="mt-4" onClick={() => navigate('/student/assessment')}>
                Start Assessment
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-neutral-500">
                <Lock className="h-5 w-5" />
                <h2 className="text-sm font-semibold text-neutral-800">Assessment locked</h2>
              </div>
              <p className="text-sm text-neutral-500 mt-2">Complete all modules to unlock the final assessment.</p>
              <p className="text-xs text-neutral-400 mt-3">{completed.length} of {COURSE.modules.length} modules completed</p>
              <div className="mt-2">
                <ProgressBar value={percent} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PracticeCard icon={ListChecks} label="Questions Attempted" value={practice.attempted} />
        <PracticeCard icon={CheckCircle2} label="Correct Answers" value={practice.correct} />
        <PracticeCard icon={Clock} label="Avg Time / Question" value={avgTime ? `${avgTime}s` : '—'} />
      </div>
    </div>
  );
}

function PracticeCard({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string | number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon-50">
        <Icon className="h-5 w-5 text-maroon-600" />
      </div>
      <div>
        <p className="text-lg font-semibold text-maroon-600 leading-none">{value}</p>
        <p className="text-xs text-neutral-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
