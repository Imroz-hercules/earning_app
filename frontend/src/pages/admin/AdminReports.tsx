import { CheckCircle2, Clock3, FileX2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { MetricCard } from "../../components/MetricCard";
import { StatusBadge } from "../../components/StatusBadge";
import { absoluteFileUrl, api } from "../../lib/api";
import type { TaskSubmission } from "../../types";

type Reports = {
  completed_tasks: number;
  pending_tasks: number;
  rejected_tasks: number;
  checked_in: number;
};

export function AdminReports() {
  const reports = useQuery<Reports>({ queryKey: ["admin-reports"], queryFn: () => api("/admin/reports") });
  const submissions = useQuery<TaskSubmission[]>({ queryKey: ["admin-submissions"], queryFn: () => api("/admin/submissions") });
  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api(`/admin/submission/${id}/${status}`, { method: "POST" }),
    onSuccess: async () => {
      await Promise.all([reports.refetch(), submissions.refetch()]);
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Completed" value={reports.data?.completed_tasks ?? 0} icon={CheckCircle2} tone="mint" />
        <MetricCard label="Pending" value={reports.data?.pending_tasks ?? 0} icon={Clock3} tone="amber" />
        <MetricCard label="Rejected" value={reports.data?.rejected_tasks ?? 0} icon={FileX2} tone="coral" />
        <MetricCard label="Checked in" value={reports.data?.checked_in ?? 0} icon={Clock3} />
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-bold text-ink">Task submissions</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {submissions.data?.map((submission) => (
            <article key={submission.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <h3 className="font-semibold text-ink">{submission.task?.title ?? "Task"}</h3>
                <p className="mt-1 text-sm text-steel">{submission.user?.name} · {new Date(submission.submitted_at).toLocaleString()}</p>
                {submission.proof_file && (
                  <a className="mt-1 inline-block text-sm font-semibold text-sky" href={absoluteFileUrl(submission.proof_file)} target="_blank" rel="noreferrer">
                    View proof
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={submission.status} />
                <button className="btn-secondary min-h-9 px-3" onClick={() => review.mutate({ id: submission.id, status: "approved" })}>Approve</button>
                <button className="btn-danger min-h-9 px-3" onClick={() => review.mutate({ id: submission.id, status: "rejected" })}>Reject</button>
              </div>
            </article>
          ))}
          {!submissions.data?.length && <p className="px-5 py-8 text-sm text-steel">No submissions yet.</p>}
        </div>
      </section>
    </div>
  );
}

