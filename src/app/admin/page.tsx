"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MessageSquare,
  Briefcase,
  FileText,
  Star,
  Sparkles,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Zap,
  Sliders,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type OverviewData = {
  stats: {
    totalFeedbacks: number;
    newFeedbacksCount: number;
    totalProjects: number;
    totalArticles: number;
    totalTestimonials: number;
    aiKnowledge: {
      lastSyncedAt: string | null;
      totalChars: number;
      estimatedTokens: number;
      model: string;
      hasApiKey: boolean;
    };
  };
  recentFeedbacks: Array<{
    id: string;
    name: string;
    email: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    category: string;
    isPublished: boolean;
    createdAt: string;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    category: string;
    slug: string;
    createdAt: string;
    isPublished: boolean;
  }>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingAi, setSyncingAi] = useState(false);

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin/overview");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error("Failed to load dashboard overview data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
  }, []);

  const handleSyncAiNow = async () => {
    setSyncingAi(true);
    try {
      const res = await fetch("/api/admin/ai/sync", { method: "POST" });
      if (res.ok) {
        toast.success("AI website knowledge synced successfully!");
        await fetchOverview();
      } else {
        toast.error("Sync failed");
      }
    } catch {
      toast.error("Failed to sync AI");
    } finally {
      setSyncingAi(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return (
          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
            New
          </span>
        );
      case "In Progress":
        return (
          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold">
            In Progress
          </span>
        );
      case "Resolved":
        return (
          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live & Healthy
            </span>
          </div>
          <p className="text-foreground-muted text-sm mt-1">
            Welcome back to Vortix Tech control center. Here is what is happening across your platform today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              void fetchOverview();
            }}
            className="p-2.5 bg-card-bg border border-card-border hover:bg-card-border/40 text-foreground rounded-xl transition-all shadow-sm"
            title="Refresh statistics"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-accent" : ""} />
          </button>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-4 py-2.5 bg-card-bg border border-card-border hover:bg-card-border/40 text-foreground font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            <Sliders size={16} className="text-accent" />
            AI & Settings
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white font-medium text-sm rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            New Project
          </Link>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex flex-col items-center justify-center p-20 text-foreground-muted">
          <Loader2 className="animate-spin text-accent mb-4" size={40} />
          <p className="text-sm font-medium">Aggregating platform metrics & insights...</p>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feedback / Leads */}
            <Link
              href="/admin/feedback"
              className="group p-5 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Client Inquiries
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  {data?.stats.totalFeedbacks ?? 0}
                </span>
                {data?.stats.newFeedbacksCount ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-accent border border-accent/20">
                    +{data.stats.newFeedbacksCount} New
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1 group-hover:text-accent transition-colors">
                Manage contact form leads <ChevronRight size={14} />
              </p>
            </Link>

            {/* Portfolio Projects */}
            <Link
              href="/admin/portfolio"
              className="group p-5 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Portfolio Projects
                </span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {data?.stats.totalProjects ?? 0}
              </div>
              <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1 group-hover:text-accent transition-colors">
                Live case studies & showcase <ChevronRight size={14} />
              </p>
            </Link>

            {/* Blog Articles */}
            <Link
              href="/admin/blog"
              className="group p-5 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  Published Articles
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {data?.stats.totalArticles ?? 0}
              </div>
              <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1 group-hover:text-accent transition-colors">
                AI blog studio & SEO posts <ChevronRight size={14} />
              </p>
            </Link>

            {/* AI Knowledge Base */}
            <Link
              href="/admin/settings"
              className="group p-5 rounded-2xl bg-card-bg border border-card-border hover:border-accent/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                  AI Website Knowledge
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  ~{data?.stats.aiKnowledge.estimatedTokens.toLocaleString() ?? "1,450"}
                </span>
                <span className="text-xs font-normal text-foreground-muted">tokens</span>
              </div>
              <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1 group-hover:text-accent transition-colors">
                Daily auto-synced context <ChevronRight size={14} />
              </p>
            </Link>
          </div>

          {/* AI Knowledge & Quick Actions Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-md">
                  <Zap size={14} className="text-amber-400" />
                  <span>Google Gemini 2.5 Active Intelligence</span>
                </div>
                <h2 className="text-xl font-bold">
                  Your AI Assistant is continuously trained on your whole website.
                </h2>
                <p className="text-sm text-blue-200 leading-relaxed">
                  Every project, blog post, and service you add is compiled into the AI knowledge base. It responds accurately to visitor questions on the public website.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-blue-300 pt-1">
                  <span>Model: <strong>{data?.stats.aiKnowledge.model || "gemini-2.5-flash"}</strong></span>
                  <span>•</span>
                  <span>
                    Last Synced:{" "}
                    <strong>
                      {data?.stats.aiKnowledge.lastSyncedAt
                        ? new Date(data.stats.aiKnowledge.lastSyncedAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Ready"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Schedule: <strong>Daily Auto-Sync</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={handleSyncAiNow}
                  disabled={syncingAi}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all"
                >
                  <RefreshCw size={16} className={syncingAi ? "animate-spin text-accent" : ""} />
                  {syncingAi ? "Re-compiling Knowledge..." : "Sync AI Now"}
                </button>
                <Link
                  href="/admin/settings"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  Audit AI Hub <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Grid: Recent Inquiries + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Leads & Inquiries (2 Columns on Desktop) */}
            <div className="lg:col-span-2 rounded-2xl bg-card-bg border border-card-border overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="p-6 border-b border-card-border flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <MessageSquare size={18} className="text-accent" />
                      Recent Inquiries & Contact Form Submissions
                    </h2>
                    <p className="text-foreground-muted text-xs mt-0.5">
                      Prospective clients reaching out via your website drawer
                    </p>
                  </div>
                  <Link
                    href="/admin/feedback"
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    View All ({data?.stats.totalFeedbacks ?? 0}) <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background text-xs uppercase text-foreground-muted border-b border-card-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Client</th>
                        <th className="px-6 py-3 font-semibold">Subject</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {data?.recentFeedbacks && data.recentFeedbacks.length > 0 ? (
                        data.recentFeedbacks.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-background/40 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground text-sm">
                                {item.name}
                              </div>
                              <div className="text-xs text-foreground-muted truncate max-w-[200px]">
                                {item.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-foreground font-medium max-w-[220px] truncate">
                              {item.subject || "General Inquiry"}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(item.status)}
                            </td>
                            <td className="px-6 py-4 text-xs text-foreground-muted text-right whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString([], {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-foreground-muted text-xs">
                            No contact form submissions recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-background/50 border-t border-card-border text-center">
                <Link
                  href="/admin/feedback"
                  className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1.5"
                >
                  Manage and reply to inquiries in Feedback Center <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Quick Actions & Recent Content (1 Column) */}
            <div className="space-y-6">
              {/* Quick Launch Panel */}
              <div className="rounded-2xl bg-card-bg border border-card-border p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-foreground text-base">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  <Link
                    href="/admin/blog/new"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-card-border hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-accent flex items-center justify-center">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Write AI Blog Post</div>
                        <div className="text-xs text-foreground-muted">Generate with Gemini</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-foreground-muted group-hover:text-accent transition-colors" />
                  </Link>

                  <Link
                    href="/admin/portfolio/new"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-card-border hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Plus size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Upload Portfolio Project</div>
                        <div className="text-xs text-foreground-muted">Add screenshot & tags</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-foreground-muted group-hover:text-accent transition-colors" />
                  </Link>

                  <Link
                    href="/admin/testimonials"
                    className="flex items-center justify-between p-3.5 rounded-xl border border-card-border hover:border-accent hover:bg-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Star size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">Add Client Testimonial</div>
                        <div className="text-xs text-foreground-muted">Client reviews on homepage</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-foreground-muted group-hover:text-accent transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Latest Published Articles */}
              <div className="rounded-2xl bg-card-bg border border-card-border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground text-base">Latest Articles</h3>
                  <Link href="/admin/blog" className="text-xs font-semibold text-accent hover:underline">
                    All Posts
                  </Link>
                </div>

                <div className="space-y-3">
                  {data?.recentArticles && data.recentArticles.length > 0 ? (
                    data.recentArticles.slice(0, 3).map((art) => (
                      <div
                        key={art.id}
                        className="p-3 rounded-xl bg-background border border-card-border flex flex-col justify-between"
                      >
                        <div className="font-medium text-xs text-foreground line-clamp-1">
                          {art.title}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-foreground-muted mt-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px]">
                            {art.category}
                          </span>
                          <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-foreground-muted">No published articles yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
