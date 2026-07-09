import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../state/AuthContext";

export function LoginPage({ admin = false }: { admin?: boolean }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const role = await login(email, password, admin);
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-ink p-10 text-white lg:grid lg:content-between">
        <Link to="/" className="text-xl font-bold">TaskHub</Link>
        <div>
          <h1 className="max-w-xl text-5xl font-bold tracking-normal">{admin ? "Admin command center" : "Welcome back"}</h1>
          <p className="mt-5 max-w-lg text-slate-300">
            {admin
              ? "Review users, publish tasks, inspect attendance, and approve submissions."
              : "Pick up today's task after your verification has been approved."}
          </p>
        </div>
      </section>
      <section className="grid content-center px-4 py-10 sm:px-8">
        <form className="panel mx-auto w-full max-w-md p-6" onSubmit={submit}>
          <h1 className="text-2xl font-bold text-ink">{admin ? "Admin login" : "User login"}</h1>
          <p className="mt-2 text-sm text-steel">Use your registered email and password.</p>
          {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}
          <label className="mt-5 block text-sm font-semibold text-ink">
            Email
            <input className="input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Password
            <input className="input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn-primary mt-6 w-full" disabled={loading}>
            <LogIn className="h-4 w-4" />
            {loading ? "Signing in..." : "Login"}
          </button>
          {!admin && (
            <div className="mt-4 space-y-2 text-center text-sm text-steel">
              <p>
                New here? <Link className="font-semibold text-sky" to="/register">Create an account</Link>
              </p>
              <p>
                Admin? <Link className="font-semibold text-sky" to="/admin/login">Use admin login</Link>
              </p>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
