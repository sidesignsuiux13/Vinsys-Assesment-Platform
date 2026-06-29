import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { useToastStore } from '@/components/ui/Toast';
import { getCourse } from '@/mock/courses';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen } from 'lucide-react';

interface ModuleRow {
  id: string;
  title: string;
}

export default function AdminCourseDetail() {
  const { id } = useParams();
  const course = getCourse(id ?? '');
  const push = useToastStore((s) => s.push);

  const [modules, setModules] = useState<ModuleRow[]>(
    () => course?.modules.map((m) => ({ id: m.id, title: m.title })) ?? []
  );
  const [newTitle, setNewTitle] = useState('');

  if (!course) {
    return <EmptyState icon={BookOpen} heading="Course not found" subtext="The requested course does not exist." />;
  }

  const addModule = () => {
    if (!newTitle.trim()) return;
    setModules((prev) => [...prev, { id: `module-${Date.now()}`, title: newTitle.trim() }]);
    push('success', `Module "${newTitle.trim()}" added.`);
    setNewTitle('');
  };

  const removeModule = (mid: string) => {
    setModules((prev) => prev.filter((m) => m.id !== mid));
    push('info', 'Module removed.');
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Breadcrumb items={[{ label: 'Courses', to: '/admin/courses' }, { label: course.title }]} />

      <div>
        <h1 className="text-xl font-semibold text-neutral-800">{course.title}</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          {course.duration_hours} hours · {modules.length} modules
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-100">
        {modules.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3">
            <GripVertical className="h-4 w-4 text-neutral-300 cursor-grab" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon-50 text-maroon-700 text-xs font-semibold">
              {i + 1}
            </span>
            <span className="flex-1 text-sm text-neutral-800">{m.title}</span>
            <button className="text-neutral-400 hover:text-maroon-600" title="Edit">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => removeModule(m.id)} className="text-neutral-400 hover:text-red-600" title="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2 px-4 py-3">
          <Input
            placeholder="New module name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addModule()}
            className="flex-1"
          />
          <Button onClick={addModule}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
