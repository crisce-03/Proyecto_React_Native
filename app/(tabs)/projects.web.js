// =============================================
// app/tabs/projects.web.js (ACTUALIZADO)
// =============================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum.web";
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

export default function Projects() {
  const {
    state,
    createWorkspace,
    createProject,
    createTask,
    updateTask,
    removeTask,
    addComment,
  } = useApp();

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
      _commentsCount: state.comments.filter((c) => c.taskId === task.id).length,
    };
    setViewTask(withCount);
    setViewOpen(true);
  };

  // workspace / project activos
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // ref para estado más nuevo
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // bootstrap mínimo
  useEffect(() => {
    if (!state.workspaces.length) {
      const ws = createWorkspace("Team Space");
      setActiveWsId(ws?.id);
      return;
    }
    const ws0 = state.workspaces[0];
    const hasProject = state.projects.some((p) => p.workspaceId === ws0.id);
    if (!hasProject) {
      const pr = createProject(ws0.id, "Proyecto 1");
      setActiveWsId(ws0.id);
      setActiveProjectId(pr?.id);
    }
  }, [state.workspaces.length, state.projects.length]);

  useEffect(() => {
    if (!activeWsId && state.workspaces[0]) setActiveWsId(state.workspaces[0].id);
  }, [activeWsId, state.workspaces]);

  const ws =
    state.workspaces.find((w) => w.id === activeWsId) || state.workspaces[0];
  const project =
    state.projects.find((p) => p.id === activeProjectId) ||
    state.projects.find((p) => p.workspaceId === ws?.id);

  useEffect(() => {
    if (!ws) return;
    if (!project || project.workspaceId !== ws.id) {
      const firstP = state.projects.find((p) => p.workspaceId === ws.id);
      setActiveProjectId(firstP?.id || null);
    }
  }, [ws?.id]);

  const members = ws?.members ?? [];
  const tasks = useMemo(() => {
    if (!project) return [];
    let arr = state.tasks
      .filter((t) => t.projectId === project.id)
      .map((t) => ({
        ...t,
        _commentsCount: state.comments.filter((c) => c.taskId === t.id).length,
      }));
    if (q) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        (t) =>
          t.title.toLowerCase().includes(needle) || t.id.includes(q)
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

  const cambiarEstado = (t) => updateTask(t.id, { state: cicloEstado(t.state) });
  const cambiarPrioridad = (t) =>
    updateTask(t.id, { priority: cicloPrioridad(t.priority || "medium") });

  const abrirFecha = (task) => {
    setSelectedTask(task);
    const iso = task?.dueAt || task?.dueDate;
    setDateTemp(iso ? new Date(iso) : new Date());
    setDateModalOpen(true);
  };
  const limpiarFecha = (t) => updateTask(t.id, { dueAt: null, dueDate: null });

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
    updateTask(selectedTaskObj.id, { state: columnId });
    setSelectedId(null);
  };

  // handlers Sidebar
  const handleSelectWorkspace = (id) => setActiveWsId(id);
  const handleSelectProject = (id) => setActiveProjectId(id);

  const handleCreateWorkspace = ({ name }) => {
    const ws = createWorkspace(name);
    setActiveWsId(ws?.id);
  };

  const handleCreateProject = ({ name }) => {
    if (!ws) return;
    const pr = createProject(ws.id, name);
    setActiveProjectId(pr?.id);
  };

  // CREAR TAREA desde modal
  const handleCreateTask = (payload) => {
    if (!project) {
      setCreateOpen(false);
      return;
    }

    const maybeId = createTask(project.id, payload.title);

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
      updateTask(maybeId, patch);
      setCreateOpen(false);
      return;
    }

    const prevIds = new Set(stateRef.current.tasks.map((t) => t.id));
    let tries = 0;
    const MAX_TRIES = 20;

    const findAndPatch = () => {
      const s = stateRef.current;
      const createdNow = s.tasks.filter(
        (t) => t.projectId === project.id && !prevIds.has(t.id)
      );
      const candidate =
        createdNow[0] ||
        s.tasks
          .filter(
            (t) =>
              t.projectId === project.id && (t.title || "") === payload.title
          )
          .slice(-1)[0];

      if (candidate) {
        updateTask(candidate.id, patch);
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

  return (
    <div className="h-screen bg-white flex">
      <Sidebar
        workspaces={state.workspaces}
        projects={state.projects}
        activeWsId={ws?.id}
        activeProjectId={project?.id}
        onSelectWorkspace={handleSelectWorkspace}
        onSelectProject={handleSelectProject}
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
                  modo === m
                    ? "bg-black text-white"
                    : "bg-gray-200 text-black"
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
          </div>
          <SearchBar value={q} onChange={setQ} />
        </div>

        {modo === "list" ? (
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
                  onClick={() => removeTask(t.id)}
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
            onAdd={(title) => createTask(project.id, title)}
            onToggle={(t) => cambiarEstado(t)}
            onDelete={(id) => removeTask(id)}
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
              updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() });
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
              ? state.comments.filter((c) => c.taskId === selectedTask.id)
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
          onCreate={handleCreateWorkspace}
        />
        <NewProjectModal
          open={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      </div>
    </div>
  );
}
