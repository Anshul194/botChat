"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    MessageSquare, Bot, Facebook, Instagram,
    Radio, BarChart3, Link2, Code2, Globe,
    ArrowUpRight,
} from "lucide-react";

const MODULES = [
    {
        icon: MessageSquare,
        name: "Smart Inbox",
        tagline: "Unified conversations at scale",
        description: "Manage Facebook, Instagram, WhatsApp & Telegram DMs from one powerful inbox with team collaboration.",
        color: "from-pink-500 to-rose-600",
        glow: "rgba(236,72,153,0.25)",
        href: "#smart-inbox",
    },
    {
        icon: Facebook,
        name: "Facebook Automation",
        tagline: "Turn comments into customers",
        description: "Auto-reply to Facebook post comments and trigger personalized DM sequences in milliseconds.",
        color: "from-blue-500 to-blue-700",
        glow: "rgba(59,130,246,0.25)",
        href: "#facebook",
    },
    {
        icon: Instagram,
        name: "Instagram Automation",
        tagline: "Reply faster than your fans scroll",
        description: "Comment automation, story reactions, reel mentions — all triggering smart DM conversations.",
        color: "from-purple-500 to-pink-600",
        glow: "rgba(168,85,247,0.25)",
        href: "#instagram",
    },
    {
        icon: Bot,
        name: "AI Reply Builder",
        tagline: "Human-like. Machine-speed.",
        description: "Drag & drop visual flow builder with AI assistant, conditional logic, and intent detection.",
        color: "from-cyan-500 to-blue-600",
        glow: "rgba(6,182,212,0.25)",
        href: "#bot",
    },
    {
        icon: Radio,
        name: "Broadcast Messaging",
        tagline: "One message, thousands of conversations",
        description: "Send targeted broadcast campaigns to segmented subscriber lists with real-time analytics.",
        color: "from-amber-500 to-orange-600",
        glow: "rgba(245,158,11,0.25)",
        href: "#broadcast",
    },
    {
        icon: Globe,
        name: "Social Posting",
        tagline: "Publish everywhere, effortlessly",
        description: "Schedule and publish photos, videos, and stories to Facebook & Instagram simultaneously.",
        color: "from-green-500 to-emerald-600",
        glow: "rgba(16,185,129,0.25)",
        href: "#social-posting",
    },
    {
        icon: Link2,
        name: "Bio Links",
        tagline: "Your entire world in one link",
        description: "Build stunning link-in-bio pages, short URLs, event links, and VCards with analytics.",
        color: "from-violet-500 to-purple-700",
        glow: "rgba(139,92,246,0.25)",
        href: "#bio-links",
    },
    {
        icon: BarChart3,
        name: "Analytics",
        tagline: "Know what's working. Always.",
        description: "Real-time dashboards with click tracking, geo data, referrers, and conversion funnels.",
        color: "from-teal-500 to-cyan-600",
        glow: "rgba(20,184,166,0.25)",
        href: "#analytics",
    },
    {
        icon: Code2,
        name: "Developer API",
        tagline: "Build anything on top",
        description: "REST API, webhooks, and Google Sheets integration for custom automation workflows.",
        color: "from-slate-500 to-slate-700",
        glow: "rgba(100,116,139,0.25)",
        href: "#developer",
    },
];

export default function FeaturesOverview() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        Platform Modules
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        One Platform.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            Total Control.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-2xl mx-auto font-medium"
                    >
                        Everything you need to automate your social presence and turn followers into loyal customers — in one workspace.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {MODULES.map((mod, i) => {
                        const Icon = mod.icon;
                        return (
                            <motion.div
                                key={mod.name}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06, duration: 0.4 }}
                                whileHover={{ y: -5 }}
                            >
                                <Link
                                    href={mod.href}
                                    className="group relative flex flex-col p-7 rounded-3xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-xl transition-all duration-300 h-full overflow-hidden"
                                    style={{ "--glow": mod.glow } as any}
                                >
                                    {/* Hover glow */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                        style={{ background: `radial-gradient(ellipse at top left, ${mod.glow}, transparent 70%)` }}
                                    />
                                    
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center bg-gradient-to-br ${mod.color} shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className="text-lg font-black text-gray-900 mb-1 group-hover:text-black">{mod.name}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{mod.tagline}</p>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed flex-1">{mod.description}</p>

                                    <div className="flex items-center gap-1 mt-5 text-xs font-bold text-[#FF2D78] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        Explore
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
