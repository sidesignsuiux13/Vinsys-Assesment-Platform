import { ChangeEvent, useMemo, useRef, useState } from 'react';
import {
  CalendarPlus,
  FilePlus2,
  FileQuestion,
  Pencil,
  Send,
  Upload,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/components/ui/Toast';
import { uuid } from '@/lib/constants';
import { USERS } from '@/mock/users';
import type { User } from '@/types';

type ExamMode = 'Online' | 'Offline' | 'Hybrid';
type PaperStatus = 'Draft' | 'Published';
type ScheduleStatus = 'Upcoming' | 'Invited' | 'Completed';

interface QuestionPaper {
  id: string;
  title: string;
  course: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  status: PaperStatus;
  lastUpdated: string;
}

interface ScheduledExam {
  id: string;
  examName: string;
  questionPaperId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  mode: ExamMode;
  invitedUserIds: string[];
  status: ScheduleStatus;
}

const initialPapers: QuestionPaper[] = [
  {
    id: 'paper-fswd-final',
    title: 'FSWD Final Assessment Paper',
    course: 'Full Stack Web Development',
    category: 'Technical',
    durationMinutes: 90,
    totalMarks: 80,
    questionCount: 42,
    status: 'Published',
    lastUpdated: '2026-06-18',
  },
  {
    id: 'paper-react-basics',
    title: 'React Fundamentals Check',
    course: 'Full Stack Web Development',
    category: 'React',
    durationMinutes: 45,
    totalMarks: 35,
    questionCount: 24,
    status: 'Draft',
    lastUpdated: '2026-06-22',
  },
];

const initialSchedules: ScheduledExam[] = [
  {
    id: 'exam-july-fswd',
    examName: 'July FSWD Certification Exam',
    questionPaperId: 'paper-fswd-final',
    date: '2026-07-05',
    startTime: '10:00',
    durationMinutes: 90,
    mode: 'Online',
    invitedUserIds: ['user-student1', 'user-student2'],
    status: 'Invited',
  },
  {
    id: 'exam-react-practice',
    examName: 'React Practice Exam',
    questionPaperId: 'paper-react-basics',
    date: '2026-07-12',
    startTime: '14:30',
    durationMinutes: 45,
    mode: 'Hybrid',
    invitedUserIds: ['user-student3'],
    status: 'Upcoming',
  },
];

const paperDraftInitial = {
  title: '',
  course: 'Full Stack Web Development',
  category: 'Technical',
  durationMinutes: 60,
  totalMarks: 50,
  instructions: '',
  manualQuestions: '',
};

const scheduleDraftInitial = {
  examName: '',
  questionPaperId: '',
  date: '',
  startTime: '',
  durationMinutes: 60,
  mode: 'Online' as ExamMode,
  instructions: '',
  invitedUserIds: [] as string[],
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getStudentUsers(): User[] {
  return USERS.filter((user) => user.role === 'student');
}

function countManualQuestions(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;
}

export default function AdminExams() {
  const push = useToastStore((s) => s.push);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'papers' | 'schedule'>('papers');
  const [papers, setPapers] = useState<QuestionPaper[]>(initialPapers);
  const [schedules, setSchedules] = useState<ScheduledExam[]>(initialSchedules);
  const [paperModalOpen, setPaperModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [paperDraft, setPaperDraft] = useState(paperDraftInitial);
  const [scheduleDraft, setScheduleDraft] = useState(scheduleDraftInitial);
  const [csvQuestionCount, setCsvQuestionCount] = useState(0);

  const studentUsers = useMemo(() => getStudentUsers(), []);
  const paperById = useMemo(() => new Map(papers.map((paper) => [paper.id, paper])), [papers]);

  const resetPaperForm = () => {
    setPaperDraft(paperDraftInitial);
    setCsvQuestionCount(0);
  };

  const resetScheduleForm = () => {
    setScheduleDraft({
      ...scheduleDraftInitial,
      questionPaperId: papers[0]?.id ?? '',
      invitedUserIds: [],
    });
    setEditingScheduleId(null);
  };

  const openScheduleModal = () => {
    setEditingScheduleId(null);
    setScheduleDraft({
      ...scheduleDraftInitial,
      questionPaperId: papers[0]?.id ?? '',
      invitedUserIds: studentUsers.map((user) => user.id),
    });
    setScheduleModalOpen(true);
  };

  const openEditScheduleModal = (exam: ScheduledExam) => {
    setEditingScheduleId(exam.id);
    setScheduleDraft({
      examName: exam.examName,
      questionPaperId: exam.questionPaperId,
      date: exam.date,
      startTime: exam.startTime,
      durationMinutes: exam.durationMinutes,
      mode: exam.mode,
      instructions: '',
      invitedUserIds: exam.invitedUserIds,
    });
    setScheduleModalOpen(true);
  };

  const handleCSVUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result ?? '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const importedCount = Math.max(0, rows.length - 1);
      if (!importedCount) {
        push('error', 'No question rows found in the CSV.');
        return;
      }
      setCsvQuestionCount((count) => count + importedCount);
      push('success', `${importedCount} question${importedCount > 1 ? 's' : ''} added from CSV.`);
    };
    reader.onerror = () => push('error', 'Could not read the selected CSV file.');
    reader.readAsText(file);
  };

  const saveQuestionPaper = (status: PaperStatus) => {
    if (!paperDraft.title.trim()) {
      push('error', 'Question paper title is required.');
      return;
    }

    const manualQuestionCount = countManualQuestions(paperDraft.manualQuestions);
    const questionCount = manualQuestionCount + csvQuestionCount;

    if (!questionCount) {
      push('error', 'Add questions manually or upload a question set CSV.');
      return;
    }

    const paper: QuestionPaper = {
      id: uuid(),
      title: paperDraft.title,
      course: paperDraft.course,
      category: paperDraft.category,
      durationMinutes: paperDraft.durationMinutes,
      totalMarks: paperDraft.totalMarks,
      questionCount,
      status,
      lastUpdated: today(),
    };

    setPapers((current) => [paper, ...current]);
    push('success', status === 'Published' ? 'Question paper published.' : 'Question paper saved as draft.');
    setPaperModalOpen(false);
    resetPaperForm();
  };

  const toggleInvitee = (userId: string) => {
    setScheduleDraft((draft) => ({
      ...draft,
      invitedUserIds: draft.invitedUserIds.includes(userId)
        ? draft.invitedUserIds.filter((id) => id !== userId)
        : [...draft.invitedUserIds, userId],
    }));
  };

  const saveScheduledExam = () => {
    if (!scheduleDraft.examName.trim()) {
      push('error', 'Exam name is required.');
      return;
    }
    if (!scheduleDraft.questionPaperId) {
      push('error', 'Select a question paper.');
      return;
    }
    if (!scheduleDraft.date || !scheduleDraft.startTime) {
      push('error', 'Exam date and start time are required.');
      return;
    }

    const scheduledExam: ScheduledExam = {
      id: editingScheduleId ?? uuid(),
      examName: scheduleDraft.examName,
      questionPaperId: scheduleDraft.questionPaperId,
      date: scheduleDraft.date,
      startTime: scheduleDraft.startTime,
      durationMinutes: scheduleDraft.durationMinutes,
      mode: scheduleDraft.mode,
      invitedUserIds: scheduleDraft.invitedUserIds,
      status: scheduleDraft.invitedUserIds.length ? 'Invited' : 'Upcoming',
    };

    setSchedules((current) =>
      editingScheduleId
        ? current.map((exam) => (exam.id === editingScheduleId ? scheduledExam : exam))
        : [scheduledExam, ...current]
    );
    push('success', editingScheduleId ? 'Scheduled exam updated.' : 'Exam scheduled successfully.');
    setScheduleModalOpen(false);
    resetScheduleForm();
  };

  const inviteUsers = (exam: ScheduledExam) => {
    setSchedules((current) =>
      current.map((item) => (item.id === exam.id ? { ...item, status: 'Invited' } : item))
    );
    push('success', `Invite sent to ${exam.invitedUserIds.length} user${exam.invitedUserIds.length === 1 ? '' : 's'}.`);
  };

  const paperColumns: Column<QuestionPaper>[] = [
    {
      key: 'title',
      label: 'Question Paper',
      render: (paper) => (
        <div>
          <p className="font-medium text-neutral-800">{paper.title}</p>
          <p className="text-xs text-neutral-400">{paper.course}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (paper) => <span className="text-neutral-500">{paper.category}</span> },
    { key: 'duration', label: 'Duration', render: (paper) => <span>{paper.durationMinutes} min</span> },
    { key: 'marks', label: 'Marks', render: (paper) => <span className="font-medium">{paper.totalMarks}</span> },
    { key: 'questions', label: 'Questions', render: (paper) => paper.questionCount },
    {
      key: 'status',
      label: 'Status',
      render: (paper) => <Badge variant={paper.status === 'Published' ? 'active' : 'draft'}>{paper.status}</Badge>,
    },
    { key: 'updated', label: 'Updated', render: (paper) => <span className="text-neutral-500">{paper.lastUpdated}</span> },
  ];

  const scheduleColumns: Column<ScheduledExam>[] = [
    {
      key: 'examName',
      label: 'Exam',
      render: (exam) => (
        <div>
          <p className="font-medium text-neutral-800">{exam.examName}</p>
          <p className="text-xs text-neutral-400">{paperById.get(exam.questionPaperId)?.title ?? 'Question paper removed'}</p>
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (exam) => <span>{exam.date}</span> },
    { key: 'time', label: 'Time', render: (exam) => <span>{exam.startTime}</span> },
    { key: 'duration', label: 'Duration', render: (exam) => <span>{exam.durationMinutes} min</span> },
    { key: 'mode', label: 'Mode', render: (exam) => <Badge variant="neutral">{exam.mode}</Badge> },
    { key: 'invited', label: 'Users', render: (exam) => <span>{exam.invitedUserIds.length} invited</span> },
    {
      key: 'status',
      label: 'Status',
      render: (exam) => <Badge variant={exam.status === 'Completed' ? 'closed' : exam.status === 'Invited' ? 'active' : 'draft'}>{exam.status}</Badge>,
    },
    {
      key: 'edit',
      label: 'Edit',
      render: (exam) => (
        <Button size="sm" variant="ghost" onClick={() => openEditScheduleModal(exam)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      ),
    },
    {
      key: 'invite',
      label: 'Action',
      render: (exam) => (
        <Button size="sm" variant="secondary" onClick={() => inviteUsers(exam)} disabled={!exam.invitedUserIds.length}>
          <Send className="h-4 w-4" />
          Invite
        </Button>
      ),
    },
  ];

  const selectedPaper = paperById.get(scheduleDraft.questionPaperId);
  const totalQuestionSetCount = countManualQuestions(paperDraft.manualQuestions) + csvQuestionCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('papers')}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              activeTab === 'papers' ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <FileQuestion className="h-4 w-4" />
            Question Papers
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              activeTab === 'schedule' ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule Exam
          </button>
        </div>

        {activeTab === 'papers' ? (
          <Button onClick={() => setPaperModalOpen(true)}>
            <FilePlus2 className="h-4 w-4" />
            Add Question Paper
          </Button>
        ) : (
          <Button onClick={openScheduleModal}>
            <CalendarPlus className="h-4 w-4" />
            Schedule New Exam
          </Button>
        )}
      </div>

      {activeTab === 'papers' ? (
        <div className="bg-white border border-neutral-200 rounded-xl">
          <DataTable columns={paperColumns} data={papers} rowKey={(paper) => paper.id} />
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl">
          <DataTable columns={scheduleColumns} data={schedules} rowKey={(exam) => exam.id} />
        </div>
      )}

      <Modal
        isOpen={paperModalOpen}
        onClose={() => {
          setPaperModalOpen(false);
          resetPaperForm();
        }}
        title="Add Question Paper"
        width={680}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setPaperModalOpen(false); resetPaperForm(); }}>Cancel</Button>
            <Button variant="secondary" onClick={() => saveQuestionPaper('Draft')}>Save Draft</Button>
            <Button onClick={() => saveQuestionPaper('Published')}>Publish Paper</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Question Paper Title" value={paperDraft.title} onChange={(event) => setPaperDraft({ ...paperDraft, title: event.target.value })} placeholder="e.g. JavaScript Certification Paper" />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Course" value={paperDraft.course} onChange={(event) => setPaperDraft({ ...paperDraft, course: event.target.value })} />
            <Select label="Category" value={paperDraft.category} onChange={(event) => setPaperDraft({ ...paperDraft, category: event.target.value })}>
              <option>Technical</option>
              <option>React</option>
              <option>JavaScript</option>
              <option>Soft Skills</option>
              <option>HR Compliance</option>
            </Select>
            <Input label="Duration (minutes)" type="number" min={1} value={paperDraft.durationMinutes} onChange={(event) => setPaperDraft({ ...paperDraft, durationMinutes: Number(event.target.value) })} />
            <Input label="Total Marks" type="number" min={1} value={paperDraft.totalMarks} onChange={(event) => setPaperDraft({ ...paperDraft, totalMarks: Number(event.target.value) })} />
          </div>
          <Textarea label="Paper Instructions" rows={3} value={paperDraft.instructions} onChange={(event) => setPaperDraft({ ...paperDraft, instructions: event.target.value })} placeholder="Rules, marking scheme, allowed tools..." />

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-neutral-800">Upload Question Set</p>
                <p className="text-xs text-neutral-400">Add questions manually or bulk import using CSV.</p>
              </div>
              <Badge variant="neutral">{totalQuestionSetCount} questions</Badge>
            </div>
            <Textarea
              label="Manual Questions"
              rows={5}
              value={paperDraft.manualQuestions}
              onChange={(event) => setPaperDraft({ ...paperDraft, manualQuestions: event.target.value })}
              placeholder="Enter one question per line. Example: What is the output of console.log(typeof [])?"
            />
            <input ref={csvInputRef} type="file" accept=".csv,text/csv" onChange={handleCSVUpload} className="hidden" />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => csvInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              <span className="text-xs text-neutral-400">CSV rows are counted as imported questions for this paper.</span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => {
          setScheduleModalOpen(false);
          resetScheduleForm();
        }}
        title={editingScheduleId ? 'Edit Scheduled Exam' : 'Schedule New Exam'}
        width={720}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setScheduleModalOpen(false); resetScheduleForm(); }}>Cancel</Button>
            <Button onClick={saveScheduledExam}>{editingScheduleId ? 'Update Exam' : 'Schedule Exam'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Exam Name" value={scheduleDraft.examName} onChange={(event) => setScheduleDraft({ ...scheduleDraft, examName: event.target.value })} placeholder="e.g. August Certification Exam" />
          <div className="grid gap-3 md:grid-cols-2">
            <Select label="Question Paper" value={scheduleDraft.questionPaperId} onChange={(event) => setScheduleDraft({ ...scheduleDraft, questionPaperId: event.target.value })}>
              <option value="">Select question paper</option>
              {papers.map((paper) => (
                <option key={paper.id} value={paper.id}>{paper.title}</option>
              ))}
            </Select>
            <Input label="Duration (minutes)" type="number" min={1} value={scheduleDraft.durationMinutes} onChange={(event) => setScheduleDraft({ ...scheduleDraft, durationMinutes: Number(event.target.value) })} />
            <Input label="Exam Date" type="date" value={scheduleDraft.date} onChange={(event) => setScheduleDraft({ ...scheduleDraft, date: event.target.value })} />
            <Input label="Start Time" type="time" value={scheduleDraft.startTime} onChange={(event) => setScheduleDraft({ ...scheduleDraft, startTime: event.target.value })} />
            <Select label="Mode" value={scheduleDraft.mode} onChange={(event) => setScheduleDraft({ ...scheduleDraft, mode: event.target.value as ExamMode })}>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </Select>
            <div className="rounded-lg border border-neutral-200 px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Selected Paper</p>
              <p className="mt-1 text-sm font-medium text-neutral-800">{selectedPaper?.title ?? 'No paper selected'}</p>
            </div>
          </div>
          <Textarea label="Scheduling Instructions" rows={3} value={scheduleDraft.instructions} onChange={(event) => setScheduleDraft({ ...scheduleDraft, instructions: event.target.value })} placeholder="Exam room, meeting link, proctoring notes..." />

          <div className="rounded-xl border border-neutral-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                  <Users className="h-4 w-4 text-maroon-600" />
                  Invite Users
                </p>
                <p className="text-xs text-neutral-400">Select users to invite for this exam.</p>
              </div>
              <Badge variant="neutral">{scheduleDraft.invitedUserIds.length} selected</Badge>
            </div>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-neutral-200">
              {studentUsers.map((user) => (
                <label key={user.id} className="flex cursor-pointer items-center gap-3 border-b border-neutral-100 px-3 py-2 last:border-b-0 hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    checked={scheduleDraft.invitedUserIds.includes(user.id)}
                    onChange={() => toggleInvitee(user.id)}
                    className="accent-maroon-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-neutral-800">{user.full_name}</span>
                    <span className="block truncate text-xs text-neutral-400">{user.email}</span>
                  </span>
                  <Badge variant={user.training_status === 'completed' ? 'active' : 'draft'}>
                    {user.training_status?.replace('_', ' ') ?? 'not started'}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
