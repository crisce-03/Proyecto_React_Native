// components/TaskTable.js
import { useState, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

function ColHeader({ label, flex = 1 }) {
  return (
    <View className="px-3 py-2" style={{ flex }}>
      <Text className="text-base uppercase tracking-wider opacity-60">{label}</Text>
    </View>
  );
}
function Cell({ children, flex = 1 }) {
  return (
    <View className="px-3 py-3 justify-center" style={{ flex }}>
      {children}
    </View>
  );
}
function AvatarCircle({ name = "?" }) {
  const initial = name?.[0]?.toUpperCase() ?? "?";
  return (
    <View className="w-9 h-9 rounded-full bg-gray-200 items-center justify-center">
      <Text className="text-base font-semibold">{initial}</Text>
    </View>
  );
}

function PriorityFlag({ value = "medium", onPress }) {
  const label =
    value === "urgent" ? "URGENTE" :
    value === "high"   ? "ALTA"    :
    value === "medium" ? "MEDIA"   : "BAJA";

  const bg =
    value === "urgent" ? "bg-red-100" :
    value === "high"   ? "bg-orange-100" :
    value === "medium" ? "bg-yellow-100" :
                         "bg-green-100";

  const text =
    value === "urgent" ? "text-red-700" :
    value === "high"   ? "text-orange-700" :
    value === "medium" ? "text-yellow-800" :
                         "text-green-700";

  const border =
    value === "urgent" ? "border-red-300" :
    value === "high"   ? "border-orange-300" :
    value === "medium" ? "border-yellow-300" :
                         "border-green-300";

  const Content = (
    <View className={`px-2 py-1 rounded border ${bg} ${border} self-start`}>
      <Text className={`text-base font-medium ${text}`}>{label}</Text>
    </View>
  );
  return onPress ? (
    <TouchableOpacity onPress={onPress} className="active:opacity-80">
      {Content}
    </TouchableOpacity>
  ) : Content;
}

function StatusPill({ value }) {
  const label =
    value === "todo" ? "POR HACER" :
    value === "in_progress" ? "EN PROGRESO" :
    value === "done" ? "HECHA" : "TARDÍA";
  return (
    <View className="px-2 py-1 rounded-full border border-gray-300 self-start">
      <Text className="text-base">{label}</Text>
    </View>
  );
}

function getDueISO(task) { return task?.dueDate || task?.dueAt || null; }
function formatDue(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}
function isOverdue(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  d.setHours(0,0,0,0); today.setHours(0,0,0,0);
  return d < today;
}

const STATE_LABELS_ES = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Hechas",
  late: "Tardías",
};

