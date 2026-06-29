import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Eye, ListFilter, PieChart as PieChartIcon, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/shared/StatCard';
import { ASSESSMENT } from '@/mock/assessments';
import { SCORES } from '@/mock/scores';
import { USERS } from '@/mock/users';
import { minutesFromSeconds } from '@/lib/constants';
import type { Score, User } from '@/types';

type ResultStatus = 'Pass' | 'Fail' | 'Not Attempted';
type ResultSort = 'newest' | 'oldest';

interface ExamOption {
  id: string;
  title: string;
  date: string;
  totalMarks: number;
  passingMarks: number;
}

interface ResultRow {
  id: string;
  examId: string;
  examTitle: string;
  examDate: string;
  user: User;
  score?: Score;
  status: ResultStatus;
}

const exams: ExamOption[] = [
  {
    id: ASSESSMENT.id,
    title: ASSESSMENT.title,
    date: '2026-07-05',
    totalMarks: ASSESSMENT.total_marks,
    passingMarks: ASSESSMENT.passing_marks,
  },
  {
    id: 'exam-react-practice',
    title: 'React Practice Exam',
    date: '2026-07-12',
    totalMarks: 35,
    passingMarks: 21,
  },
];

const resultOverrides: Record<string, Partial<Record<string, number>>> = {
  'exam-react-practice': {
    'user-student1': 29,
    'user-student2': 18,
  },
};

function getStudents() {
  return USERS.filter((user) => user.role === 'student');
}

function getStatus(score: number | undefined, passingMarks: number): ResultStatus {
  if (score === undefined) return 'Not Attempted';
  return score >= passingMarks ? 'Pass' : 'Fail';
}

function buildRows(): ResultRow[] {
  const students = getStudents();

  return exams.flatMap((exam) =>
    students.map((user) => {
      const score = exam.id === ASSESSMENT.id ? SCORES.find((item) => item.user_id === user.id) : undefined;
      const overrideScore = resultOverrides[exam.id]?.[user.id];
      const normalizedScore =
        overrideScore === undefined
          ? score
          : {
              ...(score ?? SCORES[0]),
              id: `${exam.id}-${user.id}`,
              user_id: user.id,
              assessment_id: exam.id,
              total_score: overrideScore,
              mcq_score: Math.round(overrideScore * 0.6),
              coding_score: overrideScore - Math.round(overrideScore * 0.6),
              accuracy_percent: Math.round((overrideScore / exam.totalMarks) * 100),
              rank: overrideScore >= exam.passingMarks ? 1 : 3,
              percentile: Math.round((overrideScore / exam.totalMarks) * 100),
              time_taken_seconds: 2700 + overrideScore * 20,
            };

      return {
        id: `${exam.id}-${user.id}`,
        examId: exam.id,
        examTitle: exam.title,
        examDate: exam.date,
        user,
        score: normalizedScore,
        status: getStatus(normalizedScore?.total_score, exam.passingMarks),
      };
    })
  );
}

function statusBadge(status: ResultStatus) {
  if (status === 'Pass') return <Badge variant="active">Pass</Badge>;
  if (status === 'Fail') return <Badge variant="incorrect">Fail</Badge>;
  return <Badge variant="draft">Not Attempted</Badge>;
}

