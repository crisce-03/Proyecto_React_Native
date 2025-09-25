import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

function Tag({ text }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );
}
function Pill({ text }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

export default function TaskViewModal({ open, onClose, task }) {
  if (!open || !task) return null;

  const stateLabel =
    task.state === "in_progress" ? "En progreso"
    : task.state === "done" ? "Hecha"
    : task.state === "late" ? "Tardía"
    : "Por hacer";

  const priorityLabel =
    (task.priority || "medium") === "low" ? "Baja"
    : (task.priority || "medium") === "medium" ? "Media"
    : (task.priority || "medium") === "high" ? "Alta"
    : "Urgente";

  const dueRaw = task.dueAt || task.dueDate || "";
  const dueText = dueRaw
    ? new Date(dueRaw).toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" })
    : "—";
  const assignee = task.assignedTo || task.assignee || "—";
  const commentsCount = typeof task._commentsCount === "number" ? task._commentsCount : "—";

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.subtitle}>ID: {task.id}</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Estado</Text>
                <Pill text={stateLabel.toUpperCase()} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Prioridad</Text>
                <Tag text={priorityLabel.toUpperCase()} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Asignado</Text>
                <Text style={styles.value}>{assignee}</Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Fecha límite</Text>
                <Text style={styles.value}>{dueText}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.field}>
                <Text style={styles.label}>Comentarios</Text>
                <Text style={styles.value}>{commentsCount}</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.btn} activeOpacity={0.85}>
              <Text style={styles.btnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 16 },
  card: { width: "100%", maxWidth: 640, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e5e7eb" },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc" },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#64748b", marginTop: 4 },
  body: { padding: 16, gap: 14 },
  row: { flexDirection: "row", gap: 12 },
  field: { flex: 1, gap: 6 },
  label: { fontSize: 12, color: "#64748b" },
  value: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db", alignSelf: "flex-start" },
  pillText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fef3c7", borderWidth: 1, borderColor: "#fde68a", alignSelf: "flex-start" },
  tagText: { fontSize: 12, fontWeight: "700", color: "#92400e" },
  footer: { padding: 14, borderTopWidth: 1, borderColor: "#e5e7eb", flexDirection: "row", justifyContent: "flex-end" },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#111827" },
  btnText: { color: "#fff", fontWeight: "700" },
});
