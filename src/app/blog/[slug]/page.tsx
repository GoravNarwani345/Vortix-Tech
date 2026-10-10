import Link from "next/link";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { ArticleProgressBar } from "@/components/blog/ArticleProgressBar";
import { ArticleTOC } from "@/components/blog/ArticleTOC";
import { ArticleTakeaways } from "@/components/blog/ArticleTakeaways";
import { ArticleStickyCTA } from "@/components/blog/ArticleStickyCTA";
import { BlogCardImage } from "@/components/blog/BlogCardImage";
import { Metadata } from "next";
import Image from "next/image";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article || !article.isPublished) {
    return {};
  }

  return {
    title: article.title,
    description: article.excerpt,
    keywords: Array.from(
      new Set([
        article.category,
        ...article.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
        article.slug.replace(/-/g, " "),
        "Vortix Tech engineering",
        "tech insights",
      ])
    ),
    alternates: {
      canonical: `/blog/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.author],
      url: `https://vortixtech.com/blog/${article.slug}`,
      images: [
        {
          url: article.image && article.image.trim() !== "" ? article.image : "https://vortixtech.com/opengraph-image",
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image && article.image.trim() !== "" ? article.image : "https://vortixtech.com/opengraph-image"],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article || !article.isPublished) {
    notFound();
  }

  const readMinutes = parseInt(article.readTime) || 8;

  return (
    <div className="pt-20 bg-background min-h-screen">
      {/* Top Reading Progress Bar with Countdown */}
      <ArticleProgressBar totalReadMinutes={readMinutes} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: [article.image && article.image.trim() !== "" ? article.image : "https://vortixtech.com/opengraph-image"],
            datePublished: article.createdAt.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: [{
              "@type": "Organization",
              name: article.author,
              url: "https://vortixtech.com"
            }],
            publisher: {
              "@type": "Organization",
              name: "Vortix Tech",
              logo: {
                "@type": "ImageObject",
                url: "https://vortixtech.com/logo.webp"
              }
            }
          })
        }}
      />

      {/* Article Header */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-20 border-b border-gray-100">
        <div className="container-custom relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-semibold text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-accent text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Engineering Deep Dive
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
              <Tag size={14} /> {article.category}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
              <Clock size={14} /> {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-xs">
              {article.author.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{article.author}</p>
              <p className="text-gray-500 text-xs font-medium">{new Date(article.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Article Content Section */}
      <section className="py-12 sm:py-16">
        <div className="container-custom max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Sticky Table of Contents (Desktop Sidebar + Mobile Drawer) */}
            <ArticleTOC content={article.content} />

            {/* Main Article Body */}
            <div className="flex-1 min-w-0 max-w-3xl">
              {/* Cover Visual with self-healing fallback and adaptive aspect-ratio display */}
              <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-md relative border border-slate-200/80 bg-slate-950">
                <BlogCardImage
                  src={article.image}
                  alt={article.title}
                  category={article.category}
                  variant="detail"
                />
              </div>

              {/* Key Takeaways Card */}
              {article.excerpt && (
                <ArticleTakeaways
                  takeaways={[
                    article.excerpt,
                    "Verified architectural patterns tested under high-concurrency production workloads.",
                    "Concrete benchmarks, edge-case mitigation, and deployment checklists.",
                  ]}
                  readTime={article.readTime}
                />
              )}

              {/* Main Content with markdown enhancements */}
              <ArticleContent content={article.content} />
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Article Floating Consultation CTA */}
      <ArticleStickyCTA />
    </div>
  );
}
