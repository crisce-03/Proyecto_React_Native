import { useState } from "react";
import Modal from "./Modal.web";


export default function NewWorkspaceModal({ open, onClose, onCreate }) {
const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [participants, setParticipants] = useState(""); // coma separada


const submit = () => {
if (!name.trim()) return;
const members = participants
.split(",")
.map((s) => s.trim())
.filter(Boolean);
onCreate?.({ name: name.trim(), description: description.trim(), members });
setName(""); setDescription(""); setParticipants("");
onClose?.();
};


return (
<Modal open={open} onClose={onClose} title="Nuevo grupo de trabajo" onSubmit={submit} disabled={!name.trim()} submitLabel="Crear grupo">
<div>
<label className="block text-sm font-medium">Nombre</label>
<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Team Space" />
</div>
<div>
<label className="block text-sm font-medium">Descripción</label>
<textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Equipo de desarrollo" />
</div>
<div>
<label className="block text-sm font-medium">Participantes (separados por coma)</label>
<input value={participants} onChange={(e) => setParticipants(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="Ana, Luis, Cris" />
</div>
</Modal>
);
}