import React, { useState, useEffect, useRef } from "react";
import { X, Calendar, Flag, Tag, User, Save, Trash2, FileText, Link, UserPlus, Check } from "lucide-react";
import type { Task, Member } from "../types";
import { useBoardStore } from "../store/boardStore";

interface TaskModalProps {
  task: Task | null;
  members: Member[];
  onClose: () => void;
  defaultColumnId?: string;
  columns: { id: string; title: string }[];
}

export default function TaskModal({ task, members, onClose, defaultColumnId, columns }: TaskModalProps) {
  const { updateTask, deleteTask, addTask, addMember } = useBoardStore();
  const isNew = !task;

  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate ?? "",
    assigneeId: task?.assigneeId ?? members[0]?.id ?? "",
    columnId: task?.columnId ?? defaultColumnId ?? columns[0]?.id ?? "",
    tags: task?.tags?.join(", ") ?? "",
    liveLink: task?.liveLink ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [addingPerson, setAddingPerson] = useState(false);
  const newPersonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (showAddPerson) newPersonRef.current?.focus();
  }, [showAddPerson]);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description,
      priority: form.priority as Task["priority"],
      dueDate: form.dueDate,
      assigneeId: form.assigneeId,
      columnId: form.columnId,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      liveLink: form.liveLink.trim() || undefined,
    };
    if (isNew) await addTask(payload);
    else await updateTask(task.id, payload);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (task) { await deleteTask(task.id); onClose(); }
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    setAddingPerson(true);
    try {
      const member = await addMember(newPersonName.trim());
      setForm(s => ({ ...s, assigneeId: member.id }));
      setNewPersonName("");
      setShowAddPerson(false);
    } finally {
      setAddingPerson(false);
    }
  };

  const currentMembers = useBoardStore(s => s.members);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg animate-fade-up">
        <div className="rounded-2xl border border-border bg-panel shadow-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-display font-700 text-lg text-white">
              {isNew ? "Create Task" : "Edit Task"}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface text-gray-500 hover:text-gray-300 transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <FileText size={12} /> Title *
              </label>
              <input
                autoFocus
                type="text"
                value={form.title}
                onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                placeholder="Task title..."
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <FileText size={12} /> Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                placeholder="Add a description..."
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {/* Row: Priority + Column */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                  <Flag size={12} /> Priority
                </label>
                <select
                  value={form.priority}
                  onChange={e => setForm(s => ({ ...s, priority: e.target.value as Task["priority"] }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 focus:outline-none focus:border-accent cursor-pointer"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                  Column
                </label>
                <select
                  value={form.columnId}
                  onChange={e => setForm(s => ({ ...s, columnId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 focus:outline-none focus:border-accent cursor-pointer"
                >
                  {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
            </div>

            {/* Due Date — full width */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <Calendar size={12} /> Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(s => ({ ...s, dueDate: e.target.value }))}
                style={{ colorScheme: "dark" }}
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 focus:outline-none focus:border-accent cursor-pointer"
              />
            </div>

            {/* Assignee — chip selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                <User size={12} /> Assignee
              </label>
              <div className="flex flex-wrap gap-2">
                {currentMembers.map(m => {
                  const selected = form.assigneeId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setForm(s => ({ ...s, assigneeId: m.id }))}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition-all ${
                        selected
                          ? "border-accent bg-accent/15 text-white"
                          : "border-border bg-surface text-gray-400 hover:border-accent/40 hover:text-gray-200"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                        style={{ background: m.color }}
                      >
                        {m.avatar}
                      </span>
                      {m.name}
                      {selected && <Check size={10} className="text-accent-light" />}
                    </button>
                  );
                })}

                {/* Add new person */}
                {!showAddPerson ? (
                  <button
                    type="button"
                    onClick={() => setShowAddPerson(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border border-dashed border-border text-gray-500 hover:border-accent/50 hover:text-accent-light transition-all"
                  >
                    <UserPlus size={11} /> Add person
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 w-full mt-1">
                    <input
                      ref={newPersonRef}
                      type="text"
                      value={newPersonName}
                      onChange={e => setNewPersonName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddPerson();
                        if (e.key === "Escape") { setShowAddPerson(false); setNewPersonName(""); }
                      }}
                      placeholder="Full name..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-surface border border-accent/40 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddPerson}
                      disabled={!newPersonName.trim() || addingPerson}
                      className="px-3 py-1.5 rounded-lg text-xs bg-accent hover:bg-accent/80 text-white font-medium transition-all disabled:opacity-50"
                    >
                      {addingPerson ? "..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddPerson(false); setNewPersonName(""); }}
                      className="px-2 py-1.5 rounded-lg text-xs border border-border text-gray-500 hover:text-gray-300 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <Tag size={12} /> Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={e => setForm(s => ({ ...s, tags: e.target.value }))}
                placeholder="design, frontend, backend..."
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Live Link */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
                <Link size={12} /> Project Live Link
              </label>
              <input
                type="url"
                value={form.liveLink}
                onChange={e => setForm(s => ({ ...s, liveLink: e.target.value }))}
                placeholder="https://your-project.com"
                className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            {!isNew ? (
              <button onClick={handleDelete} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all">
                <Trash2 size={14} /> Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 border border-border hover:border-accent/30 transition-all">Cancel</button>
              <button
                onClick={handleSave}
                disabled={!form.title.trim() || saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-accent hover:bg-accent/80 text-white font-medium transition-all shadow-glow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? "Saving..." : isNew ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
