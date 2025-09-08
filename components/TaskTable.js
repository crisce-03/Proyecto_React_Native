// components/TaskTable.js
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

function ColHeader({ label, flex = 1 }) {
  return (
    <View className="px-3 py-2" style={{ flex }}>
      <Text className="text-xs uppercase tracking-wider opacity-60">{label}</Text>
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
    <View className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center">
      <Text className="text-xs font-semibold">{initial}</Text>
    </View>
  );
}

function PriorityFlag({ value }) {
  const label =
    value === "urgent" ? "URGENT" :
    value === "high" ? "HIGH" :
    value === "medium" ? "MED" : "LOW";
  return (
    <View className="px-2 py-1 rounded bg-gray-200 self-start">
      <Text className="text-xs">{label}</Text>
    </View>
  );
}

function StatusPill({ value }) {
  const label =
    value === "todo" ? "TO DO" :
    value === "in_progress" ? "IN PROGRESS" :
    value === "done" ? "DONE" : "LATE";
  return (
    <View className="px-2 py-1 rounded-full border border-gray-300 self-start">
      <Text className="text-xs">{label}</Text>
    </View>
  );
}

export default function TaskTable({
  tasks,
  members = [],
  onAdd,         // (title) => void
  onOpen,        // (task)  => void  (abrir / editar)
  onToggle,      // (task)  => void  (cambiar estado simple)
  onDelete,      // (taskId)=> void
}) {
  const [newTitle, setNewTitle] = useState("");

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    onAdd?.(title);
    setNewTitle("");
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row border-b border-gray-200">
        <ColHeader label="Name" flex={3} />
        <ColHeader label="Assignee" />
        <ColHeader label="Due date" />
        <ColHeader label="Priority" />
        <ColHeader label="Status" />
        <ColHeader label="Comments" />
        <ColHeader label="" />
      </View>

      {/* Rows */}
      <ScrollView>
        {tasks.map((t) => {
          const assignee = members.find(m => t.assignees?.includes(m.id));
          return (
            <TouchableOpacity
              key={t.id}
              className="flex-row border-b border-gray-100 active:bg-gray-50"
              onPress={() => onOpen?.(t)}
            >
              <Cell flex={3}>
                <Text className="font-medium">{t.title}</Text>
                <Text className="text-[10px] opacity-60">ID: {t.id.slice(-6)}</Text>
              </Cell>
              <Cell>
                {assignee ? <AvatarCircle name={assignee.name} /> : <Text className="opacity-40">—</Text>}
              </Cell>
              <Cell>
                <Text className="text-xs">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}</Text>
              </Cell>
              <Cell>
                <PriorityFlag value={t.priority || "medium"} />
              </Cell>
              <Cell>
                <StatusPill value={t.state} />
              </Cell>
              <Cell>
                <Text className="text-xs">{t._commentsCount ?? 0}</Text>
              </Cell>
              <Cell>
                <View className="flex-row gap-2">
                  <TouchableOpacity onPress={() => onToggle?.(t)} className="px-2 py-1 rounded bg-gray-200">
                    <Text className="text-xs">Next</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onDelete?.(t.id)} className="px-2 py-1 rounded bg-red-500">
                    <Text className="text-xs text-white">Del</Text>
                  </TouchableOpacity>
                </View>
              </Cell>
            </TouchableOpacity>
          );
        })}

        {/* Add row */}
        <View className="flex-row border-t border-gray-200 bg-white">
          <Cell flex={3}>
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">＋</Text>
              <TextInput
                placeholder="Add Task"
                value={newTitle}
                onChangeText={setNewTitle}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2"
              />
            </View>
          </Cell>
          <Cell><Text className="opacity-40">—</Text></Cell>
          <Cell><Text className="opacity-40">—</Text></Cell>
          <Cell><Text className="opacity-40">—</Text></Cell>
          <Cell><Text className="opacity-40">—</Text></Cell>
          <Cell><Text className="opacity-40">—</Text></Cell>
          <Cell>
            <TouchableOpacity onPress={add} className="px-3 py-2 rounded bg-emerald-600 self-start">
              <Text className="text-white text-xs">Add</Text>
            </TouchableOpacity>
          </Cell>
        </View>
      </ScrollView>
    </View>
  );
}
