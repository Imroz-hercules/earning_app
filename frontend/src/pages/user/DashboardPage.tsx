import { ClipboardCheck, Clock3, FileCheck2, Gift, IdCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { MetricCard } from "../../components/MetricCard";
import { StatusBadge } from "../../components/StatusBadge";
import { absoluteFileUrl, api } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { Attendance, Task, TaskSubmission, UserProfile } from "../../types";

export function DashboardPage() {
  const { profile } = useAuth();
  const authUser = profile as UserProfile;
  const profileQuery = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: () => api("/profile"),
  });
  const user = profileQuery.data ?? authUser;
  const { data } = useQuery<{ task: Task | null; attendance: Attendance | null; submission: TaskSubmission | null }>({
    queryKey: ["today-task"],
    queryFn: () => api("/today-task"),
    enabled: user.status === "approved",
  });

  const locked = user.status !== "approved";
  const documents = user.documents ?? [];
  const governmentId = [...documents].reverse().find((document) => document.document_type === "government_id");
  const selfie = [...documents].reverse().find((document) => document.document_type === "selfie");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Dashboard</h2>
          <p className="text-sm text-steel">Track verification, task access, attendance, and reward eligibility.</p>
        </div>
        <StatusBadge status={user.status} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Verification" value={user.status} icon={FileCheck2} tone={user.status === "approved" ? "mint" : "amber"} />
        <MetricCard label="Today's Task" value={data?.task ? "Ready" : "None"} icon={ClipboardCheck} />
        <MetricCard label="Check In" value={data?.attendance?.check_out ? "Closed" : data?.attendance ? "Active" : "Waiting"} icon={Clock3} tone="amber" />
        <MetricCard label="Reward" value={data?.attendance?.completed ? "Eligible" : "Locked"} icon={Gift} tone={data?.attendance?.completed ? "mint" : "coral"} />
      </div>

      {locked ? (
        <div className="panel p-6">
          <h3 className="text-lg font-bold text-ink">Dashboard locked until approval</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-steel">
            Upload your government ID and selfie, then wait for an admin to approve your account. Daily tasks unlock
            automatically after approval.
          </p>
          <Link className="btn-primary mt-5" to="/verification">
            Upload documents
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="panel overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-mint/10 text-mint">
                <IdCard className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-bold text-ink">Verified identity</h3>
                <p className="text-sm text-steel">Approved member ID card</p>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr]">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {selfie ? (
                  <img className="aspect-square w-full object-cover" src={absoluteFileUrl(selfie.file_url)} alt="Verified selfie" />
                ) : (
                  <div className="grid aspect-square place-items-center text-sm font-semibold text-steel">Selfie</div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-steel">Name</p>
                  <p className="text-lg font-bold text-ink">{user.name}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-steel">Email</p>
                    <p className="break-all text-sm font-semibold text-ink">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-steel">Phone</p>
                    <p className="text-sm font-semibold text-ink">{user.phone}</p>
                  </div>
                </div>
                {governmentId && (
                  <a className="btn-secondary mt-2" href={absoluteFileUrl(governmentId.file_url)} target="_blank" rel="noreferrer">
                    View identity document
                  </a>
                )}
              </div>
            </div>
          </section>

          <section className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-steel">Active task</p>
                <h3 className="mt-1 text-xl font-bold text-ink">{data?.task?.title ?? "No task published yet"}</h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{data?.task?.description}</p>
              </div>
              <Link className="btn-primary" to="/task">
                Open task
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
