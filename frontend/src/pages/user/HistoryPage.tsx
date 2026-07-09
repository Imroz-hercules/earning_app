import { useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { api, absoluteFileUrl } from "../../lib/api";
import type { TaskSubmission } from "../../types";

export function HistoryPage() {
  const { data = [] } = useQuery<TaskSubmission[]>({ queryKey: ["task-history"], queryFn: () => api("/task-history") });

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-ink">Task history</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {data.map((submission) => (
          <article key={submission.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h3 className="font-semibold text-ink">{submission.task?.title ?? "Task"}</h3>
              <p className="mt-1 text-sm text-steel">{new Date(submission.submitted_at).toLocaleString()}</p>
              {submission.proof_file && (
                <a className="mt-1 inline-block text-sm font-semibold text-sky" href={absoluteFileUrl(submission.proof_file)} target="_blank" rel="noreferrer">
                  View proof
                </a>
              )}
            </div>
            <StatusBadge status={submission.status} />
          </article>
        ))}
        {!data.length && <p className="px-5 py-8 text-sm text-steel">No task submissions yet.</p>}
      </div>
    </section>
  );
}

