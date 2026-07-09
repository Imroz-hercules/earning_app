import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, LogIn, LogOut, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { EmptyState } from "../../components/EmptyState";
import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { Attendance, Task, TaskSubmission } from "../../types";

export function TaskPage() {
  const [remarks, setRemarks] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const query = useQuery<{ task: Task | null; attendance: Attendance | null; submission: TaskSubmission | null }>({
    queryKey: ["today-task"],
    queryFn: () => api("/today-task"),
  });

  const action = useMutation({
    mutationFn: (path: string) => api(path, { method: "POST" }),
    onSuccess: async () => {
      setMessage("Updated");
      await query.refetch();
    },
    onError: (exc) => setMessage(exc instanceof Error ? exc.message : "Action failed"),
  });

  const submitTask = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("remarks", remarks);
      if (proof) form.append("proof", proof);
      return api("/submit-task", { method: "POST", body: form });
    },
    onSuccess: async () => {
      setMessage("Task submitted for admin review");
      setRemarks("");
      setProof(null);
      await query.refetch();
    },
    onError: (exc) => setMessage(exc instanceof Error ? exc.message : "Submission failed"),
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const duration = useMemo(() => {
    const attendance = query.data?.attendance;
    if (!attendance) return 0;
    if (attendance.check_out) return attendance.duration_minutes;
    return Math.max(0, Math.floor((now - new Date(attendance.check_in).getTime()) / 60000));
  }, [now, query.data?.attendance]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    submitTask.mutate();
  };

  if (query.isLoading) return <EmptyState title="Loading task" body="Fetching today's active task." />;
  if (!query.data?.task) return <EmptyState title="No active task" body="An admin has not published a task yet." />;

  const { task, attendance, submission } = query.data;
  const canSubmit = Boolean(attendance) && (!submission || submission.status === "rejected");
  const isPendingReview = submission?.status === "pending";
  const isApprovedSubmission = submission?.status === "approved";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <section className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-steel">Today's task</p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{task.title}</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-steel">{task.description}</p>
          </div>
          <div className="rounded-md bg-mint/10 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase text-mint">Reward</p>
            <p className="text-2xl font-bold text-ink">₹{task.reward}</p>
          </div>
        </div>

        {task.instructions && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-ink">Instructions</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-steel">{task.instructions}</p>
          </div>
        )}

        {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{message}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" disabled={Boolean(attendance) || action.isPending} onClick={() => action.mutate("/checkin")}>
            <LogIn className="h-4 w-4" />
            Check In
          </button>
          <button className="btn-secondary" disabled={!attendance || Boolean(attendance.check_out) || action.isPending} onClick={() => action.mutate("/checkout")}>
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="panel p-6">
          <h3 className="font-bold text-ink">Attendance status</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-steel">Duration</p>
              <p className="mt-1 text-2xl font-bold text-ink">{duration}m</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-steel">Required</p>
              <p className="mt-1 text-2xl font-bold text-ink">{task.required_minutes}m</p>
            </div>
          </div>
          <div className="mt-4">
            <StatusBadge status={attendance?.completed ? "completed" : attendance ? "pending" : "not checked in"} />
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-ink">Task submission</h3>
            {submission && <StatusBadge status={isApprovedSubmission ? "completed" : submission.status} />}
          </div>

          {isApprovedSubmission ? (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-bold">Completed task</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Admin approved this submission. Upload is closed for this task.
              </p>
              {submission.remarks && <p className="mt-3 text-sm text-emerald-900">{submission.remarks}</p>}
            </div>
          ) : isPendingReview ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-bold text-amber-800">Submitted for admin review</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Your task details are locked while admin reviews them. If admin rejects it, the upload form will open again.
              </p>
              {submission.remarks && <p className="mt-3 text-sm text-amber-900">{submission.remarks}</p>}
            </div>
          ) : (
            <form className="mt-4" onSubmit={submit}>
              {submission?.status === "rejected" && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="font-bold text-red-700">Rejected by admin</p>
                  <p className="mt-2 text-sm leading-6 text-red-700">
                    Fix your task details and upload again for review.
                  </p>
                </div>
              )}
              <textarea
                className="input min-h-28"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Completion remarks"
                required
              />
              <input
                className="input mt-4"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                onChange={(event) => setProof(event.target.files?.[0] ?? null)}
              />
              <button className="btn-primary mt-4 w-full" disabled={!canSubmit || submitTask.isPending}>
                <Send className="h-4 w-4" />
                {submission?.status === "rejected" ? "Resubmit for review" : "Submit for review"}
              </button>
              {!attendance && <p className="mt-3 text-sm text-steel">Check in before submitting your task.</p>}
            </form>
          )}
        </section>
      </aside>
    </div>
  );
}
