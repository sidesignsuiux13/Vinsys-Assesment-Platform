import { useState } from 'react';
import { Award, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/authStore';
import { getScoreByUser } from '@/mock/scores';
import { getQuestion, getMCQ } from '@/mock/questions';
import { ASSESSMENT } from '@/mock/assessments';
import { minutesFromSeconds } from '@/lib/constants';
import type { PerQuestionResult } from '@/types';

const MCQ_MAX = 20;
const CODING_MAX = 20;

export default function StudentResults() {
  const user = useAuthStore((s) => s.currentUser)!;
  const score = getScoreByUser(user.id);

  if (!score) {
    return (
      <EmptyState
        icon={Award}
        heading="No results yet"
        subtext="Complete the assessment to see your results here."
      />
    );
  }

  const mcqAccuracy = Math.round((score.mcq_score / MCQ_MAX) * 100);
  const codingAccuracy = Math.round((score.coding_score / CODING_MAX) * 100);

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Summary card */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-neutral-400">Total Score</p>
            <p className="text-3xl font-semibold text-maroon-600">
              {score.total_score}
              <span className="text-lg text-neutral-300">/{ASSESSMENT.total_marks}</span>
            </p>
          </div>
          <Badge variant={score.total_score >= ASSESSMENT.passing_marks ? 'active' : 'incorrect'}>
            {score.total_score >= ASSESSMENT.passing_marks ? 'Passed' : 'Failed'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <Chip label="MCQ Score" value={`${score.mcq_score}/${MCQ_MAX}`} />
          <Chip label="Coding Score" value={`${score.coding_score}/${CODING_MAX}`} />
          <Chip label="Rank" value={`#${score.rank}`} />
          <Chip label="Percentile" value={`${score.percentile}th`} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <ProgressBar value={score.accuracy_percent} label="Accuracy" showPercentage />
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <span className="text-sm text-neutral-600">Time taken</span>
            <span className="text-sm font-medium text-neutral-800">{minutesFromSeconds(score.time_taken_seconds)}</span>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Section Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-400 border-b border-neutral-200">
              <th className="py-2 font-medium">Section</th>
              <th className="py-2 font-medium">Questions</th>
              <th className="py-2 font-medium">Score</th>
              <th className="py-2 font-medium">Max</th>
              <th className="py-2 font-medium">Accuracy</th>
            </tr>
          </thead>
          <tbody className="text-neutral-700">
            <tr className="border-b border-neutral-100">
              <td className="py-2.5 font-medium">MCQ</td>
              <td>10</td>
              <td>{score.mcq_score}</td>
              <td>{MCQ_MAX}</td>
              <td>{mcqAccuracy}%</td>
            </tr>
            <tr>
              <td className="py-2.5 font-medium">Coding</td>
              <td>2</td>
              <td>{score.coding_score}</td>
              <td>{CODING_MAX}</td>
              <td>{codingAccuracy}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Per-question accordion */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Question Review</h2>
        <div className="divide-y divide-neutral-100">
          {score.per_question.map((pq, i) => (
            <QuestionRow key={pq.question_id} result={pq} index={i} score={score} />
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-neutral-100 rounded-xl border-l-4 border-l-maroon-600 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-5 w-5 text-maroon-600" />
          <h2 className="text-sm font-semibold text-neutral-800">Suggestions for improvement</h2>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-neutral-600">
          <li>Review JavaScript <code>this</code> binding and closures — a question in this area was missed.</li>
          <li>Revisit HTTP status codes and REST conventions before back-end interviews.</li>
          <li>Practice edge cases in coding problems to pass all hidden test cases.</li>
        </ul>
        <p className="text-xs text-neutral-400 mt-3">AI-generated suggestions coming in the next release.</p>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-center">
      <p className="text-base font-semibold text-maroon-600">{value}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function QuestionRow({ result, index, score }: { result: PerQuestionResult; index: number; score: ReturnType<typeof getScoreByUser> }) {
  const [open, setOpen] = useState(false);
  const question = getQuestion(result.question_id);
  if (!question) return null;
  const isCoding = question.type === 'coding';
  const mcq = isCoding ? null : getMCQ(result.question_id);
  const codingResult = score?.coding_results.find((c) => c.question_id === result.question_id);

  return (
    <div className="py-1">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 py-2 text-left">
        {open ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
        <span className="text-sm font-medium text-neutral-700 w-8">Q{index + 1}</span>
        <Badge variant={isCoding ? 'coding' : 'mcq'}>{isCoding ? 'Coding' : 'MCQ'}</Badge>
        <Badge variant={result.is_correct ? 'correct' : 'incorrect'} />
        <span className="ml-auto text-sm font-medium text-neutral-700">{result.marks_obtained}/{question.marks} marks</span>
      </button>

      {open && (
        <div className="ml-7 pb-3 text-sm space-y-1.5">
          <p className="text-neutral-700">{question.question_text}</p>
          {!isCoding && mcq && (
            <>
              <p>
                <span className="text-neutral-400">Your answer: </span>
                <span className={result.is_correct ? 'text-green-600' : 'text-red-600'}>
                  {result.selected_answer !== undefined ? mcq.options[result.selected_answer] : '—'}
                </span>
              </p>
              <p>
                <span className="text-neutral-400">Correct answer: </span>
                <span className="text-green-600">{mcq.options[mcq.correct_answer]}</span>
              </p>
            </>
          )}
          {isCoding && codingResult && (
            <>
              <p className="text-neutral-700">
                Test cases: {codingResult.test_cases_passed}/{codingResult.total_test_cases} passed
              </p>
              <p className="text-neutral-400">Execution time: {codingResult.execution_time_ms}ms</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
