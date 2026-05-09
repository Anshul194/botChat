"use client";

import React, { useState } from "react";
import { InstaProLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaProLayout";
import { InstaTrendyLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaTrendyLayout";
import { InstaMinimalLayout } from "@/app/dashboard/instagram/bio-link/layouts/InstaMinimalLayout";
import { SundayBrunchLayout } from "@/app/dashboard/instagram/bio-link/layouts/SundayBrunchLayout";

const DEMO_PROFILE = {
    title: "Premium Creator",
    bio: "Showcasing the next generation of bio-link templates. High-fidelity, structural, and conversion-optimized.",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400"
};

const getDemoTabs = (type: string) => {
    // Basic common blocks
    const commonBlocks = [
        { id: 1, type: 'header_profile_section', is_enabled: 1, is_active: 1, settings: { name: "Premium Demo", bio: "Visual Storyteller / Digital Nomad", avatar: DEMO_PROFILE.avatar } },
        { id: 2, type: 'link', is_enabled: 1, is_active: 1, settings: { title: "Latest Portfolio", description: "View our recent works", url: "#", is_featured: true } },
        { id: 3, type: 'links_grid', is_enabled: 1, is_active: 1, settings: { items: [{ name: 'Twitter', url: '#' }, { name: 'Instagram', url: '#' }] } },
        { id: 4, type: 'stats_section', is_enabled: 1, is_active: 1, settings: { items: [{ value: '1.2M', label: 'Reach' }, { soul: '48k', label: 'Fans' }] } },
        { id: 5, type: 'brands_section', is_enabled: 1, is_active: 1, items: [{ name: 'VOGUE' }, { name: 'VICE' }] },
        { id: 6, type: 'newsletter', is_enabled: 1, is_active: 1, settings: { title: "Join the Inner Circle", button_text: "Subscribe" } }
    ];

    return [{
        id: 1,
        title: "Main",
        sections: [{
            id: 1,
            blocks: commonBlocks
        }]
    }];
};

export default function PremiumDemoPage() {
    const [selected, setSelected] = useState('insta_pro');

    const templates = [
        { id: 'insta_pro', name: 'Insta Pro', color: 'bg-black text-white' },
        { id: 'insta_trendy', name: 'Insta Trendy', color: 'bg-indigo-900 text-white' },
        { id: 'insta_minimal', name: 'Insta Minimal', color: 'bg-white text-black' },
        { id: 'sunday_brunch', name: 'Sunday Brunch', color: 'bg-[#fdfaf5] text-[#2d241e]' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <h1 className="font-black text-xl tracking-tighter">PREMIUM SHOWCASE</h1>
                    <div className="flex gap-2">
                        {templates.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setSelected(t.id)}
                                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selected === t.id ? 'bg-black text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex justify-center py-12 px-4">
                <div className="w-full max-w-[540px] shadow-2xl rounded-[3rem] overflow-hidden bg-white">
                    {selected === 'insta_pro' && <InstaProLayout profile={DEMO_PROFILE} tabs={getDemoTabs('insta_pro')} />}
                    {selected === 'insta_trendy' && <InstaTrendyLayout profile={DEMO_PROFILE} tabs={getDemoTabs('insta_trendy')} />}
                    {selected === 'insta_minimal' && <InstaMinimalLayout profile={DEMO_PROFILE} tabs={getDemoTabs('insta_minimal')} />}
                    {selected === 'sunday_brunch' && <SundayBrunchLayout profile={DEMO_PROFILE} tabs={getDemoTabs('sunday_brunch')} />}
                </div>
            </div>
            
            <div className="bg-white border-t border-slate-200 py-20 px-8 text-center">
                <h2 className="text-3xl font-black mb-4">Ready to elevate your presence?</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">All templates are fully integrated with the dynamic builder and backend API.</p>
                <div className="flex justify-center gap-4">
                    <button className="px-8 py-4 bg-black text-white rounded-full font-black text-sm uppercase tracking-widest">Get Started</button>
                </div>
            </div>
        </div>
    );
}
