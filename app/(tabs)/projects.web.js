// =============================================
// app/tabs/projects.web.js (ACTUALIZADO + ErrorBoundary + guards)
// =============================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum.web"; // ojo: nombre del archivo correcto
import TaskCard from "../../components/TaskCard.web";
import TaskTable from "../../components/TaskTable";
import DueDateModal from "../../components/DueDateModal";
import CommentsModal from "../../components/CommentsModal";
import Whiteboard from "../../components/Whiteboard.web";
import Sidebar from "../../components/Sidebar.web";
import NewWorkspaceModal from "../../components/NewWorkspaceModal.web";
import NewProjectModal from "../../components/NewProjectModal.web";
import TaskCreateModal from "../../components/TaskCreateModal";
import TaskViewModal from "../../components/TaskViewModal.web";
import "../../global.css";

// Helpers para recordatorios por email (EmailJS en frontend)
import {
  scheduleAllReminders,
  cancelReminderForTask,
} from "../../lib/reminders";

/** Muestra errores de runtime en pantalla para evitar páginas en blanco */
function ErrorBoundary({ children }) {
  const [err, setErr] = React.useState(null);
  React.useEffect(() => {
    const handler = (e) => setErr(e?.error || e);
    const rej = (e) => setErr(e?.reason || e);
    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", rej);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", rej);
    };
  }, []);
  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
        <h2 style={{ color: "#b91c1c", marginBottom: 12 }}>💥 Error en runtime</h2>
        <pre
          style={{
            background: "#111827",
            color: "#e5e7eb",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            maxHeight: "60vh",
          }}
        >
{String(err && (err.stack || err.message || err))}
        </pre>
        <p style={{ marginTop: 8, color: "#374151" }}>
          Abre la consola del navegador (F12) para más detalles.
        </p>
      </div>
    );
  }
  return children;
}

