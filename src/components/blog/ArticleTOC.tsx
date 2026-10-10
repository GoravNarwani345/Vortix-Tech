"use client";

import React, { useEffect, useState } from "react";
import { List, ChevronRight, X, BookmarkCheck } from "lucide-react";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTOCProps {
  headings?: TOCItem[];
  content?: string;
}

export function extractHeadingsFromMarkdown(content: string): TOCItem[] {
  if (!content) return [];
  const lines = content.split("\n");
  const items: TOCItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace(/^##\s+/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      items.push({ id, text, level: 2 });
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.replace(/^###\s+/, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      items.push({ id, text, level: 3 });
    }
  }

  return items;
}

export function ArticleTOC({ headings: initialHeadings, content }: ArticleTOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>(initialHeadings || []);
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if ((!initialHeadings || initialHeadings.length === 0) && content) {
      setHeadings(extractHeadingsFromMarkdown(content));
    }
  }, [initialHeadings, content]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible heading closest to the top of viewport
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top distance
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  if (headings.length < 2) return null;

  return (
    <>
      {/* DESKTOP SIDEBAR TOC */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto p-5 rounded-2xl bg-white border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <List size={14} className="text-blue-600" />
              Table of Contents
            </h4>
            <span className="text-[10px] font-semibold text-gray-600 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100">
              {headings.length} Sections
            </span>
          </div>

          <nav className="space-y-1 text-xs">
            {headings.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-lg transition-all flex items-start gap-2 ${
                    item.level === 3 ? "pl-5 text-gray-600" : "font-medium"
                  } ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold shadow-2xs border-l-2 border-blue-600"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate leading-snug">{item.text}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* MOBILE FLOATING TOC BUTTON */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-3.5 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black transition-all flex items-center gap-2 text-xs font-bold border border-gray-800"
          aria-label="Open Table of Contents"
        >
          <List size={16} className="text-cyan-400" />
          <span className="pr-1">TOC</span>
        </button>
      </div>

      {/* MOBILE DRAWER MODAL */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl max-h-[80vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookmarkCheck size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-sm">Table of Contents</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-1 py-1 max-h-[60vh]">
              {headings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`w-full text-left py-2 px-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                      item.level === 3 ? "pl-6 text-gray-500" : "font-medium"
                    } ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate">{item.text}</span>
                    <ChevronRight size={14} className={isActive ? "text-blue-600" : "text-gray-300"} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
