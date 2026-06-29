import { useNavigate } from 'react-router-dom';
import { Clock, Layers, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COURSES } from '@/mock/courses';
import { USERS } from '@/mock/users';

export default function AdminCourses() {
  const navigate = useNavigate();
  const enrolled = USERS.filter((u) => u.role === 'student').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {COURSES.map((course) => (
        <div
          key={course.id}
          className="bg-white border border-neutral-200 rounded-xl p-5 border-l-4 border-l-maroon-600"
        >
          <h2 className="text-lg font-semibold text-neutral-800">{course.title}</h2>
          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{course.description}</p>

          <div className="flex items-center gap-5 mt-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-neutral-400" />
              {course.duration_hours} hrs
            </span>
            <span className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-neutral-400" />
              {course.modules.length} modules
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-neutral-400" />
              {enrolled} enrolled
            </span>
          </div>

          <Button className="mt-5" variant="secondary" onClick={() => navigate(`/admin/courses/${course.id}`)}>
            Manage
          </Button>
        </div>
      ))}
    </div>
  );
}
