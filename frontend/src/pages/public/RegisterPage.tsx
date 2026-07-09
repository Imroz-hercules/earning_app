import { FormEvent, useState } from "react";
import { UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../state/AuthContext";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      navigate("/verification");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen content-center bg-slate-50 px-4 py-10">
      <form className="panel mx-auto w-full max-w-xl p-6" onSubmit={submit}>
        <Link to="/" className="text-lg font-bold text-ink">TaskHub</Link>
        <h1 className="mt-6 text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-steel">After signup, upload your ID and selfie for admin approval.</p>
        {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-ink">
            Full name
            <input className="input mt-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Phone
            <input className="input mt-2" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-ink sm:col-span-2">
            Email
            <input className="input mt-2" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Password
            <input className="input mt-2" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Confirm password
            <input className="input mt-2" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
          </label>
        </div>
        <button className="btn-primary mt-6 w-full" disabled={loading}>
          <UserPlus className="h-4 w-4" />
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="mt-4 text-center text-sm text-steel">
          Already registered? <Link className="font-semibold text-sky" to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
