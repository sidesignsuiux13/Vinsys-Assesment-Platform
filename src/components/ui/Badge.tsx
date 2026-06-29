import { ReactNode } from 'react';

export type BadgeVariant =
  | 'active'
  | 'inactive'
  | 'draft'
  | 'closed'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'mcq'
  | 'coding'
  | 'correct'
  | 'incorrect'
  | 'neutral';

const STYLES: Record<BadgeVariant, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  inactive: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  draft: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  closed: 'bg-neutral-100 text-neutral-400 border-neutral-200',
  easy: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  hard: 'bg-red-50 text-red-700 border-red-200',
  mcq: 'bg-maroon-50 text-maroon-700 border-maroon-200',
  coding: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  correct: 'bg-green-50 text-green-700 border-green-200',
  incorrect: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
};

const LABELS: Partial<Record<BadgeVariant, string>> = {
  active: 'Active',
  inactive: 'Inactive',
  draft: 'Draft',
  closed: 'Closed',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  mcq: 'MCQ',
  coding: 'Coding',
  correct: 'Correct',
  incorrect: 'Incorrect',
};

export function Badge({
  variant,
  children,
  className = '',
}: {
  variant: BadgeVariant;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[variant]} ${className}`}
    >
      {children ?? LABELS[variant] ?? variant}
    </span>
  );
}
