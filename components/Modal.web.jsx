import React, { useEffect } from "react";

export default function Modal({ open, onClose, title, children, onSubmit, submitLabel = "Guardar", disabled }) {
useEffect(() => {
if (!open) return;
const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
window.addEventListener("keydown", onKey);
return () => window.removeEventListener("keydown", onKey);
}, [open, onClose]);


if (!open) return null;
return (
<div className="fixed inset-0 z-50 flex items-center justify-center">
<div className="absolute inset-0 bg-black/40" onClick={onClose} />
<div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
<div className="flex items-center justify-between mb-3">
<h3 className="text-lg font-semibold">{title}</h3>
<button onClick={onClose} className="px-2 py-1 rounded-lg bg-gray-100">✕</button>
</div>
<div className="space-y-3">{children}</div>
<div className="mt-5 flex justify-end gap-2">
<button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-200">Cancelar</button>
<button onClick={onSubmit} disabled={disabled} className={`px-4 py-2 rounded-xl text-white ${disabled ? "bg-emerald-300" : "bg-emerald-600"}`}>
{submitLabel}
</button>
</div>
</div>
</div>
);
}