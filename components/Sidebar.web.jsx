import { useMemo } from "react";

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
const wsProjects = useMemo(
() => projects.filter((p) => p.workspaceId === activeWsId),
[projects, activeWsId]
);



return (
<aside className="w-[280px] shrink-0 border-r bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50">
<div className="p-4 border-b">
<div className="flex items-center justify-between">
<h2 className="text-base font-bold">Grupos de trabajo</h2>
<button
onClick={onOpenNewWorkspace}
className="px-3 py-1.5 rounded-xl bg-black text-white text-sm"
title="Nuevo grupo"
>
+ Grupo
</button>
</div>
<div className="mt-3 space-y-1 max-h-[30vh] overflow-y-auto pr-1">
{workspaces.length === 0 ? (
<div className="text-sm opacity-60">Sin grupos aún.</div>
) : (
workspaces.map((ws) => (
<button
key={ws.id}
onClick={() => onSelectWorkspace(ws.id)}
className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
ws.id === activeWsId ? "bg-gray-900 text-white" : "hover:bg-gray-100"
}`}
>
{ws.name}
</button>
))
)}
</div>
</div>

<div className="p-4">
<div className="flex items-center justify-between">
<h3 className="text-sm font-semibold">Proyectos</h3>
<button
onClick={onOpenNewProject}
className="px-3 py-1.5 rounded-xl bg-gray-900 text-white text-sm"
disabled={!activeWsId}
title="Nuevo proyecto"
>
+ Proyecto
</button>
</div>
<div className="mt-3 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
{!activeWsId ? (
<div className="text-sm opacity-60">Selecciona o crea un grupo.</div>
) : wsProjects.length === 0 ? (
<div className="text-sm opacity-60">Sin proyectos. Crea uno.</div>
) : (
wsProjects.map((p) => (
<button
key={p.id}
onClick={() => onSelectProject(p.id)}
className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
p.id === activeProjectId ? "bg-emerald-600 text-white" : "hover:bg-emerald-50"
}`}
>
{p.name}
</button>
))
)}
</div>
</div>
</aside>
);
}