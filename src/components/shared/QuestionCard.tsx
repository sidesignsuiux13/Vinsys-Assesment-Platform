import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { MCQQuestion } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface QuestionCardProps {
  question: MCQQuestion;
  index: number;
  total: number;
  onNext?: () => void;
}

// Practice MCQ card: select an option, check answer, reveal correctness. No scoring.
export function QuestionCard({ question, index, total, onNext }: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const reset = () => {
    setSelected(null);
    setChecked(false);
  };

  const handleNext = () => {
    reset();
    onNext?.();
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-400">
          Question {index + 1} of {total}
        </span>
        <Badge variant={question.difficulty}>{question.difficulty}</Badge>
      </div>
      <p className="text-base text-neutral-800 mb-4">{question.question_text}</p>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correct_answer;
          let cls = 'border-neutral-200 hover:border-maroon-300 hover:bg-maroon-50';
          let icon = null;
          if (checked) {
            if (isCorrect) {
              cls = 'border-green-300 bg-green-50';
              icon = <Check className="h-4 w-4 text-green-600" />;
            } else if (isSelected) {
              cls = 'border-red-300 bg-red-50';
              icon = <X className="h-4 w-4 text-red-600" />;
            } else {
              cls = 'border-neutral-200';
            }
          } else if (isSelected) {
            cls = 'border-maroon-600 bg-maroon-50';
          }
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => setSelected(i)}
              className={`w-full flex items-center justify-between text-left border rounded-lg p-3 text-sm transition-colors ${cls} ${checked ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-neutral-700">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {checked && (
        <div className="mt-4 text-sm">
          {selected === question.correct_answer ? (
            <p className="text-green-600 font-medium">Correct!</p>
          ) : (
            <p className="text-red-600 font-medium">
              Incorrect. The correct answer is "{question.options[question.correct_answer]}".
            </p>
          )}
          {question.explanation && (
            <p className="mt-1 text-neutral-500">{question.explanation}</p>
          )}
        </div>
      )}

      <div className="mt-5 flex items-center gap-2">
        {!checked ? (
          <Button disabled={selected === null} onClick={() => setChecked(true)}>
            Check Answer
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleNext}>
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
