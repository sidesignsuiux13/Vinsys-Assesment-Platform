import type { Assessment } from '@/types';
import { MCQ_QUESTIONS, CODING_QUESTIONS } from './questions';

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'assessment-1',
    title: 'FSWD Final Assessment',
    course_id: 'course-1',
    duration_minutes: 60,
    total_marks: 40,
    passing_marks: 24,
    negative_marking: false,
    status: 'active',
    mcq_question_ids: MCQ_QUESTIONS.map((q) => q.id),
    coding_question_ids: CODING_QUESTIONS.map((q) => q.id),
  },
];

export const ASSESSMENT = ASSESSMENTS[0];

export function getAssessment(id: string) {
  return ASSESSMENTS.find((a) => a.id === id);
}
