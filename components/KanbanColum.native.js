// components/KanbanColum.native.js
import React from "react";
import { View, Text, Pressable } from "react-native";
import TaskCard from "./TaskCard.native";

export default function KanbanColum({
  columnId,
  title,
  tasks = [],
  selectedId,
  selectedTaskState,
  onSelectTask,
  onDropSelected,
}) {
  const canDrop = !!selectedId && selectedTaskState && selectedTaskState !== columnId;

  return (
    <Pressable
      onPress={() => canDrop && onDropSelected?.(columnId)}
      style={{
        width: 300,
        minWidth: 300,
        backgroundColor: "#f7f7f7",
        borderColor: canDrop ? "#10b981" : "#e5e7eb", // verde si puede soltar
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
      }}
    >
      <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8 }}>{title}</Text>

      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          isSelected={selectedId === t.id}
          onSelect={() => onSelectTask?.(t)}
        />
      ))}

      <Text
        style={{
          marginTop: 4,
          fontSize: 12,
          color: canDrop ? "#10b981" : "#94a3b8",
        }}
      >
        {canDrop ? "Toca aquí para mover la tarea seleccionada a esta columna" : " "}
      </Text>
    </Pressable>
  );
}
