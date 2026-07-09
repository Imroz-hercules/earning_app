import { useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { Attendance } from "../../types";

export function AdminAttendance() {
  const { data = [] } = useQuery<Attendance[]>({ queryKey: ["admin-attendance"], queryFn: () => api("/admin/attendance") });

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-ink">Attendance review</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Check in</th>
              <th className="px-5 py-3">Check out</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Completed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4 font-semibold text-ink">{row.user?.name ?? row.user_id}</td>
                <td className="px-5 py-4 text-steel">{row.task?.title ?? row.task_id}</td>
                <td className="px-5 py-4 text-steel">{new Date(row.check_in).toLocaleString()}</td>
                <td className="px-5 py-4 text-steel">{row.check_out ? new Date(row.check_out).toLocaleString() : "-"}</td>
                <td className="px-5 py-4 text-steel">{row.duration_minutes}m</td>
                <td className="px-5 py-4"><StatusBadge status={row.completed ? "completed" : "pending"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

