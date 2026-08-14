"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock, User, Tag } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt: Date;
  author: string;
  image: string;
  excerpt: string;
  readTime: string;
};

export default function BlogContent({ posts }: { posts: Post[] }) {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-32">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-accent text-sm font-bold uppercase tracking-widest">
              Our Insights
            </span>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-gray-900 mt-6 mb-8">
              Latest <span className="text-accent">Articles</span>
            </h1>
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Thoughts, tutorials, and insights on software development, AI, automation, and tech trends.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Blog Content */}
      <section className="relative overflow-hidden bg-white py-24 sm:py-32 border-y border-gray-100">
        <div className="relative z-10 container-custom">
          
          {posts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-20"
            >
              <Link href={`/blog/${posts[0].slug}`}>
                <div className="premium-card group overflow-hidden grid lg:grid-cols-2 bg-white">
                  <div className="relative h-[300px] lg:h-[400px] overflow-hidden">
                    <img
                      src={posts[0].image}
                      alt={posts[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  </div>
                  
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-accent text-xs font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                        Featured
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                        <Tag size={14} /> {posts[0].category}
                      </span>
                    </div>
                    
                    <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-4 leading-tight group-hover:text-accent transition-colors">
                      {posts[0].title}
                    </h2>
                    
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                      {posts[0].excerpt}
                    </p>
                    
                    <div className="flex items-center gap-6 mt-auto">
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <User size={16} />
                        {posts[0].author}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Clock size={16} />
                        {posts[0].readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No articles found</h3>
              <p className="text-gray-600">Check back later for new content!</p>
            </div>
          )}

          {/* Rest of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.slice(1).map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="premium-card group h-full flex flex-col bg-white overflow-hidden">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-accent transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                          <Clock size={14} />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-accent flex items-center gap-1.5 text-sm font-bold group/link">
                          Read More <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
