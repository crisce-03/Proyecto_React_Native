// app/tabs/index.native.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeNative() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        {/* Hero */}
        <Text style={styles.title}>TaskID</Text>
        <Text style={styles.subtitle}>
          Organiza workspaces, proyectos y tareas. (Demo solo frontend)
        </Text>

        {/* Único botón */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/projects")}
          activeOpacity={0.9}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>Ingresar al Gestor de Tareas →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "#334155",
    textAlign: "center",
  },
  cta: {
    marginTop: 16,
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  ctaText: { color: "#fff", fontWeight: "700" },
});
