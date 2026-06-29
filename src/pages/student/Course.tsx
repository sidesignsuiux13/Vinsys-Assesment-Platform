import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, BookOpen } from 'lucide-react';
import ModuleView from './ModuleView';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/components/ui/Toast';
import { COURSE } from '@/mock/courses';
import { getCompletedModules, setModuleComplete } from '@/lib/progress';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentCourse() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const user = useAuthStore((s) => s.currentUser)!;
  const push = useToastStore((s) => s.push);

  const [completed, setCompleted] = useState<string[]>(() => getCompletedModules(user.id));
  const [selectedId, setSelectedId] = useState<string | null>(moduleId ?? null);

  useEffect(() => {
    if (moduleId) setSelectedId(moduleId);
  }, [moduleId]);

  const modules = COURSE.modules;
  const firstIncompleteIndex = modules.findIndex((m) => !completed.includes(m.id));
  const currentIndex = firstIncompleteIndex === -1 ? modules.length : firstIncompleteIndex;
  const allDone = completed.length === modules.length;

  const isUnlocked = (index: number) => index <= currentIndex;

  const selectModule = (index: number) => {
    if (!isUnlocked(index)) return;
    const m = modules[index];
    setSelectedId(m.id);
    navigate(`/student/course/${m.id}`);
  };

  const handleComplete = (moduleId: string) => {
    const list = setModuleComplete(user.id, moduleId);
    setCompleted(list);
    if (list.length === modules.length) {
      push('success', 'All modules complete! Assessment unlocked.');
    } else {
      push('success', 'Module marked as complete.');
    }
  };

  const selected = modules.find((m) => m.id === selectedId) ?? null;

  return (
    <div className="flex gap-6">
      <div className="w-72 shrink-0 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">Modules</h2>
        {modules.map((m, i) => {
          const done = completed.includes(m.id);
          const current = i === currentIndex && !done;
          const locked = !isUnlocked(i);
          const active = selectedId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => selectModule(i)}
              disabled={locked}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${
                active
                  ? 'border-maroon-200 bg-maroon-50'
                  : current
                  ? 'border-l-4 border-l-maroon-600 border-neutral-200 bg-white'
                  : 'border-neutral-200 bg-white'
              } ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:border-maroon-300'}`}
            >
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : locked ? (
                  <Lock className="h-4 w-4 text-neutral-300 shrink-0" />
                ) : (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-maroon-100 text-maroon-700 text-[10px] font-bold shrink-0">
                    {m.sequence}
                  </span>
                )}
                <span className={`text-sm font-medium ${locked ? 'text-neutral-300' : 'text-neutral-800'}`}>
                  {m.title}
                </span>
              </div>
              <p className={`text-xs mt-1 ml-6 ${locked ? 'text-neutral-300' : 'text-neutral-400'}`}>
                {m.estimated_minutes} min · {done ? 'Completed' : current ? 'In progress' : 'Locked'}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-xl p-6">
        {selected ? (
          <ModuleView
            key={selected.id}
            module={selected}
            isCompleted={completed.includes(selected.id)}
            allDone={allDone}
            onComplete={() => handleComplete(selected.id)}
          />
        ) : (
          <EmptyState icon={BookOpen} heading="Select a module to begin" subtext="Choose a module from the list to read its content and practice questions." />
        )}
      </div>
    </div>
  );
}
