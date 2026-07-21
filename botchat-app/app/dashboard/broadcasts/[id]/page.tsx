"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    getBroadcastCampaign,
    getAudienceFilters,
    previewAudience,
    saveAudience,
} from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import {
    Loader2, Users, Filter, ChevronRight, CheckCircle2,
    Facebook, Instagram, Tag, UserCheck, Globe, ChevronDown,
    X, RefreshCw, Info, ArrowRight,
} from "lucide-react";

// ─── Multi-Select Dropdown ───────────────────────────────────────────────────

function MultiSelect({
    label,
    options,
    selected,
    onChange,
    icon: Icon,
}: {
    label: string;
    options: { id: number | string; name: string }[];
    selected: (number | string)[];
    onChange: (v: (number | string)[]) => void;
    icon?: React.ElementType;
}) {
    const [open, setOpen] = useState(false);
    const toggle = (id: number | string) => {
        onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    };
    const selectedLabels = options.filter((o) => selected.includes(o.id)).map((o) => o.name);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                style={{ background: "var(--glass-bg)", border: `1px solid ${selected.length > 0 ? "var(--brand-purple)" : "var(--glass-border)"}`, color: "var(--foreground)" }}
            >
                <div className="flex items-center gap-2 min-w-0">
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" style={{ color: selected.length > 0 ? "var(--brand-purple)" : "var(--muted-foreground)" }} />}
                    <span className="truncate" style={{ color: selected.length > 0 ? "var(--foreground)" : "var(--muted-foreground)" }}>
                        {selectedLabels.length > 0 ? selectedLabels.join(", ") : label}
                    </span>
                </div>
                <ChevronDown className="w-4 h-4 flex-shrink-0 ml-2" style={{ color: "var(--muted-foreground)" }} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl shadow-xl z-50 overflow-hidden"
                    style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                    {options.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: "var(--muted-foreground)" }}>No options available</p>
                    ) : (
                        options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => { toggle(opt.id); setOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all hover:bg-[var(--card)]/5 text-left"
                                style={{ color: selected.includes(opt.id) ? "var(--brand-purple)" : "var(--foreground)" }}
                            >
                                {opt.name}
                                {selected.includes(opt.id) && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Audience Size Card ──────────────────────────────────────────────────────

function AudienceSizeCard({ count, isLoading }: { count: number | null; isLoading: boolean }) {
    return (
        <div className="glass-card rounded-2xl p-5 text-center" style={{ border: "1px solid var(--glass-border)" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Users className="w-7 h-7" style={{ color: "var(--brand-purple)" }} />
            </div>
            {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--brand-purple)" }} />
            ) : count === null ? (
                <>
                    <p className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>—</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Select filters to preview</p>
                </>
            ) : (
                <>
                    <p className="text-3xl font-bold" style={{ color: "var(--brand-purple)" }}>{count.toLocaleString()}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Estimated recipients</p>
                </>
            )}
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BroadcastAudiencePage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    // Audience filter state
    const [channelType, setChannelType] = useState<"facebook" | "instagram">("facebook");
    const [facebookPageIds, setFacebookPageIds] = useState<number[]>([]);
    const [instagramAccountIds, setInstagramAccountIds] = useState<number[]>([]);
    const [labelIds, setLabelIds] = useState<number[]>([]);
    const [excludeLabelIds, setExcludeLabelIds] = useState<number[]>([]);
    const [gender, setGender] = useState<string>("");
    const [subscriberStatus, setSubscriberStatus] = useState<string>("active");
    const [audienceCount, setAudienceCount] = useState<number | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    // Fetch campaign
    const { data: campaignData, isLoading: campaignLoading } = useQuery({
        queryKey: ["broadcastCampaign", campaignId],
        queryFn: () => getBroadcastCampaign(campaignId),
    });

    // Fetch filters (pages, labels, etc.)
    const { data: filtersData, isLoading: filtersLoading } = useQuery({
        queryKey: ["broadcastAudienceFilters"],
        queryFn: getAudienceFilters,
    });

    const campaign = campaignData?.data;
    const filters = filtersData?.data;

    // Pre-populate if audience already saved
    useEffect(() => {
        if (campaign?.audience_filter) {
            const af = campaign.audience_filter;
            if (af.channel_type) setChannelType(af.channel_type);
            if (af.facebook_page_ids) setFacebookPageIds(af.facebook_page_ids);
            if (af.instagram_account_ids) setInstagramAccountIds(af.instagram_account_ids);
            if (af.labels) setLabelIds(af.labels);
            if (af.exclude_labels) setExcludeLabelIds(af.exclude_labels);
            if (af.gender) setGender(af.gender);
            if (af.subscriber_status) setSubscriberStatus(af.subscriber_status);
            if (campaign.total_recipients !== null && campaign.total_recipients !== undefined) {
                setAudienceCount(campaign.total_recipients);
            }
        }
    }, [campaign]);

    // Build filter payload
    const buildFilterPayload = () => ({
        channel_type: channelType,
        ...(channelType === "facebook" && facebookPageIds.length > 0 && { facebook_page_ids: facebookPageIds }),
        ...(channelType === "instagram" && instagramAccountIds.length > 0 && { instagram_account_ids: instagramAccountIds }),
        ...(labelIds.length > 0 && { labels: labelIds }),
        ...(excludeLabelIds.length > 0 && { exclude_labels: excludeLabelIds }),
        ...(gender && { gender }),
        ...(subscriberStatus && { subscriber_status: subscriberStatus }),
    });

    // Preview audience
    const handlePreview = async () => {
        setPreviewLoading(true);
        try {
            const res = await previewAudience(buildFilterPayload());
            setAudienceCount(res.data.count);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to preview audience.");
        } finally {
            setPreviewLoading(false);
        }
    };

    // Save audience mutation
    const saveMutation = useMutation({
        mutationFn: () => saveAudience(campaignId, buildFilterPayload()),
        onSuccess: (res) => {
            setAudienceCount(res.data.total_recipients);
            toast.success("Audience saved! Proceeding to message builder…");
            router.push(`/dashboard/broadcasts/${campaignId}/message`);
        },
        onError: (err: any) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach((e: any) => toast.error(e[0]));
            } else {
                toast.error(err.response?.data?.message || "Failed to save audience.");
            }
        }
    });

    const facebookPages = filters?.facebook_pages ?? [];
    const instagramAccounts = filters?.instagram_accounts ?? [];
    const labels = filters?.labels ?? [];
    const genders = filters?.genders ?? [];

    if (campaignLoading || filtersLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6">

            {/* Wizard Progress */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 glass-card rounded-xl px-4 sm:px-5 py-3 sm:py-4"
                style={{ border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <span className="flex items-center gap-1.5 whitespace-nowrap shrink-0" style={{ color: "#10b981" }}>
                        <CheckCircle2 className="w-4 h-4" /> Campaign
                    </span>
                    <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--glass-border)" }} />
                    <span className="flex items-center gap-1.5 font-bold whitespace-nowrap shrink-0" style={{ color: "#FF2D78" }}>
                        <Users className="w-4 h-4" /> Audience
                    </span>
                    <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--glass-border)" }} />
                    <span className="whitespace-nowrap shrink-0" style={{ color: "var(--muted-foreground)" }}>Message</span>
                    <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "var(--glass-border)" }} />
                    <span className="whitespace-nowrap shrink-0" style={{ color: "var(--muted-foreground)" }}>Review &amp; Schedule</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs sm:text-sm font-bold truncate max-w-full" style={{ color: "var(--foreground)" }}>
                        {campaign?.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* LEFT: Filters */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-5 order-2 lg:order-1">

                    {/* Channel Selector */}
                    <div className="glass-card rounded-2xl p-5" style={{ border: "1px solid var(--glass-border)" }}>
                        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            <Filter className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                            Select Channel
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: "facebook", label: "Facebook Messenger", icon: Facebook, color: "#3b82f6" },
                                { id: "instagram", label: "Instagram DM", icon: Instagram, color: "#ec4899" },
                            ].map((ch) => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    onClick={() => setChannelType(ch.id as "facebook" | "instagram")}
                                    className="flex items-center gap-3 p-4 rounded-xl text-sm font-semibold text-left transition-all"
                                    style={{
                                        background: channelType === ch.id ? `${ch.color}15` : "var(--glass-bg)",
                                        border: `1px solid ${channelType === ch.id ? ch.color : "var(--glass-border)"}`,
                                        color: channelType === ch.id ? ch.color : "var(--muted-foreground)",
                                    }}
                                >
                                    <ch.icon className="w-5 h-5" />
                                    {ch.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pages / Accounts */}
                    <div className="glass-card rounded-2xl p-5" style={{ border: "1px solid var(--glass-border)" }}>
                        <h2 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            {channelType === "facebook"
                                ? <><Facebook className="w-4 h-4 text-blue-500" /> Facebook Pages</>
                                : <><Instagram className="w-4 h-4 text-[var(--primary)]" /> Instagram Accounts</>}
                        </h2>
                        {channelType === "facebook" ? (
                            <MultiSelect
                                label="Select Facebook Pages…"
                                options={facebookPages.map((p: any) => ({ id: p.id, name: p.page_name }))}
                                selected={facebookPageIds}
                                onChange={(v) => setFacebookPageIds(v as number[])}
                                icon={Facebook}
                            />
                        ) : (
                            <MultiSelect
                                label="Select Instagram Accounts…"
                                options={instagramAccounts.map((a: any) => ({ id: a.id, name: a.username }))}
                                selected={instagramAccountIds}
                                onChange={(v) => setInstagramAccountIds(v as number[])}
                                icon={Instagram}
                            />
                        )}
                        {channelType === "facebook" && facebookPages.length === 0 && (
                            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                                <Info className="w-3.5 h-3.5" /> No Facebook Pages connected yet.
                            </p>
                        )}
                    </div>

                    {/* Subscriber Filters */}
                    <div className="glass-card rounded-2xl p-5 space-y-4" style={{ border: "1px solid var(--glass-border)" }}>
                        <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            <UserCheck className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                            Subscriber Filters
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: "var(--muted-foreground)" }}>Include Labels</label>
                                <MultiSelect
                                    label="Select labels…"
                                    options={labels.map((l: any) => ({ id: l.id, name: l.name }))}
                                    selected={labelIds}
                                    onChange={(v) => setLabelIds(v as number[])}
                                    icon={Tag}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: "var(--muted-foreground)" }}>Exclude Labels</label>
                                <MultiSelect
                                    label="Exclude labels…"
                                    options={labels.map((l: any) => ({ id: l.id, name: l.name }))}
                                    selected={excludeLabelIds}
                                    onChange={(v) => setExcludeLabelIds(v as number[])}
                                    icon={X}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: "var(--muted-foreground)" }}>Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                >
                                    <option value="">All genders</option>
                                    {genders.map((g: any) => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium block mb-2" style={{ color: "var(--muted-foreground)" }}>Subscriber Status</label>
                                <select
                                    value={subscriberStatus}
                                    onChange={(e) => setSubscriberStatus(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(facebookPageIds.length > 0 || instagramAccountIds.length > 0 || labelIds.length > 0 || excludeLabelIds.length > 0 || gender) && (
                        <div className="flex flex-wrap gap-2">
                            {facebookPageIds.map((id) => {
                                const page = facebookPages.find((p: any) => p.id === id);
                                return page ? (
                                    <span key={id} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                                        style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                                        <Facebook className="w-3 h-3" /> {page.page_name}
                                        <button onClick={() => setFacebookPageIds(facebookPageIds.filter(i => i !== id))}><X className="w-3 h-3" /></button>
                                    </span>
                                ) : null;
                            })}
                            {labelIds.map((id) => {
                                const label = labels.find((l: any) => l.id === id);
                                return label ? (
                                    <span key={id} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                                        style={{ background: "rgba(124,58,237,0.12)", color: "var(--brand-purple)", border: "1px solid rgba(124,58,237,0.2)" }}>
                                        <Tag className="w-3 h-3" /> {label.name}
                                        <button onClick={() => setLabelIds(labelIds.filter(i => i !== id))}><X className="w-3 h-3" /></button>
                                    </span>
                                ) : null;
                            })}
                            {gender && (
                                <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                                    style={{ background: "rgba(6,182,212,0.12)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}>
                                    <Globe className="w-3 h-3" /> {gender}
                                    <button onClick={() => setGender("")}><X className="w-3 h-3" /></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT: Preview + Actions */}
                <div className="space-y-4 order-1 lg:order-2 lg:sticky lg:top-6 self-start">
                    <AudienceSizeCard count={audienceCount} isLoading={previewLoading} />

                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={previewLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                    >
                        {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Preview Audience Size
                    </button>

                    <button
                        type="button"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending || (channelType === "facebook" && facebookPageIds.length === 0) || (channelType === "instagram" && instagramAccountIds.length === 0)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 15px rgba(124,58,237,0.3)" }}
                    >
                        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                        Save & Continue to Message
                    </button>

                    {/* Validation hint */}
                    {channelType === "facebook" && facebookPageIds.length === 0 && (
                        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                            Select at least one Facebook Page to continue
                        </p>
                    )}
                    {channelType === "instagram" && instagramAccountIds.length === 0 && (
                        <p className="text-xs text-center" style={{ color: "var(--muted-foreground)" }}>
                            Select at least one Instagram Account to continue
                        </p>
                    )}

                    {/* Tips */}
                    <div className="glass-card rounded-2xl p-4 space-y-2" style={{ border: "1px solid var(--glass-border)" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>💡 Audience Tips</p>
                        <ul className="space-y-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                            <li>• Target active subscribers for higher open rates</li>
                            <li>• Use labels to segment your audience by interest</li>
                            <li>• Exclude recently messaged contacts to avoid fatigue</li>
                            <li>• Preview audience size before saving</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
