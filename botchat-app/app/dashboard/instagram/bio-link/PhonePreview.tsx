import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Clock, MoreHorizontal, Globe, Mail, Phone, MessageCircle, Smartphone, SmartphoneNfc, Camera, Sparkles, Youtube, Video, Grid, Play, DollarSign, Music, MapPin, ShieldAlert, User, ArrowUpRight, Rss, Link as LinkIcon, Image as ImageIcon, ShoppingBag, Hexagon } from "lucide-react";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles, isColorLight, isBgLight } from "./TemplateSystem";
import { getUiTypeFromBlock, isMediaType, BLOCK_ICONS, BrandIcon } from "./builder-utils";
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

export const PhonePreview = ({ profile, tabs, selectedTabId, setSelectedTabId, instagramUsername, viewportOffset = 280, previewWidth = 300, uiTypeOverrides = {}, layoutStyle = "standard", openEditor }: any) => {
    const effectiveLayoutStyle = (layoutStyle === "standard" && (profile?.template_name || profile?.layout)) 
        ? (profile.template_name === "custom" ? "standard" : (profile.template_name || profile.layout))
        : layoutStyle;

    const [activePortfolioTab, setActivePortfolioTab] = React.useState("portfolio");
    const [portfolioSubView, setPortfolioSubView] = React.useState("main");
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const previewSections = currentTab?.sections || [];
    const theme = getTheme(profile?.theme);

    const allBlocks = previewSections.flatMap((s: any) => s.blocks || []).filter((b: any) => b.is_enabled != 0 && b.is_active != 0 && b.is_Enabled != 0);
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

    // Premium Sub-components for Preview
    const CarouselBlockView = ({ items }: any) => (
        <div className="w-full relative py-2 overflow-hidden">
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 px-1">
                {items.map((item: any, i: number) => (
                    <motion.a 
                        key={i} 
                        href={item.url || item.location_url || item.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-shrink-0 w-[180px] snap-center bg-white/10 backdrop-blur-md rounded-[24px] overflow-hidden shadow-xl border border-white/20 flex flex-col group transition-all"
                    >
                        <div className="w-full h-[100px] bg-white/5 relative overflow-hidden">
                            {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon size={20} className="text-white/20" /></div>}
                        </div>
                        <div className="p-3.5 flex flex-col flex-1">
                            <h4 className="font-black text-[12px] text-white leading-tight mb-1 truncate">{item.title || "Link"}</h4>
                            <span className="text-pink-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 mt-auto">
                                View <ArrowUpRight size={10} />
                            </span>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );

    const HeroBlockView = ({ item }: any) => (
        <a href={item.url || item.location_url || item.link || "#"} target="_blank" rel="noopener noreferrer"
           className="w-full bg-slate-900 rounded-[28px] overflow-hidden shadow-xl border border-white/10 relative h-[180px] mb-4 block group active:scale-[0.98] transition-transform">
            {item.image_url || item.image || item.background_image ? <img src={item.image_url || item.image || item.background_image} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <h4 className="font-black text-[18px] text-white leading-tight mb-3">{item.title || item.headline || "Featured"}</h4>
                <div className="flex"><span className="bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2">Explore <ArrowUpRight size={12} /></span></div>
            </div>
        </a>
    );

    const BentoPortfolioView = ({ title, items }: any) => (
        <div className="w-full space-y-4 my-4">
            {title && <h3 className="text-[18px] font-black tracking-tight text-white px-1">{title}</h3>}
            <div className="grid grid-cols-6 grid-rows-2 gap-2 h-[280px]">
                {items.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className={cn("relative rounded-[24px] overflow-hidden border border-white/10 shadow-xl", i === 0 ? "col-span-4 row-span-2" : "col-span-2 row-span-1")}>
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex flex-col justify-end">
                            <p className="text-white font-black text-[11px] leading-tight">{item.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const TransformationStoryView = ({ title, before_image, after_image, description }: any) => (
        <div className="w-full bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 p-5 space-y-4 my-4">
            {title && <h3 className="text-sm font-black text-white text-center">{title}</h3>}
            <div className="grid grid-cols-2 gap-3">
                <div className="aspect-[3/4] rounded-[18px] overflow-hidden border border-white/5 relative"><img src={before_image} className="w-full h-full object-cover" /></div>
                <div className="aspect-[3/4] rounded-[18px] overflow-hidden border border-pink-500/30 relative"><img src={after_image} className="w-full h-full object-cover" /></div>
            </div>
        </div>
    );

    const TimelineView = ({ title, steps }: any) => (
        <div className="w-full space-y-6 py-2">
            {title && <h3 className="text-[18px] font-black text-white px-1 tracking-tight">{title}</h3>}
            <div className="space-y-0 relative ml-3 border-l-2 border-white/10 pl-6">
                {steps.map((step: any, i: number) => (
                    <div key={i} className="relative pb-6 last:pb-0">
                        <div className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-pink-500 border-2 border-black z-10" />
                        <div className="bg-white/5 rounded-[18px] p-4 border border-white/10">
                            <h4 className="text-white font-black text-[14px] mb-1">{step.title}</h4>
                            <p className="text-white/50 text-[11px] leading-tight">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

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
        const items = settings.items || block.items || settings.links || settings.products || settings.logos || settings.plans || settings.steps || [];

        return (
            <motion.div key={block.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * gidx }} className={isTiled ? "h-full" : "w-full min-w-0"}>
                {(() => {
                    switch (type) {
                        case "links_carousel":
                        case "featured_links_section": return <CarouselBlockView items={items} />;
                        case "hero_single_link": return <HeroBlockView item={items[0]} />;
                        case "hero_premium_section": return <HeroBlockView item={settings} />;
                        case "links_grid":
                            return (
                                <div className="grid grid-cols-2 gap-3 w-full">
                                    {items.map((item: any, i: number) => (
                                        <div key={i} className="bg-white/5 backdrop-blur-lg rounded-[20px] overflow-hidden shadow-lg border border-white/10 flex flex-col h-[140px]">
                                            <div className="w-full h-2/3 bg-white/5 relative overflow-hidden">
                                                {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><Grid size={18} className="text-white/20" /></div>}
                                            </div>
                                            <div className="p-2 text-center mt-auto">
                                                <h4 className="font-black text-[11px] text-white truncate">{item.title || "Link"}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        case "add_products":
                        case "digital_products_section":
                            return (
                                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                    {(type === 'add_products' ? items : (settings.products || [])).map((item: any, i: number) => (
                                        <div key={i} className="flex-shrink-0 w-[140px] bg-white/5 backdrop-blur-md rounded-[20px] overflow-hidden border border-white/10 flex flex-col">
                                            <div className="w-full h-[120px] bg-white/5 relative p-3 overflow-hidden">
                                                {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-contain" /> : <div className="absolute inset-0 flex items-center justify-center"><ShoppingBag size={24} className="text-white/20" /></div>}
                                            </div>
                                            <div className="p-3 text-center bg-white/5">
                                                <h4 className="font-black text-[12px] text-white line-clamp-1">{item.title || "Product"}</h4>
                                                <p className="text-[10px] font-black text-pink-400 mt-1">{item.price || "FREE"}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        case "add_apps":
                            return (
                                <div className="space-y-2 w-full">
                                    {items.map((item: any, i: number) => (
                                        <div key={i} className="w-full bg-white/5 backdrop-blur-md rounded-[20px] p-3 border border-white/10 flex items-center gap-3">
                                            <div className="w-[48px] h-[48px] rounded-[14px] bg-white/10 overflow-hidden shrink-0">
                                                {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-cover" /> : <SmartphoneNfc size={20} className="text-white/20" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-[13px] text-white truncate">{item.title || "App"}</h4>
                                            </div>
                                            <span className="flex-shrink-0 bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase">GET</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        case "add_logos":
                        case "featured_brands_section":
                        case "brands_section":
                            return (
                                <div className="flex flex-wrap gap-4 justify-center py-2">
                                    {(type === 'add_logos' ? items : (settings.logos || [])).map((item: any, i: number) => (
                                        <div key={i} className="w-12 h-12 rounded-[16px] bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center p-2">
                                            {item.image_url || item.image ? <img src={item.image_url || item.image} className="w-full h-full object-contain filter grayscale" /> : <Hexagon size={18} className="text-white/20" />}
                                        </div>
                                    ))}
                                </div>
                            );
                        case "bento_portfolio_grid_section": return <BentoPortfolioView title={settings.title} items={settings.items || []} />;
                        case "transformation_story_section": return <TransformationStoryView {...settings} />;
                        case "services_timeline_section": return <TimelineView title={settings.title} steps={settings.steps || []} />;
                        case "floating_stats_section":
                            return (
                                <div className="grid grid-cols-2 gap-3 w-full py-2">
                                    {(settings.items || []).map((item: any, i: number) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-[24px] border border-white/10 flex flex-col items-center text-center">
                                            <span className="text-[24px] font-black text-white">{item.value}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        case "video_showcase_section":
                            return (
                                <div className="w-full bg-black rounded-[32px] overflow-hidden border border-white/10 shadow-xl">
                                    <div className="aspect-video relative overflow-hidden">
                                        <img src={settings.thumbnail} className="w-full h-full object-cover opacity-60" />
                                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center"><Play size={20} className="text-white fill-white ml-1" /></div></div>
                                    </div>
                                    <div className="p-5 space-y-1">
                                        <h3 className="text-sm font-black text-white">{settings.title}</h3>
                                        <p className="text-white/50 text-[11px] line-clamp-1">{settings.description}</p>
                                    </div>
                                </div>
                            );

                        case "link":
                            return (
                                <a href={block.location_url || settings.location_url || settings.url || "#"} target="_blank" rel="noopener noreferrer"
                                   className={`w-full group transition-all duration-300 flex ${isTiled ? 'flex-col items-start min-h-[120px] justify-between p-5' : 'items-center justify-center min-h-[72px] py-4 px-8 shadow-2xl relative overflow-hidden'}`} 
                                   style={{ ...buttonStyle, background: "rgba(255,255,255,0.05)", backdropFilter: 'blur(10px)', borderRadius: isTiled && buttonStyle.borderRadius === '9999px' ? '32px' : "24px", color: theme.textColor }}>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    {settings.icon ? <i className={`${settings.icon} ${isTiled ? 'text-2xl mb-2 opacity-100' : 'absolute left-8 text-xl opacity-100'} group-hover:scale-110 transition-transform`}></i> : (isTiled && <Globe size={24} className="mb-2 opacity-40" />)}
                                    <span className={`font-black ${isTiled ? 'text-[14px] leading-tight mt-auto' : 'text-[16px] tracking-tight truncate max-w-[70%]'}`}>{displayLabel || "Open Website"}</span>
                                    {!isTiled && <ArrowUpRight size={18} className="absolute right-8 opacity-20" />}
                                </a>
                            );

                        case "heading":
                            return (
                                <div className="pt-10 pb-4" style={{ textAlign: alignment as any }}>
                                    <h2 className="text-[32px] font-black tracking-tighter leading-none" style={{ color: effectiveTextColor }}>
                                        {displayLabel || "Untitled Section"}
                                    </h2>
                                    <div className="w-12 h-1 bg-pink-500 mt-4 rounded-full inline-block" />
                                </div>
                            );

                        case "paragraph":
                            return (
                                <div className="pb-4" style={{ textAlign: alignment as any }}>
                                    <p className="text-[16px] leading-relaxed opacity-60 font-medium whitespace-pre-line" style={{ color: effectiveTextColor }}>
                                        {settings.description || settings.text}
                                    </p>
                                </div>
                            );

                        case "socials":
                            const rawSocials = settings.socials || items || [];
                            const socialsList = Array.isArray(rawSocials) 
                                ? rawSocials 
                                : (rawSocials && typeof rawSocials === 'object')
                                    ? Object.entries(rawSocials).map(([key, value]) => ({ type: key, link: value as string }))
                                    : [];

                            return (
                                <div className="flex flex-wrap items-center gap-4 py-6" style={{ justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center' }}>
                                    {socialsList.map((social: any, i: number) => {
                                        const sLink = social.link || social.url || social.location_url;
                                        return (
                                            <a key={i} href={sLink || "#"} target="_blank" rel="noopener noreferrer"
                                               className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[18px] hover:scale-110 active:scale-95 transition-all">
                                                <span className="text-white">
                                                    <BrandIcon name={social.type || social.icon || social.name || "globe"} size={22} />
                                                </span>
                                            </a>
                                        );
                                    })}
                                </div>
                            );

                        case "avatar":
                            return (
                                <div className="flex flex-col items-center py-8 group">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-pink-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative overflow-hidden border-[4px] shadow-2xl border-white/20 transition-transform duration-700" style={{ borderRadius: buttonStyle.borderRadius === '9999px' ? '9999px' : '40px', width: settings.size || 140, height: settings.size || 140 }}>
                                            <img src={settings.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"} className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                    {displayLabel && !hideLabel && (
                                        <p className="mt-5 text-[20px] font-black tracking-tight" style={{ color: effectiveTextColor }}>{displayLabel}</p>
                                    )}
                                </div>
                            );

                        case "email_collector":
                        case "phone_collector":
                        case "contact_collector":
                        case "contact_form":
                            return (
                                <div className="w-full p-8 rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-5">
                                    <div className="text-center space-y-1">
                                        <h3 className="text-xl font-black text-white tracking-tight">{settings.title || "Get in Touch"}</h3>
                                        {settings.description && <p className="text-[12px] text-white/50 font-medium">{settings.description}</p>}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="w-full h-12 rounded-xl bg-white/5 border border-white/10" />
                                        <button className="w-full h-12 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest">{settings.button_text || "Submit"}</button>
                                    </div>
                                </div>
                            );

                        case "hero_section":
                        case "hero_aesthetic_section":
                            return (
                                <div className="relative w-[calc(100%+3rem)] -mx-6 mt-0 mb-6 overflow-hidden shadow-2xl bg-black group min-h-[380px] flex items-center justify-center">
                                    {settings.image || settings.background_image ? (
                                        <img src={settings.image || settings.background_image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-black to-purple-900" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                    
                                    <div className="relative z-10 p-8 w-full text-center flex flex-col items-center">
                                        {(settings.brand_name || settings.headline) && (
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-4 drop-shadow-md">{settings.brand_name || settings.headline}</p>
                                        )}
                                        <h2 className="text-[36px] font-black leading-[0.95] tracking-tighter text-white mb-6 drop-shadow-2xl">
                                            {settings.title || "Elevate Your Vision"}
                                        </h2>
                                        {settings.cta_text && (
                                            <button className="px-10 py-4 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-2xl transition-all">
                                                {settings.cta_text}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );

                        case "stats_section":
                        case "stats_minimal_section":
                            return (
                                <div className="w-full py-8 border-y border-white/10 my-4">
                                    <div className="grid grid-cols-3 gap-4 divide-x divide-white/10">
                                        {(settings.items || []).slice(0, 3).map((s: any, i: number) => (
                                            <div key={i} className="flex flex-col items-center text-center px-2">
                                                <span className="text-[28px] font-black tracking-tighter text-white">{s.value || "—"}</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30 mt-1">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        case "header_profile_section":
                            return (
                                <div className="relative w-[calc(100%+3rem)] -mx-6 -mt-10 mb-8 overflow-hidden rounded-b-[48px] bg-white/5 backdrop-blur-xl border-b border-white/10 pb-8 shadow-2xl">
                                    {settings.cover_image ? (
                                        <img src={settings.cover_image} className="w-full h-[180px] object-cover" />
                                    ) : (
                                        <div className="w-full h-[180px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20" />
                                    )}
                                    <div className="flex flex-col items-center text-center -mt-16 relative z-10 px-6">
                                        <div className="p-1.5 rounded-full bg-black/20 backdrop-blur-3xl mb-4 shadow-2xl border border-white/20">
                                            {settings.avatar ? (
                                                <img src={settings.avatar} className="w-28 h-28 rounded-full object-cover border-4 border-white" />
                                            ) : (
                                                <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center"><User size={40} className="text-white/20" /></div>
                                            )}
                                        </div>
                                        <h2 className="text-[28px] font-black tracking-tight text-white mb-2">{settings.name || "Profile Name"}</h2>
                                        {settings.bio && <p className="text-[13px] font-medium text-white/60 leading-relaxed line-clamp-2">{settings.bio}</p>}
                                    </div>
                                </div>
                            );

                        case "portfolio_section":
                        case "portfolio_minimal_section":
                            return (
                                <div className="w-full space-y-4 my-6">
                                    <h3 className="text-[22px] font-black tracking-tight text-white px-1">{settings.title || "Works"}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(settings.items || []).slice(0, 3).map((item: any, i: number) => (
                                            <div key={i} className={cn("relative rounded-[24px] overflow-hidden bg-white/5 border border-white/10", i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square")}>
                                                {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                                                    <p className="text-[14px] font-black text-white">{item.title}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        case "services_section":
                            return (
                                <div className="w-full space-y-3 my-6">
                                    {(settings.items || []).map((s: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-[24px] bg-white/5 border border-white/10">
                                            <div className="w-16 h-16 rounded-[18px] overflow-hidden shrink-0 border border-white/10">
                                                {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-white/5"><Sparkles size={24} className="text-white/20" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[16px] font-black text-white truncate">{s.title}</h4>
                                                <p className="text-[11px] text-white/40 line-clamp-2">{s.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );

                        case "testimonials_section":
                        case "testimonial_highlight_section":
                            return (
                                <div className="w-full py-10 px-6 rounded-[40px] bg-white/5 border border-white/10 text-center flex flex-col items-center my-6 shadow-2xl">
                                    <div className="w-12 h-12 mb-6 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                        <span className="text-2xl font-serif text-pink-500">"</span>
                                    </div>
                                    <p className="text-[17px] font-bold text-white leading-relaxed italic mb-6">"{settings.quote || (settings.items?.[0]?.quote || "Amazing service!")}"</p>
                                    <div className="flex flex-col items-center gap-2">
                                        {(settings.author_image || settings.items?.[0]?.author_image) && <img src={settings.author_image || settings.items?.[0]?.author_image} className="w-12 h-12 rounded-full border-2 border-pink-500 shadow-xl object-cover" />}
                                        <p className="text-[12px] font-black uppercase tracking-widest text-white">{settings.author_name || (settings.items?.[0]?.author_name || "Client")}</p>
                                    </div>
                                </div>
                            );

                        case "faq_section":
                        case "faq_cards_section":
                            return (
                                <div className="w-full space-y-4 my-6">
                                    <h3 className="text-xl font-black text-white px-1">{settings.title || "FAQ"}</h3>
                                    <div className="space-y-2">
                                        {(settings.items || []).map((f: any, i: number) => (
                                            <div key={i} className="bg-white/5 rounded-[20px] border border-white/10 p-4">
                                                <p className="text-[14px] font-black text-white">{f.question}</p>
                                                {f.answer && <p className="text-[11px] text-white/40 mt-2 leading-tight">{f.answer}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        case "cta_section":
                        case "cta_fullscreen_section":
                            return (
                                <div className="w-full p-10 rounded-[40px] bg-gradient-to-br from-pink-600 to-indigo-700 text-center flex flex-col items-center my-8 shadow-2xl border border-white/20">
                                    <h3 className="text-[28px] font-black leading-tight tracking-tighter text-white mb-4">{settings.title || "Get Started"}</h3>
                                    <button className="px-8 py-4 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest shadow-xl">
                                        {settings.button_text || "Click Here"}
                                    </button>
                                </div>
                            );

                        case "pricing_cards_section":
                            return (
                                <div className="w-full space-y-4 my-6">
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar px-1">
                                        {(settings.plans || []).map((plan: any, i: number) => (
                                            <div key={i} className="w-[240px] shrink-0 snap-center p-6 rounded-[32px] bg-white/5 border border-white/10 flex flex-col shadow-xl">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-pink-500 mb-2">{plan.name}</span>
                                                <div className="flex items-baseline gap-1 mb-6">
                                                    <span className="text-[32px] font-black text-white tracking-tighter">{plan.price}</span>
                                                </div>
                                                <button className="w-full py-3 rounded-xl bg-white text-black font-black text-[10px] uppercase tracking-widest shadow-xl mt-auto">Select</button>
                                            </div>
                                        ))}
                                    </div>
                                    {(settings.plans || []).length === 0 && (
                                        <div className="w-full h-40 rounded-[32px] bg-white/5 border border-white/10 opacity-20" />
                                    )}
                                </div>
                            );

                        case "contact_section":
                            return (
                                <div className="w-full grid grid-cols-1 gap-2 my-4">
                                    {settings.email && (
                                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/20"><Mail size={18} className="text-pink-500" /></div>
                                            <div className="flex-1 min-w-0"><p className="text-[13px] font-black text-white truncate">{settings.email}</p></div>
                                        </div>
                                    )}
                                    {settings.phone && (
                                        <div className="flex items-center gap-4 p-4 rounded-[20px] bg-white/5 border border-white/10">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/20"><Phone size={18} className="text-indigo-400" /></div>
                                            <div className="flex-1 min-w-0"><p className="text-[13px] font-black text-white truncate">{settings.phone}</p></div>
                                        </div>
                                    )}
                                </div>
                            );

                        case "vcard":
                            return (
                                <div className="w-full p-5 rounded-[24px] border border-white/10 shadow-2xl flex items-center gap-4 bg-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10"><User size={20} className="opacity-40" /></div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-[14px] truncate text-white">{settings.first_name} {settings.last_name}</h3>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{settings.organization || "Contact"}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"><ArrowUpRight size={16} className="text-white/40" /></div>
                                </div>
                            );

                        case "divider":
                            return <div className="w-full py-4 flex items-center justify-center"><div className="w-full h-px bg-white/10" /></div>;

                        case "business_hours":
                            return (
                                <div className="p-6 my-2 border border-white/5 bg-white/[0.02] rounded-[24px]">
                                    <div className="flex items-center gap-2 mb-4 justify-center opacity-40">
                                        <Clock size={16} /><span className="font-black uppercase tracking-widest text-[9px]">Business Hours</span>
                                    </div>
                                    <div className="space-y-3">
                                        {['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'].map((k, i) => settings[k] && (
                                            <div key={k} className="flex justify-between items-center text-[12px]">
                                                <span className="font-bold opacity-30 uppercase text-[9px] tracking-widest">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</span>
                                                <span className="font-bold text-white/80">{settings[k]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );

                        case "rss":
                            return (
                                <div className="w-full space-y-2 mt-4">
                                    {(settings.items || []).slice(0, 2).map((item: any, idx: number) => (
                                        <div key={idx} className="block p-3 rounded-xl bg-white/5 border border-white/10">
                                            <p className="text-[12px] font-bold truncate text-white">{item.title}</p>
                                            <p className="text-[9px] opacity-40 mt-1">{new Date(item.pubDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            );

                        case "urgency_offer_section":
                            return (
                                <div className="w-[calc(100%+3rem)] -mx-6 mt-4 mb-8 p-8 bg-red-500 text-white text-center">
                                    <div className="inline-flex items-center gap-2 mb-4 opacity-80">
                                        <Clock size={14} className="animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Limited Time Offer</p>
                                    </div>
                                    <h3 className="text-[24px] font-black tracking-tight leading-tight mb-3">{settings.title || "Special Offer"}</h3>
                                    {settings.description && <p className="text-[14px] opacity-90 leading-relaxed max-w-[90%] mx-auto mb-6">{settings.description}</p>}
                                    {settings.button_text && (
                                        <button className="px-8 py-3.5 rounded-full bg-white text-red-500 text-[12px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">
                                            {settings.button_text}
                                        </button>
                                    )}
                                </div>
                            );

                        case "impact_section":
                            return (
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
                            );

                        default:
                            return (
                                <div className="w-full flex items-center justify-center min-h-[64px] py-4 px-8 shadow-md border border-white/5" 
                                     style={{ background: "rgba(255,255,255,0.03)", backdropFilter: 'blur(10px)', color: theme.textColor, borderRadius: "24px" }}>
                                    <span className="font-bold text-[14px] opacity-40 tracking-tight">{displayLabel || type.replace(/_/g, " ")}</span>
                                </div>
                            );
                    }
                })()}

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
                
                {/* Edge-to-Edge Screen Content */}
                    <div className="rounded-[3.8rem] overflow-hidden w-full h-full relative flex flex-col shadow-inner" 
                        style={{ background: effectiveLayoutStyle === 'creator_store' ? '#ffffff' : (theme.bgStyle.background || "#F3F4F6"), color: theme.textColor || "#0F172A" }}>
                        
                        <ThemeAnimationStyles />
                        <ThemeEffectsLayer theme={theme} />
                        
                        {/* Screen Surface Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] via-transparent to-transparent z-30 pointer-events-none" />

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
                            <InstaProLayout profile={profile} tabs={tabs} openEditor={openEditor} />
                        ) : effectiveLayoutStyle === "insta_trendy" ? (
                            <InstaTrendyLayout profile={profile} tabs={tabs} openEditor={openEditor} />
                        ) : effectiveLayoutStyle === "insta_minimal" ? (
                            <InstaMinimalLayout profile={profile} tabs={tabs} openEditor={openEditor} />
                        ) : effectiveLayoutStyle === "sunday_brunch" ? (
                            <SundayBrunchLayout profile={profile} tabs={tabs} openEditor={openEditor} />
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
