"use client";

import React, { useState } from "react";
import { Layers, Cpu, Server, Globe, FileCode, Tag } from "lucide-react";

interface BlogCardImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  variant?: "featured" | "grid" | "detail";
  className?: string;
}

function getCategoryIcon(category?: string) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ai") || cat.includes("agent") || cat.includes("rag")) {
    return <Cpu size={28} className="text-cyan-400" />;
  }
  if (cat.includes("cloud") || cat.includes("devops") || cat.includes("infra")) {
    return <Server size={28} className="text-blue-400" />;
  }
  if (cat.includes("web") || cat.includes("full-stack") || cat.includes("frontend")) {
    return <Globe size={28} className="text-emerald-400" />;
  }
  if (cat.includes("api") || cat.includes("backend") || cat.includes("code")) {
    return <FileCode size={28} className="text-purple-400" />;
  }
  return <Layers size={28} className="text-blue-400" />;
}

export function BlogCardImage({
  src,
  alt,
  category,
  variant = "grid",
  className = "",
}: BlogCardImageProps) {
  const [hasError, setHasError] = useState(false);
  const isValidSrc = Boolean(src && typeof src === "string" && src.trim().length > 0 && !hasError);

  if (isValidSrc) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-gray-900 ${className}`}>
        <img
          src={src as string}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors pointer-events-none" />
      </div>
    );
  }

  // Branded Architectural Fallback Graphic
  const isFeatured = variant === "featured";
  const isDetail = variant === "detail";

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800/80 overflow-hidden select-none ${className}`}
    >
      {/* Subtle architectural background pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"
      />
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-blue-500/10 text-cyan-400 border border-blue-500/20 backdrop-blur-xs">
          <Tag size={12} />
          {category || "Engineering"}
        </span>
        <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-xs">
          {getCategoryIcon(category)}
        </div>
      </div>

      {/* Center / Bottom Title Typography */}
      <div className="relative z-10 mt-auto pt-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold block mb-1">
          Technical Publication
        </span>
        <h4
          className={`font-serif font-bold text-slate-100 leading-tight line-clamp-3 group-hover:text-cyan-300 transition-colors ${
            isFeatured ? "text-xl sm:text-2xl" : isDetail ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"
          }`}
        >
          {alt}
        </h4>
      </div>
    </div>
  );
}
