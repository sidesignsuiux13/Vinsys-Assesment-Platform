import type { Score } from '@/types';

// MCQ marks (by question order): q1=1 q2=1 q3=2 q4=4 q5=1 q6=2 q7=1 q8=2 q9=2 q10=4  => 20 max
// Coding: 2 x 10 => 20 max. Total 40.

export const SCORES: Score[] = [
  {
    id: 'score-1',
    user_id: 'user-student1', // Arjun Mehta
    assessment_id: 'assessment-1',
    total_score: 34,
    mcq_score: 18,
    coding_score: 16,
    rank: 1,
    accuracy_percent: 85,
    percentile: 95,
    time_taken_seconds: 2820, // 47 min
    per_question: [
      { question_id: 'q-mcq-1', is_correct: true, marks_obtained: 1, selected_answer: 0 },
      { question_id: 'q-mcq-2', is_correct: true, marks_obtained: 1, selected_answer: 2 },
      { question_id: 'q-mcq-3', is_correct: true, marks_obtained: 2, selected_answer: 1 },
      { question_id: 'q-mcq-4', is_correct: true, marks_obtained: 4, selected_answer: 1 },
      { question_id: 'q-mcq-5', is_correct: true, marks_obtained: 1, selected_answer: 2 },
      { question_id: 'q-mcq-6', is_correct: false, marks_obtained: 0, selected_answer: 3 },
      { question_id: 'q-mcq-7', is_correct: true, marks_obtained: 1, selected_answer: 1 },
      { question_id: 'q-mcq-8', is_correct: true, marks_obtained: 2, selected_answer: 2 },
      { question_id: 'q-mcq-9', is_correct: true, marks_obtained: 2, selected_answer: 2 },
      { question_id: 'q-mcq-10', is_correct: true, marks_obtained: 4, selected_answer: 1 },
      { question_id: 'q-code-1', is_correct: true, marks_obtained: 10 },
      { question_id: 'q-code-2', is_correct: false, marks_obtained: 6 },
    ],
    coding_results: [
      { question_id: 'q-code-1', test_cases_passed: 3, total_test_cases: 3, execution_time_ms: 42 },
      { question_id: 'q-code-2', test_cases_passed: 2, total_test_cases: 3, execution_time_ms: 58 },
    ],
  },
  {
    id: 'score-2',
    user_id: 'user-student2', // Priya Sharma
    assessment_id: 'assessment-1',
    total_score: 26,
    mcq_score: 14,
    coding_score: 12,
    rank: 2,
    accuracy_percent: 65,
    percentile: 72,
    time_taken_seconds: 3480, // 58 min
    per_question: [
      { question_id: 'q-mcq-1', is_correct: true, marks_obtained: 1, selected_answer: 0 },
      { question_id: 'q-mcq-2', is_correct: true, marks_obtained: 1, selected_answer: 2 },
      { question_id: 'q-mcq-3', is_correct: true, marks_obtained: 2, selected_answer: 1 },
      { question_id: 'q-mcq-4', is_correct: false, marks_obtained: 0, selected_answer: 0 },
      { question_id: 'q-mcq-5', is_correct: true, marks_obtained: 1, selected_answer: 2 },
      { question_id: 'q-mcq-6', is_correct: false, marks_obtained: 0, selected_answer: 0 },
      { question_id: 'q-mcq-7', is_correct: true, marks_obtained: 1, selected_answer: 1 },
      { question_id: 'q-mcq-8', is_correct: true, marks_obtained: 2, selected_answer: 2 },
      { question_id: 'q-mcq-9', is_correct: true, marks_obtained: 2, selected_answer: 2 },
      { question_id: 'q-mcq-10', is_correct: true, marks_obtained: 4, selected_answer: 1 },
      { question_id: 'q-code-1', is_correct: false, marks_obtained: 8 },
      { question_id: 'q-code-2', is_correct: false, marks_obtained: 4 },
    ],
    coding_results: [
      { question_id: 'q-code-1', test_cases_passed: 2, total_test_cases: 3, execution_time_ms: 51 },
      { question_id: 'q-code-2', test_cases_passed: 1, total_test_cases: 3, execution_time_ms: 73 },
    ],
  },
];

export function getScoreByUser(userId: string): Score | undefined {
  return SCORES.find((s) => s.user_id === userId);
}

export const SCORE_USER_IDS = SCORES.map((s) => s.user_id);
