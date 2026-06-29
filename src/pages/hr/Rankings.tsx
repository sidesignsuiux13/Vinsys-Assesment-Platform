import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, Trophy, Medal, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { useToastStore } from '@/components/ui/Toast';
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
  accuracy: string;
  time: string;
  percentile: string;
}

const RANK_ICON = [Trophy, Medal, Award];

export default function HRRankings() {
  const push = useToastStore((s) => s.push);

  const rows: Row[] = USERS.filter((u) => u.role === 'student')
    .map((u) => {
      const score = SCORES.find((s) => s.user_id === u.id);
      if (!score) {
        return { rank: '—', name: u.full_name, total: '—', accuracy: 'Not Attempted', time: '—', percentile: '—' };
      }
      return {
        rank: score.rank,
        name: u.full_name,
        total: `${score.total_score}/${ASSESSMENT.total_marks}`,
        accuracy: `${score.accuracy_percent}%`,
        time: minutesFromSeconds(score.time_taken_seconds),
        percentile: `${score.percentile}th`,
      };
    })
    .sort((a, b) => (typeof a.rank === 'number' ? a.rank : 99) - (typeof b.rank === 'number' ? b.rank : 99));

  const exportCSV = () => {
    const header = ['Rank', 'Name', 'Total Score', 'Accuracy', 'Time', 'Percentile'];
    const data = rows.map((r) => [r.rank, r.name, r.total, r.accuracy, r.time, r.percentile]);
    downloadCSV('hr-rankings.csv', [header, ...data]);
    push('success', 'Rankings exported to CSV.');
  };

  const columns: Column<Row>[] = [
    {
      key: 'rank',
      label: 'Rank',
      render: (r) => {
        const Icon = typeof r.rank === 'number' && r.rank <= 3 ? RANK_ICON[r.rank - 1] : null;
        return (
          <span className="flex items-center gap-1.5 font-semibold text-maroon-600">
            {Icon && <Icon className="h-4 w-4" />}
            {r.rank}
          </span>
        );
      },
    },
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-neutral-800">{r.name}</span> },
    { key: 'total', label: 'Total Score' },
    { key: 'accuracy', label: 'Accuracy', render: (r) => (r.accuracy === 'Not Attempted' ? <span className="text-neutral-400">{r.accuracy}</span> : r.accuracy) },
    { key: 'time', label: 'Time' },
    { key: 'percentile', label: 'Percentile' },
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

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Score Distribution</h2>
        <div className="h-56">
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
          <h2 className="text-sm font-semibold text-neutral-800">Candidate Rankings</h2>
        </div>
        <DataTable columns={columns} data={rows} rowKey={(r) => r.name} />
      </div>
    </div>
  );
}
