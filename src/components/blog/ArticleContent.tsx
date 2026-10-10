"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Check,
  Copy,
  Terminal,
  Network,
  ArrowRight,
  ArrowDown,
  Code2,
  Eye,
} from "lucide-react";
import { MermaidDiagram } from "./MermaidDiagram";

interface ArticleContentProps {
  content: string;
}

export type ArchitectureStage = {
  title: string;
  flowSteps: string[];
  details: string[];
};

export function isAsciiDiagram(text: string): boolean {
  if (text.length < 25) return false;
  const hasBoxChars = /[┌┐└┘│─┼├┤┴┬▲▼◄►]/.test(text) || /\+[-=]{4,}\+/.test(text);
  const hasPipelinePointers = /->|-->|=>|▼|│/.test(text);
  const hasLayerKeywords = /layer|pipeline|system|flow|step|ingestion|retrieval|index|queue|database|worker|service|model/i.test(text);
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return lines.length >= 4 && (hasBoxChars || (hasPipelinePointers && hasLayerKeywords));
}

export function parseAsciiStages(text: string): ArchitectureStage[] {
  const lines = text.split("\n");
  const stages: ArchitectureStage[] = [];

  let currentTitle = "";
  let currentSteps: string[] = [];
  let currentDetails: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const isTopBorder = /[┌+]/.test(rawLine) && /[-─]{4,}/.test(rawLine);
    const isBottomBorder = /[└+]/.test(rawLine) && /[-─]{4,}/.test(rawLine);

    if (isTopBorder) {
      if (currentTitle || currentSteps.length > 0 || currentDetails.length > 0) {
        stages.push({
          title: currentTitle || `Pipeline Stage ${stages.length + 1}`,
          flowSteps: currentSteps,
          details: currentDetails,
        });
        currentTitle = "";
        currentSteps = [];
        currentDetails = [];
      }
      continue;
    }

    if (isBottomBorder) {
      if (currentTitle || currentSteps.length > 0 || currentDetails.length > 0) {
        stages.push({
          title: currentTitle || `Pipeline Stage ${stages.length + 1}`,
          flowSteps: currentSteps,
          details: currentDetails,
        });
        currentTitle = "";
        currentSteps = [];
        currentDetails = [];
      }
      continue;
    }

    // Strip perimeter borders
    const cleanLine = rawLine
      .replace(/^[│|]\s*/, "")
      .replace(/\s*[│|]$/, "")
      .trim();

    if (!cleanLine || /^[-─=+]{4,}$/.test(cleanLine)) continue;
    if (/^[│|▼v▲^]$/i.test(cleanLine)) continue;

    // First line is stage/layer title
    if (!currentTitle) {
      currentTitle = cleanLine.replace(/[┌┐└┘│─┼├┤┴┬]/g, "").trim();
    } else if (cleanLine.includes("->") || cleanLine.includes("-->") || cleanLine.includes("➔") || cleanLine.includes("├─>") || cleanLine.includes("─>")) {
      const parts = cleanLine
        .split(/->|-->|➔|├─>|─>/)
        .map((p) => p.replace(/[┌┐└┘│─┼├┤┴┬]/g, "").trim())
        .filter(Boolean);
      currentSteps.push(...parts);
    } else {
      const detail = cleanLine.replace(/[┌┐└┘│─┼├┤┴┬]/g, "").trim();
      if (detail) {
        currentDetails.push(detail);
      }
    }
  }

  if (currentTitle || currentSteps.length > 0 || currentDetails.length > 0) {
    stages.push({
      title: currentTitle || `Pipeline Stage ${stages.length + 1}`,
      flowSteps: currentSteps,
      details: currentDetails,
    });
  }

  return stages.filter((s) => s.title.length > 0 || s.flowSteps.length > 0);
}

const STAGE_THEMES = [
  {
    badge: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300",
    pill: "border-indigo-500/30 bg-slate-950/80 text-slate-100 hover:border-indigo-400/70 shadow-xs",
    arrow: "text-indigo-400/80",
    border: "border-slate-800/90 hover:border-indigo-500/50",
    accent: "text-indigo-400",
    pulse: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
    line: "bg-indigo-500/40",
  },
  {
    badge: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
    pill: "border-cyan-500/30 bg-slate-950/80 text-slate-100 hover:border-cyan-400/70 shadow-xs",
    arrow: "text-cyan-400/80",
    border: "border-slate-800/90 hover:border-cyan-500/50",
    accent: "text-cyan-400",
    pulse: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    line: "bg-cyan-500/40",
  },
  {
    badge: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    pill: "border-emerald-500/30 bg-slate-950/80 text-slate-100 hover:border-emerald-400/70 shadow-xs",
    arrow: "text-emerald-400/80",
    border: "border-slate-800/90 hover:border-emerald-500/50",
    accent: "text-emerald-400",
    pulse: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    line: "bg-emerald-500/40",
  },
  {
    badge: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    pill: "border-amber-500/30 bg-slate-950/80 text-slate-100 hover:border-amber-400/70 shadow-xs",
    arrow: "text-amber-400/80",
    border: "border-slate-800/90 hover:border-amber-500/50",
    accent: "text-amber-400",
    pulse: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    line: "bg-amber-500/40",
  },
];

