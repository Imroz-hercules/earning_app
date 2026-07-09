import { ClipboardCheck, Clock3, FileCheck2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { MetricCard } from "../../components/MetricCard";
import { api } from "../../lib/api";

type DashboardStats = {
  total_users: number;
  pending_users: number;
  approved_users: number;
  active_tasks: number;
  attendance: number;
  completed_tasks: number;
};

export function AdminDashboard() {
  const { data } = useQuery<DashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: () => api("/admin/dashboard"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink">Admin dashboard</h2>
        <p className="text-sm text-steel">Operational snapshot for users, verification, tasks, and attendance.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total users" value={data?.total_users ?? 0} icon={Users} />
        <MetricCard label="Pending users" value={data?.pending_users ?? 0} icon={FileCheck2} tone="amber" />
        <MetricCard label="Approved users" value={data?.approved_users ?? 0} icon={Users} tone="mint" />
        <MetricCard label="Active tasks" value={data?.active_tasks ?? 0} icon={ClipboardCheck} />
        <MetricCard label="Attendance" value={data?.attendance ?? 0} icon={Clock3} tone="amber" />
        <MetricCard label="Completed tasks" value={data?.completed_tasks ?? 0} icon={ClipboardCheck} tone="mint" />
      </div>
    </div>
  );
}

