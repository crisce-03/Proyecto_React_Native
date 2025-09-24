import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export default function Sidebar({
  workspaces,
  projects,
  activeWsId,
  activeProjectId,
  onSelectWorkspace,
  onSelectProject,
  onOpenNewWorkspace,
  onOpenNewProject,
}) {
  // Proyectos del workspace activo
  const wsProjects = useMemo(
    () => projects.filter((p) => p.workspaceId === activeWsId),
    [projects, activeWsId]
  );

  // Selección local (para resaltar y para el botón "Abrir proyecto seleccionado")
  const [selectedId, setSelectedId] = useState(activeProjectId || null);
  useEffect(() => {
    setSelectedId(activeProjectId || null);
  }, [activeProjectId, activeWsId]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Header */}
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#e5e7eb",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          Elige un grupo y proyecto
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={onOpenNewWorkspace}
            style={{
              backgroundColor: "black",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              marginRight: 8,
            }}
          >
            <Text style={{ color: "white" }}>+ Grupo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenNewProject}
            disabled={!activeWsId}
            style={{
              backgroundColor: activeWsId ? "#111827" : "#d1d5db",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "white" }}>+ Proyecto</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Workspaces */}
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Grupos de trabajo</Text>
          {workspaces.length === 0 ? (
            <Text style={{ opacity: 0.6 }}>Sin grupos aún.</Text>
          ) : (
            workspaces.map((ws) => (
              <TouchableOpacity
                key={ws.id}
                onPress={() => {
                  onSelectWorkspace(ws.id);
                  setSelectedId(null);
                }}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: ws.id === activeWsId ? "#111827" : "#f3f4f6",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: ws.id === activeWsId ? "white" : "#111827" }}>
                  {ws.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Projects */}
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>Proyectos</Text>
          {!activeWsId ? (
            <Text style={{ opacity: 0.6 }}>Selecciona o crea un grupo.</Text>
          ) : wsProjects.length === 0 ? (
            <Text style={{ opacity: 0.6 }}>Sin proyectos. Crea uno.</Text>
          ) : (
            wsProjects.map((p) => (
              <View
                key={p.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: selectedId === p.id ? "#ecfdf5" : "#f8fafc",
                  borderWidth: 1,
                  borderColor: selectedId === p.id ? "#a7f3d0" : "#e5e7eb",
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => setSelectedId(p.id)} // solo selecciona/ilumina
                  style={{ flex: 1, marginRight: 8 }}
                >
                  <Text style={{ fontWeight: "600" }}>{p.name}</Text>
                </TouchableOpacity>

                {/* Botón Abrir directo */}
                <TouchableOpacity
                  onPress={() => onSelectProject(p.id)} // <- abre y cierra selector desde el padre
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: "#059669",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600" }}>Abrir</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Botón global (opcional) para abrir el seleccionado */}
        <TouchableOpacity
          onPress={() => selectedId && onSelectProject(selectedId)}
          disabled={!selectedId}
          style={{
            opacity: selectedId ? 1 : 0.5,
            padding: 12,
            borderRadius: 12,
            backgroundColor: "#059669",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            Abrir proyecto seleccionado
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
