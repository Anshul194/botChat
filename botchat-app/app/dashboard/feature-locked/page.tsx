"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const FEATURE_LABELS: Record<string, { title: string; description: string; perks: string[] }> = {
    short_links: {
        title: "Shortened Links",
        description: "Create compact, branded short URLs that are easy to share and track.",
        perks: ["Custom URL aliases", "Click analytics", "Auto-expiring links", "QR code generation"],
    },
    short_links_access: {
        title: "Shortened Links",
        description: "Create compact, branded short URLs that are easy to share and track.",
        perks: ["Custom URL aliases", "Click analytics", "Auto-expiring links", "QR code generation"],
    },
    vcard: {
        title: "VCard Links",
        description: "Create digital business cards that contacts can save directly to their phones.",
        perks: ["Downloadable .vcf files", "Custom branding", "QR code sharing", "Contact analytics"],
    },
    vcard_access: {
        title: "VCard Links",
        description: "Create digital business cards that contacts can save directly to their phones.",
        perks: ["Downloadable .vcf files", "Custom branding", "QR code sharing", "Contact analytics"],
    },
    bio_links: {
        title: "Bio Link Manager",
        description: "Build beautiful link-in-bio pages that showcase all your important links.",
        perks: ["Unlimited blocks", "Custom themes", "Lead capture forms", "Analytics dashboard"],
    },
    broadcast: {
        title: "Broadcast Messaging",
        description: "Send bulk messages to your entire subscriber base at once.",
        perks: ["Scheduled broadcasts", "Audience segmentation", "Delivery analytics", "Templates"],
    },
    analytics: {
        title: "Analytics Dashboard",
        description: "Deep-dive into your audience, traffic, and engagement metrics.",
        perks: ["Geo distribution", "Referral tracking", "Click heatmaps", "Export CSV"],
    },
    domains: {
        title: "Custom Domains",
        description: "Use your own branded domain for all your links and pages.",
        perks: ["Full CNAME support", "SSL included", "Brand trust boost", "Multiple domains"],
    },
    pixels: {
        title: "Tracking Pixels",
        description: "Add Facebook, Google, and other retargeting pixels to your links.",
        perks: ["Facebook Pixel", "Google Tag", "TikTok Pixel", "Custom scripts"],
    },
    bot_ai_agent: {
        title: "AI Agent",
        description: "Deploy AI-powered chatbots that understand and respond to your customers.",
        perks: ["GPT-4 powered", "Custom training", "Multi-channel", "Human handoff"],
    },
    smart_inbox: {
        title: "Smart Inbox",
        description: "Unified inbox to manage all social conversations in one place.",
        perks: ["All channels unified", "Team assignments", "Quick replies", "Conversation labels"],
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function FeatureLockedPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const feature = searchParams.get("feature") || "unknown";
    const info = FEATURE_LABELS[feature] || {
        title: feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "This feature requires a higher plan tier to access.",
        perks: ["Unlock premium capabilities", "Priority support", "Advanced analytics", "More limits"],
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-8">
            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
                <div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.04]"
                    style={{ background: "radial-gradient(ellipse, #8b5cf6 0%, transparent 70%)" }}
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative w-full max-w-lg"
            >
                {/* Lock Icon */}
                <motion.div variants={itemVariants} className="flex justify-center mb-8">
                    <div
                        className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                        style={{
                            background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.2), rgba(99,102,241,0.08))",
                            boxShadow: "0 0 40px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
                            border: "1px solid rgba(139,92,246,0.2)",
                        }}
                    >
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Lock className="w-10 h-10" style={{ color: "#8b5cf6" }} />
                        </motion.div>

                        {/* Sparkles */}
                        <motion.div
                            className="absolute -top-2 -right-2"
                            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 0.9, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Sparkles className="w-5 h-5 text-amber-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Card */}
                <motion.div
                    variants={itemVariants}
                    className="rounded-3xl border overflow-hidden"
                    style={{
                        background: "var(--glass-bg, var(--card))",
                        borderColor: "var(--glass-border, var(--border))",
                        boxShadow: "var(--shadow-card, 0 4px 32px rgba(0,0,0,0.08))",
                    }}
                >
                    {/* Header gradient strip */}
                    <div
                        className="h-1.5 w-full"
                        style={{ background: "linear-gradient(90deg, #8b5cf6, #6366f1, #8b5cf6)" }}
                    />

                    <div className="p-6 sm:p-8 space-y-6">
                        {/* Badge */}
                        <div className="flex justify-center">
                            <span
                                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                                style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)" }}
                            >
                                <Lock className="w-2.5 h-2.5" />
                                Upgrade Required
                            </span>
                        </div>

                        {/* Title & Description */}
                        <div className="text-center space-y-3">
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                                {info.title}
                            </h1>
                            <p className="text-sm sm:text-base font-medium leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                {info.description}
                            </p>
                        </div>

                        {/* Feature Perks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {info.perks.map((perk) => (
                                <div key={perk} className="flex items-center gap-2.5 text-sm font-medium" style={{ color: "var(--foreground)" }}>
                                    <div
                                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(16,185,129,0.12)" }}
                                    >
                                        <CheckCircle2 className="w-3 h-3" style={{ color: "#10b981" }} />
                                    </div>
                                    {perk}
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link href="/dashboard/billing/plans" className="flex-1">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white transition-all"
                                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    View Plans & Upgrade
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </Link>
                            <button
                                onClick={() => router.back()}
                                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border transition-all hover:opacity-80"
                                style={{ borderColor: "var(--glass-border, var(--border))", color: "var(--foreground)", background: "var(--glass-bg, transparent)" }}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Hint text */}
                <motion.p
                    variants={itemVariants}
                    className="text-center text-xs font-medium mt-6"
                    style={{ color: "var(--muted-foreground)" }}
                >
                    Need help choosing a plan?{" "}
                    <Link href="/dashboard/billing" className="font-semibold hover:underline" style={{ color: "#8b5cf6" }}>
                        View Billing
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}
