import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Clock, MoreHorizontal, Globe, Mail, Phone, MessageCircle, Smartphone, SmartphoneNfc, Camera, Sparkles, Youtube, Video, Grid, Play, DollarSign, Music, MapPin, ShieldAlert, User, ArrowUpRight, Rss, Link as LinkIcon } from "lucide-react";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles, isColorLight, isBgLight } from "./TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS } from "./builder-utils";
import { StandardLayout } from "./layouts/StandardLayout";
import { PortfolioLayout } from "./layouts/PortfolioLayout";
import { UGCLayout } from "./layouts/UGCLayout";
import { OliviaLayout } from "./layouts/OliviaLayout";
import { UniversalLayout } from "./layouts/UniversalLayout";
import { CreatorStoreLayout } from "./layouts/CreatorStoreLayout";
import { InfluencerLayout } from "./layouts/InfluencerLayout";
import { InstaProLayout } from "./layouts/InstaProLayout";
import { InstaTrendyLayout } from "./layouts/InstaTrendyLayout";
import { InstaMinimalLayout } from "./layouts/InstaMinimalLayout";
import { SundayBrunchLayout } from "./layouts/SundayBrunchLayout";
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
    const effectiveLayoutStyle = (layoutStyle === "standard" && (profile?.template_name || profile?.layout)) 
        ? (profile.template_name === "custom" ? "standard" : (profile.template_name || profile.layout))
        : layoutStyle;

    const [activePortfolioTab, setActivePortfolioTab] = React.useState("portfolio");
    const [portfolioSubView, setPortfolioSubView] = React.useState("main");
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const previewSections = currentTab?.sections || [];
    const theme = getTheme(profile?.theme);

    const allBlocks = previewSections.flatMap((s: any) => s.blocks || []);
    const topAvatar = allBlocks.find((b: any) => getUiTypeFromBlock(b, uiTypeOverrides) === "avatar");
    const avatarUrls = topAvatar ? [topAvatar.settings?.image || topAvatar.settings?.url].filter(Boolean) : [];

    let firstActualContentFound = false;
    const otherBlocks = allBlocks.filter((b: any, idx: number) => {
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
    let activeSection: any = null;

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
        const displayLabel = hideLabel ? null : (settings.name || settings.title || settings.text || settings.headline || settings.brand_name);

        return (
            <motion.div key={block.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * gidx }} className={isTiled ? "h-full" : "w-full min-w-0"}>
                {type === "link" && (
                    <a href={block.location_url} className={`w-full group transition-all duration-300 active:scale-[0.97] hover:brightness-110 flex ${isTiled ? 'flex-col items-start min-h-[120px] justify-between p-5' : 'items-center justify-center min-h-[64px] py-4 px-8 shadow-md'}`} style={{ ...buttonStyle, borderRadius: isTiled && buttonStyle.borderRadius === '9999px' ? '32px' : buttonStyle.borderRadius }}>
                        {settings.icon ? <i className={`${settings.icon} ${isTiled ? 'text-2xl mb-2 opacity-100' : 'absolute left-8 text-xl opacity-80'} group-hover:scale-110 transition-transform`}></i> : (isTiled && <Globe size={24} className="mb-2 opacity-40" />)}
                        <span className={`font-bold ${isTiled ? 'text-[14px] leading-tight mt-auto' : 'text-[16px] truncate max-w-[80%]'}`}>{displayLabel || "Open Website"}</span>
                        {!isTiled && <MoreHorizontal size={18} className="absolute right-8 opacity-20 group-hover:opacity-100 transition-opacity" />}
                    </a>
                )}

                {type === "heading" && (
                    <div className={cn("pt-8 pb-3", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <h2 className={cn("text-[24px] font-black tracking-tighter leading-tight break-words", profile.theme === 'modern_fisher' && "text-[32px] first-of-type:text-[#FF6B00]")} style={{ color: profile.theme === 'modern_fisher' ? undefined : effectiveTextColor }}>
                            {displayLabel || "Untitled Section"}
                        </h2>
                    </div>
                )}

                {type === "paragraph" && (
                    <div className={cn("pb-2", profile.theme === 'modern_fisher' && "text-center")} style={{ textAlign: alignment as any }}>
                        <p
                            className={cn("text-[15px] leading-relaxed opacity-70 font-medium whitespace-pre-line break-words", profile.theme === 'modern_fisher' && "text-[16px] opacity-80")}
                            style={{ color: effectiveTextColor, overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        >
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
                            <iframe className="w-full" src={`https://open.spotify.com/embed/${settings.url.includes('track') ? 'track' : 'playlist'}/${settings.url.split('/').pop()}`} height="152" frameBorder="0" allowTransparency={true} allow="encrypted-media" />
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

                {/* ── HERO SECTION (Edge-to-Edge Website Style) ── */}
                {(type === "hero_section" || type === "hero_aesthetic_section") && (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 mt-0 mb-8 overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] bg-black group min-h-[400px] flex items-end">
                        {settings.image ? (
                            <img src={settings.image} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        
                        <div className="relative z-10 p-8 w-full text-left">
                            {(settings.brand_name || settings.headline) && (
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-3">{settings.brand_name || settings.headline}</p>
                            )}
                            <h2 className="text-[36px] font-black leading-[1.05] tracking-tight text-white mb-4">
                                {settings.title || "Elevate Your Vision"}
                            </h2>
                            {(settings.subtitle || settings.subheadline || settings.description) && (
                                <p className="text-[15px] text-white/80 leading-relaxed max-w-[90%] mb-6">
                                    {settings.subtitle || settings.subheadline || settings.description}
                                </p>
                            )}
                            {settings.cta_text && (
                                <button className="px-8 py-3.5 rounded-full bg-white text-black text-[13px] font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── STATS (Clean Minimal) ── */}
                {(type === "stats_section" || type === "stats_minimal_section") && (
                    <div className="w-full mt-4 mb-8 py-6 border-y border-white/10">
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
                                {(settings.items || []).slice(0, 3).map((s: any, i: number) => (
                                    <div key={i} className="flex flex-col items-center text-center px-2">
                                        <span className="text-[28px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{s.value || "—"}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mt-1" style={{ color: effectiveTextColor }}>{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-40">
                                {["200+", "50K", "4.9★"].map((v, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[28px] font-black tracking-tight">{v}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── BRANDS (Clean Slider) ── */}
                {type === "brands_section" && (
                    <div className="w-full mt-4 mb-8 py-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 text-center mb-6" style={{ color: effectiveTextColor }}>Trusted By</p>
                        {(settings.logos || []).length > 0 ? (
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {(settings.logos || []).slice(0, 6).map((l: any, i: number) => (
                                    l.image && (
                                        <img key={i} src={l.image} className="h-6 object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-8 opacity-20">
                                {[40, 60, 45].map((w, i) => <div key={i} className="h-4 rounded-full bg-current" style={{ width: w, color: effectiveTextColor }} />)}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PORTFOLIO (Clean Grid) ── */}
                {(type === "portfolio_section" || type === "portfolio_minimal_section") && (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight px-1" style={{ color: effectiveTextColor }}>{settings.title || "Selected Works"}</h3>
                        {(settings.items || []).length > 0 ? (
                            <div className="grid grid-cols-2 gap-3">
                                {(settings.items || []).slice(0, 4).map((item: any, i: number) => (
                                    <div key={i} className={`relative rounded-2xl overflow-hidden bg-black/5 group ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
                                        {item.image && <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
                                            <p className="text-[14px] font-bold text-white tracking-tight">{item.title}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 opacity-20">
                                {[0, 1, 2].map(i => <div key={i} className={`rounded-2xl bg-current ${i === 0 ? 'col-span-2 aspect-[2/1]' : 'aspect-square'}`} style={{ color: effectiveTextColor }} />)}
                            </div>
                        )}
                    </div>
                )}

                {/* ── SERVICES (Minimal List) ── */}
                {type === "services_section" && (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0 group cursor-pointer">
                                {s.image ? (
                                    <img src={s.image} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0"><Sparkles size={20} className="opacity-50" /></div>
                                )}
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="text-[16px] font-bold tracking-tight mb-1" style={{ color: effectiveTextColor }}>{s.title}</p>
                                    <p className="text-[13px] opacity-60 leading-relaxed">{s.description}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="space-y-4 opacity-20">
                                {[0, 1].map(i => <div key={i} className="h-16 rounded-2xl bg-current" style={{ color: effectiveTextColor }} />)}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TESTIMONIALS (Clean Typography) ── */}
                {(type === "testimonials_section" || type === "testimonial_highlight_section") && (
                    <div className="w-full mt-6 mb-8 px-2 flex flex-col items-center text-center">
                        <div className="w-10 h-10 mb-4 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <span className="text-xl font-serif opacity-50" style={{ color: effectiveTextColor }}>"</span>
                        </div>
                        {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 1).map((t: any, i: number) => (
                            <div key={i}>
                                <p className="text-[18px] font-medium leading-relaxed opacity-90 break-words mb-6" style={{ color: effectiveTextColor }}>{t.description || t.quote}</p>
                                {t.author_image && <img src={t.author_image} className="w-10 h-10 rounded-full mx-auto mb-2 object-cover" />}
                                <p className="text-[12px] font-bold tracking-widest uppercase" style={{ color: effectiveTextColor }}>{t.author || t.author_name}</p>
                            </div>
                        )) : (
                            <div>
                                <p className="text-[18px] font-medium leading-relaxed opacity-40">The most incredible experience.</p>
                                {settings.author_name && <p className="text-[12px] font-bold tracking-widest uppercase opacity-40 mt-4">— {settings.author_name}</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* ── FAQ (Minimal Accordion) ── */}
                {(type === "faq_section" || type === "faq_cards_section") && (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-2" style={{ color: effectiveTextColor }}>{settings.title || "FAQ"}</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((f: any, i: number) => (
                                <div key={i} className="py-4">
                                    <p className="text-[15px] font-bold tracking-tight mb-2" style={{ color: effectiveTextColor }}>{f.question}</p>
                                    {f.answer && <p className="text-[13px] opacity-60 leading-relaxed">{f.answer}</p>}
                                </div>
                            )) : (
                                <div className="space-y-3 opacity-20 py-4">{[0,1].map(i => <div key={i} className="h-6 w-3/4 rounded bg-current" style={{ color: effectiveTextColor }} />)}</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── CTA SECTION (Solid Block) ── */}
                {(type === "cta_section" || type === "cta_fullscreen_section") && (
                    <div className="w-full mt-6 mb-8 p-8 rounded-3xl bg-black dark:bg-white text-center flex flex-col items-center">
                        <h3 className="text-[26px] font-black leading-tight tracking-tight text-white dark:text-black mb-3">{settings.title || "Ready to get started?"}</h3>
                        {settings.subtitle && <p className="text-[14px] text-white/70 dark:text-black/70 mb-8 max-w-[80%]">{settings.subtitle}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white dark:bg-black text-black dark:text-white text-[13px] font-bold hover:scale-105 transition-transform w-full max-w-[200px]">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                )}

                {/* ── SOCIAL MEDIA SECTION (Clean Row) ── */}
                {type === "social_medias_section" && (
                    <div className="w-full mt-4 mb-8 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-5">
                            {(settings.items || []).slice(0, 6).map((s: any, i: number) => (
                                <a key={i} href={s.link} className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                    <i className={`${s.icon} text-xl`} style={{ color: effectiveTextColor }} />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── HEADER PROFILE SECTION (Edge-to-Edge) ── */}
                {type === "header_profile_section" && (
                    <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-6 mb-8 overflow-hidden rounded-b-[40px] bg-black/5 dark:bg-white/5 pb-8">
                        {settings.cover_image ? (
                            <img src={settings.cover_image} className="w-full h-[160px] object-cover" />
                        ) : (
                            <div className="w-full h-[160px] bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                        )}
                        <div className="flex flex-col items-center text-center -mt-12 relative z-10 px-6">
                            {settings.avatar ? (
                                <img src={settings.avatar} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-[#0a0a0a] shadow-lg mb-4" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center mb-4"><User size={32} className="opacity-50" /></div>
                            )}
                            <p className="text-[24px] font-black tracking-tight mb-2" style={{ color: effectiveTextColor }}>{settings.name || "Profile Name"}</p>
                            {settings.bio && <p className="text-[14px] opacity-70 leading-relaxed max-w-[90%]">{settings.bio}</p>}
                        </div>
                    </div>
                )}

                {/* ── HERO PRODUCT SECTION (Clean Showcase) ── */}
                {type === "hero_product_section" && (
                    <div className="w-full mt-4 mb-8 group cursor-pointer">
                        <div className="relative aspect-square w-full rounded-3xl overflow-hidden mb-5 bg-black/5">
                            {settings.product_image && <img src={settings.product_image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white text-black text-[10px] font-bold uppercase tracking-widest shadow-sm">Featured</div>
                        </div>
                        <div className="px-2">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <h3 className="text-[20px] font-black tracking-tight leading-tight" style={{ color: effectiveTextColor }}>{settings.title || "Premium Product"}</h3>
                                {settings.price && <span className="text-[20px] font-black shrink-0" style={{ color: effectiveTextColor }}>{settings.price}</span>}
                            </div>
                            {settings.subtitle && <p className="text-[14px] opacity-60 mb-5">{settings.subtitle}</p>}
                            {settings.cta_text && (
                                <button className="w-full py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[13px] font-bold">
                                    {settings.cta_text}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── FEATURED PRODUCT (List Item) ── */}
                {type === "featured_product_section" && (
                    <div className="w-full mt-4 mb-8 flex gap-5 items-center group cursor-pointer">
                        {settings.image ? (
                            <img src={settings.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm bg-black/5" />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-black/5 dark:bg-white/5" />
                        )}
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-[16px] font-bold tracking-tight mb-1 truncate" style={{ color: effectiveTextColor }}>{settings.name || "Product"}</p>
                            <p className="text-[13px] opacity-50 truncate mb-2">{settings.description}</p>
                            {settings.price && <p className="text-[16px] font-black" style={{ color: effectiveTextColor }}>{settings.price}</p>}
                        </div>
                    </div>
                )}

                {/* ── PRODUCT LIST (Clean List) ── */}
                {type === "product_list_section" && (
                    <div className="w-full mt-4 mb-8 space-y-4">
                        <h3 className="text-[22px] font-black tracking-tight mb-4 px-1" style={{ color: effectiveTextColor }}>Shop</h3>
                        <div className="divide-y divide-black/5 dark:divide-white/5 border-y border-black/5 dark:border-white/5">
                            {(settings.items || []).length > 0 ? (settings.items || []).slice(0, 3).map((p: any, i: number) => (
                                <div key={i} className="flex gap-4 py-4 items-center group cursor-pointer">
                                    {p.image ? (
                                        <img src={p.image} className="w-16 h-16 rounded-xl object-cover shrink-0 bg-black/5" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-black/5 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] font-bold tracking-tight truncate" style={{ color: effectiveTextColor }}>{p.name}</p>
                                    </div>
                                    {p.price && <p className="text-[15px] font-black pl-2" style={{ color: effectiveTextColor }}>{p.price}</p>}
                                </div>
                            )) : (
                                <div className="h-20 opacity-20 py-4 flex items-center">Empty List</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TRUST BADGES (Minimal Text) ── */}
                {type === "trust_badges_section" && (
                    <div className="w-full mt-4 mb-8 py-4 border-y border-black/5 dark:border-white/5">
                        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                            {(settings.items || []).map((b: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <i className={`${b.icon} text-[14px]`} style={{ color: effectiveTextColor }} />
                                    <span className="text-[11px] font-bold uppercase tracking-widest opacity-70" style={{ color: effectiveTextColor }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── URGENCY OFFER / COUNTDOWN (Clean Banner) ── */}
                {["urgency_offer_section", "countdown_section"].includes(type) && (
                    <div className="w-[calc(100%+3rem)] -mx-6 mt-4 mb-8 p-8 bg-red-500 text-white text-center">
                        <div className="inline-flex items-center gap-2 mb-4 opacity-80">
                            <Clock size={14} className="animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{type === "countdown_section" ? "Countdown" : "Limited Time Offer"}</p>
                        </div>
                        <h3 className="text-[24px] font-black tracking-tight leading-tight mb-3">{settings.title || (type === "countdown_section" ? "Coming Soon" : "Special Offer")}</h3>
                        {settings.description && <p className="text-[14px] opacity-90 leading-relaxed max-w-[90%] mx-auto mb-6">{settings.description}</p>}
                        {settings.button_text && (
                            <button className="px-8 py-3.5 rounded-full bg-white text-red-500 text-[12px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                                {settings.button_text}
                            </button>
                        )}
                    </div>
                )}

                {/* ── LINK GRID / CAROUSEL (Standard Fallback) ── */}
                {["link_grid_section", "link_carousel_section"].includes(type) && (
                    <div className={cn("w-full mt-4 mb-8", type === "link_carousel_section" ? "overflow-x-auto no-scrollbar" : "")}>
                        <div className={cn(
                            type === "link_grid_section" ? "grid grid-cols-2 gap-4" : "flex gap-4 pb-4"
                        )}>
                            {(settings.items || []).map((link: any, i: number) => (
                                <a key={i} href={link.url || "#"} className={cn(
                                    "p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col items-center gap-3 text-center transition-all hover:bg-black/10",
                                    type === "link_carousel_section" ? "min-w-[140px]" : "w-full"
                                )}>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <ArrowUpRight size={18} />
                                    </div>
                                    <span className="text-[13px] font-bold truncate w-full" style={{ color: effectiveTextColor }}>{link.name || link.title || "Link"}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CONTACT SECTION (Clean Links) ── */}
                {type === "contact_section" && (
                    <div className="w-full mt-4 mb-8 space-y-2">
                        {settings.email && (
                            <a href={`mailto:${settings.email}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Mail size={18} style={{ color: effectiveTextColor }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: effectiveTextColor }}>{settings.email}</span>
                            </a>
                        )}
                        {settings.phone && (
                            <a href={`tel:${settings.phone}`} className="flex items-center gap-4 p-4 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                <Phone size={18} style={{ color: effectiveTextColor }} />
                                <span className="text-[15px] font-bold truncate" style={{ color: effectiveTextColor }}>{settings.phone}</span>
                            </a>
                        )}
                        {settings.whatsapp && (
                            <a href={`https://wa.me/${settings.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors">
                                <MessageCircle size={18} className="text-[#25D366]" />
                                <span className="text-[15px] font-bold truncate text-[#25D366]">{settings.whatsapp}</span>
                            </a>
                        )}
                    </div>
                )}

                {/* ── IMPACT SECTION (Checklist) ── */}
                {type === "impact_section" && (
                    <div className="w-full mt-3 mb-4 p-7 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 space-y-5">
                        <h3 className="text-[20px] font-black tracking-tight text-white leading-tight">{settings.title || "Our Impact"}</h3>
                        {settings.description && <p className="text-[13px] text-white/50 leading-relaxed">{settings.description}</p>}
                        <div className="space-y-3 pt-2">
                            {(settings.points || []).slice(0, 3).map((pt: any, i: number) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 border border-white/20">
                                        <div className="w-2 h-2 rounded-full bg-white/80" />
                                    </div>
                                    <p className="text-[14px] font-medium text-white/80 leading-relaxed">{pt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PRICING CARDS (Premium Tiers) ── */}
                {type === "pricing_cards_section" && (
                    <div className="w-full mt-3 mb-4 space-y-4">
                        {settings.title && <p className="text-[18px] font-black text-center text-white tracking-tight">{settings.title}</p>}
                        <div className="flex gap-4 overflow-x-auto pb-2 snap-x no-scrollbar">
                            {(settings.plans || []).slice(0, 2).map((plan: any, i: number) => (
                                <div key={i} className="w-[85%] shrink-0 snap-center p-6 rounded-[32px] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 backdrop-blur-xl flex flex-col justify-between min-h-[160px]">
                                    <div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">{plan.name}</p>
                                        <p className="text-[28px] font-black text-white tracking-tighter">{plan.price}</p>
                                    </div>
                                    {plan.description && <p className="text-[12px] text-white/60 leading-relaxed mt-4">{plan.description}</p>}
                                </div>
                            ))}
                            {(settings.plans || []).length === 0 && (
                                <div className="w-full h-40 rounded-[32px] bg-white/5 border border-white/10 opacity-20" />
                            )}
                        </div>
                    </div>
                )}

                {/* ── GENERIC CATCH-ALL for remaining block types (Hyper Trendy Links) ── */}
                {!["link", "heading", "paragraph", "socials", "avatar", "email_collector", "phone_collector", "contact_form", "contact_collector", "youtube", "spotify", "paypal", "newsletter", "vcard", "divider", "business_hours", "rss", "soundcloud", "vimeo", "twitch", "tiktok_video",
                    "hero_section", "hero_aesthetic_section", "stats_section", "stats_minimal_section", "brands_section", "portfolio_section", "portfolio_minimal_section", "services_section", "testimonials_section", "testimonial_highlight_section", "faq_section", "faq_cards_section",
                    "cta_section", "cta_fullscreen_section", "social_medias_section", "header_profile_section", "hero_product_section", "featured_product_section", "product_list_section", "trust_badges_section", "urgency_offer_section", "countdown_section", "link_grid_section", "link_carousel_section", "contact_section", "impact_section", "pricing_cards_section"
                ].includes(type) && (
                    <a href={block.location_url || "#"} className="relative w-full group overflow-hidden transition-all duration-300 active:scale-[0.97] hover:brightness-110 flex items-center justify-center min-h-[64px] py-4 px-8 mt-3 mb-3 rounded-full shadow-sm border border-black/5 dark:border-white/5" style={{ ...buttonStyle, background: buttonStyle.background ? buttonStyle.background : 'rgba(0,0,0,0.05)' }}>
                         
                         <div className="absolute left-6 w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center opacity-80 group-hover:scale-110 transition-all duration-300">
                            {BLOCK_ICONS[type] || <LinkIcon size={16} />}
                         </div>
                         
                         <span className="text-[15px] font-bold tracking-tight truncate max-w-[70%] z-10" style={{ color: effectiveTextColor }}>
                            {displayLabel || type.replace(/_/g, " ")}
                         </span>
                         
                         <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <ArrowUpRight size={16} style={{ color: effectiveTextColor }} />
                         </div>
                    </a>
                )}
            </motion.div>
        );
    };

    return (
        <div className="relative mx-auto flex items-center justify-center p-4 h-full w-full pointer-events-auto overflow-visible">
            {/* iPhone 15/16 Pro Studio Shell — Natural Titanium Edition */}
            <div 
                className="relative aspect-[9/20] h-full max-h-[940px] w-auto max-w-full bg-[#1c1c1e] rounded-[4.5rem] p-[8px] shadow-[0_60px_120px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden group/phone transition-all duration-700 border-[1px] border-white/5"
            >
                
                {/* Natural Titanium Frame Glow */}
                <div className="absolute inset-0 rounded-[4.5rem] border-[1px] border-white/20 z-0 pointer-events-none" />
                <div className="absolute inset-[1px] rounded-[4.4rem] border-[3px] border-[#2c2c2e] z-0 pointer-events-none" />
                
                {/* side buttons */}
                {/* Action Button (Left) */}
                <div className="absolute -left-[2px] top-36 w-[3px] h-8 bg-zinc-700 rounded-r-md z-20 border-r border-white/10" />
                {/* Volume Buttons (Left) */}
                <div className="absolute -left-[2px] top-52 w-[3px] h-14 bg-zinc-700 rounded-r-md z-20 border-r border-white/10" />
                <div className="absolute -left-[2px] top-72 w-[3px] h-14 bg-zinc-700 rounded-r-md z-20 border-r border-white/10" />
                {/* Power Button (Right) */}
                <div className="absolute -right-[2px] top-56 w-[3px] h-20 bg-zinc-700 rounded-l-md z-20 border-l border-white/10" />

                {/* Dynamic Island */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-7 bg-black rounded-full z-[100] flex items-center justify-center border border-white/[0.03] shadow-2xl">
                    <div className="absolute right-6 w-1.5 h-1.5 rounded-full bg-[#1a1a1a] border border-white/5" />
                </div>
                
                {/* Screen Surface */}
                <div className="rounded-[4rem] overflow-hidden w-full h-full relative flex flex-col shadow-inner" 
                    style={{ 
                        background: effectiveLayoutStyle === 'creator_store' ? '#ffffff' : (theme.bgStyle.background || "#F3F4F6"), 
                        color: theme.textColor || "#0F172A" 
                    }}>
                    
                    {/* Screen Surface Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent z-30 pointer-events-none" />

                        <div className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 w-full", (effectiveLayoutStyle === "portfolio" || effectiveLayoutStyle === "ugc" || effectiveLayoutStyle === "aesthetic_influencer" || effectiveLayoutStyle === "influencer" || effectiveLayoutStyle === "olivia" || effectiveLayoutStyle === "universal" || effectiveLayoutStyle === "creator_store" || effectiveLayoutStyle === "sunday_brunch" || effectiveLayoutStyle === "insta_trendy" || effectiveLayoutStyle === "insta_pro" || effectiveLayoutStyle === "insta_minimal") ? "p-0" : "p-6")}>
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

                        {effectiveLayoutStyle === "portfolio" ? (
                            <PortfolioLayout profile={profile} tabs={tabs} selectedTabId={selectedTabId} setSelectedTabId={setSelectedTabId} instagramUsername={instagramUsername} otherBlocks={otherBlocks} topAvatar={topAvatar} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} isMediaType={isMediaType} getYouTubeId={getYouTubeId} renderBlockUI={renderBlockUI} />
                        ) : effectiveLayoutStyle === "creator_store" ? (
                            <CreatorStoreLayout profile={profile} otherBlocks={otherBlocks} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} openEditor={openEditor} />
                        ) : effectiveLayoutStyle === "ugc" ? (
                            <UGCLayout theme={theme} profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} instagramUsername={instagramUsername} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} isMediaType={isMediaType} renderBlockUI={renderBlockUI} />
                        ) : effectiveLayoutStyle === "olivia" ? (
                            <OliviaLayout profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} isMediaType={isMediaType} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} />
                        ) : effectiveLayoutStyle === "universal" ? (
                            <UniversalLayout profile={profile} otherBlocks={otherBlocks} topAvatar={topAvatar} getUiTypeFromBlock={getUiTypeFromBlock} uiTypeOverrides={uiTypeOverrides} renderBlockUI={renderBlockUI} />
                        ) : (effectiveLayoutStyle === "aesthetic_influencer" || effectiveLayoutStyle === "influencer") ? (
                            <InfluencerLayout profile={profile} tabs={tabs} />
                        ) : effectiveLayoutStyle === "insta_pro" ? (
                            <InstaProLayout profile={profile} tabs={tabs} />
                        ) : effectiveLayoutStyle === "insta_trendy" ? (
                            <InstaTrendyLayout profile={profile} tabs={tabs} />
                        ) : effectiveLayoutStyle === "insta_minimal" ? (
                            <InstaMinimalLayout profile={profile} tabs={tabs} />
                        ) : effectiveLayoutStyle === "sunday_brunch" ? (
                            <SundayBrunchLayout profile={profile} tabs={tabs} />
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
