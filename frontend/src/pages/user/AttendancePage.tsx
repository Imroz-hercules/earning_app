import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { Attendance } from "../../types";

export function AttendancePage() {
  const { data = [], isLoading } = useQuery<Attendance[]>({ queryKey: ["attendance"], queryFn: () => api("/attendance") });

  if (isLoading) return <EmptyState title="Loading attendance" body="Fetching your check-in history." />;

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-ink">Attendance</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Check in</th>
              <th className="px-5 py-3">Check out</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4 font-semibold text-ink">{row.task?.title ?? "Task"}</td>
                <td className="px-5 py-4 text-steel">{new Date(row.check_in).toLocaleString()}</td>
                <td className="px-5 py-4 text-steel">{row.check_out ? new Date(row.check_out).toLocaleString() : "-"}</td>
                <td className="px-5 py-4 text-steel">{row.duration_minutes}m</td>
                <td className="px-5 py-4"><StatusBadge status={row.completed ? "completed" : "pending"} /></td>
              </tr>
            ))}
            {!data.length && (
              <tr>
                <td className="px-5 py-8 text-steel" colSpan={5}>No attendance records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

