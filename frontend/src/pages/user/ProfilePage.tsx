import { FormEvent, useState } from "react";
import { Save } from "lucide-react";

import { api } from "../../lib/api";
import { useAuth } from "../../state/AuthContext";
import type { UserProfile } from "../../types";

export function ProfilePage() {
  const { profile, refresh } = useAuth();
  const user = profile as UserProfile;
  const [form, setForm] = useState({ name: user.name, phone: user.phone, password: "" });
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    try {
      await api("/profile", { method: "PUT", body: JSON.stringify(form) });
      await refresh();
      setMessage("Profile updated");
    } catch (exc) {
      setMessage(exc instanceof Error ? exc.message : "Update failed");
    }
  };

  return (
    <form className="panel max-w-2xl p-6" onSubmit={submit}>
      <h2 className="text-2xl font-bold text-ink">Profile</h2>
      <p className="mt-2 text-sm text-steel">{user.email}</p>
      {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{message}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-ink">
          Name
          <input className="input mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Phone
          <input className="input mt-2" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </label>
        <label className="block text-sm font-semibold text-ink sm:col-span-2">
          New password
          <input className="input mt-2" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Leave blank to keep current password" />
        </label>
      </div>
      <button className="btn-primary mt-6">
        <Save className="h-4 w-4" />
        Save profile
      </button>
    </form>
  );
}

