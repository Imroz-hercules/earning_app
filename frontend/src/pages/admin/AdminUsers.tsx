import { Check, ExternalLink, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { absoluteFileUrl, api } from "../../lib/api";
import type { UserProfile } from "../../types";

export function AdminUsers() {
  const query = useQuery<UserProfile[]>({ queryKey: ["admin-users"], queryFn: () => api("/admin/users") });
  const review = useMutation({
    mutationFn: ({ userId, action }: { userId: string; action: "approve-user" | "reject-user" }) =>
      api(`/admin/${action}`, { method: "POST", body: JSON.stringify({ user_id: userId }) }),
    onSuccess: () => query.refetch(),
  });

  return (
    <section className="panel overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-ink">User management</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-steel">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Bank</th>
              <th className="px-5 py-3">Verification</th>
              <th className="px-5 py-3">Documents</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {query.data?.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-ink">{user.name}</p>
                  <p className="text-steel">{user.email}</p>
                </td>
                <td className="px-5 py-4 text-steel">{user.phone}</td>
                <td className="px-5 py-4 text-steel">
                  {user.bank_account_number ? (
                    <div>
                      <p className="font-semibold text-ink">{user.account_holder_name}</p>
                      <p>{user.bank_name}</p>
                      <p>{user.bank_account_number} · {user.ifsc_code}</p>
                    </div>
                  ) : (
                    "Not added"
                  )}
                </td>
                <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {user.documents?.map((document) => (
                      <a key={document.id} className="btn-secondary min-h-8 px-2 py-1 text-xs" href={absoluteFileUrl(document.file_url)} target="_blank" rel="noreferrer">
                        {document.document_type.replace("_", " ")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button className="btn-secondary min-h-9 px-3" onClick={() => review.mutate({ userId: user.id, action: "approve-user" })}>
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button className="btn-danger min-h-9 px-3" onClick={() => review.mutate({ userId: user.id, action: "reject-user" })}>
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
