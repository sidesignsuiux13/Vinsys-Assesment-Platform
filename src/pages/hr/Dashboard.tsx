import { useState } from 'react';
import { Download, ChevronDown, ChevronRight, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { SCORES } from '@/mock/scores';
import { USERS } from '@/mock/users';
import { COURSE } from '@/mock/courses';
import { ASSESSMENT } from '@/mock/assessments';
import { downloadCSV } from '@/lib/csv';
import { minutesFromSeconds } from '@/lib/constants';

type HiringStatus = 'Under Review' | 'Shortlisted' | 'Rejected';

interface Row {
  id: string;
  rank: number | string;
  name: string;
  total: string;
  mcq: string;
  coding: string;
  accuracy: string;
  time: string;
  attempted: boolean;
}

const STUDENT_FEEDBACK = [
  { name: 'Arjun Mehta', rating: 5, comment: 'Well-structured course with great hands-on projects.' },
  { name: 'Priya Sharma', rating: 4, comment: 'Loved the React module; would like more backend depth.' },
  { name: 'Rahul Nair', rating: 4, comment: 'Trainers were responsive and explained concepts clearly.' },
];

export default function HRDashboard() {
  const push = useToastStore((s) => s.push);

  const baseRows: Row[] = USERS.filter((u) => u.role === 'student')
    .map((u) => {
      const score = SCORES.find((s) => s.user_id === u.id);
      if (!score) {
        return { id: u.id, rank: '—', name: u.full_name, total: '—', mcq: '—', coding: '—', accuracy: 'Not Attempted', time: '—', attempted: false };
      }
      return {
        id: u.id,
        rank: score.rank,
        name: u.full_name,
        total: `${score.total_score}/${ASSESSMENT.total_marks}`,
        mcq: String(score.mcq_score),
        coding: String(score.coding_score),
        accuracy: `${score.accuracy_percent}%`,
        time: minutesFromSeconds(score.time_taken_seconds),
        attempted: true,
      };
    })
    .sort((a, b) => (typeof a.rank === 'number' ? a.rank : 99) - (typeof b.rank === 'number' ? b.rank : 99));

  const [statuses, setStatuses] = useState<Record<string, HiringStatus>>(
    () => Object.fromEntries(baseRows.map((r) => [r.id, 'Under Review' as HiringStatus]))
  );
  const [flashId, setFlashId] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const changeStatus = (id: string, status: HiringStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1200);
  };

  const exportCSV = () => {
    const header = ['Rank', 'Name', 'Score', 'MCQ', 'Coding', 'Accuracy', 'Time', 'Status'];
    const data = baseRows.map((r) => [r.rank, r.name, r.total, r.mcq, r.coding, r.accuracy, r.time, statuses[r.id]]);
    downloadCSV('candidate-rankings.csv', [header, ...data]);
    push('success', 'Rankings exported to CSV.');
  };

  const avgRating = (STUDENT_FEEDBACK.reduce((a, f) => a + f.rating, 0) / STUDENT_FEEDBACK.length).toFixed(1);

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

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-800">Candidate Rankings</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-400 border-b border-neutral-200">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">MCQ</th>
              <th className="px-4 py-3 font-medium">Coding</th>
              <th className="px-4 py-3 font-medium">Accuracy</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {baseRows.map((r) => (
              <tr key={r.id} className={`border-b border-neutral-100 ${flashId === r.id ? 'row-flash' : ''}`}>
                <td className="px-4 py-3 font-semibold text-maroon-600">{r.rank}</td>
                <td className="px-4 py-3 font-medium text-neutral-800">{r.name}</td>
                <td className="px-4 py-3 text-neutral-700">{r.total}</td>
                <td className="px-4 py-3 text-neutral-700">{r.mcq}</td>
                <td className="px-4 py-3 text-neutral-700">{r.coding}</td>
                <td className="px-4 py-3">
                  {r.attempted ? <span className="text-neutral-700">{r.accuracy}</span> : <span className="text-neutral-400">Not Attempted</span>}
                </td>
                <td className="px-4 py-3 text-neutral-700">{r.time}</td>
                <td className="px-4 py-3">
                  <Select value={statuses[r.id]} onChange={(e) => changeStatus(r.id, e.target.value as HiringStatus)} className="h-8 w-40 text-xs">
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <button onClick={() => setFeedbackOpen((o) => !o)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            {feedbackOpen ? <ChevronDown className="h-4 w-4 text-neutral-400" /> : <ChevronRight className="h-4 w-4 text-neutral-400" />}
            <h2 className="text-sm font-semibold text-neutral-800">FSWD Final Training Feedback</h2>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Star className="h-4 w-4 fill-maroon-600 text-maroon-600" />
            {avgRating} avg · {STUDENT_FEEDBACK.length} responses
          </span>
        </button>

        {feedbackOpen && (
          <div className="mt-4 space-y-3">
            {STUDENT_FEEDBACK.map((f) => (
              <div key={f.name} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-800">{f.name}</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${n <= f.rating ? 'fill-maroon-600 text-maroon-600' : 'text-neutral-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-1.5">"{f.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
