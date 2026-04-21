"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    ArrowLeft,
    CalendarClock,
    Globe,
    Info,
    Link2,
    PencilLine,
    Settings2,
    Check,
    Shield,
    Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEEDED, LinkDraft } from "./data";

type Props = { slug: string };

const SECTION_META: Array<{ key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { key: "app", label: "App linking", icon: Link2 },
    { key: "pixels", label: "Pixels", icon: Target },
    { key: "temporary", label: "Temporary URL", icon: CalendarClock },
    { key: "utm", label: "UTM Parameters", icon: Globe },
    { key: "password", label: "Password", icon: Shield },
    { key: "seo", label: "SEO", icon: Info },
    { key: "cloaking", label: "Cloaking", icon: Settings2 },
    { key: "advanced", label: "Advanced", icon: PencilLine },
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
        } as LinkDraft;
    }, [slug]);

    const [draft, setDraft] = useState<LinkDraft>(initial);
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

    const onSave = () => {
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
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
                                            } catch {}
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
                                                } catch {}
                                            }}
                                            onError={(e) => {
                                                try {
                                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                                } catch {}
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
                                    {openSection === "cloaking" && (
                                        <button onClick={() => setDraft((p) => ({ ...p, cloakingEnabled: !p.cloakingEnabled }))} className={toggleClass(draft.cloakingEnabled)} title="Toggle">
                                            <span className={thumbClass(draft.cloakingEnabled)} />
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
                                                "AliExpress","Reddit","YouTube","WhatsApp","Facebook Messenger","Telegram","Apple Music","Pinterest","Netflix","Google Docs","Google Maps","TripAdvisor","StockX",
                                                "TikTok","X","Instagram","Snapchat","Spotify","LinkedIn","Twitch","Google Sheets","Google Slides","Airbnb","Amazon","Booking.com",
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
                                    <div className="flex items-center justify-between">
                                        <div className="form-label">Pixels</div>
                                        <button className="text-sm text-primary">+ Create pixel</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <label className="flex items-center gap-3">
                                            <input type="checkbox" checked={draft.pixelsEnabled} onChange={() => setDraft((p) => ({ ...p, pixelsEnabled: !p.pixelsEnabled }))} />
                                            <span>Facebook Pixel</span>
                                        </label>
                                        <label className="flex items-center gap-3">
                                            <input type="checkbox" />
                                            <span>Google Analytics</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {openSection === "temporary" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">Schedule & Expiration</div>
                                    <div className="mt-3">
                                        <label className="text-xs text-slate-500">Click limit</label>
                                        <input type="number" value={(draft as any).clicksLimit || ""} onChange={(e) => setDraft((p:any) => ({ ...p, clicksLimit: e.target.value }))} className="input-field mt-2" placeholder="Only allow the link to work for a number of clicks" />
                                    </div>
                                    <div className="mt-3">
                                        <label className="text-xs text-slate-500">Expiration URL</label>
                                        <input type="text" value={(draft as any).expirationUrl || ""} onChange={(e) => setDraft((p:any) => ({ ...p, expirationUrl: e.target.value }))} className="input-field mt-2" placeholder="Where to redirect after expiry" />
                                    </div>
                                </div>
                            )}

                            {openSection === "utm" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">UTM Parameters</div>
                                    <div className="grid sm:grid-cols-3 gap-3 mt-3">
                                        <input value={draft.utmSource} onChange={(e) => setDraft((prev) => ({ ...prev, utmSource: e.target.value }))} placeholder="e.g. newsletter, google" className="input-field" />
                                        <input value={draft.utmMedium} onChange={(e) => setDraft((prev) => ({ ...prev, utmMedium: e.target.value }))} placeholder="e.g. link, banner" className="input-field" />
                                        <input value={draft.utmCampaign} onChange={(e) => setDraft((prev) => ({ ...prev, utmCampaign: e.target.value }))} placeholder="e.g. spring_sale" className="input-field" />
                                    </div>
                                    <div className="text-xs text-slate-500 mt-3">UTM preview: {draft.destinationUrl}{draft.utmSource || draft.utmMedium || draft.utmCampaign ? `?utm_source=${draft.utmSource}&utm_medium=${draft.utmMedium}&utm_campaign=${draft.utmCampaign}` : "None"}</div>
                                </div>
                            )}

                            {openSection === "password" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">Protection</div>
                                    <input value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Optional password" className="input-field mt-3" />
                                    <div className="flex items-center gap-3 mt-3">
                                        <button onClick={() => setDraft((prev) => ({ ...prev, sensitiveContentWarning: !prev.sensitiveContentWarning }))} className={toggleClass(draft.sensitiveContentWarning)}>
                                            <span className={thumbClass(draft.sensitiveContentWarning)} />
                                        </button>
                                        <div className="text-sm text-slate-500">Require users to confirm they want to access sensitive content.</div>
                                    </div>
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
                                    <div className="form-label">Cloaking</div>
                                    <label className="flex items-center gap-3 mt-3">
                                        <input type="checkbox" checked={draft.cloakingEnabled} onChange={() => setDraft((p) => ({ ...p, cloakingEnabled: !p.cloakingEnabled }))} />
                                        <span>URL Cloaking</span>
                                    </label>

                                    <input value={(draft as any).cloakedTitle || ""} onChange={(e) => setDraft((p:any) => ({ ...p, cloakedTitle: e.target.value }))} placeholder="Title of the cloaked page" className="input-field mt-3" />
                                    <input value={(draft as any).cloakedMeta || ""} onChange={(e) => setDraft((p:any) => ({ ...p, cloakedMeta: e.target.value }))} placeholder="Meta description" className="input-field mt-3" />

                                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                                        <label className="block">
                                            <div className="text-xs text-slate-500 mb-1">Favicon of the cloaked page</div>
                                            <input type="file" />
                                        </label>
                                        <label className="block">
                                            <div className="text-xs text-slate-500 mb-1">Opengraph image</div>
                                            <input type="file" />
                                        </label>
                                    </div>

                                    <textarea value={(draft as any).customJs || ""} onChange={(e) => setDraft((p:any) => ({ ...p, customJs: e.target.value }))} placeholder="<script>...</script>" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm mt-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-32 font-mono" />
                                </div>
                            )}

                            {openSection === "advanced" && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 p-6 rounded-2xl mb-6">
                                    <div className="form-label">Advanced</div>
                                    <label className="block mt-3">Project</label>
                                    <select className="input-field mt-2">
                                        <option>None</option>
                                    </select>

                                    <label className="block mt-3">Splash page</label>
                                    <select className="input-field mt-2">
                                        <option>None</option>
                                    </select>

                                    <label className="flex items-center gap-3 mt-3">
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
