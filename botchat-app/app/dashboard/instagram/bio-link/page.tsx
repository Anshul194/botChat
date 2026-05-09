"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon, BarChart2,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon,
    ShoppingBag, SmartphoneNfc, Sparkles, ChevronLeft, ChevronRight,
    Settings, Zap, MoreHorizontal, PanelLeft, Columns, Search, Camera,
    Shuffle, Palette, KeyRound, ShieldAlert, CircleDot, Orbit, Megaphone, Code2, FileCode2, Info, Maximize2, Globe, Clock, Mail,
    Instagram, Twitter, Facebook, EyeOff, Phone, MessageCircle, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteBioPage, fetchBioPages } from "@/store/slices/bioSlice";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { VisualsLab, getTheme, isColorLight, ThemeEffectsLayer, ThemeAnimationStyles } from "./TemplateSystem";
import BlockMarketplaceContent from "./BlockMarketplaceContent";
import { PhonePreview } from "./PhonePreview";
import { PortfolioCanvas as SectionCard } from "./PortfolioCanvas";
import { BLOCK_ICONS, BLOCK_COLORS, getUiTypeFromBlock, mergeTabsPreservingItems } from "./builder-utils";

export interface BioProfile {
    link_id: string;
    title: string;
    description: string;
    url: string;
    is_enabled: string;
    settings?: any;
    theme?: string;
    avatar?: string;
    bio?: string;
    email_link?: string;
    contact_link?: string;
    id?: number | string;
}
export interface BioTab { id: number; title: string; is_active: number; sections: BioSection[]; }
interface BioSection { id: number; tab_id: number; title: string; type: string; is_active: number; blocks: BioBlock[]; }
interface BioBlock { id: number; section_id: number; type: string; is_active: number; items: any[]; location_url?: string; settings?: any; }

type PhaseIconType = React.ComponentType<{ size?: number; className?: string }>;

interface BioAdvancedSettings {
    // SEO
    seoBlock: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    seoOpenGraphImage: string;
    seoLanguage: string;
    // Branding
    displayBranding: boolean;
    brandingName: string;
    brandingUrl: string;
    brandingTextColor: string;
    // Pixels
    pixelFacebookEnabled: boolean;
    pixelGoogleEnabled: boolean;
    // UTM
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    // Visual
    backgroundType: string;
    background: string;
    textColor: string;
    fontSize: number;
    width: number;
    blockSpacing: number;
    hoverAnimation: string;
    // Protection
    password: string;
    sensitiveContentWarning: boolean;
    // Buttons
    enableShareButton: boolean;
    enableScrollButtons: boolean;
    // Branded button
    brandedButtonEnabled: boolean;
    brandedIconUrl: string;
    brandedModalTitle: string;
    brandedModalContent: string;
    // Directory
    enableDirectoryDisplaying: boolean;
    // Links
    projectName: string;
    splashPageName: string;
    leapLinkUrl: string;
    // Code
    customCss: string;
    customJs: string;
}

