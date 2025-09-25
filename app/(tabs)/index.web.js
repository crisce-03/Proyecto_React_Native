// app/tabs/index.web.js
import "../../global.css";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white flex items-center">
      <main className="w-full max-w-3xl mx-auto px-6 py-14 text-center">
        {/* Hero */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
          TaskID
        </h1>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">
          Organiza workspaces, proyectos y tareas. 
        </p>

        {/* Único botón */}
        <div className="mt-10">
          <button
            onClick={() => router.push("/(tabs)/projects")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black text-white font-semibold hover:bg-slate-900 shadow-sm transition"
          >
            Ingresar al Gestor de Tareas →
          </button>
        </div>
      </main>
    </div>
  );
}
