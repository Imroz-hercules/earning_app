import { ArrowRight, CheckCircle2, Clock3, FileCheck2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: FileCheck2, title: "Document verification", body: "Members upload ID and selfie proof before the workspace unlocks." },
  { icon: Clock3, title: "Timed attendance", body: "Check-in and checkout rules protect the required task duration." },
  { icon: ShieldCheck, title: "Admin approval", body: "Admins review users, tasks, attendance, and submissions from one place." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-ink text-sm font-bold text-white">TH</span>
            <span className="text-lg font-bold text-ink">TaskHub</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link className="btn-secondary" to="/login">
              Login
            </Link>
            <Link className="btn-primary" to="/register">
              Register
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <img
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80"
            alt="Team planning tasks on a glass board"
          />
          <div className="relative mx-auto grid min-h-[72vh] max-w-7xl content-center gap-8 px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
                Verification, tasks, attendance, rewards
              </p>
              <h1 className="text-4xl font-bold tracking-normal sm:text-6xl">TaskHub</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                A production-ready MVP for onboarding verified users, assigning one daily task, tracking required work time,
                and reviewing completion from an admin console.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className="btn bg-white text-ink hover:bg-slate-100" to="/register">
                  Start as user <ArrowRight className="h-4 w-4" />
                </Link>
                <Link className="btn border border-white/30 bg-white/10 text-white hover:bg-white/20" to="/admin/login">
                  Admin login
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="panel p-6">
              <Icon className="h-7 w-7 text-sky" />
              <h2 className="mt-4 text-lg font-bold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-steel">{body}</p>
            </article>
          ))}
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-ink">How it works</h2>
            <div className="mt-6 grid gap-3 md:grid-cols-4">
              {["Register", "Upload documents", "Admin approves", "Check in and complete task"].map((step) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-mint" />
                  <span className="text-sm font-semibold text-ink">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

