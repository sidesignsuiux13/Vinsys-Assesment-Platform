import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Plus, Search, Pencil, Trash2, FileQuestion, Code2, AlignLeft, FileText, Upload, Download } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { ALL_QUESTIONS } from '@/mock/questions';
import { uuid } from '@/lib/constants';
import { downloadSampleQuestionsCSV, parseQuestionsCSV } from '@/lib/csv';
import type { Difficulty, QuestionType } from '@/types';

interface QRow {
  id: string;
  type: QuestionType;
  question_text: string;
  difficulty: Difficulty;
  marks: number;
  category?: string;
}

const TYPE_META: Record<QuestionType, { label: string; icon: typeof FileQuestion; badge: BadgeVariant }> = {
  mcq: { label: 'MCQ', icon: FileQuestion, badge: 'mcq' },
  coding: { label: 'Coding', icon: Code2, badge: 'coding' },
  short: { label: 'Subjective', icon: AlignLeft, badge: 'neutral' },
  long: { label: 'Long Answer', icon: FileText, badge: 'neutral' },
};

// Fields mirrored from the original "Add Question" form.
const CATEGORIES = ['Web Development', 'JavaScript', 'React', 'Node.js & APIs', 'HR Policies', 'Testing Tools'];

const SUBCATEGORIES: Record<string, string[]> = {
  'Web Development': ['HTML', 'CSS', 'Responsive Design'],
  JavaScript: ['Closures', 'Async / Promises', 'DOM'],
  React: ['Hooks', 'Components', 'State Management'],
  'Node.js & APIs': ['Express', 'REST', 'Middleware'],
  'HR Policies': ['Leave', 'Attendance', 'Code of Conduct'],
  'Testing Tools': ['Selenium', 'LoadRunner', 'JMeter'],
};

const QUESTION_FORMATS = ['Text', 'Image', 'Audio', 'Video'];

const COMPLEXITIES: { label: string; value: Difficulty }[] = [
  { label: 'Low', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'hard' },
];

const OPTION_COUNTS = [2, 3, 4, 5, 6, 7];

type AnswerType = 'single' | 'multiple' | 'subjective';

const emptyDraft = {
  category: '',
  subCategory: '',
  complexity: '' as '' | Difficulty,
  questionFormat: 'Text',
  text: '',
  answerType: 'single' as AnswerType,
  optionCount: 4,
  options: ['', '', '', ''] as string[],
  correctSingle: 0,
  correctMulti: [] as number[],
  modelAnswer: '',
  marks: 1,
  tags: '',
};