export default function AdminResults() {
  const [activeTab, setActiveTab] = useState<'exam' | 'user' | 'chart'>('exam');
  const [examFilter, setExamFilter] = useState(exams[0].id);
  const [statusFilter, setStatusFilter] = useState<'all' | ResultStatus>('all');
  const [sort, setSort] = useState<ResultSort>('newest');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const allRows = useMemo(() => buildRows(), []);
  const selectedExam = exams.find((exam) => exam.id === examFilter) ?? exams[0];

  const examRows = useMemo(
    () =>
      allRows
        .filter((row) => row.examId === examFilter)
        .filter((row) => statusFilter === 'all' || row.status === statusFilter)
        .sort((a, b) =>
          sort === 'newest'
            ? b.examDate.localeCompare(a.examDate)
            : a.examDate.localeCompare(b.examDate)
        ),
    [allRows, examFilter, sort, statusFilter]
  );

  const userRows = useMemo(
    () =>
      getStudents().map((user) => ({
        user,
        attempted: allRows.filter((row) => row.user.id === user.id && row.score).length,
        passed: allRows.filter((row) => row.user.id === user.id && row.status === 'Pass').length,
        failed: allRows.filter((row) => row.user.id === user.id && row.status === 'Fail').length,
        latest: allRows
          .filter((row) => row.user.id === user.id && row.score)
          .sort((a, b) => b.examDate.localeCompare(a.examDate))[0],
      })),
    [allRows]
  );

  const selectedUserRows = selectedUser
    ? allRows.filter((row) => row.user.id === selectedUser.id)
    : [];

  const chartRows = allRows.filter((row) => row.examId === examFilter);
  const passed = chartRows.filter((row) => row.status === 'Pass').length;
  const failed = chartRows.filter((row) => row.status === 'Fail').length;
  const notAttempted = chartRows.filter((row) => row.status === 'Not Attempted').length;
  const attempted = passed + failed;
  const passFailData = [
    { name: 'Pass', value: passed, fill: '#16A34A' },
    { name: 'Fail', value: failed, fill: '#DC2626' },
    { name: 'Not Attempted', value: notAttempted, fill: '#A8A29E' },
  ];

  const examColumns: Column<ResultRow>[] = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-800">{row.user.full_name}</p>
          <p className="text-xs text-neutral-400">{row.user.email}</p>
        </div>
      ),
    },
    { key: 'exam', label: 'Exam', render: (row) => <span className="text-neutral-600">{row.examTitle}</span> },
    { key: 'date', label: 'Date', render: (row) => <span>{row.examDate}</span> },
    {
      key: 'score',
      label: 'Score',
      render: (row) =>
        row.score ? (
          <span className="font-medium text-neutral-800">{row.score.total_score}/{selectedExam.totalMarks}</span>
        ) : (
          <span className="text-neutral-400">-</span>
        ),
    },
    { key: 'accuracy', label: 'Accuracy', render: (row) => (row.score ? `${row.score.accuracy_percent}%` : <span className="text-neutral-400">-</span>) },
    { key: 'time', label: 'Time Taken', render: (row) => (row.score ? minutesFromSeconds(row.score.time_taken_seconds) : <span className="text-neutral-400">-</span>) },
    { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
  ];

  const userColumns: Column<(typeof userRows)[number]>[] = [
    {
      key: 'user',
      label: 'User',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-800">{row.user.full_name}</p>
          <p className="text-xs text-neutral-400">{row.user.email}</p>
        </div>
      ),
    },
    { key: 'attempted', label: 'Attempted', render: (row) => row.attempted },
    { key: 'passed', label: 'Passed', render: (row) => <span className="font-medium text-green-700">{row.passed}</span> },
    { key: 'failed', label: 'Failed', render: (row) => <span className="font-medium text-red-700">{row.failed}</span> },
    {
      key: 'latest',
      label: 'Latest Result',
      render: (row) =>
        row.latest ? (
          <span className="text-neutral-600">{row.latest.score?.total_score} marks</span>
        ) : (
          <span className="text-neutral-400">Not attempted</span>
        ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => setSelectedUser(row.user)}>
          <Eye className="h-4 w-4" />
          View Result
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-1">
          <button
            onClick={() => setActiveTab('exam')}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              activeTab === 'exam' ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <ListFilter className="h-4 w-4" />
            Exam Wise Results
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              activeTab === 'user' ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            User Wise Results
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
              activeTab === 'chart' ? 'bg-maroon-600 text-white' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <PieChartIcon className="h-4 w-4" />
            Pass Fail Chart
          </button>
        </div>
      </div>

      {activeTab === 'exam' && (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
            <Select value={examFilter} onChange={(event) => setExamFilter(event.target.value)} className="w-64">
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | ResultStatus)} className="w-40">
              <option value="all">All Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Not Attempted">Not Attempted</option>
            </Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value as ResultSort)} className="w-40">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </Select>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl">
            <DataTable columns={examColumns} data={examRows} rowKey={(row) => row.id} />
          </div>
        </>
      )}

      {activeTab === 'user' && (
        <div className="bg-white border border-neutral-200 rounded-xl">
          <DataTable columns={userColumns} data={userRows} rowKey={(row) => row.user.id} />
        </div>
      )}

      {activeTab === 'chart' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3">
            <Select value={examFilter} onChange={(event) => setExamFilter(event.target.value)} className="w-64">
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.title}</option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Attempted" value={attempted} subtext={`${chartRows.length} total users`} />
            <StatCard label="Passed" value={passed} subtext={`${selectedExam.passingMarks}+ marks`} />
            <StatCard label="Failed" value={failed} subtext="Below passing marks" />
            <StatCard label="Pass Rate" value={attempted ? `${Math.round((passed / attempted) * 100)}%` : '0%'} subtext="Attempted users only" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-neutral-800 mb-4">Pass Fail Split</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={94} paddingAngle={3} isAnimationActive={false}>
                      {passFailData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-neutral-800 mb-4">Students by Result</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={passFailData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#F9F0F0' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
                    <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]} maxBarSize={72} isAnimationActive={false}>
                      {passFailData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser ? `${selectedUser.full_name} Results` : 'User Results'}
        width={680}
        footer={<Button onClick={() => setSelectedUser(null)}>Close</Button>}
      >
        <div className="space-y-3">
          {selectedUserRows.map((row) => (
            <div key={row.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-800">{row.examTitle}</p>
                  <p className="text-xs text-neutral-400">{row.examDate}</p>
                </div>
                {statusBadge(row.status)}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-neutral-400">Score</p>
                  <p className="text-sm font-semibold text-neutral-800">{row.score ? row.score.total_score : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Accuracy</p>
                  <p className="text-sm font-semibold text-neutral-800">{row.score ? `${row.score.accuracy_percent}%` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Time Taken</p>
                  <p className="text-sm font-semibold text-neutral-800">{row.score ? minutesFromSeconds(row.score.time_taken_seconds) : '-'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
