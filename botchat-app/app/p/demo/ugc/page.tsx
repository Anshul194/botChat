"use client";

import React, { useState } from "react";
import PageMeta from "@/components/PageMeta";
import { UGCLayout } from "@/app/dashboard/instagram/bio-link/layouts/UGCLayout";
import { getTheme, ThemeEffectsLayer, ThemeAnimationStyles } from "@/app/dashboard/instagram/bio-link/TemplateSystem";
import { getUiTypeFromBlock, isMediaType } from "@/app/dashboard/instagram/bio-link/builder-utils";
import { Globe, MoreHorizontal, Mail, Phone, Share2, Check, Link as LinkIcon, Camera, Instagram, Youtube, Video } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for UGC Demo
const MOCK_PROFILE = {
    link_id: "demo-ugc",
    title: "Sarah Jenkins",
    description: "UGC Creator | Content Strategist | Aesthetic Storytelling",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    email_link: "hello@sarahjenkins.com",
    contact_link: "+1234567890",
    theme: "beauty_pink",
    url: "sarah-ugc",
    tabs: [
        {
            id: 1,
            title: "Portfolio",
            sections: [
                {
                    id: 1,
                    title: "Recent Work",
                    blocks: [
                        {
                            id: 101,
                            type: "vertical_media",
                            items: [
                                { image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400" },
                                { image_url: "https://images.unsplash.com/photo-1529139513065-07b3b1bfde91?w=400" },
                                { image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400" }
                            ]
                        },
                        {
                            id: 102,
                            type: "heading",
                            settings: { title: "Featured Brands", text_alignment: "center" }
                        },
                        {
                            id: 103,
                            type: "add_logos",
                            items: [
                                { title: "Vogue", image_url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Vogue_logo.svg" },
                                { title: "Zara", image_url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" },
                                { title: "Nike", image_url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" }
                            ]
                        },
                        {
                            id: 104,
                            type: "link",
                            settings: { title: "Collaborate with me", text_alignment: "center" },
                            location_url: "https://example.com/collab"
                        },
                        {
                            id: 105,
                            type: "link",
                            settings: { title: "My Equipment List", text_alignment: "center" },
                            location_url: "https://example.com/gear"
                        }
                    ]
                }
            ]
        }
    ]
};

function BlockRenderer({ block, theme }: { block: any; theme: any }) {
    const type = getUiTypeFromBlock(block);
    const settings = block.settings || {};
    const items = block.items || [];
    const alignment = settings.text_alignment || "center";
    const effectiveTextColor = theme.textColor || "#000000";
    
    switch (type) {
        case "vertical_media":
            return (
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                    {items.map((item: any, i: number) => (
                        <div key={i} className="flex-shrink-0 h-[200px] w-[130px] rounded-2xl bg-white/10 overflow-hidden border border-white/20 shadow-lg">
                            <img src={item.image_url} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            );
        case "add_logos":
            return (
                <div className="flex flex-wrap gap-4 justify-center py-4">
                    {items.map((item: any, i: number) => (
                        <div key={i} className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md flex items-center justify-center p-3 shadow-sm">
                            <img src={item.image_url} className="w-full h-full object-contain filter grayscale" />
                        </div>
                    ))}
                </div>
            );
        case "heading":
            return (
                <div className="pt-8 pb-3" style={{ textAlign: alignment as any }}>
                    <h2 className="text-[20px] font-black tracking-tighter" style={{ color: effectiveTextColor }}>
                        {settings.title}
                    </h2>
                </div>
            );
        case "link":
            return (
                <a href={block.location_url || "#"} className="w-full h-14 flex items-center justify-center bg-white border border-gray-100 shadow-sm rounded-2xl px-6 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <span className="font-bold text-gray-800 text-sm">{settings.title}</span>
                </a>
            );
        default: return null;
    }
}

export default function UGCDemoPage() {
    const theme = getTheme(MOCK_PROFILE.theme);
    const otherBlocks = MOCK_PROFILE.tabs[0].sections[0].blocks;
    const topAvatar = { id: 0, type: "avatar", settings: { image: MOCK_PROFILE.avatar } };

    return (
        <>
            <PageMeta
                title="UGC Creator Portfolio Demo — BotChat Bio Link"
                description="Preview a beautiful UGC creator portfolio bio-link page powered by BotChat."
                noindex
            />
            <h1 className="sr-only">Sarah Jenkins | UGC Creator Portfolio</h1>
            <div className="min-h-screen w-full" style={theme.bgStyle}>
                <ThemeAnimationStyles />
                <ThemeEffectsLayer theme={theme} />
                <div className="w-full min-h-screen relative overflow-hidden flex flex-col">
                    <UGCLayout
                        profile={MOCK_PROFILE as any}
                        otherBlocks={otherBlocks}
                        topAvatar={topAvatar}
                        instagramUsername="sarah.ugc"
                        getUiTypeFromBlock={getUiTypeFromBlock}
                        uiTypeOverrides={{}}
                        isMediaType={isMediaType}
                        renderBlockUI={(block: any) => (
                            <BlockRenderer key={block.id} block={block} theme={theme} />
                        )}
                    />
                </div>
            </div>
        </>
    );
}
