"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon,
    ShoppingBag, SmartphoneNfc, Sparkles, ChevronLeft, ChevronRight,
    Settings, Zap, MoreHorizontal, PanelLeft, Columns, Search, Camera,
    Shuffle, Palette, KeyRound, ShieldAlert, CircleDot, Orbit, Megaphone, Code2, FileCode2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { VisualsLab, getTheme, isColorLight, ThemeEffectsLayer, ThemeAnimationStyles } from "./TemplateSystem";
import BlockMarketplaceContent from "./BlockMarketplaceContent";

interface BioProfile { id: number; title: string; bio: string; avatar: string; email_link: string; contact_link: string; theme: string; }
interface BioTab { id: number; title: string; is_active: number; sections: BioSection[]; }
interface BioSection { id: number; tab_id: number; title: string; type: string; is_active: number; blocks: BioBlock[]; }
interface BioBlock { id: number; section_id: number; type: string; is_active: number; items: any[]; }

type PhaseIconType = React.ComponentType<{ size?: number; className?: string }>;

interface BioAdvancedSettings {
    displayBranding: boolean;
    brandingName: string;
    brandingUrl: string;
    brandingTextColor: string;
    pixelFacebookEnabled: boolean;
    pixelGoogleEnabled: boolean;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    password: string;
    sensitiveContentWarning: boolean;
    brandedButtonEnabled: boolean;
    brandedIconUrl: string;
    brandedModalTitle: string;
    brandedModalContent: string;
    enableShareButton: boolean;
    enableScrollButtons: boolean;
    enableDirectoryDisplaying: boolean;
    projectName: string;
    splashPageName: string;
    leapLinkUrl: string;
    customCss: string;
    customJs: string;
}

const DEFAULT_ADVANCED_SETTINGS: BioAdvancedSettings = {
    displayBranding: true,
    brandingName: "",
    brandingUrl: "",
    brandingTextColor: "",
    pixelFacebookEnabled: true,
    pixelGoogleEnabled: true,
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    password: "",
    sensitiveContentWarning: false,
    brandedButtonEnabled: false,
    brandedIconUrl: "",
    brandedModalTitle: "",
    brandedModalContent: "",
    enableShareButton: true,
    enableScrollButtons: true,
    enableDirectoryDisplaying: true,
    projectName: "None",
    splashPageName: "None",
    leapLinkUrl: "",
    customCss: "",
    customJs: "",
};

const PRESET_BLOCK_CATEGORIES: Record<string, Array<{ type: string; label: string; desc: string }>> = {
    Standard: [
        { type: "link", label: "Link", desc: "Add a single clickable link." },
        { type: "heading", label: "Heading", desc: "Add a section heading." },
        { type: "paragraph", label: "Paragraph", desc: "Add rich text content." },
        { type: "avatar", label: "Avatar", desc: "Show a profile-style image." },
        { type: "image", label: "Image", desc: "Upload and show an image." },
        { type: "socials", label: "Socials", desc: "Display social profile links." },
        { type: "business_hours", label: "Business hours", desc: "Add your opening hours." },
        { type: "modal_text", label: "Modal text", desc: "Show extra text in a modal." },
    ],
    Advanced: [
        { type: "email_collector", label: "Email collector", desc: "Collect emails from visitors." },
        { type: "phone_collector", label: "Phone collector", desc: "Collect phone numbers." },
        { type: "contact_form", label: "Contact form", desc: "Add a simple contact form." },
    ],
    Payments: [
        { type: "paypal", label: "PayPal", desc: "Accept payments with PayPal." },
    ],
    Embed: [
        { type: "soundcloud", label: "SoundCloud", desc: "Embed SoundCloud content." },
        { type: "spotify", label: "Spotify", desc: "Embed Spotify content." },
        { type: "youtube", label: "YouTube", desc: "Embed YouTube content." },
        { type: "twitch", label: "Twitch", desc: "Embed Twitch content." },
        { type: "vimeo", label: "Vimeo", desc: "Embed Vimeo content." },
        { type: "tiktok_video", label: "TikTok Video", desc: "Embed a TikTok video." },
    ],
};

const BLOCK_ICONS: Record<string, React.ReactNode> = {
    link: <LinkIcon size={16} />, heading: <FileCode2 size={16} />, paragraph: <FileCode2 size={16} />,
    avatar: <User size={16} />, image: <ImageIcon size={16} />, socials: <Share2 size={16} />,
    business_hours: <CircleDot size={16} />, modal_text: <Info size={16} />,
    email_collector: <Megaphone size={16} />, phone_collector: <Megaphone size={16} />, contact_form: <Megaphone size={16} />,
    paypal: <ShoppingBag size={16} />, soundcloud: <Orbit size={16} />, spotify: <Orbit size={16} />,
    youtube: <Youtube size={16} />, twitch: <Video size={16} />, vimeo: <Video size={16} />, tiktok_video: <Video size={16} />,
    links_carousel: <Layers size={16} />, hero_single_link: <LinkIcon size={16} />, links_grid: <Grid size={16} />,
    ig_reels_sync: <Video size={16} />, ig_reels: <Video size={16} />, youtube_shorts: <Youtube size={16} />,
    long_form_videos: <MonitorPlay size={16} />, long_video: <MonitorPlay size={16} />,
    vertical_media: <Smartphone size={16} />, square_media: <ImageIcon size={16} />, horizontal_media: <Monitor size={16} />,
    add_logos: <Hexagon size={16} />, add_products: <ShoppingBag size={16} />, add_apps: <SmartphoneNfc size={16} />,
};

const BLOCK_COLORS: Record<string, string> = {
    links_carousel: "#6366F1", hero_single_link: "#6366F1", links_grid: "#8B5CF6",
    vertical_media: "#06B6D4", square_media: "#10B981", horizontal_media: "#F59E0B",
    add_logos: "#64748B", add_products: "#F97316", add_apps: "#3B82F6",
    ig_reels: "#4F46E5", ig_reels_sync: "#4F46E5", youtube_shorts: "#4F46E5",
};

const normalizeBlockType = (value: unknown) => String(value || "").toLowerCase();

const isImageOnlyType = (value: unknown) => {
    const type = normalizeBlockType(value);
    return /image|photo|picture/.test(type) || type === "square_media" || type === "add_logos";
};

const isMediaType = (value: unknown) => {
    const type = normalizeBlockType(value);
    return isImageOnlyType(type) || type.includes("avatar") || type.includes("media");
};

