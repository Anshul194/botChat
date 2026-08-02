"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Sparkles, Fingerprint, Layers, Workflow, Radio,
    BarChart3, MessageSquare, Shield, Cpu, ArrowUpRight,
} from "lucide-react";

const features = [
    {
        icon: MessageSquare,
        name: "Post Auto Reply",
        cat: "Automated Growth",
        badge: "New",
        color: "#FF2060",
        desc: "Instant personalized DMs triggered by post comments — engage in real time with context-aware replies.",
        longDesc: "Trigger custom DM sequences the moment someone comments. Personalize based on comment content — perfect for giveaways, Q&A, or flash sales.",
    },
    {
        icon: Radio,
        name: "Reel Auto Reply",
        cat: "Viral Engine",
        color: "#E1306C",
        desc: "Capture every viral moment on Reels — auto-DM on every comment, no exceptions.",
        longDesc: "Reels move fast. This catches every single comment (even during spikes) and starts nurturing conversations instantly — turning views into revenue.",
    },
    {
        icon: Shield,
        name: "Follow-Gated DM",
        cat: "Community",
        badge: "Pro",
        color: "#C13584",
        desc: "Exclusive DMs only for your followers. Reward loyalty and grow your base automatically.",
        longDesc: "Ensure that only your followers get the exclusive links, codes, or content. It incentivizes following and keeps your community quality high.",
    },
    {
        icon: BarChart3,
        name: "Deep Analytics",
        cat: "Insights",
        color: "#833AB4",
        desc: "Detailed data on your conversions. Know which posts are driving the most customers.",
        longDesc: "Track scroll-to-conversion, DM response rates, and overall engagement growth through our high-fidelity data dashboard.",
    },
    {
        icon: Zap,
        name: "Email Collector",
        cat: "Leads",
        color: "#5851DB",
        desc: "Automatically capture emails within DMs and sync to your CRM for long-term growth.",
        longDesc: "Turn Instagram followers into an email list you own. Seamlessly collect and verify emails directly in the chat interface.",
    },
    {
        icon: Workflow,
        name: "Flow Automation",
        cat: "AI Workflows",
        color: "#405DE6",
        desc: "Build complex chat flows with our drag-and-drop builder. Automate the entire funnel.",
        longDesc: "Create multi-step sequences that guide users from interest to purchase. Use logic, delays, and personalized tags for a tailored experience.",
    },
];

function FeatureCard({
    feature,
    isActive,
    onClick,
    size = "normal",
}: {
    feature: typeof features[0];
    isActive: boolean;
    onClick: () => void;
    size?: "normal" | "large";
}) {
    const Icon = feature.icon;

    return (
        <motion.div
            layout
            onClick={onClick}
            className={`
        group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-500
        ${isActive ? "ring-1" : ""}
        ${size === "large" ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"}
      `}
            style={{
                background: isActive
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.03)",
                borderColor: isActive
                    ? `${feature.color}55`
                    : "rgba(255,255,255,0.08)",
                boxShadow: isActive ? `0 0 40px ${feature.color}22` : undefined,
            }}
            whileHover={{ scale: isActive ? 1.015 : 1.03, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
            <div className="p-6 md:p-8 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: isActive
                                ? `linear-gradient(135deg, ${feature.color}, #ff4d8d)`
                                : `${feature.color}18`,
                        }}
                    >
                        <Icon
                            className="w-7 h-7"
                            style={{ color: isActive ? "white" : feature.color }}
                            strokeWidth={2.1}
                        />
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xl text-white">{feature.name}</h4>
                            {feature.badge && (
                                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full"
                                    style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                                    {feature.badge}
                                </span>
                            )}
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{feature.cat}</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {isActive ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                            className="flex-1 flex flex-col"
                        >
                            <p className="text-base leading-relaxed mb-6 italic" style={{ color: "rgba(255,255,255,0.75)" }}>
                                "{feature.longDesc || feature.desc}"
                            </p>
                            <div className="mt-auto flex flex-wrap gap-2">
                                {["Real-time", "Scalable", "Safe"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-3 py-1 rounded-full border"
                                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.p
                            key="short"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm leading-relaxed flex-1"
                            style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                            {feature.desc}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {isActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    className="absolute bottom-5 right-5"
                    style={{ color: feature.color }}
                >
                    <ArrowUpRight className="w-6 h-6" />
                </motion.div>
            )}
        </motion.div>
    );
}

export default function FeaturesBento() {
    const [activeIndex, setActiveIndex] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % features.length);
        }, 5200);
    };

    useEffect(() => {
        startTimer();
        return () => {
            timerRef.current && clearInterval(timerRef.current);
        };
    }, []);

    const handleSelect = (index: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setActiveIndex(index);
        startTimer();
    };

    return (
        <section
            className="relative py-24 md:py-32 overflow-hidden"
            style={{ background: "linear-gradient(180deg, #0a0114 0%, #06000d 100%)" }}
        >
            {/* ambient glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(255,32,96,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
                <div className="absolute bottom-[-15%] left-[-15%] w-[800px] h-[800px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(255,77,141,0.07) 0%, transparent 70%)", filter: "blur(100px)" }} />
            </div>

            <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
                <div className="text-center mb-16 md:mb-20">
                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                        Scale Your
                        <span className="block mt-2"
                            style={{ background: "linear-gradient(135deg, #FF4D8D, #FF2060)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            Influence
                        </span>
                    </h2>
                    <p className="mt-5 text-xl max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
                        Every comment is revenue waiting. Never miss another opportunity — automatically.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-fr">
                    {features.map((feature, i) => (
                        <FeatureCard
                            key={i}
                            feature={feature}
                            isActive={activeIndex === i}
                            onClick={() => handleSelect(i)}
                            size={i === activeIndex ? "large" : "normal"}
                        />
                    ))}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-3 mt-12">
                    {features.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelect(i)}
                            className="rounded-full transition-all duration-400"
                            style={{
                                width: activeIndex === i ? "2.5rem" : "0.625rem",
                                height: "0.625rem",
                                background: activeIndex === i ? "#FF2060" : "rgba(255,255,255,0.2)",
                                transform: activeIndex === i ? "scale(1)" : undefined,
                            }}
                        />
                    ))}
                </div>

                {/* Final CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <h3 className="text-4xl font-bold text-white mb-6">
                        Ready to turn comments into customers?
                    </h3>
                    <Link href="/dashboard">
                        <motion.button
                            className="inline-flex items-center gap-3 text-white font-semibold uppercase tracking-wider text-sm px-10 py-5 rounded-full shadow-xl"
                            style={{ background: "linear-gradient(135deg, #FF2060, #E8185A)", boxShadow: "0 16px 40px -8px rgba(255,32,96,0.4)" }}
                            whileHover={{ scale: 1.06, boxShadow: "0 25px 50px -12px rgba(255,32,96,0.5)" }}
                            whileTap={{ scale: 0.97 }}
                        >
                            Start Automating Now
                            <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}