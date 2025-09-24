// =============================================
// components/Modal.mobile.jsx
// =============================================
import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

export default function AppModal({ visible, onClose, title, children, onSubmit, submitLabel = "Guardar", disabled }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
        <View style={{ backgroundColor: "white", borderRadius: 16, padding: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#f3f4f6", borderRadius: 8 }}>
              <Text>✕</Text>
            </TouchableOpacity>
          </View>
          {children}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#e5e7eb", borderRadius: 10, marginRight: 8 }}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSubmit} disabled={disabled} style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: disabled ? "#86efac" : "#059669", borderRadius: 10 }}>
              <Text style={{ color: "white" }}>{submitLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}