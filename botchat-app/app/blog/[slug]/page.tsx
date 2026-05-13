"use client";

import React, { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Check } from "lucide-react";
import Navbar from "@/app/landing/components/Navbar";
import Footer from "@/app/landing/components/Footer";

// Mock data for the post (in a real app, you'd fetch this based on the slug)
const MOCK_POST = {
  title: "How to 10x your DM Conversions using AI",
  category: "Strategy",
  date: "Oct 12, 2026",
  readTime: "8 min read",
  author: {
    name: "Alex Rivera",
    role: "Head of Growth",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
  },
  image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1600",
  content: `
    <p>The landscape of social media is changing. Gone are the days when simply posting good content was enough to build a thriving business. Today, the real magic happens in the DMs.</p>
    
    <h2>The Hidden Goldmine in Your Inbox</h2>
    <p>Every time a follower comments on your post, sends you a story reply, or mentions you, they are giving you a massive signal of intent. If you leave these interactions hanging, you are literally leaving money on the table.</p>
    
    <p>We analyzed over 25 million direct messages sent through our platform last month. The data revealed a startling truth: <strong>accounts that respond to comments and DMs within 5 minutes see a 400% higher conversion rate</strong> than those who reply manually hours later.</p>
    
    <blockquote>
      "Automation isn't about removing the human element. It's about removing the lag time so you can deliver the human element exactly when the customer is most interested."
    </blockquote>
    
    <h2>How to Build Your First Auto-Flow</h2>
    <p>Creating a highly-converting DM flow is simpler than you think. Here is the exact blueprint used by top creators:</p>
    
    <ol>
      <li><strong>The Keyword Trigger:</strong> Tell your audience exactly what to comment. (e.g., "Comment 'GROWTH' to get my free guide"). This trains the algorithm that your post is highly engaging.</li>
      <li><strong>The Instant Acknowledgment:</strong> Your AI should instantly reply to their comment publicly (e.g., "Sent it to your DMs! 🚀"). This pushes your post higher in the feed.</li>
      <li><strong>The DM Delivery:</strong> Deliver the value immediately in their inbox. Don't be salesy yet. Just give them what you promised.</li>
      <li><strong>The 24-Hour Follow Up:</strong> Set an automated delay for 24 hours to ask if they liked the guide. This is where the actual conversation begins.</li>
    </ol>
    
    <h2>The Future is Conversational</h2>
    <p>The creators who win the next decade won't be the ones with the most followers—they will be the ones who can maintain the most personalized conversations at scale. Start automating your inbox today, and watch your conversions skyrocket.</p>
  `
};

const LATEST_POSTS = [
  {
    title: "The Ultimate Guide to Link-in-Bio SEO",
    category: "Growth",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800",
    slug: "ultimate-guide-link-in-bio",
    date: "Oct 08, 2026"
  },
  {
    title: "Case Study: From 0 to $10k MRR",
    category: "Success Stories",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800",
    slug: "case-study-0-10k-mrr",
    date: "Sep 28, 2026"
  }
];

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailProps) {
  const resolvedParams = use(params);
  
  return (
    <main className="min-h-screen bg-white">
      {/* Reusing the Landing Page Navbar */}
      <Navbar forceLight={true} />

      <article className="pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          {/* Back button */}
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF2D78] transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 flex flex-col items-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] text-xs font-black uppercase tracking-widest">
                {MOCK_POST.category}
              </span>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-semibold">
                <Clock size={14} />
                <span>{MOCK_POST.readTime}</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-[1.1] mb-8 max-w-3xl">
              {MOCK_POST.title}
            </h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-y border-gray-100 py-6 w-full max-w-2xl">
              <div className="flex items-center gap-4">
                <img 
                  src={MOCK_POST.author.avatar} 
                  alt={MOCK_POST.author.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-gray-900 font-bold">{MOCK_POST.author.name}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{MOCK_POST.author.role}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{MOCK_POST.date}</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block w-[1px] h-10 bg-gray-200" />

              {/* Share Buttons */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 mr-2">Share:</span>
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#FF2D78] hover:text-white transition-all">
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto px-6 mb-16"
        >
          <div className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-[32px] overflow-hidden bg-gray-100 relative">
            <img 
              src={MOCK_POST.image} 
              alt={MOCK_POST.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 items-start">
          
          {/* Left: Article Body */}
          <div className="min-w-0">
            <div 
              className="max-w-none 
                [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-6
                [&>p]:text-gray-600 [&>p]:leading-relaxed [&>p]:mb-6 [&>p]:text-lg
                [&>a]:text-[#FF2D78] [&>a]:font-medium hover:[&>a]:underline
                [&>blockquote]:border-l-4 [&>blockquote]:border-[#FF2D78] [&>blockquote]:bg-gray-50 [&>blockquote]:py-4 [&>blockquote]:px-6 [&>blockquote]:rounded-r-2xl [&>blockquote]:font-medium [&>blockquote]:text-gray-900 [&>blockquote]:italic [&>blockquote]:my-8 [&>blockquote]:text-xl
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-4 [&>ol]:mb-8 [&>ol>li]:text-gray-600 [&>ol>li]:text-lg
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-4 [&>ul]:mb-8 [&>ul>li]:text-gray-600 [&>ul>li]:text-lg
                [&_strong]:text-gray-900 [&_strong]:font-bold"
              dangerouslySetInnerHTML={{ __html: MOCK_POST.content }}
            />

            {/* Bottom CTA */}
            <div className="mt-20 p-10 rounded-[32px] bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF2D78] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
              <h3 className="text-3xl font-black text-white mb-4 relative z-10">Ready to 10x your growth?</h3>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">Join 11,000+ creators who are automating their DMs and skyrocketing their sales with botChat.</p>
              <Link 
                href="/auth/sign-up"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#FF2D78] text-white font-bold tracking-wide hover:bg-[#e7266a] hover:scale-105 transition-all shadow-xl shadow-[#FF2D78]/20 relative z-10"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>

          {/* Right: Sidebar */}
          <aside className="sticky top-32 space-y-12 hidden lg:block">
            {/* Latest Articles */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-[#FF2D78] rounded-full" />
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Articles</h3>
              </div>
              
              <div className="space-y-6">
                {LATEST_POSTS.map((post, i) => (
                  <Link href={`/blog/${post.slug}`} key={i} className="group flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FF2D78] mb-1 block">
                        {post.category}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#FF2D78] transition-colors line-clamp-2 mb-2">
                        {post.title}
                      </h4>
                      <span className="text-xs font-semibold text-gray-400">{post.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter Ad */}
            <div className="p-8 rounded-[32px] bg-gray-50 border border-gray-100 text-center relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF2D78] rounded-full blur-[60px] opacity-10" />
               <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-6 text-[#FF2D78]">
                 <Check size={20} />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">The Playbook</h3>
               <p className="text-sm text-gray-500 mb-6 leading-relaxed">Get the latest growth hacks and automation strategies delivered to your inbox.</p>
               <input type="email" placeholder="Your email address" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-[#FF2D78] transition-colors mb-3" />
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
