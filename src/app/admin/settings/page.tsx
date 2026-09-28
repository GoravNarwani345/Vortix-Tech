"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Bot,
  FileSearch,
  Clock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Loader2,
  Sparkles,
  Layers,
  Database,
  ShieldAlert,
  Sliders,
  Mail,
  Zap,
  Gift,
  DollarSign,
  Gauge,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  AI_MODELS,
  FREE_AI_MODELS,
  PAID_AI_MODELS,
  getModelById,
  isFreeModel,
} from "@/lib/aiModels";

type SettingsData = {
  adminEmail: string;
  hasAdminPassword: boolean;
  geminiApiKeyMasked: string;
  hasGeminiApiKey: boolean;
  resendApiKeyMasked: string;
  hasResendApiKey: boolean;
  contactEmail: string;
  cronSecretMasked: string;
  hasCronSecret: boolean;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiCustomInstructions: string;
  aiIncludeServices: boolean;
  aiIncludePortfolio: boolean;
  aiIncludeBlog: boolean;
  aiIncludeTestimonials: boolean;
  aiIncludeGuide: boolean;
};

type KnowledgeBreakdown = {
  name: string;
  count: number;
  chars: number;
  tokens: number;
  preview: string;
};

type SyncLogEntry = {
  id: string;
  timestamp: string;
  trigger: "manual" | "cron" | "initial";
  status: "success" | "error";
  durationMs: number;
  totalChars: number;
  estimatedTokens: number;
  itemsCount: {
    services: number;
    projects: number;
    articles: number;
    testimonials: number;
  };
  error?: string;
};

