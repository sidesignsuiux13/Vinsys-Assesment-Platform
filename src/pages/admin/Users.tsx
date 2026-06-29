import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { Plus, Search, Upload, Download } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input, Select } from '@/components/ui/Input';
import { useToastStore } from '@/components/ui/Toast';
import { USERS } from '@/mock/users';
import { COURSE } from '@/mock/courses';
import { ROLE_LABELS, uuid } from '@/lib/constants';
import { downloadSampleUsersCSV, parseUsersCSV } from '@/lib/csv';
import type { Role, User, UserStatus } from '@/types';

const VALID_ROLES: Role[] = ['admin', 'trainer', 'hr', 'student'];

export default function AdminUsers() {
  const push = useToastStore((s) => s.push);
  const [users, setUsers] = useState<User[]>(() => USERS.map((u) => ({ ...u })));
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student' as Role,
    course_id: COURSE.id,
  });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (search && !`${u.full_name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: (u.status === 'active' ? 'inactive' : 'active') as UserStatus } : u
      )
    );
  };

  const handleCSV = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-uploading the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseUsersCSV(String(reader.result ?? ''));
      if (!parsed.length) {
        push('error', 'No valid users found in the file.');
        return;
      }
      const imported: User[] = parsed.map((p) => {
        const role = (VALID_ROLES.includes(p.role.toLowerCase() as Role) ? p.role.toLowerCase() : 'student') as Role;
        return {
          id: uuid(),
          full_name: p.full_name,
          email: p.email,
          password: p.password || 'Demo@123',
          role,
          status: 'active',
          ...(role === 'student'
            ? { course_id: COURSE.id, training_status: 'not_started' as const, enrollment_date: new Date().toISOString().slice(0, 10) }
            : {}),
        };
      });
      setUsers((prev) => [...imported, ...prev]);
      push('success', `${imported.length} user${imported.length > 1 ? 's' : ''} imported.`);
      setDrawerOpen(false);
    };
    reader.onerror = () => push('error', 'Could not read the selected file.');
    reader.readAsText(file);
  };

  const handleAdd = () => {
    if (!form.full_name || !form.email) {
      push('error', 'Name and email are required.');
      return;
    }
    const newUser: User = {
      id: uuid(),
      full_name: form.full_name,
      email: form.email,
      password: form.password || 'Demo@123',
      role: form.role,
      status: 'active',
      ...(form.role === 'student'
        ? { course_id: form.course_id, training_status: 'not_started', enrollment_date: new Date().toISOString().slice(0, 10) }
        : {}),
    };
    setUsers((prev) => [newUser, ...prev]);
    push('success', `User ${form.full_name} added.`);
    setDrawerOpen(false);
    setForm({ full_name: '', email: '', password: '', role: 'student', course_id: COURSE.id });
  };

  const columns: Column<User>[] = [
    { key: 'full_name', label: 'Name', render: (u) => <span className="font-medium text-neutral-800">{u.full_name}</span> },
    { key: 'email', label: 'Email', render: (u) => <span className="text-neutral-500">{u.email}</span> },
    { key: 'role', label: 'Role', render: (u) => <Badge variant="neutral">{ROLE_LABELS[u.role]}</Badge> },
    {
      key: 'status',
      label: 'Status',
      render: (u) => (
        <button onClick={() => toggleStatus(u.id)} title="Click to toggle">
          <Badge variant={u.status === 'active' ? 'active' : 'inactive'} />
        </button>
      ),
    },
    {
      key: 'course',
      label: 'Course',
      render: (u) => (u.role === 'student' ? <span className="text-neutral-500">{COURSE.title}</span> : <span className="text-neutral-300">—</span>),
    },
    {
      key: 'created',
      label: 'Created At',
      render: (u) => <span className="text-neutral-500">{u.enrollment_date ?? '2026-03-01'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (u) => (
        <button
          onClick={() => toggleStatus(u.id)}
          className="text-xs text-maroon-600 hover:underline"
        >
          {u.status === 'active' ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-36">
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="trainer">Trainer</option>
            <option value="hr">HR</option>
            <option value="student">Student</option>
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
        </div>
        <Button onClick={() => setDrawerOpen(true)}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl">
        <DataTable columns={columns} data={filtered} rowKey={(u) => u.id} />
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Jane Doe" />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@vinsys.com" />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Demo@123" />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            <option value="student">Student</option>
            <option value="trainer">Trainer</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </Select>
          {form.role === 'student' && (
            <Select label="Assign Course" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value={COURSE.id}>{COURSE.title}</option>
            </Select>
          )}

          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium text-neutral-700">Bulk upload users</p>
            <p className="text-xs text-neutral-400 mt-0.5 mb-2.5">
              Import multiple users from an Excel/CSV file (Full Name, Email, Password, Role, Course).
            </p>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,text/csv" onChange={handleCSV} className="hidden" />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadSampleUsersCSV}>
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
