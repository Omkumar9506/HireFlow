import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../constants';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { CandidateLayout } from '../layouts/CandidateLayout';
import { RecruiterLayout } from '../layouts/RecruiterLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { JobsPage } from '../pages/public/JobsPage';
import { JobDetailsPage } from '../pages/public/JobDetailsPage';
import { CompaniesPage } from '../pages/public/CompaniesPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage, VerifyEmailPage } from '../pages/auth/ResetPasswordPage';

// Candidate Pages
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard';
import { ProfilePage } from '../pages/candidate/ProfilePage';
import { ResumePage } from '../pages/candidate/ResumePage';
import { ApplicationsPage } from '../pages/candidate/ApplicationsPage';
import { ApplicationDetailsPage } from '../pages/candidate/ApplicationDetailsPage';
import { SavedJobsPage } from '../pages/candidate/SavedJobsPage';
import { CandidateInterviewsPage } from '../pages/candidate/CandidateInterviewsPage';

// Recruiter Pages
import { RecruiterDashboard } from '../pages/recruiter/RecruiterDashboard';
import { MyJobsPage } from '../pages/recruiter/MyJobsPage';
import { CreateJobPage } from '../pages/recruiter/CreateJobPage';
import { JobApplicationsKanbanPage } from '../pages/recruiter/JobApplicationsKanbanPage';
import { RecruiterInterviewsPage } from '../pages/recruiter/RecruiterInterviewsPage';
import { CompanyProfilePage } from '../pages/recruiter/CompanyProfilePage';
import { RecruiterAnalyticsPage } from '../pages/recruiter/RecruiterAnalyticsPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UsersManagementPage } from '../pages/admin/UsersManagementPage';
import { CompaniesVerificationPage } from '../pages/admin/CompaniesVerificationPage';
import { JobModerationPage } from '../pages/admin/JobModerationPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
      </Route>

      {/* Auth Pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      {/* Candidate Protected Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={[ROLES.CANDIDATE, ROLES.ADMIN]}>
            <CandidateLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="resume" element={<ResumePage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="applications/:id" element={<ApplicationDetailsPage />} />
        <Route path="saved-jobs" element={<SavedJobsPage />} />
        <Route path="interviews" element={<CandidateInterviewsPage />} />
      </Route>

      {/* Recruiter Protected Routes */}
      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={[ROLES.RECRUITER, ROLES.ADMIN]}>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="jobs" element={<MyJobsPage />} />
        <Route path="jobs/create" element={<CreateJobPage />} />
        <Route path="jobs/:id/applications" element={<JobApplicationsKanbanPage />} />
        <Route path="interviews" element={<RecruiterInterviewsPage />} />
        <Route path="company" element={<CompanyProfilePage />} />
        <Route path="analytics" element={<RecruiterAnalyticsPage />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="companies" element={<CompaniesVerificationPage />} />
        <Route path="jobs" element={<JobModerationPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
