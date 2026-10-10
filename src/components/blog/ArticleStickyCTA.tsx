"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ArrowRight, X } from "lucide-react";

export function ArticleStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = window.scrollY / scrollHeight;

      if (progress >= 0.38 && progress <= 0.92) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <aside
      aria-label="Engineering consultation"
      className="fixed bottom-6 left-6 z-40 max-w-sm hidden md:block animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xl relative overflow-hidden">
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss consultation prompt"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3 pr-4">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <MessageSquare size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 leading-tight">
              Building Complex AI & Cloud Architecture?
            </h4>
            <p className="text-[11px] text-gray-500 mt-1 leading-snug">
              Consult with Vortix Tech engineers on custom agent workflows, RAG pipelines, and cloud scale.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors"
              >
                <span>Book Consultation</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
