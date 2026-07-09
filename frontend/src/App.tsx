import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./layouts/AppLayout";
import { useAuth } from "./state/AuthContext";
import { AdminAttendance } from "./pages/admin/AdminAttendance";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminReports } from "./pages/admin/AdminReports";
import { AdminTasks } from "./pages/admin/AdminTasks";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminWithdrawals } from "./pages/admin/AdminWithdrawals";
import { AttendancePage } from "./pages/user/AttendancePage";
import { BankDetailsPage } from "./pages/user/BankDetailsPage";
import { DashboardPage } from "./pages/user/DashboardPage";
import { HistoryPage } from "./pages/user/HistoryPage";
import { TaskPage } from "./pages/user/TaskPage";
import { VerificationPage } from "./pages/user/VerificationPage";
import { LandingPage } from "./pages/public/LandingPage";
import { LoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import type { UserProfile } from "./types";

function Protected({ children, role }: { children: React.ReactNode; role: "user" | "admin" }) {
  const auth = useAuth();
  if (auth.loading) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-steel">Loading TaskHub...</div>;
  }
  if (!auth.token || auth.role !== role) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
  }
  return <>{children}</>;
}

function UserStatusGate({
  children,
  approvedOnly = false,
  verificationOnly = false,
}: {
  children: React.ReactNode;
  approvedOnly?: boolean;
  verificationOnly?: boolean;
}) {
  const { profile } = useAuth();
  const user = profile as UserProfile;

  if (verificationOnly && user.status === "approved") {
    return <Navigate to="/dashboard" replace />;
  }
  if (approvedOnly && user.status !== "approved") {
    return <Navigate to="/verification" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage admin />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <Protected role="user">
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<UserStatusGate approvedOnly><DashboardPage /></UserStatusGate>} />
        <Route path="/verification" element={<UserStatusGate verificationOnly><VerificationPage /></UserStatusGate>} />
        <Route path="/task" element={<UserStatusGate approvedOnly><TaskPage /></UserStatusGate>} />
        <Route path="/attendance" element={<UserStatusGate approvedOnly><AttendancePage /></UserStatusGate>} />
        <Route path="/history" element={<UserStatusGate approvedOnly><HistoryPage /></UserStatusGate>} />
        <Route path="/bank-details" element={<UserStatusGate approvedOnly><BankDetailsPage /></UserStatusGate>} />
      </Route>

      <Route
        element={
          <Protected role="admin">
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