type AuditData = {
  hasApiKey: boolean;
  model: string;
  temperature: number;
  maxTokens: number;
  lastSyncedAt: string;
  nextScheduledSyncAt: string;
  totalChars: number;
  estimatedTokens: number;
  breakdown: KnowledgeBreakdown[];
  compiledPrompt: string;
  history: SyncLogEntry[];
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "auth" | "ai" | "audit" | "cron"
  >("audit");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testingAi, setTestingAi] = useState(false);

  // Form states
  const [adminEmail, setAdminEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // AI & API states
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiMasked, setGeminiMasked] = useState("");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [modelTierFilter, setModelTierFilter] = useState<"all" | "free" | "paid">("all");
  const [showCustomModel, setShowCustomModel] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [aiMaxTokens, setAiMaxTokens] = useState(800);
  const [aiCustomInstructions, setAiCustomInstructions] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [resendApiKey, setResendApiKey] = useState("");
  const [cronSecret, setCronSecret] = useState("");
  const [cronSecretMasked, setCronSecretMasked] = useState("");

  // Source toggles
  const [aiIncludeServices, setAiIncludeServices] = useState(true);
  const [aiIncludePortfolio, setAiIncludePortfolio] = useState(true);
  const [aiIncludeBlog, setAiIncludeBlog] = useState(true);
  const [aiIncludeTestimonials, setAiIncludeTestimonials] = useState(true);
  const [aiIncludeGuide, setAiIncludeGuide] = useState(true);

  // Audit state
  const [auditData, setAuditData] = useState<AuditData | null>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // AI Auditor Simulator state
  const [testPrompt, setTestPrompt] = useState("What mobile app frameworks do you use at Vortix Tech, and how can I start a project?");
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testTokens, setTestTokens] = useState<number | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        const s: SettingsData = data.settings;
        setAdminEmail(s.adminEmail || "");
        setGeminiMasked(s.geminiApiKeyMasked || "");
        setAiModel(s.aiModel || "gemini-2.5-flash");
        setAiTemperature(s.aiTemperature ?? 0.7);
        setAiMaxTokens(s.aiMaxTokens ?? 800);
        setAiCustomInstructions(s.aiCustomInstructions || "");
        setContactEmail(s.contactEmail || "info@thevortixtech.com");
        setCronSecretMasked(s.cronSecretMasked || "");
        setAiIncludeServices(s.aiIncludeServices ?? true);
        setAiIncludePortfolio(s.aiIncludePortfolio ?? true);
        setAiIncludeBlog(s.aiIncludeBlog ?? true);
        setAiIncludeTestimonials(s.aiIncludeTestimonials ?? true);
        setAiIncludeGuide(s.aiIncludeGuide ?? true);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load settings");
    }
  };

  const fetchAuditData = async () => {
    try {
      const res = await fetch("/api/admin/ai/audit");
      if (res.ok) {
        const data = await res.json();
        setAuditData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchSettings();
      await fetchAuditData();
    })();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        adminEmail,
        aiModel,
        aiTemperature,
        aiMaxTokens,
        aiCustomInstructions,
        contactEmail,
        aiIncludeServices,
        aiIncludePortfolio,
        aiIncludeBlog,
        aiIncludeTestimonials,
        aiIncludeGuide,
      };

      if (newPassword) payload.adminPassword = newPassword;
      if (geminiApiKey) payload.geminiApiKey = geminiApiKey;
      if (resendApiKey) payload.resendApiKey = resendApiKey;
      if (cronSecret) payload.cronSecret = cronSecret;

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      toast.success("Settings saved and AI knowledge updated!");
      setNewPassword("");
      setConfirmPassword("");
      setGeminiApiKey("");
      setResendApiKey("");
      setCronSecret("");
      await fetchSettings();
      await fetchAuditData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/ai/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      toast.success("Website knowledge successfully synced to AI!");
      await fetchAuditData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sync AI";
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleTestAi = async () => {
    if (!testPrompt.trim()) {
      toast.error("Please enter a question to audit AI.");
      return;
    }
    setTestingAi(true);
    setTestResponse(null);
    setTestLatency(null);
    try {
      const res = await fetch("/api/admin/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI query failed");
      setTestResponse(data.reply);
      setTestLatency(data.latencyMs);
      setTestTokens(data.usage?.totalTokenCount || null);
      toast.success(`AI Response generated in ${data.latencyMs}ms!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI test failed";
      toast.error(msg);
    } finally {
      setTestingAi(false);
    }
  };

  const copyToClipboard = (text: string, type: "prompt" | "webhook") => {
    navigator.clipboard.writeText(text);
    if (type === "prompt") {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/cron/sync-ai-knowledge`
    : "https://vortixtech.com/api/cron/sync-ai-knowledge";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Sliders className="text-accent" size={28} />
            Admin Settings & AI Hub
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Configure system credentials, Google Gemini API, live AI knowledge audit, and daily automated sync.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border bg-card-bg hover:bg-card-border/40 text-foreground font-medium text-sm transition-all shadow-sm"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin text-accent" : ""} />
            {syncing ? "Syncing AI..." : "Sync AI Knowledge"}
          </button>
          <button
            onClick={() => void handleSaveSettings()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-medium text-sm transition-all shadow-glow"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-card-border pb-1">
        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <Sparkles size={18} />
          Audit AI & Knowledge Base
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white/20">Live</span>
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "ai"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <Bot size={18} />
          AI & API Configuration
        </button>
        <button
          onClick={() => setActiveTab("cron")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "cron"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <Clock size={18} />
          Daily Cron & Sync History
        </button>
        <button
          onClick={() => setActiveTab("auth")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "auth"
              ? "bg-accent text-white shadow-sm"
              : "text-foreground-muted hover:text-foreground hover:bg-card-bg"
          }`}
        >
          <KeyRound size={18} />
          Admin Credentials & Auth
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 text-foreground-muted">
          <Loader2 className="animate-spin text-accent mb-4" size={36} />
          <p>Loading settings and compiling live AI knowledge audit...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: AUDIT AI & OVERALL KNOWLEDGE */}
          {activeTab === "audit" && (
            <div className="space-y-8">
              {/* Audit Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-card-bg border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-foreground-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Context Size</span>
                    <Layers size={18} className="text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {auditData?.totalChars.toLocaleString() || "0"}{" "}
                    <span className="text-sm font-normal text-foreground-muted">characters</span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">
                    ~{auditData?.estimatedTokens.toLocaleString() || "0"} Gemini prompt tokens
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card-bg border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-foreground-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Active Model</span>
                    <Bot size={18} className="text-purple-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-foreground">
                      {auditData?.model || "gemini-2.5-flash"}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isFreeModel(auditData?.model || "")
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {isFreeModel(auditData?.model || "") ? "FREE TIER" : "PAID TIER"}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">
                    Temp: {auditData?.temperature} | Max: {auditData?.maxTokens} tokens
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card-bg border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-foreground-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Last Auto-Sync</span>
                    <Clock size={18} className="text-green-500" />
                  </div>
                  <div className="text-lg font-bold text-foreground truncate">
                    {auditData?.lastSyncedAt
                      ? new Date(auditData.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : "Never"}
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">
                    {auditData?.lastSyncedAt ? new Date(auditData.lastSyncedAt).toLocaleDateString() : "Pending"}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-card-bg border border-card-border shadow-sm">
                  <div className="flex items-center justify-between text-foreground-muted mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">API Key Status</span>
                    <Zap size={18} className={auditData?.hasApiKey ? "text-green-500" : "text-amber-500"} />
                  </div>
                  <div className="text-lg font-bold text-foreground flex items-center gap-2">
                    {auditData?.hasApiKey ? (
                      <span className="inline-flex items-center gap-1.5 text-green-600 text-base">
                        <CheckCircle2 size={18} /> Configured & Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 text-base">
                        <AlertTriangle size={18} /> Needs API Key
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">Public chat widget connected</p>
                </div>
              </div>

              {/* Knowledge Sources Breakdown */}
              <div className="rounded-2xl bg-card-bg border border-card-border p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Database size={20} className="text-accent" />
                      Website Knowledge Sources Sent to AI
                    </h2>
                    <p className="text-foreground-muted text-sm mt-0.5">
                      This shows the exact modular knowledge aggregated from your database and business profile:
                    </p>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                    Auto-Aggregated Daily
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auditData?.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-card-border hover:border-accent/40 transition-colors bg-background/50 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground text-sm">{item.name}</span>
                          <span className="text-xs bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-md">
                            {item.count} {item.count === 1 ? "entry" : "items"}
                          </span>
                        </div>
                        <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                          {item.preview}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-card-border flex items-center justify-between text-xs text-foreground-muted">
                        <span>{item.chars.toLocaleString()} chars</span>
                        <span>~{item.tokens} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Knowledge Scope Filter Controls */}
                <div className="mt-6 pt-6 border-t border-card-border">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Include in AI Knowledge Payload:</h3>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiIncludeServices}
                        onChange={(e) => setAiIncludeServices(e.target.checked)}
                        className="rounded border-card-border text-accent focus:ring-accent"
                      />
                      Services Catalog
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiIncludePortfolio}
                        onChange={(e) => setAiIncludePortfolio(e.target.checked)}
                        className="rounded border-card-border text-accent focus:ring-accent"
                      />
                      Portfolio Projects
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiIncludeBlog}
                        onChange={(e) => setAiIncludeBlog(e.target.checked)}
                        className="rounded border-card-border text-accent focus:ring-accent"
                      />
                      Blog Articles
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiIncludeTestimonials}
                        onChange={(e) => setAiIncludeTestimonials(e.target.checked)}
                        className="rounded border-card-border text-accent focus:ring-accent"
                      />
                      Client Testimonials
                    </label>
                  </div>
                </div>
              </div>

              {/* Interactive AI Auditor Simulator */}
              <div className="rounded-2xl bg-card-bg border border-card-border p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FileSearch size={22} className="text-accent" />
                  <h2 className="text-lg font-bold text-foreground">AI Auditor Simulator & Playground</h2>
                </div>
                <p className="text-foreground-muted text-sm mb-4">
                  Simulate a real visitor question to test how Google Gemini leverages your compiled website knowledge in real-time.
                </p>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      placeholder="Ask the AI anything about your services, rates, tech stack..."
                      className="flex-1 px-4 py-3 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={handleTestAi}
                      disabled={testingAi}
                      className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                    >
                      {testingAi ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      Test Knowledge Response
                    </button>
                  </div>

                  {testResponse && (
                    <div className="p-5 rounded-xl bg-accent/5 border border-accent/20 space-y-3">
                      <div className="flex items-center justify-between text-xs text-foreground-muted">
                        <span className="font-semibold text-accent flex items-center gap-1.5">
                          <Bot size={16} /> Gemini Response:
                        </span>
                        <div className="flex gap-4">
                          {testLatency && <span>Latency: <strong className="text-foreground">{testLatency}ms</strong></span>}
                          {testTokens && <span>Tokens: <strong className="text-foreground">{testTokens}</strong></span>}
                        </div>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {testResponse}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Full Raw System Prompt Inspector */}
              <div className="rounded-2xl bg-card-bg border border-card-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Complete Assembled System Prompt</h2>
                    <p className="text-foreground-muted text-xs mt-0.5">
                      The exact markdown string injected into Gemini&apos;s system_instruction parameter.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(auditData?.compiledPrompt || "", "prompt")}
                      className="px-3 py-1.5 rounded-lg border border-card-border text-xs font-medium hover:bg-card-border/50 text-foreground flex items-center gap-1.5 transition-colors"
                    >
                      {copiedPrompt ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copiedPrompt ? "Copied" : "Copy Prompt"}
                    </button>
                    <button
                      onClick={() => setShowFullPrompt(!showFullPrompt)}
                      className="px-3 py-1.5 rounded-lg bg-background border border-card-border text-xs font-medium hover:bg-card-border/50 text-foreground transition-colors"
                    >
                      {showFullPrompt ? "Collapse" : "Expand Full Text"}
                    </button>
                  </div>
                </div>

                <div
                  className={`bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap transition-all ${
                    showFullPrompt ? "max-h-none" : "max-h-48 overflow-y-hidden relative"
                  }`}
                >
                  {auditData?.compiledPrompt}
                  {!showFullPrompt && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2">
                      <span className="text-gray-400 text-xs">Click Expand to view full prompt</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI & API CONFIGURATION */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gemini Configuration */}
              <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Bot size={20} className="text-accent" />
                    Google Gemini AI Setup
                  </h2>
                  <p className="text-foreground-muted text-xs mt-1">
                    Powers both the customer chat assistant and the automated blog generation engine.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                      Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showGeminiKey ? "text" : "password"}
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        placeholder={geminiMasked || "AIzaSy..."}
                        className="w-full pl-4 pr-10 py-2.5 bg-background border border-card-border rounded-xl text-sm font-mono focus:outline-none focus:border-accent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                      >
                        {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p className="text-xs text-foreground-muted mt-1.5 flex items-center gap-1">
                      {geminiMasked ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <CheckCircle2 size={13} /> Key is configured: {geminiMasked}
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <AlertTriangle size={13} /> No key configured yet.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Model Selection with Categories (Free vs Paid) */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          Active Model & Tier
                        </label>
                        <p className="text-xs text-foreground-muted mt-0.5">
                          Select from 100% Free Google AI Studio models ($0) or High-Capacity Paid/Pro models
                        </p>
                      </div>

                      {/* Tier Filter Tabs */}
                      <div className="flex items-center gap-1 p-1 bg-background border border-card-border rounded-xl text-xs self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setModelTierFilter("all")}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                            modelTierFilter === "all"
                              ? "bg-card-bg text-foreground shadow-sm border border-card-border"
                              : "text-foreground-muted hover:text-foreground"
                          }`}
                        >
                          All ({AI_MODELS.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelTierFilter("free")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                            modelTierFilter === "free"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                              : "text-foreground-muted hover:text-foreground"
                          }`}
                        >
                          <Gift size={12} className="text-emerald-400" />
                          <span>Free Models ({FREE_AI_MODELS.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelTierFilter("paid")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                            modelTierFilter === "paid"
                              ? "bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold"
                              : "text-foreground-muted hover:text-foreground"
                          }`}
                        >
                          <DollarSign size={12} className="text-purple-400" />
                          <span>Paid Models ({PAID_AI_MODELS.length})</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Dropdown with optgroups */}
                    <div>
                      <select
                        value={aiModel}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setShowCustomModel(true);
                          } else {
                            setShowCustomModel(false);
                            setAiModel(e.target.value);
                          }
                        }}
                        className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                      >
                        <optgroup label="🟢 FREE TIER MODELS (Google AI Studio - $0.00 / 1,500 RPD)">
                          {FREE_AI_MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — {m.speed} [{m.rateLimits}] {m.recommended ? "★ RECOMMENDED" : ""}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🟣 PAID / PRO TIER MODELS (Pay-As-You-Go / Cloud Billing)">
                          {PAID_AI_MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} — {m.contextWindow} [{m.cost}]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="⚙️ Custom Model">
                          <option value="__custom__">+ Enter Custom Gemini Model ID...</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Custom Model Input if triggered */}
                    {showCustomModel && (
                      <div className="flex gap-2 p-3 rounded-xl bg-background border border-card-border">
                        <input
                          type="text"
                          placeholder="e.g. gemini-2.0-flash-exp"
                          value={customModelInput}
                          onChange={(e) => setCustomModelInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-card-bg border border-card-border rounded-lg text-sm focus:outline-none focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (customModelInput.trim()) {
                              setAiModel(customModelInput.trim());
                              toast.success(`Selected custom model: ${customModelInput.trim()}`);
                            }
                          }}
                          className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90"
                        >
                          Apply Model ID
                        </button>
                      </div>
                    )}

                    {/* Interactive Model Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {AI_MODELS.filter((m) => {
                        if (modelTierFilter === "free") return m.tier === "free";
                        if (modelTierFilter === "paid") return m.tier === "paid";
                        return true;
                      }).map((m) => {
                        const isSelected = aiModel === m.id;
                        const isFree = m.tier === "free";
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              setAiModel(m.id);
                              setShowCustomModel(false);
                            }}
                            className={`group relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                              isSelected
                                ? "bg-accent/10 border-accent shadow-md shadow-accent/10 ring-1 ring-accent"
                                : "bg-card-bg/60 border-card-border hover:border-accent/40 hover:bg-card-bg"
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                                    isFree
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                  }`}
                                >
                                  {isFree ? <Gift size={11} /> : <DollarSign size={11} />}
                                  {m.badge}
                                </span>

                                {m.recommended && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
                                    ★ DEFAULT
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mb-0.5">
                                <h4 className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors">
                                  {m.name}
                                </h4>
                                {isSelected && (
                                  <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                                )}
                              </div>

                              <p className="text-[11px] font-mono text-foreground-muted mb-2">
                                {m.id}
                              </p>

                              <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
                                {m.description}
                              </p>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-card-border/60 text-[11px]">
                              <div className="flex items-center justify-between text-foreground-muted">
                                <span>Speed:</span>
                                <span className="font-medium text-foreground">{m.speed}</span>
                              </div>
                              <div className="flex items-center justify-between text-foreground-muted">
                                <span>Quota:</span>
                                <span className="font-medium text-foreground truncate ml-2">{m.rateLimits}</span>
                              </div>
                              <div className="flex items-center justify-between text-foreground-muted">
                                <span>Cost:</span>
                                <span className={`font-semibold ${isFree ? "text-emerald-400" : "text-purple-400"}`}>
                                  {isFree ? "$0.00 (Free)" : "Paid / Pro"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Model Indicator Summary */}
                    {(() => {
                      const currentModel = getModelById(aiModel);
                      const isFree = currentModel.tier === "free";
                      return (
                        <div className="p-3.5 rounded-xl bg-card-bg border border-card-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${isFree ? "bg-emerald-400 animate-pulse" : "bg-purple-400"}`} />
                            <span className="text-foreground-muted">Active Model:</span>
                            <span className="font-semibold font-mono text-accent">{aiModel}</span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                isFree
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              }`}
                            >
                              {isFree ? "🟢 Free Tier ($0/mo)" : "🟣 Paid / Pro Tier"}
                            </span>
                          </div>
                          <span className="text-foreground-muted text-[11px]">
                            {currentModel.rateLimits} • {currentModel.speed}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1">
                        Temperature: {aiTemperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1.2"
                        step="0.1"
                        value={aiTemperature}
                        onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-foreground-muted mt-1">
                        <span>Precise (0.0)</span>
                        <span>Creative (1.2)</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1">
                        Max Output Tokens: {aiMaxTokens}
                      </label>
                      <input
                        type="range"
                        min="200"
                        max="2000"
                        step="50"
                        value={aiMaxTokens}
                        onChange={(e) => setAiMaxTokens(parseInt(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-foreground-muted mt-1">
                        <span>Short (200)</span>
                        <span>Long (2000)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                      Custom Assistant Instructions & Tone Rules
                    </label>
                    <textarea
                      rows={4}
                      value={aiCustomInstructions}
                      onChange={(e) => setAiCustomInstructions(e.target.value)}
                      placeholder="Add custom guidelines, e.g. 'Always mention our 100% satisfaction guarantee' or 'Offer direct WhatsApp booking for high-ticket quotes'..."
                      className="w-full p-3 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Email & Delivery Configuration */}
              <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Mail size={20} className="text-secondary" />
                    Email & Communications Setup
                  </h2>
                  <p className="text-foreground-muted text-xs mt-1">
                    Manage where lead inquiries are routed and configure Resend API credentials.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                      Inquiries Recipient Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="info@thevortixtech.com"
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                    <p className="text-xs text-foreground-muted mt-1">
                      New contact form submissions & lead inquiries are delivered here.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                      Resend API Key (Optional / HTTPS Mail)
                    </label>
                    <input
                      type="password"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      placeholder="re_..."
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm font-mono focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-card-border text-xs text-foreground-muted space-y-2">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Zap size={14} className="text-accent" /> Why Resend?
                    </span>
                    <p>
                      Resend delivers transactional emails over HTTPS port 443, eliminating port 25/465/587 blocks standard on cloud VPS providers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAILY CRON & SYNC HISTORY */}
          {activeTab === "cron" && (
            <div className="space-y-8">
              {/* Daily Cron Status Card */}
              <div className="p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock size={20} className="text-accent" />
                      <h2 className="text-lg font-bold text-foreground">Daily AI Knowledge Auto-Sync</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active Daily Cron
                      </span>
                    </div>
                    <p className="text-foreground-muted text-sm mt-1">
                      Ensures the AI assistant is continuously updated day by day with the latest projects, blog posts, and reviews.
                    </p>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
                    {syncing ? "Re-compiling Knowledge..." : "Trigger Sync Now"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-background border border-card-border mb-6">
                  <div>
                    <span className="text-xs text-foreground-muted">Last Successful Run</span>
                    <div className="font-semibold text-foreground mt-0.5">
                      {auditData?.lastSyncedAt
                        ? new Date(auditData.lastSyncedAt).toLocaleString()
                        : "Never"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-foreground-muted">Next Scheduled Run</span>
                    <div className="font-semibold text-foreground mt-0.5">
                      {auditData?.nextScheduledSyncAt
                        ? new Date(auditData.nextScheduledSyncAt).toLocaleString()
                        : "Daily at 00:00 UTC"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-foreground-muted">Compiled Output Cache</span>
                    <div className="font-semibold text-foreground mt-0.5 font-mono text-xs">
                      data/ai_knowledge_cache.json
                    </div>
                  </div>
                </div>

                {/* Webhook & Cron Setup */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-foreground">External Webhook & Cron Job URL</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={webhookUrl}
                      className="flex-1 px-4 py-2.5 bg-background border border-card-border rounded-xl text-xs font-mono text-foreground focus:outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(webhookUrl, "webhook")}
                      className="px-4 py-2.5 bg-background border border-card-border hover:bg-card-border/40 text-foreground rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      {copiedWebhook ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copiedWebhook ? "Copied" : "Copy URL"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-1.5">
                      Cron Secret Key (Used for Authorization header or ?key= query)
                    </label>
                    <input
                      type="password"
                      value={cronSecret}
                      onChange={(e) => setCronSecret(e.target.value)}
                      placeholder={cronSecretMasked || "Enter a secure CRON_SECRET..."}
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm font-mono focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-gray-900 text-gray-200 text-xs font-mono space-y-3">
                    <div>
                      <span className="text-gray-400 block font-semibold mb-1">Digital Ocean / Linux Server Crontab Setup:</span>
                      <p className="text-gray-400 text-[11px] mb-2 font-sans">
                        Run <code className="text-amber-400">crontab -e</code> on your Digital Ocean droplet and paste this daily midnight job:
                      </p>
                      <p className="text-green-400 overflow-x-auto whitespace-pre-wrap bg-black/40 p-2.5 rounded-lg border border-gray-800">
                        {`0 0 * * * curl -s -X POST "${webhookUrl}?key=${cronSecretMasked || "YOUR_CRON_SECRET"}" > /dev/null 2>&1`}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-800 text-[11px] font-sans text-gray-400 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      <span><strong>Built-in Auto-Sync:</strong> If crontab is not configured, the server automatically checks if knowledge is &gt;24h old and re-syncs it in the background.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sync History Audit Log */}
              <div className="rounded-2xl bg-card-bg border border-card-border overflow-hidden shadow-sm">
                <div className="p-5 border-b border-card-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Recent Sync Audit History</h3>
                  <span className="text-xs text-foreground-muted">Last 25 Executions</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-background text-xs uppercase text-foreground-muted border-b border-card-border">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Timestamp</th>
                        <th className="px-6 py-3 font-semibold">Trigger</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">Size</th>
                        <th className="px-6 py-3 font-semibold">Tokens</th>
                        <th className="px-6 py-3 font-semibold">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {auditData?.history && auditData.history.length > 0 ? (
                        auditData.history.map((log) => (
                          <tr key={log.id} className="hover:bg-background/40 transition-colors">
                            <td className="px-6 py-3.5 text-xs font-mono text-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="px-6 py-3.5 text-xs capitalize">
                              <span
                                className={`px-2 py-0.5 rounded-md font-medium ${
                                  log.trigger === "cron"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {log.trigger}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-xs">
                              {log.status === "success" ? (
                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={14} /> Success
                                </span>
                              ) : (
                                <span className="text-red-500 font-semibold flex items-center gap-1">
                                  <AlertTriangle size={14} /> Failed
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 text-xs text-foreground-muted">
                              {log.totalChars.toLocaleString()} chars
                            </td>
                            <td className="px-6 py-3.5 text-xs text-foreground-muted">
                              ~{log.estimatedTokens.toLocaleString()}
                            </td>
                            <td className="px-6 py-3.5 text-xs text-foreground-muted font-mono">
                              {log.durationMs}ms
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-foreground-muted text-xs">
                            No sync logs recorded yet. Click &quot;Trigger Sync Now&quot; above to perform the first compilation.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN CREDENTIALS & AUTH */}
          {activeTab === "auth" && (
            <div className="max-w-2xl p-6 rounded-2xl bg-card-bg border border-card-border shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert size={20} className="text-accent" />
                  Admin Credentials & Security
                </h2>
                <p className="text-foreground-muted text-xs mt-1">
                  Update the email and password required to sign in to the Vortix Tech Admin Dashboard.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    Admin Sign-In Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="info@thevortixtech.com"
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                    New Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full pl-4 pr-10 py-2.5 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Update Admin Credentials
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
