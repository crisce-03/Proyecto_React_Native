// src/lib/reminders.js
import { sendTaskReminderEmail } from "./email";

// Mapa de timeouts por tarea
const timeouts = new Map();

/**
 * Programa un recordatorio para una tarea.
 * - tasks: array de tareas visibles (del proyecto activo).
 * - notifyEmail: correo al que se enviará el aviso.
 * - minutesBefore: cuántos minutos antes del vencimiento avisar (default 30).
 */
export function scheduleAllReminders(tasks, notifyEmail, minutesBefore = 30, projectName = "Proyecto") {
  // Cancela timers de tareas que ya no están o cambiaron
  const idsActuales = new Set(tasks.map(t => t.id));
  for (const [id, to] of timeouts.entries()) {
    if (!idsActuales.has(id)) {
      clearTimeout(to);
      timeouts.delete(id);
    }
  }

  for (const t of tasks) {
    scheduleReminderForTask(t, notifyEmail, minutesBefore, projectName);
  }
}

export function cancelReminderForTask(taskId) {
  const to = timeouts.get(taskId);
  if (to) {
    clearTimeout(to);
    timeouts.delete(taskId);
  }
}

function alreadyNotifiedKey(task) {
  // Marca por id + dueAt para reprogramar si dueAt cambia
  return `task_notified_${task.id}_${task.dueAt || task.dueDate || "nodue"}`;
}

export function scheduleReminderForTask(task, notifyEmail, minutesBefore = 30, projectName = "Proyecto") {
  const dueAt = task?.dueAt || task?.dueDate;
  if (!dueAt || !notifyEmail) {
    cancelReminderForTask(task.id);
    return;
  }

  const key = alreadyNotifiedKey(task);
  if (localStorage.getItem(key)) {
    // Ya enviado para esta (id + dueAt)
    return;
  }

  // Calcula cuándo avisar
  const fireMs = new Date(dueAt).getTime() - Date.now() - minutesBefore * 60 * 1000;

  // Si ya pasó la ventana, dispara inmediato (con tolerancia de 24h)
  if (fireMs <= 0 && Date.now() - new Date(dueAt).getTime() <= 24 * 60 * 60 * 1000) {
    sendTaskReminderEmail({
      to: notifyEmail,
      taskTitle: task.title || "(sin título)",
      projectName,
      dueAt
    }).then(() => {
      localStorage.setItem(key, "1");
    }).catch(console.error);
    return;
  }

  // Si es muy lejano o negativo (y fuera de tolerancia), no programar
  if (fireMs <= 0) return;

  // Programa el timeout
  cancelReminderForTask(task.id);
  const to = setTimeout(async () => {
    try {
      await sendTaskReminderEmail({
        to: notifyEmail,
        taskTitle: task.title || "(sin título)",
        projectName,
        dueAt
      });
      localStorage.setItem(key, "1");
    } catch (err) {
      console.error("Error enviando recordatorio:", err);
    } finally {
      timeouts.delete(task.id);
    }
  }, fireMs);

  timeouts.set(task.id, to);
}
