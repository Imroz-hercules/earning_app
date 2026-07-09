import { FormEvent, useState } from "react";
import { Building2, IndianRupee, Save, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { EarningsSummary, UserProfile, WithdrawalRequest } from "../../types";

const emptyBankForm = {
  account_holder_name: "",
  bank_name: "",
  bank_account_number: "",
  ifsc_code: "",
};

export function BankDetailsPage() {
  const [form, setForm] = useState(emptyBankForm);
  const [message, setMessage] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMessage, setWithdrawMessage] = useState("");

  const profile = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api<UserProfile>("/profile");
      setForm({
        account_holder_name: response.account_holder_name,
        bank_name: response.bank_name,
        bank_account_number: response.bank_account_number,
        ifsc_code: response.ifsc_code,
      });
      return response;
    },
  });

  const earnings = useQuery<EarningsSummary>({
    queryKey: ["earnings"],
    queryFn: () => api("/earnings"),
  });

  const withdrawals = useQuery<WithdrawalRequest[]>({
    queryKey: ["withdrawal-requests"],
    queryFn: () => api("/withdrawal-requests"),
  });

  const save = useMutation({
    mutationFn: () =>
      api<UserProfile>("/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      }),
    onSuccess: async () => {
      setMessage("Bank details saved");
      await profile.refetch();
    },
    onError: (exc) => setMessage(exc instanceof Error ? exc.message : "Could not save bank details"),
  });

  const withdraw = useMutation({
    mutationFn: (amount: number) =>
      api<WithdrawalRequest>("/withdrawal-request", {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    onSuccess: async () => {
      setWithdrawMessage("Withdrawal request sent to admin");
      setWithdrawAmount("");
      await Promise.all([earnings.refetch(), withdrawals.refetch()]);
    },
    onError: (exc) => setWithdrawMessage(exc instanceof Error ? exc.message : "Could not send withdrawal request"),
  });

  const saved = Boolean(
    profile.data?.account_holder_name &&
      profile.data?.bank_name &&
      profile.data?.bank_account_number &&
      profile.data?.ifsc_code,
  );
  const availableBalance = earnings.data?.available_balance ?? 0;
  const hasPendingWithdrawal = withdrawals.data?.some((request) => request.status === "pending") ?? false;
  const canWithdraw = saved && availableBalance > 0 && !hasPendingWithdrawal;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  const submitWithdrawal = (event: FormEvent) => {
    event.preventDefault();
    withdraw.mutate(Number(withdrawAmount));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-ink">Bank Details</h2>
          <p className="text-sm text-steel">Add or update bank account details for reward processing.</p>
        </div>
        <StatusBadge status={saved ? "completed" : "pending"} />
      </div>

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-mint/10 text-mint">
            <IndianRupee className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Withdraw earnings</h3>
            <p className="text-sm text-steel">Send a withdrawal request for your approved task earnings.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-steel">Total earning</p>
            <p className="mt-1 text-xl font-bold text-ink">{earnings.data?.total_earning.toFixed(2) ?? "0.00"}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-steel">Available balance</p>
            <p className="mt-1 text-xl font-bold text-ink">{availableBalance.toFixed(2)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase text-steel">Pending withdrawal</p>
            <p className="mt-1 text-xl font-bold text-ink">{earnings.data?.pending_withdrawal.toFixed(2) ?? "0.00"}</p>
          </div>
        </div>

        {withdrawMessage && (
          <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{withdrawMessage}</p>
        )}

        {!saved && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Save your bank details below before sending a withdrawal request.
          </p>
        )}

        {hasPendingWithdrawal && (
          <p className="mt-4 rounded-md bg-sky/10 px-3 py-2 text-sm font-semibold text-sky">
            You already have a pending withdrawal request. Please wait for admin review.
          </p>
        )}

        <form className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto_auto]" onSubmit={submitWithdrawal}>
          <label className="block text-sm font-semibold text-ink">
            Withdrawal amount
            <input
              className="input mt-2"
              type="number"
              min="0"
              step="0.01"
              max={availableBalance}
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              placeholder="Enter amount"
              disabled={!canWithdraw}
              required
            />
          </label>
          <button
            type="button"
            className="btn-secondary self-end"
            disabled={!canWithdraw}
            onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
          >
            Use full balance
          </button>
          <button className="btn-primary self-end" disabled={!canWithdraw || withdraw.isPending}>
            <Send className="h-4 w-4" />
            {withdraw.isPending ? "Sending..." : "Send request"}
          </button>
        </form>
      </section>

      <section className="panel p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-sky/10 text-sky">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-ink">Account information</h3>
            <p className="text-sm text-steel">These details are visible to admins for payout review.</p>
          </div>
        </div>

        {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{message}</p>}

        <form className="mt-6 grid gap-4 lg:grid-cols-2" onSubmit={submit}>
          <label className="block text-sm font-semibold text-ink">
            Account holder name
            <input
              className="input mt-2"
              value={form.account_holder_name}
              onChange={(event) => setForm({ ...form, account_holder_name: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Bank name
            <input
              className="input mt-2"
              value={form.bank_name}
              onChange={(event) => setForm({ ...form, bank_name: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Bank account number
            <input
              className="input mt-2"
              inputMode="numeric"
              value={form.bank_account_number}
              onChange={(event) => setForm({ ...form, bank_account_number: event.target.value })}
              required
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            IFSC code
            <input
              className="input mt-2 uppercase"
              value={form.ifsc_code}
              onChange={(event) => setForm({ ...form, ifsc_code: event.target.value.toUpperCase() })}
              required
            />
          </label>
          <button className="btn-primary lg:col-span-2" disabled={save.isPending}>
            <Save className="h-4 w-4" />
            {save.isPending ? "Saving..." : "Save bank details"}
          </button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="font-bold text-ink">Withdrawal history</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {withdrawals.data?.map((request) => (
            <article key={request.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-ink">{request.amount.toFixed(2)}</p>
                <p className="mt-1 text-sm text-steel">{new Date(request.requested_at).toLocaleString()}</p>
              </div>
              <StatusBadge status={request.status} />
            </article>
          ))}
          {!withdrawals.data?.length && (
            <p className="px-5 py-8 text-sm text-steel">No withdrawal requests yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
