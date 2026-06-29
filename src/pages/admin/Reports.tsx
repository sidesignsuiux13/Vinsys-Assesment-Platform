import { Download } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SCORES } from '@/mock/scores';
import { USERS } from '@/mock/users';
import { COURSE } from '@/mock/courses';
import { ASSESSMENT } from '@/mock/assessments';
import { downloadCSV } from '@/lib/csv';
import { minutesFromSeconds } from '@/lib/constants';

const DISTRIBUTION = [
  { bucket: '<50%', students: 0 },
  { bucket: '50-60%', students: 0 },
  { bucket: '60-75%', students: 1 },
  { bucket: '75-90%', students: 1 },
  { bucket: '>90%', students: 0 },
];

interface Row {
  rank: number | string;
  name: string;
  total: string;
  mcq: string;
  coding: string;
  accuracy: string;
  time: string;
  plagiarism: string;
}

export default function AdminReports() {
  const students = USERS.filter((u) => u.role === 'student');

  const rows: Row[] = students
    .map((s) => {
      const score = SCORES.find((sc) => sc.user_id === s.id);
      if (!score) {
        return { rank: '—', name: s.full_name, total: '—', mcq: '—', coding: '—', accuracy: 'Not Attempted', time: '—', plagiarism: '—' };
      }
      return {
        rank: score.rank,
        name: s.full_name,
        total: `${score.total_score}/${ASSESSMENT.total_marks}`,
        mcq: String(score.mcq_score),
        coding: String(score.coding_score),
        accuracy: `${score.accuracy_percent}%`,
        time: minutesFromSeconds(score.time_taken_seconds),
        plagiarism: 'Clean',
      };
    })
    .sort((a, b) => (typeof a.rank === 'number' ? a.rank : 99) - (typeof b.rank === 'number' ? b.rank : 99));

  const attempted = SCORES.length;
  const passed = SCORES.filter((s) => s.total_score >= ASSESSMENT.passing_marks).length;
  const avg = Math.round(SCORES.reduce((a, s) => a + s.total_score, 0) / SCORES.length);

  const exportCSV = () => {
    const header = ['Rank', 'Name', 'Total Score', 'MCQ', 'Coding', 'Accuracy', 'Time Taken', 'Plagiarism'];
    const data = rows.map((r) => [r.rank, r.name, r.total, r.mcq, r.coding, r.accuracy, r.time, r.plagiarism]);
    downloadCSV('fswd-report.csv', [header, ...data]);
  };

  const columns: Column<Row>[] = [
    { key: 'rank', label: 'Rank', render: (r) => <span className="font-semibold text-maroon-600">{r.rank}</span> },
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-neutral-800">{r.name}</span> },
    { key: 'total', label: 'Total', render: (r) => r.total },
    { key: 'mcq', label: 'MCQ' },
    { key: 'coding', label: 'Coding' },
    { key: 'accuracy', label: 'Accuracy', render: (r) => (r.accuracy === 'Not Attempted' ? <span className="text-neutral-400">{r.accuracy}</span> : r.accuracy) },
    { key: 'time', label: 'Time Taken' },
    { key: 'plagiarism', label: 'Plagiarism', render: (r) => (r.plagiarism === 'Clean' ? <Badge variant="active">Clean</Badge> : <span className="text-neutral-300">—</span>) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Select defaultValue={COURSE.id} className="w-64">
          <option value={COURSE.id}>{COURSE.title}</option>
        </Select>
        <Button variant="secondary" onClick={exportCSV}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Attempted', value: attempted },
          { label: 'Passed', value: passed },
          { label: 'Failed', value: attempted - passed },
          { label: 'Avg Score', value: `${avg}/${ASSESSMENT.total_marks}` },
          { label: 'Pass Rate', value: `${Math.round((passed / attempted) * 100)}%` },
        ].map((chip) => (
          <div key={chip.label} className="bg-white border border-neutral-200 rounded-xl px-5 py-3">
            <p className="text-xs text-neutral-400">{chip.label}</p>
            <p className="text-lg font-semibold text-maroon-600">{chip.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Score Distribution</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DISTRIBUTION} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F9F0F0' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
              <Bar dataKey="students" name="Students" fill="#7B1C1C" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-800">Rankings</h2>
        </div>
        <DataTable columns={columns} data={rows} rowKey={(r) => r.name} />
      </div>
    </div>
  );
}
