// app/tabs/projects.web.js
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum.web";
import TaskCard from "../../components/TaskCard.web";
import TaskTable from "../../components/TaskTable";
import DueDateModal from "../../components/DueDateModal";
import CommentsModal from "../../components/CommentsModal";
import Whiteboard from "../../components/Whiteboard.web"; // ⬅️ NUEVO
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

  // Mantén tu modo inicial como lo tenías (aquí ejemplo: "list")
  const [modo, setModo] = useState("list");
  const [q, setQ] = useState("");

  // selección para mover en tablero
  const [selectedId, setSelectedId] = useState(null);

  // Modal: fecha y comentarios
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    if (!state.workspaces.length) {
      createWorkspace("Team Space");
      return;
    }
    const ws0 = state.workspaces[0];
    const hasProject = state.projects.some((p) => p.workspaceId === ws0.id);
    if (!hasProject) createProject(ws0.id, "Proyecto 1");
  }, [state.workspaces.length, state.projects.length]);

  const ws = state.workspaces[0];
  const project = state.projects.find((p) => p.workspaceId === ws?.id);

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
        (t) => t.title.toLowerCase().includes(needle) || t.id.includes(q)
      );
    }
    return arr;
  }, [state.tasks, state.comments, project?.id, q]);

  const selectedTaskObj = useMemo(
    () => tasks.find((t) => t.id === selectedId),
    [tasks, selectedId]
  );

  const crearRapida = (titulo = "Nueva tarea") => {
    if (!project) return;
    createTask(project.id, titulo);
  };

  const cicloEstado = (s) =>
    s === "todo" ? "in_progress" :
    s === "in_progress" ? "done" :
    s === "done" ? "late" : "todo";

  const cicloPrioridad = (p) =>
    p === "low" ? "medium" :
    p === "medium" ? "high" :
    p === "high" ? "urgent" : "low";

  const cambiarEstado = (t) => updateTask(t.id, { state: cicloEstado(t.state) });
  const cambiarPrioridad = (t) =>
    updateTask(t.id, { priority: cicloPrioridad(t.priority || "medium") });

  const abrirFecha = (task) => {
    setSelectedTask(task);
    const iso = task?.dueAt || task?.dueDate;
    setDateTemp(iso ? new Date(iso) : new Date());
    setDateModalOpen(true);
  };
  const cerrarFecha = () => { setSelectedTask(null); setDateModalOpen(false); };
  const guardarFecha = () => {
    if (selectedTask) updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() });
    cerrarFecha();
  };
  const limpiarFecha = (t) => updateTask(t.id, { dueAt: null, dueDate: null });

  const abrirComentarios = (task) => { setSelectedTask(task); setCommentsOpen(true); };
  const cerrarComentarios = () => { setSelectedTask(null); setCommentsOpen(false); };
  const enviarComentario = (texto) => { if (addComment) addComment(selectedTask.id, texto); };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const moveSelectedTo = (columnId) => {
    if (!selectedTaskObj || selectedTaskObj.state === columnId) return;
    updateTask(selectedTaskObj.id, { state: columnId });
    setSelectedId(null);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="p-5 pb-3">
        <h1 className="text-2xl font-bold mb-3">
          Proyecto · {project?.name ?? "…"}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          {["table", "kanban", "list", "whiteboard"].map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`px-4 py-3 rounded-2xl ${modo === m ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              {m === "table" ? "Tabla" :
               m === "kanban" ? "Tablero" :
               m === "list" ? "Lista" : "Whiteboard"}
            </button>
          ))}
          <button
            onClick={() => crearRapida()}
            disabled={!project}
            className={`px-4 py-3 rounded-2xl text-white ${project ? "bg-emerald-600" : "bg-emerald-300"}`}
          >
            + Tarea
          </button>
        </div>

        <SearchBar value={q} onChange={setQ} />
      </div>

      {selectedId && (
        <div className="mx-5 -mt-2 mb-2 sticky top-0 z-10 p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm">
          Tarea seleccionada: <b>{selectedId}</b> · Presiona <kbd>Esc</kbd> para cancelar
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {!project ? (
          <div className="opacity-60">Creando proyecto inicial…</div>
        ) : tasks.length === 0 ? (
          <div className="opacity-60">Sin tareas. Agrega una en “+ Tarea”.</div>
        ) : modo === "table" ? (
          <TaskTable
            tasks={tasks}
            members={members}
            onAdd={(title) => crearRapida(title)}
            onOpen={() => {}}
            onToggle={(t) => cambiarEstado(t)}
            onDelete={(id) => removeTask(id)}
            onSetDueDate={(t) => abrirFecha(t)}
            onClearDueDate={(t) => limpiarFecha(t)}
            onTogglePriority={(t) => cambiarPrioridad(t)}
            onOpenComments={(t) => abrirComentarios(t)}
            groupByState
            locale="es"
          />
        ) : modo === "list" ? (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <TaskCard task={t} onPress={() => {}} />
                <button onClick={() => abrirFecha(t)} className="px-3 py-2 rounded-xl bg-gray-800 text-white">📅 Fecha</button>
                <button onClick={() => abrirComentarios(t)} className="px-3 py-2 rounded-xl bg-gray-200">💬</button>
                <button onClick={() => removeTask(t.id)} className="px-3 py-2 rounded-xl bg-red-500 text-white">Eliminar</button>
              </div>
            ))}
          </div>
        ) : modo === "kanban" ? (
          <div className="overflow-x-auto">
            <div className="flex gap-3 min-w-max">
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
        ) : (
          // Whiteboard (web)
          <Whiteboard />
        )}
      </div>

      <DueDateModal
        open={dateModalOpen}
        taskTitle={selectedTask?.title}
        value={dateTemp}
        onChange={setDateTemp}
        onCancel={() => { setSelectedTask(null); setDateModalOpen(false); }}
        onSave={() => {
          if (selectedTask) updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() });
          setSelectedTask(null);
          setDateModalOpen(false);
        }}
      />
      <CommentsModal
        open={commentsOpen}
        taskTitle={selectedTask?.title}
        comments={selectedTask ? state.comments.filter((c) => c.taskId === selectedTask.id) : []}
        onClose={() => { setSelectedTask(null); setCommentsOpen(false); }}
        onSubmit={(txt) => addComment && selectedTask && addComment(selectedTask.id, txt)}
      />
    </div>
  );
}
