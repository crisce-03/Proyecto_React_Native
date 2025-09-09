// app/tabs/projects.js
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
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
  const [refreshing, setRefreshing] = useState(false);

  // Modal de fecha
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  // Modal de comentarios
  const [commentsOpen, setCommentsOpen] = useState(false);

  const { width } = useWindowDimensions();
  const isCompact = width < 720; // afinado para móvil

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
  const allTasks = useMemo(() => {
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

  // Contadores por estado (para las pestañas)
  const counts = useMemo(() => {
    const base = { todo: 0, in_progress: 0, done: 0, late: 0, total: 0 };
    for (const t of allTasks) {
      base.total += 1;
      if (base[t.state] !== undefined) base[t.state] += 1;
    }
    return base;
  }, [allTasks]);

  const crearRapida = (titulo = "Nueva tarea") => {
    if (!project) return;
    createTask(project.id, titulo);
  };

  // Estado y prioridad
  const cicloEstado = (s) =>
    s === "todo"
      ? "in_progress"
      : s === "in_progress"
      ? "done"
      : s === "done"
      ? "late"
      : "todo";

  const cicloPrioridad = (p) =>
    p === "low" ? "medium" : p === "medium" ? "high" : p === "high" ? "urgent" : "low";

  const cambiarEstado = (t) => updateTask(t.id, { state: cicloEstado(t.state) });
  const cambiarPrioridad = (t) => updateTask(t.id, { priority: cicloPrioridad(t.priority || "medium") });

  // Due date
  const abrirFecha = (task) => {
    setSelectedTask(task);
    const iso = task?.dueAt || task?.dueDate;
    setDateTemp(iso ? new Date(iso) : new Date());
    setDateModalOpen(true);
  };
  const cerrarFecha = () => {
    setSelectedTask(null);
    setDateModalOpen(false);
  };
  const guardarFecha = () => {
    if (selectedTask) updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() });
    cerrarFecha();
  };
  const limpiarFecha = (t) => updateTask(t.id, { dueAt: null, dueDate: null });

  // Comentarios
  const abrirComentarios = (task) => {
    setSelectedTask(task);
    setCommentsOpen(true);
  };
  const cerrarComentarios = () => {
    setSelectedTask(null);
    setCommentsOpen(false);
  };
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

  // Pull-to-refresh (si tienes una acción de recarga real, reemplázala aquí)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // simula breve refresco de UI/estado
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Botón de modo (segmented) con contadores y mejor touch target
  const ModeButton = ({ id, label, badge }) => (
    <TouchableOpacity
      onPress={() => setModo(id)}
      className={`px-4 py-2.5 rounded-2xl border ${
        modo === id ? "bg-black border-black" : "bg-white border-gray-300"
      } shadow-sm`}
      activeOpacity={0.9}
    >
      <View className="flex-row items-center gap-2">
        <Text className={`${modo === id ? "text-white" : "text-black"} text-base`}>
          {label}
        </Text>
        {typeof badge === "number" && (
          <View
            className={`px-2 py-0.5 rounded-full ${
              modo === id ? "bg-white/15" : "bg-gray-100"
            }`}
          >
            <Text className={`${modo === id ? "text-white" : "text-gray-700"} text-xs`}>
              {badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Contenido principal (se usa RefreshControl en cada modo)
  const renderTabla = () => (
    <TaskTable
      tasks={allTasks}
      members={members}
      onAdd={(title) => crearRapida(title)}
      onOpen={(t) => {
        // abrir detalle opcional
      }}
      onToggle={(t) => cambiarEstado(t)} // estado
      onDelete={(id) => removeTask(id)}
      onSetDueDate={(t) => abrirFecha(t)} // calendario
      onClearDueDate={(t) => limpiarFecha(t)} // limpiar fecha
      onTogglePriority={(t) => cambiarPrioridad(t)} // prioridad
      onOpenComments={(t) => abrirComentarios(t)} // 💬
      groupByState
    />
  );

  const renderLista = () => (
    <View>
      {allTasks.map((t) => (
        <View key={t.id} className="flex-row items-center gap-3 mb-2">
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
    </View>
  );

  const renderKanban = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // hace un scroll más “snap” en móvil
      snapToAlignment="start"
      decelerationRate="fast"
      contentContainerStyle={{ paddingRight: 8 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <KanbanColumn
        title={`Por hacer (${counts.todo})`}
        tasks={allTasks.filter((t) => t.state === "todo")}
        onOpen={(t) => updateTask(t.id, { state: "in_progress" })}
        onSetDueDate={(t) => abrirFecha(t)}
      />
      <KanbanColumn
        title={`En progreso (${counts.in_progress})`}
        tasks={allTasks.filter((t) => t.state === "in_progress")}
        onOpen={(t) => updateTask(t.id, { state: "done" })}
        onSetDueDate={(t) => abrirFecha(t)}
      />
      <KanbanColumn
        title={`Hechas (${counts.done})`}
        tasks={allTasks.filter((t) => t.state === "done")}
        onOpen={(t) => updateTask(t.id, { state: "late" })}
        onSetDueDate={(t) => abrirFecha(t)}
      />
      <KanbanColumn
        title={`Tardías (${counts.late})`}
        tasks={allTasks.filter((t) => t.state === "late")}
        onOpen={(t) => updateTask(t.id, { state: "todo" })}
        onSetDueDate={(t) => abrirFecha(t)}
      />
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle={Platform.OS === "ios" ? "dark-content" : "dark-content"} backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <View className="flex-1 p-4">
          {/* Título */}
          <Text className="text-xl font-bold mb-3">
            Proyecto · {project?.name ?? "…"}
          </Text>

          {/* Tabs responsivas con contadores */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            <ModeButton id="table" label="Tabla" badge={counts.total} />
            <ModeButton id="kanban" label="Tablero" badge={counts.in_progress + counts.todo + counts.late} />
            <ModeButton id="list" label="Lista" badge={counts.total} />
          </View>

          {/* Búsqueda */}
          <View className="mb-2">
            <SearchBar value={q} onChange={setQ} />
          </View>

          {/* Contenido con pull-to-refresh */}
          {!project ? (
            <View className="flex-1 items-center justify-center">
              <Text className="opacity-60 text-base">Creando proyecto inicial…</Text>
            </View>
          ) : allTasks.length === 0 ? (
            <ScrollView
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              contentContainerStyle={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Text className="opacity-60 text-base">Sin tareas. Agrega una con “+”.</Text>
            </ScrollView>
          ) : modo === "table" ? (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              {renderTabla()}
            </ScrollView>
          ) : modo === "list" ? (
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
              {renderLista()}
            </ScrollView>
          ) : (
            renderKanban()
          )}

          {/* FAB: + Tarea (mejor reachability en móvil) */}
          {project && (
            <TouchableOpacity
              onPress={() => crearRapida()}
              activeOpacity={0.9}
              className="absolute right-4 bottom-4 bg-emerald-600 rounded-full shadow-lg"
              style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                elevation: 5, // Android shadow
              }}
            >
              <Text className="text-white text-base font-semibold">＋ Tarea</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

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
    </SafeAreaView>
  );
}
