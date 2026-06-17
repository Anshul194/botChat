"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchVcardById, updateVcard } from "@/store/slices/vcardsSlice";
import { fetchPixels } from "@/store/slices/pixelsSlice";
import { 
    Shield, ActivitySquare, Check, ArrowLeft, 
    CalendarClock, Globe, Link2, PencilLine, 
    Settings2, User, Building2, Phone, Share2, 
    MapPin, Upload, Zap, MousePointer2, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/providers/ModalProvider";

type Props = { slug: string }; // 'slug' is actually the ID in the URL now

const SECTION_META: Array<{ key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = [
    { key: "vcard", label: "Vcard Details", icon: User },
    { key: "socials", label: "Social Links", icon: Share2 },
    { key: "pixels", label: "Google Analytics", icon: ActivitySquare },
    { key: "temporary", label: "Temporary URL", icon: CalendarClock },
    { key: "protection", label: "Protection", icon: Shield },
    { key: "advanced", label: "Advanced", icon: Settings2 },
];

const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
    <div className="w-full h-12 bg-[#F1F5F9] dark:bg-slate-800 rounded-xl flex items-center justify-center gap-2 mb-8">
        <Icon size={16} className="text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</span>
    </div>
);

const InputBlock = ({ label, icon: Icon, value, onChange, placeholder, type = "text", description }: any) => (
    <div className="space-y-2 mb-6">
        <label className="flex items-center gap-2 text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        <input 
            type={type}
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-primary/20 transition-all text-sm" 
        />
        {description && <p className="text-[10px] text-slate-400 ml-1 leading-relaxed">{description}</p>}
    </div>
);

export default function VcardEditorClient({ slug: id }: Props) {
    const dispatch = useAppDispatch();
    const { currentVcard, isLoading } = useAppSelector((state) => state.vcards);
    const { pixels } = useAppSelector((state) => state.pixels);
    const { showModal } = useModal();

    const [draft, setDraft] = useState<any>({
        url: "",
        vcard_first_name: "",
        vcard_last_name: "",
        vcard_email: "",
        vcard_url: "",
        vcard_company: "",
        vcard_job_title: "",
        vcard_birthday: "",
        vcard_street: "",
        vcard_city: "",
        vcard_zip: "",
        vcard_region: "",
        vcard_country: "",
        vcard_note: "",
        vcard_phone_numbers: [],
        vcard_socials: [],
        vcard_avatar: null,
        active: true,
        pixelsEnabled: false,
        selectedPixels: [] as number[],
        temporaryEnabled: false,
        temporaryStart: "",
        temporaryEnd: "",
        expirationUrl: "",
        clicksLimit: "",
        password: "",
        sensitiveContentWarning: false,
        splash_page_id: "",
    });

    const [openSection, setOpenSection] = useState<string>("vcard");
    const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
    const currentMeta = SECTION_META.find((s) => s.key === openSection);

    const vcardSlug = currentVcard?.url || draft.url || "";
    const shortUrl = `botchat.io/${vcardSlug}`;
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!currentVcard || (currentVcard.id !== id && currentVcard.link_id !== id)) {
            dispatch(fetchVcardById(id));
        }
    }, [id, currentVcard, dispatch]);

    useEffect(() => { dispatch(fetchPixels()); }, [dispatch]);

    useEffect(() => {
        if (currentVcard) {
            setDraft((prev: any) => ({
                ...prev,
                url: currentVcard.url || "",
                vcard_first_name: currentVcard.vcard?.first_name || "",
                vcard_last_name: currentVcard.vcard?.last_name || "",
                vcard_email: currentVcard.vcard?.email || "",
                vcard_url: currentVcard.vcard?.url || "",
                vcard_company: currentVcard.vcard?.company || "",
                vcard_job_title: currentVcard.vcard?.job_title || "",
                vcard_birthday: currentVcard.vcard?.birthday || "",
                vcard_street: currentVcard.vcard?.street || "",
                vcard_city: currentVcard.vcard?.city || "",
                vcard_zip: currentVcard.vcard?.zip || "",
                vcard_region: currentVcard.vcard?.region || "",
                vcard_country: currentVcard.vcard?.country || "",
                vcard_note: currentVcard.vcard?.note || "",
                vcard_phone_numbers: currentVcard.vcard?.phone_numbers || [],
                vcard_socials: currentVcard.vcard?.socials || [],
                vcard_avatar: currentVcard.vcard?.avatar || null,
                active: currentVcard.is_enabled !== false,
                pixelsEnabled: !!currentVcard.pixels_is_enabled,
                temporaryEnabled: !!currentVcard.schedule,
                temporaryStart: currentVcard.start_date ? currentVcard.start_date.replace(" ", "T").substring(0, 16) : "",
                temporaryEnd: currentVcard.end_date ? currentVcard.end_date.replace(" ", "T").substring(0, 16) : "",
                expirationUrl: currentVcard.expiration_url || "",
                clicksLimit: currentVcard.clicks_limit || "",
                password: currentVcard.password || "",
                sensitiveContentWarning: !!currentVcard.sensitive_content,
                splash_page_id: currentVcard.splash_page_id || "",
            }));
        }
    }, [currentVcard]);

    const onSave = async () => {
        if (!currentVcard) return;
        setSaveState("saving");
        const payload = new FormData();
        payload.append("url", draft.url);
        payload.append("vcard_first_name", draft.vcard_first_name);
        payload.append("vcard_last_name", draft.vcard_last_name);
        payload.append("vcard_email", draft.vcard_email);
        payload.append("vcard_url", draft.vcard_url);
        payload.append("vcard_company", draft.vcard_company);
        payload.append("vcard_job_title", draft.vcard_job_title);
        payload.append("vcard_birthday", draft.vcard_birthday);
        payload.append("vcard_street", draft.vcard_street);
        payload.append("vcard_city", draft.vcard_city);
        payload.append("vcard_zip", draft.vcard_zip);
        payload.append("vcard_region", draft.vcard_region);
        payload.append("vcard_country", draft.vcard_country);
        payload.append("vcard_note", draft.vcard_note);
        
        draft.vcard_phone_numbers.forEach((p: any) => {
            payload.append("vcard_phone_number_label[]", p.label);
            payload.append("vcard_phone_number_value[]", p.value);
        });

        draft.vcard_socials.forEach((s: any) => {
            payload.append("vcard_social_label[]", s.label);
            payload.append("vcard_social_value[]", s.value);
        });

        if (draft.vcard_avatar instanceof File) {
            payload.append("vcard_avatar", draft.vcard_avatar);
        } else if (draft.vcard_avatar === null && currentVcard.vcard?.avatar) {
            payload.append("vcard_avatar_remove", "true");
        }

        payload.append("schedule", draft.temporaryEnabled ? "true" : "false");
        payload.append("sensitive_content", draft.sensitiveContentWarning ? "true" : "false");
        
        if (draft.temporaryEnabled) {
            if (draft.temporaryStart) payload.append("start_date", draft.temporaryStart.replace("T", " "));
            if (draft.temporaryEnd) payload.append("end_date", draft.temporaryEnd.replace("T", " "));
            if (draft.expirationUrl) payload.append("expiration_url", draft.expirationUrl);
            if (draft.clicksLimit) payload.append("clicks_limit", draft.clicksLimit);
        }
        
        if (draft.password) payload.append("password", draft.password);
        if (draft.splash_page_id) payload.append("splash_page_id", draft.splash_page_id);

        const result = await dispatch(updateVcard({ 
            id: currentVcard.link_id || currentVcard.id, 
            data: payload 
        }));
        
        if (updateVcard.fulfilled.match(result)) {
            setSaveState("saved");
            showModal("success", "Updated", "Vcard saved successfully!");
            setTimeout(() => setSaveState("idle"), 2000);
        } else {
            setSaveState("idle");
            showModal("error", "Error", "Failed to save vcard");
        }
    };

    return (
        <div className="min-h-screen w-full px-6 py-8 bg-slate-50 dark:bg-[#020617]">
            <div className="w-full max-w-7xl mx-auto">
                <div className="w-full rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/50 p-6 mb-6 border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-lg bg-primary grid place-items-center text-white font-black text-lg shadow-lg shadow-primary/20">VC</div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vcard Manager <span className="text-slate-300">›</span> <span className="text-primary">{vcardSlug}</span></p>
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{vcardSlug}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setDraft((prev: any) => ({ ...prev, active: !prev.active }))} className={cn("w-9 h-5 rounded-full relative transition-colors", draft.active ? "bg-primary" : "bg-slate-300")}>
                                        <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", draft.active ? "left-[18px]" : "left-[2px]")} />
                                    </button>
                                    <Link href="/dashboard/vcard-links" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold">
                                        <ArrowLeft size={14} /> Back
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Your Digital Vcard URL</label>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-1 pl-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <Globe size={14} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-400">botchat.io/</span>
                            <input value={vcardSlug} onChange={(e) => setDraft({...draft, url: e.target.value})} className="bg-transparent text-sm font-bold text-slate-900 dark:text-white flex-1 outline-none" />
                            <button
                                onClick={() => {
                                    navigator?.clipboard?.writeText(shortUrl);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className={cn("px-6 py-2 rounded-lg font-bold text-xs transition-all", copied ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm hover:bg-slate-50")}
                            >
                                {copied ? "Copied!" : "Copy URL"}
                            </button>
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
                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-lg grid place-items-center transition-colors",
                                        openSection === key ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
                                    )}>
                                        <Icon size={16} />
                                    </div>
                                    <div className={cn("text-sm font-bold", openSection === key ? "text-white" : "text-slate-700 dark:text-slate-200")}>{label}</div>
                                </button>
                            ))}
                        </nav>

                        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-800/50 backdrop-blur-xl shadow-sm min-h-[600px]">
                            {openSection === "vcard" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Basic Information" icon={User} />
                                    
                                    <div className="flex items-center gap-6 pb-8 mb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="relative group">
                                            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                                                {draft.vcard_avatar ? (
                                                    <img src={typeof draft.vcard_avatar === 'string' ? draft.vcard_avatar : URL.createObjectURL(draft.vcard_avatar)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-all">
                                                <Upload size={12} />
                                                <input type="file" className="hidden" onChange={(e) => setDraft({...draft, vcard_avatar: e.target.files?.[0]})} />
                                            </label>
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900 dark:text-white">Profile Avatar</div>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Recommended size 400x400</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <InputBlock label="First name" value={draft.vcard_first_name} onChange={(v: string) => setDraft({...draft, vcard_first_name: v})} />
                                        <InputBlock label="Last name" value={draft.vcard_last_name} onChange={(v: string) => setDraft({...draft, vcard_last_name: v})} />
                                    </div>

                                    <InputBlock label="Email" icon={User} value={draft.vcard_email} onChange={(v: string) => setDraft({...draft, vcard_email: v})} />
                                    <InputBlock label="Website URL" icon={Globe} value={draft.vcard_url} onChange={(v: string) => setDraft({...draft, vcard_url: v})} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <InputBlock label="Company" icon={Building2} value={draft.vcard_company} onChange={(v: string) => setDraft({...draft, vcard_company: v})} />
                                        <InputBlock label="Job title" icon={PencilLine} value={draft.vcard_job_title} onChange={(v: string) => setDraft({...draft, vcard_job_title: v})} />
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Birthday</label>
                                        <input type="date" value={draft.vcard_birthday} onChange={(e) => setDraft({...draft, vcard_birthday: e.target.value})} className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-sm outline-none" />
                                    </div>

                                    <InputBlock label="Street address" icon={MapPin} value={draft.vcard_street} onChange={(v: string) => setDraft({...draft, vcard_street: v})} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <InputBlock label="City" value={draft.vcard_city} onChange={(v: string) => setDraft({...draft, vcard_city: v})} />
                                        <InputBlock label="ZIP" value={draft.vcard_zip} onChange={(v: string) => setDraft({...draft, vcard_zip: v})} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                        <InputBlock label="Region" value={draft.vcard_region} onChange={(v: string) => setDraft({...draft, vcard_region: v})} />
                                        <InputBlock label="Country" value={draft.vcard_country} onChange={(v: string) => setDraft({...draft, vcard_country: v})} />
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Note</label>
                                        <textarea value={draft.vcard_note} onChange={(e) => setDraft({...draft, vcard_note: e.target.value})} className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 text-sm outline-none resize-none" />
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Phone Numbers</label>
                                            <button onClick={() => setDraft({...draft, vcard_phone_numbers: [...draft.vcard_phone_numbers, {label: "", value: ""}]})} className="text-xs text-primary font-bold hover:underline">+ Add Phone</button>
                                        </div>
                                        <div className="space-y-6">
                                            {draft.vcard_phone_numbers.map((phone: any, idx: number) => (
                                                <div key={idx} className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 relative">
                                                    <InputBlock label="Label" value={phone.label} onChange={(v: string) => {
                                                        const next = [...draft.vcard_phone_numbers];
                                                        next[idx].label = v;
                                                        setDraft({...draft, vcard_phone_numbers: next});
                                                    }} description="Leave empty to use the default phone generated label. Custom labels do not work on Android devices." />
                                                    <InputBlock label="Phone number" value={phone.value} onChange={(v: string) => {
                                                        const next = [...draft.vcard_phone_numbers];
                                                        next[idx].value = v;
                                                        setDraft({...draft, vcard_phone_numbers: next});
                                                    }} />
                                                    <button onClick={() => setDraft({...draft, vcard_phone_numbers: draft.vcard_phone_numbers.filter((_: any, i: number) => i !== idx)})} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {openSection === "socials" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Social Links" icon={Share2} />
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs text-slate-500">Manage your social media presence on your vCard.</p>
                                        <button onClick={() => setDraft({...draft, vcard_socials: [...draft.vcard_socials, {label: "Instagram", value: ""}]})} className="text-xs text-primary font-bold hover:underline">+ Add Social</button>
                                    </div>
                                    <div className="space-y-6">
                                        {draft.vcard_socials.map((social: any, idx: number) => (
                                            <div key={idx} className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 relative">
                                                <InputBlock label="Label" value={social.label} onChange={(v: string) => {
                                                    const next = [...draft.vcard_socials];
                                                    next[idx].label = v;
                                                    setDraft({...draft, vcard_socials: next});
                                                }} />
                                                <InputBlock label="URL" value={social.value} onChange={(v: string) => {
                                                    const next = [...draft.vcard_socials];
                                                    next[idx].value = v;
                                                    setDraft({...draft, vcard_socials: next});
                                                }} placeholder="https://..." />
                                                <button onClick={() => setDraft({...draft, vcard_socials: draft.vcard_socials.filter((_: any, i: number) => i !== idx)})} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {openSection === "pixels" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Google Analytics Integrations" icon={ActivitySquare} />
                                    {pixels.length === 0 ? (
                                        <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-center">
                                            <p className="text-sm text-slate-500">No integrations found. Create one first in the Google Analytics section.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {pixels.map((pixel: any) => {
                                                const isSelected = (draft.selectedPixels as number[]).includes(pixel.id || pixel.pixel_id);
                                                return (
                                                    <div key={pixel.id || pixel.pixel_id} className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{pixel.name}</div>
                                                            <p className="text-[11px] text-slate-500 mt-1">{pixel.type} — {pixel.pixel_id_value}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const current = draft.selectedPixels as number[];
                                                                const pid = pixel.id || pixel.pixel_id;
                                                                setDraft({
                                                                    ...draft,
                                                                    selectedPixels: isSelected
                                                                        ? current.filter((id: number) => id !== pid)
                                                                        : [...current, pid]
                                                                });
                                                            }}
                                                            className={cn("w-9 h-5 rounded-full relative transition-colors", isSelected ? "bg-primary" : "bg-slate-300")}
                                                        >
                                                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", isSelected ? "left-[18px]" : "left-[2px]")} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {openSection === "temporary" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Temporary URL" icon={CalendarClock} />
                                    <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-8">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setDraft({...draft, temporaryEnabled: !draft.temporaryEnabled})} className={cn("w-9 h-5 rounded-full relative transition-colors", draft.temporaryEnabled ? "bg-primary" : "bg-slate-300")}>
                                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", draft.temporaryEnabled ? "left-[18px]" : "left-[2px]")} />
                                            </button>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">Schedule</div>
                                                <p className="text-[11px] text-slate-500">Configure the dates on which the link will be active.</p>
                                            </div>
                                        </div>
                                        {draft.temporaryEnabled && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <InputBlock label="Start Date" type="datetime-local" value={draft.temporaryStart} onChange={(v: string) => setDraft({...draft, temporaryStart: v})} />
                                                <InputBlock label="End Date" type="datetime-local" value={draft.temporaryEnd} onChange={(v: string) => setDraft({...draft, temporaryEnd: v})} />
                                            </div>
                                        )}
                                        <InputBlock 
                                            label="Clicks limit" 
                                            icon={MousePointer2}
                                            value={draft.clicksLimit} 
                                            onChange={(v: string) => setDraft({...draft, clicksLimit: v})} 
                                            description="Only allow the link to work for a certain amount of clicks."
                                        />
                                        <InputBlock 
                                            label="Expiration URL" 
                                            icon={Globe}
                                            value={draft.expirationUrl} 
                                            onChange={(v: string) => setDraft({...draft, expirationUrl: v})} 
                                            description="Visitors will be redirected to this URL after the main link expires."
                                        />
                                    </div>
                                </div>
                            )}

                            {openSection === "protection" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Protection" icon={Shield} />
                                    <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-8">
                                        <InputBlock label="Password" type="password" value={draft.password} onChange={(v: string) => setDraft({...draft, password: v})} description="Require users to enter a password before accessing the vCard." />
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                            <button onClick={() => setDraft({...draft, sensitiveContentWarning: !draft.sensitiveContentWarning})} className={cn("w-9 h-5 rounded-full relative transition-colors", draft.sensitiveContentWarning ? "bg-primary" : "bg-slate-300")}>
                                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm", draft.sensitiveContentWarning ? "left-[18px]" : "left-[2px]")} />
                                            </button>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">Sensitive content warning</div>
                                                <p className="text-[11px] text-slate-500">Enable a warning message before users can view the vCard.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {openSection === "advanced" && (
                                <div className="space-y-6">
                                    <SectionHeader title="Advanced Settings" icon={Settings2} />
                                    <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Splash Page</label>
                                            <Link href="/dashboard/splash-pages/create" className="text-[10px] font-bold text-primary hover:underline">+ Create Splash Page</Link>
                                        </div>
                                        <select 
                                            value={draft.splash_page_id || ""} 
                                            onChange={(e) => setDraft({...draft, splash_page_id: e.target.value})} 
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 font-bold text-sm outline-none"
                                        >
                                            <option value="">None</option>
                                        </select>
                                        <p className="text-[10px] text-slate-400">Redirect visitors to a splash page before the final destination.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={onSave}
                            disabled={saveState === "saving"}
                            className="h-12 px-12 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {saveState === "saving" && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                            {saveState === "saved" ? "Saved!" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
