"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Wand2, ArrowLeft, Image as ImageIcon, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function NewBlogPage() {
  const router = useRouter();
  
  // State
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Article Data
  const [article, setArticle] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    image: "",
  });

  const generateTopics = async () => {
    setIsGeneratingTopics(true);
    try {
      const res = await fetch("/api/admin/ai/topics", { method: "POST" });
      const data = await res.json();
      if (data.topics) {
        setTopics(data.topics);
        toast.success("Topics generated!");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to generate topics");
    } finally {
      setIsGeneratingTopics(false);
    }
  };

  const writeArticle = async () => {
    if (!selectedTopic) return toast.error("Select a topic first");
    
    setIsWriting(true);
    try {
      const res = await fetch("/api/admin/ai/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });
      const data = await res.json();
      
      if (data.article) {
        setArticle({
          ...article,
          title: data.article.title,
          excerpt: data.article.excerpt,
          category: data.article.category,
          content: data.article.content,
        });
        toast.success("Article written successfully!");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error("Failed to write article");
    } finally {
      setIsWriting(false);
    }
  };

  const generateImage = () => {
    if (!article.title) return toast.error("Generate an article first to get a title.");
    
    const prompt = encodeURIComponent(`${article.title} modern technology abstract high quality 4k digital art`);
    const url = `https://image.pollinations.ai/prompt/${prompt}?width=1200&height=630&nologo=true`;
    
    setArticle({ ...article, image: url });
    toast.success("Image generated!");
  };

  const saveArticle = async () => {
    if (!article.title || !article.content || !article.image) {
      return toast.error("Please fill all fields (generate article and image).");
    }

    setIsSaving(true);
    try {
      const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      const finalSlug = `${slug}-${Date.now()}`;
      
      const readTime = `${Math.max(3, Math.ceil(article.content.split(" ").length / 200))} min read`;

      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          slug: finalSlug,
          readTime,
          isPublished: true
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      
      toast.success("Article published!");
      router.push("/admin/blog");
    } catch (error) {
      toast.error("Failed to publish article");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">AI Blog Studio</h1>
          <p className="text-gray-500">Generate professional blog posts using Gemini AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Tools */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-500" /> 1. Idea Generation
            </h2>
            <button
              onClick={generateTopics}
              disabled={isGeneratingTopics}
              className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
            >
              {isGeneratingTopics ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
              Suggest Topics
            </button>
            
            {topics.length > 0 && (
              <div className="mt-4 space-y-2">
                {topics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTopic(t)}
                    className={`w-full text-left p-3 rounded-lg text-sm border transition-colors ${selectedTopic === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-300 text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wand2 size={18} className="text-purple-500" /> 2. Write Article
            </h2>
            <p className="text-sm text-gray-500 mb-4">Select a topic above, then generate the full markdown article.</p>
            <button
              onClick={writeArticle}
              disabled={isWriting || !selectedTopic}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
            >
              {isWriting ? <Loader2 size={18} className="animate-spin" /> : "Generate Content"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon size={18} className="text-green-500" /> 3. Cover Image
            </h2>
            <p className="text-sm text-gray-500 mb-4">Generate a cover image based on the article title.</p>
            <button
              onClick={generateImage}
              disabled={!article.title}
              className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
            >
              Generate Image
            </button>
          </div>
        </div>

        {/* Right Column: Editor / Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-900 text-xl">Article Content</h2>
              <button
                onClick={saveArticle}
                disabled={isSaving || !article.title}
                className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Publish
              </button>
            </div>

            <div className="space-y-4 flex-1">
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

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {article.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <img src={article.image} alt="Cover" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                </div>
              )}

              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Markdown Content</label>
                <textarea
                  value={article.content}
                  onChange={(e) => setArticle({ ...article, content: e.target.value })}
                  className="w-full flex-1 min-h-[400px] px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed resize-y"
                  placeholder="Generated markdown will appear here..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
