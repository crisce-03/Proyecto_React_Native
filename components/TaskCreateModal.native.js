import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const CHIP = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

export default function TaskCreateModal({ open, onClose, onSubmit, initial }) {
  const init = initial || {
    title: "",
    assignee: "",
    due: "", // AAAA-MM-DD (sin picker para evitar paquetes)
    priority: "medium", // low | medium | high | urgent
    state: "todo",      // todo | in_progress | done | late
  };

  const [title, setTitle] = useState(init.title);
  const [assignee, setAssignee] = useState(init.assignee);
  const [due, setDue] = useState(init.due);
  const [priority, setPriority] = useState(init.priority);
  const [state, setState] = useState(init.state);

  useEffect(() => {
    if (open) {
      setTitle(init.title || "");
      setAssignee(init.assignee || "");
      setDue(init.due || "");
      setPriority(init.priority || "medium");
      setState(init.state || "todo");
    }
  }, [open]);

  const canSave = title.trim().length > 0;

  return (
    <Modal visible={open} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nueva tarea</Text>
          </View>

          <View style={styles.body}>
            {/* Nombre */}
            <View style={styles.block}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                autoFocus
                value={title}
                onChangeText={setTitle}
                placeholder="Título de la tarea"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Asignado + Fecha */}
            <View style={styles.row2}>
              <View style={[styles.block, { flex: 1 }]}>
                <Text style={styles.label}>Asignado (texto)</Text>
                <TextInput
                  value={assignee}
                  onChangeText={setAssignee}
                  placeholder="Ej: Ana"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View style={[styles.block, { flex: 1 }]}>
                <Text style={styles.label}>Fecha límite (AAAA-MM-DD)</Text>
                <TextInput
                  value={due}
                  onChangeText={setDue}
                  placeholder="2025-09-30"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Prioridad */}
            <View style={styles.block}>
              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.chipsRow}>
                {[
                  { v: "low", l: "Baja" },
                  { v: "medium", l: "Media" },
                  { v: "high", l: "Alta" },
                  { v: "urgent", l: "Urgente" },
                ].map((opt) => (
                  <CHIP
                    key={opt.v}
                    label={opt.l}
                    active={priority === opt.v}
                    onPress={() => setPriority(opt.v)}
                  />
                ))}
              </View>
            </View>

            {/* Estado */}
            <View style={styles.block}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.chipsRow}>
                {[
                  { v: "todo", l: "Por hacer" },
                  { v: "in_progress", l: "En progreso" },
                  { v: "done", l: "Hecha" },
                  { v: "late", l: "Tardía" },
                ].map((opt) => (
                  <CHIP
                    key={opt.v}
                    label={opt.l}
                    active={state === opt.v}
                    onPress={() => setState(opt.v)}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, styles.btnGhost]} activeOpacity={0.85}>
              <Text style={[styles.btnText, { color: "#111827" }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!canSave}
              onPress={() => {
                const normDue = due ? `${due}T00:00:00` : "";
                onSubmit?.({
                  title: title.trim(),
                  assignee: assignee.trim(),
                  due: normDue,
                  priority,
                  state,
                });
              }}
              style={[styles.btn, canSave ? styles.btnPrimary : styles.btnDisabled]}
              activeOpacity={canSave ? 0.85 : 1}
            >
              <Text style={[styles.btnText, { color: "#fff" }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 16 },
  card: { width: "100%", maxWidth: 600, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e5e7eb" },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc" },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  body: { paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  block: { gap: 6 },
  label: { fontSize: 13, color: "#6b7280" },
  input: { backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: "#111827", borderWidth: 1, borderColor: "#e5e7eb" },
  row2: { flexDirection: "row", gap: 12 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb" },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { color: "#111827", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  footer: { flexDirection: "row", justifyContent: "flex-end", gap: 10, padding: 14, borderTopWidth: 1, borderColor: "#e5e7eb" },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnPrimary: { backgroundColor: "#10b981" },
  btnDisabled: { backgroundColor: "#a7f3d0" },
  btnGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  btnText: { fontWeight: "700" },
});
