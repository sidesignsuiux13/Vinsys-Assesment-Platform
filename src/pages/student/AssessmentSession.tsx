import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { CameraOff, Flag, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useTimer } from '@/hooks/useTimer';
import { useProctoring } from '@/hooks/useProctoring';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ASSESSMENT } from '@/mock/assessments';
import { getMCQ, getQuestion } from '@/mock/questions';
import type { CodingQuestion, MCQQuestion } from '@/types';

type Lang = 'javascript' | 'python' | 'cpp';
const LANGS: { key: Lang; label: string; monaco: string }[] = [
  { key: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { key: 'python', label: 'Python', monaco: 'python' },
  { key: 'cpp', label: 'C++', monaco: 'cpp' },
];

export default function AssessmentSession() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const answers = useAssessmentStore((s) => s.answers);
  const markedForReview = useAssessmentStore((s) => s.markedForReview);
  const saveAnswer = useAssessmentStore((s) => s.saveAnswer);
  const toggleReview = useAssessmentStore((s) => s.toggleReview);
  const submitAttempt = useAssessmentStore((s) => s.submitAttempt);
  const attemptId = useAssessmentStore((s) => s.attemptId);

  const [current, setCurrent] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  // Build the ordered question list: MCQs then coding.
  const questions = useMemo(() => {
    const mcqs = ASSESSMENT.mcq_question_ids.map((id) => getMCQ(id)!).filter(Boolean);
    const coding = ASSESSMENT.coding_question_ids.map((id) => getQuestion(id) as CodingQuestion);
    return { mcqs, coding, all: [...mcqs, ...coding] };
  }, []);

  const mcqCount = questions.mcqs.length;

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitAttempt();
    navigate('/student/assessment/submitted', { replace: true });
  }, [submitAttempt, navigate]);

  const { formattedTime, remainingSeconds } = useTimer(ASSESSMENT.duration_minutes * 60, doSubmit);
  useProctoring({ videoRef, enabled: true, onAutoSubmit: doSubmit });
  const { saving } = useAutoSave(answers, () => {}, 2000);

  // Guard: if there's no active attempt, send back to pre-check.
  useEffect(() => {
    if (!attemptId) navigate('/student/assessment', { replace: true });
  }, [attemptId, navigate]);

  const q = questions.all[current];
  const isCoding = (q as any)?.type === 'coding';

  const answeredCount = questions.all.filter((qq) => {
    const a = answers[qq.id];
    if (a === undefined || a === null) return false;
    if (typeof a === 'object') return a.code && a.code.trim().length > 0;
    return true;
  }).length;
  const unanswered = questions.all.length - answeredCount;

  const isAnswered = (qid: string) => {
    const a = answers[qid];
    if (a === undefined || a === null) return false;
    if (typeof a === 'object') return a.code && a.code.trim().length > 0;
    return true;
  };

  const timerColor =
    remainingSeconds <= 60
      ? 'text-red-600 font-semibold animate-pulse'
      : remainingSeconds <= 300
      ? 'text-amber-500 font-semibold'
      : 'text-neutral-700';

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-20 h-14 shrink-0 bg-white border-b border-neutral-200 flex items-center justify-between px-5">
        <span className="text-sm font-medium text-neutral-700">{ASSESSMENT.title}</span>
        <span className={`text-lg font-mono tabular-nums ${timerColor}`}>{formattedTime}</span>
        <div className="flex items-center gap-2">
          <div className="relative h-[60px] w-[80px] rounded-lg border border-neutral-200 overflow-hidden bg-neutral-200 flex items-center justify-center">
            <CameraOff className="absolute h-5 w-5 text-neutral-400 pointer-events-none" />
            <video ref={videoRef} muted playsInline className="relative h-full w-full object-cover bg-transparent" />
          </div>
          <span className="flex items-center gap-1 text-xs text-red-500">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> REC
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: question navigator */}
        <aside className="w-64 shrink-0 bg-white border-r border-neutral-200 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold uppercase text-neutral-400 mb-3">Questions</h2>

          <p className="text-[11px] font-medium text-neutral-400 mb-2">MCQ</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {questions.mcqs.map((qq, i) => (
              <Tile key={qq.id} n={i + 1} active={current === i} answered={isAnswered(qq.id)} review={markedForReview.includes(qq.id)} onClick={() => setCurrent(i)} />
            ))}
          </div>

          <p className="text-[11px] font-medium text-neutral-400 mb-2">Coding</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {questions.coding.map((qq, i) => {
              const idx = mcqCount + i;
              return (
                <Tile key={qq.id} n={idx + 1} active={current === idx} answered={isAnswered(qq.id)} review={markedForReview.includes(qq.id)} onClick={() => setCurrent(idx)} />
              );
            })}
          </div>

          <div className="space-y-1.5 pt-3 border-t border-neutral-100">
            <Legend className="bg-maroon-600" label="Answered" />
            <Legend className="bg-white border border-neutral-200" label="Unattempted" />
            <Legend className="bg-white border-2 border-amber-400" label="Marked for Review" />
          </div>
        </aside>

        {/* Right panel: question content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {q && (
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-neutral-700">Question {current + 1}</span>
                <Badge variant={isCoding ? 'coding' : 'mcq'}>{isCoding ? 'Coding' : 'MCQ'}</Badge>
              </div>

              {!isCoding ? (
                <McqBody question={q as MCQQuestion} value={answers[q.id]} onSelect={(i) => saveAnswer(q.id, i)} />
              ) : (
                <CodingBody question={q as CodingQuestion} value={answers[q.id]} onChange={(v) => saveAnswer(q.id, v)} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Bottom bar */}
      <footer className="sticky bottom-0 z-20 h-14 shrink-0 bg-white border-t border-neutral-200 flex items-center px-6">
        <div className="flex-1 flex items-center gap-3">
          <button
            onClick={() => q && toggleReview(q.id)}
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              q && markedForReview.includes(q.id) ? 'text-amber-500' : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Flag className="h-4 w-4" />
            {q && markedForReview.includes(q.id) ? 'Marked for Review' : 'Mark for Review'}
          </button>
          {saving && <span className="text-xs text-neutral-400">Saving…</span>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
            ← Previous
          </Button>
          <Button variant="ghost" disabled={current === questions.all.length - 1} onClick={() => setCurrent((c) => Math.min(questions.all.length - 1, c + 1))}>
            Next →
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <Button onClick={() => setConfirmOpen(true)}>Submit Assessment</Button>
        </div>
      </footer>

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit assessment?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Go back</Button>
            <Button onClick={doSubmit}>Submit</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-3">
            <Stat label="Answered" value={answeredCount} />
            <Stat label="Unanswered" value={unanswered} />
            <Stat label="Marked" value={markedForReview.length} />
          </div>
          <p className="text-sm text-neutral-500">Once submitted, you cannot make changes.</p>
        </div>
      </Modal>
    </div>
  );
}

