// app/tabs/projects.native.js
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../contexts/AppProvider";
import SearchBar from "../../components/SearchBar";
import KanbanColumn from "../../components/KanbanColum"; // ojo con el nombre del archivo
import TaskCard from "../../components/TaskCard";
// ❌ No importes CSS en native (web-only).
// import "../../global.css";

const STATES = ["all", "todo", "in_progress", "done", "late"];

export default function Projects() {
  const {
    state,
    createWorkspace,
    createProject,
    createTask,
    updateTask,
    removeTask,
  } = useApp();

  const [mode, setMode] = useState("table"); // arranca en "tabla" (debajo lo renderizamos como lista nativa)
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  // Boot mínimo (aseguramos 1 workspace/proyecto)
  useEffect(() => {
    if (!state.workspaces.length) { createWorkspace("Team Space"); return; }
    const ws0 = state.workspaces[0];
    const hasProject = state.projects.some(p => p.workspaceId === ws0.id);
    if (!hasProject) createProject(ws0.id, "Project 1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.workspaces.length, state.projects.length]);

  const ws = state.workspaces[0];
  const project = state.projects.find(p => p.workspaceId === ws?.id);

  const members = ws?.members ?? [];

  const tasks = useMemo(() => {
    if (!project) return [];
    let arr = state.tasks
      .filter(t => t.projectId === project.id)
      .map(t => ({
        ...t,
        _commentsCount: state.comments.filter(c => c.taskId === t.id).length,
      }));
    if (filter !== "all") arr = arr.filter(t => t.state === filter);
    if (q) {
      const needle = q.toLowerCase();
      arr = arr.filter(
        t => t.title.toLowerCase().includes(needle) || t.id.includes(q)
      );
    }
    return arr;
  }, [state.tasks, state.comments, project?.id, filter, q]);

  const createQuick = (title = "Nueva tarea") => {
    if (!project) return;
    createTask(project.id, title);
  };

  const nextState = (s) =>
    s === "todo" ? "in_progress" :
    s === "in_progress" ? "done" :
    s === "done" ? "late" : "todo";

  const toggleTask = (t) => updateTask(t.id, { state: nextState(t.state) });
  const move = (t, to) => updateTask(t.id, { state: to });

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-3">Project · {project?.name ?? "…"}</Text>

      {/* Modo de vista + Crear rápida */}
      <View className="flex-row gap-2 mb-2">
        {["table","kanban","list"].map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            className={`px-3 py-2 rounded-xl ${mode===m?'bg-black':'bg-gray-200'}`}
          >
            <Text className={`${mode===m?'text-white':'text-black'}`}>
              {m === "table" ? "Table" : m === "kanban" ? "Board" : "List"}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => createQuick()}
          disabled={!project}
          className={`px-3 py-2 rounded-xl ${project?'bg-emerald-600':'bg-emerald-300'}`}
        >
          <Text className="text-white">+ Task</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2">
          {STATES.map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl ${filter===s?'bg-gray-900':'bg-gray-200'}`}
            >
              <Text className={`${filter===s?'text-white':'text-black'}`}>
                {s === "all" ? "All" :
                 s === "todo" ? "To do" :
                 s === "in_progress" ? "In progress" :
                 s === "done" ? "Done" : "Late"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Búsqueda (nativa) */}
      <SearchBar value={q} onChange={setQ} />

      {/* Contenido */}
      {!project ? (
        <View className="flex-1 items-center justify-center">
          <Text className="opacity-60">Creando proyecto inicial…</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="opacity-60">Sin tareas. Agrega una en “+ Task”.</Text>
        </View>
      ) : mode === "kanban" ? (
        // Board horizontal (nativo)
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <KanbanColumn
            title="To do"
            tasks={tasks.filter((t) => t.state === "todo")}
            onOpen={(t) => move(t, "in_progress")}
          />
          <KanbanColumn
            title="In progress"
            tasks={tasks.filter((t) => t.state === "in_progress")}
            onOpen={(t) => move(t, "done")}
          />
          <KanbanColumn
            title="Done"
            tasks={tasks.filter((t) => t.state === "done")}
            onOpen={(t) => move(t, "late")}
          />
          <KanbanColumn
            title="Late"
            tasks={tasks.filter((t) => t.state === "late")}
            onOpen={(t) => move(t, "todo")}
          />
        </ScrollView>
      ) : (
        // En native, "table" y "list" los renderizamos como lista con tarjetas
        <ScrollView>
          <View className="gap-2">
            {tasks.map((t) => (
              <View key={t.id} className="flex-row items-center gap-2">
                <TaskCard task={t} onPress={() => toggleTask(t)} members={members} />
                <TouchableOpacity
                  onPress={() => removeTask(t.id)}
                  className="px-2 py-2 rounded bg-red-500"
                >
                  <Text className="text-white">Eliminar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
