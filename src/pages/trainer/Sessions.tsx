import { useState } from 'react';
import { Plus } from 'lucide-react';
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

export default function TrainerSessions() {
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
    setSessions((prev) =>
      [...prev, { id: uuid(), date: form.date, course: COURSE.title, module: form.module, mode: form.mode, duration: form.duration, time: form.time }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    );
    push('success', 'Session scheduled.');
    setOpen(false);
  };

  const columns: Column<TrainingSession>[] = [
    { key: 'date', label: 'Date', render: (s) => <span className="font-medium text-neutral-800">{s.date}</span> },
    { key: 'time', label: 'Time', render: (s) => <span className="text-neutral-500">{s.time ?? '—'}</span> },
    { key: 'course', label: 'Course', render: () => <span className="text-neutral-500">FSWD</span> },
    { key: 'module', label: 'Module' },
    { key: 'mode', label: 'Mode', render: (s) => <Badge variant="neutral">{s.mode}</Badge> },
    { key: 'duration', label: 'Duration' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={sessions} rowKey={(s) => s.id} />
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
