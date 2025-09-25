import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  StyleSheet,
} from "react-native";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum";
import TaskCard from "../../components/TaskCard";
import TaskTable from "../../components/TaskTable"; // puedes no usarlo; dejamos import por compat
import DueDateModal from "../../components/DueDateModal";
import CommentsModal from "../../components/CommentsModal";
import Sidebar from "../../components/Sidebar";

import TaskCreateModal from "../../components/TaskCreateModal.native"; // ⬅️ NUEVO
import TaskViewModal from "../../components/TaskViewModal.native";     // ⬅️ NUEVO

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

  // Arranca en Lista
  const [modo, setModo] = useState("list");
  const [q, setQ] = useState("");

  // Modales
  const [dateOpen, setDateOpen] = useState(false);
  const [dateTemp, setDateTemp] = useState(new Date());
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // === Selección para tablero (Kanban) ===
  const [selectedId, setSelectedId] = useState(null);
  const [selectedTaskState, setSelectedTaskState] = useState(null);

  // === Sidebar full-screen ===
  const [showSelector, setShowSelector] = useState(true);
  const [activeWsId, setActiveWsId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // ⬇️ Estado más reciente para evitar closures viejos al crear/actualizar
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Bootstrap mínimo (crear 1er workspace/proyecto si no existen)
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
      setActiveProjectId(pr?.id || null);
    }
  }, [state.workspaces.length, state.projects.length]);

  // Si no hay activo, tomar el primero disponible
  useEffect(() => {
    if (!activeWsId && state.workspaces[0]) setActiveWsId(state.workspaces[0].id);
  }, [activeWsId, state.workspaces]);

  const ws =
    state.workspaces.find((w) => w.id === activeWsId) || state.workspaces[0];
  const project =
    state.projects.find((p) => p.id === activeProjectId) ||
    state.projects.find((p) => p.workspaceId === ws?.id);

  // Si cambia workspace, asegurar que el proyecto activo pertenezca
  useEffect(() => {
    if (!ws) return;
    if (!project || project.workspaceId !== ws.id) {
      const firstP = state.projects.find((p) => p.workspaceId === ws.id);
      setActiveProjectId(firstP?.id || null);
    }
  }, [ws?.id]);

  const tasks = useMemo(() => {
    if (!project) return [];
    let arr = state.tasks.filter((t) => t.projectId === project.id);
    if (q) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        (t) => t.title.toLowerCase().includes(needle) || t.id.includes(q)
      );
    }
    return arr;
  }, [state.tasks, project?.id, q]);

  // Helpers de prioridad/estado (mismo flujo que web)
  const cyclePriority = (p) =>
    p === "low" ? "medium" : p === "medium" ? "high" : p === "high" ? "urgent" : "low";

  const cycleState = (s) =>
    s === "todo" ? "in_progress" : s === "in_progress" ? "done" : s === "done" ? "late" : "todo";

  // === Handlers Kanban ===
  const handleSelectTask = (t) => {
    setSelectedId(t.id);
    setSelectedTaskState(t.state);
  };

  const handleDropSelected = (newColumnId) => {
    if (!selectedId) return;
    updateTask(selectedId, { state: newColumnId });
    setSelectedId(null);
    setSelectedTaskState(null);
  };

  // === Sidebar handlers ===
  const handleSelectWorkspace = (id) => {
    setActiveWsId(id);
    setActiveProjectId(null);
  };

  const handleSelectProject = (id) => {
    setActiveProjectId(id);
    setShowSelector(false);
  };

  // === Crear tarea (desde modal) — RESPETA los valores del formulario
  const [createOpen, setCreateOpen] = useState(false); // ⬅️ NUEVO
  const handleCreateTask = (payload) => {
    if (!project) { setCreateOpen(false); return; }

    const maybeId = createTask(project.id, payload.title);

    const patch = {
      state: payload.state,
      priority: payload.priority,
    };
    if (payload.due) {
      patch.dueAt = new Date(payload.due).toISOString();
    }
    if (payload.assignee) {
      patch.assignedTo = payload.assignee;
    }

    if (maybeId) {
      updateTask(maybeId, patch);
      setCreateOpen(false);
      return;
    }

    const prevIds = new Set(stateRef.current.tasks.map(t => t.id));
    let tries = 0;
    const MAX_TRIES = 20;

    const findAndPatch = () => {
      const s = stateRef.current;
      const createdNow = s.tasks.filter(
        t => t.projectId === project.id && !prevIds.has(t.id)
      );
      const candidate =
        createdNow[0] ||
        s.tasks
          .filter(t => t.projectId === project.id && (t.title || "") === payload.title)
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

  // === Ver tarea (solo lectura)
  const [viewOpen, setViewOpen] = useState(false); // ⬅️ NUEVO
  const [viewTask, setViewTask] = useState(null);  // ⬅️ NUEVO
  const openView = (t) => {
    const withCount = {
      ...t,
      _commentsCount: state.comments.filter((c) => c.taskId === t.id).length,
    };
    setViewTask(withCount);
    setViewOpen(true);
  };

  // === Tabla estilo "cards" con acciones inline
  const Pill = ({ text, tone = "gray" }) => (
    <View style={[styles.pill, pillTones[tone]]}>
      <Text style={[styles.pillText, pillTextTones[tone]]}>{text}</Text>
    </View>
  );

  const Row = ({ t }) => {
    const commentsCount = state.comments.filter((c) => c.taskId === t.id).length;
    const dueRaw = t?.dueAt || t?.dueDate;
    const dueText = dueRaw ? new Date(dueRaw).toLocaleDateString() : "—";
    const priorityTone =
      (t.priority || "medium") === "low"
        ? "gray"
        : (t.priority || "medium") === "medium"
        ? "amber"
        : (t.priority || "medium") === "high"
        ? "green"
        : "red";
    const stateText =
      t.state === "todo"
        ? "POR HACER"
        : t.state === "in_progress"
        ? "EN PROGRESO"
        : t.state === "done"
        ? "HECHA"
        : "TARDÍA";

    return (
      <View style={styles.rowCard}>
        {/* Header fila: título + id + acciones derecha */}
        <View style={styles.rowTop}>
          <View>
            <Text style={styles.rowTitle}>{t.title}</Text>
            <Text style={styles.rowSub}>ID: {t.id}</Text>
          </View>

          <View style={styles.rowActionsRight}>
            <TouchableOpacity
              onPress={() => openView(t)} // ⬅️ Ver tarea
              style={styles.iconBtnGray}
              activeOpacity={0.85}
            >
              <Text style={styles.iconText}>Ver</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedTask(t);
                setCommentsOpen(true);
              }}
              style={styles.iconBtnGray}
              activeOpacity={0.85}
            >
              <Text style={styles.iconText}>💬</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeTask(t.id)}
              style={styles.deleteBtn}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Línea de propiedades */}
        <View style={styles.propRow}>
          <Text style={styles.propLabel}>Asignado</Text>
          <Text style={styles.propValue}>{t.assignedTo || "—"}</Text>

          <Text style={[styles.propLabel, { marginLeft: 16 }]}>Fecha</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedTask(t);
              const iso = t?.dueAt || t?.dueDate;
              setDateTemp(iso ? new Date(iso) : new Date());
              setDateOpen(true);
            }}
            style={styles.iconBtnDark}
            activeOpacity={0.85}
          >
            <Text style={styles.iconTextLight}>📅</Text>
          </TouchableOpacity>
          <Text style={[styles.propValue, { marginLeft: 6 }]}>{dueText}</Text>
        </View>

        <View style={[styles.propRow, { marginTop: 6 }]}>
          <Text style={styles.propLabel}>Prioridad</Text>
          <TouchableOpacity
            onPress={() =>
              updateTask(t.id, {
                priority: cyclePriority(t.priority || "medium"),
              })
            }
            activeOpacity={0.9}
          >
            <Pill text={(t.priority || "medium").toUpperCase()} tone={priorityTone} />
          </TouchableOpacity>

          <Text style={[styles.propLabel, { marginLeft: 16 }]}>Estado</Text>
          <TouchableOpacity
            onPress={() => updateTask(t.id, { state: cycleState(t.state) })}
            activeOpacity={0.9}
          >
            <Pill
              text={stateText}
              tone={t.state === "done" ? "green" : t.state === "late" ? "red" : "gray"}
            />
          </TouchableOpacity>

          <Text style={[styles.propLabel, { marginLeft: 16 }]}>Comentarios</Text>
          <Text style={styles.propValue}>{commentsCount}</Text>
        </View>
      </View>
    );
  };

  const Section = ({ title, data, onQuickAdd }) => {
    const [titleDraft, setTitleDraft] = useState("");
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.sectionTitle}>{title}</Text>

        {data.map((t) => (
          <Row key={t.id} t={t} />
        ))}

        {/* Agregar rápida */}
        <View style={styles.addRow}>
          <TextInput
            value={titleDraft}
            onChangeText={setTitleDraft}
            placeholder="Agregar tarea"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            onPress={() => {
              if (!titleDraft.trim()) return;
              onQuickAdd(titleDraft.trim());
              setTitleDraft("");
            }}
            style={styles.addBtn}
            activeOpacity={0.9}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTablaLikeCards = () => {
    const groups = {
      todo: tasks.filter((t) => t.state === "todo"),
      in_progress: tasks.filter((t) => t.state === "in_progress"),
      done: tasks.filter((t) => t.state === "done"),
      late: tasks.filter((t) => t.state === "late"),
    };

    return (
      <ScrollView>
        <Section
          title="Por hacer"
          data={groups.todo}
          onQuickAdd={(title) => project && createTask(project.id, title)}
        />
        <Section
          title="En progreso"
          data={groups.in_progress}
          onQuickAdd={(title) => project && createTask(project.id, title)}
        />
        <Section
          title="Hechas"
          data={groups.done}
          onQuickAdd={(title) => project && createTask(project.id, title)}
        />
        <Section
          title="Tardías"
          data={groups.late}
          onQuickAdd={(title) => project && createTask(project.id, title)}
        />
      </ScrollView>
    );
  };

  // Si el selector está abierto, mostramos SOLO el Sidebar a pantalla completa
  if (showSelector) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Sidebar
          workspaces={state.workspaces}
          projects={state.projects}
          activeWsId={ws?.id}
          activeProjectId={project?.id}
          onSelectWorkspace={handleSelectWorkspace}
          onSelectProject={handleSelectProject}
        />
      </SafeAreaView>
    );
  }

  // Vista de gestión
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setShowSelector(true)}
          className="px-3 py-2 rounded-xl bg-gray-900"
        >
          <Text className="text-white font-semibold">☰</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold">
          Proyecto · {project?.name ?? "…"}
        </Text>
        <TouchableOpacity
          onPress={() => setCreateOpen(true)}
          disabled={!project}
          className={`px-3 py-2 rounded-xl ${
            project ? "bg-emerald-600" : "bg-emerald-300"
          }`}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold">+ Tarea</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="px-4 flex-row gap-2 mb-3">
        {["table", "kanban", "list"].map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setModo(m)}
            className={`px-4 py-2 rounded-2xl ${
              modo === m ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text className={modo === m ? "text-white" : "text-black"}>
              {m === "table" ? "Tabla" : m === "kanban" ? "Tablero" : "Lista"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-4">
        <SearchBar value={q} onChange={setQ} />
      </View>

      {/* Contenido */}
      <View className="px-4 flex-1">
        {modo === "table" ? (
          renderTablaLikeCards()
        ) : modo === "list" ? (
          <ScrollView>
            {tasks.map((t) => (
              <View key={t.id} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <TaskCard task={t} />
                </View>
                <TouchableOpacity
                  onPress={() => openView(t)}
                  activeOpacity={0.85}
                  style={{ backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Ver</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView horizontal>
            <KanbanColumn
              columnId="todo"
              title="Por hacer"
              tasks={tasks.filter((t) => t.state === "todo")}
              selectedId={selectedId}
              selectedTaskState={selectedTaskState}
              onSelectTask={handleSelectTask}
              onDropSelected={handleDropSelected}
            />
            <KanbanColumn
              columnId="in_progress"
              title="En progreso"
              tasks={tasks.filter((t) => t.state === "in_progress")}
              selectedId={selectedId}
              selectedTaskState={selectedTaskState}
              onSelectTask={handleSelectTask}
              onDropSelected={handleDropSelected}
            />
            <KanbanColumn
              columnId="done"
              title="Hechas"
              tasks={tasks.filter((t) => t.state === "done")}
              selectedId={selectedId}
              selectedTaskState={selectedTaskState}
              onSelectTask={handleSelectTask}
              onDropSelected={handleDropSelected}
            />
            <KanbanColumn
              columnId="late"
              title="Tardías"
              tasks={tasks.filter((t) => t.state === "late")}
              selectedId={selectedId}
              selectedTaskState={selectedTaskState}
              onSelectTask={handleSelectTask}
              onDropSelected={handleDropSelected}
            />
          </ScrollView>
        )}
      </View>

      {/* Modales existentes */}
      <DueDateModal
        open={dateOpen}
        taskTitle={selectedTask?.title}
        value={dateTemp}
        onChange={setDateTemp}
        onCancel={() => {
          setSelectedTask(null);
          setDateOpen(false);
        }}
        onSave={() => {
          if (selectedTask) {
            updateTask(selectedTask.id, { dueAt: dateTemp.toISOString() });
          }
          setSelectedTask(null);
          setDateOpen(false);
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
        onSubmit={(text) => {
          if (selectedTask && text?.trim())
            addComment(selectedTask.id, text.trim());
        }}
      />

      {/* Nuevos modales */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rowCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    padding: 12,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowTitle: { fontWeight: "700", fontSize: 16 },
  rowSub: { color: "#6b7280", fontSize: 12 },
  rowActionsRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  iconBtnGray: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  iconBtnDark: {
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  iconText: { fontSize: 14 },
  iconTextLight: { fontSize: 14, color: "#fff" },
  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  propRow: { flexDirection: "row", alignItems: "center" },
  propLabel: { color: "#6b7280", marginRight: 6 },
  propValue: { color: "#111827", fontWeight: "600" },
  sectionTitle: { fontWeight: "700", marginTop: 16, marginBottom: 8 },
  addRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
  },
  addBtn: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pillText: { fontSize: 12, fontWeight: "700" },
});

const pillTones = {
  gray: { backgroundColor: "#f3f4f6" },
  amber: { backgroundColor: "#fef3c7" },
  green: { backgroundColor: "#dcfce7" },
  red: { backgroundColor: "#fee2e2" },
};
const pillTextTones = {
  gray: { color: "#111827" },
  amber: { color: "#92400e" },
  green: { color: "#065f46" },
  red: { color: "#991b1b" },
};
