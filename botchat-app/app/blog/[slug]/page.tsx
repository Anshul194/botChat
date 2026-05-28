"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Calendar, Clock, Facebook, Twitter,
  Linkedin, Check, Loader2, Tag, User
} from "lucide-react";
import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";
import api from "@/lib/api";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = use(params);

  const [post, setPost] = useState<any>(null);
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the single blog by id or slug
        const [blogRes, latestRes] = await Promise.all([
          api.get(`/blogs/${slug}`),
          api.get("/blogs", { params: { status: "published", per_page: 4 } }),
        ]);

        if (blogRes.data.success || blogRes.data.is_success) {
          setPost(blogRes.data.data);
        } else {
          setNotFound(true);
        }

        if (latestRes.data.success || latestRes.data.is_success) {
          // Exclude the current post from sidebar
          const all = latestRes.data.data || [];
          setLatestPosts(all.filter((p: any) => String(p.id) !== String(slug) && p.slug !== slug).slice(0, 3));
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar forceLight={true} />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm font-semibold">Loading article...</span>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (notFound || !post) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar forceLight={true} />
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <h2 className="text-2xl font-black text-gray-900">Article not found</h2>
          <p className="text-gray-500">This post may have been removed or the link is broken.</p>
          <Link href="/blog" className="px-6 py-3 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition">
            ← Back to Blog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const bannerUrl = post.banner_image_url || post.banner_image || post.featured_image_url || post.featured_image;
  const authorAvatarUrl = post.author_image_url || post.author_image;

  return (
    <main className="min-h-screen bg-white">
      <Navbar forceLight={true} />

      <article className="pt-28 pb-24">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#FF2D78] transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col items-center"
          >
            {/* Category + read time */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {post.category?.name && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] text-xs font-black uppercase tracking-widest">
                  <Tag size={10} />
                  {post.category.name}
                </span>
              )}
              {post.reading_time && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm font-semibold">
                  <Clock size={14} />
                  <span>{post.reading_time} min read</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8 max-w-3xl">
              {post.title}
            </h1>

            {/* Short description */}
            {post.short_description && (
              <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-8">
                {post.short_description}
              </p>
            )}

            {/* Author + date + share */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-y border-gray-100 py-6 w-full max-w-2xl">
              <div className="flex items-center gap-4">
                {authorAvatarUrl ? (
                  <img src={authorAvatarUrl} alt={post.author_name} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={20} className="text-gray-400" />
                  </div>
                )}
                <div className="text-left">
                  <p className="text-gray-900 font-bold">{post.author_name || "BotChat Team"}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    {post.published_at && (
                      <>
                        <Calendar size={12} />
                        <span>{formatDate(post.published_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-[1px] h-10 bg-gray-200" />

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 mr-1">Share:</span>
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Linkedin, label: "LinkedIn" },
                ].map(({ Icon, label }) => (
                  <button
                    key={label}
                    aria-label={`Share on ${label}`}
                    className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#FF2D78] hover:text-white transition-all"
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Banner / Hero Image */}
        {bannerUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="max-w-6xl mx-auto px-6 mb-16"
          >
            <div className="w-full aspect-[21/9] rounded-[32px] overflow-hidden bg-gray-100">
              <img src={bannerUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        )}

        {/* Main Content + Sidebar */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-16 items-start">

          {/* Article Body */}
          <div className="min-w-0">
            <div
              className="max-w-none
                                [&>h1]:text-4xl [&>h1]:font-black [&>h1]:text-gray-900 [&>h1]:mb-6 [&>h1]:mt-10
                                [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-6
                                [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-4
                                [&>p]:text-gray-600 [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-lg
                                [&>a]:text-[#FF2D78] [&>a]:font-medium hover:[&>a]:underline
                                [&>blockquote]:border-l-4 [&>blockquote]:border-[#FF2D78] [&>blockquote]:bg-gray-50 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-2xl [&>blockquote]:font-medium [&>blockquote]:text-gray-900 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-xl
                                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-3 [&>ol]:mb-8 [&>ol>li]:text-gray-600 [&>ol>li]:text-lg
                                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-3 [&>ul]:mb-8 [&>ul>li]:text-gray-600 [&>ul>li]:text-lg
                                [&_strong]:text-gray-900 [&_strong]:font-bold
                                [&>img]:rounded-2xl [&>img]:w-full [&>img]:my-8
                                [&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:rounded-2xl [&>pre]:p-6 [&>pre]:my-8 [&>pre]:overflow-x-auto
                                [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* CTA */}
            <div className="mt-20 p-10 rounded-[32px] bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2D78] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <h3 className="text-3xl font-black text-white mb-4 relative z-10">Ready to grow faster?</h3>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">
                Join 11,000+ creators automating their DMs and skyrocketing their sales with botChat.
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF2D78] text-white font-bold tracking-wide hover:bg-[#e7266a] hover:scale-105 transition-all shadow-xl shadow-[#FF2D78]/20 relative z-10"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="sticky top-32 space-y-10 hidden lg:block">

            {/* Latest Articles */}
            {latestPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1.5 h-6 bg-[#FF2D78] rounded-full" />
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Articles</h3>
                </div>
                <div className="space-y-6">
                  {latestPosts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/blog/${p.slug || p.id}`}
                      className="group flex gap-4 items-center"
                    >
                      <div className="w-24 h-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        {(p.featured_image_url || p.featured_image) ? (
                          <img
                            src={p.featured_image_url || p.featured_image}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                        )}
                      </div>
                      <div>
                        {p.category?.name && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF2D78] mb-1 block">
                            {p.category.name}
                          </span>
                        )}
                        <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#FF2D78] transition-colors line-clamp-2 mb-1">
                          {p.title}
                        </h4>
                        {p.published_at && (
                          <span className="text-xs font-semibold text-gray-400">{formatDate(p.published_at)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Widget */}
            <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 text-center relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF2D78] rounded-full blur-[60px] opacity-10" />
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-[#FF2D78]">
                <Check size={20} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">The Playbook</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Get the latest growth hacks and automation strategies in your inbox.
              </p>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF2D78] transition-colors mb-3"
              />
              <button className="w-full py-3 rounded-xl bg-[#0f0f0f] text-white text-xs font-black uppercase tracking-widest hover:bg-[#FF2D78] transition-colors">
                Subscribe
              </button>
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </main>
  );
}
