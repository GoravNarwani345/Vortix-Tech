"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import toast from "react-hot-toast";

export function ArticleSelectionShare() {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 5 || text.length > 500) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      // Check if selection is within the article rendered body
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element = container instanceof Element ? container : container.parentElement;
      if (!element || !element.closest(".article-rendered-body")) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleCopyQuote = async () => {
    if (!selectedText) return;
    try {
      const quote = `"${selectedText}" — via Vortix Tech Engineering`;
      await navigator.clipboard.writeText(quote);
      setCopied(true);
      toast.success("Quote copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setPosition(null);
      }, 1500);
    } catch {
      toast.error("Failed to copy quote");
    }
  };

  const handleShareOnX = () => {
    if (!selectedText) return;
    const url = window.location.href;
    const text = `"${selectedText.slice(0, 180)}..."`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setPosition(null);
  };

  const handleShareOnLinkedIn = () => {
    const url = window.location.href;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setPosition(null);
  };

  if (!position || !selectedText) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -100%)",
      }}
      className="z-50 flex items-center gap-1 p-1 rounded-xl bg-gray-900 text-white shadow-xl border border-gray-800 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
    >
      <button
        type="button"
        onClick={handleCopyQuote}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors"
        title="Copy Quote"
      >
        {copied ? (
          <>
            <Check size={13} className="text-emerald-400" />
            <span className="text-emerald-400 text-[11px]">Copied</span>
          </>
        ) : (
          <>
            <Copy size={13} className="text-gray-300" />
            <span className="text-gray-200 text-[11px]">Copy Quote</span>
          </>
        )}
      </button>

      <div className="w-px h-4 bg-gray-800" />

      <button
        type="button"
        onClick={handleShareOnX}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
        title="Share on X"
      >
        <span className="text-[11px] font-bold">X</span>
      </button>

      <button
        type="button"
        onClick={handleShareOnLinkedIn}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
        title="Share on LinkedIn"
      >
        <Share2 size={13} />
      </button>
    </div>
  );
}
