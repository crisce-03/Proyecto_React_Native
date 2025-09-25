import React, { useEffect, useState } from "react";

export default function TaskCreateModal({ open, onClose, onSubmit, initial }) {
  const init = initial || {
    title: "",
    assignee: "",
    due: "",
    priority: "medium",
    state: "todo",
  };

  const [title, setTitle] = useState(init.title);
  const [assignee, setAssignee] = useState(init.assignee);
  const [due, setDue] = useState(init.due);
  const [priority, setPriority] = useState(init.priority);
  const [state, setState] = useState(init.state);

  useEffect(() => {
    if (open) {
      setTitle(init.title || "");
      setAssignee(init.assignee || "");
      setDue(init.due || "");
      setPriority(init.priority || "medium");
      setState(init.state || "todo");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  const canSave = title.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200">
        {/* Header */}
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-bold">Nueva tarea</h2>
        </div>

        {/* Formulario */}
        <div className="px-5 py-4 grid grid-cols-1 gap-4">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Nombre</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe el título de la tarea"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Asignado + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Asignado (texto)</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Ej: Ana"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Fecha límite</label>
              <input
                type="date"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Prioridad + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-gray-600">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Estado</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Hecha</option>
                <option value="late">Tardía</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={!canSave}
            onClick={() => {
              const normDue = due ? `${due}T00:00:00` : "";
              onSubmit?.({
                title: title.trim(),
                assignee: assignee.trim(),
                due: normDue,
                priority,
                state,
              });
            }}
            className={`px-4 py-2 rounded-xl text-white font-semibold ${
              canSave
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-emerald-300 cursor-not-allowed"
            }`}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