function Tile({ n, active, answered, review, onClick }: { n: number; active: boolean; answered: boolean; review: boolean; onClick: () => void }) {
  let cls = 'bg-white border border-neutral-200 text-neutral-600';
  if (answered) cls = 'bg-maroon-600 text-white border-transparent';
  if (review) cls = 'bg-white border-2 border-amber-400 text-amber-600';
  return (
    <button
      onClick={onClick}
      className={`h-10 w-10 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${cls} ${active ? 'ring-2 ring-maroon-400' : ''}`}
    >
      {n}
    </button>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded ${className}`} />
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 bg-neutral-100 rounded-lg p-3 text-center">
      <p className="text-xl font-semibold text-maroon-600">{value}</p>
      <p className="text-xs text-neutral-400">{label}</p>
    </div>
  );
}

function McqBody({ question, value, onSelect }: { question: MCQQuestion; value: number | undefined; onSelect: (i: number) => void }) {
  return (
    <div>
      <p className="text-base text-neutral-800 leading-relaxed mb-6">{question.question_text}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const selected = value === i;
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={`w-full flex items-center gap-3 border rounded-lg p-3 text-left transition-colors ${
                selected ? 'border-maroon-600 bg-maroon-50 text-maroon-700' : 'border-neutral-200 hover:border-maroon-300 hover:bg-maroon-50'
              }`}
            >
              <span className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? 'border-maroon-600' : 'border-neutral-300'}`}>
                {selected && <span className="h-2 w-2 rounded-full bg-maroon-600" />}
              </span>
              <span className="text-sm">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CodingBody({ question, value, onChange }: { question: CodingQuestion; value: { language: Lang; code: string } | undefined; onChange: (v: { language: Lang; code: string }) => void }) {
  const [lang, setLang] = useState<Lang>(value?.language ?? 'javascript');
  const [code, setCode] = useState(value?.code ?? question.starter_code[lang]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ text: string; ok: boolean } | null>(null);

  const switchLang = (l: Lang) => {
    setLang(l);
    const next = question.starter_code[l];
    setCode(next);
    onChange({ language: l, code: next });
    setOutput(null);
  };

  const onCode = (v: string) => {
    setCode(v);
    onChange({ language: lang, code: v });
  };

  const run = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      setOutput(code.trim() ? { text: question.sample_output, ok: true } : { text: 'Error: No code to execute', ok: false });
    }, 1500);
  };

  return (
    <div>
      <div className="markdown-body mb-4 bg-neutral-100 rounded-lg p-4">
        <ReactMarkdown>{question.question_text}</ReactMarkdown>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">Sample Input</p>
          <pre className="bg-neutral-100 rounded-lg p-3 text-xs font-mono text-neutral-700">{question.sample_input}</pre>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">Sample Output</p>
          <pre className="bg-neutral-100 rounded-lg p-3 text-xs font-mono text-neutral-700">{question.sample_output}</pre>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 mb-3">
        {LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => switchLang(l.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${lang === l.key ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-neutral-200">
        <Editor
          height="360px"
          language={LANGS.find((l) => l.key === lang)!.monaco}
          value={code}
          onChange={(v) => onCode(v ?? '')}
          theme="vs-dark"
          options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono', scrollBeyondLastLine: false }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="secondary" onClick={run} loading={running}>
          {!running && <PlayCircle className="h-4 w-4" />}
          {running ? 'Running…' : 'Run'}
        </Button>
      </div>

      {output && (
        <pre className={`mt-3 bg-neutral-900 rounded-lg p-3 text-xs font-mono ${output.ok ? 'text-green-400' : 'text-red-400'}`}>{output.text}</pre>
      )}
    </div>
  );
}
