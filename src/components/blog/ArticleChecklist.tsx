"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, RotateCcw, Award } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  defaultChecked?: boolean;
}

interface ArticleChecklistProps {
  storageKey?: string;
  title?: string;
  items: ChecklistItem[];
}

export function ArticleChecklist({
  storageKey = "article-checklist-default",
  title = "Architecture & Evaluation Checklist",
  items,
}: ArticleChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCheckedMap(JSON.parse(saved));
      } else {
        const initial: Record<string, boolean> = {};
        items.forEach((item) => {
          if (item.defaultChecked) initial[item.id] = true;
        });
        setCheckedMap(initial);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey, items]);

  const toggleItem = (id: string) => {
    const updated = { ...checkedMap, [id]: !checkedMap[id] };
    setCheckedMap(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleReset = () => {
    setCheckedMap({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  const completedCount = items.filter((item) => Boolean(checkedMap[item.id])).length;
  const percentage = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="my-8 p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <CheckSquare size={18} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{title}</h3>
            <p className="text-[11px] text-gray-500">
              Interactive audit checklist · Auto-saved locally
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {completedCount}/{items.length} Completed ({percentage}%)
          </span>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Reset checklist"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Animated Completion Progress Bar */}
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5 pt-1">
        {items.map((item) => {
          const isChecked = mounted && Boolean(checkedMap[item.id]);
          return (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isChecked
                  ? "bg-emerald-50/40 border-emerald-200/80 shadow-2xs"
                  : "bg-gray-50/50 border-gray-200/60 hover:bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 w-4 h-4 rounded-md text-emerald-600 border-gray-300 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer accent-emerald-600"
              />
              <span
                className={`text-xs sm:text-sm leading-relaxed transition-all ${
                  isChecked
                    ? "text-gray-500 line-through font-normal"
                    : "text-gray-800 font-medium"
                }`}
              >
                {item.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Completion Badge */}
      {percentage === 100 && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <Award size={16} className="text-emerald-600" />
          <span>All production verification milestones completed! Excellent work.</span>
        </div>
      )}
    </div>
  );
}
