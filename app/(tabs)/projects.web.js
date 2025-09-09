// app/tabs/projects.js
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum";
import TaskCard from "../../components/TaskCard";
import TaskTable from "../../components/TaskTable";
import DueDateModal from "../../components/DueDateModal";
import CommentsModal from "../../components/CommentsModal";
import "../../global.css";

export default function Projects() {
  const {
    state,
    createWorkspace,
    createProject,
    createTask,
    updateTask,
    removeTask,
    addComment, // si no existe en tu store, ignora o ajusta la llamada de submitComment
  } = useApp();

  const [modo, setModo] = useState("table"); // "table" | "kanban" | "list"
  const [q, setQ] = useState("");

  // Modal de fecha
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  // Modal de comentarios
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

  const crearRapida = (titulo = "Nueva tarea") => {
    if (!project) return;
    createTask(project.id, titulo);
  };

  // Estado y prioridad
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

  // Due date
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

  // Comentarios
  const abrirComentarios = (task) => { setSelectedTask(task); setCommentsOpen(true); };
  const cerrarComentarios = () => { setSelectedTask(null); setCommentsOpen(false); };
  const enviarComentario = (texto) => {
    if (addComment) {
      addComment(selectedTask.id, texto);
    } else {
      console.warn("Implementa addComment(taskId, text) en tu store.");
    }
  };
  const comentariosSeleccionada = selectedTask
    ? state.comments.filter((c) => c.taskId === selectedTask.id)
    : [];

  return (
    <View className="flex-1 bg-white p-5">
      <Text className="text-2xl font-bold mb-4">
        Proyecto · {project?.name ?? "…"}
      </Text>

      {/* Modo de vista + Crear rápida (ligeramente más grande) */}
      <View className="flex-row gap-3 mb-3">
        {["table", "kanban", "list"].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setModo(m)}
            className={`px-4 py-3 rounded-2xl ${modo === m ? "bg-black" : "bg-gray-200"}`}
          >
            <Text className={`${modo === m ? "text-white" : "text-black"} text-base`}>
              {m === "table" ? "Tabla" : m === "kanban" ? "Tablero" : "Lista"}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => crearRapida()}
          disabled={!project}
          className={`px-4 py-3 rounded-2xl ${project ? "bg-emerald-600" : "bg-emerald-300"}`}
        >
          <Text className="text-white text-base">+ Tarea</Text>
        </TouchableOpacity>
      </View>

      {/* Búsqueda */}
      <SearchBar value={q} onChange={setQ} />

      {/* Contenido */}
      {!project ? (
        <View className="flex-1 items-center justify-center">
          <Text className="opacity-60 text-base">Creando proyecto inicial…</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="opacity-60 text-base">Sin tareas. Agrega una en “+ Tarea”.</Text>
        </View>
      ) : modo === "table" ? (
        <TaskTable
          tasks={tasks}
          members={members}
          onAdd={(title) => crearRapida(title)}
          onOpen={(t) => { /* abrir detalle opcional */ }}
          onToggle={(t) => cambiarEstado(t)}            // estado
          onDelete={(id) => removeTask(id)}
          onSetDueDate={(t) => abrirFecha(t)}           // calendario
          onClearDueDate={(t) => limpiarFecha(t)}       // limpiar fecha
          onTogglePriority={(t) => cambiarPrioridad(t)} // prioridad
          onOpenComments={(t) => abrirComentarios(t)}   // 💬
          // <<< NUEVO: pide a la tabla que agrupe por estado y use etiquetas en español
          groupByState
          locale="es"
        />
      ) : modo === "list" ? (
        <ScrollView>
          {tasks.map((t) => (
            <View key={t.id} className="flex-row items-center gap-3">
              <TaskCard task={t} onPress={() => { /* abrir detalle opcional */ }} />
              <TouchableOpacity onPress={() => abrirFecha(t)} className="px-3 py-2 rounded-xl bg-gray-800">
                <Text className="text-white text-base">📅 Fecha</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => abrirComentarios(t)} className="px-3 py-2 rounded-xl bg-gray-200">
                <Text className="text-base">💬</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeTask(t.id)} className="px-3 py-2 rounded-xl bg-red-500">
                <Text className="text-white text-base">Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Tablero (sigue igual) */}
          <KanbanColumn
            title="Por hacer"
            tasks={tasks.filter((t) => t.state === "todo")}
            onOpen={(t) => updateTask(t.id, { state: "in_progress" })}
            onSetDueDate={(t) => abrirFecha(t)}
          />
          <KanbanColumn
            title="En progreso"
            tasks={tasks.filter((t) => t.state === "in_progress")}
            onOpen={(t) => updateTask(t.id, { state: "done" })}
            onSetDueDate={(t) => abrirFecha(t)}
          />
          <KanbanColumn
            title="Hechas"
            tasks={tasks.filter((t) => t.state === "done")}
            onOpen={(t) => updateTask(t.id, { state: "late" })}
            onSetDueDate={(t) => abrirFecha(t)}
          />
          <KanbanColumn
            title="Tardías"
            tasks={tasks.filter((t) => t.state === "late")}
            onOpen={(t) => updateTask(t.id, { state: "todo" })}
            onSetDueDate={(t) => abrirFecha(t)}
          />
        </ScrollView>
      )}

      {/* Modal: fecha */}
      <DueDateModal
        open={dateModalOpen}
        taskTitle={selectedTask?.title}
        value={dateTemp}
        onChange={setDateTemp}
        onCancel={cerrarFecha}
        onSave={guardarFecha}
      />

      {/* Modal: comentarios */}
      <CommentsModal
        open={commentsOpen}
        taskTitle={selectedTask?.title}
        comments={comentariosSeleccionada}
        onClose={cerrarComentarios}
        onSubmit={enviarComentario}
      />
    </View>
  );
}
