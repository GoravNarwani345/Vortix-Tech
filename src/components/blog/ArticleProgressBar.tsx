"use client";

import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Clock } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ArticleProgressBarProps {
  totalReadMinutes?: number;
}

export function ArticleProgressBar({ totalReadMinutes = 8 }: ArticleProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(totalReadMinutes);
  const [isVisible, setIsVisible] = useState(false);

  useGSAP(() => {
    if (!barRef.current) return;

    const trigger = ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = Math.round(self.progress * 100);
        setProgress(p);

        // Animate the bar width smoothly
        gsap.to(barRef.current, {
          width: `${p}%`,
          duration: 0.1,
          ease: "none",
        });

        // Calculate time remaining
        const remaining = Math.max(1, Math.round(totalReadMinutes * (1 - self.progress)));
        setTimeRemaining(remaining);
        setIsVisible(self.progress > 0.02 && self.progress < 0.99);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [totalReadMinutes]);

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-100/50 backdrop-blur-xs pointer-events-none">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
          style={{ width: "0%" }}
        />
      </div>

      {/* Floating Reading Progress Pill */}
      {isVisible && (
        <div className="fixed top-3 right-4 z-40 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/90 text-white text-[11px] font-mono shadow-lg border border-gray-800 backdrop-blur-md transition-all duration-300 animate-in fade-in">
          <Clock size={12} className="text-cyan-400" />
          <span>{timeRemaining}m left</span>
          <span className="text-gray-500">•</span>
          <span className="text-cyan-400 font-semibold">{progress}%</span>
        </div>
      )}
    </>
  );
}
