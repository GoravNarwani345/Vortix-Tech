"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Wand2,
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Sparkles,
  Search,
  BookOpen,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Layers,
  Flame,
  Globe,
  FileText,
  Palette,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { SEOTopicItem } from "@/app/api/admin/ai/topics/route";
import type { ResearchResult } from "@/app/api/admin/ai/research/route";
import { BlogCoverImageUploader } from "@/components/admin/BlogCoverImageUploader";

export default function NewBlogPage() {
  const router = useRouter();

  // Mode: "daily" (Daily SEO Opportunities) or "research" (Custom Prompt & Deep Research)
  const [activeTab, setActiveTab] = useState<"daily" | "research">("daily");

  // Daily Quotas State
  const [quotas, setQuotas] = useState<{
    blog?: { used: number; limit: number; remaining: number };
    research?: { used: number; limit: number; remaining: number };
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai/quota")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.quotas) {
          setQuotas(data.quotas);
        }
      })
      .catch(() => {});
  }, []);

  // Daily Topics State
  const [seoTopics, setSeoTopics] = useState<SEOTopicItem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);

  // Research State
  const [researchPrompt, setResearchPrompt] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [researchData, setResearchData] = useState<ResearchResult | null>(null);

  // Writing & Saving State
  const [isWriting, setIsWriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  // Article Form Data (Always fully editable)
  const [article, setArticle] = useState({
    title: "",
    category: "Web Development",
    excerpt: "",
    content: "",
    image: "",
  });

  // Custom visual style for image generation
  const [imageStyle, setImageStyle] = useState<"clean" | "isometric" | "dark">("clean");
  const [articleImagePrompt, setArticleImagePrompt] = useState("");

  // Advanced AI Generation Settings
  const [tone, setTone] = useState<"technical" | "tutorial" | "executive" | "case-study">("technical");
  const [depth, setDepth] = useState<"deep" | "standard" | "concise">("deep");
  const [includeCode, setIncludeCode] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeArchitectureFlow, setIncludeArchitectureFlow] = useState(true);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);

  // 1. Fetch Daily SEO Topic Ideas
  const generateTopics = async () => {
    setIsGeneratingTopics(true);
    try {
      const res = await fetch("/api/admin/ai/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setSeoTopics(data.items);
        toast.success(`Generated ${data.items.length} SEO opportunity topics!`);
      } else if (data.topics) {
        // Fallback for basic format
        const formatted: SEOTopicItem[] = data.topics.map((t: string) => ({
          title: t,
          category: "Technology",
          targetKeyword: t.toLowerCase(),
          searchIntent: "Commercial",
          seoPotential: "High",
          briefReason: "High relevance to tech agency clients.",
        }));
        setSeoTopics(formatted);
        toast.success("Topics generated!");
      } else {
        throw new Error(data.error);
      }
    } catch {
      toast.error("Failed to generate topics");
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  // 2. Perform Deep Technical Research on Custom Prompt
  const runDeepResearch = async () => {
    if (!researchPrompt.trim()) {
      return toast.error("Please enter a research topic or prompt.");
    }

    setIsResearching(true);
    try {
      const res = await fetch("/api/admin/ai/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: researchPrompt,
          focusArea,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Research failed");
      }

      setResearchData(data.research);
      if (data.quota) {
        setQuotas((prev) => ({
          ...prev,
          research: data.quota,
        }));
      }
      if (data.research.suggestedTitles?.[0]) {
        setSelectedTopic(data.research.suggestedTitles[0]);
      }
      if (data.research.primaryKeywords) {
        setTargetKeywords([
          ...data.research.primaryKeywords,
          ...(data.research.secondaryKeywords || []),
        ]);
      }
      toast.success("Deep research completed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to conduct research");
    } finally {
      setIsResearching(false);
    }
  };

  // 3. Generate Complete Article Content
  const writeArticle = async (overrideTopic?: string) => {
    const topicToWrite = overrideTopic || selectedTopic || article.title;
    if (!topicToWrite) {
      return toast.error("Please choose a topic or enter a title first.");
    }

    setIsWriting(true);
    try {
      const res = await fetch("/api/admin/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToWrite,
          customPrompt: researchPrompt || undefined,
          targetKeywords: targetKeywords.length > 0 ? targetKeywords : undefined,
          researchBrief: researchData ? researchData : undefined,
          category: article.category,
          tone,
          depth,
          includeCode,
          includeTables,
          includeArchitectureFlow,
        }),
      });

      const text = await res.text();
      let data: { success?: boolean; error?: string; details?: string; article?: any; quota?: any };
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status === 504) {
          throw new Error("The AI generation timed out (504 Gateway Timeout). Please choose a faster model in Admin Settings.");
        }
        throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 120)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate article");
      }

      const generated = data.article;
      if (data.quota) {
        setQuotas((prev) => ({
          ...prev,
          blog: data.quota,
        }));
      }
      setArticle((prev) => ({
        ...prev,
        title: generated.title || topicToWrite,
        excerpt: generated.excerpt || prev.excerpt,
        category: generated.category || prev.category,
        content: generated.content || prev.content,
      }));

      if (generated.keywords && generated.keywords.length > 0) {
        setTargetKeywords(generated.keywords);
      }

      if (generated.imagePrompt) {
        setArticleImagePrompt(generated.imagePrompt);
      }

      // Auto generate free cover image if none exists
      if (!article.image && generated.title) {
        generateImage(generated.title);
      }

      toast.success("Article drafted! Everything is editable below.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to write article");
    } finally {
      setIsWriting(false);
    }
  };

  // 4. Generate Free Cover Image via Pollinations.ai
  const generateImage = (titleOverride?: string) => {
    const t = titleOverride || article.title;
    if (!t) return toast.error("Enter or generate an article title first.");

    let promptSuffix = "clean modern minimalist tech digital illustration 4k";
    if (imageStyle === "isometric") {
      promptSuffix = "3D isometric tech workspace render octane render soft lighting 8k";
    } else if (imageStyle === "dark") {
      promptSuffix = "cyberpunk dark aesthetic glowing neon cyan and violet accents futuristic 4k";
    }

    const prompt = encodeURIComponent(`${t} ${promptSuffix}`);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=630&nologo=true`;

    setArticle((prev) => ({ ...prev, image: url }));
    toast.success("Cover image generated via Pollinations AI (Free Tier)!");
  };

  // 4b. Generate AI Cover Image via StepFun (step-image-edit-2)
  const generateStepFunImage = async (titleOverride?: string) => {
    const t = titleOverride || article.title;
    if (!t) return toast.error("Enter or generate an article title first.");

    let promptSuffix = "clean modern minimalist tech digital illustration, highly detailed, 4k digital art";
    if (imageStyle === "isometric") {
      promptSuffix = "3D isometric tech workspace render, octane render, soft clean studio lighting, 8k";
    } else if (imageStyle === "dark") {
      promptSuffix = "cyberpunk dark tech aesthetic, glowing neon cyan and violet accents, futuristic cinematic 4k";
    }

    const prompt = `${t}, ${promptSuffix}`;
    setIsGeneratingAiImage(true);

    try {
      const res = await fetch("/api/admin/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size: "1024x1024" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate image");
      }

      setArticle((prev) => ({ ...prev, image: data.url }));
      toast.success(`Cover image generated via StepFun (${data.model || "step-image-edit-2"})!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate AI image");
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  const copyPromptText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopiedPromptKey(null), 2000);
  };

  // 5. Save and Publish
  const saveArticle = async () => {
    if (!article.title.trim() || !article.content.trim()) {
      return toast.error("Please provide both a title and article content.");
    }

    if (!article.image) {
      return toast.error("Please add or generate a cover image before publishing.");
    }

    setIsSaving(true);
    try {
      const slug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      const finalSlug = `${slug}-${Date.now().toString().slice(-6)}`;
      const readTime = `${Math.max(3, Math.ceil(article.content.split(/\s+/).length / 200))} min read`;

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          slug: finalSlug,
          readTime,
          isPublished: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to save article");

      toast.success("Article published successfully!");
      router.push("/admin/blog");
    } catch {
      toast.error("Failed to publish article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Blog & SEO Studio</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Daily SEO topic ideation, deep technical research, and fully editable AI drafting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              (quotas?.blog?.remaining ?? 5) === 0
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}>
              <FileText size={14} />
              Daily Articles: {quotas?.blog ? `${quotas.blog.used}/${quotas.blog.limit} Used` : "5/Day Limit"}
            </span>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              (quotas?.research?.remaining ?? 1) === 0
                ? "bg-red-500/10 text-red-600 border-red-500/20"
                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
            }`}>
              <Search size={14} />
              Daily Research: {quotas?.research ? `${quotas.research.used}/${quotas.research.limit} Used` : "1/Day Limit"}
            </span>
          </div>

          <button
            onClick={saveArticle}
            disabled={isSaving || !article.title || !article.content}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-xl hover:bg-black transition-colors font-bold text-sm shadow-sm disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish Article
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): AI Research & Ideation Tools */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("daily")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
                activeTab === "daily"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp size={15} /> Daily SEO Topics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("research")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all ${
                activeTab === "research"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Search size={15} /> Deep Research Mode
            </button>
          </div>

          {/* TAB 1: DAILY SEO TOPICS */}
          {activeTab === "daily" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-sm">Daily SEO Opportunities</h2>
                    <p className="text-[11px] text-gray-500">Trending topics based on search intent</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={generateTopics}
                  disabled={isGeneratingTopics}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isGeneratingTopics ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  Suggest Daily Topics
                </button>
              </div>

              {seoTopics.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                  <Sparkles size={24} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-xs text-gray-600 font-medium">No topics generated yet today</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Click &ldquo;Suggest Daily Topics&rdquo; to analyze current SEO ranking opportunities.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {seoTopics.map((item, i) => {
                    const isSelected = selectedTopic === item.title;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setSelectedTopic(item.title);
                          setArticle((prev) => ({
                            ...prev,
                            title: item.title,
                            category: item.category,
                          }));
                          if (item.targetKeyword) {
                            setTargetKeywords([item.targetKeyword]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/60 shadow-xs"
                            : "border-gray-200 hover:border-indigo-300 bg-white hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                item.searchIntent === "Transactional"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.searchIntent === "Commercial"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {item.searchIntent}
                            </span>
                            {item.seoPotential === "Breakthrough" && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-0.5">
                                <Flame size={10} /> Top
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-gray-900 leading-snug">{item.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.briefReason}</p>

                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-gray-400 font-mono text-[10px] truncate max-w-[200px]">
                            KW: {item.targetKeyword}
                          </span>
                          {isSelected && (
                            <span className="text-indigo-600 font-bold flex items-center gap-1 text-[11px]">
                              <Check size={12} /> Selected
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTopic && (
                <button
                  type="button"
                  onClick={() => writeArticle()}
                  disabled={isWriting}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isWriting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                  Write Full Article from Selected Topic
                </button>
              )}
            </div>
          )}

          {/* TAB 2: DEEP RESEARCH & CUSTOM PROMPT */}
          {activeTab === "research" && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Deep Technical Research</h2>
                  <p className="text-[11px] text-gray-500">
                    Input any prompt or question to gather facts, citations & SEO titles
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Topic, Prompt, or Question to Research
                </label>
                <textarea
                  rows={3}
                  value={researchPrompt}
                  onChange={(e) => setResearchPrompt(e.target.value)}
                  placeholder="e.g. How to connect n8n with WhatsApp Cloud API and OpenAI GPT-4 for client lead routing..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Specific Focus or Angle (Optional)
                </label>
                <input
                  type="text"
                  value={focusArea}
                  onChange={(e) => setFocusArea(e.target.value)}
                  placeholder="e.g. Enterprise security, ROI metrics, step-by-step setup"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>

              <button
                type="button"
                onClick={runDeepResearch}
                disabled={isResearching || !researchPrompt.trim()}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition-colors font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {isResearching ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Conducting AI Research...
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    Run Deep Research
                  </>
                )}
              </button>

              {/* Research Results */}
              {researchData && (
                <div className="space-y-4 pt-3 border-t border-gray-100 animate-fadeIn">
                  {/* Executive Summary */}
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block mb-1">
                      Executive Summary
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {researchData.executiveSummary}
                    </p>
                  </div>

                  {/* Suggested Titles */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                      Suggested SEO Titles (Click to select)
                    </label>
                    <div className="space-y-1.5">
                      {researchData.suggestedTitles.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedTopic(t);
                            setArticle((prev) => ({
                              ...prev,
                              title: t,
                              category: researchData.category || prev.category,
                            }));
                            toast.success(`Title set to: "${t}"`);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                            selectedTopic === t
                              ? "border-purple-500 bg-purple-50 font-semibold text-purple-900"
                              : "border-gray-200 hover:border-purple-300 text-gray-700 bg-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                      Key Technical Insights & Facts
                    </label>
                    <ul className="space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      {researchData.keyInsights.map((ins, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-purple-500">•</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reference Sources */}
                  {researchData.references && researchData.references.length > 0 && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 flex items-center gap-1 mb-1.5">
                        <Globe size={13} className="text-blue-500" />
                        Authoritative References & Sources
                      </label>
                      <div className="space-y-1.5">
                        {researchData.references.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2 rounded-lg border border-gray-200 hover:border-blue-400 bg-white text-xs group"
                          >
                            <div className="flex items-center justify-between text-blue-600 font-semibold">
                              <span>{ref.title}</span>
                              <ExternalLink size={12} className="opacity-0 group-hover:opacity-100" />
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 truncate">{ref.description}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => writeArticle()}
                    disabled={isWriting}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition-colors font-bold text-xs shadow-xs disabled:opacity-50"
                  >
                    {isWriting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    Draft Article From This Research
                  </button>
                </div>
              )}
            </div>
          )}

          {/* AI CONTENT GENERATION SETTINGS */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">AI Content Refinement Settings</h3>
                <p className="text-[11px] text-gray-500">Tune the voice, depth, and structural elements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Tone & Perspective
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-gray-800 outline-none transition-all"
                >
                  <option value="technical">Technical Deep Dive (Architect)</option>
                  <option value="tutorial">Hands-on Tutorial & Code</option>
                  <option value="executive">Executive Strategy & ROI</option>
                  <option value="case-study">Engineering Postmortem & Case Study</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Target Length & Depth
                </label>
                <select
                  value={depth}
                  onChange={(e) => setDepth(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs font-medium text-gray-800 outline-none transition-all"
                >
                  <option value="deep">Comprehensive Deep Dive (1,500+ words)</option>
                  <option value="standard">Standard Guide (1,000 words)</option>
                  <option value="concise">Compact Briefing (600 words)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-4 text-xs font-medium text-gray-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeTables}
                  onChange={(e) => setIncludeTables(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Comparison Tables</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeCode}
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Production Code Snippets</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeArchitectureFlow}
                  onChange={(e) => setIncludeArchitectureFlow(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Architecture Flows & Checklists</span>
              </label>
            </div>
          </div>

          {/* FREE AI IMAGE TOOLS & PROMPT GENERATOR */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Palette size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Free AI Image Studio</h3>
                  <p className="text-[11px] text-gray-500">Free-tier tools & copyable prompts</p>
                </div>
              </div>
            </div>

            {/* Visual Style Selection */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
                Cover Art Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setImageStyle("clean")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    imageStyle === "clean"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Minimalist 2D
                </button>
                <button
                  type="button"
                  onClick={() => setImageStyle("isometric")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    imageStyle === "isometric"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  3D Isometric
                </button>
                <button
                  type="button"
                  onClick={() => setImageStyle("dark")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                    imageStyle === "dark"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Cyber Glow
                </button>
              </div>
            </div>

            {/* AI Generation Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => generateStepFunImage()}
                disabled={!article.title || isGeneratingAiImage}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm disabled:opacity-50"
              >
                {isGeneratingAiImage ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                {isGeneratingAiImage ? "Generating with StepFun..." : "Generate AI Cover (StepFun)"}
              </button>

              <button
                type="button"
                onClick={() => generateImage()}
                disabled={!article.title || isGeneratingAiImage}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl font-medium text-xs transition-colors disabled:opacity-50"
              >
                <ImageIcon size={14} />
                Free Fallback (Pollinations AI)
              </button>
            </div>

            {/* External Free AI Tools Recommendations */}
            <div className="pt-3 border-t border-gray-100">
              <label className="text-[11px] font-bold text-gray-700 block mb-2">
                Recommended Free-Tier AI Generators
              </label>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">Ideogram.ai</span>
                    <span className="text-[11px] text-gray-500 block">10 free/day • Best for typography & diagrams</span>
                  </div>
                  <a
                    href="https://ideogram.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">Leonardo.ai</span>
                    <span className="text-[11px] text-gray-500 block">150 credits/day • Best for 3D renders</span>
                  </div>
                  <a
                    href="https://leonardo.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900">Playground.ai</span>
                    <span className="text-[11px] text-gray-500 block">500 free/day • High quality photo art</span>
                  </div>
                  <a
                    href="https://playground.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              {/* Ready Prompt to Copy */}
              {article.title && (
                <div className="mt-3 p-2.5 bg-gray-100/70 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase text-gray-600">
                      Copyable Prompt for Ideogram / Leonardo
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyPromptText(
                          `${article.title}, modern technology illustration, clean studio lighting, high resolution, 8k, professional tech aesthetic`,
                          "img-prompt"
                        )
                      }
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
                    >
                      {copiedPromptKey === "img-prompt" ? <Check size={12} /> : <Copy size={12} />}
                      {copiedPromptKey === "img-prompt" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-600 font-mono line-clamp-2">
                    {article.title}, modern technology illustration, clean studio lighting, high
                    resolution, 8k
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Article Editor (Always Fully Editable) */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Article Editor & SEO Preview
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Everything generated is completely editable before publishing.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Quick Toggle for Code Snippets */}
                <button
                  type="button"
                  onClick={() => setIncludeCode(!includeCode)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    includeCode
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "bg-gray-100 border-gray-200 text-gray-400 line-through hover:bg-gray-200"
                  }`}
                  title="Click to toggle Code Snippets on or off"
                >
                  Code: {includeCode ? "Included" : "Excluded"}
                </button>

                {/* Quick Toggle for Comparison Tables */}
                <button
                  type="button"
                  onClick={() => setIncludeTables(!includeTables)}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    includeTables
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "bg-gray-100 border-gray-200 text-gray-400 line-through hover:bg-gray-200"
                  }`}
                  title="Click to toggle Comparison Tables on or off"
                >
                  Tables: {includeTables ? "Included" : "Excluded"}
                </button>

                <button
                  type="button"
                  onClick={() => writeArticle()}
                  disabled={isWriting || !article.title}
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {isWriting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  Regenerate Body
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Article Title (H1)
              </label>
              <input
                type="text"
                required
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-gray-900 text-base transition-all"
                placeholder="Enter article title..."
              />
            </div>

            {/* Category & Excerpt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={article.category}
                  onChange={(e) => setArticle({ ...article, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium text-gray-800 transition-all"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="AI & Automation">AI & Automation</option>
                  <option value="Workflow Architecture">Workflow Architecture</option>
                  <option value="Mobile Engineering">Mobile Engineering</option>
                  <option value="Product Strategy">Product Strategy</option>
                  <option value="Case Studies">Case Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Estimated Read Time
                </label>
                <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-xs font-mono text-gray-600">
                  {Math.max(3, Math.ceil(article.content.split(/\s+/).filter(Boolean).length / 200))} min read ({article.content.split(/\s+/).filter(Boolean).length} words)
                </div>
              </div>
            </div>

            {/* Meta Description / Excerpt */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  SEO Meta Description / Excerpt
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    article.excerpt.length > 160 ? "text-amber-600 font-bold" : "text-gray-400"
                  }`}
                >
                  {article.excerpt.length}/160 chars
                </span>
              </div>
              <textarea
                rows={2}
                value={article.excerpt}
                onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
                placeholder="1-2 sentence meta description that appears in Google search results..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-gray-800 transition-all resize-none"
              />
            </div>

            {/* Target SEO Keywords */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={13} className="text-indigo-600" /> Target SEO Keywords
              </label>
              {targetKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {targetKeywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">
                  Keywords will populate when you generate topics or research.
                </p>
              )}
            </div>

            {/* Cover Image Uploader & Generator */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Cover Image
              </label>
              <BlogCoverImageUploader
                value={article.image}
                onChange={(url) => setArticle((prev) => ({ ...prev, image: url }))}
                articleTitle={article.title}
                articleContent={article.content}
                articleCategory={article.category}
                articleExcerpt={article.excerpt}
                initialPrompt={articleImagePrompt}
              />
            </div>

            {/* Markdown Content (Fully Editable) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Full Markdown Content
                </label>
                <span className="text-[11px] text-gray-400">Supports full GitHub Markdown</span>
              </div>
              <textarea
                value={article.content}
                onChange={(e) => setArticle({ ...article, content: e.target.value })}
                rows={18}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs text-gray-800 leading-relaxed resize-y transition-all"
                placeholder="# Introduction&#10;&#10;Generated article content will appear here and remains 100% editable..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
