"use client";

import React from "react";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";

export type CalloutType = "note" | "milestone" | "caveat";

interface ArticleCalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const CALLOUT_CONFIGS: Record<
  CalloutType,
  {
    icon: React.ReactNode;
    defaultTitle: string;
    containerClass: string;
    borderClass: string;
    titleColor: string;
  }
> = {
  note: {
    icon: <Lightbulb size={16} className="text-blue-600" />,
    defaultTitle: "Architectural Note",
    containerClass: "bg-blue-50/60 border-blue-200 text-blue-950",
    borderClass: "border-l-4 border-l-blue-600",
    titleColor: "text-blue-900",
  },
  milestone: {
    icon: <TrendingUp size={16} className="text-emerald-600" />,
    defaultTitle: "Engineering Milestone",
    containerClass: "bg-emerald-50/60 border-emerald-200 text-emerald-950",
    borderClass: "border-l-4 border-l-emerald-600",
    titleColor: "text-emerald-900",
  },
  caveat: {
    icon: <AlertTriangle size={16} className="text-amber-600" />,
    defaultTitle: "Production Caveat",
    containerClass: "bg-amber-50/60 border-amber-200 text-amber-950",
    borderClass: "border-l-4 border-l-amber-600",
    titleColor: "text-amber-900",
  },
};

export function ArticleCallout({ type = "note", title, children }: ArticleCalloutProps) {
  const config = CALLOUT_CONFIGS[type] || CALLOUT_CONFIGS.note;

  return (
    <aside
      className={`my-6 p-4 sm:p-5 rounded-2xl border shadow-2xs transition-all ${config.containerClass} ${config.borderClass}`}
      role="note"
    >
      <div className="flex items-center gap-2 mb-2 font-bold text-xs sm:text-sm">
        <span className="p-1 rounded-lg bg-white shadow-2xs border border-gray-100">
          {config.icon}
        </span>
        <span className={config.titleColor}>{title || config.defaultTitle}</span>
      </div>
      <div className="text-xs sm:text-sm leading-relaxed text-gray-800 space-y-2">
        {children}
      </div>
    </aside>
  );
}
