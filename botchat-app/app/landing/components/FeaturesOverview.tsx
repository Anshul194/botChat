"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, History, Inbox, Users } from "lucide-react";

const mainFeatures = [
    {
        title: "Comment Automation",
        description: "Instantly reply to every comment on your posts and reels. Convert engagement into conversations.",
        icon: MessageCircle,
        image: "/feature-extra-3.jfif",
        color: "#FF2D78",
    },
    {
        title: "Inbox Automation",
        description: "Manage your DMs at scale with intelligent sorting and automated initial responses.",
        icon: Inbox,
        image: "/feature-extra-2.jfif",
        color: "#C13584",
    },
    {
        title: "Bio Link Automation",
        description: "Auto-reply to story mentions and reactions. Build deeper connections with your most active followers.",
        icon: History,
        image: "/feature-comment.jfif",
        color: "#E1306C",
    },
    {
        title: "Live Chat",
        description: "Turn casual interactions into qualified leads. Collect emails and data directly within the chat.",
        icon: Users,
        image: "/feature-story.jfif",
        color: "#833AB4",
    }
];

export default function FeaturesOverview() {
    return (
        <section
            className="py-24 overflow-hidden relative"
            style={{ background: "linear-gradient(180deg, #06000d 0%, #0a0114 100%)" }}
        >
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-semibold text-white mb-4"
                    >
                        One Platform, <span style={{ color: "#FF2D78" }}>Total Control</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg max-w-2xl mx-auto"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                        Everything you need to automate your social presence and turn followers into loyal customers.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {mainFeatures.map((feature, index) => (
                        <motion.article
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10, scale: 1.01 }}
                            className="group relative h-[400px] w-full rounded-[28px] text-left [perspective:1200px]"
                        >
                            <div
                                className="relative h-full w-full rounded-[28px] transition-transform duration-700 [transform:rotateY(0deg)] group-hover:[transform:rotateY(180deg)]"
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* FRONT */}
                                <div
                                    className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 shadow-sm transition-all duration-300 group-hover:shadow-xl"
                                    style={{ backfaceVisibility: "hidden", background: "#0d0617" }}
                                >
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105 opacity-60"
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    <div className="absolute inset-0"
                                        style={{ background: `radial-gradient(circle at 85% 12%, ${feature.color}55, transparent 42%)` }} />

                                    <div className="absolute left-0 right-0 top-0 p-4">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                            <feature.icon className="h-4 w-4" />
                                            Feature
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-2xl font-semibold text-white drop-shadow-md">{feature.title}</h3>
                                        <p className="mt-1 text-xs" style={{ color: `${feature.color}cc` }}>Hover to view details</p>
                                    </div>
                                </div>

                                {/* BACK */}
                                <div
                                    className="absolute inset-0 flex flex-col rounded-[28px] border p-5 shadow-xl"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        background: `linear-gradient(135deg, ${feature.color}18 0%, rgba(13,6,23,0.98) 100%)`,
                                        borderColor: `${feature.color}33`
                                    }}
                                >
                                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                                        style={{ background: `${feature.color}20`, color: feature.color }}>
                                        <feature.icon className="h-4 w-4" />
                                        {feature.title}
                                    </div>

                                    <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                                        {feature.description}
                                    </p>

                                    <div className="mt-5 rounded-2xl border px-4 py-3"
                                        style={{ borderColor: `${feature.color}25`, background: "rgba(255,255,255,0.04)" }}>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]"
                                            style={{ color: feature.color }}>Outcome</p>
                                        <p className="mt-1 text-sm text-white/80">Faster replies, better engagement, and more qualified leads.</p>
                                    </div>

                                    <a
                                        href="/auth/sign-up"
                                        className="mt-auto inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-semibold text-white transition"
                                        style={{ background: feature.color }}
                                    >
                                        Get Started
                                    </a>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
