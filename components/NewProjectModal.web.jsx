import { useState } from "react";
import Modal from "./Modal.web";


export default function NewProjectModal({ open, onClose, onCreate }) {
const [name, setName] = useState("");
const [description, setDescription] = useState("");


const submit = () => {
if (!name.trim()) return;
onCreate?.({ name: name.trim(), description: description.trim() });
setName(""); setDescription("");
onClose?.();
};


return (
<Modal open={open} onClose={onClose} title="Nuevo proyecto" onSubmit={submit} disabled={!name.trim()} submitLabel="Crear proyecto">
<div>
<label className="block text-sm font-medium">Nombre</label>
<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Proyecto 1" />
</div>
<div>
<label className="block text-sm font-medium">Descripción</label>
<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Backlog MVP" />
</div>
</Modal>
);
}