export default function AppProvider() {
  // --- App state con fallback seguro ---
  const {
    state: _state,
    createWorkspace,
    createProject,
    createTask,
    updateTask,
    removeTask,
    addComment,
  } = useApp();

  const state =
    _state ?? { workspaces: [], projects: [], tasks: [], comments: [] };

  const [modo, setModo] = useState("list");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // modales
  const [wsModalOpen, setWsModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // modal de ver tarea
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  const openView = (task) => {
    const withCount = {
      ...task,
      _commentsCount: (state.comments || []).filter((c) => c.taskId === task.id)
        .length,
    };
    setViewTask(withCount);
    setViewOpen(true);
  };

  // workspace / project activos
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // ref para estado más nuevo (para polling/raf)
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // bootstrap mínimo
  useEffect(() => {
    const wss = state.workspaces || [];
    const prs = state.projects || [];

    if (!wss.length) {
      const ws = createWorkspace?.("Team Space");
      if (ws?.id) setActiveWsId(ws.id);
      return;
    }
    const ws0 = wss[0];
    const hasProject = prs.some((p) => p.workspaceId === ws0.id);
    if (!hasProject) {
      const pr = createProject?.(ws0.id, "Proyecto 1");
      setActiveWsId(ws0.id);
      if (pr?.id) setActiveProjectId(pr.id);
    }
  }, [state.workspaces?.length, state.projects?.length, createWorkspace, createProject]);

  useEffect(() => {
    if (!activeWsId && (state.workspaces || [])[0]) {
      setActiveWsId(state.workspaces[0].id);
    }
  }, [activeWsId, state.workspaces]);

  const ws =
    (state.workspaces && state.workspaces.find((w) => w.id === activeWsId)) ||
    state.workspaces?.[0] ||
    null;

  const project =
    (state.projects && state.projects.find((p) => p.id === activeProjectId)) ||
    (ws ? state.projects?.find((p) => p.workspaceId === ws.id) : null) ||
    null;

  useEffect(() => {
    if (!ws) return;
    if (!project || project.workspaceId !== ws.id) {
      const firstP = (state.projects || []).find((p) => p.workspaceId === ws.id);
      setActiveProjectId(firstP?.id || null);
    }
  }, [ws?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const members = ws?.members ?? [];
  const tasks = useMemo(() => {
    if (!project) return [];
    const allTasks = state.tasks || [];
    const allComments = state.comments || [];
    let arr = allTasks
      .filter((t) => t.projectId === project.id)
      .map((t) => ({
        ...t,
        _commentsCount: allComments.filter((c) => c.taskId === t.id).length,
      }));
    if (q) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        (t) => (t.title || "").toLowerCase().includes(needle) || (t.id || "").includes(q)
      );
    }
    return arr;
  }, [state.tasks, state.comments, project?.id, q]);

  const selectedTaskObj = useMemo(
    () => tasks.find((t) => t.id === selectedId),
    [tasks, selectedId]
  );

  const cicloEstado = (s) =>
    s === "todo"
      ? "in_progress"
      : s === "in_progress"
      ? "done"
      : s === "done"
      ? "late"
      : "todo";

  const cicloPrioridad = (p) =>
    p === "low"
      ? "medium"
      : p === "medium"
      ? "high"
      : p === "high"
      ? "urgent"
      : "low";

  const cambiarEstado = (t) => updateTask?.(t.id, { state: cicloEstado(t.state) });
  const cambiarPrioridad = (t) =>
    updateTask?.(t.id, { priority: cicloPrioridad(t.priority || "medium") });

  const abrirFecha = (task) => {
    setSelectedTask(task);
    const iso = task?.dueAt || task?.dueDate;
    setDateTemp(iso ? new Date(iso) : new Date());
    setDateModalOpen(true);
  };

  const limpiarFecha = (t) => {
    cancelReminderForTask?.(t.id);
    updateTask?.(t.id, { dueAt: null, dueDate: null });
  };

  const abrirComentarios = (task) => {
    setSelectedTask(task);
    setCommentsOpen(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const moveSelectedTo = (columnId) => {
    if (!selectedTaskObj || selectedTaskObj.state === columnId) return;
    updateTask?.(selectedTaskObj.id, { state: columnId });
    setSelectedId(null);
  };

  // CREAR TAREA desde modal
  const handleCreateTask = (payload) => {
    if (!project) {
      setCreateOpen(false);
      return;
    }

    const maybeId = createTask?.(project.id, payload.title);

    const patch = {
      state: payload.state,
      priority: payload.priority,
    };
    if (payload.due) {
      patch.dueAt = new Date(payload.due).toISOString();
    }
    if (payload.assignee) {
      patch.assignee = payload.assignee;
      patch.assignedTo = payload.assignee;
    }

    if (maybeId) {
      updateTask?.(maybeId, patch);
      setCreateOpen(false);
      return;
    }

    const prevIds = new Set((stateRef.current.tasks || []).map((t) => t.id));
    let tries = 0;
    const MAX_TRIES = 20;

    const findAndPatch = () => {
      const s = stateRef.current || { tasks: [] };
      const createdNow = (s.tasks || []).filter(
        (t) => t.projectId === project.id && !prevIds.has(t.id)
      );
      const candidate =
        createdNow[0] ||
        (s.tasks || [])
          .filter(
            (t) =>
              t.projectId === project.id && (t.title || "") === payload.title
          )
          .slice(-1)[0];

      if (candidate) {
        updateTask?.(candidate.id, patch);
        setCreateOpen(false);
        return;
      }
      if (++tries < MAX_TRIES) {
        requestAnimationFrame(findAndPatch);
      } else {
        setCreateOpen(false);
      }
    };

    requestAnimationFrame(findAndPatch);
  };

  // ================================
  // Email destino y "minutos antes"
  // ================================
  const [userEmail, setUserEmail] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("notify_email") || ""
      : ""
  );
  const [minutesBefore, setMinutesBefore] = useState(() => {
    if (typeof window === "undefined") return 30;
    const v = localStorage.getItem("notify_minutes_before");
    return v ? Number(v) : 30;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("notify_email", userEmail || "");
  }, [userEmail]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = Math.max(1, Math.min(1440, Number(minutesBefore) || 30));
    localStorage.setItem("notify_minutes_before", String(n));
  }, [minutesBefore]);

  // Programa/actualiza recordatorios cuando cambien tareas o el email/minutos
  useEffect(() => {
    if (!project) return;
    const projectName = project?.name || "Proyecto";
    if (!userEmail) return; // no programamos si no hay correo
    scheduleAllReminders?.(
      tasks,
      userEmail,
      Number(minutesBefore) || 30,
      projectName
    );
  }, [tasks, project?.id, userEmail, minutesBefore]);

  // Banner de ayuda si no hay datos iniciales
  const showEmptyHint = !ws || !project;

  return (
    <ErrorBoundary>
      <div className="h-screen bg-white flex">
        <Sidebar
          workspaces={state.workspaces || []}
          projects={state.projects || []}
          activeWsId={ws?.id || null}
          activeProjectId={project?.id || null}
          onSelectWorkspace={setActiveWsId}
          onSelectProject={setActiveProjectId}
          onOpenNewWorkspace={() => setWsModalOpen(true)}
          onOpenNewProject={() => setProjectModalOpen(true)}
        />

        <div className="flex-1 flex flex-col">
          <div className="p-5 pb-3">
            <h1 className="text-2xl font-bold mb-3">
              {ws ? `Grupo · ${ws.name}` : "Grupo"}{" "}
              {project ? `· Proyecto · ${project.name}` : ""}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              {["table", "kanban", "list", "whiteboard"].map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className={`px-4 py-3 rounded-2xl ${
                    modo === m ? "bg-black text-white" : "bg-gray-200 text-black"
                  }`}
                >
                  {m === "table"
                    ? "Tabla"
                    : m === "kanban"
                    ? "Tablero"
                    : m === "list"
                    ? "Lista"
                    : "Whiteboard"}
                </button>
              ))}
              <button
                onClick={() => setCreateOpen(true)}
                disabled={!project}
                className={`px-4 py-3 rounded-2xl text-white ${
                  project ? "bg-emerald-600" : "bg-emerald-300"
                }`}
              >
                + Tarea
              </button>

              {/* Controles de recordatorios por EmailJS */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  className="px-3 py-2 rounded-xl border border-slate-300"
                  placeholder="Correo para avisos"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  style={{ minWidth: 240 }}
                />
                <label className="text-sm text-slate-600">
                  Minutos antes:
                  <input
                    type="number"
                    min={1}
                    max={1440}
                    className="ml-2 px-3 py-2 rounded-xl border border-slate-300 w-24"
                    value={minutesBefore}
                    onChange={(e) => setMinutesBefore(e.target.value)}
                  />
                </label>
              </div>
            </div>

            <SearchBar value={q} onChange={setQ} />
          </div>

          {showEmptyHint ? (
            <div className="px-5 text-slate-600">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <b>Tip:</b> Crea un Workspace y un Proyecto si no aparecen
                (botones en la barra lateral). Luego añade una tarea con fecha
                para probar los recordatorios.
              </div>
            </div>
          ) : modo === "list" ? (
            <div className="space-y-2 px-5">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <TaskCard task={t} onPress={() => {}} />
                  <button
                    onClick={() => openView(t)}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => abrirFecha(t)}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white"
                  >
                    📅 Fecha
                  </button>
                  <button
                    onClick={() => abrirComentarios(t)}
                    className="px-3 py-2 rounded-2xl bg-slate-100 text-slate-700"
                  >
                    💬
                  </button>
                  <button
                    onClick={() => {
                      cancelReminderForTask?.(t.id);
                      removeTask?.(t.id);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500 text-white font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : modo === "kanban" ? (
            <div className="overflow-x-auto">
              <div className="flex gap-3 min-w-max px-5">
                <KanbanColumn
                  columnId="todo"
                  title="Por hacer"
                  tasks={tasks.filter((t) => t.state === "todo")}
                  selectedId={selectedId}
                  selectedTaskState={selectedTaskObj?.state}
                  onSelectTask={(t) => setSelectedId(t.id)}
                  onDropSelected={moveSelectedTo}
                />
                <KanbanColumn
                  columnId="in_progress"
                  title="En progreso"
                  tasks={tasks.filter((t) => t.state === "in_progress")}
                  selectedId={selectedId}
                  selectedTaskState={selectedTaskObj?.state}
                  onSelectTask={(t) => setSelectedId(t.id)}
                  onDropSelected={moveSelectedTo}
                />
                <KanbanColumn
                  columnId="done"
                  title="Hechas"
                  tasks={tasks.filter((t) => t.state === "done")}
                  selectedId={selectedId}
                  selectedTaskState={selectedTaskObj?.state}
                  onSelectTask={(t) => setSelectedId(t.id)}
                  onDropSelected={moveSelectedTo}
                />
                <KanbanColumn
                  columnId="late"
                  title="Tardías"
                  tasks={tasks.filter((t) => t.state === "late")}
                  selectedId={selectedId}
                  selectedTaskState={selectedTaskObj?.state}
                  onSelectTask={(t) => setSelectedId(t.id)}
                  onDropSelected={moveSelectedTo}
                />
              </div>
            </div>
          ) : modo === "table" ? (
            <TaskTable
              tasks={tasks}
              members={members}
              onAdd={(title) => createTask?.(project.id, title)}
              onToggle={(t) => cambiarEstado(t)}
              onDelete={(id) => {
                cancelReminderForTask?.(id);
                removeTask?.(id);
              }}
              onSetDueDate={(t) => abrirFecha(t)}
              onClearDueDate={(t) => limpiarFecha(t)}
              onTogglePriority={(t) => cambiarPrioridad(t)}
              onOpenComments={(t) => abrirComentarios(t)}
              groupByState
              locale="es"
            />
          ) : (
            <Whiteboard />
          )}

          {/* Modales */}
          <DueDateModal
            open={dateModalOpen}
            taskTitle={selectedTask?.title}
            value={dateTemp}
            onChange={setDateTemp}
            onCancel={() => {
              setSelectedTask(null);
              setDateModalOpen(false);
            }}
            onSave={() => {
              if (selectedTask) {
                updateTask?.(selectedTask.id, { dueAt: dateTemp.toISOString() });
              }
              setSelectedTask(null);
              setDateModalOpen(false);
            }}
          />

          <CommentsModal
            open={commentsOpen}
            taskTitle={selectedTask?.title}
            comments={
              selectedTask
                ? (state.comments || []).filter((c) => c.taskId === selectedTask.id)
                : []
            }
            onClose={() => {
              setSelectedTask(null);
              setCommentsOpen(false);
            }}
            onSubmit={(txt) =>
              addComment && selectedTask && addComment(selectedTask.id, txt)
            }
          />

          <TaskCreateModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            onSubmit={handleCreateTask}
          />

          <TaskViewModal
            open={viewOpen}
            onClose={() => setViewOpen(false)}
            task={viewTask}
          />

          <NewWorkspaceModal
            open={wsModalOpen}
            onClose={() => setWsModalOpen(false)}
            onCreate={(_payload) => {
              const ws = createWorkspace?.(_payload?.name || "Nuevo espacio");
              if (ws?.id) setActiveWsId(ws.id);
            }}
          />
          <NewProjectModal
            open={projectModalOpen}
            onClose={() => setProjectModalOpen(false)}
            onCreate={(_payload) => {
              if (!ws) return;
              const pr = createProject?.(ws.id, _payload?.name || "Nuevo proyecto");
              if (pr?.id) setActiveProjectId(pr.id);
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
