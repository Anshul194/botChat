"use client";

import React from "react";
import { 
    ShoppingBag, Star, ShieldCheck, Clock, Mail, 
    ArrowRight, ChevronDown, CheckCircle2, MessageCircle, 
    Phone, Edit3, Layers, Info, User, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorStoreLayoutProps {
    profile: any;
    otherBlocks: any[];
    getUiTypeFromBlock: (block: any) => string;
    uiTypeOverrides?: Record<string, string>;
    renderBlockUI: (block: any, isInsideContainer: boolean, index: number) => React.ReactNode;
    openEditor?: (block: any) => void;
}

const EditOverlay = () => (
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-start justify-end p-2 opacity-0 group-hover:opacity-100 z-40 pointer-events-none">
        <div className="w-6 h-6 rounded-full bg-white/90 shadow-xl flex items-center justify-center backdrop-blur-sm border border-black/5">
            <Edit3 size={10} className="text-black" />
        </div>
    </div>
);

export const CreatorStoreLayout: React.FC<CreatorStoreLayoutProps> = ({
    profile,
    otherBlocks,
    getUiTypeFromBlock,
    renderBlockUI,
    openEditor
}) => {
    const handleEdit = (e: React.MouseEvent, block: any) => {
        if (openEditor) {
            e.stopPropagation();
            openEditor(block);
        }
    };

    // Filter special sections
    const heroBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'hero_product_section');
    const featuredBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'featured_product_section');
    const productListBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'product_list_section');
    const trustBadgesBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'trust_badges_section');
    const testimonialsBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'testimonials_section');
    const faqBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'faq_section');
    const urgencyBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'urgency_offer_section');
    const contactBlock = otherBlocks.find(b => getUiTypeFromBlock(b) === 'contact_section');

    const specialIds = [heroBlock, featuredBlock, productListBlock, trustBadgesBlock, testimonialsBlock, faqBlock, urgencyBlock, contactBlock]
        .filter(Boolean)
        .map(b => b.id);
    
    const feedBlocks = otherBlocks.filter(b => !specialIds.includes(b.id));

    return (
        <div className="flex flex-col bg-white min-h-full w-full overflow-x-hidden font-sans selection:bg-black selection:text-white">
            
            {/* ── HERO PRODUCT SECTION ── */}
            {heroBlock && (
                <section 
                    onClick={(e) => handleEdit(e, heroBlock)}
                    className="relative w-full group cursor-pointer overflow-hidden"
                >
                    <EditOverlay />
                    <div className="relative aspect-[4/5] w-full">
                        <img 
                            src={heroBlock.settings?.product_image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"} 
                            className="w-full h-full object-cover"
                            alt="Hero Product"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-[18px] font-black text-white leading-tight tracking-tight">
                                    {heroBlock.settings?.title || "Product Title"}
                                </h1>
                                <p className="text-[11px] text-white/80 font-medium leading-relaxed italic">
                                    {heroBlock.settings?.subtitle || "Product subtitle."}
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[14px]">
                                    {heroBlock.settings?.price || "$0"}
                                </div>
                                <a 
                                    href={heroBlock.settings?.cta_link || "#"}
                                    className="flex-1 bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center shadow-2xl no-underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {heroBlock.settings?.cta_text || "Get Now"}
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── TRUST BADGES SECTION ── */}
            {trustBadgesBlock && (
                <section 
                    onClick={(e) => handleEdit(e, trustBadgesBlock)}
                    className="px-4 py-6 border-b border-gray-100 group cursor-pointer relative bg-white"
                >
                    <EditOverlay />
                    <div className="flex justify-around items-center gap-2">
                        {(trustBadgesBlock.settings?.items || []).slice(0, 3).map((badge: any, i: number) => (
                            <div key={i} className="flex flex-col items-center text-center gap-1.5 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">
                                    <ShieldCheck size={14} />
                                </div>
                                <span className="text-[7px] font-bold uppercase tracking-wider text-gray-400 leading-tight line-clamp-2">
                                    {badge.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FEATURED PRODUCT ── */}
            {featuredBlock && (
                <section 
                    onClick={(e) => handleEdit(e, featuredBlock)}
                    className="p-5 group cursor-pointer relative bg-white"
                >
                    <EditOverlay />
                    <div className="rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100">
                        <div className="relative aspect-video">
                            <img 
                                src={featuredBlock.settings?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"} 
                                className="w-full h-full object-cover" 
                                alt="Featured" 
                            />
                            <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">
                                Best Seller
                            </div>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <h2 className="text-[16px] font-black text-gray-900 leading-tight">
                                    {featuredBlock.settings?.name || "Featured Product"}
                                </h2>
                                <div className="text-[14px] font-black text-gray-900">
                                    {featuredBlock.settings?.price}
                                </div>
                                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                                    {featuredBlock.settings?.description}
                                </p>
                            </div>
                            <a 
                                href={featuredBlock.settings?.link || "#"}
                                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest no-underline shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Get Access <ArrowRight size={12} />
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* ── PRODUCT LIST SECTION ── */}
            {productListBlock && (
                <section 
                    onClick={(e) => handleEdit(e, productListBlock)}
                    className="p-5 space-y-5 group cursor-pointer relative bg-white"
                >
                    <EditOverlay />
                    <div className="text-center">
                        <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">
                            The Digital Library
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {(productListBlock.settings?.items || []).map((p: any, i: number) => (
                            <a 
                                key={i}
                                href={p.link || "#"}
                                className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors no-underline group/item"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white">
                                    <img src={p.image || "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&q=80"} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-[12px] truncate">{p.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium truncate">{p.price || "Free"}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-300 shadow-sm shrink-0">
                                    <ArrowRight size={14} />
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            {/* ── URGENCY OFFER SECTION ── */}
            {urgencyBlock && (
                <section 
                    onClick={(e) => handleEdit(e, urgencyBlock)}
                    className="mx-5 my-2 p-7 rounded-[2.5rem] bg-orange-500 text-white group cursor-pointer relative overflow-hidden shadow-xl shadow-orange-500/10"
                >
                    <EditOverlay />
                    <div className="relative space-y-5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[8px] font-black uppercase tracking-widest">
                            <Clock size={10} /> Limited Time
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-[18px] font-black leading-tight tracking-tight">
                                {urgencyBlock.settings?.title || "Exclusive Offer"}
                            </h2>
                            <p className="text-[11px] text-white/80 font-medium">
                                {urgencyBlock.settings?.description}
                            </p>
                        </div>
                        <a 
                            href={urgencyBlock.settings?.button_link || "#"}
                            className="inline-block w-full bg-white text-orange-500 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest no-underline shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {urgencyBlock.settings?.button_text || "Claim Now"}
                        </a>
                    </div>
                </section>
            )}

            {/* ── TESTIMONIALS SECTION ── */}
            {testimonialsBlock && (
                <section 
                    onClick={(e) => handleEdit(e, testimonialsBlock)}
                    className="p-5 group cursor-pointer relative bg-white"
                >
                    <EditOverlay />
                    <div className="space-y-4">
                        {(testimonialsBlock.settings?.items || []).map((t: any, i: number) => (
                            <div key={i} className="p-5 rounded-[2rem] bg-gray-50 border border-gray-100 relative">
                                <div className="text-3xl font-serif text-gray-200 absolute top-3 left-4 opacity-50">“</div>
                                <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic mb-4 relative z-10">
                                    {t.quote || t.description || t.text}
                                </p>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-white">
                                        <img src={t.avatar || t.image || `https://i.pravatar.cc/150?u=${i}`} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-[11px]">{t.name || t.author}</h4>
                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{t.role || t.title}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FAQ SECTION ── */}
            {faqBlock && (
                <section 
                    onClick={(e) => handleEdit(e, faqBlock)}
                    className="mx-5 my-8 p-8 rounded-[2.5rem] bg-[#0f172a] text-white group cursor-pointer relative"
                >
                    <EditOverlay />
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-[18px] font-black tracking-tight">Frequently Asked</h2>
                            <div className="w-10 h-1 bg-white/10 mx-auto rounded-full" />
                        </div>
                        <div className="space-y-6">
                            {(faqBlock.settings?.items || []).map((faq: any, i: number) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex gap-3 items-start">
                                        <span className="text-white/20 font-black text-[12px] pt-0.5">0{i + 1}</span>
                                        <div className="space-y-2 flex-1">
                                            <h4 className="text-[13px] font-black leading-tight text-white/90">
                                                {faq.question}
                                            </h4>
                                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                    {i < (faqBlock.settings.items.length - 1) && (
                                        <div className="h-px bg-white/5 w-full ml-8" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FEED BLOCKS ── */}
            <div className="px-5 space-y-4">
                {feedBlocks.map((block: any, idx: number) => (
                    <div key={block.id} className="relative group">
                        {renderBlockUI(block, false, idx)}
                    </div>
                ))}
            </div>

            {/* ── CONTACT SECTION ── */}
            {contactBlock && (
                <section 
                    onClick={(e) => handleEdit(e, contactBlock)}
                    className="p-8 text-center space-y-6 border-t border-gray-100 bg-white"
                >
                    <EditOverlay />
                    <div className="space-y-1.5">
                        <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Need help?</h3>
                        <p className="text-[11px] text-gray-400 font-medium">We're available 24/7.</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        {contactBlock.settings?.email && (
                            <a href={`mailto:${contactBlock.settings.email}`} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">
                                <Mail size={16} />
                            </a>
                        )}
                        {contactBlock.settings?.whatsapp && (
                            <a href={`https://wa.me/${contactBlock.settings.whatsapp}`} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">
                                <MessageCircle size={16} />
                            </a>
                        )}
                        {contactBlock.settings?.phone && (
                            <a href={`tel:${contactBlock.settings.phone}`} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100">
                                <Phone size={16} />
                            </a>
                        )}
                    </div>
                </section>
            )}

            <footer className="p-8 text-center">
                <p className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-200">
                    Studio Powered
                </p>
            </footer>

        </div>
    );
};
