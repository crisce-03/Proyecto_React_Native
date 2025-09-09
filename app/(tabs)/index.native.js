// app/tabs/index.native.js
import { View, Text, TouchableOpacity } from "react-native";
import { useApp } from "../../contexts/AppProvider";
import { useRouter } from "expo-router";

export default function Home() {
  const { state } = useApp();
  const router = useRouter();
  const totalTasks = state.tasks.length;
  const inProgress = state.tasks.filter((t) => t.state === "in_progress").length;
  const late = state.tasks.filter((t) => t.state === "late").length;

  return (
    <View className="flex-1 p-6 gap-4 bg-white">
      <Text className="text-2xl font-bold">Hola {state.user?.name}</Text>
      <Text className="text-base">
        Tareas: {totalTasks} · En progreso: {inProgress} · Tardías: {late}
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/projects")}
        className="bg-black px-4 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-semibold">
          Ir al Gestor de Proyectos
        </Text>
      </TouchableOpacity>
    </View>
  );
}

