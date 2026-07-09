import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Landmark,
  FileCheck2,
  History,
  Home,
  LogOut,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Wallet,
} from "lucide-react";

import { useAuth } from "../state/AuthContext";
import { useTheme } from "../state/ThemeContext";
import type { UserProfile } from "../types";

const approvedUserLinks = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/task", label: "Today's Task", icon: ClipboardCheck },
  { to: "/attendance", label: "Attendance", icon: History },
  { to: "/history", label: "Task History", icon: ClipboardCheck },
  { to: "/bank-details", label: "Bank Details", icon: Landmark },
];

const pendingUserLinks = [
  { to: "/verification", label: "Verification", icon: FileCheck2 },
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: Home },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/tasks", label: "Daily Tasks", icon: ClipboardCheck },
  { to: "/admin/attendance", label: "Attendance", icon: History },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/reports", label: "Reports", icon: ShieldCheck },
];

export function AppLayout() {
  const { role, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = profile as UserProfile | null;
  const links = role === "admin" ? adminLinks : user?.status === "approved" ? approvedUserLinks : pendingUserLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-sm font-bold text-white">TH</span>
          <div>
            <p className="font-bold text-ink">TaskHub</p>
            <p className="text-xs text-steel">Daily task operations</p>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin" || to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-ink text-white" : "text-steel hover:bg-slate-100 hover:text-ink"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm text-steel">{role === "admin" ? "Admin workspace" : "Member workspace"}</p>
              <h1 className="text-lg font-bold text-ink">{profile?.name ?? "TaskHub"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="input max-w-48 lg:hidden"
                onChange={(event) => navigate(event.target.value)}
                value={links.some((link) => link.to === location.pathname) ? location.pathname : links[0]?.to}
                aria-label="Navigate"
              >
                {links.map((link) => (
                  <option key={link.to} value={link.to}>
                    {link.label}
                  </option>
                ))}
              </select>
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? "Light mode" : "Dark mode"}</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
