// components/KanbanColum.web.js
import React from "react";
import TaskCard from "./TaskCard.web";

export default function KanbanColumn({
  columnId,
  title,
  tasks = [],
  // selección
  selectedId,
  selectedTaskState,
  onSelectTask,
  onDropSelected, // (columnId) => void
}) {
  const canDrop =
    !!selectedId && selectedTaskState && selectedTaskState !== columnId;

  return (
    <div
      className={[
        "w-[320px] min-w-[320px] rounded-xl border bg-white transition p-3 mr-3",
        canDrop ? "hover:border-emerald-400 hover:bg-emerald-50/40" : "border-gray-200",
      ].join(" ")}
      onClick={() => {
        if (canDrop) onDropSelected?.(columnId);
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">{title}</h3>

        {canDrop && (
          <button
            className="text-xs px-2 py-1 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white transition"
            onClick={(e) => {
              e.stopPropagation();
              onDropSelected?.(columnId);
            }}
          >
            Mover aquí
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            selectedId={selectedId}
            onSelect={onSelectTask}
          />
        ))}

        {/* Placeholder de destino cuando la columna está vacía y hay selección */}
        {canDrop && tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-emerald-400 bg-emerald-50/50 p-3 text-xs text-emerald-700">
            Suelta aquí
          </div>
        )}
      </div>
    </div>
  );
}