function ArchitectureDiagramCard({
  stages,
  rawText,
}: {
  stages: ArchitectureStage[];
  rawText: string;
}) {
  const [viewMode, setViewMode] = useState<"visual" | "raw">("visual");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-8 rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-2xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900/90 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Network size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              System Architecture Flow
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              Interactive Multi-Stage Pipeline ({stages.length} Connected Phases)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "visual" ? "raw" : "visual")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {viewMode === "visual" ? (
              <>
                <Code2 size={13} className="text-indigo-400" />
                <span>View Raw ASCII</span>
              </>
            ) : (
              <>
                <Eye size={13} className="text-emerald-400" />
                <span>View Visual Flow</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy diagram text"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400 text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body View */}
      {viewMode === "visual" ? (
        <div className="p-5 sm:p-6 space-y-4">
          {stages.map((stage, idx) => {
            const theme = STAGE_THEMES[idx % STAGE_THEMES.length];
            return (
              <React.Fragment key={idx}>
                <div
                  className={`p-4 sm:p-5 rounded-xl bg-slate-900/60 border ${theme.border} transition-all shadow-sm`}
                >
                  {/* Stage Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-md border font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${theme.badge}`}
                      >
                        0{idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
                        {stage.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${theme.badge}`}
                    >
                      Phase 0{idx + 1}
                    </span>
                  </div>

                  {/* Flow Step Chips */}
                  {stage.flowSteps.length > 0 && (
                    <div className="my-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {stage.flowSteps.map((step, sIdx) => (
                          <React.Fragment key={sIdx}>
                            <span
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${theme.pill}`}
                            >
                              {step}
                            </span>
                            {sIdx < stage.flowSteps.length - 1 && (
                              <ArrowRight
                                size={14}
                                className={`${theme.arrow} shrink-0`}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {stage.details.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {stage.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="text-xs text-slate-300 font-sans bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80 leading-relaxed"
                        >
                          {detail}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Connecting Pipeline Indicator */}
                {idx < stages.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <div className="flex flex-col items-center">
                      <div className={`w-0.5 h-3 ${theme.line}`} />
                      <div className={`p-1 rounded-full border ${theme.pulse}`}>
                        <ArrowDown size={13} className="animate-pulse" />
                      </div>
                      <div className={`w-0.5 h-3 ${theme.line}`} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <pre className="p-5 overflow-x-auto text-xs sm:text-sm text-gray-200 font-mono leading-relaxed bg-gray-950">
          {rawText}
        </pre>
      )}
    </div>
  );
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children
  const rawText = React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");

  const language = className ? className.replace("language-", "") : "plaintext";

  // Check if this is a Mermaid diagram
  if (language === "mermaid") {
    return <MermaidDiagram code={rawText} />;
  }

  // Check if this is an ASCII architecture diagram
  if (isAsciiDiagram(rawText)) {
    const stages = parseAsciiStages(rawText);
    if (stages.length > 0) {
      return <ArchitectureDiagramCard stages={stages} rawText={rawText} />;
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-400">
        <span className="flex items-center gap-1.5 font-medium text-gray-300">
          <Terminal size={13} className="text-indigo-400" />
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-100 py-1 px-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-sans text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-gray-200 font-mono leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="article-rendered-body max-w-none text-gray-700 leading-relaxed space-y-6 pb-20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-sm text-gray-700" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-gray-100 bg-white" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="hover:bg-gray-50/70 transition-colors" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-5 py-3.5 font-semibold text-gray-900 text-xs tracking-wider" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-5 py-3.5 text-sm text-gray-700 align-top leading-normal" {...props} />
          ),
          pre: ({ children, ...props }) => {
            // Find code element inside pre
            const codeEl = React.isValidElement(children) ? children : null;
            if (codeEl) {
              const codeProps = codeEl.props as { className?: string; children?: React.ReactNode };
              return (
                <CodeBlock className={codeProps.className}>
                  {codeProps.children}
                </CodeBlock>
              );
            }
            return (
              <pre className="my-6 p-4 rounded-xl overflow-x-auto bg-gray-950 text-gray-200 font-mono text-xs sm:text-sm border border-gray-800" {...props}>
                {children}
              </pre>
            );
          },
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-gray-100 text-indigo-700 font-mono text-xs font-semibold border border-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ ...props }) => (
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mt-12 mb-6 pb-3 border-b border-gray-200" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-3" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-lg font-bold text-gray-900 mt-6 mb-2" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="my-6 pl-4 pr-3 py-3 border-l-4 border-indigo-600 bg-indigo-50/50 rounded-r-xl italic text-gray-800 text-base" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-2 text-gray-700 leading-relaxed text-base" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2 text-gray-700 leading-relaxed text-base" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="pl-1 leading-relaxed" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="my-4 text-base sm:text-lg leading-relaxed text-gray-700 font-normal" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-10 border-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
