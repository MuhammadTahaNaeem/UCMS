import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthGuard } from "@/routes/AuthGuard";
import { RequireAuth } from "@/routes/RequireAuth";
import { initSocket } from "@/lib/socket";

// Auth pages
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { EmailVerificationPage } from "@/features/auth/pages/EmailVerificationPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { NotificationsPage } from "@/features/notifications/NotificationsPage";

// User pages
import { UserLayout } from "@/features/user/components/UserLayout";
import { UserDashboardPage } from "@/features/user/pages/UserDashboardPage";
import { ComplaintListPage } from "@/features/user/pages/ComplaintListPage";
import { CreateComplaintPage } from "@/features/user/pages/CreateComplaintPage";
import { ComplaintDetailsPage } from "@/features/user/pages/ComplaintDetailsPage";
import { ProfilePage } from "@/features/user/pages/ProfilePage";

// Admin pages and layout
import { AdminLayout } from "@/features/admin/components/AdminLayout";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import AdminComplaintsQueuePage from "@/features/admin/pages/AdminComplaintsQueuePage";
import AdminAssignmentBoardPage from "@/features/admin/pages/AdminAssignmentBoardPage";
import StaffManagementPage from "@/features/admin/pages/StaffManagementPage";
import AssignedComplaintsPage from "@/features/staff/pages/AssignedComplaintsPage";
import AdminComplaintDetailPage from "@/features/admin/pages/AdminComplaintDetailPage";
import StaffComplaintDetailPage from "@/features/staff/pages/StaffComplaintDetailPage";

// Staff pages and layout
import { StaffLayout } from "@/features/staff/components/StaffLayout";
import { StaffDashboardPage } from "@/features/staff/pages/StaffDashboardPage";
import StaffProfilePage from "@/features/staff/pages/StaffProfilePage";

// Admin Profile & Analytics pages
import AdminProfilePage from "@/features/admin/pages/AdminProfilePage";
import AdminAnalyticsPage from "@/features/admin/pages/AdminAnalyticsPage";
import { SuperAdminLayout } from "@/features/super-admin/components/SuperAdminLayout";
import { SuperAdminDashboardPage } from "@/features/super-admin/pages/SuperAdminDashboardPage";
import { SuperAdminAdminsPage } from "@/features/super-admin/pages/SuperAdminAdminsPage";
import { SuperAdminActivityPage } from "@/features/super-admin/pages/SuperAdminActivityPage";
import SuperAdminDepartmentsPage from "@/features/super-admin/pages/SuperAdminDepartmentsPage";
import SuperAdminDepartmentAdminsPage from "@/features/super-admin/pages/SuperAdminDepartmentAdminsPage";
import SuperAdminSettingsPage from "@/features/super-admin/pages/SuperAdminSettingsPage";

const App = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - unauthenticated users only */}
        <Route element={<AuthGuard />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/email-verification/:token" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* Admin routes - admins and super admins */}
        <Route element={<RequireAuth allowedRoles={["Admin", "SuperAdmin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="complaints" element={<AdminComplaintsQueuePage />} />
            <Route path="assignments" element={<AdminAssignmentBoardPage />} />
            <Route
              path="complaints/:id"
              element={<AdminComplaintDetailPage />}
            />
            <Route
              path="notifications"
              element={<NotificationsPage rolePrefix="/admin" title="Notifications" subtitle="New complaints and complaint updates" />}
            />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Route>

        {/* SuperAdmin routes - super admin only */}
        <Route element={<RequireAuth allowedRoles={["SuperAdmin"]} />}>
          <Route path="/super-admin" element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="admins" element={<SuperAdminAdminsPage />} />
            <Route path="departments" element={<SuperAdminDepartmentsPage />} />
            <Route path="department-admins" element={<SuperAdminDepartmentAdminsPage />} />
            <Route path="settings" element={<SuperAdminSettingsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
            <Route path="activity" element={<SuperAdminActivityPage />} />
            <Route
              path="notifications"
              element={<NotificationsPage rolePrefix="/super-admin" title="Notifications" subtitle="Platform updates and complaint activity" />}
            />
          </Route>
        </Route>

        {/* Staff routes - staff only */}
        <Route element={<RequireAuth allowedRoles={["Staff"]} />}>
          <Route path="/staff" element={<StaffLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="complaints" element={<AssignedComplaintsPage />} />
            <Route
              path="complaints/:id"
              element={<StaffComplaintDetailPage />}
            />
            <Route path="assigned" element={<AssignedComplaintsPage />} />
            <Route path="profile" element={<StaffProfilePage />} />
            <Route
              path="notifications"
              element={<NotificationsPage rolePrefix="/staff" title="Notifications" subtitle="Complaint assignments and work updates" />}
            />
          </Route>
        </Route>

        {/* User routes - users only */}
        <Route element={<RequireAuth allowedRoles={["User"]} />}>
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="complaints" element={<ComplaintListPage />} />
            <Route path="complaints/create" element={<CreateComplaintPage />} />
            <Route path="complaints/:id" element={<ComplaintDetailsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="notifications"
              element={<NotificationsPage rolePrefix="/user" title="Notifications" subtitle="Complaint approvals, rejections, and progress updates" />}
            />
          </Route>
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