export default function TaskTable({
  tasks,
  members = [],
  onAdd,
  onOpen,
  onToggle,
  onDelete,
  onSetDueDate,
  onClearDueDate,
  onTogglePriority,
  onOpenComments,
  groupByState = false,
}) {
  const [newTitle, setNewTitle] = useState("");

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    onAdd?.(title);
    setNewTitle("");
  };

  const grouped = useMemo(() => {
    if (!groupByState) return { all: tasks };
    return {
      todo: tasks.filter((t) => t.state === "todo"),
      in_progress: tasks.filter((t) => t.state === "in_progress"),
      done: tasks.filter((t) => t.state === "done"),
      late: tasks.filter((t) => t.state === "late"),
    };
  }, [tasks, groupByState]);

  const COLS = {
    name: "Nombre",
    assignee: "Asignado",
    due: "Fecha límite",
    priority: "Prioridad",
    status: "Estado",
    comments: "Comentarios",
    actions: "",
  };

  const SectionTable = ({ list }) => (
    <>
      <View className="flex-row border-b border-gray-200">
        <ColHeader label={COLS.name} flex={3} />
        <ColHeader label={COLS.assignee} />
        <ColHeader label={COLS.due} />
        <ColHeader label={COLS.priority} />
        <ColHeader label={COLS.status} />
        <ColHeader label={COLS.comments} />
        <ColHeader label={COLS.actions} />
      </View>
      {list.map((t) => {
        const assignee = members.find((m) => t.assignees?.includes(m.id));
        const dueISO = getDueISO(t);
        const overdue = isOverdue(dueISO);

        return (
          <TouchableOpacity
            key={t.id}
            className="flex-row border-b border-gray-100 active:bg-gray-50"
            onPress={() => onOpen?.(t)}
            activeOpacity={0.8}
          >
            <Cell flex={3}>
              <Text className="font-semibold text-lg" numberOfLines={1}>{t.title}</Text>
              <Text className="text-[12px] opacity-60">ID: {t.id.slice(-6)}</Text>
            </Cell>
            <Cell>
              {assignee ? <AvatarCircle name={assignee.name} /> : <Text className="opacity-40 text-base">—</Text>}
            </Cell>
            <Cell>
              <View className="flex-row items-center gap-2">
                <Text className={`text-base ${overdue ? "text-red-600 font-semibold" : ""}`}>
                  {formatDue(dueISO)}
                </Text>
                <TouchableOpacity onPress={() => onSetDueDate?.(t)} className="px-2 py-1 rounded bg-gray-800">
                  <Text className="text-white text-base">📅</Text>
                </TouchableOpacity>
                {!!dueISO && onClearDueDate && (
                  <TouchableOpacity onPress={() => onClearDueDate?.(t)} className="px-2 py-1 rounded bg-gray-200">
                    <Text className="text-base">✖</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Cell>
            <Cell>
              <PriorityFlag value={t.priority || "medium"} onPress={() => onTogglePriority?.(t)} />
            </Cell>
            <Cell>
              <TouchableOpacity onPress={() => onToggle?.(t)} className="active:opacity-80">
                <StatusPill value={t.state} />
              </TouchableOpacity>
            </Cell>
            <Cell>
              <View className="flex-row items-center gap-2">
                <Text className="text-base">{t._commentsCount ?? 0}</Text>
                <TouchableOpacity onPress={() => onOpenComments?.(t)} className="px-2 py-1 rounded bg-gray-200">
                  <Text className="text-lg">💬</Text>
                </TouchableOpacity>
              </View>
            </Cell>
            <Cell>
              <TouchableOpacity onPress={() => onDelete?.(t.id)} className="px-2 py-1 rounded bg-red-500 self-start">
                <Text className="text-base text-white">Eliminar</Text>
              </TouchableOpacity>
            </Cell>
          </TouchableOpacity>
        );
      })}
    </>
  );

  return (
    <View className="flex-1">
      <ScrollView>
        {groupByState
          ? Object.entries(grouped).map(([key, list]) =>
              list.length ? (
                <View key={key} className="mb-4">
                  <Text className="text-lg font-bold px-1 py-2">
                    {STATE_LABELS_ES[key]}
                  </Text>
                  <SectionTable list={list} />
                </View>
              ) : null
            )
          : <SectionTable list={tasks} />}
        {/* Fila agregar */}
        <View className="flex-row border-t border-gray-200 bg-white mt-2">
          <Cell flex={3}>
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">＋</Text>
              <TextInput
                placeholder="Agregar tarea"
                value={newTitle}
                onChangeText={setNewTitle}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-lg"
              />
            </View>
          </Cell>
          <Cell><Text className="opacity-40 text-base">—</Text></Cell>
          <Cell>
            <TouchableOpacity
              onPress={() => {
                if (!newTitle.trim()) return;
                onAdd?.(newTitle.trim());
                setNewTitle("");
              }}
              className="px-2 py-1 rounded bg-white self-start"
            >
              <Text className="text-base">—</Text>
            </TouchableOpacity>
          </Cell>
          <Cell><Text className="opacity-40 text-base">—</Text></Cell>
          <Cell><Text className="opacity-40 text-base">—</Text></Cell>
          <Cell><Text className="opacity-40 text-base">—</Text></Cell>
          <Cell>
            <TouchableOpacity onPress={add} className="px-3 py-2 rounded bg-emerald-600 self-start">
              <Text className="text-white text-base">Agregar</Text>
            </TouchableOpacity>
          </Cell>
        </View>
      </ScrollView>
    </View>
  );
}
