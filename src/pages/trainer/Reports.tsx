import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Input';
import { StatCard } from '@/components/shared/StatCard';
import { ASSESSMENTS } from '@/mock/assessments';
import { COURSES } from '@/mock/courses';
import { SCORES } from '@/mock/scores';
import { USERS } from '@/mock/users';
import { minutesFromSeconds } from '@/lib/constants';
import type { Assessment, Score, User } from '@/types';

type ReportStatus = 'Pass' | 'Fail' | 'Not Attempted';

interface ReportRow {
  id: string;
  courseTitle: string;
  assessment: Assessment;
  student: User;
  score?: Score;
  status: ReportStatus;
}

const trainerCourseIds = ['course-1'];

function getStatus(score: Score | undefined, passingMarks: number): ReportStatus {
  if (!score) return 'Not Attempted';
  return score.total_score >= passingMarks ? 'Pass' : 'Fail';
}

function statusBadge(status: ReportStatus) {
  if (status === 'Pass') return <Badge variant="active">Pass</Badge>;
  if (status === 'Fail') return <Badge variant="incorrect">Fail</Badge>;
  return <Badge variant="draft">Not Attempted</Badge>;
}

export default function TrainerReports() {
  const [courseFilter, setCourseFilter] = useState(trainerCourseIds[0]);

  const trainerCourses = COURSES.filter((course) => trainerCourseIds.includes(course.id));
  const rows = useMemo<ReportRow[]>(() => {
    const students = USERS.filter((user) => user.role === 'student' && user.course_id === courseFilter);
    return ASSESSMENTS.filter((assessment) => assessment.course_id === courseFilter).flatMap((assessment) =>
      students.map((student) => {
        const score = SCORES.find((item) => item.user_id === student.id && item.assessment_id === assessment.id);
        return {
          id: `${assessment.id}-${student.id}`,
          courseTitle: COURSES.find((course) => course.id === assessment.course_id)?.title ?? 'Course removed',
          assessment,
          student,
          score,
          status: getStatus(score, assessment.passing_marks),
        };
      })
    );
  }, [courseFilter]);

  const attempted = rows.filter((row) => row.score).length;
  const passed = rows.filter((row) => row.status === 'Pass').length;
  const failed = rows.filter((row) => row.status === 'Fail').length;
  const notAttempted = rows.filter((row) => row.status === 'Not Attempted').length;
  const avgScore = attempted
    ? Math.round(rows.reduce((sum, row) => sum + (row.score?.total_score ?? 0), 0) / attempted)
    : 0;
  const selectedAssessment = rows[0]?.assessment;

  const passFailData = [
    { name: 'Pass', value: passed, fill: '#16A34A' },
    { name: 'Fail', value: failed, fill: '#DC2626' },
    { name: 'Not Attempted', value: notAttempted, fill: '#A8A29E' },
  ];

  const scoreData = rows.map((row) => ({
    student: row.student.full_name.split(' ')[0],
    score: row.score?.total_score ?? 0,
  }));

  const columns: Column<ReportRow>[] = [
    {
      key: 'student',
      label: 'Student',
      render: (row) => (
        <div>
          <p className="font-medium text-neutral-800">{row.student.full_name}</p>
          <p className="text-xs text-neutral-400">{row.student.email}</p>
        </div>
      ),
    },
    { key: 'course', label: 'Course', render: (row) => <span className="text-neutral-500">{row.courseTitle}</span> },
    { key: 'assessment', label: 'Assessment', render: (row) => <span className="font-medium text-neutral-700">{row.assessment.title}</span> },
    {
      key: 'score',
      label: 'Score',
      render: (row) =>
        row.score ? (
          <span className="font-medium text-neutral-800">{row.score.total_score}/{row.assessment.total_marks}</span>
        ) : (
          <span className="text-neutral-400">-</span>
        ),
    },
    { key: 'accuracy', label: 'Accuracy', render: (row) => (row.score ? `${row.score.accuracy_percent}%` : <span className="text-neutral-400">-</span>) },
    { key: 'time', label: 'Time Taken', render: (row) => (row.score ? minutesFromSeconds(row.score.time_taken_seconds) : <span className="text-neutral-400">-</span>) },
    { key: 'status', label: 'Status', render: (row) => statusBadge(row.status) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="w-72">
          {trainerCourses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </Select>
        <Badge variant="neutral">Mapped trainer course</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Students" value={rows.length} subtext="Mapped to selected course" />
        <StatCard label="Attempted" value={attempted} subtext={selectedAssessment?.title ?? 'No assessment'} />
        <StatCard label="Passed" value={passed} subtext={`${failed} failed`} />
        <StatCard label="Avg Score" value={attempted ? `${avgScore}/${selectedAssessment?.total_marks ?? 0}` : '-'} subtext="Attempted students only" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Pass Fail Split</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={passFailData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={88} paddingAngle={3} isAnimationActive={false}>
                  {passFailData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-neutral-800 mb-4">Student Scores</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2DDD8" vertical={false} />
                <XAxis dataKey="student" tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={{ stroke: '#E2DDD8' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A6E66' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F9F0F0' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2DDD8', fontSize: 12 }} />
                <Bar dataKey="score" name="Score" fill="#7B1C1C" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="text-sm font-semibold text-neutral-800">Assessment Reports by Student</h2>
        </div>
        <DataTable columns={columns} data={rows} rowKey={(row) => row.id} />
      </div>
    </div>
  );
}
