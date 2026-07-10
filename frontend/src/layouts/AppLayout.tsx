import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Landmark,
  FileCheck2,
  History,
  Home,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  Users,
  Wallet,
  X,
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { role, profile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const user = profile as UserProfile | null;
  const links = role === "admin" ? adminLinks : user?.status === "approved" ? approvedUserLinks : pendingUserLinks;

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isNavOpen]);

  const closeNav = () => setIsNavOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {isNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeNav}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-sm font-bold text-white">TH</span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink">TaskHub</p>
            <p className="text-xs text-steel">Daily task operations</p>
          </div>
          <button
            type="button"
            className="btn-secondary shrink-0 p-2 lg:hidden"
            onClick={closeNav}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/admin" || to === "/dashboard"}
              onClick={closeNav}
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
          <div className="flex min-h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                className="btn-secondary shrink-0 p-2 lg:hidden"
                onClick={() => setIsNavOpen(true)}
                aria-expanded={isNavOpen}
                aria-controls="app-sidebar"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs text-steel sm:text-sm">
                  {role === "admin" ? "Admin workspace" : "Member workspace"}
                </p>
                <h1 className="truncate text-base font-bold text-ink sm:text-lg">{profile?.name ?? "TaskHub"}</h1>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button type="button" className="theme-toggle px-2 sm:px-4" onClick={toggleTheme} aria-label="Toggle dark mode">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="hidden sm:inline">{isDark ? "Light mode" : "Dark mode"}</span>
              </button>
              <button
                type="button"
                className="btn-secondary px-2 sm:px-4"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
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
