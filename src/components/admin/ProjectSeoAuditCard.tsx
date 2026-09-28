"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Plus, Copy, Check, TrendingUp, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import type { ProjectAuditResult } from "@/app/api/admin/ai/project-audit/route";

interface ProjectSeoAuditCardProps {
  title: string;
  category: string;
  description: string;
  tags: string;
  liveUrl?: string;
  githubUrl?: string;
  onApplyTags: (newTags: string) => void;
  onApplyTitle?: (newTitle: string) => void;
}

export default function ProjectSeoAuditCard({
  title,
  category,
  description,
  tags,
  liveUrl,
  githubUrl,
  onApplyTags,
  onApplyTitle,
}: ProjectSeoAuditCardProps) {
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<ProjectAuditResult | null>(null);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());

  const runAudit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please enter a title and description before auditing.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai/project-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          tags,
          liveUrl,
          githubUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to audit project");
      }

      setAudit(data.audit);
      setAddedKeywords(new Set());
      toast.success("SEO Audit completed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to audit project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = (kw: string) => {
    const existing = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (existing.some((t) => t.toLowerCase() === kw.toLowerCase())) {
      toast("Keyword already in tags");
      return;
    }

    const updated = [...existing, kw].join(", ");
    onApplyTags(updated);
    setAddedKeywords((prev) => new Set(prev).add(kw));
    toast.success(`Added "${kw}"`);
  };

  const handleApplyAllKeywords = () => {
    if (!audit?.suggestedKeywords) return;
    const existing = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const toAdd = audit.suggestedKeywords.filter(
      (kw) => !existing.some((t) => t.toLowerCase() === kw.toLowerCase())
    );

    const updated = [...existing, ...toAdd].join(", ");
    onApplyTags(updated);
    setAddedKeywords(new Set(audit.suggestedKeywords));
    toast.success(`Applied ${toAdd.length} high-intent SEO keywords!`);
  };

  const copyMetaDescription = () => {
    if (!audit?.recommendedMetaDescription) return;
    navigator.clipboard.writeText(audit.recommendedMetaDescription);
    setCopiedDesc(true);
    toast.success("Meta description copied to clipboard");
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 p-6 rounded-2xl border border-gray-200 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">AI Project SEO & Audit Assistant</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Analyze title, description, and discover high-intent keywords to rank on Google.
          </p>
        </div>

        <button
          type="button"
          onClick={runAudit}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Auditing SEO...
            </>
          ) : (
            <>
              <TrendingUp size={16} />
              {audit ? "Re-Audit Project" : "Audit & Suggest Keywords"}
            </>
          )}
        </button>
      </div>

      {/* Audit Results View */}
      {audit && (
        <div className="mt-6 space-y-6 animate-fadeIn">
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`text-2xl font-black px-4 py-2 rounded-xl border ${getScoreColor(
                  audit.score
                )}`}
              >
                {audit.score}/100
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{audit.rating}</span>
                  <span className="text-xs text-gray-400">• Search Readiness</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 max-w-xl">{audit.summary}</p>
              </div>
            </div>

            {audit.suggestedTitle && onApplyTitle && (
              <div className="sm:text-right">
                <button
                  type="button"
                  onClick={() => onApplyTitle(audit.suggestedTitle!)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 sm:justify-end"
                >
                  <Sparkles size={12} /> Apply Suggested Title
                </button>
                <p className="text-[11px] text-gray-500 italic mt-0.5 truncate max-w-xs">
                  &ldquo;{audit.suggestedTitle}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* High Intent Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-600" />
                Target SEO Keywords (Click to add to Tags)
              </label>
              <button
                type="button"
                onClick={handleApplyAllKeywords}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Add All ({audit.suggestedKeywords.length})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {audit.suggestedKeywords.map((kw, i) => {
                const isAdded = addedKeywords.has(kw) || tags.toLowerCase().includes(kw.toLowerCase());
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddKeyword(kw)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isAdded
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-400 hover:text-indigo-600 shadow-xs"
                    }`}
                  >
                    {isAdded ? <Check size={12} /> : <Plus size={12} />}
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommended Meta Description */}
          {audit.recommendedMetaDescription && (
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <ShieldCheck size={14} className="text-gray-500" />
                  Recommended Search Snippet (Meta Description)
                </span>
                <button
                  type="button"
                  onClick={copyMetaDescription}
                  className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 font-medium"
                >
                  {copiedDesc ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  {copiedDesc ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-gray-200">
                {audit.recommendedMetaDescription}
              </p>
            </div>
          )}

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" /> What Works Well
              </h4>
              <ul className="space-y-1.5">
                {audit.strengths.map((item, i) => (
                  <li key={i} className="text-xs text-emerald-800 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100">
              <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-amber-600" /> Recommendations to Rank
              </h4>
              <ul className="space-y-1.5">
                {audit.recommendations.map((item, i) => (
                  <li key={i} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
