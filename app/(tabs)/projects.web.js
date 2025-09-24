// =============================================
// app/tabs/projects.web.js (ACTUALIZADO PARA USAR LOS COMPONENTES)
// =============================================
import { useEffect, useMemo, useState } from "react";
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

  // workspace / project activos
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // bootstrap mínimo
  useEffect(() => {
    if (!state.workspaces.length) {
      const ws = createWorkspace("Team Space");
      setActiveWsId(ws?.id);
      return;
    }
    // si no hay projectos para el primer workspace, crear uno
    const ws0 = state.workspaces[0];
    const hasProject = state.projects.some((p) => p.workspaceId === ws0.id);
    if (!hasProject) {
      const pr = createProject(ws0.id, "Proyecto 1");
      setActiveWsId(ws0.id);
      setActiveProjectId(pr?.id);
    }
  }, [state.workspaces.length, state.projects.length]);

  // si aún no se ha elegido, tomar el primero disponible
  useEffect(() => {
    if (!activeWsId && state.workspaces[0]) setActiveWsId(state.workspaces[0].id);
  }, [activeWsId, state.workspaces]);

  const ws = state.workspaces.find((w) => w.id === activeWsId) || state.workspaces[0];
  const project = state.projects.find((p) => p.id === activeProjectId) ||
                  state.projects.find((p) => p.workspaceId === ws?.id);

  // si cambia workspace y el proyecto activo no pertenece, seleccionar uno del nuevo workspace
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
      arr = arr.filter((t) => t.title.toLowerCase().includes(needle) || t.id.includes(q));
    }
    return arr;
  }, [state.tasks, state.comments, project?.id, q]);

  const selectedTaskObj = useMemo(() => tasks.find((t) => t.id === selectedId), [tasks, selectedId]);

  const crearRapida = (titulo = "Nueva tarea") => { if (!project) return; createTask(project.id, titulo); };

  const cicloEstado = (s) => (s === "todo" ? "in_progress" : s === "in_progress" ? "done" : s === "done" ? "late" : "todo");
  const cicloPrioridad = (p) => (p === "low" ? "medium" : p === "medium" ? "high" : p === "high" ? "urgent" : "low");

  const cambiarEstado = (t) => updateTask(t.id, { state: cicloEstado(t.state) });
  const cambiarPrioridad = (t) => updateTask(t.id, { priority: cicloPrioridad(t.priority || "medium") });

  const abrirFecha = (task) => { setSelectedTask(task); const iso = task?.dueAt || task?.dueDate; setDateTemp(iso ? new Date(iso) : new Date()); setDateModalOpen(true); };
  const limpiarFecha = (t) => updateTask(t.id, { dueAt: null, dueDate: null });

  const abrirComentarios = (task) => { setSelectedTask(task); setCommentsOpen(true); };

  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") setSelectedId(null); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

  const moveSelectedTo = (columnId) => { if (!selectedTaskObj || selectedTaskObj.state === columnId) return; updateTask(selectedTaskObj.id, { state: columnId }); setSelectedId(null); };

  // handlers Sidebar
  const handleSelectWorkspace = (id) => setActiveWsId(id);
  const handleSelectProject = (id) => setActiveProjectId(id);

  const handleCreateWorkspace = ({ name, description, members }) => {
    const ws = createWorkspace(name);
    // si tu store soporta guardarlos, aquí podrías llamar otro updateWorkspace(ws.id, { description, members })
    setActiveWsId(ws?.id);
  };

  const handleCreateProject = ({ name /*, description*/ }) => {
    if (!ws) return;
    const pr = createProject(ws.id, name);
    setActiveProjectId(pr?.id);
  };

  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
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

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col">
        <div className="p-5 pb-3">
          <h1 className="text-2xl font-bold mb-3">{ws ? `Grupo · ${ws.name}` : "Grupo"} {project ? `· Proyecto · ${project.name}` : ""}</h1>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {["table", "kanban", "list", "whiteboard"].map((m) => (
              <button key={m} onClick={() => setModo(m)} className={`px-4 py-3 rounded-2xl ${modo === m ? "bg-black text-white" : "bg-gray-200 text-black"}`}>
                {m === "table" ? "Tabla" : m === "kanban" ? "Tablero" : m === "list" ? "Lista" : "Whiteboard"}
              </button>
            ))}
            <button onClick={() => crearRapida()} disabled={!project} className={`px-4 py-3 rounded-2xl text-white ${project ? "bg-emerald-600" : "bg-emerald-300"}`}>+ Tarea</button>
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
            <div className="opacity-60">Selecciona o crea un proyecto.</div>
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
                <KanbanColumn columnId="todo" title="Por hacer" tasks={tasks.filter((t) => t.state === "todo")} selectedId={selectedId} selectedTaskState={selectedTaskObj?.state} onSelectTask={(t) => setSelectedId(t.id)} onDropSelected={moveSelectedTo} />
                <KanbanColumn columnId="in_progress" title="En progreso" tasks={tasks.filter((t) => t.state === "in_progress")} selectedId={selectedId} selectedTaskState={selectedTaskObj?.state} onSelectTask={(t) => setSelectedId(t.id)} onDropSelected={moveSelectedTo} />
                <KanbanColumn columnId="done" title="Hechas" tasks={tasks.filter((t) => t.state === "done")} selectedId={selectedId} selectedTaskState={selectedTaskObj?.state} onSelectTask={(t) => setSelectedId(t.id)} onDropSelected={moveSelectedTo} />
                <KanbanColumn columnId="late" title="Tardías" tasks={tasks.filter((t) => t.state === "late")} selectedId={selectedId} selectedTaskState={selectedTaskObj?.state} onSelectTask={(t) => setSelectedId(t.id)} onDropSelected={moveSelectedTo} />
              </div>
            </div>
          ) : (
            <Whiteboard />
          )}
        </div>

        {/* Modales de tarea */}
        <DueDateModal open={dateModalOpen} taskTitle={selectedTask?.title} value={dateTemp} onChange={setDateTemp} onCancel={() => { setSelectedTask(null); setDateModalOpen(false); }} onSave={() => { if (selectedTask) updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() }); setSelectedTask(null); setDateModalOpen(false); }} />
        <CommentsModal open={commentsOpen} taskTitle={selectedTask?.title} comments={selectedTask ? state.comments.filter((c) => c.taskId === selectedTask.id) : []} onClose={() => { setSelectedTask(null); setCommentsOpen(false); }} onSubmit={(txt) => addComment && selectedTask && addComment(selectedTask.id, txt)} />
      </div>

      {/* Modales de creación */}
      <NewWorkspaceModal open={wsModalOpen} onClose={() => setWsModalOpen(false)} onCreate={handleCreateWorkspace} />
      <NewProjectModal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} onCreate={handleCreateProject} />
    </div>
  );
}
