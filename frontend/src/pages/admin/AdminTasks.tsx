import { FormEvent, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "../../lib/api";
import type { Task } from "../../types";

const emptyForm = {
  title: "",
  description: "",
  instructions: "",
  reward: "0",
  required_minutes: "60",
  is_active: true,
};

export function AdminTasks() {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const query = useQuery<Task[]>({ queryKey: ["admin-tasks"], queryFn: () => api("/admin/tasks") });

  const create = useMutation({
    mutationFn: () =>
      api("/admin/create-task", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          reward: Number(form.reward),
          required_minutes: Number(form.required_minutes),
        }),
      }),
    onSuccess: async () => {
      setForm(emptyForm);
      setMessage("Task created");
      await query.refetch();
    },
    onError: (exc) => setMessage(exc instanceof Error ? exc.message : "Could not create task"),
  });

  const publish = useMutation({
    mutationFn: (taskId: string) => api(`/admin/task/${taskId}/publish`, { method: "POST" }),
    onSuccess: () => query.refetch(),
  });

  const remove = useMutation({
    mutationFn: (taskId: string) => api(`/admin/task/${taskId}`, { method: "DELETE" }),
    onSuccess: () => query.refetch(),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form className="panel p-6" onSubmit={submit}>
        <h2 className="text-xl font-bold text-ink">Create daily task</h2>
        {message && <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-steel">{message}</p>}
        <div className="mt-5 space-y-4">
          <input className="input" placeholder="Task title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <textarea className="input min-h-28" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <textarea className="input min-h-24" placeholder="Instructions" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" type="number" min="0" step="0.01" placeholder="Reward" value={form.reward} onChange={(event) => setForm({ ...form, reward: event.target.value })} />
            <input className="input" type="number" min="1" placeholder="Required minutes" value={form.required_minutes} onChange={(event) => setForm({ ...form, required_minutes: event.target.value })} />
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-ink">
            <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
            Publish immediately
          </label>
          <button className="btn-primary" disabled={create.isPending}>
            <Plus className="h-4 w-4" />
            Create task
          </button>
        </div>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-xl font-bold text-ink">Tasks</h2>
        </div>
        <div className="divide-y divide-slate-200">
          {query.data?.map((task) => (
            <article key={task.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{task.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-steel">{task.description}</p>
                  <p className="mt-2 text-sm font-semibold text-steel">₹{task.reward} · {task.required_minutes} minutes</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary min-h-9 px-3" disabled={task.is_active} onClick={() => publish.mutate(task.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                    {task.is_active ? "Active" : "Publish"}
                  </button>
                  <button className="btn-danger min-h-9 px-3" onClick={() => remove.mutate(task.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!query.data?.length && <p className="px-5 py-8 text-sm text-steel">No tasks created yet.</p>}
        </div>
      </section>
    </div>
  );
}

