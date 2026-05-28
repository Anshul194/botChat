"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Search, Calendar, Clock, ArrowRight,
    TrendingUp, Zap, Sparkles, MessageSquare, Loader2
} from "lucide-react";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";
import api from "@/lib/api";

export default function BlogPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | string>("All");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/blog-categories");
                if (res.data.success || res.data.is_success) {
                    setCategories(res.data.data || []);
                }
            } catch (e) { }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await api.get("/blogs", {
                    params: {
                        status: "published",
                        search,
                        category_id: activeCategory !== "All" ? activeCategory : undefined
                    }
                });
                if (res.data.success || res.data.is_success) {
                    setBlogs(res.data.data || []);
                }
            } catch (e) {
            } finally {
                setLoading(false);
            }
        };
        const timeout = setTimeout(fetchBlogs, 500);
        return () => clearTimeout(timeout);
    }, [activeCategory, search]);

    const featuredPost = blogs.length > 0 ? blogs.find(b => b.featured === 1) || blogs[0] : null;
    const feedPosts = blogs.filter(b => b.id !== featuredPost?.id);

    return (
        <main className="min-h-screen bg-white">
            <Navbar forceLight={true} />

            {/* High-Impact Blog Hero */}
            <section className="relative pt-32 pb-16 overflow-hidden bg-[#06000d]">
                {/* Visual Background */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#FF2D78]/20 blur-[150px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[20%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px]" />
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    {loading && blogs.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-[#FF2D78] animate-spin" />
                        </div>
                    ) : featuredPost ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                        >
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 text-pink-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10 backdrop-blur-md">
                                    <TrendingUp className="w-3 h-3" />
                                    {featuredPost.category?.name || "Editorial Spotlight"}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-[1000] text-white mb-6 tracking-tighter leading-[1] decoration-[#FF2D78]/30 underline decoration-4 underline-offset-[8px]">
                                    {featuredPost.title}
                                </h1>
                                <p className="text-lg text-gray-400 mb-8 leading-relaxed font-medium max-w-xl line-clamp-3">
                                    {featuredPost.short_description || featuredPost.content?.replace(/<[^>]+>/g, '') || ""}
                                </p>
                                <div className="flex items-center gap-8 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF2D78] to-[#E1306C] border border-white/20 p-0.5">
                                            <div className="w-full h-full bg-gray-900 rounded-[8px]" />
                                        </div>
                                        <div>
                                            <span className="block text-white font-black text-xs uppercase tracking-widest">{featuredPost.author_name || "Admin"}</span>
                                            <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">Author</span>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-white/10" />
                                    <div className="text-gray-500 flex flex-col justify-center">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-[#FF2D78]">
                                            {new Date(featuredPost.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-600">5 min read</span>
                                    </div>
                                </div>
                                <Link href={`/blog/${featuredPost.slug || featuredPost.id}`} className="group relative inline-flex items-center gap-3 px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-[#FF2D78] hover:text-white transition-all duration-300 overflow-hidden text-sm uppercase tracking-widest">
                                    <span className="relative z-10">Read Now</span>
                                    <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                                </Link>
                            </div>
                            <div className="relative group/image">
                                <div className="aspect-[16/10] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl relative z-10">
                                    <img
                                        src={featuredPost.featured_image_url || featuredPost.featured_image || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000"}
                                        alt="Featured"
                                        className="w-full h-full object-cover transition-all duration-1000 group-hover/image:scale-105"
                                    />
                                </div>
                                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF2D78] to-blue-600 rounded-[44px] blur-2xl opacity-10" />
                            </div>
                        </motion.div>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center">
                            <h2 className="text-white text-2xl font-black">No Insights Available</h2>
                        </div>
                    )}
                </div>
            </section>

            {/* Filter & Index */}
            <section className="py-24 bg-white relative z-20">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Sticky Filter Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-20 pb-8 border-b border-gray-100">
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => setActiveCategory("All")}
                                className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all ${activeCategory === "All" ? 'bg-black text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                All
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-black text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-pink-500 transition-colors" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search insights..."
                                className="pl-16 pr-8 py-4 bg-gray-50 border-none rounded-2xl w-full md:w-80 font-bold focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Blog Feed */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading && feedPosts.length === 0 ? (
                            [1, 2, 3].map(i => <div key={i} className="h-[400px] bg-gray-50 animate-pulse rounded-3xl" />)
                        ) : feedPosts.length > 0 ? (
                            feedPosts.map((post, i) => (
                                <Link
                                    href={`/blog/${post.slug || post.id}`}
                                    key={post.id || i}
                                    className="block group"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="h-full bg-white rounded-3xl border border-gray-100 hover:border-pink-500/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden relative rounded-t-3xl">
                                            <img
                                                src={post.featured_image_url || post.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800"}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {post.category && (
                                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                    {post.category?.name || "General"}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                                <span>{new Date(post.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                <span>5 min read</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-500 transition-colors leading-tight line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                                {post.short_description || post.content?.replace(/<[^>]+>/g, '') || ""}
                                            </p>
                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-black flex items-center gap-2 group-hover:gap-3 transition-all">
                                                    Read More <ArrowRight className="w-3 h-3 text-pink-500" />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full h-40 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl">
                                <p className="text-gray-400 font-bold uppercase tracking-widest">No articles found matching your criteria</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Button */}
                    <div className="mt-24 text-center">
                        <button className="px-12 py-5 rounded-2xl bg-gray-50 text-gray-900 font-black hover:bg-gray-100 transition-colors">
                            Load More Wisdom
                        </button>
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-24 bg-gray-50 border-y border-gray-100 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl mb-10 text-pink-500">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">Stay ahead of the meta.</h2>
                    <p className="text-gray-500 text-xl font-medium mb-12 max-w-xl mx-auto">
                        Get the latest automation tactics and AI prompts delivered to your inbox every Tuesday. No spam, only scaling.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full px-8 py-5 rounded-2xl bg-white border-2 border-transparent focus:border-pink-500/20 font-bold outline-none transition-all shadow-sm"
                        />
                        <button className="w-full sm:w-auto px-10 py-5 bg-black text-white font-black rounded-2xl hover:scale-105 transition-all">
                            Join Now
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
