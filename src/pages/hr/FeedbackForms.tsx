import { useState } from 'react';
import { FilePlus2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/components/ui/Toast';
import { COURSES } from '@/mock/courses';

interface FeedbackForm {
  id: string;
  course: string;
  title: string;
  questions: number;
  status: 'Draft' | 'Published';
}

const INITIAL_FORMS: FeedbackForm[] = [
  { id: 'fb-fswd-final', course: COURSES[0].title, title: 'Final Training Feedback', questions: 5, status: 'Published' },
  { id: 'fb-react-session', course: COURSES[0].title, title: 'React Session Feedback', questions: 4, status: 'Draft' },
];

export default function HRFeedbackForms() {
  const push = useToastStore((s) => s.push);
  const [forms, setForms] = useState<FeedbackForm[]>(INITIAL_FORMS);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    course: COURSES[0].title,
    title: '',
    description: '',
    questions: 5,
  });

  const saveForm = (status: FeedbackForm['status']) => {
    if (!draft.title.trim()) {
      push('error', 'Feedback form title is required.');
      return;
    }
    setForms((current) => [
      { id: `fb-${Date.now()}`, course: draft.course, title: draft.title, questions: draft.questions, status },
      ...current,
    ]);
    setOpen(false);
    setDraft({ course: COURSES[0].title, title: '', description: '', questions: 5 });
    push('success', status === 'Published' ? 'Feedback form published.' : 'Feedback form saved as draft.');
  };

  const columns: Column<FeedbackForm>[] = [
    { key: 'title', label: 'Feedback Form', render: (form) => <span className="font-medium text-neutral-800">{form.title}</span> },
    { key: 'course', label: 'Course', render: (form) => <span className="text-neutral-500">{form.course}</span> },
    { key: 'questions', label: 'Questions', render: (form) => form.questions },
    { key: 'status', label: 'Status', render: (form) => <Badge variant={form.status === 'Published' ? 'active' : 'draft'}>{form.status}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <FilePlus2 className="h-4 w-4" />
          Create Feedback Form
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={forms} rowKey={(form) => form.id} />
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create Feedback Form"
        width={560}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="secondary" onClick={() => saveForm('Draft')}>Save Draft</Button>
            <Button onClick={() => saveForm('Published')}>Publish</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Course" value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })}>
            {COURSES.map((course) => <option key={course.id} value={course.title}>{course.title}</option>)}
          </Select>
          <Input label="Form Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Final Course Feedback" />
          <Textarea label="Instructions" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Tell students what feedback you need..." />
          <Input label="Number of Questions" type="number" min={1} value={draft.questions} onChange={(event) => setDraft({ ...draft, questions: Number(event.target.value) })} />
        </div>
      </Modal>
    </div>
  );
}
