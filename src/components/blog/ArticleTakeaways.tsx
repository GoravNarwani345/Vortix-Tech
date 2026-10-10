"use client";

import React from "react";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";

interface ArticleTakeawaysProps {
  takeaways?: string[];
  readTime?: string;
}

export function ArticleTakeaways({ takeaways, readTime }: ArticleTakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null;

  return (
    <div className="my-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border border-blue-100/90 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
            <BookOpen size={16} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
              Key Engineering Takeaways
            </h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Core architectural findings summary
            </p>
          </div>
        </div>

        {readTime && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/70 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
            <Clock size={12} className="text-blue-700" />
            <span>{readTime} Full Read</span>
          </span>
        )}
      </div>

      <ul className="space-y-2.5 pt-1">
        {takeaways.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