const DEFAULT_ADVANCED_SETTINGS: BioAdvancedSettings = {
    // SEO
    seoBlock: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoOpenGraphImage: "",
    seoLanguage: "en",
    // Branding
    displayBranding: true,
    brandingName: "",
    brandingUrl: "",
    brandingTextColor: "",
    // Pixels
    pixelFacebookEnabled: true,
    pixelGoogleEnabled: true,
    // UTM
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    // Visual
    backgroundType: "color",
    background: "",
    textColor: "",
    fontSize: 16,
    width: 8,
    blockSpacing: 2,
    hoverAnimation: "smooth",
    // Protection
    password: "",
    sensitiveContentWarning: false,
    // Buttons
    enableShareButton: true,
    enableScrollButtons: true,
    // Branded button
    brandedButtonEnabled: false,
    brandedIconUrl: "",
    brandedModalTitle: "",
    brandedModalContent: "",
    // Directory
    enableDirectoryDisplaying: true,
    // Links
    projectName: "None",
    splashPageName: "None",
    leapLinkUrl: "",
    // Code
    customCss: "",
    customJs: "",
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
            <div className="fixed inset-0 z-[10000] pointer-events-none">
                {/* ── MOBILE / TABLET OVERLAY ── */}
                <div className="xl:hidden pointer-events-auto absolute inset-0 z-[10000]">
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn("relative z-10 w-full h-full bg-white dark:bg-slate-950 flex flex-col shadow-2xl", maxWidthClassName)}>
                        <div className="flex items-center gap-4 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-20">
                            <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white flex-1 tracking-tight truncate">{title}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-48">{children}</div>
                        {footer && <div className="p-6 pb-12 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 fixed bottom-0 left-0 right-0 z-[10001] shadow-[0_-16px_32px_rgba(0,0,0,0.1)]">{footer}</div>}
                    </motion.div>
                </div>

                {/* ── DESKTOP SIDEBAR (INSPECTOR) ── */}
                <aside className="hidden xl:flex pointer-events-auto absolute right-0 top-14 bottom-0 w-[400px] flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden h-[calc(100vh-56px)] z-50">
                    <motion.div
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                {icon || <Edit3 size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest truncate">{title}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Bio Studio Editor</p>
                            </div>
                            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                            {children}
                        </div>

                        {footer && (
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </aside>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, icon, textarea, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            {icon} {label}
        </label>
        {textarea ? (
            <textarea
                {...props}
                className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-[14px] font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner min-h-[120px] resize-none"
            />
        ) : (
            <input
                {...props}
                className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-[14px] font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner"
            />
        )}
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
            checked ? "bg-primary shadow-lg shadow-primary/25" : "bg-slate-200 dark:bg-slate-800"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

const ToggleField = ({ label, desc, icon: Icon, checked, onChange, colorClass }: any) => (
    <div className="group flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-all">
        <div className="flex items-center gap-4">
            {Icon && (
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105", colorClass || "bg-slate-900")}>
                    <Icon size={18} />
                </div>
            )}
            <div className="flex-1 min-w-0 pr-4">
                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{label}</p>
                <p className="text-[11px] text-slate-500 font-bold mt-1 leading-relaxed opacity-70">{desc}</p>
            </div>
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
);

function BioLinkBuilderContent() {
    const searchParams = useSearchParams();
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
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
    const [isSavingBlock, setIsSavingBlock] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const [isArranging, setIsArranging] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activePanel, setActivePanel] = useState<"builder" | "preview">("builder");
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'delete' | 'duplicate' | 'reset' | 'toggle'; row: any | null }>({ isOpen: false, type: 'delete', row: null });

    const confirmAction = async () => {
        if (!actionModal.row) return;
        
        try {
            if (actionModal.type === 'delete') {
                if (actionModal.row.isBlock) {
                    await handleDeleteBlock(actionModal.row.id);
                    showModal("success", "Deleted", "Block removed successfully.");
                } else {
                    const linkId = actionModal.row.profileId || actionModal.row.pageId || actionModal.row.id;
                    if (!linkId) return;
                    await dispatch(deleteBioPage(linkId)).unwrap();
                    showModal("success", "Deleted", "Studio destroyed successfully.");
                    router.push('/dashboard/instagram/bio-links');
                }
            }
        } catch (err: any) {
            showModal("error", "Error", err || `Failed to ${actionModal.type} bio link.`);
        } finally {
            setActionModal({ isOpen: false, type: 'delete', row: null });
        }
    };

    const [view, setView] = useState("blocks");
    const [advancedSettings, setAdvancedSettings] = useState<BioAdvancedSettings>(DEFAULT_ADVANCED_SETTINGS);
    const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
    const [growthTab, setGrowthTab] = useState("seo");
    const [showPassword, setShowPassword] = useState(false);

    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";
    const shareSlug = profile?.url || profile?.url || instagramUsername;
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${shareSlug}&id=${selectedPageId}`
        : `/p?u=${shareSlug}&id=${selectedPageId}`;

    const previewTabs = React.useMemo(() => {
        if (!editingBlock) return tabs;

        // Merge items[0] into settings so the preview reflects the latest typed values
        const liveSettings = { ...(editingBlock.settings || {}), ...(editingBlock.items?.[0] || {}) };
        
        // Special handling for influencer blocks that store arrays in settings
        if (editingBlock.settings?.items) {
            liveSettings.items = editingBlock.settings.items;
        }

        delete (liveSettings as any).builder_type;
        const liveBlock = { ...editingBlock, settings: liveSettings };

        if (editingBlock._isNew) {
            return tabs.map((tab: any, tIdx: number) => ({
                ...tab,
                sections: tab.sections?.map((sec: any, sIdx: number) => ({
                    ...sec,
                    blocks: tIdx === 0 && sIdx === 0
                        ? [...(sec.blocks || []), { ...liveBlock, id: '__preview_new__', is_active: 1 }]
                        : sec.blocks
                }))
            }));
        }

        return tabs.map((tab: any) => ({
            ...tab,
            sections: tab.sections?.map((sec: any) => ({
                ...sec,
                blocks: sec.blocks?.map((b: any) => b.id === editingBlock.id ? liveBlock : b)
            }))
        }));
    }, [tabs, editingBlock]);

    // Live profile for global settings (background, layout, etc.)
    const previewProfile = React.useMemo(() => {
        if (!profile) return null;
        return {
            ...profile,
            settings: {
                ...profile.settings,
                ...advancedSettings, // Merge advanced settings state
                layoutStyle: profile.settings?.layoutStyle // This is already in profile.settings
            }
        };
    }, [profile, advancedSettings]);

    const currentTab = previewTabs.find(t => t.id === selectedTabId) || previewTabs[0];
    const flatBlocks = (previewTabs || []).flatMap((tab: any) => tab.sections || []).flatMap((sec: any) => sec.blocks || []);
    const layoutFilter = profile?.settings?.layoutStyle || 'standard';
    const visibleBlocks = flatBlocks.filter(b => {
        if (layoutFilter === 'all') return true;
        // If the block is not active and we are not in 'all', we might still want to show it?
        // Actually, the tabs in the screenshot are likely for layout-specific filtering or just categorization.
        return true;
    });
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
                if (requestedPageId) {
                    setSelectedPageId(requestedPageId);
                } else if (accs.length > 0) {
                    setSelectedPageId(accs[0].id.toString());
                } else {
                    // Navigate back or handle no page selected if needed, but we don't block
                    setSelectedPageId("fallback");
                }
            } catch {
                if (requestedPageId) setSelectedPageId(requestedPageId);
            }
        };
        fetchAccounts();
    }, [requestedPageId]);


    const fetchBuilderData = useCallback(async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            // Using the single page API as requested (Reference: curl .../bio/pages/33)
            const res = await api.get(`/bio/pages/${selectedPageId}`);
            const payload = res.data?.data || res.data;

            if (payload?.link_id || payload?.id) {
                // Ensure layoutStyle is synchronized with the 'layout' or 'template_name' from backend
                // Rule: if template_name is 'custom', we select 'standard'. Otherwise use the name.
                const rawLayout = payload.layout || payload.template_name;
                const layoutName = rawLayout === 'custom' ? 'standard' : rawLayout;

                if (layoutName) {
                    if (!payload.settings) payload.settings = {};
                    payload.settings.layoutStyle = layoutName;
                }

                // Map theme_name from backend to theme for frontend consistency
                const hydratedProfile = {
                    ...payload,
                    theme: payload.theme_name || payload.theme || payload.settings?.theme || "photo_aura",
                    niche: payload.niche || payload.settings?.niche || "photography"
                };

                setProfile(hydratedProfile);
                const linkId = payload.link_id || payload.id;

                // Sync advanced settings from profile settings (hydrated state)
                if (payload.settings) {
                    const s = payload.settings;
                    setAdvancedSettings({
                        seoBlock: !!s.seo?.block,
                        seoTitle: s.seo?.title || "",
                        seoDescription: s.seo?.meta_description || "",
                        seoKeywords: s.seo?.meta_keywords || "",
                        seoOpenGraphImage: s.seo?.opengraph_image || "",
                        seoLanguage: s.seo?.language || "en",
                        displayBranding: s.display_branding !== false,
                        brandingName: s.branding?.name || "",
                        brandingUrl: s.branding?.url || "",
                        brandingTextColor: s.branding?.text_color || "",
                        pixelFacebookEnabled: !!s.pixel_facebook,
                        pixelGoogleEnabled: !!s.pixel_google,
                        utmSource: s.utm?.source || "",
                        utmMedium: s.utm?.medium || "",
                        utmCampaign: s.utm?.campaign || "",
                        backgroundType: s.background_type || "color",
                        background: s.background || "",
                        textColor: s.text_color || "",
                        fontSize: s.font_size || 16,
                        width: s.width || 8,
                        blockSpacing: s.block_spacing || 2,
                        hoverAnimation: s.hover_animation || "smooth",
                        password: s.password || "",
                        sensitiveContentWarning: !!s.sensitive_content,
                        enableShareButton: s.share_is_enabled !== false,
                        enableScrollButtons: s.scroll_buttons_is_enabled !== false,
                        brandedButtonEnabled: !!s.branded_button_is_enabled,
                        brandedIconUrl: s.branded_button_icon || "",
                        brandedModalTitle: s.branded_button_title || "",
                        brandedModalContent: s.branded_button_content || "",
                        enableDirectoryDisplaying: s.directory_is_enabled !== false,
                        projectName: s.project_name || "None",
                        splashPageName: s.splash_page_name || "None",
                        leapLinkUrl: s.leap_link_url || "",
                        customCss: s.custom_css || "",
                        customJs: s.custom_js || "",
                    });
                }

                // Fetch blocks for this specific page
                const bRes = await api.get(`/bio/pages/${linkId}/blocks`);
                const bData = (bRes.data?.data && bRes.data.data.length > 0) ? bRes.data.data : (payload.blocks || []);
                const mappedBlocks = bData.map((b: any) => ({
                    ...b,
                    id: b.biolink_block_id || b.id,
                }));

                // Ensure we have a tab/section structure to show blocks in panel/canvas
                const activeTabs = payload.tabs?.length > 0 ? payload.tabs : [{ id: 1, title: "Main", is_active: 1, sections: [{ id: 1, tab_id: 1, title: "Standard", type: "standard", is_active: 1, blocks: [] }] }];

                const finalTabs = activeTabs.map((tab: any, idx: number) => {
                    // For now, if it's the first tab, inject the fetched blocks into the first section
                    if (idx === 0) {
                        const sections = tab.sections?.length > 0 ? tab.sections : [{ id: 1, tab_id: tab.id, title: "Standard", type: "standard", is_active: 1, blocks: [] }];
                        sections[0].blocks = mappedBlocks;
                        return { ...tab, sections };
                    }
                    return tab;
                });

                setTabs(finalTabs);
                if (finalTabs.length > 0 && !selectedTabId) setSelectedTabId(finalTabs[0].id);
            }
            else {
                setProfile(null);
                setTabs([]);
                setSelectedTabId(null);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setProfile(null);
            setTabs([]);
            setSelectedTabId(null);
        }
        finally { setIsLoading(false); }
    }, [selectedPageId, selectedTabId]);

    useEffect(() => { fetchBuilderData(); }, [fetchBuilderData]);

    useEffect(() => {
        if (!profile) {
            setAdvancedSettings(DEFAULT_ADVANCED_SETTINGS);
            return;
        }
        // Hydrate all settings from the profile.settings object (API response)
        const s = profile.settings || {};
        setAdvancedSettings(prev => ({
            ...DEFAULT_ADVANCED_SETTINGS,
            // SEO
            seoBlock: s.seo?.block ?? prev.seoBlock,
            seoTitle: s.seo?.title ?? (profile.title || ""),
            seoDescription: s.seo?.meta_description ?? prev.seoDescription,
            seoKeywords: s.seo?.meta_keywords ?? prev.seoKeywords,
            seoOpenGraphImage: s.seo?.opengraph_image ?? prev.seoOpenGraphImage,
            seoLanguage: s.seo?.language ?? prev.seoLanguage,
            // Branding
            displayBranding: s.display_branding ?? prev.displayBranding,
            brandingName: s.branding?.name ?? profile.title ?? prev.brandingName,
            brandingUrl: s.branding?.url ?? (typeof window !== "undefined" ? window.location.origin : ""),
            brandingTextColor: s.branding?.text_color ?? prev.brandingTextColor,
            // UTM
            utmSource: s.utm?.source ?? prev.utmSource,
            utmMedium: s.utm?.medium ?? prev.utmMedium,
            // Visual
            backgroundType: s.background_type ?? prev.backgroundType,
            background: s.background ?? prev.background,
            textColor: s.text_color ?? prev.textColor,
            fontSize: s.font_size ?? prev.fontSize,
            width: s.width ?? prev.width,
            blockSpacing: s.block_spacing ?? prev.blockSpacing,
            hoverAnimation: s.hover_animation ?? prev.hoverAnimation,
            // Toggles
            enableShareButton: s.share_is_enabled ?? prev.enableShareButton,
            enableScrollButtons: s.scroll_buttons_is_enabled ?? prev.enableScrollButtons,
            password: s.password ?? prev.password,
            sensitiveContentWarning: s.sensitive_content ?? prev.sensitiveContentWarning,
            // Branded button
            brandedButtonEnabled: s.branded_button_is_enabled ?? prev.brandedButtonEnabled,
            brandedIconUrl: s.branded_button_icon ?? prev.brandedIconUrl,
            brandedModalTitle: s.branded_button_title ?? prev.brandedModalTitle,
            brandedModalContent: s.branded_button_content ?? prev.brandedModalContent,
        }));
    }, [profile]);

    useEffect(() => {
        // Auto-close specific block editors when switching between top-level Phases (Info, Visuals, Content, Growth)
        setShowCarouselEditor(false);
        setShowAddBlock(false);
        setEditingBlock(null);
    }, [view]);

    const handleUpdateProfile = async (updates: Partial<BioProfile>) => {
        if (!profile) return;
        const previousProfile = profile;
        const nextProfile = { ...profile, ...updates };
        setProfile(nextProfile);
        const targetId = profile.id || profile.link_id;
        try {
            await api.put(`/bio-builder/profile/${targetId}`, updates);
            // Optionally show a subtle success indicator or nothing if it's too frequent
            // showModal("success", "Saved", "Theme updated successfully.");
        } catch {
            setProfile(previousProfile);
            showModal("error", "Error", "Failed to update profile.");
        }
    };

    const handleApplyTemplate = async (templateId: string) => {
        if (!profile) return;
        const linkId = profile.link_id || profile.id;
        try {
            // Local update for immediate feedback
            setProfile(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    settings: {
                        ...(prev.settings || {}),
                        layoutStyle: templateId
                    }
                };
            });

            await api.post(`/bio/pages/${linkId}/apply-template`, {
                template: templateId
            });
            await fetchBuilderData();
            showModal("success", "Template Applied", `Successfully switched to ${templateId} layout.`);
        } catch {
            showModal("error", "Error", "Failed to apply template.");
        }
    };

    const handleApplyBioTheme = async (themeName: string, niche: string) => {
        if (!profile) return;
        const linkId = profile.link_id || profile.id;
        
        try {
            // Instant update for PhonePreview
            setProfile(prev => prev ? { ...prev, theme: themeName } : prev);
            
            await api.post(`/bio/pages/${linkId}/apply-template`, {
                template: "custom",
                theme_name: themeName,
                niche: niche
            });
            
            // Refresh data to ensure everything is synced
            await fetchBuilderData();
            showModal("success", "Theme Applied", `Successfully applied the ${themeName.replace(/_/g, ' ')} theme.`);
        } catch (error) {
            console.error("Failed to apply theme:", error);
            showModal("error", "Error", "Failed to apply theme. Please try again.");
            await fetchBuilderData();
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
            const res = await api.get("/bio/pages");
            const pages = res.data?.data || res.data || [];
            const payload = pages.find((p: any) => String(p.link_id) === selectedPageId || p.url === selectedPageId);
            latestTabs = payload?.tabs || tabs;
        } catch {
            // If refresh fails, continue with current local state.
        }

        let resolvedTabId = currentTab?.id || selectedTabId || latestTabs[0]?.id;

        if (!resolvedTabId) {
            showModal("error", "Error", "Could not resolve a tab for adding blocks.");
            return null;
        }

        try {
            const res = await api.get("/bio/pages");
            const pages = res.data?.data || res.data || [];
            const payload = pages.find((p: any) => String(p.link_id) === selectedPageId || p.url === selectedPageId);
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

        showModal("error", "Error", "Content structure is missing. Please re-load the page.");
        return null;
    };

    const openBlockMarketplace = async (sectionId?: number) => {
        if (!profile || !selectedPageId) {
            showModal("error", "Not Ready", "We couldn't resolve your bio profile. Please re-select it from the list.");
            return;
        }

        if (sectionId) {
            setTargetSectionId(sectionId);
            setShowAddBlock(true);
            return;
        }

        const existingSectionId = currentTab?.sections?.[0]?.id || null;
        setTargetSectionId(existingSectionId);
        setShowAddBlock(true);
    };



    const handleAddBlock = async (type: string, settings: any = {}) => {
        if (!profile || isSavingBlock) return;
        setIsSavingBlock(true);
        const linkId = profile.link_id || profile.id;

        // Extract location_url (some modules have it at top level)
        const locationUrl = settings.location_url || settings.url || "";

        // Ensure required fields like 'name' or 'text' are present
        const processedSettings = { ...settings };

        // Use a fallback if all name/text fields are empty to pass validation
        const fallbackName = type.charAt(0).toUpperCase() + type.slice(1);

        processedSettings.name = (processedSettings.name || processedSettings.text || processedSettings.label || fallbackName).trim();
        processedSettings.text = (processedSettings.text || processedSettings.name).trim();

        // Location URL placeholder if empty for link-like types
        let finalLocationUrl = locationUrl;
        if (!finalLocationUrl && ["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) {
            finalLocationUrl = "https://";
        }

        // Prepare payload according to backend expectations (Reference 1-15)
        const payload: any = {
            link_id: linkId,
            type: type,
            settings: processedSettings,
        };

        // Standard, Image, and Embeds use top-level location_url (Reference 27, 197, 467)
        if (["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) {
            payload.location_url = finalLocationUrl;
            // Clean up to avoid duplication
            delete payload.settings.url;
            delete payload.settings.location_url;
        }

        try {
            await api.post("/bio/blocks", payload);

            // After successful creation, call the specific GET blocks API for this page
            const blocksRes = await api.get(`/bio/pages/${linkId}/blocks`);
            const refreshedBlocks = (blocksRes.data?.data || blocksRes.data || []).map((b: any) => ({
                ...b,
                id: b.biolink_block_id || b.id
            }));

            // Sync the refreshed blocks into the tabs state
            setTabs(prev => prev.map((tab, idx) => {
                if (idx === 0) {
                    const sections = tab.sections?.length > 0 ? tab.sections : [{ id: 1, tab_id: tab.id, title: "Standard", type: "standard", is_active: 1, blocks: [] }];
                    sections[0].blocks = refreshedBlocks;
                    return { ...tab, sections };
                }
                return tab;
            }));

            await fetchBuilderData(); // Also refresh overall data
            setIsSavingBlock(false);
            setShowAddBlock(false);
            setShowCarouselEditor(false);
            setEditingBlock(null);
            showModal("success", "Success", "Block created successfully.");
        } catch (err: any) {
            console.error("Failed to add block via /bio/blocks", err);
            setIsSavingBlock(false);
            const msg = err.response?.data?.message || "Failed to add block.";
            showModal("error", "Error", msg);
        }
    };

    const handleSelectBlockType = async (type: string, defaults?: any) => {
        const mockBlock = {
            id: "new",
            type: type,
            settings: defaults || {},
            _uiType: type,
            _isNew: true,
            items: defaults ? [{ ...defaults }] : []
        };
        setEditingBlock(mockBlock);
        setShowAddBlock(false);
        setShowCarouselEditor(true);
    };

    const openEditor = (block: any) => {
        const uiType = getUiTypeFromBlock(block, uiTypeOverrides);

        // Deep clone settings so edits don't mutate original block
        const settings = JSON.parse(JSON.stringify(block.settings || {}));

        if (uiType === "socials") {
            if (Array.isArray(settings.socials)) { settings.socials = {}; }
            if (settings.socials && typeof settings.socials === "object") {
                const px: Record<string, string> = { facebook: "facebook.com/", instagram: "instagram.com/", twitter: "x.com/", youtube: "youtube.com/", tiktok: "tiktok.com/@", linkedin: "linkedin.com/", discord: "discord.gg/", telegram: "t.me/" };
                Object.entries(settings.socials).forEach(([k, v]) => {
                    if (typeof v === "string" && px[k]) {
                        let cln = v.replace(/^https?:\/\/(www\.)?/, "");
                        if (cln.startsWith(px[k])) cln = cln.substring(px[k].length);
                        settings.socials[k] = cln;
                    }
                });
            }
        }

        // For embed/link types, map the top-level location_url into settings so the form shows it
        if (block.location_url && block.location_url !== "https://") {
            settings.url = block.location_url;
            settings.location_url = block.location_url;
        }

        // For heading blocks: ensure 'title' is synced with 'text' for the form display
        if (uiType === "heading" && settings.title && !settings.text) {
            settings.text = settings.title;
        }

        // For paragraph blocks: ensure 'description' is synced with 'text' for the form
        if (uiType === "paragraph" && settings.description && !settings.text) {
            settings.text = settings.description;
        }

        const items = [{ ...settings, builder_type: uiType }];

        setEditingBlock({
            ...block,
            _uiType: uiType,
            _originalSettings: { ...block.settings },
            items
        });
        setShowCarouselEditor(true);
    };

    const handleDeleteBlock = async (id: number | string) => {
        if (id === "new") {
            setShowCarouselEditor(false);
            setEditingBlock(null);
            return;
        }

        // Local-first delete
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
            await api.delete(`/bio/blocks/${id}`);
        } catch {
            showModal("error", "Error", "Failed to delete block on server.");
            await fetchBuilderData();
        }
    };

    const saveEditor = async () => {
        if (!editingBlock || isSavingBlock) return;
        setIsSavingBlock(true);

        // Data lives in editingBlock.items[0] from the editor form
        const editorSettings = editingBlock.items?.[0] || editingBlock.settings || {};

        if (editingBlock._isNew) {
            await handleAddBlock(editingBlock._uiType, editorSettings);
            return;
        }

        const uiType = getUiTypeFromBlock(editingBlock, uiTypeOverrides);

        // Build a CLEAN settings object ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â strip internal/editor-only fields
        const cleanSettings = { ...editorSettings };
        delete cleanSettings.builder_type;
        delete cleanSettings._uiType;
        delete cleanSettings.url;          // url goes as top-level location_url
        delete cleanSettings.location_url; // location_url goes at top level

        if (uiType === "socials" && cleanSettings.socials && typeof cleanSettings.socials === "object") {
            const prefixes: Record<string, string> = {
                facebook: "https://facebook.com/", instagram: "https://instagram.com/", twitter: "https://x.com/",
                youtube: "https://youtube.com/", tiktok: "https://tiktok.com/@", linkedin: "https://linkedin.com/",
                discord: "https://discord.gg/", telegram: "https://t.me/",
            };
            const rebuiltSocials: Record<string, string> = {};
            Object.entries(cleanSettings.socials).forEach(([key, val]) => {
                if (typeof val === "string" && val.trim() !== "") {
                    if (val.startsWith("http") || !prefixes[key]) {
                        rebuiltSocials[key] = val;
                    } else {
                        rebuiltSocials[key] = prefixes[key] + val;
                    }
                }
            });
            cleanSettings.socials = rebuiltSocials;
        }

        // Build the payload per the Biolink Blocks API
        const payload: any = {
            link_id: profile?.link_id || profile?.id,
            type: uiType,
            settings: cleanSettings
        };

        // For types that use top-level location_url
        const locationUrlTypes = ["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"];
        if (locationUrlTypes.includes(uiType)) {
            const locationUrl = editorSettings.url || editorSettings.location_url || "";
            if (locationUrl) {
                payload.location_url = locationUrl;
            }
        }

        // Optimistic local update ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â merge edited settings into the block
        const mergedSettings = { ...(editingBlock._originalSettings || editingBlock.settings), ...cleanSettings };
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).map((block) =>
                        block.id === editingBlock.id
                            ? { ...block, settings: mergedSettings, location_url: payload.location_url || block.location_url }
                            : block
                    ),
                })),
            }))
        );
        setUiTypeOverrides((prev) => ({ ...prev, [editingBlock.id]: uiType }));
        // Note: we don't close immediately now, we wait for API success

        try {
            await api.put(`/bio/blocks/${editingBlock.id}`, payload);
            await fetchBuilderData();
            showModal("success", "Saved", "Block updated successfully.");
            // Show success state briefly before closing
            setTimeout(() => {
                setIsSavingBlock(false);
                setShowCarouselEditor(false);
                setEditingBlock(null);
            }, 500);
        }
        catch {
            setIsSavingBlock(false);
            showModal("error", "Error", "Failed to update block on server.");
            await fetchBuilderData();
        }
    };

    const updateItem = (idx: number, field: string, value: any) => {
        if (!editingBlock) return;
        const items = [...(editingBlock.items || [])];
        items[idx] = { ...items[idx], [field]: value };
        // Patch settings too so previewTabs reflects the change in real-time.
        // Do NOT call syncBlockItemsLocally here — that triggers setTabs which
        // causes a parent re-render and steals keyboard focus after every keystroke.
        const newSettings = { ...(editingBlock.settings || {}), [field]: value };
        setEditingBlock({ ...editingBlock, items, settings: newSettings });
    };

    // For blocks that store data in settings (not items) — e.g. aesthetic_influencer
    const updateBlockSettings = (field: string, value: any) => {
        if (!editingBlock) return;
        const newSettings = { ...(editingBlock.settings || {}), [field]: value };
        // Also sync into items[0] so saveEditor's `editingBlock.items?.[0]` picks it up
        const newItems = (editingBlock.items || []).map((it: any, i: number) =>
            i === 0 ? { ...it, ...newSettings } : it
        );
        const updated = { ...editingBlock, settings: newSettings, items: newItems };
        setEditingBlock(updated);
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).map((block) =>
                        block.id === editingBlock.id ? { ...block, settings: newSettings } : block
                    ),
                })),
            }))
        );
    };

    const handleReorderBlocks = async (newTabs: any) => {
        if (!profile) return;
        setTabs(newTabs);

        const allBlocks: any[] = [];
        newTabs.forEach((tab: any) => {
            tab.sections?.forEach((section: any) => {
                section.blocks?.forEach((block: any, index: number) => {
                    allBlocks.push({ id: block.id, order: index });
                });
            });
        });

        try {
            await api.post("/bio/blocks/reorder", {
                link_id: profile.link_id || profile.id,
                blocks: allBlocks
            });
        } catch {
            fetchBuilderData();
        }
    };

    // Replace handleReorderSections if it existed with handleReorderBlocks
    const handleReorderSections = handleReorderBlocks as any;

    const handleUploadImage = async (file: File) => {
        setIsUploadingImage(true);
        try {
            const fd = new FormData(); fd.append("image", file);
            // This endpoint might also change? Assuming /bio/upload-image for now
            const res = await api.post("/bio-builder/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
            const url = res.data?.url || res.data?.data?.url || res.data || null;
            return url;
        } catch (err) {
            console.error("Image upload failed:", err);
            showModal("error", "Error", "Failed to upload image.");
            return null;
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleShareLink = () => { navigator.clipboard.writeText(publicUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };

    const handleSaveAdvanced = async () => {
        if (!profile) return;
        const linkId = profile.link_id || profile.id;
        setIsSavingAdvanced(true);
        try {
            // Build the exact payload expected by PUT /bio/pages/{link_id}
            const payload = {
                url: profile.url,
                is_enabled: true,
                biolink_theme_id: (profile as any).biolink_theme_id ?? null,
                settings: {
                    seo: {
                        block: advancedSettings.seoBlock,
                        title: advancedSettings.seoTitle,
                        meta_description: advancedSettings.seoDescription,
                        meta_keywords: advancedSettings.seoKeywords,
                        opengraph_image: advancedSettings.seoOpenGraphImage,
                        language: advancedSettings.seoLanguage,
                    },
                    branding: {
                        name: advancedSettings.brandingName,
                        url: advancedSettings.brandingUrl,
                    },
                    display_branding: advancedSettings.displayBranding,
                    utm: {
                        source: advancedSettings.utmSource,
                        medium: advancedSettings.utmMedium,
                    },
                    background_type: advancedSettings.backgroundType,
                    background: advancedSettings.background,
                    text_color: advancedSettings.textColor,
                    font_size: advancedSettings.fontSize,
                    width: advancedSettings.width,
                    block_spacing: advancedSettings.blockSpacing,
                    hover_animation: advancedSettings.hoverAnimation,
                    share_is_enabled: advancedSettings.enableShareButton,
                    scroll_buttons_is_enabled: advancedSettings.enableScrollButtons,
                    password: advancedSettings.password || null,
                    sensitive_content: advancedSettings.sensitiveContentWarning,
                    branded_button_is_enabled: advancedSettings.brandedButtonEnabled,
                    branded_button_icon: advancedSettings.brandedIconUrl,
                    branded_button_title: advancedSettings.brandedModalTitle,
                    branded_button_content: advancedSettings.brandedModalContent,
                },
            };
            await api.put(`/bio/pages/${linkId}`, payload);
            // Refresh profile to sync hydrated state
            await fetchBuilderData();
            showModal("success", "Saved", "Growth settings saved successfully.");
        } catch {
            showModal("error", "Error", "Failed to save advanced settings.");
        } finally {
            setIsSavingAdvanced(false);
        }
    };

    const PHASES: Array<{ id: string; label: string; desc: string; hint: string; Icon: PhaseIconType; details: string[] }> = [
        { id: "identity", label: "1. Info", desc: "Name & Bio", hint: "Set your title, avatar, and short intro.", Icon: User, details: ["Upload your profile image.", "Add your brand title.", "Write a short bio visitors understand fast."] },
        { id: "visuals", label: "2. Style", desc: "Colors & Design", hint: "Pick the look, theme, and visual mood.", Icon: Palette, details: ["Choose the page look and feel.", "Match colors to your brand.", "Preview the design before launch."] },
        { id: "blocks", label: "3. Content", desc: "Links & Photos", hint: "Add sections, buttons, and media blocks.", Icon: Layers, details: ["Create content sections.", "Add links, photos, or products.", "Arrange items in the order you want."] },
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

    if (!selectedPageId && !requestedPageId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <div className="text-center space-y-4">
                    <Loader2 size={32} className="mx-auto text-primary animate-spin" />
                    <p className="text-slate-500 font-medium">Initializing Builder...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-transparent font-sans selection:bg-primary/10 flex flex-col relative overflow-hidden"
            style={{ background: 'var(--app-surface-bg, var(--background))' }}>

            {/* ── STABLE TOP BAR ── */}
            {(!showAddBlock && !showCarouselEditor) && (
                <header className="relative z-50 h-14 xl:h-16 flex items-center justify-between px-4 xl:px-8 bg-white/95 dark:bg-black/80 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
                <div className="flex items-center gap-2 xl:gap-4 min-w-0">
                    <button 
                        onClick={() => window.location.href = '/dashboard/instagram/bio-links'}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="hidden sm:flex w-8 h-8 rounded-xl bg-primary items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="block text-xs xl:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Studio</span>
                            <span className="hidden xl:block text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Bio link builder</span>
                        </div>
                    </div>
                </div>

                {/* ── CENTRAL FLOATING PHASE DOCK (DESKTOP) ── */}
                <div className="hidden xl:block absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[100]">
                    <div className="bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-3xl rounded-full p-1 flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-xl">
                        {PHASES.map((p, idx) => (
                            <button key={p.id} onClick={() => setView(p.id)} className={cn(
                                "h-9 px-5 rounded-full flex items-center justify-center gap-2 transition-all relative group",
                                view === p.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm z-10" : "text-slate-500 hover:text-slate-900 hover:bg-white/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                            )}>
                                <p.Icon size={14} className={cn("transition-transform duration-300", view === p.id ? "scale-110" : "scale-100")} />
                                <span className="inline text-[10px] font-black uppercase tracking-widest">{p.label.split('.')[1]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2 xl:gap-3 relative z-[110]">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {instagramUsername}
                    </div>

                    {/* Analytics Button */}
                    <button 
                        onClick={() => router.push(`/dashboard/instagram/bio-links/analytics?page=${selectedPageId}`)}
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="View Analytics"
                    >
                        <BarChart2 size={18} />
                    </button>

                    {/* Preview Toggle Button (Eye) */}
                    <button 
                        onClick={() => setActivePanel(activePanel === 'builder' ? 'preview' : 'builder')}
                        className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm xl:hidden",
                            activePanel === 'preview' ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white"
                        )}
                        title={activePanel === 'preview' ? "Back to Editor" : "Live Preview"}
                    >
                        {activePanel === 'preview' ? <Edit3 size={18} /> : <Eye size={18} />}
                    </button>

                    <button onClick={handleShareLink} className="h-9 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        {copiedLink ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                        <span className="hidden sm:inline">{copiedLink ? "COPIED" : "SHARE"}</span>
                    </button>

                    <a 
                        href={publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-9 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <ExternalLink size={14} />
                        <span className="hidden sm:inline">VIEW LIVE</span>
                    </a>
                </div>
            </header>
            )}

            {/* ── MOBILE PHASE DOCK (SCROLLABLE BAR) ── */}
            {(!showAddBlock && !showCarouselEditor) && (
                <div className="xl:hidden bg-white/80 dark:bg-black/40 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0">
                <div className="flex items-center gap-1 p-2 min-w-max">
                    {PHASES.map((p) => (
                        <button key={p.id} onClick={() => setView(p.id)} className={cn(
                            "h-10 px-4 rounded-full flex items-center justify-center gap-2 transition-all",
                            view === p.id ? "bg-primary text-white shadow-lg" : "text-slate-500 dark:text-slate-400"
                        )}>
                            <p.Icon size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{p.label.split('.')[1]}</span>
                        </button>
                    ))}
                </div>
            </div>
            )}

            {/* CREATOR WORKSPACE */}
            <div className="relative flex-1 flex overflow-hidden">
                {/* LEFT PANEL: TOOLS & PHASES */}
                <aside className={cn(
                    "bg-white dark:bg-slate-950 flex flex-col h-full z-20 transition-all duration-700 ease-in-out border-r border-slate-200 dark:border-white/5 shadow-2xl shrink-0",
                    activePanel === "preview" ? "hidden xl:flex" : "flex w-full xl:flex-1",
                )}>
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32">

                        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 px-4 py-3 shadow-sm">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Phase {currentPhaseNumber} of {PHASES.length}</p>
                                <p className="text-[13px] font-bold text-slate-900 dark:text-white mt-1">{currentPhase.desc}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{completionPercent}%</span>
                                {nextPhase && (
                                    <button onClick={() => setView(nextPhase.id)} className="h-8 px-4 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* PHASE CONTENT AREA */}
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
                                                    <button onClick={() => setView('blocks')} className="h-11 px-8 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                                        Next: Add Content <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {view === "blocks" && (
                                    <div className="space-y-0 pb-28 sm:pb-32">

                                        {/* ── Shopify-style current layout badge ── */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    <Layers size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Content</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{profile?.settings?.layoutStyle || 'Standard'} Layout</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setView('visuals')}
                                                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 flex items-center gap-1.5 transition-all"
                                            >
                                                <Palette size={12} /> Change Style
                                            </button>
                                        </div>

                                        {/* ── Shopify-style block list ── */}
                                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">

                                            {/* Section Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        <Grid size={12} />
                                                    </div>
                                                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">Blocks</span>
                                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{visibleBlocks.length}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setIsArranging(v => !v)}
                                                        className={cn("h-7 px-2.5 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1",
                                                            isArranging
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                                        )}
                                                    >
                                                        <GripVertical size={12} />
                                                        {isArranging ? "Done" : "Reorder"}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Block Rows */}
                                            {(!currentTab || visibleBlocks.length === 0) ? (
                                                <div className="py-16 text-center flex flex-col items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                                        <Plus size={24} />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-400">No blocks yet</p>
                                                    <p className="text-[11px] text-slate-400 max-w-[200px]">Add a block to start building your bio link page</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {visibleBlocks.map((block: any, idx: number) => {
                                                        const uiType = getUiTypeFromBlock(block, uiTypeOverrides);
                                                        const color = BLOCK_COLORS[uiType] || "#6B7280";
                                                        const icon = BLOCK_ICONS[uiType] || <LayoutTemplate size={14} />;
                                                        const isInactive = block.is_active == 0 || block.is_Enabled == 0 || block.is_enabled == 0;
                                                        const label = block.settings?.title || block.settings?.name || block.settings?.text || uiType.replace(/_/g, " ");

                                                        return (
                                                            <motion.div
                                                                layout
                                                                key={block.id}
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className={cn(
                                                                    "group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 relative",
                                                                    isInactive && "opacity-50"
                                                                )}
                                                                onClick={(e) => {
                                                                    const target = e.target as HTMLElement;
                                                                    if (target.closest("button, [data-no-click]")) return;
                                                                    openEditor(block);
                                                                }}
                                                            >
                                                                {/* Drag Handle */}
                                                                <div className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-300 dark:text-slate-600 shrink-0 cursor-grab active:cursor-grabbing group-hover:text-slate-400 transition-colors">
                                                                    <GripVertical size={18} />
                                                                </div>

                                                                {/* Block Icon */}
                                                                <div
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                                                                    style={{ backgroundColor: `${color}18`, color }}
                                                                >
                                                                    <div className="[&>*]:w-[14px] [&>*]:h-[14px]">{icon}</div>
                                                                </div>

                                                                {/* Label & type */}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate capitalize">
                                                                        {label}
                                                                    </p>
                                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                                                                        {uiType.replace(/_/g, " ")}
                                                                    </p>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-2 shrink-0" data-no-click>
                                                                    {/* Visibility toggle */}
                                                                    <button
                                                                        data-no-click
                                                                        onClick={async (e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                            // Optimistic update — flip immediately
                                                                            const newStatus = isInactive ? 1 : 0;
                                                                            const applyStatus = (s: number) => setTabs(prev => prev.map(tab => ({
                                                                                ...tab,
                                                                                sections: (tab.sections || []).map(sec => ({
                                                                                    ...sec,
                                                                                    blocks: (sec.blocks || []).map(b => b.id === block.id ? { ...b, is_active: s, is_Enabled: s, is_enabled: s } : b)
                                                                                }))
                                                                            })));
                                                                            applyStatus(newStatus);
                                                                            // Close editor if disabling
                                                                            if (newStatus === 0 && editingBlock?.id === block.id) {
                                                                                setEditingBlock(null);
                                                                                setShowCarouselEditor(false);
                                                                            }
                                                                            // API call
                                                                            try {
                                                                                const res = await api.patch(`/bio/blocks/${block.id}/toggle`);
                                                                                // Normalize: API may return boolean true/false or integer 1/0
                                                                                const raw = res.data?.data?.is_enabled ?? res.data?.data?.is_Enabled ?? newStatus;
                                                                                const serverStatus = raw === true ? 1 : raw === false ? 0 : Number(raw);
                                                                                applyStatus(serverStatus);
                                                                                if (serverStatus === 0 && editingBlock?.id === block.id) {
                                                                                    setEditingBlock(null);
                                                                                    setShowCarouselEditor(false);
                                                                                }
                                                                            } catch (err) {
                                                                                console.error("Toggle block failed:", err);
                                                                                applyStatus(isInactive ? 0 : 1); // revert
                                                                            }
                                                                        }}
                                                                        title={isInactive ? "Show block" : "Hide block"}
                                                                        className={cn(
                                                                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                                                            isInactive
                                                                                ? "text-amber-400 dark:text-amber-500 hover:text-amber-600"
                                                                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100"
                                                                        )}
                                                                    >
                                                                        {isInactive ? <EyeOff size={14} /> : <Eye size={14} />}
                                                                    </button>

                                                                    {/* Delete */}
                                                                    <button
                                                                        data-no-click
                                                                        onClick={e => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                                                                        title="Delete block"
                                                                        className="w-7 h-7 rounded-md flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>

                                                                    {/* Chevron */}
                                                                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Add block row — Shopify style */}
                                            <div className="border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    onClick={() => openBlockMarketplace()}
                                                    className="w-full flex items-center gap-3 px-4 py-3.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                                                >
                                                    <div className="w-6 h-6 rounded-md border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-primary group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                        <Plus size={12} />
                                                    </div>
                                                    Add block
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {view === "visuals" && (
                                    <VisualsLab
                                        profile={profile}
                                        updateProfile={handleUpdateProfile}
                                        applyTemplate={handleApplyTemplate}
                                        applyBioTheme={handleApplyBioTheme}
                                    />
                                )}

                                {view === "advanced" && (() => {
                                    const GROWTH_TABS = [
                                        { id: "seo", label: "SEO", icon: Globe, color: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800", text: "text-emerald-600 dark:text-emerald-400", light: "bg-emerald-50 dark:bg-emerald-950/30" },
                                        { id: "branding", label: "Branding", icon: Shuffle, color: "violet", bg: "bg-violet-500", ring: "ring-violet-200 dark:ring-violet-800", text: "text-violet-600 dark:text-violet-400", light: "bg-violet-50 dark:bg-violet-950/30" },
                                        { id: "pixels", label: "Pixels", icon: CircleDot, color: "blue", bg: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-800", text: "text-blue-600 dark:text-blue-400", light: "bg-blue-50 dark:bg-blue-950/30" },
                                        { id: "utm", label: "UTM", icon: Grid, color: "amber", bg: "bg-amber-500", ring: "ring-amber-200 dark:ring-amber-800", text: "text-amber-600 dark:text-amber-400", light: "bg-amber-50 dark:bg-amber-950/30" },
                                        { id: "protection", label: "Protection", icon: ShieldAlert, color: "red", bg: "bg-red-500", ring: "ring-red-200 dark:ring-red-800", text: "text-red-600 dark:text-red-400", light: "bg-red-50 dark:bg-red-950/30" },
                                        { id: "popup", label: "Popup", icon: SmartphoneNfc, color: "fuchsia", bg: "bg-fuchsia-500", ring: "ring-fuchsia-200 dark:ring-fuchsia-800", text: "text-fuchsia-600 dark:text-fuchsia-400", light: "bg-fuchsia-50 dark:bg-fuchsia-950/30" },
                                        { id: "more", label: "Advanced", icon: Orbit, color: "slate", bg: "bg-slate-500", ring: "ring-slate-200 dark:ring-slate-700", text: "text-slate-600 dark:text-slate-400", light: "bg-slate-50 dark:bg-slate-800/30" },
                                    ];
                                    const activeGT = GROWTH_TABS.find(t => t.id === growthTab) || GROWTH_TABS[0];
                                    const GtIcon = activeGT.icon;

                                    return (
                                        <div className="flex flex-col xl:flex-row gap-6 min-h-[600px]">
                                            {/* ── GROWTH SIDEBAR (DESKTOP) / TABS (MOBILE) ── */}
                                            <div className="xl:w-56 shrink-0">
                                                <div className="xl:sticky xl:top-0 space-y-1">
                                                    <div className="hidden xl:block px-3 mb-4">
                                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Workstation</h3>
                                                    </div>
                                                    
                                                    {/* Mobile Horizontal Scroll */}
                                                    <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
                                                        {GROWTH_TABS.map((tab) => (
                                                            <button key={tab.id} onClick={() => setGrowthTab(tab.id)}
                                                                className={cn(
                                                                    "flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all whitespace-nowrap",
                                                                    growthTab === tab.id
                                                                        ? `${tab.light} border-transparent ring-2 ${tab.ring}`
                                                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                                                )}>
                                                                <tab.icon size={14} className={cn(growthTab === tab.id ? tab.text : "text-slate-400")} />
                                                                <span className={cn("text-[10px] font-black uppercase tracking-widest", growthTab === tab.id ? tab.text : "text-slate-500")}>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Desktop Vertical Sidebar */}
                                                    <div className="hidden xl:flex flex-col gap-1">
                                                        {GROWTH_TABS.map((tab) => (
                                                            <button key={tab.id} onClick={() => setGrowthTab(tab.id)}
                                                                className={cn(
                                                                    "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left relative overflow-hidden",
                                                                    growthTab === tab.id
                                                                        ? `${tab.light} shadow-sm`
                                                                        : "hover:bg-slate-50 dark:hover:bg-white/5"
                                                                )}>
                                                                {growthTab === tab.id && (
                                                                    <motion.div layoutId="growthActive" className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", tab.bg)} />
                                                                )}
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                                                                    growthTab === tab.id ? tab.bg + " text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200"
                                                                )}>
                                                                    <tab.icon size={14} />
                                                                </div>
                                                                <span className={cn("text-[11px] font-black uppercase tracking-widest", growthTab === tab.id ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                                                                    {tab.label}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Content Panel */}
                                            <div className="flex-1 min-w-0">
                                                <AnimatePresence mode="wait">
                                                    <motion.div key={growthTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
                                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                                                        {/* Panel header */}
                                                        <div className={cn("px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between", activeGT.light)}>
                                                            <div className="flex items-center gap-4">
                                                                <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg", activeGT.bg)}>
                                                                    <GtIcon size={20} />
                                                                </div>
                                                                <div>
                                                                    <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-70", activeGT.text)}>{activeGT.label} Settings</p>
                                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Configure {activeGT.label}</h3>
                                                                </div>
                                                            </div>
                                                            <div className="hidden sm:block">
                                                                <div className="px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                                                    {view.toUpperCase()} STATION
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Panel body */}
                                                        <div className="p-5 sm:p-7 space-y-6">

                                                            {/* SEO */}
                                                            {growthTab === "seo" && (<div className="space-y-6">
                                                                <ToggleField 
                                                                    label="Block Search Engines" 
                                                                    desc="Prevent Google and other search engines from indexing your page." 
                                                                    icon={Search}
                                                                    checked={advancedSettings.seoBlock} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, seoBlock: v })} 
                                                                    colorClass="bg-slate-900"
                                                                />
                                                                
                                                                <InputField 
                                                                    label="SEO Title" 
                                                                    icon={<Globe size={14} />} 
                                                                    value={advancedSettings.seoTitle} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoTitle: e.target.value })}
                                                                    placeholder="My Awesome Bio Page" 
                                                                />
                                                                <InputField 
                                                                    label="Meta Description" 
                                                                    textarea
                                                                    icon={<Edit3 size={14} />} 
                                                                    value={advancedSettings.seoDescription} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoDescription: e.target.value })}
                                                                    placeholder="Brief description for search results..." 
                                                                />
                                                                
                                                                <InputField 
                                                                    label="Meta Keywords" 
                                                                    icon={<Grid size={14} />} 
                                                                    value={advancedSettings.seoKeywords} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoKeywords: e.target.value })}
                                                                    placeholder="bio, links, creator..." 
                                                                />
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <ImageIcon size={12} /> Open graph image
                                                                    </label>
                                                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent transition-all">
                                                                        <div className="flex-1">
                                                                            <input
                                                                                type="file"
                                                                                id="og-image-upload"
                                                                                className="hidden"
                                                                                accept=".jpg,.jpeg,.png,.svg,.gif,.webp,.avif"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleUploadImage(e.target.files[0]);
                                                                                        if (url) setAdvancedSettings({ ...advancedSettings, seoOpenGraphImage: url });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor="og-image-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-white dark:bg-slate-700 px-4 text-xs font-semibold text-slate-900 border border-slate-200 dark:border-slate-600 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                                                Choose File
                                                                            </label>
                                                                            <span className="ml-3 text-xs text-slate-500 font-medium truncate max-w-[200px] inline-block align-middle">
                                                                                {advancedSettings.seoOpenGraphImage ? advancedSettings.seoOpenGraphImage.split('/').pop() : 'No file chosen'}
                                                                            </span>
                                                                        </div>
                                                                        {advancedSettings.seoOpenGraphImage && (
                                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                                                                                <img src={advancedSettings.seoOpenGraphImage} alt="OG Preview" className="w-full h-full object-cover" />
                                                                                <button onClick={() => setAdvancedSettings({ ...advancedSettings, seoOpenGraphImage: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl flex items-center justify-center">
                                                                                    <X size={10} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">.jpg, .jpeg, .png, .svg, .gif, .webp, .avif allowed. 2 MB maximum.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Globe size={12} /> Language
                                                                    </label>
                                                                    <select value={advancedSettings.seoLanguage} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoLanguage: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="en">English</option>
                                                                        <option value="es">Spanish</option>
                                                                        <option value="fr">French</option>
                                                                        <option value="de">German</option>
                                                                        <option value="it">Italian</option>
                                                                        <option value="pt">Portuguese</option>
                                                                        <option value="hi">Hindi</option>
                                                                        <option value="ar">Arabic</option>
                                                                        <option value="ja">Japanese</option>
                                                                        <option value="ko">Korean</option>
                                                                        <option value="zh">Chinese</option>
                                                                    </select>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Set the meta language of your page to help browsers and search engines identify its language.</p>
                                                                </div>
                                                            </div>)}


                                                            {/* BRANDING */}
                                                            {growthTab === "branding" && (<div className="space-y-6">
                                                                <ToggleField 
                                                                    label="Display Branding" 
                                                                    desc="Show the 'Powered by BotChat' badge on your public page." 
                                                                    icon={Sparkles}
                                                                    checked={advancedSettings.displayBranding} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, displayBranding: v })} 
                                                                    colorClass="bg-violet-600"
                                                                />
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding Name</label>
                                                                    <input value={advancedSettings.brandingName} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingName: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="Your brand name" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Leave empty to use the default site branding.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding URL</label>
                                                                    <input value={advancedSettings.brandingUrl} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingUrl: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="https://yourbrand.com" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding Text Color</label>
                                                                    <div className="flex gap-3">
                                                                        <input type="color" value={advancedSettings.brandingTextColor || "#ffffff"}
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingTextColor: e.target.value })}
                                                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-transparent" />
                                                                        <input value={advancedSettings.brandingTextColor} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingTextColor: e.target.value })}
                                                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all font-mono"
                                                                            placeholder="#1f2937" />
                                                                    </div>
                                                                </div>
                                                            </div>)}

                                                            {/* PIXELS */}
                                                            {growthTab === "pixels" && (<div className="space-y-4">
                                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Social & Ad Tracking</p>
                                                                <ToggleField 
                                                                    label="Facebook Pixel" 
                                                                    desc="Track conversion events with the Meta Pixel" 
                                                                    icon={Facebook}
                                                                    checked={advancedSettings.pixelFacebookEnabled} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, pixelFacebookEnabled: v })} 
                                                                    colorClass="bg-[#1877F2]"
                                                                />
                                                                <ToggleField 
                                                                    label="Google Analytics" 
                                                                    desc="Monitor visitor traffic and page performance" 
                                                                    icon={Globe}
                                                                    checked={advancedSettings.pixelGoogleEnabled} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, pixelGoogleEnabled: v })} 
                                                                    colorClass="bg-[#EA4335]"
                                                                />
                                                            </div>)}

                                                            {/* UTM */}
                                                            {growthTab === "utm" && (<div className="space-y-6">
                                                                <InputField 
                                                                    label="Campaign Source" 
                                                                    icon={<Shuffle size={14} />} 
                                                                    value={advancedSettings.utmSource} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmSource: e.target.value })}
                                                                    placeholder="e.g. instagram, newsletter" 
                                                                />
                                                                <InputField 
                                                                    label="Campaign Medium" 
                                                                    icon={<Monitor size={14} />} 
                                                                    value={advancedSettings.utmMedium} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmMedium: e.target.value })}
                                                                    placeholder="e.g. social, banner" 
                                                                />
                                                                <div className="pt-4 space-y-3 border-t border-slate-100 dark:border-slate-800">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Eye size={12} /> UTM Link Preview
                                                                    </label>
                                                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                                                        <p className="text-[11px] font-mono text-amber-800 dark:text-amber-300 break-all leading-relaxed">
                                                                            {`?utm_source=${advancedSettings.utmSource || "source"}&utm_medium=${advancedSettings.utmMedium || "medium"}&utm_campaign={link_name}`}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 font-medium ml-1">This query will be appended to your destination links.</p>
                                                                </div>
                                                            </div>)}

                                                            {/* PROTECTION */}
                                                            {growthTab === "protection" && (<div className="space-y-6">
                                                                <InputField 
                                                                    label="Page Password" 
                                                                    icon={<KeyRound size={14} />} 
                                                                    type="password"
                                                                    value={advancedSettings.password} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, password: e.target.value })}
                                                                    placeholder="••••••••" 
                                                                />
                                                                <ToggleField 
                                                                    label="Sensitive Content Warning" 
                                                                    desc="Show a warning to users before they can view your page." 
                                                                    icon={ShieldAlert}
                                                                    checked={advancedSettings.sensitiveContentWarning} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, sensitiveContentWarning: v })} 
                                                                    colorClass="bg-red-600"
                                                                />
                                                            </div>)}

                                                            {/* POPUP (BRANDED BUTTON) */}
                                                            {growthTab === "popup" && (<div className="space-y-6">
                                                                <ToggleField 
                                                                    label="Branded Floating Button" 
                                                                    desc="Show a persistent action button that opens a custom modal." 
                                                                    icon={SmartphoneNfc}
                                                                    checked={advancedSettings.brandedButtonEnabled} 
                                                                    onChange={(v) => setAdvancedSettings({ ...advancedSettings, brandedButtonEnabled: v })} 
                                                                    colorClass="bg-fuchsia-600"
                                                                />
                                                                
                                                                {advancedSettings.brandedButtonEnabled && (
                                                                    <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                        <div className="space-y-3">
                                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                                <ImageIcon size={12} /> Button Icon
                                                                            </label>
                                                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                                                <div className="flex-1">
                                                                                    <input type="file" id="branded-icon-upload" className="hidden" accept="image/*"
                                                                                        onChange={async (e) => {
                                                                                            if (e.target.files?.[0]) {
                                                                                                const url = await handleUploadImage(e.target.files[0]);
                                                                                                if (url) setAdvancedSettings({ ...advancedSettings, brandedIconUrl: url });
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                    <label htmlFor="branded-icon-upload" className="cursor-pointer inline-flex h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 px-4 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-all">
                                                                                        Upload Icon
                                                                                    </label>
                                                                                </div>
                                                                                {advancedSettings.brandedIconUrl && (
                                                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                                                                        <img src={advancedSettings.brandedIconUrl} className="w-full h-full object-cover" alt="icon" />
                                                                                        <button onClick={() => setAdvancedSettings({ ...advancedSettings, brandedIconUrl: "" })} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                                            <X size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <InputField 
                                                                            label="Modal Title" 
                                                                            icon={<Edit3 size={14} />} 
                                                                            value={advancedSettings.brandedModalTitle} 
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalTitle: e.target.value })}
                                                                            placeholder="Your Modal Title" 
                                                                        />
                                                                        <InputField 
                                                                            label="Modal Content (HTML Support)" 
                                                                            textarea
                                                                            icon={<Layers size={14} />} 
                                                                            value={advancedSettings.brandedModalContent} 
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalContent: e.target.value })}
                                                                            placeholder="Write your modal content here..." 
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>)}

                                                            {/* ADVANCED / MORE */}
                                                            {growthTab === "more" && (<div className="space-y-6">
                                                                <div className="grid grid-cols-1 gap-3">
                                                                    <ToggleField 
                                                                        label="Share Button" 
                                                                        desc="Display a floating share action at the top of your page." 
                                                                        icon={Share2}
                                                                        checked={advancedSettings.enableShareButton} 
                                                                        onChange={(v) => setAdvancedSettings({ ...advancedSettings, enableShareButton: v })} 
                                                                        colorClass="bg-indigo-600"
                                                                    />
                                                                    <ToggleField 
                                                                        label="Scroll-to-Top" 
                                                                        desc="Add navigation assistance for longer bio pages." 
                                                                        icon={SmartphoneNfc}
                                                                        checked={advancedSettings.enableScrollButtons} 
                                                                        onChange={(v) => setAdvancedSettings({ ...advancedSettings, enableScrollButtons: v })} 
                                                                        colorClass="bg-emerald-600"
                                                                    />
                                                                    <ToggleField 
                                                                        label="Directory Listing" 
                                                                        desc="Make your profile discoverable in BotChat's public directory." 
                                                                        icon={Orbit}
                                                                        checked={advancedSettings.enableDirectoryDisplaying} 
                                                                        onChange={(v) => setAdvancedSettings({ ...advancedSettings, enableDirectoryDisplaying: v })} 
                                                                        colorClass="bg-amber-600"
                                                                    />
                                                                </div>

                                                                <InputField 
                                                                    label="Leap Link URL" 
                                                                    icon={<ArrowRight size={14} />} 
                                                                    value={advancedSettings.leapLinkUrl} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, leapLinkUrl: e.target.value })}
                                                                    placeholder="https://example.com/" 
                                                                />
                                                                
                                                                <InputField 
                                                                    label="Custom CSS" 
                                                                    textarea
                                                                    icon={<LayoutTemplate size={14} />} 
                                                                    value={advancedSettings.customCss} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, customCss: e.target.value })}
                                                                    placeholder="body { background: #000; }" 
                                                                />

                                                                <InputField 
                                                                    label="Custom Javascript" 
                                                                    textarea
                                                                    icon={<Zap size={14} />} 
                                                                    value={advancedSettings.customJs} 
                                                                    onChange={(e) => setAdvancedSettings({ ...advancedSettings, customJs: e.target.value })}
                                                                    placeholder="console.log('Hello world');" 
                                                                />
                                                            </div>)}
                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* WORKSTATION ACTIONS */}
                                                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                                                    <button 
                                                        onClick={() => setActionModal({ isOpen: true, type: 'delete', row: { profileId: selectedPageId } as any })}
                                                        className="flex-1 h-12 rounded-2xl border-2 border-red-50 dark:border-red-950/30 text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                                                    >
                                                        <Trash2 size={14} /> Destroy Studio
                                                    </button>
                                                    <button 
                                                        onClick={handleSaveAdvanced} 
                                                        disabled={isSavingAdvanced}
                                                        className={cn(
                                                            "flex-[2] h-12 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-60",
                                                            activeGT.bg, "hover:opacity-90", "shadow-" + activeGT.color + "-500/20"
                                                        )}
                                                    >
                                                        {isSavingAdvanced ? (
                                                            <><Loader2 size={14} className="animate-spin" /> Syncing...</>
                                                        ) : (
                                                            <><Save size={14} /> Update {activeGT.label}</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </aside>

                <main className={cn(
                    "w-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/5 relative flex items-center justify-center p-2 sm:p-4 transition-all duration-1000 ease-in-out z-10",
                    "xl:sticky xl:top-0 h-full overflow-hidden xl:w-[420px]",
                    activePanel === "preview" ? "flex" : "hidden xl:flex",
                    showCarouselEditor && "xl:mr-[400px]"
                )}>
                    {/* Live Preview Status Badge */}

                    {/* Background is now matched exactly to the left panel */}

                    <div className={cn(
                        "transition-all duration-1000 ease-in-out flex items-center justify-center w-full h-full pt-4",
                        "scale-100"
                    )}>
                        <PhonePreview
                            profile={previewProfile || profile}
                            tabs={previewTabs}
                            selectedTabId={selectedTabId}
                            setSelectedTabId={setSelectedTabId}
                            instagramUsername={instagramUsername}
                            viewportOffset={0}
                            previewWidth={360}
                            uiTypeOverrides={uiTypeOverrides}
                            layoutStyle={profile?.settings?.layoutStyle || "standard"}
                            openEditor={openEditor}
                        />
                    </div>
                </main>

                <AnimatePresence>
                    {showAddBlock && (
                        <aside className="fixed inset-x-0 bottom-0 top-0 xl:top-14 xl:bottom-0 xl:left-auto xl:right-0 z-[60] w-full xl:w-[400px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden absolute">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Add Content</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Studio Marketplace</p>
                                </div>
                                <button onClick={() => setShowAddBlock(false)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <BlockMarketplaceContent onSelect={(type: string) => handleAddBlock(type)} />
                            </div>
                        </aside>
                    )}
                </AnimatePresence>
            </div>

            {/* ── MOBILE FLOATING CONTROLS (OUTSIDE MAIN OVERFLOW) ── */}
            <div className="xl:hidden">
            </div>

            {/* MODALS */}
            <ModalShell open={showAddBlock} onClose={() => setShowAddBlock(false)} title="Create Block" icon={<Grid size={20} />} maxWidthClassName="sm:max-w-5xl">
                <BlockMarketplaceContent
                    onSelect={handleSelectBlockType}
                />
            </ModalShell>

            <ConfirmModal
                isOpen={actionModal.isOpen}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={confirmAction}
                title={actionModal.type === 'delete' ? 'Destroy Studio?' : 'Confirm Action'}
                message={
                    actionModal.type === 'delete' ? 'This action is permanent and will destroy all content blocks in this studio.' : 'Are you sure?'
                }
                type={actionModal.type === 'delete' ? 'danger' : 'warning'}
                confirmText={actionModal.type === 'delete' ? 'Destroy Now' : 'Confirm'}
            />

            <ModalShell open={showCarouselEditor && !!editingBlock} onClose={() => setShowCarouselEditor(false)}
                title={`Edit ${getUiTypeFromBlock(editingBlock).replace(/_/g, " ") || "Block"}`}
                icon={editingBlock && (BLOCK_ICONS[getUiTypeFromBlock(editingBlock)] || <LayoutTemplate size={20} />)}
                footer={
                    <div className="flex flex-row gap-3">
                        {!editingBlock?._isNew && (
                            <button
                                onClick={async () => {
                                    if (!editingBlock?.id) return;
                                    setActionModal({ isOpen: true, type: 'delete', row: { id: editingBlock.id } as any });
                                    // Note: This logic for block deletion should be handled separately if it's different from page deletion
                                    // For now, I'll keep the direct call if it works, or use the existing handleDeleteBlock
                                }}
                                className="flex-1 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        )}
                        <button
                            onClick={saveEditor}
                            disabled={isSavingBlock}
                            className={cn(
                                "flex-[2] h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all flex items-center justify-center gap-2",
                                isSavingBlock ? "bg-slate-100 text-slate-400" : "bg-primary text-white hover:opacity-90 active:scale-[0.98] shadow-primary/25"
                            )}
                        >
                            {isSavingBlock ? (
                                <><Loader2 size={14} className="animate-spin" /> Syncing...</>
                            ) : (
                                <>{editingBlock?._isNew ? <Plus size={14} /> : <Save size={14} />} {editingBlock?._isNew ? "Create Block" : "Update Block"}</>
                            )}
                        </button>
                    </div>
                }>
                {editingBlock && (
                    <div className="space-y-6">
                        {/* BLOCK VISIBILITY TOGGLE (IN-FORM) */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    (editingBlock.is_enabled == 0) ? "bg-amber-100 dark:bg-amber-900/30 text-amber-500" : "bg-green-100 dark:bg-green-900/30 text-green-500"
                                )}>
                                    {(editingBlock.is_enabled == 0) ? <EyeOff size={14} /> : <Eye size={14} />}
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                        {(editingBlock.is_enabled == 0) ? "Block is Hidden" : "Block is Visible"}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-tight">Toggle visibility on your public page</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={editingBlock.is_enabled != 0} 
                                    onChange={async () => {
                                        const blockId = editingBlock.id;
                                        const isCurrentlyInactive = editingBlock.is_enabled == 0;
                                        const newStatus = isCurrentlyInactive ? 1 : 0;
                                        
                                        // Update editingBlock state immediately
                                        setEditingBlock({ ...editingBlock, is_enabled: newStatus, is_active: newStatus, is_Enabled: newStatus });
                                        
                                        // Update tabs state (for live preview)
                                        const applyToTabs = (s: number) => setTabs(prev => prev.map(tab => ({
                                            ...tab,
                                            sections: (tab.sections || []).map(sec => ({
                                                ...sec,
                                                blocks: (sec.blocks || []).map(b => b.id === blockId ? { ...b, is_active: s, is_Enabled: s, is_enabled: s } : b)
                                            }))
                                        })));
                                        applyToTabs(newStatus);

                                        // If disabling, close the editor
                                        if (newStatus === 0) {
                                            setEditingBlock(null);
                                            setShowCarouselEditor(false);
                                        }

                                        try {
                                            const res = await api.patch(`/bio/blocks/${blockId}/toggle`);
                                            const raw = res.data?.data?.is_enabled ?? res.data?.data?.is_Enabled ?? newStatus;
                                            const serverStatus = raw === true ? 1 : raw === false ? 0 : Number(raw);
                                            
                                            // Sync final status
                                            applyToTabs(serverStatus);
                                            if (serverStatus === 0) {
                                                setEditingBlock(null);
                                                setShowCarouselEditor(false);
                                            } else {
                                                setEditingBlock(prev => prev?.id === blockId ? { ...prev, is_enabled: serverStatus, is_active: serverStatus, is_Enabled: serverStatus } : prev);
                                            }
                                        } catch (err) {
                                            console.error("Toggle block failed:", err);
                                            // Revert on error
                                            const revertStatus = isCurrentlyInactive ? 0 : 1;
                                            applyToTabs(revertStatus);
                                            setEditingBlock(prev => prev?.id === blockId ? { ...prev, is_enabled: revertStatus, is_active: revertStatus, is_Enabled: revertStatus } : prev);
                                        }
                                    }} 
                                />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        {(editingBlock.items || []).map((item: any, idx: number) => {
                            const uiType = getUiTypeFromBlock(editingBlock);
                            const aestheticTypes = [
                                "hero_aesthetic_section","stats_minimal_section","impact_section","testimonial_highlight_section","pricing_cards_section","portfolio_minimal_section","faq_cards_section","cta_fullscreen_section",
                                "header_profile_section", "social_proof_section", "featured_links_section", "content_grid_section", "offers_section", "testimonials_section", "faq_section", "contact_section"
                            ];
                            if (aestheticTypes.includes(uiType)) return null;

                            return (
                                <div key={idx} className="space-y-6">
                                    {/* Image Type */}
                                    {uiType === "image" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <ImageIcon size={14} className="text-slate-400" /> Image
                                                </label>
                                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                                                    {item.image && (
                                                        <div className="w-full h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-md mb-2">
                                                            <img src={item.image} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:border-primary transition-all shadow-sm">
                                                        Choose File
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tight">.jpg, .png, .webp, .svg, .gif allowed. 2 MB maximum.</p>
                                                </div>
                                            </div>
                                            <InputField
                                                label="Destination URL"
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder="https://example.com/"
                                                icon={<LinkIcon size={14} />}
                                            />
                                        </>
                                    )}

                                    {/* ── LINK BLOCK ── */}
                                    {uiType === "link" && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Button Label"
                                                value={item.name || ""}
                                                onChange={(e: any) => updateItem(idx, 'name', e.target.value)}
                                                placeholder="e.g. Visit my website"
                                                icon={<LinkIcon size={14} />}
                                            />
                                            <InputField
                                                label="Destination URL"
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder="https://example.com/"
                                                icon={<Globe size={14} />}
                                            />
                                        </div>
                                    )}

                                    {/* ── HEADING BLOCK ── */}
                                    {uiType === "heading" && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Heading Text"
                                                value={item.text || ""}
                                                onChange={(e: any) => updateItem(idx, 'text', e.target.value)}
                                                placeholder="e.g. About Me"
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Size</label>
                                                <select
                                                    value={item.heading_type || "h1"}
                                                    onChange={(e) => updateItem(idx, 'heading_type', e.target.value)}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                >
                                                    <option value="h1">H1 — Large</option>
                                                    <option value="h2">H2 — Medium</option>
                                                    <option value="h3">H3 — Small</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── PARAGRAPH BLOCK ── */}
                                    {uiType === "paragraph" && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Paragraph Text"
                                                value={item.description || item.text || ""}
                                                onChange={(e: any) => updateItem(idx, 'description', e.target.value)}
                                                placeholder="Write your paragraph content here..."
                                                textarea
                                            />
                                        </div>
                                    )}

                                    {/* ── MODAL TEXT BLOCK ── */}
                                    {uiType === "modal_text" && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Button Label"
                                                value={item.name || ""}
                                                onChange={(e: any) => updateItem(idx, 'name', e.target.value)}
                                                placeholder="e.g. Read More"
                                            />
                                            <InputField
                                                label="Popup Title"
                                                value={item.modal_text_title || ""}
                                                onChange={(e: any) => updateItem(idx, 'modal_text_title', e.target.value)}
                                                placeholder="Modal heading"
                                            />
                                            <InputField
                                                label="Popup Content"
                                                value={item.modal_text_description || item.description || ""}
                                                onChange={(e: any) => updateItem(idx, 'modal_text_description', e.target.value)}
                                                placeholder="Full text shown inside the popup..."
                                                textarea
                                            />
                                        </div>
                                    )}

                                    {/* ── EMAIL / PHONE / CONTACT COLLECTOR ── */}
                                    {["email_collector", "phone_collector", "contact_collector", "contact_form"].includes(uiType) && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Button Label"
                                                value={item.name || ""}
                                                onChange={(e: any) => updateItem(idx, 'name', e.target.value)}
                                                placeholder="e.g. Subscribe to my newsletter"
                                            />
                                            <InputField
                                                label="Button Text"
                                                value={item.button_text || ""}
                                                onChange={(e: any) => updateItem(idx, 'button_text', e.target.value)}
                                                placeholder="Submit"
                                            />
                                            <InputField
                                                label="Success Message"
                                                value={item.success_text || ""}
                                                onChange={(e: any) => updateItem(idx, 'success_text', e.target.value)}
                                                placeholder="Thank you!"
                                            />
                                        </div>
                                    )}

                                    {/* ── PAYPAL BLOCK ── */}
                                    {uiType === "paypal" && (
                                        <div className="space-y-5">
                                            <InputField label="Product Name" value={item.name || ""} onChange={(e: any) => updateItem(idx, 'name', e.target.value)} placeholder="e.g. My Course" />
                                            <InputField label="PayPal Email" value={item.email || ""} onChange={(e: any) => updateItem(idx, 'email', e.target.value)} placeholder="you@paypal.com" icon={<Mail size={14} />} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Price" value={String(item.price || "")} onChange={(e: any) => updateItem(idx, 'price', e.target.value)} placeholder="9.99" />
                                                <InputField label="Currency" value={item.currency || "USD"} onChange={(e: any) => updateItem(idx, 'currency', e.target.value)} placeholder="USD" />
                                            </div>
                                        </div>
                                    )}

                                    {/* ── EMBED BLOCKS (YouTube, Spotify, Soundcloud, etc.) ── */}
                                    {["youtube", "spotify", "soundcloud", "vimeo", "twitch", "tiktok_video"].includes(uiType) && (
                                        <div className="space-y-5">
                                            <InputField
                                                label={`${uiType.charAt(0).toUpperCase() + uiType.slice(1)} URL`}
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder={`Paste your ${uiType} link here`}
                                                icon={<LinkIcon size={14} />}
                                            />
                                        </div>
                                    )}

                                    {/* Hero Section */}
                                    {uiType === "hero_section" && (
                                        <div className="space-y-5">
                                            <InputField label="Title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Creative Director" />
                                            <InputField label="Subtitle" value={item.subtitle || ""} onChange={(e: any) => updateItem(idx, 'subtitle', e.target.value)} placeholder="Global Branding Expert" />
                                            <InputField label="Description" value={item.description || ""} onChange={(e: any) => updateItem(idx, 'description', e.target.value)} placeholder="Transforming ideas into visual identities" textarea />
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Hero Image</label>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                    {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />}
                                                    <label className="flex-1 cursor-pointer">
                                                        <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">
                                                            {item.image ? "Change Image" : "Upload Image"}
                                                        </div>
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="CTA Text" value={item.cta_text || ""} onChange={(e: any) => updateItem(idx, 'cta_text', e.target.value)} placeholder="Hire Me" />
                                                <InputField label="CTA Link" value={item.cta_link || ""} onChange={(e: any) => updateItem(idx, 'cta_link', e.target.value)} placeholder="#contact" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Stats Section */}
                                    {uiType === "stats_section" && (
                                        <div className="space-y-5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Stats Items</p>
                                            {(item.items || []).map((stat: any, sIdx: number) => (
                                                <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 relative group">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...item.items];
                                                            newItems.splice(sIdx, 1);
                                                            updateItem(idx, 'items', newItems);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="Label" value={stat.label || ""} onChange={(e: any) => {
                                                            const newItems = [...item.items];
                                                            newItems[sIdx] = { ...stat, label: e.target.value };
                                                            updateItem(idx, 'items', newItems);
                                                        }} placeholder="Projects" />
                                                        <InputField label="Value" value={stat.value || ""} onChange={(e: any) => {
                                                            const newItems = [...item.items];
                                                            newItems[sIdx] = { ...stat, value: e.target.value };
                                                            updateItem(idx, 'items', newItems);
                                                        }} placeholder="200+" />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newItems = [...(item.items || []), { label: "", value: "" }];
                                                    updateItem(idx, 'items', newItems);
                                                }}
                                                className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all font-bold text-xs"
                                            >
                                                <Plus size={14} /> Add Stat Item
                                            </button>
                                        </div>
                                    )}

                                    {/* CTA Section */}
                                    {uiType === "cta_section" && (
                                        <div className="space-y-5">
                                            <InputField label="Title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Ready to stand out?" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Button Text" value={item.button_text || ""} onChange={(e: any) => updateItem(idx, 'button_text', e.target.value)} placeholder="Get Started" />
                                                <InputField label="Button Link" value={item.button_link || ""} onChange={(e: any) => updateItem(idx, 'button_link', e.target.value)} placeholder="#contact" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Brands / Logos Section */}
                                    {uiType === "brands_section" && (
                                        <div className="space-y-5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Brand Logos</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {(item.logos || []).map((logo: any, lIdx: number) => (
                                                    <div key={lIdx} className="relative group aspect-square rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
                                                        <img src={logo.image} className="w-full h-full object-contain p-2" />
                                                        <button
                                                            onClick={() => {
                                                                const newLogos = [...item.logos];
                                                                newLogos.splice(lIdx, 1);
                                                                updateItem(idx, 'logos', newLogos);
                                                            }}
                                                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={10} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary cursor-pointer transition-all">
                                                    <Plus size={20} />
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'logos', [...(item.logos || []), { image: url }]); } }} />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Creator Store: Hero Product Section */}
                                    {uiType === "hero_product_section" && (
                                        <div className="space-y-5">
                                            <InputField label="Title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Launch Your Digital Product" />
                                            <InputField label="Subtitle" value={item.subtitle || ""} onChange={(e: any) => updateItem(idx, 'subtitle', e.target.value)} placeholder="Sell smarter with your bio page" />
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Product Image</label>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                    {item.product_image && <img src={item.product_image} className="w-12 h-12 rounded-lg object-cover" />}
                                                    <label className="flex-1 cursor-pointer">
                                                        <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">
                                                            {item.product_image ? "Change Image" : "Upload Product"}
                                                        </div>
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'product_image', url); } }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Price" value={item.price || ""} onChange={(e: any) => updateItem(idx, 'price', e.target.value)} placeholder="$49" />
                                                <InputField label="CTA Text" value={item.cta_text || ""} onChange={(e: any) => updateItem(idx, 'cta_text', e.target.value)} placeholder="Buy Now" />
                                            </div>
                                            <InputField label="CTA Link" value={item.cta_link || ""} onChange={(e: any) => updateItem(idx, 'cta_link', e.target.value)} placeholder="https://..." />
                                        </div>
                                    )}

                                    {/* Creator Store: Featured Product Section */}
                                    {uiType === "featured_product_section" && (
                                        <div className="space-y-5">
                                            <InputField label="Product Name" value={item.name || ""} onChange={(e: any) => updateItem(idx, 'name', e.target.value)} placeholder="Premium Course" />
                                            <InputField label="Description" value={item.description || ""} onChange={(e: any) => updateItem(idx, 'description', e.target.value)} placeholder="Product details..." textarea />
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Featured Image</label>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                    {item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover" />}
                                                    <label className="flex-1 cursor-pointer">
                                                        <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">
                                                            {item.image ? "Change Image" : "Upload Image"}
                                                        </div>
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Price" value={item.price || ""} onChange={(e: any) => updateItem(idx, 'price', e.target.value)} placeholder="$99" />
                                                <InputField label="Link" value={item.link || ""} onChange={(e: any) => updateItem(idx, 'link', e.target.value)} placeholder="https://..." />
                                            </div>
                                        </div>
                                    )}

                                    {/* Creator Store: Product List Section */}
                                    {uiType === "product_list_section" && (
                                        <div className="space-y-5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Product Items</p>
                                            {(item.items || []).map((pItem: any, piIdx: number) => (
                                                <div key={piIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 relative group">
                                                    <button onClick={() => { const newItems = [...item.items]; newItems.splice(piIdx, 1); updateItem(idx, 'items', newItems); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"><X size={12} /></button>
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-16 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                                                            {pItem.image ? <img src={pItem.image} className="w-full h-full object-cover" /> : <ShoppingBag size={20} className="text-slate-300" />}
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            <label className="cursor-pointer inline-block px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase">
                                                                Upload
                                                                <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) { const newItems = [...item.items]; newItems[piIdx] = { ...pItem, image: url }; updateItem(idx, 'items', newItems); } } }} />
                                                            </label>
                                                            <InputField label="Name" value={pItem.name || ""} onChange={(e: any) => { const newItems = [...item.items]; newItems[piIdx] = { ...pItem, name: e.target.value }; updateItem(idx, 'items', newItems); }} />
                                                        </div>
                                                    </div>
                                                    <InputField label="Description" value={pItem.description || ""} onChange={(e: any) => { const newItems = [...item.items]; newItems[piIdx] = { ...pItem, description: e.target.value }; updateItem(idx, 'items', newItems); }} textarea />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="Price" value={pItem.price || ""} onChange={(e: any) => { const newItems = [...item.items]; newItems[piIdx] = { ...pItem, price: e.target.value }; updateItem(idx, 'items', newItems); }} />
                                                        <InputField label="Link" value={pItem.link || ""} onChange={(e: any) => { const newItems = [...item.items]; newItems[piIdx] = { ...pItem, link: e.target.value }; updateItem(idx, 'items', newItems); }} />
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => { const newItems = [...(item.items || []), { name: "", description: "", image: "", price: "", link: "" }]; updateItem(idx, 'items', newItems); }} className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all font-black uppercase tracking-widest text-[10px]"><Plus size={14} /> Add Product</button>
                                        </div>
                                    )}

                                    {/* Creator Store: Trust Badges Section */}
                                    {uiType === "trust_badges_section" && (
                                        <div className="space-y-5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Trust Badges</p>
                                            {(item.items || []).map((badge: any, bIdx: number) => (
                                                <div key={bIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-4 relative group">
                                                    <button onClick={() => { const newItems = [...item.items]; newItems.splice(bIdx, 1); updateItem(idx, 'items', newItems); }} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"><X size={12} /></button>
                                                    <InputField label="Label" value={badge.label || ""} onChange={(e: any) => { const newItems = [...item.items]; newItems[bIdx] = { ...badge, label: e.target.value }; updateItem(idx, 'items', newItems); }} />
                                                    <InputField label="Icon (lucide)" value={badge.icon || "ShieldCheck"} onChange={(e: any) => { const newItems = [...item.items]; newItems[bIdx] = { ...badge, icon: e.target.value }; updateItem(idx, 'items', newItems); }} />
                                                </div>
                                            ))}
                                            <button onClick={() => { const newItems = [...(item.items || []), { label: "", icon: "ShieldCheck" }]; updateItem(idx, 'items', newItems); }} className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all font-black uppercase tracking-widest text-[10px]"><Plus size={14} /> Add Badge</button>
                                        </div>
                                    )}

                                    {/* Creator Store: Urgency Offer Section */}
                                     {["urgency_offer_section", "countdown_section"].includes(uiType) && (
                                         <div className="space-y-5">
                                             <InputField label="Title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Limited Time Offer" />
                                            <InputField label="Description" value={item.description || ""} onChange={(e: any) => updateItem(idx, 'description', e.target.value)} placeholder="Offer details..." textarea />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Button Text" value={item.button_text || ""} onChange={(e: any) => updateItem(idx, 'button_text', e.target.value)} placeholder="Claim Discount" />
                                                <InputField label="Button Link" value={item.button_link || ""} onChange={(e: any) => updateItem(idx, 'button_link', e.target.value)} placeholder="https://..." />
                                            </div>
                                        </div>
                                    )}

                                    {/* Creator Store: Contact Section */}
                                    {uiType === "contact_section" && (
                                        <div className="space-y-5">
                                            <InputField label="Email Address" value={item.email || ""} onChange={(e: any) => updateItem(idx, 'email', e.target.value)} placeholder="support@creator.com" icon={<Mail size={14} />} />
                                            <InputField label="Phone Number" value={item.phone || ""} onChange={(e: any) => updateItem(idx, 'phone', e.target.value)} placeholder="+123456789" icon={<Phone size={14} />} />
                                            <InputField label="WhatsApp Number" value={item.whatsapp || ""} onChange={(e: any) => updateItem(idx, 'whatsapp', e.target.value)} placeholder="123456789" icon={<MessageCircle size={14} />} />
                                        </div>
                                    )}

                                    {/* Portfolio / Services / Testimonials / FAQ Sections */}
                                    {["portfolio_section", "services_section", "testimonials_section", "faq_section", "link_grid_section", "link_carousel_section"].includes(uiType) && (
                                        <div className="space-y-5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Section Items</p>
                                            {(item.items || []).map((sItem: any, siIdx: number) => (
                                                <div key={siIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-4 relative group">
                                                    <button
                                                        onClick={() => {
                                                            const newItems = [...item.items];
                                                            newItems.splice(siIdx, 1);
                                                            updateItem(idx, 'items', newItems);
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={12} />
                                                    </button>

                                                    {uiType === "faq_section" ? (
                                                        <>
                                                            <InputField label="Question" value={sItem.question || ""} onChange={(e: any) => {
                                                                const newItems = [...item.items];
                                                                newItems[siIdx] = { ...sItem, question: e.target.value };
                                                                updateItem(idx, 'items', newItems);
                                                            }} />
                                                            <InputField label="Answer" value={sItem.answer || ""} onChange={(e: any) => {
                                                                const newItems = [...item.items];
                                                                newItems[siIdx] = { ...sItem, answer: e.target.value };
                                                                updateItem(idx, 'items', newItems);
                                                            }} textarea />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="flex gap-4">
                                                                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                                                                    {sItem.image ? <img src={sItem.image} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300" />}
                                                                </div>
                                                                <div className="flex-1 space-y-2">
                                                                    <label className="cursor-pointer inline-block px-3 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                                                                        Upload Image
                                                                        <input type="file" className="hidden" onChange={async e => {
                                                                            if (e.target.files?.[0]) {
                                                                                const url = await handleUploadImage(e.target.files[0]); if (url) {
                                                                                    const newItems = [...item.items];
                                                                                    newItems[siIdx] = { ...sItem, image: url };
                                                                                    updateItem(idx, 'items', newItems);
                                                                                }
                                                                            }
                                                                        }} />
                                                                    </label>
                                                                    <InputField label="Title" value={sItem.title || ""} onChange={(e: any) => {
                                                                        const newItems = [...item.items];
                                                                        newItems[siIdx] = { ...sItem, title: e.target.value };
                                                                        updateItem(idx, 'items', newItems);
                                                                    }} />
                                                                </div>
                                                            </div>
                                                            <InputField label="Description" value={sItem.description || ""} onChange={(e: any) => {
                                                                const newItems = [...item.items];
                                                                newItems[siIdx] = { ...sItem, description: e.target.value };
                                                                updateItem(idx, 'items', newItems);
                                                            }} textarea />
                                                            {uiType === "testimonials_section" && <InputField label="Author" value={sItem.author || ""} onChange={(e: any) => {
                                                                const newItems = [...item.items];
                                                                newItems[siIdx] = { ...sItem, author: e.target.value };
                                                                updateItem(idx, 'items', newItems);
                                                            }} />}
                                                            {(uiType === "portfolio_section" || uiType === "services_section") && (
                                                                <InputField label="Link" value={sItem.link || ""} onChange={(e: any) => {
                                                                    const newItems = [...item.items];
                                                                    newItems[siIdx] = { ...sItem, link: e.target.value };
                                                                    updateItem(idx, 'items', newItems);
                                                                }} />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newItem = uiType === "faq_section" ? { question: "", answer: "" } : { title: "", description: "", image: "" };
                                                    const newItems = [...(item.items || []), newItem];
                                                    updateItem(idx, 'items', newItems);
                                                }}
                                                className="w-full h-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 hover:text-primary hover:border-primary transition-all font-bold text-xs"
                                            >
                                                <Plus size={14} /> Add {uiType.split('_')[0]} Item
                                            </button>
                                        </div>
                                    )}


                                    {/* Paragraph Type */}
                                    {uiType === "paragraph" && (
                                        <InputField
                                            label="Content"
                                            value={item.text || item.description || ""}
                                            onChange={(e: any) => {
                                                updateItem(idx, 'text', e.target.value);
                                                updateItem(idx, 'description', e.target.value);
                                            }}
                                            placeholder="Write your content here..."
                                            textarea
                                            icon={<FileCode2 size={14} />}
                                        />
                                    )}

                                    {/* Avatar Type */}
                                    {uiType === "avatar" && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <User size={14} className="text-slate-400" /> Avatar Image
                                                </label>
                                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                                                    {item.image && (
                                                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-700 shadow-md mb-2">
                                                            <img src={item.image} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:border-primary transition-all shadow-sm">
                                                        Choose Avatar
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Size</label>
                                                    <select
                                                        value={item.size || 140}
                                                        onChange={(e) => updateItem(idx, 'size', parseInt(e.target.value))}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 text-sm font-bold outline-none"
                                                    >
                                                        <option value={80}>Small (80px)</option>
                                                        <option value={140}>Medium (140px)</option>
                                                        <option value={200}>Large (200px)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Shape</label>
                                                    <select
                                                        value={item.border_radius || "round"}
                                                        onChange={(e) => updateItem(idx, 'border_radius', e.target.value)}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 text-sm font-bold outline-none"
                                                    >
                                                        <option value="round">Circle</option>
                                                        <option value="rounded">Rounded Square</option>
                                                        <option value="straight">Square</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* vCard Type */}
                                    {uiType === "vcard" && (
                                        <div className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="First Name" value={item.first_name || ""} onChange={(e: any) => updateItem(idx, 'first_name', e.target.value)} placeholder="Jane" />
                                                <InputField label="Last Name" value={item.last_name || ""} onChange={(e: any) => updateItem(idx, 'last_name', e.target.value)} placeholder="Doe" />
                                            </div>
                                            <InputField label="Email" value={item.email || ""} onChange={(e: any) => updateItem(idx, 'email', e.target.value)} placeholder="jane@example.com" icon={<Mail size={14} />} />
                                            <InputField label="Phone" value={item.phone || ""} onChange={(e: any) => updateItem(idx, 'phone', e.target.value)} placeholder="+1 234 567 890" icon={<Smartphone size={14} />} />
                                            <InputField label="Organization" value={item.organization || ""} onChange={(e: any) => updateItem(idx, 'organization', e.target.value)} placeholder="Acme Inc." icon={<Hexagon size={14} />} />
                                            <InputField label="Button Label" value={item.name || item.title || ""} onChange={(e: any) => { updateItem(idx, 'name', e.target.value); updateItem(idx, 'title', e.target.value); }} placeholder="Save Contact" />
                                        </div>
                                    )}

                                    {/* Newsletter Type */}
                                    {uiType === "newsletter" && (
                                        <div className="space-y-5">
                                            <InputField label="Title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Join our newsletter" />
                                            <InputField label="Description" value={item.description || ""} onChange={(e: any) => updateItem(idx, 'description', e.target.value)} placeholder="Get the latest updates directly in your inbox." textarea />
                                            <InputField label="Input Placeholder" value={item.placeholder || ""} onChange={(e: any) => updateItem(idx, 'placeholder', e.target.value)} placeholder="Your email address" />
                                            <InputField label="Button Text" value={item.button_text || ""} onChange={(e: any) => updateItem(idx, 'button_text', e.target.value)} placeholder="Subscribe" />
                                        </div>
                                    )}

                                    {/* Divider Type */}
                                    {uiType === "divider" && (
                                        <div className="py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <MoreHorizontal size={24} />
                                            <p className="text-[11px] font-black uppercase tracking-widest">Horizontal Divider</p>
                                        </div>
                                    )}

                                    {/* Socials Type */}
                                    {uiType === "socials" && (
                                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {[
                                                { key: 'email', label: 'Email', prefix: '', icon: <Globe size={14} />, placeholder: 'email@domain.com' },
                                                { key: 'tel', label: 'Telephone', prefix: '', icon: <Smartphone size={14} />, placeholder: '+00000000000' },
                                                { key: 'whatsapp', label: 'WhatsApp', prefix: '', icon: <SmartphoneNfc size={14} />, placeholder: '2124567890' },
                                                { key: 'facebook', label: 'Facebook', prefix: 'facebook.com/', icon: <Globe size={14} />, placeholder: 'facebook-page' },
                                                { key: 'instagram', label: 'Instagram', prefix: 'instagram.com/', icon: <Camera size={14} />, placeholder: 'Instagram username' },
                                                { key: 'twitter', label: 'Twitter', prefix: 'x.com/', icon: <Sparkles size={14} />, placeholder: 'Twitter username' },
                                                { key: 'youtube', label: 'YouTube Channel', prefix: 'youtube.com/', icon: <Youtube size={14} />, placeholder: 'Channel ID' },
                                                { key: 'tiktok', label: 'TikTok', prefix: 'tiktok.com/@', icon: <Video size={14} />, placeholder: 'TikTok username' },
                                                { key: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/', icon: <Globe size={14} />, placeholder: 'Linked In Profile' },
                                                { key: 'discord', label: 'Discord', prefix: 'discord.gg/', icon: <Grid size={14} />, placeholder: 'Discord username' },
                                                { key: 'telegram', label: 'Telegram', prefix: 't.me/', icon: <Globe size={14} />, placeholder: 'telegram-username' },
                                            ].map((platform) => (
                                                <div key={platform.key} className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        {platform.icon} {platform.label}
                                                    </label>
                                                    <div className="flex rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all focus-within:border-primary/30">
                                                        {platform.prefix && (
                                                            <div className="px-4 flex items-center bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                                                                {platform.prefix}
                                                            </div>
                                                        )}
                                                        <input
                                                            value={item.socials?.[platform.key] || ""}
                                                            onChange={(e) => {
                                                                const newSocials = { ...(item.socials || {}), [platform.key]: e.target.value };
                                                                updateItem(idx, 'socials', newSocials);
                                                            }}
                                                            placeholder={platform.placeholder}
                                                            className="flex-1 h-12 px-4 bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Heading Type */}
                                    {uiType === "heading" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <LayoutTemplate size={14} className="text-slate-400" /> Type
                                                </label>
                                                <select
                                                    value={item.heading_type || "h1"}
                                                    onChange={(e) => updateItem(idx, 'heading_type', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="h1">H1</option>
                                                    <option value="h2">H2</option>
                                                    <option value="h3">H3</option>
                                                    <option value="h4">H4</option>
                                                    <option value="h5">H5</option>
                                                    <option value="h6">H6</option>
                                                </select>
                                            </div>
                                            <InputField
                                                label="Text"
                                                value={item.text || item.title || ""}
                                                onChange={(e: any) => {
                                                    updateItem(idx, 'text', e.target.value);
                                                    updateItem(idx, 'title', e.target.value); // Sync for display
                                                }}
                                                placeholder="Enter heading text"
                                            />
                                        </>
                                    )}

                                    {/* Business Hours Type */}
                                    {uiType === "business_hours" && (
                                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Open 24/7</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Mark as always open.</p>
                                                    </div>
                                                    <ToggleSwitch checked={item.open_24_7 || false} onChange={v => updateItem(idx, 'open_24_7', v)} />
                                                </div>
                                                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Temporarily closed</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Mark as temporarily closed.</p>
                                                    </div>
                                                    <ToggleSwitch checked={item.temporarily_closed || false} onChange={v => updateItem(idx, 'temporarily_closed', v)} />
                                                </div>
                                            </div>

                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dIdx) => (
                                                <div key={day} className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
                                                        <Clock size={12} /> {day}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={day}
                                                            readOnly
                                                            className="w-1/3 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-400 outline-none"
                                                        />
                                                        <input
                                                            value={item[`day_${dIdx + 1}`] || ""}
                                                            onChange={(e) => updateItem(idx, `day_${dIdx + 1}`, e.target.value)}
                                                            placeholder="10:00 - 18:00, Closed or 24 H"
                                                            className="flex-1 h-12 px-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                                                    <Edit3 size={12} /> Additional notice
                                                </label>
                                                <textarea
                                                    value={item.additional_notice || ""}
                                                    onChange={(e: any) => updateItem(idx, 'additional_notice', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                    placeholder="Holiday notices, etc..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* PayPal Type */}
                                    {uiType === "paypal" && (
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <MonitorPlay size={14} className="text-slate-400" /> Type
                                                </label>
                                                <select
                                                    value={item.type || "buy_now"}
                                                    onChange={(e) => updateItem(idx, 'type', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="buy_now">Buy now</option>
                                                    <option value="add_to_cart">Add to cart</option>
                                                    <option value="donation">Donation</option>
                                                </select>
                                            </div>
                                            <InputField label="PayPal email" value={item.email || ""} onChange={(e: any) => updateItem(idx, 'email', e.target.value)} placeholder="your@paypal.com" icon={<Mail size={14} />} />
                                            <InputField label="Product title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Product Name" icon={<LayoutTemplate size={14} />} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Currency code" value={item.currency || "USD"} onChange={(e: any) => updateItem(idx, 'currency', e.target.value)} placeholder="USD" icon={<Globe size={14} />} />
                                                <InputField label="Price" value={item.price || ""} onChange={(e: any) => updateItem(idx, 'price', e.target.value)} placeholder="0.00" icon={<Zap size={14} />} />
                                            </div>
                                            <InputField label="Name" value={item.name || ""} onChange={(e: any) => updateItem(idx, 'name', e.target.value)} placeholder="Button Text" icon={<Megaphone size={14} />} />
                                        </div>
                                    )}

                                    {/* Collectors */}
                                    {["email_collector", "phone_collector", "contact_collector"].includes(uiType) && (
                                        <div className="space-y-5">
                                            <InputField
                                                label="Form Title"
                                                value={item.name || item.title || ""}
                                                onChange={(e: any) => {
                                                    updateItem(idx, 'name', e.target.value);
                                                    updateItem(idx, 'title', e.target.value);
                                                }}
                                                placeholder="e.g. Join the waitlist"
                                                icon={<Megaphone size={14} />}
                                            />
                                            <InputField
                                                label="Description"
                                                value={item.description || ""}
                                                onChange={(e: any) => updateItem(idx, 'description', e.target.value)}
                                                placeholder="Enter a brief description for this form..."
                                                textarea
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField
                                                    label="Input Placeholder"
                                                    value={item.placeholder || ""}
                                                    onChange={(e: any) => updateItem(idx, 'placeholder', e.target.value)}
                                                    placeholder="e.g. Your email..."
                                                />
                                                <InputField
                                                    label="Button Text"
                                                    value={item.button_text || "Submit"}
                                                    onChange={(e: any) => updateItem(idx, 'button_text', e.target.value)}
                                                    placeholder="Submit"
                                                />
                                            </div>
                                            <InputField
                                                label="Success Message"
                                                value={item.success_message || ""}
                                                onChange={(e: any) => updateItem(idx, 'success_message', e.target.value)}
                                                placeholder="Thank you! We'll be in touch."
                                            />
                                        </div>
                                    )}

                                    {/* Embeds */}
                                    {["spotify", "soundcloud", "youtube", "twitch", "vimeo", "tiktok_video"].includes(uiType) && (
                                        <InputField
                                            label={`${uiType.charAt(0).toUpperCase() + uiType.slice(1)} URL`}
                                            value={item.url || item.location_url || ""}
                                            onChange={(e: any) => {
                                                updateItem(idx, 'url', e.target.value);
                                                updateItem(idx, 'location_url', e.target.value);
                                            }}
                                            placeholder={`https://${uiType}.com/...`}
                                            icon={<LinkIcon size={14} />}
                                        />
                                    )}

                                    {/* Link Type */}
                                    {uiType === "link" && (
                                        <>
                                            <InputField
                                                label="Destination URL"
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder="https://example.com/"
                                                icon={<LinkIcon size={14} />}
                                            />
                                            <InputField
                                                label="Name"
                                                value={item.name || item.title || ""}
                                                onChange={(e: any) => {
                                                    updateItem(idx, 'name', e.target.value);
                                                    updateItem(idx, 'title', e.target.value);
                                                }}
                                                placeholder="Your Link Name"
                                                icon={<Megaphone size={14} />}
                                            />
                                        </>
                                    )}

                                    {/* Paragraph Type */}
                                    {uiType === "paragraph" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Edit3 size={14} className="text-slate-400" /> Text
                                            </label>
                                            <div className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                                <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                    <span className="text-xs font-bold text-slate-500">Normal</span>
                                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                                                    <div className="flex items-center gap-4 text-slate-400">
                                                        <span className="font-bold hover:text-primary cursor-pointer transition-colors">B</span>
                                                        <span className="italic hover:text-primary cursor-pointer transition-colors">I</span>
                                                        <span className="underline hover:text-primary cursor-pointer transition-colors">U</span>
                                                        <span className="line-through hover:text-primary cursor-pointer transition-colors">S</span>
                                                        <span className="hover:text-primary cursor-pointer transition-colors">A</span>
                                                        <LinkIcon size={14} className="hover:text-primary cursor-pointer transition-colors" />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={item.text || item.description || ""}
                                                    onChange={(e: any) => {
                                                        updateItem(idx, 'text', e.target.value);
                                                        updateItem(idx, 'description', e.target.value);
                                                    }}
                                                    rows={6}
                                                    className="w-full px-5 py-4 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none resize-none"
                                                    placeholder="Write content..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Avatar Type */}
                                    {uiType === "avatar" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <ImageIcon size={14} className="text-slate-400" /> Image
                                                </label>
                                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                                                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
                                                    </div>
                                                    <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:border-primary transition-all shadow-sm">
                                                        Choose File
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tight">.jpg, .png, .webp allowed. 2 MB maximum.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Maximize2 size={14} className="text-slate-400" /> Size
                                                </label>
                                                <select
                                                    value={item.size || "75x75px"}
                                                    onChange={(e) => updateItem(idx, 'size', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="75x75px">75x75px</option>
                                                    <option value="100x100px">100x100px</option>
                                                    <option value="125x125px">125x125px</option>
                                                    <option value="150x150px">150x150px</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Grid size={14} className="text-slate-400" /> Border Radius
                                                </label>
                                                <select
                                                    value={item.border_radius || "straight"}
                                                    onChange={(e) => updateItem(idx, 'border_radius', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="straight">Straight</option>
                                                    <option value="round">Round</option>
                                                    <option value="rounded">Rounded</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* Fallback for other types */}
                                    {!["heading", "link", "paragraph", "avatar", "image", "socials", "business_hours", "paypal", "email_collector", "phone_collector", "contact_collector", "spotify", "soundcloud", "youtube", "twitch", "vimeo", "tiktok_video", "hero_section", "stats_section", "cta_section", "brands_section", "portfolio_section", "services_section", "testimonials_section", "faq_section",
                                        "hero_aesthetic_section", "stats_minimal_section", "impact_section", "testimonial_highlight_section", "pricing_cards_section", "portfolio_minimal_section", "faq_cards_section", "cta_fullscreen_section"
                                    ].includes(uiType) && (
                                        <div className="space-y-4">
                                            <InputField
                                                label="Primary Text"
                                                value={item.title || item.name || ""}
                                                onChange={(e: any) => updateItem(idx, 'title', e.target.value)}
                                                placeholder="Enter text"
                                            />
                                            {!["modal_text", "business_hours", "contact_form", "email_collector", "phone_collector"].includes(uiType) && (
                                                <InputField label="Endpoint URL" value={item.url || item.location_url || ""} onChange={(e: any) => updateItem(idx, 'url', e.target.value)} placeholder="https://..." />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                                        <Info size={14} className="text-blue-500" />
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">All customization options available after creation.</p>
                                    </div>
                                </div>
                            );
                        })}

                        {/* ── Aesthetic Influencer forms (settings-based, outside items.map) ── */}
                        {(() => {
                            if (!editingBlock) return null;
                            const uiType = getUiTypeFromBlock(editingBlock, uiTypeOverrides);
                            const s = editingBlock.settings || {};
                            const upd = (field: string, value: any) => updateBlockSettings(field, value);
                            const aestheticTypes = [
                                "hero_aesthetic_section","stats_minimal_section","impact_section","testimonial_highlight_section","pricing_cards_section","portfolio_minimal_section","faq_cards_section","cta_fullscreen_section",
                                "header_profile_section", "social_proof_section", "featured_links_section", "content_grid_section", "offers_section", "testimonials_section", "faq_section", "contact_section"
                            ];
                            if (!aestheticTypes.includes(uiType)) return null;
                            return (
                                <div className="space-y-6 mt-2">

                                {/* Hero Aesthetic */}
                                {uiType === "hero_aesthetic_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Brand Name" value={s.brand_name || ""} onChange={(e: any) => upd('brand_name', e.target.value)} placeholder="Your Brand" />
                                        <InputField label="Headline" value={s.headline || ""} onChange={(e: any) => upd('headline', e.target.value)} placeholder="Aesthetic Authority" />
                                        <InputField label="Subheadline" value={s.subheadline || ""} onChange={(e: any) => upd('subheadline', e.target.value)} placeholder="Build your presence." />
                                        <InputField label="Description" value={s.description || ""} onChange={(e: any) => upd('description', e.target.value)} placeholder="Helping creators grow..." textarea />
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Profile Image</label>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                {s.profile_image && <img src={s.profile_image} className="w-12 h-12 rounded-lg object-cover" />}
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">{s.profile_image ? "Change" : "Upload Image"}</div>
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) upd('profile_image', url); }}} />
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CTA Buttons</p>
                                        {(s.buttons || []).map((btn: any, bIdx: number) => (
                                            <div key={bIdx} className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                <InputField label="Text" value={btn.text || ""} onChange={(e: any) => { const b = [...(s.buttons||[])]; b[bIdx]={...btn,text:e.target.value}; upd('buttons',b); }} />
                                                <InputField label="Link" value={btn.link || ""} onChange={(e: any) => { const b = [...(s.buttons||[])]; b[bIdx]={...btn,link:e.target.value}; upd('buttons',b); }} />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Stats Minimal */}
                                {uiType === "stats_minimal_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Stats</p>
                                        {(s.items || []).map((stat: any, i: number) => (
                                            <div key={i} className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                                                <InputField label="Value" value={stat.value||""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...stat,value:e.target.value}; upd('items',it); }} placeholder="124K" />
                                                <InputField label="Label" value={stat.label||""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...stat,label:e.target.value}; upd('items',it); }} placeholder="Followers" />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{value:"",label:""}])} className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-all"><Plus size={12}/> Add Stat</button>
                                    </div>
                                )}

                                {/* Impact */}
                                {uiType === "impact_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Title" value={s.title||""} onChange={(e: any) => upd('title',e.target.value)} placeholder="Impact Over Impressions" />
                                        <InputField label="Description" value={s.description||""} onChange={(e: any) => upd('description',e.target.value)} placeholder="We focus on real results." textarea />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Points</p>
                                        {(s.points||[]).map((pt: any, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3 relative group">
                                                <button onClick={() => { const pts=[...(s.points||[])]; pts.splice(i,1); upd('points',pts); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                                                <InputField label="Title" value={pt.title||""} onChange={(e: any) => { const pts=[...(s.points||[])]; pts[i]={...pt,title:e.target.value}; upd('points',pts); }} />
                                                <InputField label="Description" value={pt.description||""} onChange={(e: any) => { const pts=[...(s.points||[])]; pts[i]={...pt,description:e.target.value}; upd('points',pts); }} textarea />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('points',[...(s.points||[]),{title:"",description:""}])} className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-all"><Plus size={12}/> Add Point</button>
                                    </div>
                                )}

                                {/* Testimonial */}
                                {uiType === "testimonial_highlight_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Quote" value={s.quote||""} onChange={(e: any) => upd('quote',e.target.value)} placeholder="Working together transformed our brand..." textarea />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Author Name" value={s.author_name||""} onChange={(e: any) => upd('author_name',e.target.value)} placeholder="Sarah Chen" />
                                            <InputField label="Author Role" value={s.author_role||""} onChange={(e: any) => upd('author_role',e.target.value)} placeholder="Founder & CEO" />
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                            {s.author_image && <img src={s.author_image} className="w-10 h-10 rounded-full object-cover" />}
                                            <label className="flex-1 cursor-pointer">
                                                <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">{s.author_image ? "Change Photo" : "Upload Photo"}</div>
                                                <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) upd('author_image',url); }}} />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Header Profile Section */}
                                {uiType === "header_profile_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Name/Title" value={s.name || s.title || ""} onChange={(e: any) => upd('name', e.target.value)} placeholder="Your Name" />
                                        <InputField label="Bio" value={s.bio || s.description || ""} onChange={(e: any) => upd('bio', e.target.value)} placeholder="Tell your story..." textarea />
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Profile Avatar</label>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                {s.avatar && <img src={s.avatar} className="w-12 h-12 rounded-full object-cover" />}
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">{s.avatar ? "Change Avatar" : "Upload Avatar"}</div>
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) upd('avatar', url); }}} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-2">Cover Image</label>
                                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center gap-4">
                                                {s.cover_image && <img src={s.cover_image} className="w-20 h-12 rounded-lg object-cover" />}
                                                <label className="flex-1 cursor-pointer">
                                                    <div className="h-10 px-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">{s.cover_image ? "Change Cover" : "Upload Cover"}</div>
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) upd('cover_image', url); }}} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Social Proof */}
                                {uiType === "social_proof_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Social Stats</p>
                                        {(s.items || []).map((item: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <InputField label="Platform" value={item.platform || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...item,platform:e.target.value}; upd('items',it); }} />
                                                    <InputField label="Count" value={item.followers || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...item,followers:e.target.value}; upd('items',it); }} placeholder="1.2M" />
                                                </div>
                                                <InputField label="Link" value={item.url || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...item,url:e.target.value}; upd('items',it); }} />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{platform:"",followers:"",url:""}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add Stat</button>
                                    </div>
                                )}

                                {/* Featured Links */}
                                {uiType === "featured_links_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Featured Links</p>
                                        {(s.items || []).map((link: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <InputField label="Title" value={link.label || link.name || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...link,label:e.target.value}; upd('items',it); }} />
                                                <InputField label="Description" value={link.description || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...link,description:e.target.value}; upd('items',it); }} />
                                                <InputField label="URL" value={link.url || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...link,url:e.target.value}; upd('items',it); }} />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{label:"",description:"",url:""}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add Link</button>
                                    </div>
                                )}

                                {/* Content Grid */}
                                {uiType === "content_grid_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Grid Items</p>
                                        {(s.items || []).map((m: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <InputField label="Type" value={m.type || "video"} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...m,type:e.target.value}; upd('items',it); }} />
                                                    <InputField label="Caption" value={m.caption || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...m,caption:e.target.value}; upd('items',it); }} />
                                                </div>
                                                <InputField label="URL" value={m.url || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...m,url:e.target.value}; upd('items',it); }} />
                                                <div className="space-y-2">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Thumbnail</label>
                                                    <div className="flex items-center gap-4">
                                                        {m.thumbnail && <img src={m.thumbnail} className="w-10 h-10 rounded-lg object-cover" />}
                                                        <label className="flex-1 cursor-pointer">
                                                            <div className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold">Upload</div>
                                                            <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) { const it=[...(s.items||[])]; it[i]={...m,thumbnail:url}; upd('items',it); }}}} />
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{type:"video",caption:"",url:"",thumbnail:""}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add Media</button>
                                    </div>
                                )}

                                {/* Offers/Services */}
                                {uiType === "offers_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Exclusive Offers</p>
                                        {(s.items || []).map((offer: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <InputField label="Name" value={offer.name || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...offer,name:e.target.value}; upd('items',it); }} />
                                                <InputField label="Description" value={offer.description || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...offer,description:e.target.value}; upd('items',it); }} textarea />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <InputField label="Price" value={offer.price || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...offer,price:e.target.value}; upd('items',it); }} />
                                                    <InputField label="CTA Text" value={offer.cta_text || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...offer,cta_text:e.target.value}; upd('items',it); }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{name:"",description:"",price:"",cta_text:"Buy Now"}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add Offer</button>
                                    </div>
                                )}

                                {/* Testimonials */}
                                {uiType === "testimonials_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Testimonials</p>
                                        {(s.items || []).map((t: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <InputField label="Name" value={t.name || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...t,name:e.target.value}; upd('items',it); }} />
                                                <InputField label="Role" value={t.role || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...t,role:e.target.value}; upd('items',it); }} />
                                                <InputField label="Quote" value={t.quote || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...t,quote:e.target.value}; upd('items',it); }} textarea />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{name:"",role:"",quote:"",rating:5}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add Testimonial</button>
                                    </div>
                                )}

                                {/* FAQ */}
                                {uiType === "faq_section" && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">FAQ Items</p>
                                        {(s.items || []).map((faq: any, i: number) => (
                                            <div key={i} className="p-4 space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                                <InputField label="Question" value={faq.question || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...faq,question:e.target.value}; upd('items',it); }} />
                                                <InputField label="Answer" value={faq.answer || ""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...faq,answer:e.target.value}; upd('items',it); }} textarea />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{question:"",answer:""}])} className="w-full h-11 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-2 transition-all"><Plus size={14}/> Add FAQ</button>
                                    </div>
                                )}

                                {/* Contact Section */}
                                {uiType === "contact_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Email" value={s.email || ""} onChange={(e: any) => upd('email', e.target.value)} placeholder="hello@example.com" />
                                        <InputField label="Phone" value={s.phone || ""} onChange={(e: any) => upd('phone', e.target.value)} placeholder="+1 234 567 890" />
                                        <InputField label="WhatsApp" value={s.whatsapp || ""} onChange={(e: any) => upd('whatsapp', e.target.value)} placeholder="+1 234..." />
                                    </div>
                                )}

                                {/* Pricing Cards */}
                                {uiType === "pricing_cards_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Section Title" value={s.title||""} onChange={(e: any) => upd('title',e.target.value)} placeholder="Select Your Tier" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Plans</p>
                                        {(s.plans||[]).map((plan: any, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3 relative group">
                                                <button onClick={() => { const pl=[...(s.plans||[])]; pl.splice(i,1); upd('plans',pl); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <InputField label="Name" value={plan.name||""} onChange={(e: any) => { const pl=[...(s.plans||[])]; pl[i]={...plan,name:e.target.value}; upd('plans',pl); }} placeholder="Pro" />
                                                    <InputField label="Price" value={plan.price||""} onChange={(e: any) => { const pl=[...(s.plans||[])]; pl[i]={...plan,price:e.target.value}; upd('plans',pl); }} placeholder="$2,400" />
                                                </div>
                                                <InputField label="Button Text" value={plan.button?.text||""} onChange={(e: any) => { const pl=[...(s.plans||[])]; pl[i]={...plan,button:{...(plan.button||{}),text:e.target.value}}; upd('plans',pl); }} placeholder="Get Started" />
                                                <InputField label="Button Link" value={plan.button?.link||""} onChange={(e: any) => { const pl=[...(s.plans||[])]; pl[i]={...plan,button:{...(plan.button||{}),link:e.target.value}}; upd('plans',pl); }} placeholder="#contact" />
                                                <InputField label="Features (one per line)" value={(plan.features||[]).join('\n')} onChange={(e: any) => { const pl=[...(s.plans||[])]; pl[i]={...plan,features:e.target.value.split('\n')}; upd('plans',pl); }} textarea />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('plans',[...(s.plans||[]),{name:"",price:"",features:[],button:{text:"Get Started",link:"#"},highlight:false}])} className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-all"><Plus size={12}/> Add Plan</button>
                                    </div>
                                )}

                                {/* Portfolio Minimal */}
                                {uiType === "portfolio_minimal_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Section Title" value={s.title||""} onChange={(e: any) => upd('title',e.target.value)} placeholder="Style Showcase" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Images</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(s.items||[]).map((img: any, i: number) => (
                                                <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                                                    <img src={img.image||img} className="w-full h-full object-cover" />
                                                    <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                                                </div>
                                            ))}
                                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 hover:text-primary hover:border-primary cursor-pointer transition-all">
                                                <Plus size={18}/>
                                                <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) upd('items',[...(s.items||[]),{image:url}]); }}} />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* FAQ Cards */}
                                {uiType === "faq_cards_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Section Title" value={s.title||""} onChange={(e: any) => upd('title',e.target.value)} placeholder="Your Questions, Answered" />
                                        {(s.items||[]).map((faq: any, i: number) => (
                                            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-3 relative group">
                                                <button onClick={() => { const it=[...(s.items||[])]; it.splice(i,1); upd('items',it); }} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs">×</button>
                                                <InputField label="Question" value={faq.question||""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...faq,question:e.target.value}; upd('items',it); }} />
                                                <InputField label="Answer" value={faq.answer||""} onChange={(e: any) => { const it=[...(s.items||[])]; it[i]={...faq,answer:e.target.value}; upd('items',it); }} textarea />
                                            </div>
                                        ))}
                                        <button onClick={() => upd('items',[...(s.items||[]),{question:"",answer:""}])} className="w-full h-10 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-1 transition-all"><Plus size={12}/> Add FAQ</button>
                                    </div>
                                )}

                                {/* CTA Fullscreen */}
                                {uiType === "cta_fullscreen_section" && (
                                    <div className="space-y-4">
                                        <InputField label="Title" value={s.title||""} onChange={(e: any) => upd('title',e.target.value)} placeholder="Ready for Chic Impact?" />
                                        <InputField label="Subtitle" value={s.subtitle||""} onChange={(e: any) => upd('subtitle',e.target.value)} placeholder="Your audience is waiting." />
                                        <div className="grid grid-cols-2 gap-3">
                                            <InputField label="Button Text" value={s.button?.text||""} onChange={(e: any) => upd('button',{...(s.button||{}),text:e.target.value})} placeholder="Start Your Journey" />
                                            <InputField label="Button Link" value={s.button?.link||""} onChange={(e: any) => upd('button',{...(s.button||{}),link:e.target.value})} placeholder="#contact" />
                                        </div>
                                    </div>
                                )}

                                </div>
                            );
                        })()}
                    </div>
                )}
            </ModalShell>
            {isUploadingImage && (
                <div className="fixed bottom-6 right-6 z-[600] flex items-center gap-3 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-bold">Uploading image...</span>
                </div>
            )}
        </div>
    );
}

export default function BioLinkBuilder() { 
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <BioLinkBuilderContent />
        </Suspense>
    ); 
}
