import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAssessmentStore } from '@/store/assessmentStore';
import { useSettingsStore } from '@/store/settingsStore';
import { RoleGuard } from '@/components/shared/RoleGuard';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { AppShell } from '@/components/layout/AppShell';
import { ToastViewport } from '@/components/ui/Toast';

import Login from '@/pages/auth/Login';
import Unauthorized from '@/pages/auth/Unauthorized';
import Profile from '@/pages/Profile';

import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminCourses from '@/pages/admin/Courses';
import AdminCourseDetail from '@/pages/admin/CourseDetail';
import AdminQuestions from '@/pages/admin/Questions';
import AdminAssessments from '@/pages/admin/Assessments';
import AdminAssessmentDetail from '@/pages/admin/AssessmentDetail';
import AdminReports from '@/pages/admin/Reports';
import AdminExams from '@/pages/admin/Exams';
import AdminResults from '@/pages/admin/Results';
import AdminSettings from '@/pages/admin/AdminSettings';

import StudentDashboard from '@/pages/student/Dashboard';
import StudentCourse from '@/pages/student/Course';
import AssessmentPreCheck from '@/pages/student/AssessmentPreCheck';
import AssessmentSession from '@/pages/student/AssessmentSession';
import AssessmentSubmitted from '@/pages/student/AssessmentSubmitted';
import StudentResults from '@/pages/student/Results';
import StudentFeedback from '@/pages/student/Feedback';

import TrainerDashboard from '@/pages/trainer/Dashboard';
import TrainerSessions from '@/pages/trainer/Sessions';

import HRDashboard from '@/pages/hr/Dashboard';
import HRRankings from '@/pages/hr/Rankings';

export default function App() {
  const rehydrateAuth = useAuthStore((s) => s.rehydrate);
  const rehydrateAttempt = useAssessmentStore((s) => s.rehydrate);
  const rehydrateSettings = useSettingsStore((s) => s.rehydrate);

  useEffect(() => {
    rehydrateAuth();
    rehydrateAttempt();
    rehydrateSettings();
  }, [rehydrateAuth, rehydrateAttempt, rehydrateSettings]);

  return (
    <>
      <ToastViewport />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Assessment session is full-screen (no AppShell) */}
        <Route
          path="/student/assessment/session"
          element={
            <RoleGuard role="student">
              <AssessmentSession />
            </RoleGuard>
          }
        />
        <Route
          path="/student/assessment/submitted"
          element={
            <RoleGuard role="student">
              <AssessmentSubmitted />
            </RoleGuard>
          }
        />

        {/* Admin */}
        <Route
          element={
            <RoleGuard role="admin">
              <AppShell />
            </RoleGuard>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/courses/:id" element={<AdminCourseDetail />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
          <Route path="/admin/assessments" element={<AdminAssessments />} />
          <Route path="/admin/assessments/:id" element={<AdminAssessmentDetail />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/results" element={<AdminResults />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* Student */}
        <Route
          element={
            <RoleGuard role="student">
              <AppShell />
            </RoleGuard>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/course" element={<StudentCourse />} />
          <Route path="/student/course/:moduleId" element={<StudentCourse />} />
          <Route path="/student/assessment" element={<AssessmentPreCheck />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/feedback" element={<StudentFeedback />} />
        </Route>

        {/* Trainer */}
        <Route
          element={
            <RoleGuard role="trainer">
              <AppShell />
            </RoleGuard>
          }
        >
          <Route path="/trainer/dashboard" element={<TrainerDashboard />} />
          <Route path="/trainer/sessions" element={<TrainerSessions />} />
        </Route>

        {/* HR */}
        <Route
          element={
            <RoleGuard role="hr">
              <AppShell />
            </RoleGuard>
          }
        >
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/rankings" element={<HRRankings />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
