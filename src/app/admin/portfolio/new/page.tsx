"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, X, Upload, Loader2, Link as LinkIcon, Check } from "lucide-react";
import toast from "react-hot-toast";
import ProjectSeoAuditCard from "@/components/admin/ProjectSeoAuditCard";
import { compressImage, formatBytes } from "@/lib/imageCompression";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<string[]>([
    "Web App",
    "Mobile App",
    "AI & Automation",
    "Design & Cloud",
    "Development",
  ]);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "Web App",
    description: "",
    tags: "",
    liveUrl: "",
    githubUrl: "",
    isPublished: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/categories?scope=PORTFOLIO");
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const names: string[] = json.data.map((c: { name: string }) => c.name);
          setCategories(names);
          if (!names.includes(formData.category)) {
            setFormData((prev) => ({ ...prev, category: names[0] }));
          }
        }
      } catch {
        // Keep fallback categories
      }
    })();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Original image must be less than 20MB");
      return;
    }

    setCompressing(true);
    const toastId = toast.loading("Optimizing & compressing image...");

    try {
      const result = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.8,
      });

      setImages((prev) => [...prev, result.dataUrl]);
      toast.success(
        `Optimized! ${formatBytes(result.originalSize)} -> ${formatBytes(result.compressedSize)} (${result.compressionRatio}% smaller)`,
        { id: toastId }
      );
    } catch {
      toast.error("Failed to process image", { id: toastId });
    } finally {
      setCompressing(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    setImages((prev) => [...prev, trimmed]);
    setImageUrl("");
    setShowUrlInput(false);
    toast.success("Image URL added!");
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        images,
      };

      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        toast.success("Project created successfully!");
        router.push("/admin/portfolio");
      } else {
        toast.error(data?.error || "Failed to create project");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const [tagInput, setTagInput] = useState("");

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

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/portfolio"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">New Project</h1>
            <p className="text-gray-500 mt-1">Add a new portfolio project</p>
          </div>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-900">Project Images</label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <LinkIcon size={12} />
                {showUrlInput ? "Hide URL input" : "+ Add image via URL"}
              </button>
            </div>

            {showUrlInput && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="Paste direct image URL (https://...)"
                  className="flex-1 px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-black transition-colors"
                >
                  Add URL
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-gray-100">
                  <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <label
                className={`aspect-video rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-accent transition-all ${
                  compressing ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {compressing ? (
                  <>
                    <Loader2 size={24} className="mb-2 animate-spin text-indigo-600" />
                    <span className="text-xs font-medium text-indigo-600">Compressing...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="mb-2" />
                    <span className="text-sm font-medium">Upload File</span>
                    <span className="text-[10px] text-gray-400 mt-0.5">Auto-compressed</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={compressing}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
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
              <span className="ml-3 text-sm font-medium text-gray-900">Publish Immediately</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-black transition-colors font-bold disabled:opacity-70"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save size={20} /> Save Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
