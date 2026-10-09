"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ProjectSeoAuditCard from "@/components/admin/ProjectSeoAuditCard";
import ProjectMediaUploader from "@/components/admin/ProjectMediaUploader";

type ProjectData = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string;
  liveUrl: string;
  githubUrl: string;
  isPublished: boolean;
  images: string[];
};

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Web App",
    "Mobile App",
    "AI & Automation",
    "Design & Cloud",
    "Development",
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories?scope=PORTFOLIO");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data.map((c: { name: string }) => c.name));
        }
      } catch {
        // Keep fallback categories
      }
    })();
  }, []);

  const [formData, setFormData] = useState<ProjectData>({
    id: "",
    title: "",
    category: "Web App",
    description: "",
    tags: "",
    liveUrl: "",
    githubUrl: "",
    isPublished: true,
    images: [],
  });

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/portfolio/${id}`);
        if (res.status === 404) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active && data.success) {
          const p = data.data;
          setFormData({
            id: p.id,
            title: p.title || "",
            category: p.category || "Web App",
            description: p.description || "",
            tags: p.tags || "",
            liveUrl: p.liveUrl || "",
            githubUrl: p.githubUrl || "",
            isPublished: p.isPublished ?? true,
            images: p.images || [],
          });
          setImages(p.images || []);
        }
      } catch {
        if (active) toast.error("Failed to load project");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const addTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    const currentTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    if (currentTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast("Tag already added");
      setTagInput("");
      return;
    }
    const updated = [...currentTags, trimmed].join(", ");
    setFormData((prev) => ({ ...prev, tags: updated }));
    setTagInput("");
  };

  const removeTag = (indexToRemove: number) => {
    const currentTags = formData.tags
      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    const updated = currentTags.filter((_, i) => i !== indexToRemove).join(", ");
    setFormData((prev) => ({ ...prev, tags: updated }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      e.stopPropagation();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && formData.tags) {
      const currentTags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (currentTags.length > 0) {
        removeTag(currentTags.length - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, images }),
      });

      if (res.status === 413) {
        toast.error(
          "Request entity too large (413). Please reduce the number of images or configure server upload limits."
        );
        return;
      }

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        toast.error(`Server error (${res.status}). Server returned an invalid response.`);
        return;
      }

      if (res.ok && data?.success) {
        toast.success("Project updated successfully!");
        router.push("/admin/portfolio");
      } else {
        toast.error(data?.error || "Failed to update project");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        <Loader2 className="animate-spin mr-3" size={24} /> Loading project...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto py-32 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Project not found</h1>
        <Link href="/admin/portfolio" className="text-blue-600 hover:underline">
          Back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/portfolio"
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
          <p className="text-gray-500 mt-1">Update your portfolio case study</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Prevent accidental form submission when pressing Enter inside text inputs
          if (e.key === "Enter" && (e.target as HTMLElement)?.tagName === "INPUT") {
            e.preventDefault();
          }
        }}
        className="space-y-8"
      >
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Project Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="e.g. AI E-commerce Agent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                {!categories.includes(formData.category) && formData.category && (
                  <option value={formData.category}>{formData.category}</option>
                )}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <ProjectMediaUploader media={images} onChange={setImages} />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none"
              placeholder="Describe the project, problem solved, and results achieved..."
            />
          </div>

          {/* Interactive Tags System */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">
                Tags & Tech Stack <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-400">Type tag & press Enter or comma</span>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-2 mb-2.5 min-h-[32px]">
              {formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-semibold animate-fadeIn"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                      title="Remove tag"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
            </div>

            {/* Tag Input Field */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="e.g. Next.js, React, Tailwind CSS (press Enter or comma)"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors shrink-0"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* AI SEO Audit & Keyword Suggestion */}
          <div className="mb-6">
            <ProjectSeoAuditCard
              title={formData.title}
              category={formData.category}
              description={formData.description}
              tags={formData.tags}
              liveUrl={formData.liveUrl}
              githubUrl={formData.githubUrl}
              onApplyTags={(newTags) => setFormData((prev) => ({ ...prev, tags: newTags }))}
              onApplyTitle={(newTitle) => setFormData((prev) => ({ ...prev, title: newTitle }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Live URL (Optional)</label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">GitHub URL (Optional)</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">Published</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-black transition-colors font-bold disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
