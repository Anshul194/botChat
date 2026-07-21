"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchLinkById, updateLink, fetchLinks } from "@/store/slices/linksSlice";
import { fetchPixels } from "@/store/slices/pixelsSlice";
import { Shield, Target, ActivitySquare, Check, ArrowLeft, CalendarClock, Globe, Info, Link2, PencilLine, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/providers/ModalProvider";
import { SEEDED, LinkDraft } from "./data";

type Props = { slug: string };

const SECTION_META: Array<{ key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { key: "app", label: "App linking", icon: Link2 },
    { key: "pixels", label: "Google Analytics", icon: ActivitySquare },
    { key: "temporary", label: "Temporary URL", icon: CalendarClock },
    { key: "password", label: "Protection", icon: Shield },
];

const toggleClass = (on: boolean) => cn("w-9 h-5 rounded-full transition-colors relative shrink-0", on ? "bg-primary" : "bg-[var(--muted)] dark:bg-slate-700");
const thumbClass = (on: boolean) => cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all", on ? "left-[18px]" : "left-[2px]");

export default function ShortenedLinkEditorClient({ slug: incomingSlug }: Props) {
    const slug = String(incomingSlug || "untitled").toLowerCase();

    const initial = useMemo<LinkDraft>(() => {
        const seeded = SEEDED[slug];
        if (seeded) return seeded;
        return {
            slug,
            destinationUrl: "https://example.com",
            appLinking: false,
            pixelsEnabled: false,
            selectedPixels: [] as number[],
            temporaryEnabled: false,
            temporaryUntil: "",
            utmSource: "",
            utmMedium: "",
            utmCampaign: "",
            password: "",
            sensitiveContentWarning: false,
            cloakingEnabled: false,
            advancedNotes: "",
            active: true,
            targetingType: "none",
            targeting: [],
        } as LinkDraft;
    }, [slug]);

    const dispatch = useAppDispatch();
    const { currentLink, links, isLoading } = useAppSelector((state) => state.links);
    const { pixels } = useAppSelector((state) => state.pixels);

    const [draft, setDraft] = useState<LinkDraft>(initial);
    const { showModal } = useModal();

    useEffect(() => {
        if (!currentLink || (currentLink.url !== slug && currentLink.slug !== slug)) {
            const linkInList = links.find((l: any) => (l.url === slug || l.slug === slug));

            if (linkInList) {
                const id = linkInList.link_id || linkInList.id;
                dispatch(fetchLinkById(id));
                localStorage.setItem(`link_id_${slug}`, id.toString());
            } else {
                const savedId = localStorage.getItem(`link_id_${slug}`);
                if (savedId) {
                    dispatch(fetchLinkById(savedId));
                } else if (links.length === 0 && !isLoading) {
                    dispatch(fetchLinks({}));
                }
            }
        }
    }, [slug, links, currentLink, dispatch, isLoading]);

    useEffect(() => {
        if (currentLink) {
            setDraft((prev) => ({
                ...prev,
                destinationUrl: currentLink.location_url || prev.destinationUrl,
                slug: currentLink.url || prev.slug,
                active: currentLink.is_enabled !== undefined ? currentLink.is_enabled : prev.active,

                appLinking: currentLink.app_linking?.is_enabled ?? prev.appLinking,

                temporaryEnabled: !!(currentLink.temporary_url?.start_date || currentLink.temporary_url?.end_date || currentLink.temporary_url?.clicks_limit || currentLink.temporary_url?.expiration_url),
                temporaryStart: currentLink.temporary_url?.start_date ? currentLink.temporary_url.start_date.replace(" ", "T").substring(0, 16) : "",
                temporaryEnd: currentLink.temporary_url?.end_date ? currentLink.temporary_url.end_date.replace(" ", "T").substring(0, 16) : "",
                expirationUrl: currentLink.temporary_url?.expiration_url || "",
                clicksLimit: currentLink.temporary_url?.clicks_limit || "",

                utmSource: currentLink.utm?.source || "",
                utmMedium: currentLink.utm?.medium || "",
                utmCampaign: currentLink.utm?.campaign || "",

                password: currentLink.protection?.password || "",
                sensitiveContentWarning: currentLink.protection?.sensitive_content ?? false,

                targetingType: currentLink.targeting?.type || "none",
                targeting: currentLink.targeting?.rules || [],

                cloakingEnabled: currentLink.cloaking?.is_enabled ?? false,
                cloaking_title: currentLink.cloaking?.title || "",
                cloaking_meta_description: currentLink.cloaking?.meta_description || "",
                cloaking_custom_js: currentLink.cloaking?.custom_js || "",
                cloaking_favicon: currentLink.cloaking?.favicon || null,
                cloaking_opengraph: currentLink.cloaking?.opengraph || null,
                http_status_code: currentLink.http_status_code || 301,
                splash_page_id: currentLink.splash_page_id || "",
                selectedPixels: currentLink.pixels_ids || currentLink.pixels || [],
            } as any));
        }
    }, [currentLink]);

    useEffect(() => { dispatch(fetchPixels()); }, [dispatch]);

    const [openSection, setOpenSection] = useState<string>("app");
    const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
    const currentMeta = SECTION_META.find((s) => s.key === openSection);

    const shortUrl = `66biolinks.com/${draft.slug}`;

    const [copied, setCopied] = useState(false);

    const isValidUrl = (u: string) => {
        try {
            if (!u) return false;
            const normalized = u.match(/^https?:\/\//) ? u : `https://${u}`;
            new URL(normalized);
            return true;
        } catch {
            return false;
        }
    };

    const onSave = async () => {
        if (!currentLink) return;
        const linkId = currentLink.link_id || currentLink.id;

        const payload: Record<string, any> = {
            location_url: draft.destinationUrl,
            url: draft.slug,
            http_status_code: (draft as any).http_status_code?.toString() || "301",
        };

        payload.schedule = !!draft.temporaryEnabled;
        payload.sensitive_content = !!draft.sensitiveContentWarning;
        payload.app_linking_is_enabled = !!draft.appLinking;
        if ((draft as any).splash_page_id) payload.splash_page_id = (draft as any).splash_page_id;

        if (draft.temporaryEnabled) {
            if (draft.temporaryStart) payload.start_date = draft.temporaryStart.replace("T", " ") + ":00";
            if (draft.temporaryEnd) payload.end_date = draft.temporaryEnd.replace("T", " ") + ":00";
            if ((draft as any).expirationUrl) payload.expiration_url = (draft as any).expirationUrl;
            if ((draft as any).clicksLimit) payload.clicks_limit = (draft as any).clicksLimit;
        }

        if (draft.password) payload.password = draft.password;

        payload.utm_source = draft.utmSource || "";
        payload.utm_medium = draft.utmMedium || "";
        payload.utm_campaign = draft.utmCampaign || "";

        const isCloakingFilled = !!((draft as any).cloaking_title || (draft as any).cloaking_meta_description || (draft as any).cloaking_custom_js || (draft as any).cloaking_favicon || (draft as any).cloaking_opengraph);
        payload.cloaking_is_enabled = isCloakingFilled ? 1 : 0;
        payload.cloaking_title = (draft as any).cloaking_title || "";
        payload.cloaking_meta_description = (draft as any).cloaking_meta_description || "";
        payload.cloaking_custom_js = (draft as any).cloaking_custom_js || "";

        if ((draft as any).cloaking_favicon instanceof File) {
            payload.cloaking_favicon = (draft as any).cloaking_favicon;
        }
        if ((draft as any).cloaking_opengraph instanceof File) {
            payload.cloaking_opengraph = (draft as any).cloaking_opengraph;
        }

        if (draft.targetingType && draft.targetingType !== "none") {
            payload.targeting_type = draft.targetingType;
            const rules = draft.targeting || [];
            rules.forEach((r, i) => {
                payload[`targeting_${draft.targetingType}_key[${i}]`] = r.key;
                payload[`targeting_${draft.targetingType}_value[${i}]`] = r.value;
            });
        }

        payload.pixels_ids = (draft as any).selectedPixels || [];

        const hasFiles = payload.cloaking_favicon instanceof File || payload.cloaking_opengraph instanceof File;

        let finalPayload: any = payload;
        if (hasFiles) {
            const formData = new FormData();
            Object.keys(payload).forEach(key => {
                if (payload[key] !== null && payload[key] !== undefined) {
                    formData.append(key, payload[key]);
                }
            });
            finalPayload = formData;
        }

        const resultAction = await dispatch(updateLink({ linkId, data: finalPayload }));

        if (updateLink.fulfilled.match(resultAction)) {
            showModal("success", "Updated", "Link updated successfully!");
            dispatch(fetchLinkById(linkId));
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 1500);
        } else {
            showModal("error", "Error", (resultAction.payload as string) || "Failed to update link");
        }
    };

    return (
        <div className="min-h-screen w-full px-3 sm:px-6 py-4 sm:py-8 bg-[var(--muted)]/50 dark:bg-[#020617]">
            <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Breadcrumb header */}
                <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-sm bg-[var(--card)] dark:bg-[var(--background)]/80 p-4 sm:p-6 border border-[var(--border)] dark:border-[var(--border)]/50 backdrop-blur-xl">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-primary grid place-items-center text-white font-black text-base sm:text-lg shrink-0">FL</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-[var(--muted-foreground)] mb-0.5 sm:mb-1 truncate">
                                        Links <span className="text-[var(--muted-foreground)]/50">›</span> <span className="font-semibold">{draft.slug}</span>
                                    </p>
                                    <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-[var(--foreground)] dark:text-white truncate">{draft.slug}</h2>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={toggleClass(draft.active)} title="Toggle active">
                                        <span className={thumbClass(draft.active)} />
                                    </button>
                                    <Link href="/dashboard/shortened-links" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--foreground)] dark:text-[var(--muted-foreground)]/50 rounded-lg sm:rounded-xl hover:bg-[var(--muted)]/80 dark:hover:bg-[var(--muted)]/80 transition-colors text-[11px] sm:text-sm font-bold">
                                        <ArrowLeft size={12} className="sm:size-[14px]" /> <span className="hidden xs:inline">Back</span>
                                    </Link>
                                </div>
                            </div>
                            <p className="text-[11px] sm:text-sm text-[var(--muted-foreground)] mt-1 sm:mt-2">Customize delivery rules and integrations for this short link.</p>
                        </div>
                    </div>
                </div>

                {/* Destination URL + Short URL */}
                <div className="bg-[var(--card)] dark:bg-[var(--background)]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-[var(--border)] dark:border-[var(--border)]/50 backdrop-blur-xl space-y-3 sm:space-y-4">
                    <div>
                        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Destination URL</label>
                        <input value={draft.destinationUrl} onChange={(e) => setDraft((prev) => ({ ...prev, destinationUrl: e.target.value }))} className="w-full mt-1.5 sm:mt-2 h-10 sm:h-12 px-3 sm:px-4 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-sm" aria-invalid={!isValidUrl(draft.destinationUrl)} />
                    </div>
                    <div>
                        <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[var(--muted-foreground)]">Short URL</label>
                        <div className="mt-1.5 sm:mt-2 flex items-center gap-2 sm:gap-3">
                            <div className="flex-1 rounded-lg bg-[var(--muted)]/50 dark:bg-[var(--muted)]/80 px-3 sm:px-4 py-2.5 sm:py-3 border border-[var(--border)] dark:border-[var(--border)]/50 font-mono text-xs sm:text-sm truncate text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/50">{shortUrl}</div>
                            <button
                                onClick={() => {
                                    try {
                                        navigator?.clipboard?.writeText(shortUrl);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1400);
                                    } catch { }
                                }}
                                aria-label="Copy short url"
                                className={cn("px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap", copied ? "bg-emerald-500 text-white ring-2 ring-offset-2 ring-emerald-300" : "bg-primary text-white hover:bg-primary/90")}
                            >
                                {copied ? <><Check size={14} className="inline sm:mr-1" /> <span className="hidden sm:inline">Copied</span></> : "Copy"}
                            </button>
                        </div>
                        {!isValidUrl(draft.destinationUrl) && (
                            <div className="text-[11px] sm:text-xs text-red-600 mt-1.5 sm:mt-2">Please enter a valid URL (e.g. example.com or https://example.com)</div>
                        )}
                    </div>
                </div>

                {/* Sidebar + Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 sm:gap-6">
                    {/* Mobile: horizontal scroll nav */}
                    <nav className="lg:hidden flex gap-1.5 p-1 rounded-xl bg-[var(--card)] dark:bg-[var(--background)]/80 border border-[var(--border)] dark:border-[var(--border)]/50 backdrop-blur-xl overflow-x-auto no-scrollbar">
                        {SECTION_META.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setOpenSection(key)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-left transition-all whitespace-nowrap shrink-0",
                                    openSection === key
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)]/40 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70"
                                )}
                            >
                                <Icon size={14} />
                                <span className="text-[11px] font-bold">{label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Desktop: vertical nav */}
                    <nav className="hidden lg:flex flex-col gap-1.5 p-2 rounded-2xl bg-[var(--card)] dark:bg-[var(--background)]/80 border border-[var(--border)] dark:border-[var(--border)]/50 backdrop-blur-xl h-fit">
                        {SECTION_META.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setOpenSection(key)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                    openSection === key
                                        ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                        : "hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--muted)]/40 text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg grid place-items-center overflow-hidden transition-colors",
                                    openSection === key ? "bg-[var(--card)]/20" : "bg-[var(--muted)]/50 dark:bg-[var(--muted)]"
                                )}>
                                    <img
                                        src={`/icons/${key}.svg`}
                                        alt={label}
                                        className="w-5 h-5"
                                        onLoad={(e) => {
                                            try {
                                                const svg = (e.currentTarget.nextElementSibling as HTMLElement | null);
                                                if (svg) svg.style.display = "none";
                                            } catch { }
                                        }}
                                        onError={(e) => {
                                            try {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            } catch { }
                                        }}
                                    />
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <div className={cn("text-sm font-bold", openSection === key ? "text-white" : "text-[var(--foreground)] dark:text-[var(--foreground)]")}>{label}</div>
                                    <div className={cn("text-[10px] uppercase tracking-wider font-bold", openSection === key ? "text-white/60" : "text-[var(--muted-foreground)]/70")}>{key === openSection ? "Active" : ""}</div>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Content panel */}
                    <div className="bg-[var(--card)] dark:bg-[var(--background)]/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[var(--border)] dark:border-[var(--border)]/50 backdrop-blur-xl shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="min-w-0">
                                <div className="text-base sm:text-lg font-extrabold">{currentMeta?.label}</div>
                                <div className="text-[11px] sm:text-sm text-[var(--muted-foreground)] mt-0.5 sm:mt-1">Configure {currentMeta?.label.toLowerCase()} behavior and options for this short link.</div>
                            </div>
                            <div className="shrink-0 ml-3">
                                {openSection === "app" && (
                                    <button onClick={() => setDraft((p) => ({ ...p, appLinking: !p.appLinking }))} className={toggleClass(draft.appLinking)} title="Toggle">
                                        <span className={thumbClass(draft.appLinking)} />
                                    </button>
                                )}
                                {openSection === "pixels" && (
                                    <button onClick={() => setDraft((p) => ({ ...p, pixelsEnabled: !p.pixelsEnabled }))} className={toggleClass(draft.pixelsEnabled)} title="Toggle">
                                        <span className={thumbClass(draft.pixelsEnabled)} />
                                    </button>
                                )}
                                {openSection === "temporary" && (
                                    <button onClick={() => setDraft((p) => ({ ...p, temporaryEnabled: !p.temporaryEnabled }))} className={toggleClass(draft.temporaryEnabled)} title="Toggle">
                                        <span className={thumbClass(draft.temporaryEnabled)} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {openSection === "app" && (
                            <>
                                <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                    <div className="text-sm font-bold text-[var(--foreground)] dark:text-slate-100">Supported operating systems</div>
                                    <div className="mt-2 sm:mt-3 flex gap-2 sm:gap-3 flex-wrap">
                                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-[var(--card)] dark:bg-[var(--muted)] text-xs sm:text-sm font-bold shadow-sm">Apple</span>
                                        <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-[var(--card)] dark:bg-[var(--muted)] text-xs sm:text-sm font-bold shadow-sm">Android</span>
                                    </div>
                                    <div className="text-sm font-bold text-[var(--foreground)] dark:text-slate-100 mt-4 sm:mt-6">Supported apps</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 sm:mt-3">
                                        {[
                                            "AliExpress", "Reddit", "YouTube", "WhatsApp", "Facebook Messenger", "Telegram", "Apple Music", "Pinterest", "Netflix", "Google Docs", "Google Maps", "TripAdvisor", "StockX",
                                            "TikTok", "X", "Instagram", "Snapchat", "Spotify", "LinkedIn", "Twitch", "Google Sheets", "Google Slides", "Airbnb", "Amazon", "Booking.com",
                                        ].map((a) => (
                                            <div key={a} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--card)] dark:bg-[var(--muted)] grid place-items-center text-[10px] sm:text-xs font-bold border border-[var(--border)] dark:border-[var(--border)] shadow-sm shrink-0">{a[0]}</div>
                                                <span className="text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70 font-medium truncate">{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3 sm:p-4 rounded-xl text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-xs sm:text-sm font-medium">Your destination URL is not matching any of the supported apps for automatic app opening.</div>
                            </>
                        )}
                        {openSection === "pixels" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="text-sm font-bold">Google Analytics Integrations</div>
                                </div>
                                {pixels.length === 0 ? (
                                    <p className="text-xs sm:text-sm text-[var(--muted-foreground)] text-center py-4">No integrations found. Create one in the Google Analytics section.</p>
                                ) : (
                                    <div className="space-y-2 sm:space-y-3">
                                        {pixels.map((pixel: any) => {
                                            const pid = pixel.id || pixel.pixel_id;
                                            const selected = (draft as any).selectedPixels || [];
                                            const isSelected = selected.includes(pid);
                                            return (
                                                <div key={pid} className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-[var(--card)] dark:bg-[var(--muted)] border border-[var(--border)] dark:border-[var(--border)]">
                                                    <div className="min-w-0 flex-1 mr-2">
                                                        <div className="text-xs sm:text-sm font-bold text-[var(--foreground)] dark:text-[var(--foreground)] truncate">{pixel.name}</div>
                                                        <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">{pixel.type} — {pixel.pixel_id_value}</div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            const current = [...selected];
                                                            if (isSelected) {
                                                                setDraft((p: any) => ({ ...p, selectedPixels: current.filter((id: number) => id !== pid) }));
                                                            } else {
                                                                setDraft((p: any) => ({ ...p, selectedPixels: [...current, pid] }));
                                                            }
                                                        }}
                                                        className="w-4 h-4 rounded accent-primary shrink-0"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {openSection === "temporary" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setDraft((p) => ({ ...p, temporaryEnabled: !p.temporaryEnabled }))} className={toggleClass(draft.temporaryEnabled)}>
                                        <span className={thumbClass(draft.temporaryEnabled)} />
                                    </button>
                                    <div>
                                        <div className="text-sm font-bold">Schedule</div>
                                        <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)]">Configure the dates on which it will work.</div>
                                    </div>
                                </div>

                                {draft.temporaryEnabled && (
                                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 mt-4">
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-semibold text-[var(--muted-foreground)]">Start Date</label>
                                            <input type="datetime-local" value={draft.temporaryStart || ""} onChange={(e) => setDraft((p) => ({ ...p, temporaryStart: e.target.value }))} className="w-full mt-1 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] sm:text-xs font-semibold text-[var(--muted-foreground)]">End Date</label>
                                            <input type="datetime-local" value={draft.temporaryEnd || ""} onChange={(e) => setDraft((p) => ({ ...p, temporaryEnd: e.target.value }))} className="w-full mt-1 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 sm:mt-6">
                                    <label className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Clicks limit</label>
                                    <input type="number" value={(draft as any).clicksLimit || ""} onChange={(e) => setDraft((p: any) => ({ ...p, clicksLimit: e.target.value }))} className="w-full mt-1.5 sm:mt-2 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Only allow the link to work for a certain amount of clicks.</div>
                                </div>
                                <div className="mt-4 sm:mt-6">
                                    <label className="text-xs sm:text-sm font-bold text-[var(--foreground)]">Expiration URL</label>
                                    <input type="text" value={(draft as any).expirationUrl || ""} onChange={(e) => setDraft((p: any) => ({ ...p, expirationUrl: e.target.value }))} className="w-full mt-1.5 sm:mt-2 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Visitors will be redirected to this URL after the main link expires.</div>
                                </div>
                            </div>
                        )}

                        {openSection === "utm" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold mb-3 sm:mb-4 text-center">UTM Parameters</div>
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Source</label>
                                        <input value={draft.utmSource} onChange={(e) => setDraft((prev) => ({ ...prev, utmSource: e.target.value }))} placeholder="e.g. newsletter, bing, google, youtube" className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Medium</label>
                                        <input value={draft.utmMedium} onChange={(e) => setDraft((prev) => ({ ...prev, utmMedium: e.target.value }))} placeholder="e.g. link, banner, email, social" className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Campaign</label>
                                        <input value={draft.utmCampaign} onChange={(e) => setDraft((prev) => ({ ...prev, utmCampaign: e.target.value }))} placeholder="e.g. spring_sale_2024, black_friday" className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-6 border-t border-[var(--border)] dark:border-[var(--border)] pt-3 sm:pt-4">
                                    <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-2"><Globe size={14} className="sm:size-4" /> UTM preview</label>
                                    <div className="text-xs sm:text-sm mt-1.5 sm:mt-2 break-all">{draft.destinationUrl}{draft.utmSource || draft.utmMedium || draft.utmCampaign ? `?utm_source=${draft.utmSource}&utm_medium=${draft.utmMedium}&utm_campaign=${draft.utmCampaign}` : "None"}</div>
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">This query parameter will be appended to your destination URL.</div>
                                </div>
                            </div>
                        )}

                        {openSection === "password" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold mb-3 sm:mb-4 text-center">Protection</div>
                                <div>
                                    <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] flex items-center gap-2 mb-1.5 sm:mb-2"><Shield size={14} className="sm:size-4" /> Password</label>
                                    <input value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" type="password" className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Require users to enter a password before accessing the link.</div>
                                </div>
                                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--border)] dark:border-[var(--border)]">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setDraft((prev) => ({ ...prev, sensitiveContentWarning: !prev.sensitiveContentWarning }))} className={toggleClass(draft.sensitiveContentWarning)}>
                                            <span className={thumbClass(draft.sensitiveContentWarning)} />
                                        </button>
                                        <span className="text-xs sm:text-sm font-bold">Sensitive content warning</span>
                                    </div>
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Require users to confirm that they want to access your link and letting them know that the link might be sensitive.</div>
                                </div>
                            </div>
                        )}

                        {openSection === "targeting" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold mb-3 sm:mb-4 text-center">Targeting</div>
                                <label className="block text-xs sm:text-sm font-bold">Targeting type</label>
                                <select
                                    value={draft.targetingType}
                                    onChange={(e) => setDraft(p => ({ ...p, targetingType: e.target.value }))}
                                    className="w-full mt-1.5 sm:mt-2 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm"
                                >
                                    <option value="none">😊 None</option>
                                    <option value="country_code">Country code</option>
                                    <option value="city_name">City</option>
                                    <option value="device_type">Device type</option>
                                    <option value="os_name">Operating system</option>
                                    <option value="browser_name">Browser</option>
                                    <option value="browser_language">Browser language</option>
                                    <option value="rotation">Rotation & A/B Testing</option>
                                </select>

                                {draft.targetingType !== "none" && (
                                    <div className="mt-3 sm:mt-4 border-t border-[var(--border)] dark:border-[var(--border)] pt-3 sm:pt-4">
                                        <label className="text-xs sm:text-sm font-semibold text-[var(--foreground)] mb-2 block">Targeting Rules</label>
                                        {draft.targeting?.map((rule, idx) => (
                                            <div key={idx} className="flex gap-1.5 sm:gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={rule.key}
                                                    onChange={(e) => {
                                                        const newT = [...(draft.targeting || [])];
                                                        newT[idx].key = e.target.value;
                                                        setDraft(p => ({ ...p, targeting: newT }));
                                                    }}
                                                    placeholder="Key"
                                                    className="w-full h-9 px-2.5 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    value={rule.value}
                                                    onChange={(e) => {
                                                        const newT = [...(draft.targeting || [])];
                                                        newT[idx].value = e.target.value;
                                                        setDraft(p => ({ ...p, targeting: newT }));
                                                    }}
                                                    placeholder="URL"
                                                    className="w-full h-9 px-2.5 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newT = [...(draft.targeting || [])];
                                                        newT.splice(idx, 1);
                                                        setDraft(p => ({ ...p, targeting: newT }));
                                                    }}
                                                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-xs shrink-0"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const newT = [...(draft.targeting || [])];
                                                newT.push({ key: "", value: "" });
                                                setDraft(p => ({ ...p, targeting: newT }));
                                            }}
                                            className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-primary font-medium hover:underline"
                                        >
                                            + Add targeting rule
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {openSection === "seo" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold">SEO</div>
                                <label className="flex items-center gap-3 mt-2 sm:mt-3">
                                    <input type="checkbox" />
                                    <span className="text-xs sm:text-sm">Block search engine indexing</span>
                                </label>
                                <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-2 sm:mt-3">Prevent this short link from being indexed by search engines.</div>
                            </div>
                        )}

                        {openSection === "cloaking" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold mb-3 sm:mb-4 text-center">Cloaking</div>
                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Title of the cloaked page</label>
                                        <input value={(draft as any).cloaking_title || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_title: e.target.value }))} className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Meta description of the cloaked page</label>
                                        <input value={(draft as any).cloaking_meta_description || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_meta_description: e.target.value }))} className="w-full h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Favicon of the cloaked page</label>
                                        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--muted)]/50 dark:bg-[var(--muted)] p-1.5 sm:p-2 rounded-lg">
                                            <input type="file" id="cloaking_favicon_mobile" className="hidden" accept=".jpg,.jpeg,.png,.ico,.svg,.gif,.webp"
                                                onChange={(e) => { const file = e.target.files?.[0]; if (file) setDraft((p: any) => ({ ...p, cloaking_favicon: file })); }} />
                                            <button onClick={() => document.getElementById('cloaking_favicon_mobile')?.click()}
                                                className="bg-[var(--card)] dark:bg-slate-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm border border-[var(--border)] dark:border-slate-600 shadow-sm shrink-0">
                                                Choose File
                                            </button>
                                            <span className="text-[11px] sm:text-sm text-[var(--muted-foreground)] truncate">
                                                {(draft as any).cloaking_favicon instanceof File ? (draft as any).cloaking_favicon.name : ((draft as any).cloaking_favicon ? "Uploaded" : "No file")}
                                            </span>
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-[var(--muted-foreground)]/70 mt-1">.jpg, .jpeg, .png, .ico, .svg, .gif, .webp allowed. 2 MB max.</div>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Opengraph of the cloaked page</label>
                                        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--muted)]/50 dark:bg-[var(--muted)] p-1.5 sm:p-2 rounded-lg">
                                            <input type="file" id="cloaking_opengraph_mobile" className="hidden" accept=".jpg,.jpeg,.png,.svg,.gif,.webp,.avif"
                                                onChange={(e) => { const file = e.target.files?.[0]; if (file) setDraft((p: any) => ({ ...p, cloaking_opengraph: file })); }} />
                                            <button onClick={() => document.getElementById('cloaking_opengraph_mobile')?.click()}
                                                className="bg-[var(--card)] dark:bg-slate-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm border border-[var(--border)] dark:border-slate-600 shadow-sm shrink-0">
                                                Choose File
                                            </button>
                                            <span className="text-[11px] sm:text-sm text-[var(--muted-foreground)] truncate">
                                                {(draft as any).cloaking_opengraph instanceof File ? (draft as any).cloaking_opengraph.name : ((draft as any).cloaking_opengraph ? "Uploaded" : "No file")}
                                            </span>
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-[var(--muted-foreground)]/70 mt-1">.jpg, .jpeg, .png, .svg, .gif, .webp, .avif allowed. 2 MB max.</div>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-bold text-[var(--foreground)] block mb-1.5 sm:mb-2">Custom JS</label>
                                        <textarea value={(draft as any).cloaking_custom_js || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_custom_js: e.target.value }))} placeholder="<script>console.log(`Hello world`);</script>" className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-20 sm:h-24 font-mono" />
                                        <div className="text-[10px] sm:text-xs text-[var(--muted-foreground)]/70 mt-1">Custom JS code to enhance the capability of your page.</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {openSection === "advanced" && (
                            <div className="bg-[var(--muted)]/50 dark:bg-[var(--muted)]/40 border border-[var(--border)] dark:border-[var(--border)]/50 p-4 sm:p-6 rounded-xl sm:rounded-2xl mb-4 sm:mb-6">
                                <div className="text-sm font-bold">Advanced</div>
                                <div className="mt-3 sm:mt-4">
                                    <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)]">HTTP Status Code</label>
                                    <select value={(draft as any).http_status_code || 301}
                                        onChange={(e) => setDraft((p: any) => ({ ...p, http_status_code: e.target.value }))}
                                        className="w-full mt-1.5 sm:mt-2 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm">
                                        <option value="301">301 (Permanent Redirect)</option>
                                        <option value="302">302 (Temporary Redirect)</option>
                                        <option value="307">307 (Temporary Redirect)</option>
                                        <option value="308">308 (Permanent Redirect)</option>
                                    </select>
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Select the HTTP status code for this link.</div>
                                </div>
                                <div className="mt-4 sm:mt-6">
                                    <label className="block text-xs sm:text-sm font-bold text-[var(--foreground)]">Splash page</label>
                                    <select value={(draft as any).splash_page_id || ""}
                                        onChange={(e) => setDraft((p: any) => ({ ...p, splash_page_id: e.target.value }))}
                                        className="w-full mt-1.5 sm:mt-2 h-9 sm:h-10 px-3 rounded-lg border border-[var(--border)] dark:border-[var(--border)] bg-transparent text-xs sm:text-sm">
                                        <option value="">None</option>
                                    </select>
                                    <div className="text-[11px] sm:text-xs text-[var(--muted-foreground)] mt-1">Redirect visitors to a splash page before the final destination.</div>
                                </div>
                                <label className="flex items-center gap-3 mt-4 sm:mt-6">
                                    <input type="checkbox" />
                                    <span className="text-xs sm:text-sm">Forward query parameters</span>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end sticky bottom-4 sm:static">
                    <button onClick={onSave} disabled={!isValidUrl(draft.destinationUrl)} className={cn("w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3 rounded-xl sm:rounded-2xl text-sm font-bold transition-all shadow-lg", saveState === "saved" ? "bg-emerald-500 text-white" : "bg-primary text-white hover:bg-primary/90", !isValidUrl(draft.destinationUrl) && "opacity-60 cursor-not-allowed")}>
                        {saveState === "saved" ? "Saved" : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
