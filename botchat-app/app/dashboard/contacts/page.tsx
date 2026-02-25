"use client";

import { useState } from "react";
import { Search, Users, Instagram, Facebook, Filter, Grid, List, Tag, Mail, Phone, Clock, MoreVertical } from "lucide-react";

const contacts = [
    { id: 1, name: "Sarah Johnson", handle: "@sarah_j", platform: "instagram", tags: ["customer", "vip"], msgs: 34, last: "2h ago", email: "sarah@email.com" },
    { id: 2, name: "Mike Chen", handle: "Mike Chen", platform: "facebook", tags: ["lead"], msgs: 12, last: "5h ago", email: "mike@email.com" },
    { id: 3, name: "Emma Davis", handle: "@emma_daviss", platform: "instagram", tags: ["prospect"], msgs: 8, last: "1d ago", email: "emma@email.com" },
    { id: 4, name: "Alex Kumar", handle: "Alex K", platform: "facebook", tags: ["customer"], msgs: 21, last: "3h ago", email: "alex@email.com" },
    { id: 5, name: "Priya Sharma", handle: "@priya.s", platform: "instagram", tags: ["vip", "customer"], msgs: 56, last: "30m ago", email: "priya@email.com" },
    { id: 6, name: "James Wilson", handle: "James Wilson", platform: "facebook", tags: ["lead", "prospect"], msgs: 4, last: "2d ago", email: "james@email.com" },
    { id: 7, name: "Aisha Patel", handle: "@aisha_p", platform: "instagram", tags: ["customer"], msgs: 18, last: "6h ago", email: "aisha@email.com" },
    { id: 8, name: "Tom Brooks", handle: "Tom B", platform: "facebook", tags: ["prospect"], msgs: 7, last: "1d ago", email: "tom@email.com" },
];

const tagColors: Record<string, { bg: string; color: string }> = {
    vip: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    customer: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
    lead: { bg: "rgba(124,58,237,0.12)", color: "#7c3aed" },
    prospect: { bg: "rgba(6,182,212,0.12)", color: "#06b6d4" },
};

export default function ContactsPage() {
    const [view, setView] = useState<"grid" | "list">("list");
    const [query, setQuery] = useState("");
    const [platform, setPlatform] = useState<"all" | "instagram" | "facebook">("all");

    const filtered = contacts.filter((c) => {
        const q = query.toLowerCase();
        if (q && !c.name.toLowerCase().includes(q) && !c.handle.toLowerCase().includes(q)) return false;
        if (platform !== "all" && c.platform !== platform) return false;
        return true;
    });

    return (
        <div className="space-y-6 max-w-[1400px]">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Contacts</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage and track all your contacts</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 4px 15px rgba(124,58,237,0.35)" }}>
                    + Import Contacts
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Contacts", value: contacts.length, color: "#7c3aed" },
                    { label: "Instagram", value: contacts.filter(c => c.platform === "instagram").length, color: "#ec4899" },
                    { label: "Facebook", value: contacts.filter(c => c.platform === "facebook").length, color: "#3b82f6" },
                    { label: "VIP Contacts", value: contacts.filter(c => c.tags.includes("vip")).length, color: "#f59e0b" },
                ].map((s) => (
                    <div key={s.label} className="glass-card rounded-2xl p-4">
                        <div className="text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input value={query} onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search contacts..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    />
                </div>

                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {(["all", "instagram", "facebook"] as const).map((p) => (
                        <button key={p} onClick={() => setPlatform(p)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                            style={platform === p ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                            {p}
                        </button>
                    ))}
                </div>

                <div className="flex items-center rounded-xl p-1 gap-1 ml-auto" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {([{ v: "list", Icon: List }, { v: "grid", Icon: Grid }] as const).map(({ v, Icon }) => (
                        <button key={v} onClick={() => setView(v as any)}
                            className="p-2 rounded-lg transition-all"
                            style={view === v ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{filtered.length} contacts</span>
            </div>

            {/* Contacts — List View */}
            {view === "list" && (
                <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ borderBottom: "1px solid var(--glass-border)", background: "var(--glass-bg)" }}>
                                    {["Contact", "Platform", "Tags", "Messages", "Last Contact", "Actions"].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider"
                                            style={{ color: "var(--muted-foreground)" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => (
                                    <tr key={c.id}
                                        className="transition-colors cursor-pointer"
                                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--glass-border)" : "none" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nav-hover-bg)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                    style={{ background: c.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                                    {c.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.name}</p>
                                                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{c.handle}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg w-fit"
                                                style={c.platform === "instagram" ? { background: "rgba(236,72,153,0.1)", color: "#ec4899" } : { background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                                                {c.platform === "instagram" ? <Instagram className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                                                <span className="capitalize">{c.platform}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {c.tags.map((tag) => (
                                                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                                        style={{ background: tagColors[tag]?.bg || "var(--glass-bg)", color: tagColors[tag]?.color || "var(--muted-foreground)" }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{c.msgs}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>{c.last}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ background: "rgba(124,58,237,0.1)" }}>
                                                    <Mail className="w-3.5 h-3.5" style={{ color: "#7c3aed" }} />
                                                </button>
                                                <button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ background: "var(--glass-bg)" }}>
                                                    <MoreVertical className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Contacts — Grid View */}
            {view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((c) => (
                        <div key={c.id} className="glass-card rounded-2xl p-5 cursor-pointer hover:-translate-y-1 transition-transform">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: c.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                    {c.name[0]}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg"
                                    style={c.platform === "instagram" ? { background: "rgba(236,72,153,0.1)", color: "#ec4899" } : { background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                                    {c.platform === "instagram" ? <Instagram className="w-3 h-3" /> : <Facebook className="w-3 h-3" />}
                                </div>
                            </div>
                            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{c.name}</p>
                            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>{c.handle}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                                {c.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                                        style={{ background: tagColors[tag]?.bg || "var(--glass-bg)", color: tagColors[tag]?.color || "var(--muted-foreground)" }}>{tag}</span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
                                <span>{c.msgs} messages</span>
                                <span>{c.last}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
