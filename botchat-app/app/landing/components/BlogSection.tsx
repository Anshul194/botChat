"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/blogs", { params: { status: "published", per_page: 3 } });
        if (res.data.success || res.data.is_success) {
          // Take the latest 3
          setPosts((res.data.data || []).slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load blogs for landing", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF2D78]/10 border border-[#FF2D78]/20 text-[#FF2D78] font-bold text-sm tracking-wide mb-6">
              <BookOpen size={16} />
              <span>THE PLAYBOOK</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#0f0f0f] leading-tight">
              Latest from our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#ff8cc8]">Blog</span>
            </h2>
          </div>
          <Link href="/blog" className="hidden md:flex items-center gap-2 font-bold text-gray-600 hover:text-[#FF2D78] transition-colors group pb-2">
            View All Posts
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="h-[400px] bg-slate-50 animate-pulse rounded-[32px]" />)
          ) : (
            posts.map((post, i) => (
              <motion.a
                href={`/blog/${post.slug || post.id}`}
                key={post.id || i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-[#FF2D78]/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative w-full h-[240px] overflow-hidden bg-gray-100">
                  <img
                    src={post.featured_image_url || post.featured_image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=800"}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {post.category && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-[#FF2D78] shadow-sm">
                      {post.category?.name || "General"}
                    </div>
                  )}
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                    {new Date(post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight mb-4 group-hover:text-[#FF2D78] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-1 line-clamp-3">
                    {post.short_description || post.content?.replace(/<[^>]+>/g, '') || "Read full article..."}
                  </p>

                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between font-bold text-[13px] uppercase tracking-widest text-[#0f0f0f] group-hover:text-[#FF2D78] transition-colors">
                    <span>Read Article</span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#FF2D78]/10 flex items-center justify-center transition-colors">
                      <ArrowRight size={16} className="-rotate-45 group-hover:rotate-0 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))
          )}
        </div>

        {/* Mobile Button */}
        <button className="md:hidden w-full mt-10 py-4 rounded-full border-2 border-gray-200 font-bold text-gray-700 flex items-center justify-center gap-2 hover:border-[#FF2D78] hover:text-[#FF2D78] transition-colors">
          View All Posts <ArrowRight size={18} />
        </button>

      </div>
    </section>
  );
}
