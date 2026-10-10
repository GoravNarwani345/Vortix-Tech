"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Image as ImageIcon, Save, RefreshCw, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import { BlogCoverImageUploader } from "@/components/admin/BlogCoverImageUploader";

type Article = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  readTime: string;
  isPublished: boolean;
};

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [article, setArticle] = useState<Article>({
    id: "",
    title: "",
    category: "",
    excerpt: "",
    content: "",
    image: "",
    readTime: "",
    isPublished: true,
  });

  const [includeCode, setIncludeCode] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/blog/${id}`);
        if (res.status === 404) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active && data.success) setArticle(data.data);
      } catch {
        if (active) toast.error("Failed to load article");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const rewriteArticle = async () => {
    if (!article.title) return toast.error("Please add a title first.");
    setIsRewriting(true);
    try {
      const res = await fetch("/api/admin/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: article.title,
          category: article.category,
          includeCode,
          includeTables,
          tone: "technical",
          depth: "deep",
        }),
      });

      const text = await res.text();
      let data: { success?: boolean; error?: string; details?: string; article?: any };
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status === 504) {
          throw new Error("The AI rewriting timed out (504 Gateway Timeout). Please choose a faster model in Admin Settings.");
        }
        throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 120)}`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to rewrite article");
      }

      setArticle((prev) => ({
        ...prev,
        content: data.article.content,
        excerpt: data.article.excerpt || prev.excerpt,
        readTime: data.article.readTime || prev.readTime,
      }));
      toast.success("Article body rewritten via AI!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rewrite article");
    } finally {
      setIsRewriting(false);
    }
  };

  const generateStepFunImage = async () => {
    if (!article.title) return toast.error("Add a title first.");
    setIsGeneratingImage(true);
    try {
      const res = await fetch("/api/admin/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${article.title}, clean modern tech digital illustration, highly detailed, 4k digital art`,
          size: "1024x1024",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to generate image");
      }

      setArticle((prev) => ({ ...prev, image: data.url }));
      toast.success("Cover image updated with StepFun AI!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate AI image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const saveArticle = async () => {
    if (!article.title || !article.content) {
      return toast.error("Title and content are required.");
    }

    setIsSaving(true);
    try {
      const readTime = `${Math.max(
        3,
        Math.ceil(article.content.split(" ").length / 200)
      )} min read`;

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          category: article.category,
          excerpt: article.excerpt,
          content: article.content,
          image: article.image,
          readTime,
          isPublished: article.isPublished,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Article updated!");
      router.push("/admin/blog");
    } catch {
      toast.error("Failed to update article");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        <Loader2 className="animate-spin mr-3" size={24} /> Loading article...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Article not found</h1>
        <Link href="/admin/blog" className="text-blue-600 hover:underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-20"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/blog"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Article</h1>
          <p className="text-gray-500">Update and republish your blog post.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-gray-900 text-xl">Article Content</h2>
          <button
            onClick={saveArticle}
            disabled={isSaving}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Article title..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={article.category}
                onChange={(e) => setArticle({ ...article, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Read Time
              </label>
              <input
                type="text"
                value={article.readTime}
                onChange={(e) => setArticle({ ...article, readTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5 min read"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={article.excerpt}
              onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Short summary shown on the blog listing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
            <BlogCoverImageUploader
              value={article.image}
              onChange={(url) => setArticle((prev) => ({ ...prev, image: url }))}
              articleTitle={article.title}
              articleContent={article.content}
              articleCategory={article.category}
              articleExcerpt={article.excerpt}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Markdown Content
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeCode(!includeCode)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    includeCode
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "bg-gray-100 border-gray-200 text-gray-400 line-through hover:bg-gray-200"
                  }`}
                  title="Toggle Code Snippets"
                >
                  Code: {includeCode ? "Included" : "Excluded"}
                </button>

                <button
                  type="button"
                  onClick={() => setIncludeTables(!includeTables)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    includeTables
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                      : "bg-gray-100 border-gray-200 text-gray-400 line-through hover:bg-gray-200"
                  }`}
                  title="Toggle Comparison Tables"
                >
                  Tables: {includeTables ? "Included" : "Excluded"}
                </button>

                <button
                  type="button"
                  onClick={rewriteArticle}
                  disabled={isRewriting || !article.title}
                  className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 py-1 px-3 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isRewriting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  AI Rewrite Body
                </button>
              </div>
            </div>
            <textarea
              value={article.content}
              onChange={(e) => setArticle({ ...article, content: e.target.value })}
              className="w-full min-h-[400px] px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed resize-y"
              placeholder="Markdown content..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={article.isPublished}
                onChange={(e) =>
                  setArticle({ ...article, isPublished: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                Published
              </span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
