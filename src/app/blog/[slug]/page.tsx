import Link from "next/link";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
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
    keywords: [article.category, "Vortix Tech blog", "tech article"],
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
          url: article.image,
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
      images: [article.image],
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

  return (
    <div className="pt-20 bg-background min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: [article.image],
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
                url: "https://vortixtech.com/logo.png"
              }
            }
          })
        }}
      />
      {/* Article Header */}
      <section className="relative overflow-hidden bg-white py-24 border-b border-gray-100">
        <div className="container-custom relative z-10 max-w-4xl mx-auto">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-accent font-semibold text-sm mb-10 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="text-accent text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Article
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
              <Tag size={14} /> {article.category}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
              <Clock size={14} /> {article.readTime}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {article.author.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{article.author}</p>
              <p className="text-gray-500 text-xs font-medium">{new Date(article.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-16 shadow-md relative">
            <Image 
              src={article.image} 
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8 pb-20">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </div>
      </section>
    </div>
  );
}