export default function AdminQuestions() {
  const push = useToastStore((s) => s.push);
  const [rows, setRows] = useState<QRow[]>(() =>
    ALL_QUESTIONS.map((q) => ({
      id: q.id,
      type: q.type,
      question_text: q.question_text,
      difficulty: q.difficulty,
      marks: q.marks,
    }))
  );
  const [typeFilter, setTypeFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({ ...emptyDraft });

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (typeFilter === 'subjective' ? r.type !== 'short' && r.type !== 'long' : typeFilter !== 'all' && r.type !== typeFilter)
          return false;
        if (diffFilter !== 'all' && r.difficulty !== diffFilter) return false;
        if (search && !r.question_text.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
    [rows, typeFilter, diffFilter, search]
  );

  const resetDraft = () => setDraft({ ...emptyDraft, options: ['', '', '', ''], correctMulti: [] });

  const setOptionCount = (n: number) =>
    setDraft((d) => ({
      ...d,
      optionCount: n,
      options: Array.from({ length: n }, (_, i) => d.options[i] ?? ''),
      correctSingle: Math.min(d.correctSingle, n - 1),
      correctMulti: d.correctMulti.filter((i) => i < n),
    }));

  const toggleMulti = (i: number) =>
    setDraft((d) => ({
      ...d,
      correctMulti: d.correctMulti.includes(i) ? d.correctMulti.filter((x) => x !== i) : [...d.correctMulti, i],
    }));

  const handleCSV = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-uploading the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseQuestionsCSV(String(reader.result ?? ''));
      if (!parsed.length) {
        push('error', 'No valid questions found in the CSV.');
        return;
      }
      const imported: QRow[] = parsed.map((p) => ({
        id: uuid(),
        type: 'mcq',
        question_text: p.question,
        difficulty: 'easy',
        marks: p.correctIndexes.length > 1 ? 2 : 1,
      }));
      setRows((prev) => [...imported, ...prev]);
      push('success', `${parsed.length} question${parsed.length > 1 ? 's' : ''} imported from CSV.`);
      setOpen(false);
      resetDraft();
    };
    reader.onerror = () => push('error', 'Could not read the selected file.');
    reader.readAsText(file);
  };

  const handleAdd = () => {
    if (!draft.category) {
      push('error', 'Please select a question category.');
      return;
    }
    if (!draft.text.trim()) {
      push('error', 'Question text is required.');
      return;
    }
    const type: QuestionType = draft.answerType === 'subjective' ? 'short' : 'mcq';
    setRows((prev) => [
      {
        id: uuid(),
        type,
        question_text: draft.text,
        difficulty: draft.complexity || 'easy',
        marks: draft.marks,
        category: draft.category,
      },
      ...prev,
    ]);
    push('success', 'Question added to the bank.');
    setOpen(false);
    resetDraft();
  };

  const columns: Column<QRow>[] = [
    {
      key: 'question_text',
      label: 'Question',
      render: (r) => (
        <span className="text-neutral-800">
          {r.question_text.length > 60 ? r.question_text.slice(0, 60) + '…' : r.question_text}
        </span>
      ),
    },
    { key: 'type', label: 'Type', render: (r) => <Badge variant={TYPE_META[r.type].badge}>{TYPE_META[r.type].label}</Badge> },
    { key: 'difficulty', label: 'Complexity', render: (r) => <Badge variant={r.difficulty} /> },
    { key: 'category', label: 'Category', render: (r) => <span className="text-neutral-500">{r.category ?? 'FSWD'}</span> },
    { key: 'marks', label: 'Marks', render: (r) => <span className="font-medium text-neutral-700">{r.marks}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <div className="flex items-center gap-3">
          <button className="text-neutral-400 hover:text-maroon-600"><Pencil className="h-4 w-4" /></button>
          <button className="text-neutral-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const subCategoryOptions = draft.category ? SUBCATEGORIES[draft.category] ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36">
            <option value="all">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="coding">Coding</option>
            <option value="subjective">Subjective</option>
          </Select>
          <Select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="w-36">
            <option value="all">All Complexity</option>
            <option value="easy">Low</option>
            <option value="medium">Medium</option>
            <option value="hard">High</option>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-56" />
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} />
      </div>

      <Drawer
        isOpen={open}
        onClose={() => { setOpen(false); resetDraft(); }}
        title="Add Question"
        width={460}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); resetDraft(); }}>Cancel</Button>
            <Button onClick={handleAdd}>Add Question</Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Category / Sub-Category */}
          <Select label="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value, subCategory: '' })}>
            <option value="">Select Question Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Select
            label="Sub-Category"
            value={draft.subCategory}
            onChange={(e) => setDraft({ ...draft, subCategory: e.target.value })}
            disabled={!draft.category}
          >
            <option value="">Select Question Sub-Category{draft.category ? '' : ' (select a category first)'}</option>
            {subCategoryOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <p className="-mt-3 text-xs text-neutral-400">(optional)</p>

          {/* Complexity / Question Format */}
          <Select label="Complexity" value={draft.complexity} onChange={(e) => setDraft({ ...draft, complexity: e.target.value as Difficulty })}>
            <option value="">Select Complexity</option>
            {COMPLEXITIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <p className="-mt-3 text-xs text-neutral-400">(optional)</p>

          <Select label="Question Type" value={draft.questionFormat} onChange={(e) => setDraft({ ...draft, questionFormat: e.target.value })}>
            {QUESTION_FORMATS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </Select>

          {/* Question */}
          <Textarea label="Question" rows={4} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="Enter the question…" />

          {/* Answer Type */}
          <div>
            <p className="text-sm font-medium text-neutral-700 mb-2">Answer Type</p>
            <div className="flex flex-wrap gap-4">
              {([
                { value: 'single', label: 'Single Choice' },
                { value: 'multiple', label: 'Multiple Choice' },
                { value: 'subjective', label: 'Subjective' },
              ] as { value: AnswerType; label: string }[]).map((a) => (
                <label key={a.value} className="flex items-center gap-1.5 text-sm text-neutral-700 cursor-pointer">
                  <input
                    type="radio"
                    name="answerType"
                    checked={draft.answerType === a.value}
                    onChange={() => setDraft({ ...draft, answerType: a.value })}
                    className="accent-maroon-600"
                  />
                  {a.label}
                </label>
              ))}
            </div>
          </div>

          {/* Options (for choice answer types) */}
          {draft.answerType !== 'subjective' ? (
            <>
              <Select label="Options" value={draft.optionCount} onChange={(e) => setOptionCount(Number(e.target.value))}>
                {OPTION_COUNTS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>

              <div className="space-y-2">
                <p className="text-sm font-medium text-neutral-700">
                  {draft.answerType === 'single' ? 'Mark the correct option' : 'Mark the correct option(s)'}
                </p>
                {draft.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {draft.answerType === 'single' ? (
                      <input
                        type="radio"
                        name="correctOption"
                        checked={draft.correctSingle === i}
                        onChange={() => setDraft({ ...draft, correctSingle: i })}
                        className="accent-maroon-600"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={draft.correctMulti.includes(i)}
                        onChange={() => toggleMulti(i)}
                        className="accent-maroon-600"
                      />
                    )}
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const options = [...draft.options];
                        options[i] = e.target.value;
                        setDraft({ ...draft, options });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Textarea
              label="Model Answer (optional)"
              rows={3}
              value={draft.modelAnswer}
              onChange={(e) => setDraft({ ...draft, modelAnswer: e.target.value })}
              placeholder="Reference answer used while grading…"
            />
          )}

          {/* Marks / Tags */}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marks" type="number" value={draft.marks} onChange={(e) => setDraft({ ...draft, marks: Number(e.target.value) })} />
            <Input label="Tags" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} placeholder="comma, separated" />
          </div>

          {/* Bulk import via CSV */}
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-700">Bulk import via CSV</p>
            <p className="text-xs text-neutral-400 mt-0.5 mb-2.5">
              Upload a CSV to add multiple questions at once (Question, Option A–G, Answer Type, Answer, Question Hint).
            </p>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleCSV} className="hidden" />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadSampleQuestionsCSV}>
                <Download className="h-4 w-4" />
                Download Sample CSV
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
