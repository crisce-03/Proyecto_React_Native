// components/DueDateModal.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function DueDateModal({
  open,
  taskTitle,
  value,            // Date
  onChange,         // (Date)=>void
  onCancel,
  onSave,
}) {
  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full max-w-md rounded-2xl bg-white p-4">
          <Text className="text-lg font-semibold mb-3">
            {taskTitle ? `Fecha límite: ${taskTitle}` : "Fecha límite"}
          </Text>

          {/* iOS / Android: calendario nativo */}
          {(Platform.OS === "ios" || Platform.OS === "android") && (
            <DateTimePicker
              value={value}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "calendar"}
              onChange={(_, d) => d && onChange?.(d)}
            />
          )}

          {/* Web: calendario HTML nativo */}
          {Platform.OS === "web" && (
            <View className="my-2">
              {/* eslint-disable-next-line react/no-unknown-property */}
              <input
                type="date"
                value={value.toISOString().slice(0, 10)}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  const picked = new Date(value);
                  picked.setFullYear(y, (m ?? 1) - 1, d ?? picked.getDate());
                  picked.setHours(0, 0, 0, 0);
                  onChange?.(picked);
                }}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  fontSize: 14,
                }}
              />
            </View>
          )}

          <View className="flex-row justify-end gap-2 mt-3">
            <TouchableOpacity onPress={onCancel} className="px-3 py-2 rounded-xl bg-gray-200">
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave} className="px-3 py-2 rounded-xl bg-black">
              <Text className="text-white">Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
