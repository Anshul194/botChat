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
    // { key: "utm", label: "UTM Parameters", icon: Globe },
    { key: "password", label: "Protection", icon: Shield },
    // { key: "targeting", label: "Targeting", icon: Target },
    // { key: "seo", label: "SEO", icon: Info },
    // { key: "cloaking", label: "Cloaking", icon: Settings2 },
    // { key: "advanced", label: "Advanced", icon: PencilLine },
];

const toggleClass = (on: boolean) => cn("w-9 h-5 rounded-full transition-colors relative", on ? "bg-primary" : "bg-slate-300 dark:bg-slate-700");
const thumbClass = (on: boolean) => cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", on ? "left-[18px]" : "left-[2px]");

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

    // If navigating directly with a slug, try to find the ID and fetch the link
    useEffect(() => {
        if (!currentLink || (currentLink.url !== slug && currentLink.slug !== slug)) {
            const linkInList = links.find((l: any) => (l.url === slug || l.slug === slug));

            if (linkInList) {
                const id = linkInList.link_id || linkInList.id;
                dispatch(fetchLinkById(id));
                localStorage.setItem(`link_id_${slug}`, id.toString());
            } else {
                // Try fallback from localStorage
                const savedId = localStorage.getItem(`link_id_${slug}`);
                if (savedId) {
                    dispatch(fetchLinkById(savedId));
                } else if (links.length === 0 && !isLoading) {
                    // Fetch links if list is empty to find the ID
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

        // Pixels
        payload.pixels_ids = (draft as any).selectedPixels || [];

        // If we have files, we must use FormData
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
        <div className="min-h-screen w-full px-6 py-8 bg-slate-50 dark:bg-[#020617]">
            <div className="w-full max-w-7xl mx-auto">
                <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/50 p-6 mb-6 border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-primary grid place-items-center text-white font-black text-lg">FL</div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Links <span className="text-slate-300">›</span> <span className="font-semibold">{draft.slug}</span></p>
                                    <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{draft.slug}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setDraft((prev) => ({ ...prev, active: !prev.active }))} className={toggleClass(draft.active)} title="Toggle active">
                                        <span className={thumbClass(draft.active)} />
                                    </button>
                                    <Link href="/dashboard/shortened-links" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold">
                                        <ArrowLeft size={14} /> Back
                                    </Link>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Customize delivery rules and integrations for this short link.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Destination URL</label>
                        <input value={draft.destinationUrl} onChange={(e) => setDraft((prev) => ({ ...prev, destinationUrl: e.target.value }))} className="w-full mt-2 h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm" aria-invalid={!isValidUrl(draft.destinationUrl)} />

                        <div className="mt-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Short URL</label>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 px-4 py-3 border border-slate-100 dark:border-slate-800/50 font-mono text-sm truncate text-slate-600 dark:text-slate-300">{shortUrl}</div>
                                <button
                                    onClick={() => {
                                        try {
                                            navigator?.clipboard?.writeText(shortUrl);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1400);
                                        } catch { }
                                    }}
                                    aria-label="Copy short url"
                                    className={cn("btn-primary flex items-center gap-2", copied ? "ring-2 ring-offset-2 ring-emerald-300" : "")}
                                >
                                    {copied ? <><Check size={14} /> Copied</> : "Copy"}
                                </button>
                            </div>
                            {!isValidUrl(draft.destinationUrl) && (
                                <div className="text-xs text-red-600 mt-2">Please enter a valid URL (e.g. example.com or https://example.com)</div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                        <nav className="space-y-1.5 p-2 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl h-fit">
                            {SECTION_META.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setOpenSection(key)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                        openSection === key
                                            ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg grid place-items-center overflow-hidden transition-colors",
                                        openSection === key ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
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
                                        <div className={cn("text-sm font-bold", openSection === key ? "text-white" : "text-slate-800 dark:text-slate-200")}>{label}</div>
                                        <div className={cn("text-[10px] uppercase tracking-wider font-bold", openSection === key ? "text-white/60" : "text-slate-400")}>{key === openSection ? "Active" : ""}</div>
                                    </div>
                                </button>
                            ))}
                        </nav>

                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl shadow-sm">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-lg font-extrabold">{currentMeta?.label}</div>
                                    <div className="small-note mt-1">Configure {currentMeta?.label.toLowerCase()} behavior and options for this short link.</div>
                                </div>
                                <div>
                                    {/* Toggle for sections that support it */}
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

                            {/* Tab content area */}
                            {openSection === "app" && (
                                <>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                        <div className="form-label text-slate-900 dark:text-slate-100">Supported operating systems</div>
                                        <div className="mt-3 flex gap-3">
                                            <span className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-sm font-bold shadow-sm">Apple</span>
                                            <span className="px-4 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-sm font-bold shadow-sm">Android</span>
                                        </div>
                                        <div className="form-label mt-4">Supported apps</div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-slate-600 mt-2">
                                            {[
                                                "AliExpress", "Reddit", "YouTube", "WhatsApp", "Facebook Messenger", "Telegram", "Apple Music", "Pinterest", "Netflix", "Google Docs", "Google Maps", "TripAdvisor", "StockX",
                                                "TikTok", "X", "Instagram", "Snapchat", "Spotify", "LinkedIn", "Twitch", "Google Sheets", "Google Slides", "Airbnb", "Amazon", "Booking.com",
                                            ].map((a) => (
                                                <div key={a} className="flex items-center gap-3 text-sm">
                                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 grid place-items-center text-xs font-bold border border-slate-100 dark:border-slate-800 shadow-sm">{a[0]}</div>
                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">{a}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 text-sm font-medium">Your destination URL is not matching any of the supported apps for automatic app opening.</div>
                                </>
                            )}
                            {openSection === "pixels" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="form-label">Google Analytics Integrations</div>
                                    </div>
                                    {pixels.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">No integrations found. Create one in the Google Analytics section.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pixels.map((pixel: any) => {
                                                const pid = pixel.id || pixel.pixel_id;
                                                const selected = (draft as any).selectedPixels || [];
                                                const isSelected = selected.includes(pid);
                                                return (
                                                    <div key={pid} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{pixel.name}</div>
                                                            <div className="text-[11px] text-slate-500">{pixel.type} — {pixel.pixel_id_value}</div>
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
                                                            className="w-4 h-4 rounded accent-primary"
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {openSection === "temporary" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setDraft((p) => ({ ...p, temporaryEnabled: !p.temporaryEnabled }))} className={toggleClass(draft.temporaryEnabled)}>
                                            <span className={thumbClass(draft.temporaryEnabled)} />
                                        </button>
                                        <div>
                                            <div className="font-bold text-sm">Schedule</div>
                                            <div className="text-xs text-slate-500">Configure the dates on which it will work.</div>
                                        </div>
                                    </div>

                                    {draft.temporaryEnabled && (
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600">Start Date</label>
                                                <input type="datetime-local" value={draft.temporaryStart || ""} onChange={(e) => setDraft((p) => ({ ...p, temporaryStart: e.target.value }))} className="input-field mt-1" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-slate-600">End Date</label>
                                                <input type="datetime-local" value={draft.temporaryEnd || ""} onChange={(e) => setDraft((p) => ({ ...p, temporaryEnd: e.target.value }))} className="input-field mt-1" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-6">
                                        <label className="text-sm font-bold text-slate-700">Clicks limit</label>
                                        <input type="number" value={(draft as any).clicksLimit || ""} onChange={(e) => setDraft((p: any) => ({ ...p, clicksLimit: e.target.value }))} className="input-field mt-2" />
                                        <div className="text-xs text-slate-500 mt-1">Only allow the link to work for a certain amount of clicks.</div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="text-sm font-bold text-slate-700">Expiration URL</label>
                                        <input type="text" value={(draft as any).expirationUrl || ""} onChange={(e) => setDraft((p: any) => ({ ...p, expirationUrl: e.target.value }))} className="input-field mt-2" />
                                        <div className="text-xs text-slate-500 mt-1">Visitors will be redirected to this URL after the main link expires.</div>
                                    </div>
                                </div>
                            )}

                            {openSection === "utm" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label mb-4 text-center">UTM Parameters</div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Source</label>
                                            <input value={draft.utmSource} onChange={(e) => setDraft((prev) => ({ ...prev, utmSource: e.target.value }))} placeholder="e.g. newsletter, bing, google, youtube" className="input-field" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Medium</label>
                                            <input value={draft.utmMedium} onChange={(e) => setDraft((prev) => ({ ...prev, utmMedium: e.target.value }))} placeholder="e.g. link, banner, email, social" className="input-field" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Campaign</label>
                                            <input value={draft.utmCampaign} onChange={(e) => setDraft((prev) => ({ ...prev, utmCampaign: e.target.value }))} placeholder="e.g. spring_sale_2024, black_friday" className="input-field" />
                                        </div>
                                    </div>
                                    <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Globe size={16} /> UTM preview</label>
                                        <div className="text-sm mt-2">{draft.destinationUrl}{draft.utmSource || draft.utmMedium || draft.utmCampaign ? `?utm_source=${draft.utmSource}&utm_medium=${draft.utmMedium}&utm_campaign=${draft.utmCampaign}` : "None"}</div>
                                        <div className="text-xs text-slate-500 mt-1">This query parameter will be appended to your destination URL.</div>
                                    </div>
                                </div>
                            )}

                            {openSection === "password" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label mb-4 text-center">Protection</div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2"><Shield size={16} /> Password</label>
                                        <input value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" type="password" className="input-field" />
                                        <div className="text-xs text-slate-500 mt-1">Require users to enter a password before accessing the link.</div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setDraft((prev) => ({ ...prev, sensitiveContentWarning: !prev.sensitiveContentWarning }))} className={toggleClass(draft.sensitiveContentWarning)}>
                                                <span className={thumbClass(draft.sensitiveContentWarning)} />
                                            </button>
                                            <span className="font-bold text-sm">Sensitive content warning</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Require users to confirm that they want to access your link and letting them know that the link might be sensitive.</div>
                                    </div>
                                </div>
                            )}

                            {openSection === "targeting" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label mb-4 text-center">Targeting</div>
                                    <label className="block mt-3 font-bold text-sm">Targeting type</label>
                                    <select
                                        value={draft.targetingType}
                                        onChange={(e) => setDraft(p => ({ ...p, targetingType: e.target.value }))}
                                        className="input-field mt-2"
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
                                        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                                            <label className="text-sm font-semibold text-slate-700 mb-2 block">Targeting Rules</label>
                                            {draft.targeting?.map((rule, idx) => (
                                                <div key={idx} className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={rule.key}
                                                        onChange={(e) => {
                                                            const newT = [...(draft.targeting || [])];
                                                            newT[idx].key = e.target.value;
                                                            setDraft(p => ({ ...p, targeting: newT }));
                                                        }}
                                                        placeholder="Key (e.g. IN)"
                                                        className="input-field"
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
                                                        className="input-field"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newT = [...(draft.targeting || [])];
                                                            newT.splice(idx, 1);
                                                            setDraft(p => ({ ...p, targeting: newT }));
                                                        }}
                                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
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
                                                className="mt-2 text-sm text-primary font-medium hover:underline"
                                            >
                                                + Add targeting rule
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {openSection === "seo" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">SEO</div>
                                    <label className="flex items-center gap-3 mt-3">
                                        <input type="checkbox" />
                                        <span>Block search engine indexing</span>
                                    </label>
                                    <div className="text-sm text-slate-500 mt-3">Prevent this short link from being indexed by search engines.</div>
                                </div>
                            )}

                            {openSection === "cloaking" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label mb-4 text-center">Cloaking</div>



                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Title of the cloaked page</label>
                                            <input value={(draft as any).cloaking_title || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_title: e.target.value }))} className="input-field" />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Meta description of the cloaked page</label>
                                            <input value={(draft as any).cloaking_meta_description || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_meta_description: e.target.value }))} className="input-field" />
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Favicon of the cloaked page</label>
                                            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                                <input
                                                    type="file"
                                                    id="cloaking_favicon"
                                                    className="hidden"
                                                    accept=".jpg,.jpeg,.png,.ico,.svg,.gif,.webp"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setDraft((p: any) => ({ ...p, cloaking_favicon: file }));
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('cloaking_favicon')?.click()}
                                                    className="bg-white dark:bg-slate-700 px-4 py-1.5 rounded-md text-sm border border-slate-200 dark:border-slate-600 shadow-sm"
                                                >
                                                    Choose File
                                                </button>
                                                <span className="text-sm text-slate-500 truncate max-w-[200px]">
                                                    {(draft as any).cloaking_favicon instanceof File ? (draft as any).cloaking_favicon.name : ((draft as any).cloaking_favicon ? "File uploaded" : "No file chosen")}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">.jpg, .jpeg, .png, .ico, .svg, .gif, .webp allowed. 2 MB maximum.</div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Opengraph of the cloaked page</label>
                                            <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                                <input
                                                    type="file"
                                                    id="cloaking_opengraph"
                                                    className="hidden"
                                                    accept=".jpg,.jpeg,.png,.svg,.gif,.webp,.avif"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setDraft((p: any) => ({ ...p, cloaking_opengraph: file }));
                                                    }}
                                                />
                                                <button
                                                    onClick={() => document.getElementById('cloaking_opengraph')?.click()}
                                                    className="bg-white dark:bg-slate-700 px-4 py-1.5 rounded-md text-sm border border-slate-200 dark:border-slate-600 shadow-sm"
                                                >
                                                    Choose File
                                                </button>
                                                <span className="text-sm text-slate-500 truncate max-w-[200px]">
                                                    {(draft as any).cloaking_opengraph instanceof File ? (draft as any).cloaking_opengraph.name : ((draft as any).cloaking_opengraph ? "File uploaded" : "No file chosen")}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">.jpg, .jpeg, .png, .svg, .gif, .webp, .avif allowed. 2 MB maximum.</div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-slate-700 block mb-2">Custom JS</label>
                                            <textarea value={(draft as any).cloaking_custom_js || ""} onChange={(e) => setDraft((p: any) => ({ ...p, cloaking_custom_js: e.target.value }))} placeholder="<script>console.log(`Hello world`);</script>" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-24 font-mono" />
                                            <div className="text-xs text-slate-400 mt-1">Your custom JS code to enhance the capability of your page.</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {openSection === "advanced" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">Advanced</div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-bold text-slate-700">HTTP Status Code</label>
                                        <select
                                            value={(draft as any).http_status_code || 301}
                                            onChange={(e) => setDraft((p: any) => ({ ...p, http_status_code: e.target.value }))}
                                            className="input-field mt-2"
                                        >
                                            <option value="301">301 (Permanent Redirect)</option>
                                            <option value="302">302 (Temporary Redirect)</option>
                                            <option value="307">307 (Temporary Redirect)</option>
                                            <option value="308">308 (Permanent Redirect)</option>
                                        </select>
                                        <div className="text-xs text-slate-500 mt-1">Select the HTTP status code for this link.</div>
                                    </div>



                                    <div className="mt-6">
                                        <label className="block text-sm font-bold text-slate-700">Splash page</label>
                                        <select
                                            value={(draft as any).splash_page_id || ""}
                                            onChange={(e) => setDraft((p: any) => ({ ...p, splash_page_id: e.target.value }))}
                                            className="input-field mt-2"
                                        >
                                            <option value="">None</option>
                                        </select>
                                        <div className="text-xs text-slate-500 mt-1">Redirect visitors to a splash page before the final destination.</div>
                                    </div>

                                    <label className="flex items-center gap-3 mt-6">
                                        <input type="checkbox" />
                                        <span>Forward query parameters</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button onClick={onSave} disabled={!isValidUrl(draft.destinationUrl)} className={cn("btn-primary px-6 py-3 rounded-2xl", !isValidUrl(draft.destinationUrl) && "opacity-60 cursor-not-allowed")}>
                            {saveState === "saved" ? "Saved" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
