import { Users, ClipboardList, BookOpen, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { StatCard } from '@/components/shared/StatCard';
import { AUDIT_LOG } from '@/mock/attempts';

const SCORE_DISTRIBUTION = [
  { range: '0-25%', students: 0 },
  { range: '25-50%', students: 0 },
  { range: '50-75%', students: 1 },
  { range: '75-100%', students: 2 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={3} icon={Users} />
        <StatCard label="Active Assessments" value={1} icon={ClipboardList} />
        <StatCard label="Courses" value={1} icon={BookOpen} />
        <StatCard label="Avg Score" value="75%" icon={TrendingUp} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Score Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SCORE_DISTRIBUTION} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
              <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#F9F0F0' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }}
              />
              <Bar dataKey="students" name="Students" fill="#7B1C1C" radius={[4, 4, 0, 0]} maxBarSize={64} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Recent Activity</h2>
        <ul className="divide-y divide-neutral-100">
          {AUDIT_LOG.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between py-2.5">
              <p className="text-sm text-neutral-700">
                <span className="font-medium text-neutral-800">{entry.actor}</span> {entry.action}
              </p>
              <span className="text-xs text-neutral-400 shrink-0 ml-4">{entry.timestamp}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
