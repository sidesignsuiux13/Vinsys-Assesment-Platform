import { useParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';
import { useToastStore } from '@/components/ui/Toast';
import { getAssessment } from '@/mock/assessments';
import { getQuestion } from '@/mock/questions';
import { COURSE } from '@/mock/courses';
import type { AssessmentStatus } from '@/types';

const STATUS_BADGE: Record<AssessmentStatus, BadgeVariant> = {
  draft: 'draft',
  active: 'active',
  closed: 'closed',
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm font-medium text-neutral-800 mt-0.5">{value}</p>
    </div>
  );
}

export default function AdminAssessmentDetail() {
  const { id } = useParams();
  const push = useToastStore((s) => s.push);
  const assessment = getAssessment(id ?? '');

  if (!assessment) {
    return (
      <EmptyState
        icon={ClipboardList}
        heading="Assessment not found"
        subtext="This assessment may have been created in a previous session and reset on refresh."
      />
    );
  }

  const questions = [...assessment.mcq_question_ids, ...assessment.coding_question_ids]
    .map((qid) => getQuestion(qid))
    .filter(Boolean);

  return (
    <div className="space-y-5 max-w-4xl">
      <Breadcrumb items={[{ label: 'Assessments', to: '/admin/assessments' }, { label: assessment.title }]} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-neutral-800">{assessment.title}</h1>
          <Badge variant={STATUS_BADGE[assessment.status]} />
        </div>
        <Button variant="secondary" onClick={() => push('success', 'Assessment cloned to a new draft.')}>
          <Copy className="h-4 w-4" />
          Clone
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Detail label="Course" value={COURSE.title} />
        <Detail label="Duration" value={`${assessment.duration_minutes} minutes`} />
        <Detail label="Total Marks" value={String(assessment.total_marks)} />
        <Detail label="Passing Marks" value={String(assessment.passing_marks)} />
        <Detail label="Negative Marking" value={assessment.negative_marking ? 'Enabled' : 'Disabled'} />
        <Detail label="Questions" value={`${questions.length} total`} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Questions</h2>
        <ul className="divide-y divide-neutral-100">
          {questions.map((q, i) => (
            <li key={q!.id} className="flex items-center gap-3 py-2.5">
              <span className="text-xs text-neutral-400 w-6">{i + 1}.</span>
              <span className="flex-1 text-sm text-neutral-700 line-clamp-1">{q!.question_text}</span>
              <Badge variant={q!.type === 'coding' ? 'coding' : 'mcq'}>{q!.type === 'coding' ? 'Coding' : 'MCQ'}</Badge>
              <span className="text-xs text-neutral-400 w-14 text-right">{q!.marks} marks</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
