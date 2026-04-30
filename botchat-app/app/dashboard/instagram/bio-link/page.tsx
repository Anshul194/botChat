"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon,
    ShoppingBag, SmartphoneNfc, Sparkles, ChevronLeft, ChevronRight,
    Settings, Zap, MoreHorizontal, PanelLeft, Columns, Search, Camera,
    Shuffle, Palette, KeyRound, ShieldAlert, CircleDot, Orbit, Megaphone, Code2, FileCode2, Info, Maximize2, Globe, Clock, Mail,
    Instagram, Twitter, Facebook, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
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
            <div className="fixed inset-0 z-[500] pointer-events-none">
                {/* ── MOBILE / TABLET OVERLAY ── */}
                <div className="xl:hidden pointer-events-auto absolute inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
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
                        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">{children}</div>
                        {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">{footer}</div>}
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

export default function BioLinkBuilder() {
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

    const [isArranging, setIsArranging] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activePanel, setActivePanel] = useState<"builder" | "preview">("builder");
    const [view, setView] = useState("blocks");
    const [advancedSettings, setAdvancedSettings] = useState<BioAdvancedSettings>(DEFAULT_ADVANCED_SETTINGS);
    const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
    const [growthTab, setGrowthTab] = useState("seo");
    const [showPassword, setShowPassword] = useState(false);

    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${instagramUsername}&id=${selectedPageId}`
        : `/p?u=${instagramUsername}&id=${selectedPageId}`;

    const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];
    const flatBlocks = (tabs || []).flatMap((tab: any) => tab.sections || []).flatMap((sec: any) => sec.blocks || []);
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
                
                setProfile(payload);
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
                const bData = bRes.data?.data || bRes.data || [];
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
            await api.post(`/bio/pages/${linkId}/apply-template`, {
                template: templateId
            });
            await fetchBuilderData();
            showModal("success", "Template Applied", `Successfully switched to ${templateId} layout.`);
        } catch {
            showModal("error", "Error", "Failed to apply template.");
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
        if (typeof window !== "undefined") {
            const ok = window.confirm("Are you sure you want to delete this block?");
            if (!ok) return;
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
        setEditingBlock({ ...editingBlock, items });
        syncBlockItemsLocally(editingBlock.id, items);
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
        try {
            const fd = new FormData(); fd.append("image", file);
            // This endpoint might also change? Assuming /bio/upload-image for now
            const res = await api.post("/bio-builder/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
            return res.data?.url;
        } catch { showModal("error", "Error", "Failed to upload image."); return null; }
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

            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ STABLE TOP BAR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
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

            {/* CREATOR WORKSPACE */}
            <div className="relative flex-1 flex overflow-hidden">
                {/* LEFT PANEL: TOOLS & PHASES */}
                <aside className={cn(
                    "bg-white dark:bg-slate-950 flex flex-col sticky top-0 h-screen z-20 transition-all duration-700 ease-in-out border-r border-slate-200 dark:border-white/5 shadow-2xl",
                    activePanel === "preview" ? "hidden xl:flex" : "flex",
                    showCarouselEditor ? "xl:w-[360px]" : "xl:w-[45%]"
                )}>
                    <div className="flex-1 overflow-y-auto px-6 pt-8 pb-10 no-scrollbar">

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
                                                        const isInactive = block.is_active === 0;
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
                                                                <div className="text-slate-300 dark:text-slate-600 shrink-0 cursor-grab active:cursor-grabbing group-hover:text-slate-400 transition-colors">
                                                                    <GripVertical size={16} />
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
                                                                            e.stopPropagation();
                                                                            const newStatus = isInactive ? 1 : 0;
                                                                            setTabs(prev => prev.map(tab => ({
                                                                                ...tab,
                                                                                sections: (tab.sections || []).map(sec => ({
                                                                                    ...sec,
                                                                                    blocks: (sec.blocks || []).map(b => b.id === block.id ? { ...b, is_active: newStatus } : b)
                                                                                }))
                                                                            })));
                                                                            try { await api.put(`/bio/blocks/${block.id}`, { is_active: newStatus }); } catch { /* silent */ }
                                                                        }}
                                                                        title={isInactive ? "Show block" : "Hide block"}
                                                                        className={cn(
                                                                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                                                                            isInactive
                                                                                ? "text-slate-300 dark:text-slate-600 hover:text-slate-500"
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
                                        <div className="space-y-6">
                                            {/* Category Grid for Mobile-Friendly Sidebar */}
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
                                                {GROWTH_TABS.map((tab) => (
                                                    <button key={tab.id} onClick={() => setGrowthTab(tab.id)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all",
                                                            growthTab === tab.id
                                                                ? `${tab.light} border-transparent ring-2 ${tab.ring}`
                                                                : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                                        )}>
                                                        <tab.icon size={16} className={cn("mb-1", growthTab === tab.id ? tab.text : "text-slate-400")} />
                                                        <span className={cn("text-[9px] font-black uppercase tracking-widest", growthTab === tab.id ? tab.text : "text-slate-500")}>{tab.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Active Content */}
                                            <div className="min-w-0">
                                                <AnimatePresence mode="wait">
                                                    <motion.div key={growthTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
                                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                                                        {/* Panel header */}
                                                        <div className={cn("px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3", activeGT.light)}>
                                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm", activeGT.bg)}>
                                                                <GtIcon size={18} />
                                                            </div>
                                                            <div>
                                                                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", activeGT.text)}>Growth Workstation</p>
                                                                <p className="text-sm font-black text-slate-900 dark:text-white">{activeGT.label}</p>
                                                            </div>
                                                        </div>

                                                        {/* Panel body */}
                                                        <div className="p-5 sm:p-7 space-y-6">

                                                            {/* SEO */}
                                                            {growthTab === "seo" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Block from search engines</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Adds noindex, nofollow meta tags to this page.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.seoBlock} onChange={(v) => setAdvancedSettings({ ...advancedSettings, seoBlock: v })} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">SEO Title</label>
                                                                    <input value={advancedSettings.seoTitle} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoTitle: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="My Awesome Bio Page" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Appears in browser tabs and search results.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meta Description</label>
                                                                    <textarea value={advancedSettings.seoDescription} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoDescription: e.target.value })}
                                                                        rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="Brief description of your page for search results." />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Recommended: 120–160 characters.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meta Keywords</label>
                                                                    <input value={advancedSettings.seoKeywords} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoKeywords: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="bio, links, creator, profile" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Comma-separated. Optional.</p>
                                                                </div>
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
                                                            </>)}


                                                            {/* BRANDING */}
                                                            {growthTab === "branding" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Display branding</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Show the BotChat branding badge on your public page.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.displayBranding} onChange={(v) => setAdvancedSettings({ ...advancedSettings, displayBranding: v })} />
                                                                </div>
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
                                                            </>)}

                                                            {/* PIXELS */}
                                                            {growthTab === "pixels" && (<>
                                                                <p className="text-[11px] text-slate-500">Connect your analytics pixels to track bio page visits and conversions.</p>
                                                                <div className="space-y-3">
                                                                    {[
                                                                        { key: "pixelFacebookEnabled", label: "Facebook Pixel", desc: "Track events with the Meta Pixel", icon: Facebook, color: "bg-blue-600" },
                                                                        { key: "pixelGoogleEnabled", label: "Google Analytics", desc: "Connect Google Analytics to this page", icon: Globe, color: "bg-red-500" },
                                                                    ].map(({ key, label, desc, icon: Ico, color }) => (
                                                                        <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs", color)}>
                                                                                    <Ico size={16} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                                                                                    <p className="text-[11px] text-slate-500">{desc}</p>
                                                                                </div>
                                                                            </div>
                                                                            <ToggleSwitch checked={(advancedSettings as any)[key]} onChange={(v) => setAdvancedSettings({ ...advancedSettings, [key]: v })} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>)}

                                                            {/* UTM */}
                                                            {growthTab === "utm" && (<>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Shuffle size={12} /> Source
                                                                    </label>
                                                                    <input value={advancedSettings.utmSource} onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmSource: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-300 dark:focus:border-amber-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="e.g. instagram, newsletter, google" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Monitor size={12} /> Medium
                                                                    </label>
                                                                    <input value={advancedSettings.utmMedium} onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmMedium: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-300 dark:focus:border-amber-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="e.g. social, link, banner, email" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Megaphone size={12} /> Campaign
                                                                    </label>
                                                                    <div className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center italic">
                                                                        Automatically set for each link based on the name.
                                                                    </div>
                                                                </div>

                                                                <div className="pt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Eye size={12} /> UTM preview
                                                                    </label>
                                                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                                                        <p className="text-xs font-mono text-amber-800 dark:text-amber-300 break-all leading-relaxed">
                                                                            {`?utm_source=${advancedSettings.utmSource || "source"}&utm_medium=${advancedSettings.utmMedium || "medium"}&utm_campaign={link_name}`}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">This query parameter will be appended to your destination URL.</p>
                                                                </div>
                                                            </>)}

                                                            {/* PROTECTION */}
                                                            {growthTab === "protection" && (<>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <KeyRound size={12} /> Page Password
                                                                    </label>
                                                                    <div className="relative group">
                                                                        <input
                                                                            type={showPassword ? "text" : "password"}
                                                                            value={advancedSettings.password}
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, password: e.target.value })}
                                                                            className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-300 dark:focus:border-red-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                            placeholder="••••••••" />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                                                                        >
                                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Require visitors to enter a password to access your page.</p>
                                                                </div>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                                            <ShieldAlert size={14} className="text-red-500" /> Sensitive content warning
                                                                        </p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5 ml-5">Ask visitors to confirm before accessing potentially sensitive content.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.sensitiveContentWarning} onChange={(v) => setAdvancedSettings({ ...advancedSettings, sensitiveContentWarning: v })} />
                                                                </div>
                                                            </>)}

                                                            {/* ── POPUP (BRANDED BUTTON) ── */}
                                                            {growthTab === "popup" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Enable branded button</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Show a floating button that opens a modal popup.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.brandedButtonEnabled} onChange={(v) => setAdvancedSettings({ ...advancedSettings, brandedButtonEnabled: v })} />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <ImageIcon size={12} /> Branded icon
                                                                    </label>
                                                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent transition-all">
                                                                        <div className="flex-1">
                                                                            <input
                                                                                type="file"
                                                                                id="branded-icon-upload"
                                                                                className="hidden"
                                                                                accept=".jpg,.jpeg,.png,.ico,.svg,.gif,.webp"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleUploadImage(e.target.files[0]);
                                                                                        if (url) setAdvancedSettings({ ...advancedSettings, brandedIconUrl: url });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor="branded-icon-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-white dark:bg-slate-700 px-4 text-xs font-semibold text-slate-900 border border-slate-200 dark:border-slate-600 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                                                Choose File
                                                                            </label>
                                                                            <span className="ml-3 text-xs text-slate-500 font-medium truncate max-w-[200px] inline-block align-middle">
                                                                                {advancedSettings.brandedIconUrl ? advancedSettings.brandedIconUrl.split('/').pop() : 'No file chosen'}
                                                                            </span>
                                                                        </div>
                                                                        {advancedSettings.brandedIconUrl && (
                                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                                                                                <img src={advancedSettings.brandedIconUrl} alt="Icon Preview" className="w-full h-full object-cover" />
                                                                                <button onClick={() => setAdvancedSettings({ ...advancedSettings, brandedIconUrl: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl flex items-center justify-center">
                                                                                    <X size={10} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Make sure it's a 1:1 ratio sized image with transparent background. .jpg, .jpeg, .png, .ico, .svg, .gif, .webp allowed. 2 MB maximum.</p>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Modal title</label>
                                                                    <input value={advancedSettings.brandedModalTitle} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalTitle: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fuchsia-300 dark:focus:border-fuchsia-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="Your Modal Title" />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Modal content</label>
                                                                    <textarea value={advancedSettings.brandedModalContent} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalContent: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fuchsia-300 dark:focus:border-fuchsia-700 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="Write your modal content here..." />
                                                                    <p className="text-[11px] text-slate-400 ml-1">This field accepts the usage of HTML.</p>
                                                                </div>
                                                            </>)}

                                                            {/* ADVANCED / MORE */}
                                                            {growthTab === "more" && (<>
                                                                {[
                                                                    { key: "enableShareButton", label: "Share button", desc: "Show a share button at the top of your page." },
                                                                    { key: "enableScrollButtons", label: "Scroll buttons", desc: "Add scroll-to-top and scroll-to-bottom buttons." },
                                                                    { key: "enableDirectoryDisplaying", label: "Directory listing", desc: "Make your bio page public in BotChat's directory." },
                                                                ].map(({ key, label, desc }) => (
                                                                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                                                                            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                                                                        </div>
                                                                        <ToggleSwitch checked={(advancedSettings as any)[key]} onChange={(v) => setAdvancedSettings({ ...advancedSettings, [key]: v })} />
                                                                    </div>
                                                                ))}

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Leap Link URL</label>
                                                                    <input value={advancedSettings.leapLinkUrl} onChange={(e) => setAdvancedSettings({ ...advancedSettings, leapLinkUrl: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="https://example.com/" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Redirect all visitors to this URL. Leave empty to disable.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Custom CSS</label>
                                                                    <textarea value={advancedSettings.customCss} onChange={(e) => setAdvancedSettings({ ...advancedSettings, customCss: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-xs font-mono text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="body { background: blue !important; }" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Custom JS</label>
                                                                    <textarea value={advancedSettings.customJs} onChange={(e) => setAdvancedSettings({ ...advancedSettings, customJs: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-xs font-mono text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="console.log('Hello world');" />
                                                                </div>
                                                            </>)}

                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* SAVE BUTTON */}
                                                <div className="mt-5">
                                                    <button onClick={handleSaveAdvanced} disabled={isSavingAdvanced}
                                                        className={cn("w-full h-13 py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60",
                                                            activeGT.bg, "hover:opacity-90", "shadow-" + activeGT.color + "-500/20")}>
                                                        {isSavingAdvanced ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Growth Settings</>}
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
                    "flex-1 bg-slate-50 dark:bg-slate-950 relative flex items-center justify-center p-4 sm:p-12 transition-all duration-1000 ease-in-out z-10",
                    "sticky top-0 h-screen overflow-hidden",
                    activePanel === "preview" ? "flex" : "hidden xl:flex",
                    showCarouselEditor && "xl:pr-[400px]"
                )}>
                    {/* Live Preview Status Badge */}


                    {/* Premium Decorative Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-100">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] dark:bg-primary/10" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] dark:bg-indigo-500/10" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent dark:from-white/5" />
                    </div>

                    <div className={cn(
                        "transition-all duration-1000 ease-in-out flex items-center justify-center w-full h-full",
                        showCarouselEditor ? "scale-[0.85]" : "scale-100"
                    )}>
                        <PhonePreview
                            profile={profile}
                            tabs={tabs}
                            selectedTabId={selectedTabId}
                            setSelectedTabId={setSelectedTabId}
                            instagramUsername={instagramUsername}
                            viewportOffset={0}
                            previewWidth={360}
                            uiTypeOverrides={uiTypeOverrides}
                            layoutStyle={profile?.settings?.layoutStyle || "standard"}
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

                {/* ── GLOBAL FLOATING PHASE DOCK ── */}
                <div className={cn(
                    "fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] w-full px-6 transition-all duration-700 ease-in-out",
                    showCarouselEditor ? "max-w-[550px]" : "max-w-[650px]"
                )}>
                    <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-3xl rounded-[32px] p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex items-center gap-2 border border-white/10 ring-1 ring-white/10">
                        <div className="flex-1 flex items-center gap-1">
                            {PHASES.map((p, idx) => (
                                <button key={p.id} onClick={() => setView(p.id)} className={cn(
                                    "flex-1 h-14 rounded-[22px] flex flex-col items-center justify-center gap-1 transition-all relative group",
                                    view === p.id ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xl scale-[1.05] z-10" : "text-slate-400 hover:bg-white/5"
                                )}>
                                    <p.Icon size={18} className={cn("transition-transform duration-300", view === p.id ? "scale-110" : "scale-100 opacity-60 group-hover:opacity-100")} />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none">{p.label.split('.')[1]}</span>
                                    {view === p.id && <motion.div layoutId="phase-dot-global" className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_theme(colors.primary.DEFAULT)]" />}
                                </button>
                            ))}
                        </div>
                        {nextPhase && (
                            <button onClick={() => setView(nextPhase.id)}
                                className="h-14 px-6 rounded-[22px] bg-primary text-white flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-all shadow-lg group">
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] leading-none">Next</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MOBILE SWITCHER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
            <div className="xl:hidden fixed bottom-4 left-4 right-4 z-[200] h-16 bg-primary backdrop-blur-2xl rounded-[22px] flex p-1.5 shadow-2xl border border-white/20">
                <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-primary shadow-lg' : 'text-white/60')}>
                    <Edit3 size={16} /> Studio
                </button>
                <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-primary shadow-lg' : 'text-white/60')}>
                    <Eye size={16} /> Portal
                </button>
            </div>

            {/* MODALS */}
            <ModalShell open={showAddBlock} onClose={() => setShowAddBlock(false)} title="Create Block" icon={<Grid size={20} />} maxWidthClassName="sm:max-w-5xl">
                <BlockMarketplaceContent
                    onSelect={handleSelectBlockType}
                />
            </ModalShell>

            <ModalShell open={showCarouselEditor && !!editingBlock} onClose={() => setShowCarouselEditor(false)}
                title={`Edit ${getUiTypeFromBlock(editingBlock).replace(/_/g, " ") || "Block"}`}
                icon={editingBlock && (BLOCK_ICONS[getUiTypeFromBlock(editingBlock)] || <LayoutTemplate size={20} />)}
                footer={
                    <div className="flex flex-col sm:flex-row gap-3">
                        {!editingBlock?._isNew && (
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
                        )}
                        <button
                            onClick={saveEditor}
                            disabled={isSavingBlock}
                            className={cn(
                                "flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl transition-all flex items-center justify-center gap-2",
                                isSavingBlock ? "bg-slate-100 text-slate-400" : "bg-primary text-white hover:opacity-90 active:scale-[0.98]"
                            )}
                        >
                            {isSavingBlock ? (
                                <><Loader2 size={16} className="animate-spin" /> Saving...</>
                            ) : (
                                editingBlock?._isNew ? "Create block" : "Save Changes"
                            )}
                        </button>
                    </div>
                }>
                {editingBlock && (
                    <div className="space-y-6">
                        {(editingBlock.items || []).map((item: any, idx: number) => {
                            const uiType = getUiTypeFromBlock(editingBlock);

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
                                    {!["heading", "link", "paragraph", "avatar", "image", "socials", "business_hours", "paypal", "email_collector", "phone_collector", "contact_collector", "spotify", "soundcloud", "youtube", "twitch", "vimeo", "tiktok_video"].includes(uiType) && (
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
                    </div>
                )}
            </ModalShell>
        </div>
    );
}
