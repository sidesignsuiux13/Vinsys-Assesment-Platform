import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Editor from '@monaco-editor/react';
import { Clock, CheckCircle2, PlayCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/shared/QuestionCard';
import { useToastStore } from '@/components/ui/Toast';
import { getModuleMCQs, getModuleCoding } from '@/mock/questions';
import type { Module } from '@/types';

type Lang = 'javascript' | 'python' | 'cpp';
const LANGS: { key: Lang; label: string; monaco: string }[] = [
  { key: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { key: 'python', label: 'Python', monaco: 'python' },
  { key: 'cpp', label: 'C++', monaco: 'cpp' },
];

interface ModuleViewProps {
  module: Module;
  isCompleted: boolean;
  allDone: boolean;
  onComplete: () => void;
}

export default function ModuleView({ module, isCompleted, allDone, onComplete }: ModuleViewProps) {
  const [tab, setTab] = useState<'mcq' | 'coding'>('mcq');
  const [mcqIndex, setMcqIndex] = useState(0);

  const mcqs = useMemo(() => getModuleMCQs(module.id), [module.id]);
  const coding = useMemo(() => getModuleCoding(module.id), [module.id]);

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-neutral-800">{module.title}</h1>
        {isCompleted && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Completed
          </span>
        )}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-neutral-400 mt-1">
        <Clock className="h-3.5 w-3.5" />
        {module.estimated_minutes} min read
      </p>

      <article className="markdown-body mt-5">
        <ReactMarkdown>{module.content_text}</ReactMarkdown>
      </article>

      <div className="mt-6">
        {!isCompleted ? (
          <Button onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4" />
            Mark as Complete
          </Button>
        ) : (
          <span className="text-sm text-green-600 font-medium">You've completed this module.</span>
        )}
      </div>

      {allDone && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          All modules complete! The final assessment is now unlocked.
        </div>
      )}

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-3">Practice Questions</h2>
        <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 mb-4">
          {(['mcq', 'coding'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {t === 'mcq' ? 'MCQ' : 'Coding'}
            </button>
          ))}
        </div>

        {tab === 'mcq' ? (
          mcqs.length ? (
            <QuestionCard
              key={mcqs[mcqIndex].id}
              question={mcqs[mcqIndex]}
              index={mcqIndex}
              total={mcqs.length}
              onNext={() => setMcqIndex((i) => (i + 1) % mcqs.length)}
            />
          ) : (
            <p className="text-sm text-neutral-400">No practice MCQs for this module.</p>
          )
        ) : coding.length ? (
          <CodingPractice
            key={coding[0].id}
            question={coding[0]}
          />
        ) : (
          <p className="text-sm text-neutral-400">No coding practice for this module.</p>
        )}
      </div>
    </div>
  );
}

function CodingPractice({ question }: { question: ReturnType<typeof getModuleCoding>[number] }) {
  const push = useToastStore((s) => s.push);
  const [lang, setLang] = useState<Lang>('javascript');
  const [code, setCode] = useState(question.starter_code[lang]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ text: string; ok: boolean } | null>(null);

  const switchLang = (l: Lang) => {
    setLang(l);
    setCode(question.starter_code[l]);
    setOutput(null);
  };

  const run = () => {
    setRunning(true);
    setOutput(null);
    setTimeout(() => {
      setRunning(false);
      if (code.trim()) {
        setOutput({ text: question.sample_output, ok: true });
      } else {
        setOutput({ text: 'Error: No code to execute', ok: false });
      }
    }, 1500);
  };

  const reset = () => {
    setCode(question.starter_code[lang]);
    setOutput(null);
    push('info', 'Editor reset to starter code.');
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <p className="text-base text-neutral-800 mb-4">{question.question_text}</p>

      <div className="inline-flex rounded-lg border border-neutral-200 p-0.5 mb-3">
        {LANGS.map((l) => (
          <button
            key={l.key}
            onClick={() => switchLang(l.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              lang === l.key ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg overflow-hidden border border-neutral-200">
        <Editor
          height="320px"
          language={LANGS.find((l) => l.key === lang)!.monaco}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme="vs-dark"
          options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: 'JetBrains Mono', scrollBeyondLastLine: false }}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">Sample Input</p>
          <pre className="bg-neutral-100 rounded-lg p-3 text-xs font-mono text-neutral-700">{question.sample_input}</pre>
        </div>
        <div>
          <p className="text-xs font-medium text-neutral-500 mb-1">Sample Output</p>
          <pre className="bg-neutral-100 rounded-lg p-3 text-xs font-mono text-neutral-700">{question.sample_output}</pre>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="secondary" onClick={run} loading={running}>
          {!running && <PlayCircle className="h-4 w-4" />}
          {running ? 'Running…' : 'Run'}
        </Button>
        <Button variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {output && (
        <div className="mt-3">
          <p className="text-xs font-medium text-neutral-500 mb-1">Output</p>
          <pre className={`bg-neutral-900 rounded-lg p-3 text-xs font-mono ${output.ok ? 'text-green-400' : 'text-red-400'}`}>
            {output.text}
          </pre>
        </div>
      )}
    </div>
  );
}
