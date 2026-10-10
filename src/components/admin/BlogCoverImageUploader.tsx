"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Wand2,
  Trash2,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogCoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  articleTitle?: string;
  articleContent?: string;
  articleCategory?: string;
  articleExcerpt?: string;
  initialPrompt?: string;
}

export function BlogCoverImageUploader({
  value,
  onChange,
  articleTitle = "",
  articleContent = "",
  articleCategory = "Technology",
  articleExcerpt = "",
  initialPrompt = "",
}: BlogCoverImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai" | "url">("ai");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [imageStyle, setImageStyle] = useState<"clean" | "isometric" | "dark" | "blueprint">("clean");
  const [urlInput, setUrlInput] = useState(value);
  const [promptText, setPromptText] = useState(initialPrompt);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isRenderingImage, setIsRenderingImage] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialPrompt if passed from parent
  useEffect(() => {
    if (initialPrompt && !promptText) {
      setPromptText(initialPrompt);
    }
  }, [initialPrompt]);

  // 1. Direct Computer File Upload (Chunked streaming for large files)
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP, AVIF).");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const CHUNK_SIZE = 768 * 1024; // 768 KB slices to prevent 413 reverse proxy rejections

    try {
      if (file.size > CHUNK_SIZE) {
        // Chunked upload
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadId = crypto.randomUUID();
        let uploadedUrl: string | null = null;

        for (let c = 0; c < totalChunks; c++) {
          const start = c * CHUNK_SIZE;
          const end = Math.min(file.size, start + CHUNK_SIZE);
          const chunkBlob = file.slice(start, end);
          const chunkFile = new File([chunkBlob], file.name, { type: file.type });

          const percent = Math.round(((c + 1) / totalChunks) * 100);
          setUploadProgress(percent);

          const formData = new FormData();
          formData.append("file", chunkFile);
          formData.append("fileName", file.name);
          formData.append("uploadId", uploadId);
          formData.append("chunkIndex", c.toString());
          formData.append("totalChunks", totalChunks.toString());

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Upload failed with status ${res.status}`);
          }

          const data = await res.json();
          if (data.completed && data.files?.[0]?.url) {
            uploadedUrl = data.files[0].url;
          }
        }

        if (uploadedUrl) {
          onChange(uploadedUrl);
          setUrlInput(uploadedUrl);
          toast.success("Cover image uploaded successfully!");
        } else {
          throw new Error("Failed to assemble uploaded file");
        }
      } else {
        // Standard single upload
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Upload failed with status ${res.status}`);
        }

        const data = await res.json();
        const uploadedUrl = data.files?.[0]?.url;

        if (uploadedUrl) {
          onChange(uploadedUrl);
          setUrlInput(uploadedUrl);
          toast.success("Cover image uploaded successfully!");
        } else {
          throw new Error("No image URL returned from upload server");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. Generate Contextual Prompt from Article Content
  const handleGeneratePromptFromArticle = async () => {
    if (!articleTitle.trim() && !articleContent.trim()) {
      toast.error("Please provide an article title or content first.");
      return;
    }

    setIsGeneratingPrompt(true);
    try {
      const res = await fetch("/api/admin/ai/image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleTitle,
          category: articleCategory,
          excerpt: articleExcerpt,
          content: articleContent,
          style: imageStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate prompt");
      }

      setPromptText(data.prompt);
      toast.success("Visual prompt generated from article context!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // 3. Render Image from Current Prompt via Pollinations AI
  const handleRenderImageFromPrompt = () => {
    const finalPrompt = promptText.trim() || articleTitle.trim();
    if (!finalPrompt) {
      toast.error("Please generate or enter an image prompt first.");
      return;
    }

    setIsRenderingImage(true);

    // Build optimized Pollinations AI URL
    const encoded = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    // Test image load before applying to state
    const img = new window.Image();
    img.src = imageUrl;
    img.onload = () => {
      onChange(imageUrl);
      setUrlInput(imageUrl);
      setIsRenderingImage(false);
      toast.success("Cover image generated from article prompt!");
    };
    img.onerror = () => {
      // Apply anyway as fallback
      onChange(imageUrl);
      setUrlInput(imageUrl);
      setIsRenderingImage(false);
      toast.success("Cover image link generated!");
    };
  };

  // 4. Copy Prompt to Clipboard
  const handleCopyPrompt = async () => {
    if (!promptText) return;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      toast.success("Prompt copied for Ideogram / Midjourney / Leonardo!");
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Fallback
    }
  };

  // 5. Direct URL Apply
  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a valid image URL.");
      return;
    }
    onChange(urlInput.trim());
    toast.success("Image URL applied!");
  };

  const handleClearImage = () => {
    onChange("");
    setUrlInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ai"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Wand2 size={14} className={activeTab === "ai" ? "text-emerald-600" : ""} />
          AI Prompt & Studio
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "upload"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <UploadCloud size={14} className={activeTab === "upload" ? "text-indigo-600" : ""} />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "url"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <LinkIcon size={14} className={activeTab === "url" ? "text-blue-600" : ""} />
          Web URL
        </button>
      </div>

      {/* Tab 1: AI Prompt Studio & Generation */}
      {activeTab === "ai" && (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3.5">
          {/* Visual Style Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-700 block mb-1.5">
              Visual Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setImageStyle("clean")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                  imageStyle === "clean"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
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
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
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
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cyber Glow
              </button>
              <button
                type="button"
                onClick={() => setImageStyle("blueprint")}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
                  imageStyle === "blueprint"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Blueprint
              </button>
            </div>
          </div>

          {/* Prompt Generator Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              Article Image Prompt
            </span>
            <button
              type="button"
              onClick={handleGeneratePromptFromArticle}
              disabled={isGeneratingPrompt || (!articleTitle.trim() && !articleContent.trim())}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
            >
              {isGeneratingPrompt ? (
                <Loader2 size={13} className="animate-spin text-indigo-600" />
              ) : (
                <Sparkles size={13} className="text-indigo-600" />
              )}
              {promptText ? "Regenerate from Article" : "Generate Prompt from Article"}
            </button>
          </div>

          {/* Editable Prompt Textarea */}
          <div className="relative">
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Click 'Generate Prompt from Article' above to automatically formulate an evocative image prompt connected to your article..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs text-gray-800 font-mono leading-relaxed resize-none"
            />
            {promptText && (
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                title="Copy prompt for Ideogram / Midjourney / Leonardo"
              >
                {copiedPrompt ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span className="text-[10px]">{copiedPrompt ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {/* Generate Image Button */}
          <button
            type="button"
            onClick={handleRenderImageFromPrompt}
            disabled={isRenderingImage || (!promptText.trim() && !articleTitle.trim())}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs disabled:opacity-50"
          >
            {isRenderingImage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Rendering Image from Prompt...
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Generate Image from Prompt (Pollinations AI)
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab 2: Direct Device Upload */}
      {activeTab === "upload" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-indigo-50/20 group"
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold text-gray-700">
                  Uploading image {uploadProgress ? `(${uploadProgress}%)` : "..."}
                </p>
                {uploadProgress !== null && (
                  <div className="w-48 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Click to browse or drag and drop image
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    PNG, JPG, WebP up to 25MB (automatically optimized)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Direct URL */}
      {activeTab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 font-mono transition-all"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Preview Card */}
      {value ? (
        <div className="relative aspect-[1200/630] rounded-xl overflow-hidden border border-gray-200 group bg-gray-900 shadow-sm">
          <img
            src={value}
            alt="Article Cover Preview"
            className="w-full h-full object-cover transition-transform group-hover:scale-[1.01]"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleClearImage}
              className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white text-xs transition-colors backdrop-blur-xs"
              title="Remove cover image"
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Cover Preview (1200 x 630)
          </div>
        </div>
      ) : (
        <div className="aspect-[1200/630] rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
          <ImageIcon size={28} className="text-gray-300 mb-1" />
          <span className="text-xs font-medium text-gray-400">No cover image selected</span>
        </div>
      )}
    </div>
  );
}
