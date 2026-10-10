"use client";

import React, { useEffect, useState, useId } from "react";
import { Check, Copy, Network, Code2, Eye, Loader2 } from "lucide-react";

interface MermaidDiagramProps {
  code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      setIsLoading(true);
      setError(null);
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "inherit",
          themeVariables: {
            darkMode: true,
            background: "#0b0f19",
            primaryColor: "#312e81",
            primaryTextColor: "#f8fafc",
            primaryBorderColor: "#6366f1",
            lineColor: "#818cf8",
            secondaryColor: "#1e1b4b",
            tertiaryColor: "#0f172a",
            noteBkgColor: "#1e293b",
            noteTextColor: "#cbd5e1",
          },
        });

        const { svg: renderedSvg } = await mermaid.render(diagramId, code.trim());
        if (isMounted) {
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to render Mermaid diagram");
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
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
              Vector Architecture Flowchart
            </span>
            <span className="text-[11px] text-slate-400 font-sans">
              Compiled via Mermaid.js Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!error && (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "visual" ? "code" : "visual")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            >
              {viewMode === "visual" ? (
                <>
                  <Code2 size={13} className="text-indigo-400" />
                  <span>View Mermaid Code</span>
                </>
              ) : (
                <>
                  <Eye size={13} className="text-emerald-400" />
                  <span>View Flowchart SVG</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy diagram code"
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

      {/* Body */}
      {viewMode === "visual" && !error ? (
        <div className="p-6 overflow-x-auto flex items-center justify-center min-h-[160px] bg-slate-950/70">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
              <Loader2 size={16} className="animate-spin text-indigo-400" />
              <span>Compiling vector flowchart SVG...</span>
            </div>
          ) : (
            <div
              className="mermaid-svg-container w-full max-w-full overflow-x-auto flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      ) : (
        <div>
          {error && (
            <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-900/50 text-amber-300 text-xs font-mono">
              Notice: Syntax fallback display ({error})
            </div>
          )}
          <pre className="p-5 overflow-x-auto text-xs sm:text-sm text-gray-200 font-mono leading-relaxed bg-gray-950">
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
