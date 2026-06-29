import { useState } from 'react';
import { Plus, Star, Video } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { TRAINING_SESSIONS } from '@/mock/attempts';
import { COURSE } from '@/mock/courses';
import { uuid } from '@/lib/constants';
import type { TrainingSession } from '@/types';

const STUDENT_PROGRESS = [
  { name: 'Arjun Mehta', modules: 4, status: 'completed', lastActive: '2026-04-20' },
  { name: 'Priya Sharma', modules: 4, status: 'completed', lastActive: '2026-04-20' },
  { name: 'Rahul Nair', modules: 2, status: 'in_progress', lastActive: '2026-04-19' },
];

const ATTENDANCE_DATA = [
  { week: 'W1', attendance: 78 },
  { week: 'W2', attendance: 84 },
  { week: 'W3', attendance: 88 },
  { week: 'W4', attendance: 92 },
];

const MODULE_COMPLETION = [
  { module: 'HTML', completed: 3 },
  { module: 'JS', completed: 3 },
  { module: 'React', completed: 2 },
  { module: 'APIs', completed: 2 },
];

export default function TrainerDashboard() {
  const push = useToastStore((s) => s.push);
  const [sessions, setSessions] = useState<TrainingSession[]>(() => [...TRAINING_SESSIONS]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    module: COURSE.modules[0].title,
    date: '2026-05-10',
    time: '10:00',
    duration: '2h',
    mode: 'Online' as TrainingSession['mode'],
  });

  const schedule = () => {
    const s: TrainingSession = {
      id: uuid(),
      date: form.date,
      course: COURSE.title,
      module: form.module,
      mode: form.mode,
      duration: form.duration,
      time: form.time,
    };
    setSessions((prev) => [...prev, s].sort((a, b) => a.date.localeCompare(b.date)));
    push('success', 'Session scheduled.');
    setOpen(false);
  };

  const sessionCols: Column<TrainingSession>[] = [
    { key: 'date', label: 'Date', render: (s) => <span className="font-medium text-neutral-800">{s.date}</span> },
    { key: 'module', label: 'Module' },
    { key: 'mode', label: 'Mode', render: (s) => <Badge variant="neutral">{s.mode}</Badge> },
    { key: 'duration', label: 'Duration' },
    {
      key: 'join',
      label: 'Session',
      render: (s) => (
        <Button
          size="sm"
          variant="secondary"
          disabled={s.mode === 'Offline'}
          onClick={() => {
            window.open(`/session-room?role=trainer&module=${encodeURIComponent(s.module)}`, '_blank', 'noopener,noreferrer');
            push('success', 'Opening session room...');
          }}
        >
          <Video className="h-4 w-4" />
          Join Session
        </Button>
      ),
    },
  ];

  const progressCols: Column<(typeof STUDENT_PROGRESS)[number]>[] = [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-neutral-800">{r.name}</span> },
    { key: 'modules', label: 'Modules', render: (r) => `${r.modules}/4` },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <Badge variant={r.status === 'completed' ? 'active' : 'medium'}>{r.status === 'completed' ? 'Completed' : 'In Progress'}</Badge>,
    },
    { key: 'lastActive', label: 'Last Active', render: (r) => <span className="text-neutral-500">{r.lastActive}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-800">Training Sessions</h2>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Schedule
            </Button>
          </div>
          <DataTable columns={sessionCols} data={sessions} rowKey={(s) => s.id} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-800">Student Progress</h2>
          </div>
          <DataTable columns={progressCols} data={STUDENT_PROGRESS} rowKey={(r) => r.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Attendance Trend</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ATTENDANCE_DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#7B1C1C" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Module Completion</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MODULE_COMPLETION} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
                <XAxis dataKey="module" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F9F0F0' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
                <Bar dataKey="completed" name="Completed Students" fill="#7B1C1C" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Session Feedback</h2>
        <div className="border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-800">Arjun Mehta</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-4 w-4 ${n <= 5 ? 'fill-maroon-600 text-maroon-600' : 'text-neutral-200'}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            "The React Essentials session was excellent — the live coding examples made hooks finally click for me."
          </p>
        </div>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Schedule Session"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={schedule}>Schedule</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select label="Course" defaultValue={COURSE.id}>
            <option value={COURSE.id}>{COURSE.title}</option>
          </Select>
          <Select label="Module" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
            {COURSE.modules.map((m) => (
              <option key={m.id} value={m.title}>{m.title}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            <Input label="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Select label="Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value as TrainingSession['mode'] })}>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
