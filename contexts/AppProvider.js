import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from '../lib/storage';
import { uid } from '../lib/ids';


// Tipos (JSDoc)
/**
* @typedef {'owner'|'admin'|'member'|'viewer'} Role
* @typedef {'todo'|'in_progress'|'done'|'late'} TaskState
* @typedef {{ id:string, name:string, role:Role }} Member
* @typedef {{ id:string, text:string, done:boolean }} ChecklistItem
* @typedef {{ id:string, taskId:string, text:string, createdAt:number }} Comment
* @typedef {{ id:string, projectId:string, title:string, description?:string, assignees:string[], priority:'low'|'medium'|'high'|'urgent', dueDate?:string, labels:string[], checklist:ChecklistItem[], state:TaskState }} Task
* @typedef {{ id:string, name:string, members:Member[] }} Workspace
* @typedef {{ id:string, workspaceId:string, name:string, participants:string[] }} Project
*/

const defaultState = () => {
const w1 = { id: uid(), name: 'Workspace Demo', members: [{ id: uid(), name: 'Cris', role: 'owner' }] };
const p1 = { id: uid(), workspaceId: w1.id, name: 'Proyecto Inicial', participants: [w1.members[0].id] };
const t1 = {
id: uid(), projectId: p1.id, title: 'Configurar Expo Router', description: 'Navegación básica',
assignees: [w1.members[0].id], priority: 'medium', dueDate: undefined, labels: ['setup'],
checklist: [{ id: uid(), text: 'Crear _layout', done: true }], state: 'in_progress'
};
const t2 = { id: uid(), projectId: p1.id, title: 'Diseñar Kanban', assignees: [], priority: 'high', labels: ['ui'], checklist: [], state: 'todo' };
return {
user: null, // {id,name}
workspaces: [w1],
projects: [p1],
tasks: [t1, t2],
comments: [],
};
};

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);


export function AppProvider({ children }) {
const [state, setState] = useState(null);
const [ready, setReady] = useState(false);


useEffect(() => { (async () => {
const loaded = await loadState();
setState(loaded || defaultState());
setReady(true);
})(); }, []);


useEffect(() => { if (ready && state) saveState(state); }, [state, ready]);


// Auth (simulada)
const login = (name) => setState(s => ({ ...s, user: { id: uid(), name } }));
const logout = () => setState(s => ({ ...s, user: null }));


// Workspaces
const createWorkspace = (name) => setState(s => ({ ...s, workspaces: [...s.workspaces, { id: uid(), name, members: [] }] }));
const updateWorkspace = (id, patch) => setState(s => ({ ...s, workspaces: s.workspaces.map(w => w.id===id?{...w,...patch}:w) }));
const removeWorkspace = (id) => setState(s => ({ ...s,
workspaces: s.workspaces.filter(w=>w.id!==id),
projects: s.projects.filter(p=>p.workspaceId!==id),
tasks: s.tasks.filter(t=> s.projects.find(p=>p.workspaceId===id && p.id===t.projectId)===undefined),
}));
const addMember = (workspaceId, name, role) => setState(s => ({ ...s,
workspaces: s.workspaces.map(w=> w.id===workspaceId ? { ...w, members: [...w.members, { id: uid(), name, role }] } : w)
}));


// Projects
const createProject = (workspaceId, name) => setState(s => ({ ...s, projects: [...s.projects, { id: uid(), workspaceId, name, participants: [] }] }));
const updateProject = (id, patch) => setState(s => ({ ...s, projects: s.projects.map(p => p.id===id?{...p,...patch}:p) }));
const removeProject = (id) => setState(s => ({ ...s,
projects: s.projects.filter(p=>p.id!==id),
tasks: s.tasks.filter(t=>t.projectId!==id)
}));


// Tasks
const createTask = (projectId, title) => setState(s => ({ ...s, tasks: [...s.tasks, { id: uid(), projectId, title, description:'', assignees:[], priority:'medium', dueDate: undefined, labels:[], checklist:[], state:'todo' }] }));
const updateTask = (id, patch) => setState(s => ({ ...s, tasks: s.tasks.map(t=> t.id===id?{...t,...patch}:t) }));
const removeTask = (id) => setState(s => ({ ...s, tasks: s.tasks.filter(t=>t.id!==id), comments: s.comments.filter(c=>c.taskId!==id) }));
const addComment = (taskId, text) => setState(s => ({ ...s, comments: [...s.comments, { id: uid(), taskId, text, createdAt: Date.now() }] }));


const value = useMemo(()=>({ state, ready,
login, logout,
createWorkspace, updateWorkspace, removeWorkspace, addMember,
createProject, updateProject, removeProject,
createTask, updateTask, removeTask, addComment
}),[state,ready]);


return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}