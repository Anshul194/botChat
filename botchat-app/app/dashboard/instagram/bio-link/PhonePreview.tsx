import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Clock, MoreHorizontal, Globe, Mail, Smartphone, SmartphoneNfc, Camera, Sparkles, Youtube, Video, Grid, Play, DollarSign, Music, MapPin, ShieldAlert, User, ArrowUpRight, Rss, Link as LinkIcon } from "lucide-react";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles, isColorLight, isBgLight } from "./TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS } from "./builder-utils";
import { StandardLayout } from "./layouts/StandardLayout";
import { PortfolioLayout } from "./layouts/PortfolioLayout";
import { UGCLayout } from "./layouts/UGCLayout";
import { OliviaLayout } from "./layouts/OliviaLayout";
import { UniversalLayout } from "./layouts/UniversalLayout";
import { CreatorStoreLayout } from "./layouts/CreatorStoreLayout";

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

export const PhonePreview = ({ profile, tabs, selectedTabId, setSelectedTabId, instagramUsername, viewportOffset = 280, previewWidth = 300, uiTypeOverrides = {}, layoutStyle = "standard", openEditor }: any) => {
    const [activePortfolioTab, setActivePortfolioTab] = React.useState("portfolio");
    const [portfolioSubView, setPortfolioSubView] = React.useState("main");
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const previewSections = currentTab?.sections || [];
    const theme = getTheme(profile?.theme);

    const allBlocks = previewSections.flatMap((s: any) => s.blocks || []);
    const topAvatar = allBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "avatar");
    const avatarUrls = topAvatar ? [topAvatar.settings?.image || topAvatar.settings?.url].filter(Boolean) : [];

    let firstActualContentFound = false;
    const otherBlocks = allBlocks.filter((b, idx) => {
        const type = getUiTypeFromBlock(b, uiTypeOverrides);
        if (type === "avatar") return false;
        const url = b.settings?.image || b.settings?.url;
        const isDuplicateUrl = url && avatarUrls.includes(url);
        if (type === "image" && topAvatar && !firstActualContentFound && (isDuplicateUrl || !b.location_url || b.location_url === "https://")) {
            return false;
        }
        if (['link', 'socials', 'heading', 'business_hours'].includes(type)) {
            firstActualContentFound = true;
        }
        return true;
    });

    const groupedRows: any[] = [];
    let linkGrid: any[] = [];
    let activeSection: { heading: any; blocks: any[] } | null = null;

    otherBlocks.forEach((block: any) => {
        const type = getUiTypeFromBlock(block, uiTypeOverrides);
        if (type === "heading") {
            if (linkGrid.length > 0) { groupedRows.push({ type: 'grid', blocks: linkGrid }); linkGrid = []; }
            if (activeSection) { groupedRows.push({ type: 'section', ...activeSection }); }
            activeSection = { heading: block, blocks: [] };
        } else if (type === "link") {
            if (activeSection) activeSection.blocks.push(block);
            else linkGrid.push(block);
        } else {
            if (linkGrid.length > 0) { groupedRows.push({ type: 'grid', blocks: linkGrid }); linkGrid = []; }
            if (activeSection) activeSection.blocks.push(block);
            else groupedRows.push({ type: 'single', block });
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
        const themeBgStr = (theme.bgStyle.background as string) || '';
        const themeBgIsLight = isBgLight(themeBgStr);
        const effectiveTextColor = themeBgIsLight ? '#000000' : theme.textColor;
        const baseStyle: any = { ...(theme.btnStyle || {}) };
        
        if (settings.background_color && settings.background_color.length > 7 && settings.background_color.endsWith("00")) {
            baseStyle.background = "rgba(0,0,0,0.05)";
        } else if (settings.background_color && settings.background_color !== "#ffffff" && settings.background_color !== "#000000") {
            baseStyle.background = settings.background_color;
        }

        const finalBg = baseStyle.background || theme.btnStyle?.background;
        const blockBgIsLight = finalBg && typeof finalBg === "string" ? isColorLight(finalBg) : true;

        if (themeBgIsLight) baseStyle.color = "#000000";
        else if (settings.text_color && settings.text_color !== "#020617" && settings.text_color !== "inherit") {
            if (!blockBgIsLight && (settings.text_color === "#000000" || settings.text_color === "#020617")) baseStyle.color = "#ffffff";
            else baseStyle.color = settings.text_color;
        } else if (!blockBgIsLight) baseStyle.color = "#ffffff";
        else if (blockBgIsLight) baseStyle.color = "#000000";

        if (settings.border_radius === "straight") baseStyle.borderRadius = "0px";
        else if (settings.border_radius === "rounded") baseStyle.borderRadius = "20px";
        else if (settings.border_radius === "round") baseStyle.borderRadius = "9999px";

        const buttonStyle = { ...baseStyle, textAlign: alignment as any };
        const displayLabel = hideLabel ? null : (settings.title || settings.text || settings.name);

        return (
            <motion.div key={block.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * gidx }} className={isTiled ? "h-full" : "w-full"}>
                {type === "link" && (
                    <a href={block.location_url} className={`w-full group transition-all duration-300 active:scale-[0.97] hover:brightness-110 flex ${isTiled ? 'flex-col items-start min-h-[120px] justify-between p-5' : 'items-center justify-center min-h-[64px] py-4 px-8 shadow-md'}`} style={{ ...buttonStyle, borderRadius: isTiled && buttonStyle.borderRadius === '9999px' ? '32px' : buttonStyle.borderRadius }}>
                        {settings.icon ? <i className={`${settings.icon} ${isTiled ? 'text-2xl mb-2 opacity-100' : 'absolute left-8 text-xl opacity-80'} group-hover:scale-110 transition-transform`}></i> : (isTiled && <Globe size={24} className="mb-2 opacity-40" />)}
                        <span className={`font-bold ${isTiled ? 'text-[14px] leading-tight mt-auto' : 'text-[16px] truncate max-w-[80%]'}`}>{displayLabel || "Open Website"}</span>
                        {!isTiled && <MoreHorizontal size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 transition-opacity" />}
                    </a>
                )}

                {type === "heading" && (
                    <div className={cn("pt-8 pb-3", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <h2 className={cn("text-[24px] font-black tracking-tighter leading-tight", profile.theme === 'modern_fisher' && "text-[32px] first-of-type:text-[#FF6B00]")} style={{ color: profile.theme === 'modern_fisher' ? undefined : effectiveTextColor }}>
                            {displayLabel || "Untitled Section"}
                        </h2>
                    </div>
                )}

                {type === "paragraph" && (
                    <div className={cn("pb-2", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <p className={cn("text-[15px] leading-relaxed opacity-70 font-medium whitespace-pre-line", profile.theme === 'modern_fisher' && "text-[16px] opacity-80")} style={{ color: effectiveTextColor }}>
                            {settings.description || settings.text}
                        </p>
                    </div>
                )}

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

                {type === "avatar" && (
                    <div className="flex flex-col items-center py-6 group">
                        <div className="relative">
                            <div className={cn("absolute -inset-4 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity", profile.theme === 'modern_fisher' ? "bg-orange-500/10" : "bg-white/5")} />
                            <div className={cn("relative overflow-hidden border-[4px] shadow-2xl transition-all duration-500", profile.theme === 'modern_fisher' ? "border-white bg-[#f5eadb]" : "border-white/10")} style={{ borderRadius: buttonStyle.borderRadius === '9999px' ? '9999px' : '40px', width: settings.size || 140, height: settings.size || 140 }}>
                                <img src={settings.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        </div>
                        {displayLabel && !hideLabel && (
                            <p className="mt-5 text-[17px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                        )}
                    </div>
                )}

                {["email_collector", "phone_collector", "contact_form"].includes(type) && (
                    <div className="w-full p-6 rounded-[28px] border border-white/5 shadow-2xl space-y-4" style={{ ...buttonStyle, background: 'rgba(0,0,0,0.1)' }}>
                        <div className="text-center space-y-1">
                            <h3 className="font-black text-lg tracking-tight" style={{ color: effectiveTextColor }}>{settings.title || settings.name || "Sign Up"}</h3>
                            <p className="text-[13px] opacity-60 font-medium" style={{ color: effectiveTextColor }}>{settings.description}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <input readOnly placeholder={settings.placeholder || `Enter your email...`} className="w-full h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold outline-none placeholder:opacity-30" style={{ color: effectiveTextColor }} />
                            <button className="w-full h-12 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-lg">{settings.button_text || "Submit"}</button>
                        </div>
                    </div>
                )}

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
                                    <p className="text-[13px] font-bold text-blue-300/60 uppercase tracking-widest mb-6">{settings.price} {settings.currency === "US" ? "USD" : settings.currency}</p>
                                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
                                    <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)]">Send Secure Payment</button>
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

                {type === "newsletter" && (
                    <div className="w-full p-6 rounded-[28px] border border-white/5 shadow-2xl space-y-4" style={{ ...buttonStyle, background: 'rgba(0,0,0,0.1)' }}>
                        <div className="text-center space-y-1">
                            <h3 className="font-black text-lg tracking-tight" style={{ color: effectiveTextColor }}>{settings.title || "Newsletter"}</h3>
                            <p className="text-[13px] opacity-60 font-medium" style={{ color: effectiveTextColor }}>{settings.description}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <input readOnly placeholder={settings.placeholder || "Enter your email..."} className="w-full h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold outline-none placeholder:opacity-30" style={{ color: effectiveTextColor }} />
                            <button className="w-full h-12 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] shadow-lg">Subscribe</button>
                        </div>
                    </div>
                )}

                {type === "vcard" && (
                    <div className="w-full p-6 rounded-[28px] border border-white/5 shadow-2xl flex items-center gap-4" style={{ ...buttonStyle, background: 'rgba(0,0,0,0.1)' }}>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                            <User size={24} className="opacity-40" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-[16px] truncate" style={{ color: effectiveTextColor }}>{settings.first_name} {settings.last_name}</h3>
                            <p className="text-[11px] font-bold opacity-40 uppercase tracking-widest truncate">{settings.organization || "Contact Details"}</p>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all"><ArrowUpRight size={18} /></button>
                    </div>
                )}

                {type === "divider" && (
                    <div className="w-full py-4 flex items-center justify-center">
                        <div className="w-full h-px bg-white/10" />
                    </div>
                )}

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

                {type === "rss" && (
                    <div className="w-full space-y-3 mt-4">
                        <div className="flex items-center gap-2 px-2 opacity-50">
                            <Rss size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Latest Updates</span>
                        </div>
                        {(settings.items || []).slice(0, 3).map((item: any, idx: number) => (
                            <a key={idx} href={item.link} target="_blank" className="block p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <p className="text-[14px] font-bold truncate" style={{ color: effectiveTextColor }}>{item.title}</p>
                                <p className="text-[10px] opacity-50 mt-1">{new Date(item.pubDate).toLocaleDateString()}</p>
                            </a>
                        ))}
                    </div>
                )}

                {!["link", "heading", "paragraph", "socials", "avatar", "email_collector", "phone_collector", "contact_form", "youtube", "spotify", "paypal", "newsletter", "vcard", "divider", "business_hours", "rss"].includes(type) && (
                    <a href={block.location_url || "#"} className="w-full group transition-all duration-300 active:scale-[0.97] hover:brightness-110 flex items-center justify-center min-h-[64px] py-4 px-8 shadow-md" style={buttonStyle}>
                         <div className="absolute left-8 opacity-80 group-hover:scale-110 transition-transform">
                            {BLOCK_ICONS[type] || <LinkIcon size={18} />}
                         </div>
                         <span className="text-[16px] font-bold truncate max-w-[80%]">{displayLabel || "Open Module"}</span>
                         <MoreHorizontal size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 transition-opacity" />
                    </a>
                )}
            </motion.div>
        );
    };

    return (
        <div className="relative mx-auto flex items-center justify-center p-4 h-full w-full pointer-events-auto overflow-visible">
            {/* iPhone 17 Pro Concept Shell — Ultra Thin Bezels & Titanium Frame */}
            <div className="relative aspect-[9/19.5] h-full max-h-[840px] w-auto max-w-full bg-black rounded-[4rem] p-[4px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/20 overflow-hidden group/phone transition-all duration-700 border-[1px] border-white/5">
                
                {/* Titanium Frame Reflections */}
                <div className="absolute inset-0 rounded-[4rem] border-[4px] border-[#1c1c1e] z-0" />
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.08] to-transparent z-10 pointer-events-none" />
                
                {/* Minimalist Side Buttons (iPhone 17 Style) */}
                <div className="absolute -left-[3px] top-32 w-1 h-12 bg-zinc-800 rounded-r-lg z-20 border-r border-white/5" />
                <div className="absolute -left-[3px] top-48 w-1 h-20 bg-zinc-800 rounded-r-lg z-20 border-r border-white/5" />
                <div className="absolute -left-[3px] top-72 w-1 h-20 bg-zinc-800 rounded-r-lg z-20 border-r border-white/5" />
                <div className="absolute -right-[3px] top-48 w-1 h-28 bg-zinc-800 rounded-l-lg z-20 border-l border-white/5" />

                {/* Integrated Dynamic Island (Smaller & Sleeker) */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-[100] flex items-center justify-center border border-white/[0.05] shadow-2xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/30 mr-1.5 blur-[2px]" />
                    <div className="w-0.5 h-0.5 rounded-full bg-white/10" />
                </div>
                
                {/* Edge-to-Edge Screen Content */}
                <div className="rounded-[3.8rem] overflow-hidden w-full h-full relative flex flex-col shadow-inner" 
                    style={{ background: layoutStyle === 'creator_store' ? '#ffffff' : (theme.bgStyle.background || "#F3F4F6"), color: theme.textColor || "#0F172A" }}>
                    
                    {/* Screen Surface Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent z-30 pointer-events-none" />

                    <div className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 w-full", (layoutStyle === "portfolio" || layoutStyle === "ugc" || layoutStyle === "aesthetic_influencer" || layoutStyle === "olivia" || layoutStyle === "universal" || layoutStyle === "creator_store") ? "p-0" : "p-6")}>
                        {/* Default Header if no blocks exist */}
                        {otherBlocks.length === 0 && !topAvatar && (
                            <div className="flex flex-col items-center pt-20 pb-8 space-y-5 animate-in fade-in zoom-in-95 duration-1000">
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center backdrop-blur-3xl shadow-2xl">
                                    <User size={36} className="opacity-30 text-white" />
                                </div>
                                <div className="text-center space-y-1.5">
                                    <h3 className="text-2xl font-black tracking-tight text-white/50">@{instagramUsername || 'username'}</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Studio Active</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {layoutStyle === "portfolio" ? (
                            <PortfolioLayout profile={profile} tabs={tabs} selectedTabId={selectedTabId} setSelectedTabId={setSelectedTabId} instagramUsername={instagramUsername} otherBlocks={otherBlocks} topAvatar={topAvatar} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} isMediaType={isMediaType} getYouTubeId={getYouTubeId} renderBlockUI={renderBlockUI} />
                        ) : layoutStyle === "creator_store" ? (
                            <CreatorStoreLayout profile={profile} otherBlocks={otherBlocks} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} openEditor={openEditor} />
                        ) : layoutStyle === "ugc" || layoutStyle === "aesthetic_influencer" ? (
                            <UGCLayout theme={theme} profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} instagramUsername={instagramUsername} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} isMediaType={isMediaType} renderBlockUI={renderBlockUI} />
                        ) : layoutStyle === "olivia" ? (
                            <OliviaLayout profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} isMediaType={isMediaType} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} />
                        ) : layoutStyle === "universal" ? (
                            <UniversalLayout profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} />
                        ) : (
                            <StandardLayout topAvatar={topAvatar} groupedRows={groupedRows} profile={profile} renderBlockUI={renderBlockUI} />
                        )}
                    </div>
                </div>
                {/* Bottom Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-black/20 dark:bg-white/10 rounded-full z-[100]" />
            </div>
        </div>
    );
};
