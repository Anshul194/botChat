"use client";

import { useState } from "react";
import {
    Search, Instagram, Facebook, Send, Bot, MoreVertical,
    Tag, Phone, Clock, User, Zap, ChevronRight, Smile, ArrowLeft,
} from "lucide-react";

const convs = [
    { id: 1, name: "Sarah Johnson", handle: "@sarah_j", platform: "instagram" as const, msg: "Do you ship internationally?", time: "2m", unread: 2, autoReply: true },
    { id: 2, name: "Mike Chen", handle: "Mike Chen", platform: "facebook" as const, msg: "What's the return policy?", time: "8m", unread: 1, autoReply: false },
    { id: 3, name: "Emma Davis", handle: "@emma.davis", platform: "instagram" as const, msg: "Thanks! That's perfect 🙏", time: "15m", unread: 0, autoReply: true },
    { id: 4, name: "Alex Kumar", handle: "Alex K", platform: "facebook" as const, msg: "Can I get a discount?", time: "1h", unread: 0, autoReply: true },
    { id: 5, name: "Priya Sharma", handle: "@priya.sharma", platform: "instagram" as const, msg: "How long does shipping take?", time: "2h", unread: 0, autoReply: false },
    { id: 6, name: "James Wilson", handle: "James W", platform: "facebook" as const, msg: "Is this still available?", time: "3h", unread: 0, autoReply: true },
];

const msgMap: Record<number, { text: string; from: "user" | "bot"; time: string }[]> = {
    1: [
        { text: "Hi! Do you ship internationally?", from: "user", time: "10:42" },
        { text: "Hi Sarah 👋 Yes, we ship to 50+ countries! Standard shipping takes 7–14 days. Would you like the rates for your country?", from: "bot", time: "10:42" },
        { text: "I'm in Germany 🇩🇪", from: "user", time: "10:43" },
        { text: "Great news! We ship to Germany via DHL. Standard: €12, Express: €24 (3–5 days). Free shipping on orders over €80!", from: "bot", time: "10:43" },
        { text: "Do you ship internationally?", from: "user", time: "10:45" },
    ],
    2: [
        { text: "What's your return policy?", from: "user", time: "09:30" },
        { text: "Hi Mike! We offer 30-day hassle-free returns. Just reach out and we'll arrange a pickup.", from: "user", time: "09:35" },
    ],
};

const quickReplies = ["Hi! How can I help?", "Thanks for reaching out!", "We offer 30-day returns.", "Shipping takes 5–7 days."];

