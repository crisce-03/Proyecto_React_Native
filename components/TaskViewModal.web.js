import React from "react";

export default function TaskViewModal({ open, onClose, task }) {
  if (!open || !task) return null;

  const stateLabel =
    task.state === "in_progress" ? "En progreso"
    : task.state === "done" ? "Hecha"
    : task.state === "late" ? "Tardía"
    : "Por hacer";

  const priorityLabel =
    (task.priority || "medium") === "low" ? "Baja"
    : (task.priority || "medium") === "medium" ? "Media"
    : (task.priority || "medium") === "high" ? "Alta"
    : "Urgente";

  const dueRaw = task.dueAt || task.dueDate || "";
  const dueText = dueRaw
    ? new Date(dueRaw).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" })
    : "—";

  const assignee = task.assignee || task.assignedTo || "—";
  const commentsCount = typeof task._commentsCount === "number" ? task._commentsCount : "—";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b bg-slate-50">
          <h2 className="text-xl font-extrabold text-slate-900">{task.title}</h2>
          <p className="text-xs text-slate-500 mt-1">ID: {task.id}</p>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estado"><Badge kind="outline">{stateLabel.toUpperCase()}</Badge></Field>
          <Field label="Prioridad"><Tag tone={(task.priority || "medium")}>{priorityLabel.toUpperCase()}</Tag></Field>
          <Field label="Asignado"><span className="text-slate-800 font-medium">{assignee}</span></Field>
          <Field label="Fecha límite"><span className="text-slate-800 font-medium">{dueText}</span></Field>
          <Field label="Comentarios"><span className="text-slate-800 font-medium">{commentsCount}</span></Field>
        </div>

        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      {children}
    </div>
  );
}
function Badge({ children, kind = "solid" }) {
  return (
    <span className={kind === "outline"
      ? "inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
      : "inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"}>
      {children}
    </span>
  );
}
function Tag({ children, tone = "medium" }) {
  const bg = tone === "low" ? "bg-slate-100 text-slate-900 border-slate-200"
    : tone === "medium" ? "bg-amber-100 text-amber-800 border-amber-200"
    : tone === "high" ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-rose-100 text-rose-800 border-rose-200";
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${bg}`}>{children}</span>;
}
