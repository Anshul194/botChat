import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Clock, MoreHorizontal, Globe, Mail, Smartphone, SmartphoneNfc, Camera, Sparkles, Youtube, Video, Grid, Play, DollarSign, Music, MapPin, ShieldAlert, User, ArrowUpRight } from "lucide-react";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles, isColorLight, isBgLight } from "./TemplateSystem";
import { getUiTypeFromBlock, isMediaType } from "./builder-utils";

export const BrandIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
    switch (name.toLowerCase()) {
        case 'instagram':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="url(#ig-grad)">
                    <defs>
                        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
            );
        case 'twitter':
        case 'x':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
        case 'facebook':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        case 'youtube':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
        case 'tiktok':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;
        case 'whatsapp':
        case 'tel':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366"><path d="M12.031 0C5.385 0 .002 5.385.002 12.031c0 2.119.546 4.184 1.59 6h-.002l-1.92 7 7.158-1.879a12.008 12.008 0 0 0 5.203 1.196L12.03 24c6.646 0 12.03-5.383 12.03-12.03S18.677 0 12.031 0H12.031zM11.996 22H11.986a9.98 9.98 0 0 1-5.111-1.4l-.364-.216-3.8.997 1.01-3.7-.238-.376C2.399 15.65 1.889 13.882 1.889 12.031 1.889 6.452 6.425 1.916 12 1.916c2.709 0 5.253 1.055 7.17 2.973 1.916 1.917 2.972 4.461 2.97 7.168.002 5.58-4.532 10.116-10.111 10.116H11.996zm5.556-7.585c-.305-.152-1.802-.888-2.08-.992-.28-.104-.482-.153-.686.151-.205.305-.788.993-.967 1.196-.178.204-.356.23-.66.077-1.4-.712-2.585-1.579-3.486-2.905-.236-.347.01-.527.169-.738.163-.217.305-.356.457-.558.152-.204.204-.343.305-.572.102-.23.05-.433-.025-.586-.077-.152-.686-1.654-.94-2.264-.247-.594-.496-.513-.686-.523l-.585-.01c-.204 0-.533.076-.813.38s-1.066 1.042-1.066 2.54 1.092 2.946 1.245 3.148c.152.204 2.146 3.275 5.195 4.59.723.313 1.288.5 1.727.64.726.233 1.388.2 1.908.121.583-.087 1.802-.736 2.055-1.447.254-.71.254-1.32.178-1.448-.076-.127-.28-.204-.585-.356z" /></svg>;
        case 'email':
            return <Mail size={size} />;
        case 'spotify':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.2-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>;
        case 'tel':
            return <Smartphone size={size} />;
        default:
            return <Globe size={size} />;
    }
}

