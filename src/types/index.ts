export type Role = 'admin' | 'trainer' | 'hr' | 'student';

export type UserStatus = 'active' | 'inactive';

export type TrainingStatus = 'not_started' | 'in_progress' | 'completed';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
  course_id?: string;
  training_status?: TrainingStatus;
  enrollment_date?: string;
}

export interface Module {
  id: string;
  course_id: string;
  sequence: number;
  title: string;
  content_text: string;
  estimated_minutes: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  modules: Module[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType = 'mcq' | 'coding' | 'short' | 'long';

export interface MCQQuestion {
  id: string;
  type: 'mcq';
  question_text: string;
  options: string[];
  correct_answer: number;
  difficulty: Difficulty;
  marks: number;
  module_id: string;
  course_id: string;
  explanation?: string;
}

export interface CodingQuestion {
  id: string;
  type: 'coding';
  question_text: string;
  difficulty: Difficulty;
  marks: number;
  module_id: string;
  course_id: string;
  starter_code: {
    javascript: string;
    python: string;
    cpp: string;
  };
  sample_input: string;
  sample_output: string;
  hidden_test_cases: number;
}

export type AnyQuestion = MCQQuestion | CodingQuestion;

export type AssessmentStatus = 'draft' | 'active' | 'closed';

export interface Assessment {
  id: string;
  title: string;
  course_id: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_marking: boolean;
  status: AssessmentStatus;
  mcq_question_ids: string[];
  coding_question_ids: string[];
}

export interface PerQuestionResult {
  question_id: string;
  is_correct: boolean;
  marks_obtained: number;
  selected_answer?: number;
}

export interface CodingResult {
  question_id: string;
  test_cases_passed: number;
  total_test_cases: number;
  execution_time_ms: number;
}

export interface Score {
  id: string;
  user_id: string;
  assessment_id: string;
  total_score: number;
  mcq_score: number;
  coding_score: number;
  rank: number;
  accuracy_percent: number;
  percentile: number;
  time_taken_seconds: number;
  per_question: PerQuestionResult[];
  coding_results: CodingResult[];
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  course: string;
  module: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  duration: string;
  time?: string;
}
