import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Layers, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToastStore } from '@/components/ui/Toast';
import { COURSES } from '@/mock/courses';
import { USERS } from '@/mock/users';
import { uuid } from '@/lib/constants';
import type { Course } from '@/types';

export default function AdminCourses() {
  const navigate = useNavigate();
  const push = useToastStore((s) => s.push);
  const enrolled = USERS.filter((u) => u.role === 'student').length;
  const [courses, setCourses] = useState<Course[]>(() => COURSES.map((course) => ({ ...course, modules: [...course.modules] })));
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    description: '',
    duration_hours: 40,
    trainerId: USERS.find((user) => user.role === 'trainer')?.id ?? '',
    mode: 'Online',
    level: 'Beginner',
    category: 'Technical',
    startDate: '',
    endDate: '',
    capacity: 30,
    location: '',
  });
  const trainers = USERS.filter((user) => user.role === 'trainer');

  const saveCourse = () => {
    if (!draft.title.trim()) {
      push('error', 'Course title is required.');
      return;
    }
    const course: Course = {
      id: uuid(),
      title: draft.title.trim(),
      description: draft.description.trim() || 'New course awaiting module content.',
      duration_hours: draft.duration_hours,
      modules: [],
    };
    setCourses((current) => [course, ...current]);
    setOpen(false);
    setDraft({ title: '', description: '', duration_hours: 40, trainerId: trainers[0]?.id ?? '', mode: 'Online', level: 'Beginner', category: 'Technical', startDate: '', endDate: '', capacity: 30, location: '' });
    const trainerName = trainers.find((trainer) => trainer.id === draft.trainerId)?.full_name;
    push('success', trainerName ? `Course added and assigned to ${trainerName}.` : 'Course added.');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-neutral-200 rounded-xl p-5 border-l-4 border-l-maroon-600"
          >
            <h2 className="text-lg font-semibold text-neutral-800">{course.title}</h2>
            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{course.description}</p>

            <div className="flex items-center gap-5 mt-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-neutral-400" />
                {course.duration_hours} hrs
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-neutral-400" />
                {course.modules.length} modules
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-neutral-400" />
                {enrolled} enrolled
              </span>
            </div>

            <Button className="mt-5" variant="secondary" onClick={() => navigate(`/admin/courses/${course.id}`)}>
              Manage
            </Button>
          </div>
        ))}
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Add Course"
        width={520}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveCourse}>Add Course</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Course Title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Advanced React" />
          <Textarea label="Description" rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Briefly describe this course..." />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Assign Trainer" value={draft.trainerId} onChange={(event) => setDraft({ ...draft, trainerId: event.target.value })}>
              {trainers.map((trainer) => (
                <option key={trainer.id} value={trainer.id}>{trainer.full_name}</option>
              ))}
            </Select>
            <Select label="Course Mode" value={draft.mode} onChange={(event) => setDraft({ ...draft, mode: event.target.value })}>
              <option>Online</option>
              <option>Offline</option>
              <option>Hybrid</option>
            </Select>
            <Select label="Level" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </Select>
            <Select label="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
              <option>Technical</option>
              <option>Soft Skills</option>
              <option>Compliance</option>
              <option>Leadership</option>
            </Select>
            <Input label="Start Date" type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} />
            <Input label="End Date" type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} />
            <Input label="Duration (hours)" type="number" min={1} value={draft.duration_hours} onChange={(event) => setDraft({ ...draft, duration_hours: Number(event.target.value) })} />
            <Input label="Seat Capacity" type="number" min={1} value={draft.capacity} onChange={(event) => setDraft({ ...draft, capacity: Number(event.target.value) })} />
          </div>
          <Input label="Location / Meeting Link" value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Training room or virtual session URL" />
        </div>
      </Modal>
    </div>
  );
}
