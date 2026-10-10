"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Terminal } from "lucide-react";

interface ArticleContentProps {
  content: string;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children for copying
  const rawText = React.Children.toArray(children)
    .map((child) => (typeof child === "string" ? child : ""))
    .join("");

  const language = className ? className.replace("language-", "") : "plaintext";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-800 bg-gray-950 shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs font-mono text-gray-400">
        <span className="flex items-center gap-1.5 font-medium text-gray-300">
          <Terminal size={13} className="text-indigo-400" />
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-100 py-1 px-2 rounded-md hover:bg-gray-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span className="font-sans text-[11px]">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm text-gray-200 font-mono leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="article-rendered-body max-w-none text-gray-700 leading-relaxed space-y-6 pb-20">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ ...props }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-gray-200 shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-sm text-gray-700" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-900 uppercase tracking-wider" {...props} />
          ),
          tbody: ({ ...props }) => (
            <tbody className="divide-y divide-gray-100 bg-white" {...props} />
          ),
          tr: ({ ...props }) => (
            <tr className="hover:bg-gray-50/70 transition-colors" {...props} />
          ),
          th: ({ ...props }) => (
            <th className="px-5 py-3.5 font-semibold text-gray-900 text-xs tracking-wider" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-5 py-3.5 text-sm text-gray-700 align-top leading-normal" {...props} />
          ),
          pre: ({ children, ...props }) => {
            // Find code element inside pre
            const codeEl = React.isValidElement(children) ? children : null;
            if (codeEl) {
              const codeProps = codeEl.props as { className?: string; children?: React.ReactNode };
              return (
                <CodeBlock className={codeProps.className}>
                  {codeProps.children}
                </CodeBlock>
              );
            }
            return (
              <pre className="my-6 p-4 rounded-xl overflow-x-auto bg-gray-950 text-gray-200 font-mono text-xs sm:text-sm border border-gray-800" {...props}>
                {children}
              </pre>
            );
          },
          code: ({ className, children, ...props }) => {
            // Check if inline
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-gray-100 text-indigo-700 font-mono text-xs font-semibold border border-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ ...props }) => (
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mt-12 mb-6 pb-3 border-b border-gray-200" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-100" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-3" {...props} />
          ),
          h4: ({ ...props }) => (
            <h4 className="text-lg font-bold text-gray-900 mt-6 mb-2" {...props} />
          ),
          blockquote: ({ ...props }) => (
            <blockquote className="my-6 pl-4 pr-3 py-3 border-l-4 border-indigo-600 bg-indigo-50/50 rounded-r-xl italic text-gray-800 text-base" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul className="my-4 ml-6 list-disc space-y-2 text-gray-700 leading-relaxed text-base" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol className="my-4 ml-6 list-decimal space-y-2 text-gray-700 leading-relaxed text-base" {...props} />
          ),
          li: ({ ...props }) => (
            <li className="pl-1 leading-relaxed" {...props} />
          ),
          p: ({ ...props }) => (
            <p className="my-4 text-base sm:text-lg leading-relaxed text-gray-700 font-normal" {...props} />
          ),
          a: ({ ...props }) => (
            <a className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          hr: ({ ...props }) => (
            <hr className="my-10 border-gray-200" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
