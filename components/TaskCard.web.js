// components/TaskCard.web.js
import React from "react";

export default function TaskCard({ task, selectedId, onSelect }) {
  const selected = selectedId === task.id;

  return (
    <div
      onClick={() => onSelect?.(task)}
      className={[
        "rounded-xl border px-4 py-3 transition cursor-pointer select-none",
        selected
          ? "ring-2 ring-emerald-500 border-emerald-500 shadow-lg scale-[1.01] bg-white"
          : "border-gray-300 hover:shadow-md bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold leading-none">{task.title}</h4>
        {/* chip de prioridad (simple) */}
        {!!task.priority && (
          <span
            className={[
              "text-[10px] px-2 py-[2px] rounded-full border",
              task.priority === "urgent"
                ? "border-red-400 text-red-600"
                : task.priority === "high"
                ? "border-orange-400 text-orange-600"
                : task.priority === "medium"
                ? "border-amber-400 text-amber-600"
                : "border-gray-300 text-gray-600",
            ].join(" ")}
          >
            {String(task.priority).toUpperCase()}
          </span>
        )}
      </div>

      <p className="mt-1 text-[11px] text-gray-500">
        ID: {task.id} · Estado: {task.state}
      </p>
    </div>
  );
}
