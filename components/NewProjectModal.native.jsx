import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import AppModal from "./Modal.native";

export default function NewProjectModal({ visible, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate?.({ name: name.trim(), description: description.trim() });
    setName(""); setDescription("");
    onClose?.();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Nuevo proyecto" onSubmit={submit} disabled={!name.trim()} submitLabel="Crear proyecto">
      <View style={{ gap: 8 }}>
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Proyecto 1" style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Descripción</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Backlog MVP" style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
      </View>
    </AppModal>
  );
}