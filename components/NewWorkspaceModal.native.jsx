import  React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import AppModal from "./Modal.native";

export default function NewWorkspaceModal({ visible, onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    const members = participants.split(",").map((s) => s.trim()).filter(Boolean);
    onCreate?.({ name: name.trim(), description: description.trim(), members });
    setName(""); setDescription(""); setParticipants("");
    onClose?.();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Nuevo grupo de trabajo" onSubmit={submit} disabled={!name.trim()} submitLabel="Crear grupo">
      <View style={{ gap: 8 }}>
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Nombre</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Team Space" style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Descripción</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Equipo de desarrollo" style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>Participantes (coma separados)</Text>
          <TextInput value={participants} onChangeText={setParticipants} placeholder="Ana, Luis, Cris" style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }} />
        </View>
      </View>
    </AppModal>
  );
}