import { FormEvent, useState } from "react";
import { Building2, Save } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { StatusBadge } from "../../components/StatusBadge";
import { api } from "../../lib/api";
import type { UserProfile } from "../../types";

const emptyBankForm = {
  account_holder_name: "",
  bank_name: "",
  bank_account_number: "",
  ifsc_code: "",
};

export function BankDetailsPage() {
  const [form, setForm] = useState(emptyBankForm);
  const [message, setMessage] = useState("");

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

  const saved = Boolean(
    profile.data?.account_holder_name &&
      profile.data?.bank_name &&
      profile.data?.bank_account_number &&
      profile.data?.ifsc_code,
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
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
    </div>
  );
}

