// components/TaskCard.native.js
import React from "react";
import { Pressable, Text } from "react-native";

export default function TaskCard({ task, isSelected, onSelect }) {
  // mostrar estado legible
  const prettyState =
    task.state === "in_progress"
      ? "En progreso"
      : task.state === "todo"
      ? "Por hacer"
      : task.state === "done"
      ? "Hecha"
      : task.state === "late"
      ? "Tardía"
      : task.state;

  return (
    <Pressable
      onPress={() => onSelect?.()}
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: isSelected ? "#0ea5e9" : "#fff", // azul si seleccionada
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
      }}
    >
      <Text style={{ fontWeight: "600", marginBottom: 4 }}>{task.title}</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>
        ID: {task.id} · Estado: {prettyState}
      </Text>
    </Pressable>
  );
}

