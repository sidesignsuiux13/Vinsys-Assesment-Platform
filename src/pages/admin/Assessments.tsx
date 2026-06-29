import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { ASSESSMENTS } from '@/mock/assessments';
import { MCQ_QUESTIONS, CODING_QUESTIONS } from '@/mock/questions';
import { COURSE } from '@/mock/courses';
import { uuid } from '@/lib/constants';
import type { Assessment, AssessmentStatus } from '@/types';

const STATUS_BADGE: Record<AssessmentStatus, BadgeVariant> = {
  draft: 'draft',
  active: 'active',
  closed: 'closed',
};

export default function AdminAssessments() {
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);
  const [items, setItems] = useState<Assessment[]>(() => ASSESSMENTS.map((a) => ({ ...a })));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    duration: 60,
    total: 40,
    passing: 24,
    negative: false,
    mcqIds: MCQ_QUESTIONS.map((q) => q.id),
    codingIds: CODING_QUESTIONS.map((q) => q.id),
  });

  const save = (status: AssessmentStatus) => {
    if (!form.title.trim()) {
      push('error', 'Assessment title is required.');
      return;
    }
    const a: Assessment = {
      id: uuid(),
      title: form.title,
      course_id: COURSE.id,
      duration_minutes: form.duration,
      total_marks: form.total,
      passing_marks: form.passing,
      negative_marking: form.negative,
      status,
      mcq_question_ids: form.mcqIds,
      coding_question_ids: form.codingIds,
    };
    setItems((prev) => [a, ...prev]);
    push('success', status === 'active' ? 'Assessment activated.' : 'Assessment saved as draft.');
    setOpen(false);
    setForm({ title: '', duration: 60, total: 40, passing: 24, negative: false, mcqIds: MCQ_QUESTIONS.map((q) => q.id), codingIds: CODING_QUESTIONS.map((q) => q.id) });
  };

  const toggleId = (key: 'mcqIds' | 'codingIds', id: string) => {
    setForm((f) => {
      const list = f[key];
      return { ...f, [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });
  };

  const columns: Column<Assessment>[] = [
    { key: 'title', label: 'Title', render: (a) => <span className="font-medium text-neutral-800">{a.title}</span> },
    { key: 'course', label: 'Course', render: () => <span className="text-neutral-500">FSWD</span> },
    { key: 'duration', label: 'Duration', render: (a) => <span className="text-neutral-500">{a.duration_minutes} min</span> },
    { key: 'total', label: 'Total Marks', render: (a) => a.total_marks },
    { key: 'passing', label: 'Passing', render: (a) => a.passing_marks },
    { key: 'status', label: 'Status', render: (a) => <Badge variant={STATUS_BADGE[a.status]} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (a) => (
        <button onClick={() => navigate(`/admin/assessments/${a.id}`)} className="flex items-center gap-1 text-xs text-maroon-600 hover:underline">
          <Eye className="h-3.5 w-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={items} rowKey={(a) => a.id} />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Assessment"
        width={560}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => save('draft')}>Save as Draft</Button>
            <Button onClick={() => save('active')}>Activate</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. FSWD Mid-term" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Course" defaultValue={COURSE.id}>
              <option value={COURSE.id}>{COURSE.title}</option>
            </Select>
            <Input label="Duration (min)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            <Input label="Total Marks" type="number" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
            <Input label="Passing Marks" type="number" value={form.passing} onChange={(e) => setForm({ ...form, passing: Number(e.target.value) })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" checked={form.negative} onChange={(e) => setForm({ ...form, negative: e.target.checked })} className="accent-maroon-600" />
            Enable negative marking
          </label>

          <div>
            <p className="text-sm font-medium text-neutral-700 mb-1.5">MCQ questions ({form.mcqIds.length})</p>
            <div className="max-h-32 overflow-y-auto border border-neutral-200 rounded-lg p-2 space-y-1">
              {MCQ_QUESTIONS.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={form.mcqIds.includes(q.id)} onChange={() => toggleId('mcqIds', q.id)} className="accent-maroon-600 mt-0.5" />
                  <span className="line-clamp-1">{q.question_text}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-700 mb-1.5">Coding questions ({form.codingIds.length})</p>
            <div className="border border-neutral-200 rounded-lg p-2 space-y-1">
              {CODING_QUESTIONS.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-xs text-neutral-600">
                  <input type="checkbox" checked={form.codingIds.includes(q.id)} onChange={() => toggleId('codingIds', q.id)} className="accent-maroon-600 mt-0.5" />
                  <span className="line-clamp-1">{q.question_text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
