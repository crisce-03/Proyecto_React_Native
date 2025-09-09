// components/CommentsModal.js
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";

export default function CommentsModal({
  open,
  taskTitle,
  comments = [],     // [{ id, taskId, text, authorName, createdAt }, ...]
  onClose,
  onSubmit,          // (text)=>void
}) {
  const [text, setText] = useState("");

  const submit = () => {
    const t = text.trim();
    if (!t) return;
    onSubmit?.(t);
    setText("");
  };

  return (
    <Modal transparent animationType="fade" visible={open} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full max-w-xl rounded-2xl bg-white p-5">
          <Text className="text-xl font-semibold mb-3">
            Comentarios · {taskTitle || "Tarea"}
          </Text>

          <View className="max-h-64 border border-gray-200 rounded-xl">
            <ScrollView className="p-3">
              {comments.length === 0 ? (
                <Text className="text-sm opacity-60">Sin comentarios aún.</Text>
              ) : (
                comments.map((c) => (
                  <View key={c.id} className="mb-3">
                    <Text className="text-sm">
                      <Text className="font-semibold">{c.authorName || "Alguien"}</Text>
                      <Text className="opacity-60"> · {new Date(c.createdAt || Date.now()).toLocaleString()}</Text>
                    </Text>
                    <Text className="text-base leading-5">{c.text}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium mb-1">Agregar comentario</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Escribe tu comentario…"
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-xl px-3 py-2 text-base"
            />
          </View>

          <View className="flex-row justify-end gap-2 mt-4">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-xl bg-gray-200">
              <Text className="text-base">Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} className="px-4 py-2 rounded-xl bg-black">
              <Text className="text-white text-base">Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
