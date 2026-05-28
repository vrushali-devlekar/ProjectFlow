import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { useBoardStore } from "../store/boardStore";

interface AddColumnModalProps { onClose: () => void }

const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#06b6d4","#f43f5e","#8b5cf6","#84cc16"];

export default function AddColumnModal({ onClose }: AddColumnModalProps) {
  const { addColumn } = useBoardStore();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addColumn(title.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-panel shadow-card animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-display font-700 text-white">Add Column</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface text-gray-500 transition-all"><X size={15}/></button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          <input
            autoFocus
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Column name..."
            className="w-full px-3 py-2.5 rounded-lg bg-surface border border-border text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent"
          />
          <div>
            <p className="text-xs text-gray-500 mb-2">Color</p>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-white/30" : "hover:scale-110"}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-5">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 border border-border">Cancel</button>
          <button onClick={handleAdd} disabled={!title.trim()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-accent hover:bg-accent/80 text-white disabled:opacity-50">
            <Plus size={14}/>Add Column
          </button>
        </div>
      </div>
    </div>
  );
}
