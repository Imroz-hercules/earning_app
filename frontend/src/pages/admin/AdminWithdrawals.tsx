import { Check, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { WithdrawalRequest } from "../../types";

export function AdminWithdrawals() {
  const query = useQuery<WithdrawalRequest[]>({
    queryKey: ["admin-withdrawals"],
    queryFn: () => api("/admin/withdrawals"),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api(`/admin/withdrawal/${id}/${status}`, { method: "POST" }),
    onSuccess: () => query.refetch(),
  });

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-ink">Withdrawal requests</h2>
        <p className="mt-1 text-sm text-steel">Review member payout requests and approve or reject them.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Bank</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Requested</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {query.data?.map((request) => (
              <tr key={request.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{request.user?.name ?? "Member"}</p>
                  <p className="text-steel">{request.user?.email}</p>
                </td>
                <td className="px-5 py-4 text-steel">
                  {request.user?.bank_account_number ? (
                    <div>
                      <p className="font-semibold text-ink">{request.user.account_holder_name}</p>
                      <p>{request.user.bank_name}</p>
                      <p>
                        {request.user.bank_account_number} · {request.user.ifsc_code}
                      </p>
                    </div>
                  ) : (
                    "Not added"
                  )}
                </td>
                <td className="px-5 py-4 font-semibold text-ink">{request.amount.toFixed(2)}</td>
                <td className="px-5 py-4 text-steel">{new Date(request.requested_at).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-5 py-4">
                  {request.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        className="btn-secondary min-h-9 px-3"
                        onClick={() => review.mutate({ id: request.id, status: "approved" })}
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        className="btn-danger min-h-9 px-3"
                        onClick={() => review.mutate({ id: request.id, status: "rejected" })}
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-steel">Reviewed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!query.data?.length && <p className="px-5 py-8 text-sm text-steel">No withdrawal requests yet.</p>}
      </div>
    </section>
  );
}
