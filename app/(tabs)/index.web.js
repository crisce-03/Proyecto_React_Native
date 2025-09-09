// app/tabs/index.web.js
import "../../global.css";
import { useApp } from "../../contexts/AppProvider";
import { useRouter } from "expo-router";

export default function Home() {
  const { state } = useApp();
  const router = useRouter();
  const totalTasks = state.tasks.length;
  const inProgress = state.tasks.filter((t) => t.state === "in_progress").length;
  const late = state.tasks.filter((t) => t.state === "late").length;

  return (
    <div className="min-h-screen bg-white p-10 flex flex-col gap-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Hola {state.user?.name}</h1>
      <p className="text-base">
        Tareas: {totalTasks} · En progreso: {inProgress} · Tardías: {late}
      </p>
      <button
        onClick={() => router.push("/(tabs)/projects")}
        className="bg-black text-white px-5 py-3 rounded-xl font-semibold w-fit"
      >
        Ir al Gestor de Proyectos
      </button>
    </div>
  );
}
