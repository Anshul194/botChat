"use client";

import { Instagram, Check, X, RefreshCw, Webhook, Plus, ExternalLink, Shield, Users, MessageSquare, TrendingUp } from "lucide-react";

const permissions = [
    { name: "instagram_business_basic", granted: true },
    { name: "instagram_manage_messages", granted: true },
    { name: "instagram_manage_comments", granted: true },
    { name: "pages_show_list", granted: true },
    { name: "business_management", granted: false },
];

const stats = [
    { label: "Followers", value: "24.8K", icon: Users, color: "#ec4899" },
    { label: "DMs Handled", value: "48.2K", icon: MessageSquare, color: "#7c3aed" },
    { label: "Response Rate", value: "94%", icon: TrendingUp, color: "#10b981" },
];

export default function InstagramPage() {
    return (
        <div className="space-y-6 max-w-[900px] p-4 sm:p-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Instagram Connection</h1>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage your Instagram Business Account integration</p>
            </div>

            {/* Connected Account */}
            <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "linear-gradient(135deg,#ec4899,#7c3aed)" }} />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#ec4899,#7c3aed)", boxShadow: "0 8px 30px rgba(236,72,153,0.4)" }}>
                            <Instagram className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>@mybrand</h2>
                                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />CONNECTED
                                </span>
                            </div>
                            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Business Account · Connected Feb 10, 2025</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                            style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                            <RefreshCw className="w-4 h-4" />Refresh
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                            Disconnect
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="relative grid grid-cols-3 gap-4 mt-6">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center p-4 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
                            <div className="text-xl font-bold mb-0.5" style={{ color: "var(--foreground)" }}>{s.value}</div>
                            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Permissions */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5" style={{ color: "#ec4899" }} />
                    <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>API Permissions</h2>
                </div>
                <div className="space-y-2">
                    {permissions.map((p) => (
                        <div key={p.name} className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: p.granted ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                                    {p.granted
                                        ? <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                                        : <X className="w-4 h-4" style={{ color: "#ef4444" }} />}
                                </div>
                                <code className="text-xs font-mono" style={{ color: "var(--foreground)" }}>{p.name}</code>
                            </div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={p.granted ? { background: "rgba(16,185,129,0.1)", color: "#10b981" } : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                                {p.granted ? "Granted" : "Missing"}
                            </span>
                        </div>
                    ))}
                </div>
                {!permissions.every((p) => p.granted) && (
                    <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
                        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <span className="text-sm" style={{ color: "#f59e0b" }}>⚠️</span>
                        <p className="text-xs" style={{ color: "#f59e0b" }}>
                            Some permissions are missing. Re-authorize your account to grant all required permissions.
                        </p>
                    </div>
                )}
            </div>

            {/* Webhook */}
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <Webhook className="w-5 h-5" style={{ color: "#7c3aed" }} />
                        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>Webhook Configuration</h2>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Active
                    </span>
                </div>
                <div className="space-y-4">
                    {[
                        { label: "Webhook URL", value: "https://botchat.io/webhook/ig/abc123" },
                        { label: "Verify Token", value: "bch_verify_secret_xyz" },
                    ].map((f) => (
                        <div key={f.label}>
                            <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--muted-foreground)" }}>{f.label}</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <code className="flex-1 text-xs font-mono" style={{ color: "var(--foreground)" }}>{f.value}</code>
                                <ExternalLink className="w-3.5 h-3.5 cursor-pointer hover:opacity-70" style={{ color: "var(--muted-foreground)" }} />
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {["messages", "messaging_postbacks", "comments", "live_comments"].map((sub) => (
                            <span key={sub} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                                style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899", border: "1px solid rgba(236,72,153,0.2)" }}>
                                {sub}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Account */}
            <div className="glass-card rounded-2xl p-6 text-center" style={{ borderStyle: "dashed", borderColor: "var(--glass-border)" }}>
                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(236,72,153,0.1)", border: "1px dashed rgba(236,72,153,0.3)" }}>
                    <Plus className="w-6 h-6" style={{ color: "#ec4899" }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--foreground)" }}>Connect Another Account</p>
                <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>Your Pro plan supports up to 3 Instagram accounts</p>
                <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: "linear-gradient(135deg,#ec4899,#7c3aed)", color: "white" }}>
                    Connect Instagram
                </button>
            </div>
        </div>
    );
}