export default function InboxPage() {
    const [active, setActive] = useState(convs[0]);
    const [input, setInput] = useState("");
    const [filter, setFilter] = useState<"all" | "instagram" | "facebook">("all");
    // Mobile: "list" shows conversation list, "chat" shows chat panel
    const [mobileView, setMobileView] = useState<"list" | "chat">("list");

    const msgs = msgMap[active.id] || [{ text: active.msg, from: "user" as const, time: "now" }];
    const filtered = convs.filter((c) => filter === "all" || c.platform === filter);

    const handleSelectConv = (c: typeof convs[0]) => {
        setActive(c);
        setMobileView("chat"); // On mobile, switch to chat view
    };

    return (
        <div
            className="flex h-full gap-0 rounded-2xl overflow-hidden"
            style={{ height: "calc(100vh - 128px)", border: "1px solid var(--glass-border)" }}
        >
            {/* ── Conversation List ── */}
            {/* On mobile: show only when mobileView === "list" | On desktop: always show */}
            <div
                className={[
                    "flex flex-col flex-shrink-0 border-r",
                    // Mobile: full width when visible, hidden when chat active
                    "w-full md:w-[300px]",
                    mobileView === "chat" ? "hidden md:flex" : "flex",
                ].join(" ")}
                style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}
            >
                <div className="p-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
                    <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--foreground)" }}>Inbox</h2>
                    {/* Platform filter */}
                    <div className="flex gap-1 p-1 rounded-xl mb-3" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        {(["all", "instagram", "facebook"] as const).map((f) => (
                            <button key={f} onClick={() => setFilter(f)}
                                className="flex-1 py-1 rounded-lg text-[11px] font-medium capitalize transition-all"
                                style={filter === f ? { background: "var(--brand-gradient)", color: "white" } : { color: "var(--muted-foreground)" }}>
                                {f === "instagram" ? "IG" : f === "facebook" ? "FB" : "All"}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                        <input placeholder="Search..." className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none transition-all"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filtered.map((c) => (
                        <div key={c.id} onClick={() => handleSelectConv(c)}
                            className="flex items-start gap-3 px-3 py-3 cursor-pointer border-b transition-all"
                            style={{
                                background: active.id === c.id ? "var(--nav-active-bg)" : "transparent",
                                borderColor: "var(--glass-border)",
                                borderLeft: active.id === c.id ? "3px solid var(--brand-purple)" : "3px solid transparent",
                            }}
                            onMouseEnter={(e) => { if (active.id !== c.id) e.currentTarget.style.background = "var(--nav-hover-bg)"; }}
                            onMouseLeave={(e) => { if (active.id !== c.id) e.currentTarget.style.background = "transparent"; }}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ background: c.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                                    {c.name[0]}
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                    style={{ background: c.platform === "instagram" ? "#ec4899" : "#3b82f6", boxShadow: "0 0 0 2px var(--card)" }}>
                                    {c.platform === "instagram" ? <Instagram className="w-2 h-2 text-white" /> : <Facebook className="w-2 h-2 text-white" />}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{c.name}</span>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{c.time}</span>
                                        {c.unread > 0 && (
                                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                                                style={{ background: "#7c3aed" }}>{c.unread}</span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--muted-foreground)" }}>{c.msg}</p>
                                {c.autoReply && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Bot className="w-2.5 h-2.5" style={{ color: "#7c3aed" }} />
                                        <span className="text-[9px]" style={{ color: "#7c3aed" }}>Auto-replied</span>
                                    </div>
                                )}
                            </div>
                            {/* Arrow hint on mobile */}
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 md:hidden" style={{ color: "var(--muted-foreground)" }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Chat Area ── */}
            {/* On mobile: show only when mobileView === "chat" | On desktop: always show */}
            <div
                className={[
                    "flex-1 flex flex-col min-w-0",
                    mobileView === "list" ? "hidden md:flex" : "flex",
                ].join(" ")}
                style={{ background: "var(--background)" }}
            >
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--glass-border)", background: "var(--card)" }}>
                    <div className="flex items-center gap-3">
                        {/* Back button — mobile only */}
                        <button
                            className="md:hidden p-1.5 rounded-lg mr-1 hover:opacity-70 transition-opacity"
                            style={{ background: "var(--glass-bg)" }}
                            onClick={() => setMobileView("list")}
                        >
                            <ArrowLeft className="w-4 h-4" style={{ color: "var(--foreground)" }} />
                        </button>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: active.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                            {active.name[0]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{active.name}</p>
                            <div className="flex items-center gap-1.5">
                                {active.platform === "instagram"
                                    ? <Instagram className="w-3 h-3" style={{ color: "#ec4899" }} />
                                    : <Facebook className="w-3 h-3" style={{ color: "#3b82f6" }} />}
                                <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{active.handle}</span>
                                <span className="w-1 h-1 rounded-full" style={{ background: "#10b981" }} />
                                <span className="text-[11px]" style={{ color: "#10b981" }}>Online</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}>
                            <Bot className="w-3.5 h-3.5" />Auto-Reply ON
                        </div>
                        <button className="p-2 rounded-lg hover:opacity-70" style={{ background: "var(--glass-bg)" }}>
                            <MoreVertical className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                    {msgs.map((m, i) => (
                        <div key={i} className={`flex ${m.from === "bot" ? "justify-start" : "justify-end"}`}>
                            {m.from === "bot" && (
                                <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-auto"
                                    style={{ background: "var(--brand-gradient)" }}>
                                    <Bot className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                            <div className="max-w-[80%] sm:max-w-[70%]">
                                <div className={`px-4 py-2.5 text-sm ${m.from === "bot" ? "msg-bubble-in" : "msg-bubble-out"}`}>
                                    {m.text}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-[10px] ${m.from === "bot" ? "justify-start ml-1" : "justify-end mr-1"}`}
                                    style={{ color: "var(--muted-foreground)" }}>
                                    {m.from === "bot" && <Bot className="w-2.5 h-2.5" style={{ color: "#7c3aed" }} />}
                                    {m.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Replies */}
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                    {quickReplies.map((q) => (
                        <button key={q} onClick={() => setInput(q)}
                            className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity flex-shrink-0"
                            style={{ background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}>
                            {q}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="px-4 pb-4">
                    <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                        <button className="p-1.5 hover:opacity-70"><Smile className="w-5 h-5" style={{ color: "var(--muted-foreground)" }} /></button>
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..."
                            className="flex-1 text-sm outline-none bg-transparent" style={{ color: "var(--foreground)" }}
                            onKeyDown={(e) => { if (e.key === "Enter") setInput(""); }}
                        />
                        <button disabled={!input} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ background: "var(--brand-gradient)", color: "white" }}
                            onClick={() => setInput("")}>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Contact Info Panel — desktop xl only ── */}
            <div className="w-[220px] flex-shrink-0 border-l p-4 hidden xl:flex flex-col gap-4 overflow-y-auto"
                style={{ background: "var(--card)", borderColor: "var(--glass-border)" }}>
                <div className="text-center pt-2">
                    <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm font-bold text-white mb-2"
                        style={{ background: active.platform === "instagram" ? "linear-gradient(135deg,#ec4899,#7c3aed)" : "linear-gradient(135deg,#3b82f6,#06b6d4)" }}>
                        {active.name[0]}
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{active.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{active.handle}</p>
                </div>

                <div className="space-y-2">
                    {[
                        { icon: Clock, label: "First contact", value: "Jan 15, 2025" },
                        { icon: User, label: "Messages", value: "34 total" },
                        { icon: Zap, label: "Flows triggered", value: "3" },
                    ].map((r) => (
                        <div key={r.label} className="flex items-center gap-2 p-2 rounded-xl"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <r.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
                            <div className="min-w-0">
                                <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{r.label}</p>
                                <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>{r.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <p className="text-[10px] font-semibold mb-2 tracking-wider" style={{ color: "var(--muted-foreground)" }}>TAGS</p>
                    <div className="flex flex-wrap gap-1">
                        {["customer", "vip"].map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(124,58,237,0.12)", color: "#a855f7" }}>#{tag}</span>
                        ))}
                        <button className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px dashed var(--glass-border)" }}>
                            + Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
