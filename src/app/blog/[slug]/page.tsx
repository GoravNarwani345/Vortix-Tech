import Link from "next/link";
import { ArrowLeft, Clock, User, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

export const revalidate = 60; // Revalidate every 60 seconds

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
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-16 shadow-md">
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-full h-full object-cover"
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
