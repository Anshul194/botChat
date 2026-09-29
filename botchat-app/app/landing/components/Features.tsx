"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
    Zap, Sparkles, Workflow, Radio,
    BarChart3, MessageSquare, Shield, ArrowUpRight
} from "lucide-react";

const features = [
    {
        icon: MessageSquare,
        name: "Post Auto-Reply",
        cat: "Engagement",
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        borderHover: "hover:border-rose-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]",
        desc: "Turn every comment into a conversation. Send instant DMs triggered by specific keywords on your posts.",
    },
    {
        icon: Zap,
        name: "Story Mentions",
        cat: "Viral Engine",
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        borderHover: "hover:border-violet-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
        desc: "Reward your most loyal fans instantly when they tag you in their stories with customized responses.",
    },
    {
        icon: Radio,
        name: "Reel Automations",
        cat: "Growth",
        color: "text-pink-400",
        bg: "bg-pink-400/10",
        borderHover: "hover:border-pink-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]",
        desc: "Capitalize on viral reach. Auto-DM viewers who interact with your Reels to convert them into leads.",
    },
    {
        icon: Shield,
        name: "Follow-Gated Content",
        cat: "Community",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        borderHover: "hover:border-emerald-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]",
        desc: "Force growth by requiring users to follow you before receiving your automated DMs and rewards.",
    },
    {
        icon: Workflow,
        name: "Visual Flow Builder",
        cat: "Logic",
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        borderHover: "hover:border-blue-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
        desc: "Build complex conversation trees with zero coding required. Drag, drop, and automate your funnel.",
    },
    {
        icon: BarChart3,
        name: "Advanced Analytics",
        cat: "Insights",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        borderHover: "hover:border-amber-500/50",
        shadowHover: "hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]",
        desc: "Stop guessing. Track every interaction, click, and conversion in real-time to optimize your strategy.",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function FeaturesSection() {
    return (
        <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-500/5 blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/5 blur-[120px] mix-blend-screen"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm"
                    >
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-medium text-white/80 uppercase tracking-widest">Everything You Need</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6"
                    >
                        Powerful tools to scale your <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-rose-400">
                            Instagram growth
                        </span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/50 font-light"
                    >
                        Designed for creators and brands who want to convert followers into loyal customers automatically.
                    </motion.p>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {features.map((feature, idx) => (
                        <motion.div 
                            key={idx}
                            variants={itemVariants}
                            className={`group relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-300 ${feature.borderHover} ${feature.shadowHover}`}
                        >
                            <div className="flex flex-col h-full">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${feature.bg}`}>
                                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                                </div>
                                
                                <div className="mb-2 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-colors">
                                        {feature.name}
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 px-2 py-1 rounded bg-white/5">
                                        {feature.cat}
                                    </span>
                                </div>
                                
                                <p className="text-white/50 leading-relaxed font-light mt-2 flex-grow">
                                    {feature.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-24 text-center"
                >
                    <Link href="/features">
                        <motion.button
                            className="inline-flex items-center gap-2 text-white font-medium text-base px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Explore full product features
                            <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}