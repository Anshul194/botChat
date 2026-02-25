"use client";

import { useState } from "react";
import {
    Zap, Plus, Sparkles, CheckCircle2, XCircle, Play,
    Pause, MoreVertical, Instagram, Facebook, ArrowUpRight,
} from "lucide-react";

const automations = [
    {
        id: 1, name: "Story Reply → DM Funnel", desc: "Auto DM anyone who replies to your story",
        platform: "instagram", status: "active", trigger: "Story Reply", rate: "94%",
        triggers: 1284, leads: 198, tags: ["lead-gen", "story"],
    },
    {
        id: 2, name: "Comment Capture", desc: "Capture leads from post comments",
        platform: "instagram", status: "active", trigger: "Comment Keyword", rate: "87%",
        triggers: 876, leads: 143, tags: ["comment", "leads"],
    },
    {
        id: 3, name: "Messenger Welcome", desc: "Greet new Messenger contacts instantly",
        platform: "facebook", status: "active", trigger: "First Message", rate: "91%",
        triggers: 654, leads: 87, tags: ["welcome", "retention"],
    },
    {
        id: 4, name: "Pricing FAQ Bot", desc: "Answer pricing questions automatically",
        platform: "both", status: "paused", trigger: "Keyword: pricing", rate: "78%",
        triggers: 432, leads: 64, tags: ["faq", "pricing"],
    },
    {
        id: 5, name: "Product Catalog Share", desc: "Send catalog to interested prospects",
        platform: "instagram", status: "active", trigger: "Keyword: catalog", rate: "83%",
        triggers: 289, leads: 51, tags: ["catalog", "sales"],
    },
    {
        id: 6, name: "Re-engagement Flow", desc: "Win back inactive contacts after 7 days",
        platform: "facebook", status: "paused", trigger: "Inactivity: 7 days", rate: "61%",
        triggers: 183, leads: 29, tags: ["re-engage"],
    },
];

const templates = [
    { name: "Lead Magnet", icon: "🎯", cat: "Lead Gen", color: "#7c3aed" },
    { name: "Welcome Flow", icon: "👋", cat: "Onboarding", color: "#06b6d4" },
    { name: "FAQ Responder", icon: "❓", cat: "Support", color: "#10b981" },
    { name: "Cart Recovery", icon: "🛒", cat: "E-commerce", color: "#f59e0b" },
    { name: "Contest Entry", icon: "🏆", cat: "Engagement", color: "#ec4899" },
    { name: "Appointment", icon: "📅", cat: "Booking", color: "#8b5cf6" },
];

export default function AutomationsPage() {
    const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
    const [platform, setPlatform] = useState<"all" | "instagram" | "facebook">("all");

    const filtered = automations.filter((a) => {
        if (filter !== "all" && a.status !== filter) return false;
        if (platform !== "all" && a.platform !== platform && a.platform !== "both") return false;
        return true;
    });

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Automations</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage and monitor your automation flows</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                    <Plus className="w-4 h-4" />New Automation
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Automations", value: "12", color: "#7c3aed" },
                    { label: "Active", value: "9", color: "#10b981" },
                    { label: "Messages Sent", value: "48.2K", color: "#06b6d4" },
                    { label: "Leads Captured", value: "3,847", color: "#f59e0b" },
                ].map((s) => (
                    <div key={s.label} className="glass-card rounded-2xl p-4">
                        <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Templates */}
            <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                    <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Quick Start Templates</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {templates.map((t) => (
                        <button key={t.name} className="p-3 rounded-xl text-center transition-all hover:scale-105 hover:opacity-90"
                            style={{ background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                            <div className="text-2xl mb-1">{t.icon}</div>
                            <div className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{t.name}</div>
                            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>{t.cat}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {(["all", "active", "paused"] as const).map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                            style={filter === f ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {(["all", "instagram", "facebook"] as const).map((p) => (
                        <button key={p} onClick={() => setPlatform(p)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                            style={platform === p ? { background: "var(--glass-border)", color: "var(--foreground)" } : { color: "var(--muted-foreground)" }}>
                            {p}
                        </button>
                    ))}
                </div>
                <span className="text-sm ml-auto" style={{ color: "var(--muted-foreground)" }}>{filtered.length} automations</span>
            </div>

            {/* Automations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((a) => (
                    <div key={a.id} className="automation-card glass-card rounded-2xl p-5 relative overflow-hidden">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 right-0 h-0.5"
                            style={{ background: a.status === "active" ? "linear-gradient(90deg,#10b981,#06b6d4)" : "var(--glass-border)" }} />

                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{a.name}</h3>
                                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{a.desc}</p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                                    style={a.status === "active"
                                        ? { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                                        : { background: "var(--glass-bg)", color: "var(--muted-foreground)" }}>
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.status === "active" ? "#10b981" : "var(--muted-foreground)" }} />
                                    {a.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            {(a.platform === "instagram" || a.platform === "both") &&
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                                    style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>
                                    <Instagram className="w-3 h-3" />Instagram
                                </div>}
                            {(a.platform === "facebook" || a.platform === "both") &&
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px]"
                                    style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                                    <Facebook className="w-3 h-3" />Facebook
                                </div>}
                        </div>

                        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                            <Zap className="w-3 h-3" />
                            <span>{a.trigger}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { label: "Triggers", value: a.triggers.toLocaleString(), color: "#7c3aed" },
                                { label: "Leads", value: a.leads.toString(), color: "#10b981" },
                                { label: "Reply %", value: a.rate, color: "#06b6d4" },
                            ].map((m) => (
                                <div key={m.label} className="text-center p-2 rounded-xl"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                    <div className="text-sm font-bold" style={{ color: m.color }}>{m.value}</div>
                                    <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{m.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 flex-1 flex-wrap">
                                {a.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ background: a.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(124,58,237,0.1)" }}>
                                    {a.status === "active"
                                        ? <Pause className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                                        : <Play className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />}
                                </button>
                                <button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ background: "var(--glass-bg)" }}>
                                    <MoreVertical className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New */}
                <button className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border-dashed hover:opacity-80 transition-opacity min-h-[200px]"
                    style={{ borderStyle: "dashed", borderColor: "var(--glass-border)" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(124,58,237,0.1)", border: "1px dashed rgba(124,58,237,0.3)" }}>
                        <Plus className="w-6 h-6" style={{ color: "var(--brand-purple)" }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>New Automation</span>
                </button>
            </div>
        </div>
    );
}
