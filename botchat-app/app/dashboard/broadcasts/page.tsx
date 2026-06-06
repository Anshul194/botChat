"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getBroadcastCampaigns,
    createBroadcastCampaign,
    deleteBroadcastCampaign,
    cloneBroadcast,
    createTemplateFromCampaign
} from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import {
    Plus, Radio, MoreVertical, Trash2, Edit3, Users,
    MessageSquare, Clock, CheckCircle2, XCircle, Send,
    Play, PauseCircle, Loader2, ChevronRight, Search,
    Facebook, TrendingUp, CalendarDays, Copy, Star
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Status badge config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    draft:     { label: "Draft",     color: "#94a3b8", bg: "rgba(148,163,184,0.1)", icon: Edit3 },
    scheduled: { label: "Scheduled", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Clock },
    sending:   { label: "Sending",   color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   icon: Play },
    sent:      { label: "Sent",      color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle2 },
    failed:    { label: "Failed",    color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle },
    cancelled: { label: "Cancelled", color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: PauseCircle },
};

// ─── Create Campaign Modal ───────────────────────────────────────────────────

function CreateCampaignModal({ open, onClose, onCreated }: {
    open: boolean;
    onClose: () => void;
    onCreated: (id: number) => void;
}) {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");

    const createMutation = useMutation({
        mutationFn: () => createBroadcastCampaign({ name, description: desc, channel_type: 'facebook' }),
        onSuccess: (res) => {
            toast.success("Campaign created!");
            onCreated(res.data.id);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || "Failed to create campaign.";
            toast.error(msg);
        }
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-md rounded-2xl p-6 space-y-5" style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                        <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-base" style={{ color: "var(--foreground)" }}>New Broadcast Campaign</h2>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Set up your Messenger broadcast in 3 steps</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Campaign Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. June Flash Sale Announcement"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: "var(--glass-bg)",
                                border: "1px solid var(--glass-border)",
                                color: "var(--foreground)"
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Description (optional)</label>
                        <textarea
                            rows={3}
                            placeholder="Internal notes about this campaign…"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                            style={{
                                background: "var(--glass-bg)",
                                border: "1px solid var(--glass-border)",
                                color: "var(--foreground)"
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--muted-foreground)" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => createMutation.mutate()}
                        disabled={!name.trim() || createMutation.isPending}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                        style={{ background: "var(--brand-gradient)" }}
                    >
                        {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Campaign
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Campaign Card ───────────────────────────────────────────────────────────

function CampaignCard({ campaign, onDelete, onClone, onSaveTemplate }: { 
    campaign: any; 
    onDelete: (id: number) => void;
    onClone: (id: number) => void;
    onSaveTemplate: (id: number) => void;
}) {
    const router = useRouter();
    const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
    const StatusIcon = status.icon;

    const nextStep = () => {
        if (campaign.status === "sending" || campaign.status === "paused") {
            router.push(`/dashboard/broadcasts/${campaign.id}/monitor`);
        } else {
            router.push(`/dashboard/broadcasts/${campaign.id}`);
        }
    };

    return (
        <div
            className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer group transition-all hover:scale-[1.01]"
            style={{ border: "1px solid var(--glass-border)" }}
            onClick={nextStep}
        >
            {/* Status bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${status.color}, transparent)` }} />

            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>{campaign.name}</h3>
                    {campaign.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{campaign.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{ background: status.bg, color: status.color }}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                                <MoreVertical className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/broadcasts/${campaign.id}/analytics`)}>
                                <TrendingUp className="w-3.5 h-3.5 mr-2" /> Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/broadcasts/${campaign.id}`)}>
                                <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Campaign
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onClone(campaign.id)}>
                                <Copy className="w-3.5 h-3.5 mr-2" /> Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSaveTemplate(campaign.id)}>
                                <Star className="w-3.5 h-3.5 mr-2" /> Save as Template
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={() => onDelete(campaign.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-1.5 mb-4">
                {[
                    { label: "Campaign", done: true },
                    { label: "Audience", done: !!campaign.audience_filter },
                    { label: "Message",  done: campaign.content_status === "completed" },
                    { label: "Schedule", done: !!campaign.scheduled_at },
                ].map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: step.done ? "#10b981" : "var(--glass-border)" }}
                            />
                            <span className="text-[10px]" style={{ color: step.done ? "#10b981" : "var(--muted-foreground)" }}>{step.label}</span>
                        </div>
                        {i < 3 && <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "var(--glass-border)" }} />}
                    </div>
                ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2">
                {[
                    { icon: Users,          label: "Recipients",  value: campaign.total_recipients?.toLocaleString() ?? "—" },
                    { icon: MessageSquare,  label: "Msg Type",    value: campaign.message_type ? campaign.message_type.charAt(0).toUpperCase() + campaign.message_type.slice(1) : "—" },
                    { icon: CalendarDays,   label: "Scheduled",   value: campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleDateString() : "—" },
                ].map((s) => (
                    <div key={s.label} className="p-2 rounded-xl text-center" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                        <s.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: "var(--muted-foreground)" }} />
                        <div className="text-xs font-bold" style={{ color: "var(--foreground)" }}>{s.value}</div>
                        <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Continue arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5" style={{ color: "var(--brand-purple)" }} />
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BroadcastsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const { data, isLoading } = useQuery({
        queryKey: ["broadcastCampaigns", statusFilter],
        queryFn: () => getBroadcastCampaigns(statusFilter !== "all" ? { status: statusFilter } : {}),
    });

    const campaigns: any[] = data?.data ?? [];

    const filtered = campaigns.filter((c) =>
        c.name?.toLowerCase().includes(search.toLowerCase())
    );

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBroadcastCampaign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["broadcastCampaigns"] });
            toast.success("Campaign deleted.");
        },
        onError: () => toast.error("Failed to delete campaign.")
    });

    const cloneMutation = useMutation({
        mutationFn: (id: number) => cloneBroadcast(id, {}),
        onSuccess: (res) => {
            toast.success("Campaign cloned successfully");
            queryClient.invalidateQueries({ queryKey: ["broadcastCampaigns"] });
            router.push(`/dashboard/broadcasts/${res.data.id}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to clone campaign");
        }
    });

    const saveTemplateMutation = useMutation({
        mutationFn: (id: number) => createTemplateFromCampaign(id, {}),
        onSuccess: (res) => {
            toast.success("Template saved successfully");
            router.push(`/dashboard/broadcast-templates/${res.data.id}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to save template");
        }
    });

    const handleCreated = (id: number) => {
        setShowCreate(false);
        queryClient.invalidateQueries({ queryKey: ["broadcastCampaigns"] });
        router.push(`/dashboard/broadcasts/${id}`);
    };

    const stats = {
        total: campaigns.length,
        draft: campaigns.filter((c) => c.status === "draft").length,
        scheduled: campaigns.filter((c) => c.status === "scheduled").length,
        sent: campaigns.filter((c) => c.status === "sent").length,
    };

    return (
        <div className="space-y-6 max-w-[1400px] p-4 sm:p-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
                        Messenger Broadcasts
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Send bulk Messenger campaigns to your subscribers
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}
                >
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Campaigns", value: stats.total, color: "#7c3aed", icon: Radio },
                    { label: "Drafts",           value: stats.draft, color: "#94a3b8", icon: Edit3 },
                    { label: "Scheduled",        value: stats.scheduled, color: "#f59e0b", icon: Clock },
                    { label: "Sent",             value: stats.sent, color: "#10b981", icon: Send },
                ].map((s) => (
                    <div key={s.label} className="glass-card rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
                            </div>
                            <div>
                                <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        type="text"
                        placeholder="Search campaigns…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                    />
                </div>

                <div className="flex items-center rounded-xl p-1 gap-1" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                    {(["all", "draft", "scheduled", "sent", "failed"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
                            style={statusFilter === s
                                ? { background: "var(--brand-gradient)", color: "white" }
                                : { color: "var(--muted-foreground)" }
                            }
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <span className="text-sm ml-auto" style={{ color: "var(--muted-foreground)" }}>
                    {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Campaigns Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: "rgba(124,58,237,0.1)", border: "1px dashed rgba(124,58,237,0.3)" }}>
                        <Radio className="w-8 h-8" style={{ color: "var(--brand-purple)" }} />
                    </div>
                    <p className="font-semibold" style={{ color: "var(--foreground)" }}>No campaigns yet</p>
                    <p className="text-sm mt-1 mb-5" style={{ color: "var(--muted-foreground)" }}>
                        Create your first Messenger broadcast campaign
                    </p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                        style={{ background: "var(--brand-gradient)" }}
                    >
                        <Plus className="w-4 h-4" /> Create Campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((campaign) => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onDelete={(id) => {
                                if (confirm("Delete this campaign? This cannot be undone.")) {
                                    deleteMutation.mutate(id);
                                }
                            }}
                            onClone={(id) => cloneMutation.mutate(id)}
                            onSaveTemplate={(id) => saveTemplateMutation.mutate(id)}
                        />
                    ))}

                    {/* New Campaign Card */}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:opacity-80 transition-opacity min-h-[200px]"
                        style={{ borderStyle: "dashed", borderColor: "var(--glass-border)" }}
                    >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(124,58,237,0.1)", border: "1px dashed rgba(124,58,237,0.3)" }}>
                            <Plus className="w-6 h-6" style={{ color: "var(--brand-purple)" }} />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>New Broadcast</span>
                    </button>
                </div>
            )}

            <CreateCampaignModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />
        </div>
    );
}