const mapPickerTypeToBackendType = (value: unknown) => {
    const type = normalizeBlockType(value);
    if (["image", "avatar"].includes(type)) return "square_media";
    if (["socials", "business_hours", "email_collector", "phone_collector", "contact_form"].includes(type)) return "links_grid";
    if (["paypal", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) return "links_grid";
    return "hero_single_link";
};

const getUiTypeFromBlock = (block: any, uiTypeOverrides?: Record<number, string>) =>
    normalizeBlockType(
        block?._uiType ||
        block?.items?.[0]?.builder_type ||
        (block?.id && uiTypeOverrides?.[block.id]) ||
        block?.type
    );

const getDefaultItemForType = (value: unknown) => {
    const type = normalizeBlockType(value);
    if (isMediaType(type)) return { title: "", url: "", image_url: "", builder_type: type };
    if (["paragraph", "modal_text", "business_hours"].includes(type)) return { title: "", description: "", url: "", builder_type: type };
    if (type === "heading") return { title: "", builder_type: type };
    if (["email_collector", "phone_collector", "contact_form"].includes(type)) return { title: "", description: "", builder_type: type };
    return { title: "", url: "https://", builder_type: type };
};

const mergeTabsPreservingItems = (localTabs: any[], incomingTabs: any[]) => {
    if (!Array.isArray(incomingTabs) || incomingTabs.length === 0) {
        return Array.isArray(localTabs) ? localTabs : [];
    }

    return incomingTabs.map((incomingTab) => {
        const localTab = (localTabs || []).find((t: any) => t.id === incomingTab.id);
        const incomingSections = Array.isArray(incomingTab?.sections) ? incomingTab.sections : [];

        const mergedSections = incomingSections.map((incomingSection: any) => {
            const localSection = (localTab?.sections || []).find((s: any) => s.id === incomingSection.id);
            const incomingBlocks = Array.isArray(incomingSection?.blocks) ? incomingSection.blocks : [];

            const mergedBlocks = incomingBlocks.map((incomingBlock: any) => {
                const localBlock = (localSection?.blocks || []).find((b: any) => b.id === incomingBlock.id);
                const incomingItems = Array.isArray(incomingBlock?.items) ? incomingBlock.items : [];
                const localItems = Array.isArray(localBlock?.items) ? localBlock.items : [];
                const mergedItems = incomingItems.length > 0 ? incomingItems : localItems;
                return { ...incomingBlock, items: mergedItems };
            });

            return { ...incomingSection, blocks: mergedBlocks };
        });

        return { ...incomingTab, sections: mergedSections };
    });
};

const CarouselPreview = ({ items }: { items: any[] }) => (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {items.map((item, i) => (
            <a key={i} href={item.url || "#"} target="_blank"
                className="flex-shrink-0 w-[160px] bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-700 group">
                <div className="h-24 bg-neutral-100 dark:bg-neutral-700 relative overflow-hidden">
                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> :
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300"><ImageIcon size={20} /></div>}
                </div>
                <div className="p-3">
                    <p className="text-[12px] font-semibold text-neutral-800 dark:text-white truncate">{item.title || "Link"}</p>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">{item.button_text || "Visit"} <ArrowRight size={9} /></p>
                </div>
            </a>
        ))}
    </div>
);

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input {...props} className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-[14px] font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner" />
    </div>
);

const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-all",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            checked ? "bg-slate-900 dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-800"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

