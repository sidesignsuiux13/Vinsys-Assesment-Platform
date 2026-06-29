import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { COURSE } from '@/mock/courses';

interface TrainerFeedback {
  id: string;
  student: string;
  course: string;
  module: string;
  rating: number;
  comment: string;
  date: string;
}

const FEEDBACKS: TrainerFeedback[] = [
  { id: 'tf-1', student: 'Arjun Mehta', course: COURSE.title, module: 'React Essentials', rating: 5, comment: 'The live examples made hooks easy to understand.', date: '2026-06-18' },
  { id: 'tf-2', student: 'Priya Sharma', course: COURSE.title, module: 'Node.js & APIs', rating: 4, comment: 'Clear explanations. More API debugging examples would help.', date: '2026-06-20' },
  { id: 'tf-3', student: 'Rahul Nair', course: COURSE.title, module: 'JavaScript Core', rating: 4, comment: 'Good pacing and helpful recap after each topic.', date: '2026-06-22' },
];

export default function TrainerFeedbacks() {
  const avg = (FEEDBACKS.reduce((sum, item) => sum + item.rating, 0) / FEEDBACKS.length).toFixed(1);

  const columns: Column<TrainerFeedback>[] = [
    { key: 'student', label: 'Student', render: (feedback) => <span className="font-medium text-neutral-800">{feedback.student}</span> },
    { key: 'course', label: 'Course', render: (feedback) => <span className="text-neutral-500">{feedback.course}</span> },
    { key: 'module', label: 'Module', render: (feedback) => <Badge variant="neutral">{feedback.module}</Badge> },
    {
      key: 'rating',
      label: 'Rating',
      render: (feedback) => (
        <span className="flex items-center gap-1 text-neutral-700">
          <Star className="h-4 w-4 fill-maroon-600 text-maroon-600" />
          {feedback.rating}/5
        </span>
      ),
    },
    { key: 'comment', label: 'Comment', render: (feedback) => <span className="text-neutral-600">{feedback.comment}</span> },
    { key: 'date', label: 'Date', render: (feedback) => <span className="text-neutral-500">{feedback.date}</span> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-400">Average Rating</p>
          <p className="mt-2 text-2xl font-semibold text-maroon-600">{avg}/5</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-400">Responses</p>
          <p className="mt-2 text-2xl font-semibold text-maroon-600">{FEEDBACKS.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-400">Courses Reviewed</p>
          <p className="mt-2 text-2xl font-semibold text-maroon-600">1</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={FEEDBACKS} rowKey={(feedback) => feedback.id} />
      </div>
    </div>
  );
}