export const PhonePreview = ({ profile, tabs, selectedTabId, setSelectedTabId, instagramUsername, viewportOffset = 280, previewWidth = 300, uiTypeOverrides = {}, layoutStyle = "standard" }: any) => {
    const [activePortfolioTab, setActivePortfolioTab] = React.useState("portfolio");
    const [portfolioSubView, setPortfolioSubView] = React.useState("main"); // 'main' or 'projects'
    // Use only the sections from the selected tab to prevent cross-tab duplication
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const previewSections = currentTab?.sections || [];
    const theme = getTheme(profile?.theme);

    const allBlocks = previewSections.flatMap((s: any) => s.blocks || []);

    // Extraction: Only pin the VERY FIRST avatar block found to the top
    const topAvatar = allBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "avatar");

    // Aggressive Deduplication: Hide all avatar blocks. 
    // Also hide any image block that appears significantly early or has the same URL.
    const avatarUrls = topAvatar ? [topAvatar.settings?.image || topAvatar.settings?.url].filter(Boolean) : [];

    let firstActualContentFound = false;
    const otherBlocks = allBlocks.filter((b, idx) => {
        const type = getUiTypeFromBlock(b, uiTypeOverrides);
        if (type === "avatar") return false;

        const url = b.settings?.image || b.settings?.url;
        const isDuplicateUrl = url && avatarUrls.includes(url);

        // If we have a pinned avatar and this is an early image block without a custom URL destination, treat it as a duplicate
        if (type === "image" && topAvatar && !firstActualContentFound && (isDuplicateUrl || !b.location_url || b.location_url === "https://")) {
            return false;
        }

        if (['link', 'socials', 'heading', 'business_hours'].includes(type)) {
            firstActualContentFound = true;
        }

        return true;
    });

    // Intelligent Logic for Professional Portfolio Stacking
    const groupedRows: any[] = [];
    let linkGrid: any[] = [];
    let activeSection: { heading: any; blocks: any[] } | null = null;

    otherBlocks.forEach((block: any) => {
        const type = getUiTypeFromBlock(block, uiTypeOverrides);
        const settings = block.settings || {};

        if (type === "heading") {
            if (linkGrid.length > 0) { groupedRows.push({ type: 'grid', blocks: linkGrid }); linkGrid = []; }
            if (activeSection) { groupedRows.push({ type: 'section', ...activeSection }); }
            activeSection = { heading: block, blocks: [] };
        } else if (type === "link") {
            if (activeSection) {
                activeSection.blocks.push(block);
            } else {
                linkGrid.push(block);
            }
        } else {
            if (linkGrid.length > 0) { groupedRows.push({ type: 'grid', blocks: linkGrid }); linkGrid = []; }
            if (activeSection) {
                activeSection.blocks.push(block);
            } else {
                groupedRows.push({ type: 'single', block });
            }
        }
    });
    if (linkGrid.length > 0) groupedRows.push({ type: 'grid', blocks: linkGrid });
    if (activeSection) groupedRows.push({ type: 'section', ...activeSection });

    const getYouTubeId = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const renderBlockUI = (block: any, isTiled: boolean = false, gidx: number = 0, hideLabel: boolean = false) => {
        const type = getUiTypeFromBlock(block, uiTypeOverrides);
        const settings = block.settings || {};
        const alignment = settings.text_alignment || (isTiled ? "left" : "center");

        // ── Detect if the template background is bright (checks ALL gradient stops) ──
        const themeBgStr = (theme.bgStyle.background as string) || '';
        const themeBgIsLight = isBgLight(themeBgStr);

        // ── Effective page text color: if bg bright, always use black ──
        const effectiveTextColor = themeBgIsLight ? '#000000' : theme.textColor;

        const baseStyle: any = { ...(theme.btnStyle || {}) };
        if (settings.background_color && settings.background_color.length > 7 && settings.background_color.endsWith("00")) {
            baseStyle.background = "rgba(0,0,0,0.05)";
        } else if (settings.background_color && settings.background_color !== "#ffffff" && settings.background_color !== "#000000") {
            baseStyle.background = settings.background_color;
        }

        // ── Auto Contrast Logic for buttons ──
        // If template bg is bright, always force dark text (ignore saved light text_color)
        const finalBg = baseStyle.background || theme.btnStyle?.background;
        const blockBgIsLight = finalBg && typeof finalBg === "string" ? isColorLight(finalBg) : true;

        if (themeBgIsLight) {
            // Template is bright — force dark text regardless of saved color
            baseStyle.color = "#000000";
        } else if (settings.text_color && settings.text_color !== "#020617" && settings.text_color !== "inherit") {
            // User saved a color — check if it's readable against the block background
            if (!blockBgIsLight && (settings.text_color === "#000000" || settings.text_color === "#020617")) {
                baseStyle.color = "#ffffff"; // Force white on dark bg if saved color is black
            } else {
                baseStyle.color = settings.text_color;
            }
        } else if (!blockBgIsLight) {
            // Dark button background — force light text
            baseStyle.color = "#ffffff";
        } else if (blockBgIsLight) {
            // Light button background — force dark text
            baseStyle.color = "#000000";
        }
        if (settings.border_radius === "straight") baseStyle.borderRadius = "0px";
        else if (settings.border_radius === "rounded") baseStyle.borderRadius = "20px";
        else if (settings.border_radius === "round") baseStyle.borderRadius = "9999px";

        const buttonStyle = { ...baseStyle, textAlign: alignment as any };
        const displayLabel = hideLabel ? null : (settings.title || ((!/heading|paragraph|avatar|image|socials|links/i.test(settings.text || "")) ? settings.text : null) || ((!/heading|paragraph|avatar|image|socials|links/i.test(settings.name || "")) ? settings.name : null));

        return (
            <motion.div key={block.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * gidx }} className={isTiled ? "h-full" : "w-full"}>
                {/* Link Block */}
                {type === "link" && (
                    <a href={block.location_url} className={`w-full group transition-all duration-300 active:scale-[0.97] hover:brightness-110 flex ${isTiled ? 'flex-col items-start min-h-[120px] justify-between p-5' : 'items-center justify-center min-h-[64px] py-4 px-8 shadow-md'}`} style={{ ...buttonStyle, borderRadius: isTiled && buttonStyle.borderRadius === '9999px' ? '32px' : buttonStyle.borderRadius }}>
                        {settings.icon ? <i className={`${settings.icon} ${isTiled ? 'text-2xl mb-2 opacity-100' : 'absolute left-8 text-xl opacity-80'} group-hover:scale-110 transition-transform`}></i> : (isTiled && <Globe size={24} className="mb-2 opacity-40" />)}
                        <span className={`font-bold ${isTiled ? 'text-[14px] leading-tight mt-auto' : 'text-[16px] truncate max-w-[80%]'}`}>{displayLabel || "Open Website"}</span>
                        {!isTiled && <MoreHorizontal size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 transition-opacity" />}
                    </a>
                )}

                {/* Heading Block */}
                {type === "heading" && (
                    <div className={cn("pt-8 pb-3", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <h2 className={cn(
                            "text-[24px] font-black tracking-tighter leading-tight",
                            profile.theme === 'modern_fisher' && "text-[32px] first-of-type:text-[#FF6B00]"
                        )} style={{ color: profile.theme === 'modern_fisher' ? undefined : effectiveTextColor }}>
                            {displayLabel || "Untitled Section"}
                        </h2>
                    </div>
                )}

                {/* Paragraph Block */}
                {type === "paragraph" && (
                    <div className={cn("pb-2", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <p className={cn(
                            "text-[15px] leading-relaxed opacity-70 font-medium whitespace-pre-line",
                            profile.theme === 'modern_fisher' && "text-[16px] opacity-80"
                        )} style={{ color: effectiveTextColor }}>
                            {settings.description || settings.text}
                        </p>
                    </div>
                )}

                {/* Socials Block */}
                {type === "socials" && settings.socials && (
                    <div className="flex flex-wrap items-center gap-4 py-6" style={{ justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
                        {Object.entries(settings.socials).map(([key, value]: any) => value && (
                            <a key={key} href={value.includes("@") ? `mailto:${value}` : value.startsWith("+") || (value.length > 5 && /^\d+$/.test(value)) ? `tel:${value}` : value} target="_blank" rel="noopener noreferrer"
                                className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg rounded-full hover:scale-110 active:scale-95 transition-all">
                                <BrandIcon name={key} size={22} />
                            </a>
                        ))}
                    </div>
                )}

                {/* Avatar Block */}
                {type === "avatar" && (
                    <div className="flex flex-col items-center py-6 group">
                        <div className="relative">
                            <div className={cn(
                                "absolute -inset-4 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                                profile.theme === 'modern_fisher' ? "bg-orange-500/10" : "bg-white/5"
                            )} />
                            <div className={cn(
                                "relative overflow-hidden border-[4px] shadow-2xl transition-all duration-500",
                                profile.theme === 'modern_fisher' ? "border-white bg-[#f5eadb]" : "border-white/10"
                            )} style={{ borderRadius: buttonStyle.borderRadius === '9999px' ? '9999px' : '40px', width: settings.size || 140, height: settings.size || 140 }}>
                                <img src={settings.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        </div>
                        {displayLabel && !hideLabel && (
                            <p className="mt-5 text-[17px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                        )}
                    </div>
                )}

                {/* Embed Modules */}
                {(isMediaType(type) || ['youtube', 'spotify', 'soundcloud', 'paypal'].includes(type)) && (
                    <div className="overflow-hidden w-full relative group mt-4 mb-2 shadow-2xl border border-white/5" style={{ ...buttonStyle, padding: 0, borderRadius: '28px', background: 'rgba(0,0,0,0.1)' }}>
                        {type === 'youtube' && (block.location_url || settings.url) ? (
                            <div className="aspect-video w-full bg-black">
                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(block.location_url || settings.url)}`} frameBorder="0" allowFullScreen />
                            </div>
                        ) : type === 'spotify' && settings.url ? (
                            <iframe className="w-full" src={`https://open.spotify.com/embed/${settings.url.includes('track') ? 'track' : 'playlist'}/${settings.url.split('/').pop()}`} height="152" frameBorder="0" allowTransparency="true" allow="encrypted-media" />
                        ) : type === 'paypal' ? (
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-900/40 p-1">
                                <div className="bg-white/5 backdrop-blur-3xl rounded-[24px] p-8 flex flex-col items-center text-center border border-white/10 shadow-inner">
                                    <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                                        <DollarSign size={32} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight mb-1 text-white">{settings.title || "Support My Work"}</h3>
                                    <p className="text-[13px] font-bold text-blue-300/60 uppercase tracking-widest mb-6">
                                        {settings.price} {settings.currency === "US" ? "USD" : settings.currency}
                                    </p>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                                    <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Send Secure Payment
                                    </button>
                                    <p className="mt-4 text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldAlert size={10} /> Secure PayPal Checkout
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <img src={settings.image || settings.url || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-[320px] object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                {displayLabel && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <h4 className="text-white text-lg font-black tracking-tight">{displayLabel}</h4>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Business Hours */}
                {type === "business_hours" && (
                    <div className="p-8 mt-4 mb-2 border border-white/5 shadow-xl" style={{ ...buttonStyle, background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-3 mb-6 justify-center">
                            <Clock size={20} className="opacity-40" />
                            <span className="font-black uppercase tracking-widest text-[11px] opacity-40">Business Hours</span>
                        </div>
                        <div className="space-y-4">
                            {['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'].map((k, i) => settings[k] && (
                                <div key={k} className="flex justify-between items-center text-[14px]">
                                    <span className="font-bold opacity-30 text-left uppercase text-[10px] tracking-widest">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                                    <span className="font-bold text-right flex-1 border-b border-white/5 pb-1">{settings[k]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="relative mx-auto flex items-center justify-center p-2" style={{ width: `min(${previewWidth}px, 100%)`, height: `min(820px, calc(100vh - ${viewportOffset}px))` }}>
            {/* iPhone 16 Pro Frame */}
            <div className="relative w-full h-full bg-[#080808] rounded-[4rem] p-[10px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 overflow-hidden">
                {/* Metallic bezel highlights */}
                <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-white/10 to-transparent z-20" />
                <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-r from-white/5 to-transparent z-20" />
                <div className="absolute inset-y-0 right-0 w-0.5 bg-gradient-to-l from-white/5 to-transparent z-20" />

                {/* Dynamic Island */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-[20px] z-[100] flex items-center justify-center border border-white/5 shadow-inner">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20 mr-1.5 blur-[1px]" />
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                </div>

                {/* Screen Content */}
                <div className="rounded-[3.2rem] overflow-hidden w-full h-full relative flex flex-col shadow-inner" style={{ background: theme.bgStyle.background || "#F3F4F6", color: theme.textColor || "#0F172A" }}>
                    <div className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 w-full", layoutStyle === "portfolio" ? "bg-white" : "p-6")}>
                        {layoutStyle === "portfolio" ? (
                            <div className="flex flex-col bg-[#f4f6f8] min-h-full w-full">
                                {/* Wall of Portfolios Sticky Tabs */}
                                <div className="sticky top-0 z-50 bg-white border-b border-gray-200 flex px-6 pt-4 gap-6 shrink-0">
                                    <button 
                                        type="button"
                                        onClick={() => setActivePortfolioTab("profile")}
                                        className={cn("pb-3 text-[15px] font-bold transition-all relative", activePortfolioTab === "profile" ? "text-black" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        Profile
                                        {activePortfolioTab === "profile" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setActivePortfolioTab("portfolio")}
                                        className={cn("pb-3 text-[15px] font-bold transition-all relative", activePortfolioTab === "portfolio" ? "text-black" : "text-gray-400 hover:text-gray-600")}
                                    >
                                        Portfolio
                                        {activePortfolioTab === "portfolio" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></div>}
                                    </button>
                                </div>

                                {activePortfolioTab === "profile" ? (
                                    /* Profile Tab - White Card Overlay */
                                    <div className="p-4 py-6 w-full h-full flex-1">
                                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                                            <img 
                                                src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"} 
                                                className="w-[120px] h-[120px] rounded-full object-cover mb-5 shadow-sm" 
                                            />
                                            
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-orange-600 font-black text-[10px] bg-orange-50 px-2.5 py-1 rounded-sm uppercase tracking-widest">Open to Work</span>
                                            </div>
                                            
                                            <h1 className="text-3xl font-black text-gray-900 mb-1">{profile?.title || "Qasim Khalid"}</h1>
                                            
                                            <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-6">
                                                <span>@{instagramUsername || "username"}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                                                <span className="flex items-center gap-1"><MapPin size={14} /> Global</span>
                                            </div>
                                            
                                            <p className="text-[12px] font-bold text-gray-900 uppercase tracking-widest mb-6">Creative Director</p>
                                            
                                            <div className="w-full flex gap-3 mb-6">
                                                <button type="button" className="flex-1 bg-gray-900 text-white rounded-full py-3.5 font-bold text-sm hover:bg-black transition shadow-md">Message</button>
                                                <button type="button" className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition shrink-0"><MoreHorizontal size={18} /></button>
                                            </div>
                                            
                                            <div className="text-left w-full pt-6 border-t border-gray-100">
                                                <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About</p>
                                                <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
                                                    {profile?.bio || "Transforming digital noise into strategic visual identities that captivate and convert. With a global perspective and a passion for impactful design."}
                                                </p>
                                            </div>
                                            
                                            <div className="text-left w-full mt-8 pt-6 border-t border-gray-100">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <p className="text-[13px] font-bold text-gray-900 whitespace-nowrap">6 Years</p>
                                                    <p className="text-[13px] font-bold text-gray-400">Experience Includes:</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"><span className="text-[10px] font-black text-gray-300">CM</span></div>
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-sm"><span className="text-[10px] font-black text-gray-300">HP</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Portfolio Tab - Full Continuous Template */
                                    <div className="flex-1 w-full flex flex-col bg-white">
                                        {portfolioSubView === "main" ? (
                                            <>
                                                {/* Hero Banner Section */}
                                                <div className="relative w-full aspect-[4/5] bg-black flex-shrink-0">
                                                    <img 
                                                        src={topAvatar?.settings?.image || profile?.avatar || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"} 
                                                        alt="Cover" 
                                                        className="w-full h-full object-cover opacity-90"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"></div>
                                                    
                                                    {/* User Info overlay at bottom */}
                                                    <div className="absolute bottom-8 left-6 pr-6 w-full z-10">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="px-2 py-0.5 bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">Featured</span>
                                                            <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">Open to work</span>
                                                        </div>
                                                        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                                                            {profile?.title || "Your Name"}
                                                        </h1>
                                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-5">
                                                            <span>@{instagramUsername || "username"}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                                            <span className="flex items-center gap-1"><MapPin size={12} /> Global</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-3 pr-6">
                                                            <button type="button" className="flex-1 bg-white text-black rounded-full py-3.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-100 transition font-bold text-sm shadow-lg">
                                                                <Mail size={16} /> Contact Me
                                                            </button>
                                                            <button type="button" className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition flex-shrink-0">
                                                                <MoreHorizontal size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Intro & Logos Section */}
                                                <div className="p-6 pt-10 text-center border-b border-gray-100">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About</p>
                                                    <h2 className="text-xl font-bold text-gray-900 leading-tight mb-8">
                                                        {profile?.bio || "Stand Out Design & Visual Identities for Global Creators, Startups & Clean Tech Mavericks."}
                                                    </h2>
                                                    <div className="flex items-center justify-center gap-6 opacity-60">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L1</span></div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L2</span></div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L3</span></div>
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-[10px] font-bold">L4</span></div>
                                                    </div>
                                                </div>

                                                {/* Featured Case Studies Section */}
                                                <div className="p-6 pb-12 border-b border-gray-100">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Featured Work</h3>
                                                    </div>
                                                    
                                                    {/* Dynamic Builder Tabs */}
                                                    {tabs && tabs.length > 0 && (
                                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                                                            {tabs.map((tab: any) => (
                                                                <button
                                                                    type="button"
                                                                    key={tab.id}
                                                                    onClick={() => setSelectedTabId(tab.id)}
                                                                    className={cn(
                                                                        "px-4 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all",
                                                                        selectedTabId === tab.id 
                                                                            ? "bg-black text-white" 
                                                                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                                                                    )}
                                                                >
                                                                    {tab.name || "Tab"}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Real Blocks mapped into Grid */}
                                                    <div className="flex flex-col gap-6">
                                                        {otherBlocks.length > 0 ? otherBlocks.map((block: any, idx: number) => {
                                                            const type = getUiTypeFromBlock(block, uiTypeOverrides);
                                                            const settings = block.settings || {};
                                                            const displayLabel = settings.title || settings.name || settings.text || type;
                                                            
                                                            if (isMediaType(type) || ['youtube', 'spotify'].includes(type) || type === 'image') {
                                                                return (
                                                                    <div key={block.id} className="group overflow-hidden">
                                                                        <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                                            {type === 'youtube' && (block.location_url || settings.url) ? (
                                                                                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(block.location_url || settings.url)}`} frameBorder="0" />
                                                                            ) : (
                                                                                <img src={settings.image || settings.url || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover" />
                                                                            )}
                                                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                                                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="px-1 flex justify-between items-start">
                                                                            <div>
                                                                                <h4 className="font-bold text-gray-900 text-lg mb-0.5">{displayLabel}</h4>
                                                                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Branding</p>
                                                                            </div>
                                                                            <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            if (type === "link") {
                                                                return (
                                                                    <a key={block.id} href={block.location_url} className="group bg-gray-50 hover:bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex items-center p-4 gap-4 transition-all">
                                                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                                                                            {settings.icon ? <i className={`${settings.icon} text-xl text-gray-600`}></i> : <Globe size={20} className="text-gray-600" />}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <h4 className="font-bold text-gray-900 text-[15px] truncate">{displayLabel}</h4>
                                                                            <p className="text-[12px] text-gray-500 truncate mt-0.5">{block.location_url}</p>
                                                                        </div>
                                                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                                                            <ArrowUpRight size={14} className="text-gray-600" />
                                                                        </div>
                                                                    </a>
                                                                );
                                                            }
                                                            return <div key={block.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">{renderBlockUI(block, false, idx)}</div>;
                                                        }) : (
                                                            /* Dummy Case Studies */
                                                            <>
                                                                <div className="group overflow-hidden">
                                                                    <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                                        <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&q=80" className="w-full h-full object-cover" />
                                                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="px-1 flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 text-lg mb-0.5">Fintech Rebrand</h4>
                                                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Brand Identity</p>
                                                                        </div>
                                                                        <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                                    </div>
                                                                </div>
                                                                <div className="group overflow-hidden mt-4">
                                                                    <div className="aspect-[4/3] bg-gray-100 rounded-3xl relative overflow-hidden mb-3 shadow-sm">
                                                                        <img src="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" className="w-full h-full object-cover" />
                                                                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm">
                                                                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Case Study</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="px-1 flex justify-between items-start">
                                                                        <div>
                                                                            <h4 className="font-bold text-gray-900 text-lg mb-0.5">Wellness App</h4>
                                                                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">UI/UX Design</p>
                                                                        </div>
                                                                        <ArrowUpRight size={18} className="text-gray-400 mt-1" />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setPortfolioSubView("projects")}
                                                        className="w-full mt-8 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all active:scale-[0.98]"
                                                    >
                                                        View All Work
                                                    </button>
                                                </div>

                                                {/* Services Section */}
                                                <div className="p-6 py-12 border-b border-gray-100 bg-gray-50/50">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Services</p>
                                                    <h3 className="text-2xl font-black text-gray-900 text-center mb-8 leading-tight">Services that transform brands</h3>
                                                    
                                                    <div className="flex flex-col">
                                                        <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-bold text-gray-400">01</span>
                                                                <h4 className="text-lg font-bold text-gray-900">Brand Identity</h4>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                                <ArrowUpRight size={14} />
                                                            </div>
                                                        </div>
                                                        <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-bold text-gray-400">02</span>
                                                                <h4 className="text-lg font-bold text-gray-900">UI/UX Design</h4>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                                <ArrowUpRight size={14} />
                                                            </div>
                                                        </div>
                                                        <div className="py-4 border-b border-gray-200 flex items-center justify-between group cursor-pointer">
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-sm font-bold text-gray-400">03</span>
                                                                <h4 className="text-lg font-bold text-gray-900">Web Development</h4>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                                                                <ArrowUpRight size={14} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* About Me Section */}
                                                <div className="p-6 py-12 border-b border-gray-100">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">About Me</p>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-6 leading-tight">Let's build something great your upcoming project.</h3>
                                                    
                                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Experience</p>
                                                            <p className="text-lg font-bold text-gray-900">6+ Years</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Location</p>
                                                            <p className="text-lg font-bold text-gray-900">Global</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Clients</p>
                                                            <p className="text-lg font-bold text-gray-900">50+ Worldwide</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <button type="button" className="w-full bg-black text-white rounded-full py-4 font-bold text-sm hover:bg-gray-800 transition">Book a Call</button>
                                                </div>

                                                {/* Process Section */}
                                                <div className="p-6 py-12 border-b border-gray-100 bg-gray-50/50">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Process</p>
                                                    <h3 className="text-2xl font-black text-gray-900 text-center mb-10 leading-tight">Follow an authentic process</h3>
                                                    
                                                    <div className="flex flex-col gap-6">
                                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 01</span>
                                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Discovery</h4>
                                                            <p className="text-sm text-gray-500">Understanding your brand, goals, and target audience.</p>
                                                        </div>
                                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 02</span>
                                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Design</h4>
                                                            <p className="text-sm text-gray-500">Crafting the visual identity and user experience.</p>
                                                        </div>
                                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded mb-3 inline-block">Step 03</span>
                                                            <h4 className="text-lg font-bold text-gray-900 mb-2">Delivery</h4>
                                                            <p className="text-sm text-gray-500">Launching the project with full documentation.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Success Stories */}
                                                <div className="p-6 py-12 border-b border-gray-100">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4 text-center">Testimonials</p>
                                                    <h3 className="text-2xl font-black text-gray-900 text-center mb-8 leading-tight">Client Success Stories</h3>
                                                    
                                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                                                        <div className="text-orange-500 text-4xl font-serif absolute top-4 left-4 opacity-20">"</div>
                                                        <p className="text-sm text-gray-700 leading-relaxed relative z-10 mb-6 font-medium">
                                                            Working with Qasim was a game changer for our brand. The attention to detail and strategic approach completely elevated our market presence.
                                                        </p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm">Sarah Jenkins</h4>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CEO, TechStart</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* FAQ */}
                                                <div className="p-6 py-12 border-b border-gray-100">
                                                    <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">FAQ</p>
                                                    <h3 className="text-2xl font-black text-gray-900 mb-8 leading-tight">Answers to your questions</h3>
                                                    
                                                    <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100">
                                                        <div className="py-4 flex justify-between items-center cursor-pointer">
                                                            <h4 className="text-sm font-bold text-gray-900">What is your typical timeline?</h4>
                                                            <span className="text-xl text-gray-400">+</span>
                                                        </div>
                                                        <div className="py-4 flex justify-between items-center cursor-pointer">
                                                            <h4 className="text-sm font-bold text-gray-900">Do you offer ongoing support?</h4>
                                                            <span className="text-xl text-gray-400">+</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="p-8 py-12 bg-[#0a0a0a] text-center flex flex-col items-center">
                                                    <h3 className="text-2xl font-black text-white mb-6 leading-tight max-w-[200px]">Ready to stand out from everyone?</h3>
                                                    <button type="button" className="bg-orange-600 text-white rounded-full py-3 px-8 font-bold text-sm mb-12 hover:bg-orange-700 transition">Let's Talk</button>
                                                    
                                                    <div className="flex gap-4 mb-8">
                                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Globe size={16} /></div>
                                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white"><Mail size={16} /></div>
                                                    </div>
                                                    
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">© 2026 {profile?.title || "Creator"}. All rights reserved.</p>
                                                </div>
                                            </>
                                        ) : (
                                            /* Dedicated Projects View (Page 2) */
                                            <div className="p-6 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <button 
                                                    type="button"
                                                    onClick={() => setPortfolioSubView("main")}
                                                    className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-8 hover:text-gray-900 transition-colors"
                                                >
                                                    <ArrowUpRight size={16} className="rotate-[225deg]" /> Back to Home
                                                </button>
                                                
                                                <h2 className="text-4xl font-black text-gray-900 mb-2 leading-tight">All Projects</h2>
                                                <p className="text-gray-500 font-medium mb-12">Explore my complete body of work across brand identity, UI/UX, and web development.</p>
                                                
                                                <div className="grid grid-cols-1 gap-8">
                                                    {/* Real blocks mapping (all of them) */}
                                                    {otherBlocks.map((block: any, idx: number) => {
                                                        const type = getUiTypeFromBlock(block, uiTypeOverrides);
                                                        const settings = block.settings || {};
                                                        const displayLabel = settings.title || settings.name || settings.text || type;
                                                        
                                                        if (isMediaType(type) || ['youtube', 'spotify'].includes(type) || type === 'image') {
                                                            return (
                                                                <div key={block.id} className="group">
                                                                    <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                                                        <img src={settings.image || settings.url || "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                    </div>
                                                                    <h4 className="font-bold text-xl text-gray-900 mb-1">{displayLabel}</h4>
                                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Case Study</p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    
                                                    {/* Additional dummy projects to fill the page */}
                                                    <div className="group">
                                                        <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                        <h4 className="font-bold text-xl text-gray-900 mb-1">SaaS Dashboard</h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Product Design</p>
                                                    </div>
                                                    <div className="group">
                                                        <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
                                                            <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        </div>
                                                        <h4 className="font-bold text-xl text-gray-900 mb-1">Crypto Exchange</h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Web Development</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full">
                                {/* Always Pin the single primary Avatar to top */}
                                {topAvatar && renderBlockUI(topAvatar, false, -1, true)}

                                <div className="flex flex-col gap-2">
                                    {groupedRows.map((row, ridx) => {
                                        const isFisher = profile.theme === 'modern_fisher';
                                        const cardClass = isFisher ? "bg-white/90 backdrop-blur-sm p-7 rounded-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-white/50 mb-8" : "mb-10";

                                        if (row.type === 'section') {
                                            return (
                                                <div key={ridx} className={cardClass}>
                                                    {renderBlockUI(row.heading, true, ridx)}
                                                    <div className="space-y-3 mt-4">
                                                        {row.blocks.map((b: any, bidx: number) => renderBlockUI(b, false, bidx))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        if (row.type === 'grid') {
                                            return (
                                                <div key={ridx} className={cn(
                                                    row.blocks.length > 1 ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-3',
                                                    cardClass
                                                )}>
                                                    {row.blocks.map((b: any, bidx: number) => renderBlockUI(b, row.blocks.length > 1, bidx))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 dark:bg-white/10 rounded-full z-[100]" />
                </div>
            </div>
        </div>
    );
};