const PhonePreview = ({ profile, tabs, selectedTabId, setSelectedTabId, viewportOffset = 280, previewWidth = 300, uiTypeOverrides = {} }: any) => {
    const mergedSections = (tabs || []).flatMap((tab: any) => tab.sections || []);
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const previewSections = mergedSections.length > 0 ? mergedSections : (currentTab?.sections || []);
    const theme = getTheme(profile?.theme);
    const accentLight = isColorLight(theme.accent);

    return (
        <div
            className="relative mx-auto flex items-center justify-center"
            style={{
                width: `min(${previewWidth}px, calc(100vw - 2rem))`,
                height: `min(600px, calc(100vh - ${viewportOffset}px))`,
            }}
        >
            <div className="relative w-full h-full bg-[#020617] rounded-[54px] p-2.5 shadow-[0_50px_100px_rgba(0,0,0,0.4),0_0_0_4px_rgba(255,255,255,0.05)] border-4 border-slate-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#020617] rounded-b-3xl z-20" />
                <div className="rounded-[44px] overflow-hidden w-full h-full relative flex flex-col shadow-inner transition-all duration-700"
                    style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="flex-1 overflow-y-auto no-scrollbar pt-10 px-5 pb-20 relative z-10">
                        <div className="flex flex-col items-center pt-6 pb-8">
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mb-4">
                                <div className="w-[84px] h-[84px] rounded-full p-[3px] mx-auto shadow-xl"
                                    style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}60, ${theme.textColor}30)` }}>
                                    <div className="w-full h-full rounded-full overflow-hidden"
                                        style={{ backgroundColor: `${theme.textColor}08` }}>
                                        {profile?.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" /> :
                                            <div className="w-full h-full flex items-center justify-center rounded-full" style={{ color: `${theme.textColor}50` }}><User size={32} /></div>}
                                    </div>
                                </div>
                            </motion.div>
                            <div className="backdrop-blur-md rounded-2xl px-8 py-2.5 shadow-xl"
                                style={{ backgroundColor: `${theme.textColor}0D`, border: `1px solid ${theme.textColor}18` }}>
                                <p className="text-[14px] font-semibold tracking-normal" style={{ color: theme.textColor }}>{profile?.title || "Your Brand"}</p>
                            </div>
                            {profile?.bio && (
                                <p className="text-[11px] mt-2.5 max-w-[200px] text-center leading-relaxed font-normal"
                                    style={{ color: `${theme.textColor}80` }}>{profile.bio}</p>
                            )}
                        </div>
                        <div className="space-y-4">
                            {previewSections.map((sec: any) => (
                                <div key={sec.id}>
                                    <div className="space-y-3">
                                        {sec.blocks?.map((block: any) => {
                                            const type = getUiTypeFromBlock(block, uiTypeOverrides);
                                            const isMediaBlock = isMediaType(type);

                                            return (block.items || []).map((item: any, i: number) => {
                                                if (isMediaBlock) {
                                                    const mediaUrl = item?.image_url || item?.url;
                                                    const mediaHeight = type === "horizontal_media" ? "h-28" : type === "square_media" ? "h-44" : "h-52";

                                                    return (
                                                        <motion.div
                                                            key={`${block.id}-media-${i}`}
                                                            whileHover={{ scale: 1.01, y: -2 }}
                                                            className={cn("w-full overflow-hidden rounded-2xl border", mediaHeight)}
                                                            style={{
                                                                borderColor: `${theme.textColor}25`,
                                                                backgroundColor: `${theme.textColor}0A`,
                                                            }}
                                                        >
                                                            {mediaUrl ? (
                                                                <img src={mediaUrl} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center" style={{ color: `${theme.textColor}70` }}>
                                                                    <ImageIcon size={22} />
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                }

                                                if (type === "heading") {
                                                    return (
                                                        <div key={`${block.id}-item-${i}`} className="px-4 py-2 rounded-xl" style={{ backgroundColor: `${theme.textColor}0A` }}>
                                                            <p className="text-[13px] font-black tracking-wide" style={{ color: theme.textColor }}>{item.title || "Heading"}</p>
                                                        </div>
                                                    );
                                                }

                                                if (["paragraph", "modal_text", "business_hours", "contact_form", "email_collector", "phone_collector"].includes(type)) {
                                                    return (
                                                        <div key={`${block.id}-item-${i}`} className="px-4 py-3 rounded-xl border" style={{ borderColor: `${theme.textColor}20`, backgroundColor: `${theme.textColor}08` }}>
                                                            <p className="text-[11px] leading-relaxed" style={{ color: `${theme.textColor}CC` }}>{item.description || item.title || "Text block"}</p>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <motion.a key={`${block.id}-item-${i}`} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                                                        href={item.url || "#"} className={cn("block w-full flex items-center justify-center transition-all", theme.fontClass)}
                                                        style={theme.btnStyle}>
                                                        {item.title || "Open Link"}
                                                    </motion.a>
                                                );
                                            });
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center border z-10"
                        style={{ backgroundColor: `${theme.textColor}10`, borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                        <ChevronLeft size={18} />
                    </div>
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center border z-10"
                        style={{ backgroundColor: `${theme.textColor}10`, borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                        <Share2 size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ section, sidx, sectionsLength, isArranging, onReorder, onDeleteSection, onDeleteBlock, onOpenEditor, onAddBlock }: any) => (
    <motion.div layout key={section.id}
        className="group/sec rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-4 px-8 py-5 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/50">
            {isArranging ? (
                <div className="flex items-center gap-1.5 mr-2">
                    <button disabled={sidx === 0} onClick={() => onReorder(sidx, sidx - 1)}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all border border-slate-200 dark:border-slate-700">
                        <ChevronLeft size={14} />
                    </button>
                    <button disabled={sidx === sectionsLength - 1} onClick={() => onReorder(sidx, sidx + 1)}
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-slate-900 hover:text-white transition-all border border-slate-200 dark:border-slate-700">
                        <ChevronRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="w-9 h-9 rounded-xl  flex items-center justify-center text-slate-900 dark:text-white shadow-inner ring-1 ring-slate-900/20">
                    <Layers size={16} />
                </div>
            )}
            <div className="flex-1">
                <span className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{section.title}</span>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full  animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{section.blocks?.length || 0} Items linked</span>
                </div>
            </div>
            <button onClick={() => onDeleteSection(section.id)}
                className="w-10 h-10 rounded-xl opacity-0 group-hover/sec:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-300 flex items-center justify-center transition-all">
                <Trash2 size={16} />
            </button>
        </div>

        <div className="p-8 space-y-4">
            {section.blocks?.length === 0 ? (
                <div className="py-12 text-center rounded-[28px] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] text-slate-400">Empty Category</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {section.blocks?.map((block: any) => {
                        const color = BLOCK_COLORS[block.type] || "#6B7280";
                        const icon = BLOCK_ICONS[block.type] || <LayoutTemplate size={20} />;
                        const isEditable = ['links_carousel', 'hero_single_link', 'links_grid', 'add_products', 'add_apps', 'vertical_media', 'square_media', 'horizontal_media', 'add_logos'].includes(block.type);

                        return (
                            <motion.div layout key={block.id} onClick={() => isEditable && onOpenEditor(block)}
                                className={cn("flex items-center gap-5 p-6 rounded-3xl border-2 transition-all group/block relative overflow-hidden",
                                    isEditable ? "cursor-pointer bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:translate-x-1"
                                        : "bg-slate-50 dark:bg-slate-950 opacity-60")}>
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${color}15`, color }}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight capitalize">{block.type.replace(/_/g, " ")}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{isEditable ? "Tap to Edit Settings" : "System Content"}</p>
                                </div>
                                {!isArranging && (
                                    <button onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                        className="w-10 h-10 rounded-xl opacity-0 group-hover/block:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-300 flex items-center justify-center transition-all shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
            <button onClick={() => onAddBlock(section.id)}
                className="w-full flex items-center justify-center gap-3 h-16 rounded-[28px] border-2 border-primary/10 bg-primary/[0.02] text-primary hover:bg-primary hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] mt-4 shadow-sm">
                <Plus size={20} /> Add New Link / Photo
            </button>
        </div>
    </motion.div>
);


export default function BioLinkBuilder() {
    const searchParams = useSearchParams();
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [blockCategories, setBlockCategories] = useState<{ [cat: string]: any[] }>(PRESET_BLOCK_CATEGORIES);
    const [profile, setProfile] = useState<BioProfile | null>(null);
    const [tabs, setTabs] = useState<BioTab[]>([]);
    const [uiTypeOverrides, setUiTypeOverrides] = useState<Record<number, string>>({});
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createTitle, setCreateTitle] = useState("");
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
    const [showCarouselEditor, setShowCarouselEditor] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null);

    const [isArranging, setIsArranging] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activePanel, setActivePanel] = useState<"builder" | "preview">("builder");
    const [view, setView] = useState("blocks");
    const [advancedSettings, setAdvancedSettings] = useState<BioAdvancedSettings>(DEFAULT_ADVANCED_SETTINGS);
    const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);

    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${instagramUsername}&id=${selectedPageId}`
        : `/p?u=${instagramUsername}&id=${selectedPageId}`;

    const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];
    const flatBlocks = (tabs || []).flatMap((tab: any) => tab.sections || []).flatMap((sec: any) => sec.blocks || []);
    const visibleBlocks = flatBlocks;
    const requestedPageId = searchParams.get("page");
    const advancedFlowTips = [
        "1. Turn features ON that you want visitors to use.",
        "2. Fill only the fields needed for your current campaign.",
        "3. Click Save Advanced Settings to apply changes.",
    ];
    const enabledAdvancedFlags = [
        advancedSettings.displayBranding && "Branding",
        advancedSettings.pixelFacebookEnabled && "Facebook Pixel",
        advancedSettings.pixelGoogleEnabled && "Google Analytics",
        advancedSettings.sensitiveContentWarning && "Sensitive Warning",
        advancedSettings.brandedButtonEnabled && "Branded Button",
        advancedSettings.enableShareButton && "Share Button",
        advancedSettings.enableScrollButtons && "Scroll Buttons",
        advancedSettings.enableDirectoryDisplaying && "Directory Listing",
        !!advancedSettings.password && "Password Protection",
        !!advancedSettings.leapLinkUrl && "Leap Redirect",
    ].filter(Boolean) as string[];

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/social/instagram-connect");
                const accs = res.data?.data?.instagram_accounts || [];
                setAccounts(accs);
                if (accs.length > 0) {
                    const preferredId = requestedPageId && accs.some((a: any) => String(a.id) === requestedPageId)
                        ? requestedPageId
                        : accs[0].id.toString();
                    setSelectedPageId(preferredId);
                }
            } catch { }
        };
        fetchAccounts();
        setBlockCategories(PRESET_BLOCK_CATEGORIES);
    }, [requestedPageId]);

    useEffect(() => {
        if (!requestedPageId || !accounts.length) return;
        if (accounts.some((a: any) => String(a.id) === requestedPageId)) {
            setSelectedPageId(requestedPageId);
        }
    }, [accounts, requestedPageId]);

    const fetchBuilderData = useCallback(async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = res.data?.data || res.data;
            if (payload?.id) {
                setProfile(payload);
                setTabs((prevTabs) => mergeTabsPreservingItems(prevTabs, payload.tabs || []));
                if (payload.tabs?.length > 0 && !selectedTabId) setSelectedTabId(payload.tabs[0].id);
            }
            else if (payload?.profile) {
                setProfile(payload.profile);
                setTabs((prevTabs) => mergeTabsPreservingItems(prevTabs, payload.tabs || []));
                if (payload.tabs?.length > 0 && !selectedTabId) setSelectedTabId(payload.tabs[0].id);
            }
            else {
                setProfile(null);
                setTabs([]);
                setSelectedTabId(null);
            }
        } catch { setProfile(null); setTabs([]); setSelectedTabId(null); }
        finally { setIsLoading(false); }
    }, [selectedPageId]);

    useEffect(() => { fetchBuilderData(); }, [fetchBuilderData]);

    useEffect(() => {
        if (!profile) {
            setAdvancedSettings(DEFAULT_ADVANCED_SETTINGS);
            return;
        }
        setAdvancedSettings(prev => ({
            ...prev,
            brandingName: profile.title || prev.brandingName,
            brandingUrl: prev.brandingUrl || (typeof window !== "undefined" ? window.location.origin : ""),
        }));
    }, [profile]);

    const handleUpdateProfile = async (updates: Partial<BioProfile>) => {
        if (!profile) return;
        const previousProfile = profile;
        const nextProfile = { ...profile, ...updates };
        setProfile(nextProfile);
        try {
            await api.put(`/bio-builder/profile/${profile.id}`, updates);
        } catch {
            setProfile(previousProfile);
            showModal("error", "Error", "Failed to update profile.");
        }
    };

    const syncBlockItemsLocally = (blockId: number, items: any[]) => {
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).map((block) =>
                        block.id === blockId ? { ...block, items } : block
                    ),
                })),
            }))
        );
    };

    const handleDeleteSection = async (id: number) => {
        if (typeof window !== "undefined") {
            const ok = window.confirm("Are you sure you want to delete this section?");
            if (!ok) return;
        }
        try { await api.delete(`/bio-builder/sections/${id}`); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to delete section."); }
    };

    const ensureSectionForBlocks = async () => {
        if (!profile || !selectedPageId) return;

        let latestTabs = tabs;
        try {
            const fresh = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = fresh.data?.data || fresh.data;
            latestTabs = payload?.tabs || tabs;
        } catch {
            // If refresh fails, continue with current local state.
        }

        let resolvedTabId = currentTab?.id || selectedTabId || latestTabs[0]?.id;

        if (!resolvedTabId) {
            try {
                const createdTab = await api.post("/bio-builder/tabs", { profile_id: profile.id, title: "Main" });
                resolvedTabId = createdTab?.data?.data?.id || createdTab?.data?.id;
            } catch {
                showModal("error", "Error", "Failed to create a content tab.");
                return null;
            }
        }

        try {
            const fresh = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = fresh.data?.data || fresh.data;
            latestTabs = payload?.tabs || tabs;
            if (!resolvedTabId) {
                resolvedTabId = payload?.tabs?.[0]?.id;
            }
        } catch {
            // If refresh fails, we still continue with local state.
        }

        if (!resolvedTabId) {
            showModal("error", "Error", "Could not resolve a tab for adding blocks.");
            return null;
        }

        const activeTab = latestTabs.find((tab: any) => tab.id === resolvedTabId) || latestTabs[0];
        const existingSection = activeTab?.sections?.[0];
        if (existingSection?.id) {
            setSelectedTabId(activeTab.id);
            return existingSection.id;
        }

        try {
            const created = await api.post("/bio-builder/sections", {
                profile_id: profile.id,
                tab_id: resolvedTabId,
                title: "Main Content",
                type: "links",
            });

            const createdSectionId = created?.data?.data?.id || created?.data?.id;
            if (createdSectionId) {
                await fetchBuilderData();
                setSelectedTabId(resolvedTabId);
                return createdSectionId;
            }

            const refreshed = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = refreshed.data?.data || refreshed.data;
            const refreshedTabs = payload?.tabs || [];
            const matchedTab = refreshedTabs.find((tab: any) => tab.id === resolvedTabId) || refreshedTabs[0];
            const fallbackSectionId = matchedTab?.sections?.[0]?.id;

            if (fallbackSectionId) {
                await fetchBuilderData();
                setSelectedTabId(matchedTab?.id || resolvedTabId);
                return fallbackSectionId;
            }

            showModal("error", "Error", "Section created but could not open block marketplace. Please try again.");
            return null;
        } catch {
            showModal("error", "Error", "Failed to prepare content blocks.");
            return null;
        }
    };

    const openBlockMarketplace = async (sectionId?: number) => {
        if (!profile || !selectedPageId) return;

        if (sectionId) {
            setTargetSectionId(sectionId);
            setShowAddBlock(true);
            return;
        }

        const existingSectionId = currentTab?.sections?.[0]?.id || null;
        setTargetSectionId(existingSectionId);
        setShowAddBlock(true);
    };

    const handleAddBlock = async (sectionId: number, type: string) => {
        if (!profile) return;
        const selectedType = normalizeBlockType(type);
        const defaultItems = [getDefaultItemForType(selectedType)];
        try {
            const primaryRes = await api.post("/bio-builder/blocks", {
                profile_id: profile.id,
                section_id: sectionId,
                type: selectedType,
                items: defaultItems,
            });
            const createdId = primaryRes?.data?.data?.id || primaryRes?.data?.id;
            if (createdId) {
                setUiTypeOverrides((prev) => ({ ...prev, [createdId]: selectedType }));
            }
            await fetchBuilderData();
            setShowAddBlock(false);
        } catch {
            try {
                const fallbackType = mapPickerTypeToBackendType(selectedType);
                const fallbackRes = await api.post("/bio-builder/blocks", {
                    profile_id: profile.id,
                    section_id: sectionId,
                    type: fallbackType,
                    items: defaultItems,
                });
                const createdId = fallbackRes?.data?.data?.id || fallbackRes?.data?.id;
                if (createdId) {
                    setUiTypeOverrides((prev) => ({ ...prev, [createdId]: selectedType }));
                }
                await fetchBuilderData();
                setShowAddBlock(false);
            } catch {
                showModal("error", "Error", "Failed to add block.");
            }
        }
    };

    const handleSelectBlockType = async (type: string) => {
        const resolvedSectionId = targetSectionId || await ensureSectionForBlocks();
        if (!resolvedSectionId) {
            showModal("error", "Error", "Could not prepare content for this block. Please try again.");
            return;
        }
        setTargetSectionId(resolvedSectionId);
        await handleAddBlock(resolvedSectionId, type);
    };

    const handleDeleteBlock = async (id: number) => {
        if (typeof window !== "undefined") {
            const ok = window.confirm("Are you sure you want to delete this block?");
            if (!ok) return;
        }

        // Local-first delete: remove instantly from builder and preview.
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).filter((block) => block.id !== id),
                })),
            }))
        );

        if (editingBlock?.id === id) {
            setShowCarouselEditor(false);
            setEditingBlock(null);
        }

        try {
            await api.delete(`/bio-builder/blocks/${id}`);
        } catch {
            showModal("error", "Warning", "Block removed locally, but server delete failed.");
        }
    };

    const handleUploadImage = async (file: File) => {
        try {
            const fd = new FormData(); fd.append("image", file);
            const res = await api.post("/bio-builder/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
            return res.data?.url;
        } catch { showModal("error", "Error", "Failed to upload image."); return null; }
    };

    const openEditor = (block: any) => {
        const uiType = getUiTypeFromBlock(block, uiTypeOverrides);
        const items = (block.items || block.content?.items || []).map((item: any) => ({ ...item, builder_type: item?.builder_type || uiType }));
        setEditingBlock({ ...block, _uiType: uiType, items });
        setShowCarouselEditor(true);
    };

    const saveEditor = async () => {
        if (!editingBlock) return;
        const uiType = getUiTypeFromBlock(editingBlock, uiTypeOverrides);
        const normalizedItems = (editingBlock.items || []).map((item: any) => ({ ...item, builder_type: item?.builder_type || uiType }));

        syncBlockItemsLocally(editingBlock.id, normalizedItems);
        setUiTypeOverrides((prev) => ({ ...prev, [editingBlock.id]: uiType }));
        setShowCarouselEditor(false);

        try {
            await api.put(`/bio-builder/blocks/${editingBlock.id}`, {
                type: editingBlock.type,
                items: normalizedItems,
            });
        }
        catch {
            showModal("error", "Error", "Failed to save block on server. Local preview is kept.");
        }
    };

    const updateItem = (idx: number, field: string, value: any) => {
        if (!editingBlock) return;
        const items = [...(editingBlock.items || [])];
        items[idx] = { ...items[idx], [field]: value };
        setEditingBlock({ ...editingBlock, items });
        syncBlockItemsLocally(editingBlock.id, items);
    };

    const handleReorderSections = async (fromIdx: number, toIdx: number) => {
        if (!currentTab?.sections) return;
        const newSections = [...currentTab.sections];
        const [moved] = newSections.splice(fromIdx, 1);
        newSections.splice(toIdx, 0, moved);
        setTabs(tabs.map(t => t.id === currentTab.id ? { ...t, sections: newSections } : t));
        try { await api.post("/bio-builder/reorder-sections", { tab_id: currentTab.id, section_ids: newSections.map(s => s.id) }); }
        catch { fetchBuilderData(); }
    };

    const handleShareLink = () => { navigator.clipboard.writeText(publicUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };

    const handleSaveAdvanced = async () => {
        if (!profile) return;
        setIsSavingAdvanced(true);
        try {
            await api.put(`/bio-builder/profile/${profile.id}`, advancedSettings);
        } catch {
            showModal("error", "Error", "Failed to save advanced settings.");
        } finally {
            setIsSavingAdvanced(false);
        }
    };

    const PHASES: Array<{ id: string; label: string; desc: string; hint: string; Icon: PhaseIconType; details: string[] }> = [
        { id: "identity", label: "1. Info", desc: "Name & Bio", hint: "Set your title, avatar, and short intro.", Icon: User, details: ["Upload your profile image.", "Add your brand title.", "Write a short bio visitors understand fast."] },
        { id: "blocks", label: "2. Content", desc: "Links & Photos", hint: "Add sections, buttons, and media blocks.", Icon: Layers, details: ["Create content sections.", "Add links, photos, or products.", "Arrange items in the order you want."] },
        { id: "visuals", label: "3. Style", desc: "Colors & Design", hint: "Pick the look, theme, and visual mood.", Icon: Palette, details: ["Choose the page look and feel.", "Match colors to your brand.", "Preview the design before launch."] },
        { id: "advanced", label: "4. Growth", desc: "Launch Gear", hint: "Turn on tracking, protection, and extras.", Icon: Sparkles, details: ["Enable pixels and analytics.", "Turn on password or warning protection.", "Add advanced brand controls and redirects."] }
    ];
    const currentPhase = PHASES.find((p) => p.id === view) || PHASES[0];
    const currentPhaseNumber = Math.max(PHASES.findIndex((p) => p.id === currentPhase.id), 0) + 1;
    const nextPhase = PHASES[currentPhaseNumber] || null;
    const completionPercent = Math.round((currentPhaseNumber / PHASES.length) * 100);
    const previewDemoProfile = {
        title: "Preview locked",
        bio: "Connect your Instagram account to unlock live editing. This demo keeps the layout visible.",
        theme: "photo_aura",
    };
    const previewDemoTabs = [{
        id: 1,
        title: "Demo",
        sections: [{
            id: 1,
            title: "Starter Links",
            blocks: [{ items: [{ title: "Join Waitlist", url: "#" }, { title: "Watch Demo", url: "#" }] }],
        }],
    }];

    if (!selectedPageId) return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
             style={{ background: 'var(--app-surface-bg, var(--background))' }}>
            <div className="w-full max-w-6xl grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.05)] p-6 sm:p-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner mb-6"><Monitor size={40} /></div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Required</h2>
                    <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">Please connect your Instagram account first to unlock the Creator Studio. A demo preview is shown beside this message so you can still verify the layout.</p>
                    <button onClick={() => window.location.href = '/dashboard/instagram/connect'} className="mt-6 h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">Connect Now</button>
                </div>
                <div className="w-full flex justify-center">
                    <PhonePreview profile={previewDemoProfile} tabs={previewDemoTabs} selectedTabId={1} setSelectedTabId={() => { }} viewportOffset={220} previewWidth={360} uiTypeOverrides={{}} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent font-sans selection:bg-primary/10 flex flex-col relative"
             style={{ background: 'var(--app-surface-bg, var(--background))' }}>

            {/* ── STABLE TOP BAR ── */}
            <header className="relative z-50 h-14 flex items-center justify-between px-6 bg-white/85 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Creator Studio</span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Bio link builder</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {instagramUsername}
                    </div>
                    <button onClick={handleShareLink} className="h-8 px-4 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-primary/10">
                        {copiedLink ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                        {copiedLink ? "COPIED" : "SHARE"}
                    </button>
                </div>
            </header>

            {/* ── CREATOR WORKSPACE ── */}
            <div className="relative flex-1 flex overflow-hidden">

                <main className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 xl:pr-[440px] pb-56 sm:pb-60 xl:pb-64", activePanel === "preview" ? "hidden xl:block" : "block")}>
                    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 xl:pl-4">

                        {/* ── FLOATING STEP GUIDE + BAR ── */}
                        <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(460px,calc(100%-1rem))] sm:w-[min(560px,calc(100%-1.5rem))] rounded-full border border-slate-200 dark:border-white/10 bg-white/96 dark:bg-slate-900/90 backdrop-blur-2xl px-1 py-1 shadow-[0_16px_34px_rgba(0,0,0,0.05)]">
                            <div className="grid grid-cols-4 gap-1">
                                {PHASES.map((p, idx) => (
                                    <button key={p.id} onClick={() => setView(p.id)}
                                        className="group relative outline-none">
                                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+12px)] w-[200px] sm:w-[240px] hidden group-hover:block">
                                            <div className="rounded-[22px] border border-slate-200/80 dark:border-white/10 bg-white/98 dark:bg-slate-950 p-2.5 shadow-[0_16px_34px_rgba(0,0,0,0.08)] text-left opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0", p.id === view ? "bg-slate-900 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300")}>
                                                        <p.Icon size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Step {idx + 1}</p>
                                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white mt-1 leading-snug">{p.desc}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">{p.hint}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 space-y-1.5 border-t border-slate-100 dark:border-white/10 pt-2.5">
                                                    {p.details.map((detail) => (
                                                        <div key={detail} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                            <span>{detail}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn("flex flex-col items-center justify-center gap-0.5 min-h-[44px] sm:min-h-[48px] px-1.5 rounded-full transition-all duration-300 border",
                                            view === p.id
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "bg-white/80 dark:bg-white/5 text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10")}>
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black", view === p.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>{idx + 1}</div>
                                            <span className={cn("hidden lg:block text-[8px] font-black uppercase tracking-[0.12em] truncate", view === p.id ? "text-white" : "text-slate-600 dark:text-slate-300")}>{p.label}</span>
                                            {view === p.id && <div className="absolute inset-x-6 -bottom-1 h-1 bg-white/40 rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 px-4 py-3 shadow-sm mt-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Step {currentPhaseNumber} of {PHASES.length}</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">Current: {currentPhase.desc}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use the steps above to move through setup in order. Each step shows what to complete next.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block w-44 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                    <div className="h-full rounded-full bg-slate-400 dark:bg-slate-600" style={{ width: `${completionPercent}%` }} />
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{completionPercent}%</span>
                                {nextPhase ? (
                                    <button
                                        onClick={() => setView(nextPhase.id)}
                                        className="h-9 px-4 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                                    >
                                        Next <ArrowRight size={12} />
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Final step ready</span>
                                )}
                            </div>
                        </div>

                        {/* ── PHASE CONTENT AREA ── */}
                        <AnimatePresence mode="wait">
                            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>

                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-normal mb-2 capitalize">
                                        {view === 'identity' ? "Setup your Profile" : view === 'blocks' ? "Build your Content" : view === 'visuals' ? 'Style your Page' : 'Launch Preparation'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-normal max-w-2xl leading-relaxed">Each section is designed to guide you from setup to launch without needing to guess what happens next.</p>
                                </div>

                                {view === "identity" && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                            <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                                                <label className="relative cursor-pointer shrink-0">
                                                    <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700 shadow-inner border-2 border-slate-100 dark:border-slate-700">
                                                        {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={32} /></div>}
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                                            <Upload size={20} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) handleUpdateProfile({ avatar: url }); } }} />
                                                </label>
                                                <div>
                                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Your Profile Photo</h3>
                                                    <p className="text-[12px] text-slate-400 font-medium">Click the circle to upload your logo or face shot.</p>
                                                </div>
                                            </div>
                                            <div className="grid gap-6">
                                                <InputField label="Name or Brand Title" value={profile?.title || ""} onChange={(e: any) => setProfile({ ...profile!, title: e.target.value })}
                                                    onBlur={(e: any) => handleUpdateProfile({ title: e.target.value })} placeholder="e.g. My Awesome Studio" />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Short Biography</label>
                                                    <textarea value={profile?.bio || ""} onChange={e => setProfile({ ...profile!, bio: e.target.value })}
                                                        onBlur={e => handleUpdateProfile({ bio: e.target.value })} rows={3}
                                                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-sm font-medium text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                        placeholder="Write a few lines about what you do..." />
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <button onClick={() => setView('blocks')} className="h-11 px-8 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
                                                        Next: Add Content <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {view === "blocks" && (
                                    <div className="space-y-6 pb-28 sm:pb-32">
                                        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3">
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Content Area</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Blocks</p>
                                            </div>
                                            <span className="text-xs text-slate-500">{visibleBlocks.length} items</span>
                                        </div>

                                        <div className="space-y-6">
                                            {(!currentTab || visibleBlocks.length === 0) ? (
                                                <div className="py-20 text-center bg-white dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
                                                        <Grid size={28} />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Ready to Start?</h3>
                                                    <p className="text-[13px] text-slate-400 mb-8 max-w-xs mx-auto font-medium">Create your first block to start building your content canvas.</p>
                                                    <button onClick={() => openBlockMarketplace()}
                                                        className="h-12 px-10 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all animate-bounce">
                                                        Create Block
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="grid gap-4">
                                                        {visibleBlocks.map((block: any) => {
                                                            const uiType = getUiTypeFromBlock(block, uiTypeOverrides);
                                                            const color = BLOCK_COLORS[uiType] || "#6B7280";
                                                            const icon = BLOCK_ICONS[uiType] || <LayoutTemplate size={20} />;
                                                            const isEditable = true;

                                                            return (
                                                                <motion.div
                                                                    layout
                                                                    key={block.id}
                                                                    onClick={(e) => {
                                                                        if (!isEditable) return;
                                                                        const target = e.target as HTMLElement;
                                                                        if (target.closest("button, a, input, textarea, select, label, [data-no-edit='true']")) return;
                                                                        openEditor(block);
                                                                    }}
                                                                    className={cn("flex items-center gap-5 p-6 rounded-3xl border-2 transition-all group/block relative overflow-hidden",
                                                                        isEditable ? "cursor-pointer bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:translate-x-1"
                                                                            : "bg-slate-50 dark:bg-slate-950 content-none opacity-60")}>
                                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${color}15`, color }}>
                                                                        {icon}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight capitalize">{uiType.replace(/_/g, " ")}</p>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{isEditable ? "Tap to Edit Settings" : "System Content"}</p>
                                                                    </div>
                                                                    {!isArranging && (
                                                                        <button
                                                                            onClick={e => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                                                                            data-no-edit="true"
                                                                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shrink-0"
                                                                            aria-label="Delete block"
                                                                            title="Delete block"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => openBlockMarketplace()}
                                                            className="flex-1 h-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all text-[11px] font-black uppercase tracking-widest group">
                                                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                            Create Block
                                                        </button>
                                                        <button onClick={() => setView('visuals')} className="h-16 px-8 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            Next: Style <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {view === "visuals" && <VisualsLab profile={profile} updateProfile={handleUpdateProfile} />}

                                {view === "advanced" && (
                                    <div className="max-w-3xl space-y-6">
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Make it clear for your visitors</h3>
                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">These options control trust, tracking, protection, and advanced behavior.</p>
                                                </div>
                                                <div className="px-3 py-2 rounded-xl bg-white/80 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                                    {enabledAdvancedFlags.length} active options
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                                                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Info size={14} /> How it works</p>
                                                    <div className="space-y-2">
                                                        {advancedFlowTips.map((tip) => (
                                                            <p key={tip} className="text-sm text-slate-700 dark:text-slate-200">{tip}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4">
                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Currently enabled</p>
                                                    {enabledAdvancedFlags.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {enabledAdvancedFlags.map((flag) => (
                                                                <span key={flag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold">
                                                                    {flag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-slate-500">No advanced options enabled yet.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <a href="#advanced-branding" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Branding</a>
                                                <a href="#advanced-pixels" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Pixels</a>
                                                <a href="#advanced-utm" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">UTM</a>
                                                <a href="#advanced-protection" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Protection</a>
                                                <a href="#advanced-branded-button" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Branded Button</a>
                                                <a href="#advanced-more" className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">Advanced</a>
                                            </div>
                                        </div>

                                        <div id="advanced-branding" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <Shuffle size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Branding</h3>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-semibold text-slate-900 dark:text-white">Display branding</span>
                                                    <ToggleSwitch
                                                        checked={advancedSettings.displayBranding}
                                                        onChange={(value) => setAdvancedSettings({ ...advancedSettings, displayBranding: value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Shuffle size={16} /> Branding name</label>
                                                    <input
                                                        value={advancedSettings.brandingName}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingName: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="Brand name"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">Leave empty to have the default site branding.</p>
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><LinkIcon size={16} /> Branding URL</label>
                                                    <input
                                                        value={advancedSettings.brandingUrl}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingUrl: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="https://example.com/"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Palette size={16} /> Text color</label>
                                                    <input
                                                        value={advancedSettings.brandingTextColor}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingTextColor: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="#1f2937"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div id="advanced-pixels" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <CircleDot size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Pixels</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-8">
                                                <label className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={advancedSettings.pixelFacebookEnabled}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, pixelFacebookEnabled: e.target.checked })}
                                                        className="w-5 h-5 accent-primary"
                                                    />
                                                    Facebook Pixel
                                                </label>
                                                <label className="flex items-center gap-3 text-xl font-semibold text-slate-900 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        checked={advancedSettings.pixelGoogleEnabled}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, pixelGoogleEnabled: e.target.checked })}
                                                        className="w-5 h-5 accent-primary"
                                                    />
                                                    Google Analytics
                                                </label>
                                            </div>
                                        </div>

                                        <div id="advanced-utm" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <Grid size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">UTM Parameters</h3>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white mb-2 block">Source</label>
                                                    <input
                                                        value={advancedSettings.utmSource}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmSource: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="e.g. newsletter, bing, google, youtube"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white mb-2 block">Medium</label>
                                                    <input
                                                        value={advancedSettings.utmMedium}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmMedium: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="e.g. link, banner, email, social"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white mb-2 block">Campaign</label>
                                                    <div className="h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-base flex items-center">
                                                        Automatically set for each link based on the name.
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">UTM preview</p>
                                                    <p className="text-base text-slate-700 dark:text-slate-300 mt-2">
                                                        {advancedSettings.utmSource || advancedSettings.utmMedium
                                                            ? `?utm_source=${advancedSettings.utmSource || "source"}&utm_medium=${advancedSettings.utmMedium || "medium"}&utm_campaign={link_name}`
                                                            : "None"}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-2">This query parameter will be appended to your destination URL.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="advanced-protection" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <ShieldAlert size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Protection</h3>
                                            </div>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><KeyRound size={16} /> Password</label>
                                                    <input
                                                        type="password"
                                                        value={advancedSettings.password}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, password: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="Enter password"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">Require users to enter a password before accessing the link.</p>
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-xl font-semibold text-slate-900 dark:text-white">Sensitive content warning</p>
                                                        <p className="text-sm text-slate-500 mt-1">Require users to confirm that they want to access your link and let them know the link might be sensitive.</p>
                                                    </div>
                                                    <ToggleSwitch
                                                        checked={advancedSettings.sensitiveContentWarning}
                                                        onChange={(value) => setAdvancedSettings({ ...advancedSettings, sensitiveContentWarning: value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div id="advanced-branded-button" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <CircleDot size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Branded button</h3>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xl font-semibold text-slate-900 dark:text-white">Enable branded button</p>
                                                    <ToggleSwitch
                                                        checked={advancedSettings.brandedButtonEnabled}
                                                        onChange={(value) => setAdvancedSettings({ ...advancedSettings, brandedButtonEnabled: value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white block">Branded icon</label>
                                                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                                                        <input
                                                            type="file"
                                                            disabled={!advancedSettings.brandedButtonEnabled}
                                                            onChange={async (e) => {
                                                                if (!e.target.files?.[0]) return;
                                                                const uploaded = await handleUploadImage(e.target.files[0]);
                                                                if (uploaded) {
                                                                    setAdvancedSettings({ ...advancedSettings, brandedIconUrl: uploaded });
                                                                }
                                                            }}
                                                            className="w-full text-sm"
                                                        />
                                                    </div>
                                                    <p className="text-sm text-slate-500">Use a 1:1 transparent image. jpg, jpeg, png, ico, svg, gif, webp allowed. 2 MB maximum.</p>
                                                </div>
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white block mb-2">Modal title</label>
                                                    <input
                                                        value={advancedSettings.brandedModalTitle}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalTitle: e.target.value })}
                                                        disabled={!advancedSettings.brandedButtonEnabled}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base disabled:opacity-50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white block mb-2">Modal content</label>
                                                    <textarea
                                                        value={advancedSettings.brandedModalContent}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalContent: e.target.value })}
                                                        disabled={!advancedSettings.brandedButtonEnabled}
                                                        rows={4}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base resize-none disabled:opacity-50"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">This field accepts usage of HTML.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="advanced-more" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                                            <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 mb-6">
                                                <Orbit size={16} className="text-slate-700 dark:text-slate-300" />
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Advanced</h3>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Enable share button</p>
                                                        <p className="text-sm text-slate-500">Display a button in the top right of the page that opens a share modal.</p>
                                                    </div>
                                                    <ToggleSwitch checked={advancedSettings.enableShareButton} onChange={(value) => setAdvancedSettings({ ...advancedSettings, enableShareButton: value })} />
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Enable scroll buttons</p>
                                                        <p className="text-sm text-slate-500">Display scroll top and bottom buttons in the left of the page. They will only show up when the page is long enough.</p>
                                                    </div>
                                                    <ToggleSwitch checked={advancedSettings.enableScrollButtons} onChange={(value) => setAdvancedSettings({ ...advancedSettings, enableScrollButtons: value })} />
                                                </div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-lg font-semibold text-slate-900 dark:text-white">Enable directory displaying</p>
                                                        <p className="text-sm text-slate-500">If enabled, your biolink page will be public in our Directory.</p>
                                                    </div>
                                                    <ToggleSwitch checked={advancedSettings.enableDirectoryDisplaying} onChange={(value) => setAdvancedSettings({ ...advancedSettings, enableDirectoryDisplaying: value })} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Megaphone size={14} /> Project</label>
                                                        <select
                                                            value={advancedSettings.projectName}
                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, projectName: e.target.value })}
                                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        >
                                                            <option value="None">None</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Sparkles size={14} /> Splash page</label>
                                                        <select
                                                            value={advancedSettings.splashPageName}
                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, splashPageName: e.target.value })}
                                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        >
                                                            <option value="None">None</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><ArrowRight size={14} /> Leap Link URL</label>
                                                    <input
                                                        value={advancedSettings.leapLinkUrl}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, leapLinkUrl: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="https://example.com/"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">Fully redirect all users that access the biolink page to this URL. Leave empty to disable the feature.</p>
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Code2 size={14} /> Custom CSS</label>
                                                    <textarea
                                                        value={advancedSettings.customCss}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, customCss: e.target.value })}
                                                        rows={4}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="body { background: blue !important; }"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">Your CSS code to modify the existing page style.</p>
                                                </div>

                                                <div>
                                                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2"><FileCode2 size={14} /> Custom JS</label>
                                                    <textarea
                                                        value={advancedSettings.customJs}
                                                        onChange={(e) => setAdvancedSettings({ ...advancedSettings, customJs: e.target.value })}
                                                        rows={4}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base"
                                                        placeholder="<script>console.log('Hello world');</script>"
                                                    />
                                                    <p className="text-sm text-slate-500 mt-2">Your custom JS code to enhance your page capability.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleSaveAdvanced}
                                                disabled={isSavingAdvanced}
                                                className="h-12 px-8 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-primary/10"
                                            >
                                                {isSavingAdvanced ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                {isSavingAdvanced ? "Saving..." : "Save Advanced Settings"}
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-500">Tip: enable only what you need for this campaign to keep your page clean and fast.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* ── MOBILE SWITCHER ── */}
                <div className="xl:hidden fixed bottom-4 left-4 right-4 z-[200] h-16 bg-slate-950/92 backdrop-blur-xl rounded-[22px] flex p-1.5 shadow-2xl border border-white/10">
                    <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                        <Edit3 size={16} /> Studio
                    </button>
                    <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                        <Eye size={16} /> Portal
                    </button>
                </div>

                {/* ── PHONE PREVIEW PORTAL (PERMANENTLY VISIBLE ON XL) ── */}
                <aside className={cn("fixed right-0 top-14 z-50 hidden xl:flex w-[440px] flex-col p-6 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 transition-all duration-500 h-[calc(100vh-56px)] shadow-[-24px_0_60px_rgba(0,0,0,0.05)]",
                    activePanel === "preview" ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100")}>
                    <div className="flex-1 rounded-[34px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-[26px] border border-slate-100 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] backdrop-blur-sm">
                            <PhonePreview profile={profile} tabs={tabs} selectedTabId={selectedTabId}
                                setSelectedTabId={setSelectedTabId} instagramUsername={instagramUsername} viewportOffset={140} previewWidth={360} uiTypeOverrides={uiTypeOverrides} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── MOBILE SWITCHER ── */}
            <div className="xl:hidden fixed bottom-4 left-4 right-4 z-[200] h-16 bg-slate-950/92 backdrop-blur-xl rounded-[22px] flex p-1.5 shadow-2xl border border-white/10">
                <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Edit3 size={16} /> Studio
                </button>
                <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Eye size={16} /> Portal
                </button>
            </div>

            {/* MODALS */}
            <ModalShell open={showAddBlock} onClose={() => setShowAddBlock(false)} title="Create Block" icon={<Grid size={20} />} maxWidthClassName="sm:max-w-5xl">
                <BlockMarketplaceContent
                    blockCategories={blockCategories}
                    onSelect={handleSelectBlockType}
                />
            </ModalShell>

            <ModalShell open={showCarouselEditor && !!editingBlock} onClose={() => setShowCarouselEditor(false)}
                title={`Edit ${getUiTypeFromBlock(editingBlock).replace(/_/g, " ") || "Block"}`}
                icon={editingBlock && (BLOCK_ICONS[getUiTypeFromBlock(editingBlock)] || <LayoutTemplate size={20} />)}
                footer={
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={async () => {
                                if (!editingBlock?.id) return;
                                await handleDeleteBlock(editingBlock.id);
                                setEditingBlock(null);
                                setShowCarouselEditor(false);
                            }}
                            className="h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 font-black uppercase tracking-widest text-[12px]"
                        >
                            Delete Block
                        </button>
                        <button onClick={saveEditor} className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[12px] shadow-xl">Save Changes</button>
                    </div>
                }>
                {editingBlock && (
                    <div className="space-y-6">
                        {(editingBlock.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="p-6 rounded-[32px] bg-card dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Instance #{idx + 1}</span>
                                    <button onClick={() => {
                                        if (typeof window !== "undefined") {
                                            const ok = window.confirm("Are you sure you want to delete this item?");
                                            if (!ok) return;
                                        }
                                        const items = editingBlock.items.filter((_: any, i: number) => i !== idx);
                                        setEditingBlock({ ...editingBlock, items });
                                    }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                                <InputField
                                    label={getUiTypeFromBlock(editingBlock) === "heading" ? "Heading Text" : "Primary Text"}
                                    value={item.title || ""}
                                    onChange={(e: any) => updateItem(idx, 'title', e.target.value)}
                                    placeholder="Enter text"
                                />
                                {!["heading", "paragraph", "modal_text", "business_hours", "contact_form", "email_collector", "phone_collector"].includes(getUiTypeFromBlock(editingBlock)) && (
                                    <InputField label="Endpoint URL" value={item.url || ""} onChange={(e: any) => updateItem(idx, 'url', e.target.value)} placeholder="https://..." />
                                )}
                                {["paragraph", "modal_text", "business_hours", "contact_form", "email_collector", "phone_collector"].includes(getUiTypeFromBlock(editingBlock)) && (
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Details</label>
                                        <textarea
                                            value={item.description || ""}
                                            onChange={(e: any) => updateItem(idx, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-sm font-medium text-slate-900 dark:text-white outline-none resize-none transition-all"
                                            placeholder="Write content..."
                                        />
                                    </div>
                                )}
                                {isMediaType(getUiTypeFromBlock(editingBlock)) && (
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <label className="flex-1 flex items-center gap-3 cursor-pointer group">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Media Link</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-tight">Tap to upload visual asset</p>
                                            </div>
                                            <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image_url', url); } }} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button onClick={() => setEditingBlock({ ...editingBlock, items: [...(editingBlock.items || []), getDefaultItemForType(getUiTypeFromBlock(editingBlock))] })}
                            className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all font-black text-xs uppercase tracking-widest">Add New Item</button>
                    </div>
                )}
            </ModalShell>
        </div>
    );
}