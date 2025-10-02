// lib/email.js
import emailjs from "@emailjs/browser";

// ⚙️ Pon tus IDs reales aquí
const SERVICE_ID  = "service_pievqgk";
const TEMPLATE_ID = "template_00hedfk";
const PUBLIC_KEY  = "ZJUMGLmUq6DKWML6W";

export async function sendTaskReminderEmail({ to, taskTitle, projectName, dueAt }) {
  const dueLocal = new Date(dueAt).toLocaleString();

  // Asegúrate de que los nombres coincidan con las variables de tu template:
  // {{to_email}}, {{task_title}}, {{project_name}}, {{due_local}}
  return emailjs.send(
    SERVICE_ID,
    TEMPLATE_ID,
    {
      to_email: to,
      task_title: taskTitle,
      project_name: projectName ?? "Proyecto",
      due_local: dueLocal,
    },
    { publicKey: PUBLIC_KEY } // <- con @emailjs/browser puedes pasar opciones así
  );
}