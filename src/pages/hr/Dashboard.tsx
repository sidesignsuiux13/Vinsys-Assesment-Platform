import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { COURSES } from '@/mock/courses';
import { USERS } from '@/mock/users';
import type { Course, User } from '@/types';

export default function HRDashboard() {
  const courseColumns: Column<Course>[] = [
    { key: 'title', label: 'Course', render: (course) => <span className="font-medium text-neutral-800">{course.title}</span> },
    { key: 'duration', label: 'Duration', render: (course) => `${course.duration_hours} hrs` },
    { key: 'modules', label: 'Modules', render: (course) => course.modules.length },
    { key: 'status', label: 'Status', render: () => <Badge variant="active">Active</Badge> },
  ];

  const userColumns: Column<User>[] = [
    { key: 'name', label: 'User', render: (user) => <span className="font-medium text-neutral-800">{user.full_name}</span> },
    { key: 'email', label: 'Email', render: (user) => <span className="text-neutral-500">{user.email}</span> },
    { key: 'role', label: 'Role', render: (user) => <Badge variant="neutral">{user.role}</Badge> },
    { key: 'status', label: 'Status', render: (user) => <Badge variant={user.status === 'active' ? 'active' : 'inactive'}>{user.status}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-neutral-200 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-800">Course List</h2>
          </div>
          <DataTable columns={courseColumns} data={COURSES} rowKey={(course) => course.id} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h2 className="text-sm font-semibold text-neutral-800">Users List</h2>
          </div>
          <DataTable columns={userColumns} data={USERS} rowKey={(user) => user.id} />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-800 mb-3">Recent Feedback Snapshot</h2>
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Star className="h-4 w-4 fill-maroon-600 text-maroon-600" />
          Average course feedback rating is 4.3 across 3 responses.
        </div>
      </div>
    </div>
  );
}
