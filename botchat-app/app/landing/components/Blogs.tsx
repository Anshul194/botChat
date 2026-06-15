"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    title: "How to Scale DMs on Instagram Without Getting Flagged",
    description: "Learn the art of smart throttling and human-like interactions to keep your account safe.",
    date: "March 15, 2026",
    author: "Marketing Team",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1074"
  },
  {
    title: "5 Automation Flows Every Creator Needs for High Conversions",
    description: "From giveaways to welcome sequences, these flows are proven to turn followers into customers.",
    date: "March 10, 2026",
    author: "Growth Product",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1470"
  },
  {
    title: "Why Comment Automation is Your Secret Weapon for Reels Growth",
    description: "Discover how top influencers are using auto-DMs to boost their viral potential.",
    date: "March 5, 2026",
    author: "Product Designer",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&q=80&w=1470"
  }
];

export default function Blogs() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 px-4">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold font-display text-black mb-4">
              Insights & <span className="text-[#FF2D78]">Education</span>
            </h2>
            <p className="text-gray-500 font-body">Master the art of automation with our expert guides and reports.</p>
          </div>
          <Link href="/blog" className="hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl bg-gray-50 text-black font-bold font-display border border-gray-100 hover:bg-gray-100 transition-all group">
            View All Posts
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {blogPosts.map((post, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="aspect-[16/10] rounded-[32px] overflow-hidden mb-6 relative border border-gray-100">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-xs font-bold text-[#FF2D78] uppercase tracking-widest font-display">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {post.date}</div>
                  <div className="flex items-center gap-1.5"><User className="w-3 h-3" /> {post.author}</div>
                </div>
                <h3 className="text-xl font-bold font-display text-black group-hover:text-[#FF2D78] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm font-body leading-relaxed line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-2 pt-2 text-[#FF2D78] font-bold text-sm font-display group-hover:gap-3 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
