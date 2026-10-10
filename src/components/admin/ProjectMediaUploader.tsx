"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Upload,
  Video,
  Image as ImageIcon,
  X,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  GripVertical,
  Play,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  MAX_PROJECT_IMAGES,
  MAX_PROJECT_VIDEOS,
  isVideoMedia,
  countMediaTypes,
} from "@/lib/mediaHelper";
import { compressImage } from "@/lib/imageCompression";

interface ProjectMediaUploaderProps {
  media: string[];
  onChange: (updatedMedia: string[]) => void;
}

export default function ProjectMediaUploader({
  media,
  onChange,
}: ProjectMediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [failedMedia, setFailedMedia] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { imageCount, videoCount } = countMediaTypes(media);
  const canAddMoreImages = imageCount < MAX_PROJECT_IMAGES;
  const canAddMoreVideos = videoCount < MAX_PROJECT_VIDEOS;
  const isUploadDisabled = !canAddMoreImages && !canAddMoreVideos;

  // Process a batch of dropped or selected files
  const processFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    let currentImages = imageCount;
    let currentVideos = videoCount;

    const filesToUpload: File[] = [];

    for (let i = 0; i < rawFiles.length; i++) {
      const file = rawFiles[i];
      const isImg = file.type.startsWith("image/");
      const isVid = file.type.startsWith("video/");

      if (!isImg && !isVid) {
        toast.error(`"${file.name}" skipped: Only images and videos are supported.`);
        continue;
      }

      if (isVid) {
        if (currentVideos >= MAX_PROJECT_VIDEOS) {
          toast.error(
            `Maximum ${MAX_PROJECT_VIDEOS} video allowed per project. "${file.name}" was skipped.`
          );
          continue;
        }

        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Video "${file.name}" exceeds 100MB limit.`);
          continue;
        }

        currentVideos++;
        filesToUpload.push(file);
      } else if (isImg) {
        if (currentImages >= MAX_PROJECT_IMAGES) {
          toast.error(
            `Maximum ${MAX_PROJECT_IMAGES} images allowed per project. "${file.name}" was skipped.`
          );
          continue;
        }

        if (file.size > 25 * 1024 * 1024) {
          toast.error(`Image "${file.name}" exceeds 25MB limit.`);
          continue;
        }

        currentImages++;

        // Client-side image optimization to WebP before uploading
        if (file.type !== "image/svg+xml") {
          try {
            setUploadProgressText(`Optimizing image ${file.name}...`);
            const compressed = await compressImage(file, {
              maxWidth: 1600,
              maxHeight: 1600,
              quality: 0.8,
            });

            const res = await fetch(compressed.dataUrl);
            const blob = await res.blob();
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".webp"),
              { type: "image/webp" }
            );
            filesToUpload.push(optimizedFile);
          } catch {
            filesToUpload.push(file);
          }
        } else {
          filesToUpload.push(file);
        }
      }
    }

    if (filesToUpload.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    const updatedMediaList = [...media];
    let uploadSuccessCount = 0;

    try {
      // Upload file-by-file sequentially to prevent 413 Payload Too Large and show live progress
      for (let i = 0; i < filesToUpload.length; i++) {
        const fileItem = filesToUpload[i];
        const isVid = isVideoMedia(fileItem.name) || fileItem.type.startsWith("video/");
        setUploadProgressText(
          `Uploading ${isVid ? "video" : "image"} ${i + 1} of ${filesToUpload.length} (${fileItem.name})...`
        );

        const formData = new FormData();
        formData.append("file", fileItem);

        try {
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          if (res.status === 413) {
            toast.error(
              `"${fileItem.name}" exceeds maximum upload limit (413). Please compress the file before uploading.`
            );
            continue;
          }

          let data: any = null;
          try {
            data = await res.json();
          } catch {
            toast.error(`Server error uploading "${fileItem.name}".`);
            continue;
          }

          if (res.ok && data?.success && Array.isArray(data.files) && data.files.length > 0) {
            const uploadedUrl = data.files[0].url;
            updatedMediaList.push(uploadedUrl);
            uploadSuccessCount++;
            onChange([...updatedMediaList]);
          } else {
            toast.error(data?.error || `Failed to upload "${fileItem.name}"`);
          }
        } catch (fileErr) {
          toast.error(
            fileErr instanceof Error
              ? fileErr.message
              : `Connection error while uploading "${fileItem.name}"`
          );
        }
      }

      if (uploadSuccessCount > 0) {
        toast.success(`Successfully uploaded ${uploadSuccessCount} file(s)!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload processing failed");
    } finally {
      setUploading(false);
      setUploadProgressText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploadDisabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isUploadDisabled) {
      toast.error(
        `Project limit reached (${MAX_PROJECT_IMAGES} images & ${MAX_PROJECT_VIDEOS} video).`
      );
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Item actions
  const handleRemove = (index: number) => {
    onChange(media.filter((_, i) => i !== index));
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const item = media[index];
    const remaining = media.filter((_, i) => i !== index);
    onChange([item, ...remaining]);
    toast.success("Set as cover thumbnail!");
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= media.length) return;
    const copy = [...media];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  // Drag and drop card reordering
  const handleItemDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
  };

  const handleItemDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const copy = [...media];
    const [movedItem] = copy.splice(draggedIndex, 1);
    copy.splice(dropIndex, 0, movedItem);
    onChange(copy);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with Live Quota Counters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-900">
            Project Media Upload
          </label>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload project screenshots and an optional showcase video using drag & drop.
          </p>
        </div>

        {/* Quota Badges */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              imageCount >= MAX_PROJECT_IMAGES
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            <ImageIcon size={13} />
            Images: {imageCount} / {MAX_PROJECT_IMAGES}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              videoCount >= MAX_PROJECT_VIDEOS
                ? "bg-purple-50 text-purple-800 border-purple-200"
                : "bg-gray-50 text-gray-700 border-gray-200"
            }`}
          >
            <Video size={13} />
            Video: {videoCount} / {MAX_PROJECT_VIDEOS} (Optional)
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!uploading && !isUploadDisabled) {
            fileInputRef.current?.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
          isUploadDisabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-80"
            : isDragOver
            ? "border-accent bg-accent/5 scale-[1.01] shadow-md ring-4 ring-accent/10 cursor-copy"
            : "border-gray-300 hover:border-gray-400 bg-gray-50/60 hover:bg-gray-50 cursor-pointer"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          disabled={uploading || isUploadDisabled}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center py-4">
            <Loader2 size={36} className="animate-spin text-accent mb-3" />
            <span className="text-sm font-semibold text-gray-900">{uploadProgressText}</span>
            <span className="text-xs text-gray-500 mt-1">
              Please wait while files are processed and uploaded...
            </span>
          </div>
        ) : isUploadDisabled ? (
          <div className="flex flex-col items-center py-2 text-gray-500">
            <AlertCircle size={28} className="text-amber-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">Project Media Limit Reached</p>
            <p className="text-xs text-gray-500 mt-1">
              You have added the maximum {MAX_PROJECT_IMAGES} images and {MAX_PROJECT_VIDEOS} video. Remove an item to upload a new one.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center mb-3 text-accent transition-transform group-hover:scale-110">
              <Upload size={24} />
            </div>
            <p className="text-sm font-bold text-gray-900">
              Drag & Drop your images and video here, or <span className="text-accent underline">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1">
                <ImageIcon size={13} /> Up to 5 Images (PNG, JPG, WebP, SVG, GIF)
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Video size={13} /> 1 Video (MP4, WebM, MOV up to 100MB)
              </span>
            </p>
            <span className="text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-0.5 mt-3">
              Multi-file upload & drag-and-drop reordering supported
            </span>
          </div>
        )}
      </div>

      {/* Uploaded Media Items Grid */}
      {media.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {media.length} media {media.length === 1 ? "item" : "items"} uploaded • Drag cards to reorder
            </span>
            <span className="font-medium text-gray-700">★ Item #1 is the Cover thumbnail</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map((item, index) => {
              const isVid = isVideoMedia(item);
              const isCover = index === 0;

              return (
                <div
                  key={`${item}-${index}`}
                  draggable
                  onDragStart={() => handleItemDragStart(index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDrop={(e) => handleItemDrop(e, index)}
                  className={`group relative aspect-video rounded-xl overflow-hidden border bg-gray-900 select-none transition-all shadow-sm ${
                    isCover ? "border-accent ring-2 ring-accent/20" : "border-gray-200"
                  } ${draggedIndex === index ? "opacity-30 scale-95" : "hover:shadow-md"}`}
                >
                  {/* Media Content Preview */}
                  {isVid ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                      {failedMedia[item] ? (
                        <div className="flex flex-col items-center justify-center p-2 text-center text-gray-400">
                          <Video size={24} className="mb-1 text-purple-400" />
                          <span className="text-[10px]">Video preview unavailable</span>
                        </div>
                      ) : (
                        <>
                          <video
                            src={item}
                            muted
                            playsInline
                            preload="metadata"
                            onError={() => setFailedMedia((prev) => ({ ...prev, [item]: true }))}
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm text-white flex items-center justify-center">
                              <Play size={14} className="ml-0.5" fill="white" />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    failedMedia[item] ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-2 text-center">
                        <ImageIcon size={24} className="mb-1 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Image preview unavailable</span>
                      </div>
                    ) : (
                      <img
                        src={item}
                        alt={`Project media ${index + 1}`}
                        onError={() => setFailedMedia((prev) => ({ ...prev, [item]: true }))}
                        className="w-full h-full object-cover"
                      />
                    )
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
                    {isCover && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white shadow-sm">
                        <Star size={10} fill="currentColor" /> COVER
                      </span>
                    )}
                    {isVid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
                        <Video size={10} /> VIDEO
                      </span>
                    )}
                  </div>

                  {/* Drag Handle Indicator */}
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="w-6 h-6 rounded-md bg-black/60 text-white flex items-center justify-center cursor-grab">
                      <GripVertical size={12} />
                    </span>
                  </div>

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 z-20">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-gray-300">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-sm"
                        title="Delete item"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewMediaUrl(item)}
                        className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/40 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1 transition-colors"
                        title="Preview"
                      >
                        <Eye size={12} /> View
                      </button>

                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleMakeCover(index)}
                          className="px-2.5 py-1 rounded-lg bg-accent hover:bg-accent/90 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                          title="Set as first/cover thumbnail"
                        >
                          <Star size={12} /> Cover
                        </button>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, "left")}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white disabled:opacity-20 transition-all"
                        title="Move left"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      <button
                        type="button"
                        disabled={index === media.length - 1}
                        onClick={() => handleMove(index, "right")}
                        className="p-1 rounded-md bg-white/20 hover:bg-white/40 text-white disabled:opacity-20 transition-all"
                        title="Move right"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal for Admin */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewMediaUrl(null)}
              className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-all"
            >
              <X size={18} />
            </button>

            {isVideoMedia(previewMediaUrl) ? (
              <video
                src={previewMediaUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] w-full object-contain"
              />
            ) : (
              <img
                src={previewMediaUrl}
                alt="Full preview"
                className="max-h-[80vh] w-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
