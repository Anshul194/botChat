"use client";

import React, { useState } from "react";
import {
    Camera, ShoppingBag, Sparkles, Coffee,
    Music, Laptop, Palette, Gamepad2, Briefcase,
    HeartPulse, Dumbbell, Zap, ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// ══════════════════════════════════════════════════════════
// CSS KEYFRAMES
// ══════════════════════════════════════════════════════════
const KEYFRAMES_CSS = `
@keyframes bio-float{0%,100%{transform:translateY(0) scale(1);opacity:.4}50%{transform:translateY(-18px) scale(1.15);opacity:.85}}
@keyframes bio-pulse{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.7;transform:scale(1.12)}}
@keyframes bio-shimmer{0%{transform:translateX(-150%)}100%{transform:translateX(250%)}}
@keyframes bio-bars{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@keyframes bio-scan{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}
@keyframes bio-orb{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-20px) scale(1.1)}50%{transform:translate(-15px,25px) scale(.9)}75%{transform:translate(20px,10px) scale(1.05)}}
@keyframes bio-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes bio-chrome{0%{background-position:200% 0}100%{background-position:-200% 0}}
@keyframes bio-breathe{0%,100%{background-size:120% 120%}50%{background-size:180% 180%}}
@keyframes bio-holo{0%{filter:hue-rotate(0deg);background-position:0% 50%}50%{filter:hue-rotate(45deg);background-position:100% 50%}100%{filter:hue-rotate(0deg);background-position:0% 50%}}
@keyframes bio-zap{0%,100%{filter:brightness(1)}15%{filter:brightness(1.4)}30%{filter:brightness(1)}45%{filter:brightness(1.2)}60%{filter:brightness(1)}}
@keyframes bio-flicker{0%,18%,22%,100%{opacity:1}20%{opacity:.55}24%{opacity:.85}70%,72%{opacity:.7}71%{opacity:1}}
@keyframes bio-wave{0%{background-position:0% 0%}25%{background-position:50% 100%}50%{background-position:100% 50%}75%{background-position:50% 0%}100%{background-position:0% 0%}}
@keyframes bio-rain{0%{background-position:0 0}100%{background-position:0 120px}}
@keyframes bio-kaleid{0%{filter:hue-rotate(0deg);background-position:0% 50%}33%{filter:hue-rotate(120deg);background-position:100% 0%}66%{filter:hue-rotate(240deg);background-position:0% 100%}100%{filter:hue-rotate(360deg);background-position:0% 50%}}
@keyframes bio-glitch{0%,100%{transform:translate(0,0)}15%{transform:translate(-3px,1px)}30%{transform:translate(2px,-2px)}45%{transform:translate(-1px,3px)}60%{transform:translate(3px,-1px)}75%{transform:translate(-2px,-2px)}90%{transform:translate(1px,2px)}}
@keyframes bio-morph{0%{background-size:200% 200%;background-position:0% 0%}33%{background-size:300% 300%;background-position:100% 0%}66%{background-size:200% 200%;background-position:50% 100%}100%{background-size:200% 200%;background-position:0% 0%}}
`;

export const ThemeAnimationStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />
);

const PARTICLE_SEEDS = [
    { x: 12, y: 22, s: 6, d: 3.0, dl: 0 },
    { x: 28, y: 52, s: 4, d: 3.6, dl: 0.4 },
    { x: 48, y: 32, s: 8, d: 4.2, dl: 0.8 },
    { x: 68, y: 58, s: 5, d: 3.3, dl: 1.2 },
    { x: 82, y: 18, s: 7, d: 4.8, dl: 1.6 },
    { x: 38, y: 72, s: 4, d: 3.9, dl: 2.0 },
    { x: 22, y: 82, s: 6, d: 3.4, dl: 2.4 },
    { x: 72, y: 42, s: 5, d: 4.4, dl: 2.8 },
];

// ══════════════════════════════════════════════════════════
// THEME EFFECTS LAYER
// ══════════════════════════════════════════════════════════
export const ThemeEffectsLayer = ({ theme, mini = false }: { theme: ThemeConfig; mini?: boolean }) => {
    const fx = theme.effects || [];
    return (
        <>
            {theme.bgImage && (
                <div className="absolute inset-0 z-[0]" style={{
                    backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                }} />
            )}
            {theme.overlayStyle && <div className="absolute inset-0 z-[1]" style={theme.overlayStyle} />}
            {theme.meshGlow && <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: theme.meshGlow }} />}

            {fx.includes('particles') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    {PARTICLE_SEEDS.slice(0, mini ? 4 : 8).map((p, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                            width: `${p.s}px`, height: `${p.s}px`,
                            backgroundColor: theme.particleColor || theme.accent,
                            left: `${p.x}%`, top: `${p.y}%`,
                            animation: `bio-float ${p.d}s ease-in-out infinite`,
                            animationDelay: `${p.dl}s`,
                        }} />
                    ))}
                </div>
            )}
            {fx.includes('orbs') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute w-32 h-32 rounded-full blur-2xl" style={{ backgroundColor: `${theme.accent}20`, top: '20%', left: '10%', animation: 'bio-orb 8s ease-in-out infinite' }} />
                    <div className="absolute w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: `${theme.accent}18`, bottom: '15%', right: '10%', animation: 'bio-orb 10s ease-in-out infinite reverse' }} />
                    {!mini && <div className="absolute w-20 h-20 rounded-full blur-xl" style={{ backgroundColor: `${theme.accent}15`, top: '50%', left: '50%', animation: 'bio-orb 6s ease-in-out infinite 2s' }} />}
                </div>
            )}
            {fx.includes('grain') && (
                <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    opacity: 0.045, mixBlendMode: 'overlay' as const,
                }} />
            )}
            {fx.includes('scanlines') && (
                <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
                }} />
            )}
            {fx.includes('scanbeam') && !mini && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute left-0 right-0 h-20" style={{
                        background: `linear-gradient(180deg, transparent, ${theme.accent}12, transparent)`,
                        animation: 'bio-scan 4s linear infinite',
                    }} />
                </div>
            )}
            {fx.includes('bars') && (
                <div className={cn("absolute bottom-0 inset-x-0 flex items-end justify-center gap-[3px] px-6 z-[2] pointer-events-none", mini ? "h-1/4 opacity-20" : "h-1/3 opacity-15")}>
                    {Array.from({ length: mini ? 6 : 12 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-t-sm" style={{
                            backgroundColor: theme.accent,
                            animation: `bio-bars ${0.5 + (i % 5) * 0.15}s ease-in-out infinite`,
                            animationDelay: `${i * 0.08}s`, transformOrigin: 'bottom',
                        }} />
                    ))}
                </div>
            )}
            {fx.includes('shimmer') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute top-0 h-full w-1/4" style={{
                        background: `linear-gradient(90deg, transparent, ${theme.accent}10, transparent)`,
                        animation: 'bio-shimmer 4s ease-in-out infinite',
                    }} />
                </div>
            )}
            {fx.includes('neon-border') && !mini && (
                <div className="absolute inset-[2px] rounded-[42px] z-[2] pointer-events-none" style={{
                    boxShadow: `inset 0 0 30px ${theme.accent}15, inset 0 0 60px ${theme.accent}08`,
                }} />
            )}
            {fx.includes('rain') && (
                <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 28px, ${theme.accent}08 28px, ${theme.accent}05 30px), repeating-linear-gradient(180deg, ${theme.accent}00 0px, ${theme.accent}00 16px, ${theme.accent}0A 16px, ${theme.accent}04 18px)`,
                    backgroundSize: '30px 120px',
                    animation: 'bio-rain 2.5s linear infinite',
                }} />
            )}
            {fx.includes('spotlight') && !mini && (
                <div className="absolute z-[2] pointer-events-none" style={{
                    width: '200%', height: '200%', top: '-50%', left: '-50%',
                    background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${theme.accent}06 20deg, transparent 40deg)`,
                    animation: 'bio-spin 12s linear infinite',
                }} />
            )}
        </>
    );
};

// ── NICHE CATEGORIES (Gen-Z Labels) ──
export const NICHE_CATEGORIES = [
    { id: 'photography', name: 'Photo', icon: <Camera size={16} /> },
    { id: 'healthcare', name: 'Wellness', icon: <HeartPulse size={16} /> },
    { id: 'fashion', name: 'Style', icon: <ShoppingBag size={16} /> },
    { id: 'fitness', name: 'Fitness', icon: <Dumbbell size={16} /> },
    { id: 'food', name: 'Foodie', icon: <Coffee size={16} /> },
    { id: 'music', name: 'Music', icon: <Music size={16} /> },
    { id: 'tech', name: 'Tech', icon: <Laptop size={16} /> },
    { id: 'art', name: 'Creative', icon: <Palette size={16} /> },
    { id: 'gaming', name: 'Gaming', icon: <Gamepad2 size={16} /> },
    { id: 'business', name: 'Creator Pro', icon: <Briefcase size={16} /> },
];

export interface TemplateItem { id: string; name: string; style: string; badge?: string; }

export const NICHE_TEMPLATES: Record<string, TemplateItem[]> = {
    photography: [
        { id: 'photo_aura', name: 'Aura', style: 'Ethereal', badge: 'Popular' },
        { id: 'photo_film', name: 'Film Burn', style: 'Vintage' },
        { id: 'photo_academia', name: 'Dark Academia', style: 'Moody' },
        { id: 'photo_golden', name: 'Golden Hour', style: 'Warm' },
        { id: 'photo_chrome', name: 'Chrome Y2K', style: 'Metallic', badge: 'Animated' },
        { id: 'photo_wild', name: 'Into the Wild', style: 'Nature', badge: 'Image' },
    ],
    healthcare: [
        { id: 'health_clean', name: 'Clean Girl', style: 'Minimal', badge: 'Trending' },
        { id: 'health_sage', name: 'Sage Life', style: 'Earthy' },
        { id: 'health_rose', name: 'Rose Quartz', style: 'Crystal' },
        { id: 'health_zen', name: 'Zen Garden', style: 'Mindful', badge: 'Animated' },
        { id: 'health_botanical', name: 'Botanical', style: 'Nature', badge: 'Image' },
    ],
    fashion: [
        { id: 'fashion_edit', name: 'The Edit', style: 'Editorial', badge: 'Trending' },
        { id: 'fashion_y2k', name: 'Y2K Baby', style: 'Retro' },
        { id: 'fashion_noir', name: 'Noir Luxe', style: 'Luxury' },
        { id: 'fashion_street', name: 'Street Core', style: 'Urban' },
        { id: 'fashion_holo', name: 'Holographic', style: 'Iridescent', badge: 'Animated' },
        { id: 'fashion_runway', name: 'Front Row', style: 'High Fashion', badge: 'Image' },
    ],
    fitness: [
        { id: 'fit_beast', name: 'Beast Mode', style: 'Aggressive', badge: 'Popular' },
        { id: 'fit_flow', name: 'Flow State', style: 'Calm' },
        { id: 'fit_fire', name: 'Fire Walk', style: 'Energy' },
        { id: 'fit_electric', name: 'Electric', style: 'Neon', badge: 'Animated' },
        { id: 'fit_iron', name: 'Iron Temple', style: 'Raw', badge: 'Image' },
    ],
    food: [
        { id: 'food_espresso', name: 'Espresso', style: 'Dark Roast', badge: 'Trending' },
        { id: 'food_omakase', name: 'Omakase', style: 'Japanese' },
        { id: 'food_earth', name: 'Earth Bowl', style: 'Organic' },
        { id: 'food_neon', name: 'Neon Bites', style: 'Retro Diner', badge: 'Animated' },
        { id: 'food_farm', name: 'Farm Table', style: 'Artisan', badge: 'Image' },
    ],
    music: [
        { id: 'music_synth', name: 'Synthwave', style: 'Retro', badge: 'Popular' },
        { id: 'music_sub', name: 'Subwoofer', style: 'Deep Bass' },
        { id: 'music_analog', name: 'Analog', style: 'Vinyl' },
        { id: 'music_eq', name: 'Equalizer', style: 'Live Beats', badge: 'Animated' },
        { id: 'music_stage', name: 'Backstage', style: 'Concert', badge: 'Image' },
    ],
    tech: [
        { id: 'tech_terminal', name: '> Terminal', style: 'Hacker', badge: 'Trending' },
        { id: 'tech_neural', name: 'Neural Net', style: 'AI' },
        { id: 'tech_launch', name: 'Launch Day', style: 'SaaS' },
        { id: 'tech_matrix', name: 'Matrix', style: 'Cyber', badge: 'Animated' },
        { id: 'tech_stack', name: 'Dev Stack', style: 'Code', badge: 'Image' },
    ],
    art: [
        { id: 'art_cube', name: 'White Cube', style: 'Gallery' },
        { id: 'art_wash', name: 'Watercolor', style: 'Paint' },
        { id: 'art_neon', name: 'Pixel Neon', style: 'Digital', badge: 'Popular' },
        { id: 'art_kaleid', name: 'Kaleidoscope', style: 'Abstract', badge: 'Animated' },
        { id: 'art_atelier', name: 'Atelier', style: 'Studio', badge: 'Image' },
    ],
    gaming: [
        { id: 'game_rgb', name: 'RGB', style: 'Pro Setup', badge: 'Trending' },
        { id: 'game_twitch', name: 'Twitch', style: 'Stream' },
        { id: 'game_8bit', name: '8-Bit', style: 'Pixel Art' },
        { id: 'game_cyber', name: 'Cyberpunk', style: 'Neon City', badge: 'Animated' },
        { id: 'game_arena', name: 'Battle Station', style: 'Setup', badge: 'Image' },
    ],
    business: [
        { id: 'biz_obsidian', name: 'Obsidian', style: 'Premium' },
        { id: 'biz_gradient', name: 'Gradient', style: 'Vibrant', badge: 'Trending' },
        { id: 'biz_paper', name: 'Paper', style: 'Clean' },
        { id: 'biz_glass', name: 'Glass UI', style: 'Modern', badge: 'Animated' },
        { id: 'biz_skyline', name: 'Skyline', style: 'Urban', badge: 'Image' },
    ],
};

// ── THEME CONFIG ──
export interface ThemeConfig {
    bgStyle: React.CSSProperties;
    textColor: string;
    btnStyle: React.CSSProperties;
    fontClass: string;
    accent: string;
    meshGlow?: string;
    bgImage?: string;
    overlayStyle?: React.CSSProperties;
    effects?: string[];
    particleColor?: string;
}

export function isColorLight(hex: string): boolean {
    const c = hex.replace('#', '');
    if (c.length < 6) return false;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ══════════════════════════════════════════════════════════
// 52 UNIQUE GEN-Z THEMES
// Every theme has a RADICALLY different button style
// Styles: Glass Pill, 3D Brutalist, Neon Glow, Gradient Fill,
//         Soft Cloud, Chrome, Outlined, Elevated Card,
//         Frosted Dark, Sharp Block, Thick Frame, Minimal,
//         Floating, Skewed, etc.
// ══════════════════════════════════════════════════════════
const THEMES: Record<string, ThemeConfig> = {

    // ═══════════════════ PHOTOGRAPHY ═══════════════════

    // ✦ Aura — Ethereal purple, glass pill buttons
    photo_aura: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0533 0%, #2e1065 35%, #4c1d95 65%, #1a0533 100%)' },
        textColor: '#e9d5ff',
        btnStyle: { background: 'rgba(233,213,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(233,213,255,0.2)', borderRadius: '9999px', color: '#e9d5ff', padding: '15px 28px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-sans', accent: '#a78bfa',
        meshGlow: 'radial-gradient(circle at 30% 70%, rgba(167,139,250,0.2), transparent 50%), radial-gradient(circle at 70% 20%, rgba(192,132,252,0.15), transparent 50%)',
    },

    // ✦ Film Burn — Warm vintage, elevated card buttons with shadow
    photo_film: {
        bgStyle: { background: 'linear-gradient(160deg, #451a03 0%, #78350f 40%, #92400e 100%)' },
        textColor: '#fef3c7',
        btnStyle: { background: '#fef3c7', border: 'none', borderRadius: '12px', color: '#78350f', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 6px 24px rgba(120,53,15,0.35)' },
        fontClass: 'font-serif', accent: '#f59e0b',
        effects: ['grain'],
    },

    // ✦ Dark Academia — Moody B&W, outlined sharp serif buttons
    photo_academia: {
        bgStyle: { background: 'linear-gradient(180deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)' },
        textColor: '#d6d3d1',
        btnStyle: { background: 'transparent', border: '1.5px solid #a8a29e', borderRadius: '0px', color: '#d6d3d1', padding: '15px 24px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontFamily: 'Georgia, serif' },
        fontClass: 'font-serif', accent: '#a8a29e',
    },

    // ✦ Golden Hour — Amber warmth, gradient-fill pill buttons
    photo_golden: {
        bgStyle: { background: 'linear-gradient(135deg, #92400e 0%, #d97706 50%, #fbbf24 100%)' },
        textColor: '#fffbeb',
        btnStyle: { background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px', color: '#fffbeb', padding: '15px 28px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif', accent: '#fbbf24',
        meshGlow: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.25), transparent 60%)',
    },

    // ★ Chrome Y2K — Animated metallic gradient, chrome buttons [ANIMATED]
    photo_chrome: {
        bgStyle: { background: 'linear-gradient(90deg, #64748b, #94a3b8, #e2e8f0, #f8fafc, #e2e8f0, #94a3b8, #64748b)', backgroundSize: '300% 100%', animation: 'bio-chrome 5s linear infinite' },
        textColor: '#1e293b',
        btnStyle: { background: 'linear-gradient(180deg, #f1f5f9, #cbd5e1, #f1f5f9)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '8px', color: '#0f172a', padding: '14px 24px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)' },
        fontClass: 'font-sans', accent: '#475569',
        effects: ['shimmer'],
    },

    // ★ Into the Wild — Forest image backdrop, frosted dark buttons [IMAGE]
    photo_wild: {
        bgStyle: { background: '#0a1a0f' },
        textColor: '#d1fae5',
        btnStyle: { background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)', border: '1px solid rgba(209,250,229,0.15)', borderRadius: '14px', color: '#d1fae5', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-serif', accent: '#34d399',
        bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,20,10,0.8) 100%)' },
    },

    // ═══════════════════ WELLNESS ═══════════════════

    // ✦ Clean Girl — White/blue minimal, soft cloud buttons
    health_clean: {
        bgStyle: { background: 'linear-gradient(160deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)' },
        textColor: '#0c4a6e',
        btnStyle: { background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '16px', color: '#0369a1', padding: '16px 24px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 16px rgba(14,165,233,0.08)' },
        fontClass: 'font-sans', accent: '#0ea5e9',
    },

    // ✦ Sage Life — Earthy sage, outlined round buttons
    health_sage: {
        bgStyle: { background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 100%)' },
        textColor: '#14532d',
        btnStyle: { background: 'transparent', border: '2px solid #16a34a', borderRadius: '9999px', color: '#15803d', padding: '14px 28px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans', accent: '#22c55e',
    },

    // ✦ Rose Quartz — Crystal pink glow, neumorphic buttons
    health_rose: {
        bgStyle: { background: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 100%)' },
        textColor: '#831843',
        btnStyle: { background: '#fce7f3', border: 'none', borderRadius: '18px', color: '#be185d', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '6px 6px 16px rgba(190,24,93,0.08), -4px -4px 12px rgba(255,255,255,0.8)' },
        fontClass: 'font-sans', accent: '#ec4899',
    },

    // ★ Zen Garden — Animated teal aurora with floating orbs [ANIMATED]
    health_zen: {
        bgStyle: { background: 'radial-gradient(ellipse at 50% 50%, #2dd4bf, #0d9488, #115e59)', backgroundSize: '120% 120%', backgroundPosition: 'center', animation: 'bio-breathe 6s ease-in-out infinite' },
        textColor: '#f0fdfa',
        btnStyle: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '9999px', color: '#f0fdfa', padding: '15px 28px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-serif', accent: '#2dd4bf',
        effects: ['orbs', 'shimmer'], particleColor: '#99f6e4',
    },

    // ★ Botanical — Garden image backdrop [IMAGE]
    health_botanical: {
        bgStyle: { background: '#0a1510' },
        textColor: '#ecfdf5',
        btnStyle: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '16px', color: '#ecfdf5', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-serif', accent: '#6ee7b7',
        bgImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,30,20,0.85) 100%)' },
    },

    // ═══════════════════ STYLE / FASHION ═══════════════════

    // ✦ The Edit — B&W editorial, 3D brutalist buttons
    fashion_edit: {
        bgStyle: { background: '#fafafa' },
        textColor: '#0a0a0a',
        btnStyle: { background: '#0a0a0a', border: '3px solid #0a0a0a', borderRadius: '0px', color: '#fafafa', padding: '16px 24px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' as const, boxShadow: '5px 5px 0px #d4d4d4' },
        fontClass: 'font-serif', accent: '#0a0a0a',
    },

    // ✦ Y2K Baby — Bubblegum pink, soft cloud pill buttons
    fashion_y2k: {
        bgStyle: { background: 'linear-gradient(160deg, #fdf2f8 0%, #fce7f3 30%, #fbcfe8 60%, #f9a8d4 100%)' },
        textColor: '#831843',
        btnStyle: { background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '9999px', color: '#be185d', padding: '15px 28px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 20px rgba(244,114,182,0.15)' },
        fontClass: 'font-sans', accent: '#f472b6',
    },

    // ✦ Noir Luxe — Black gold, sharp outlined buttons
    fashion_noir: {
        bgStyle: { background: 'linear-gradient(145deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)' },
        textColor: '#d4a574',
        btnStyle: { background: 'transparent', border: '1px solid rgba(212,165,116,0.4)', borderRadius: '0px', color: '#d4a574', padding: '16px 24px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.25em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif', accent: '#d4a574',
        meshGlow: 'radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.08), transparent 70%)',
    },

    // ✦ Street Core — Dark/red, thick frame buttons
    fashion_street: {
        bgStyle: { background: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)' },
        textColor: '#fafafa',
        btnStyle: { background: 'transparent', border: '3px solid #ef4444', borderRadius: '0px', color: '#fafafa', padding: '14px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
        fontClass: 'font-sans', accent: '#ef4444',
    },

    // ★ Holographic — Animated rainbow shimmer, glass buttons [ANIMATED]
    fashion_holo: {
        bgStyle: { background: 'linear-gradient(135deg, #fdf4ff, #dbeafe, #faf5ff, #ecfdf5, #fef9c3, #fce7f3)', backgroundSize: '300% 300%', animation: 'bio-holo 5s ease-in-out infinite' },
        textColor: '#374151',
        btnStyle: { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '14px', color: '#4b5563', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
        fontClass: 'font-sans', accent: '#a855f7',
        effects: ['shimmer', 'particles'], particleColor: '#c084fc',
    },

    // ★ Front Row — Fashion image backdrop, sharp glass buttons [IMAGE]
    fashion_runway: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#fafafa',
        btnStyle: { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0px', color: '#fafafa', padding: '16px 24px', fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif', accent: '#f472b6',
        bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.88) 100%)' },
    },

    // ═══════════════════ FITNESS ═══════════════════

    // ✦ Beast Mode — Dark red, skewed gradient-fill buttons
    fit_beast: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0000 0%, #450a0a 40%, #7f1d1d 100%)' },
        textColor: '#fca5a5',
        btnStyle: { background: 'linear-gradient(90deg, #dc2626, #ef4444)', border: 'none', borderRadius: '6px', color: '#ffffff', padding: '15px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.08em', transform: 'skewX(-2deg)', boxShadow: '0 4px 20px rgba(239,68,68,0.3)' },
        fontClass: 'font-sans', accent: '#ef4444',
        meshGlow: 'radial-gradient(circle at 50% 80%, rgba(239,68,68,0.15), transparent 60%)',
    },

    // ✦ Flow State — Calm indigo, soft outlined pills
    fit_flow: {
        bgStyle: { background: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 40%, #a5b4fc 100%)' },
        textColor: '#312e81',
        btnStyle: { background: 'transparent', border: '2px solid #6366f1', borderRadius: '9999px', color: '#4338ca', padding: '14px 28px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif', accent: '#6366f1',
    },

    // ✦ Fire Walk — Orange fire, floating card buttons
    fit_fire: {
        bgStyle: { background: 'linear-gradient(135deg, #431407 0%, #c2410c 50%, #fb923c 100%)' },
        textColor: '#fff7ed',
        btnStyle: { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '14px', color: '#c2410c', padding: '15px 24px', fontSize: '13px', fontWeight: 800, boxShadow: '0 8px 30px rgba(0,0,0,0.25)' },
        fontClass: 'font-sans', accent: '#f97316',
        meshGlow: 'radial-gradient(circle at 80% 80%, rgba(251,146,60,0.3), transparent 50%)',
    },

    // ★ Electric — Cyan neon animated, neon glow buttons [ANIMATED]
    fit_electric: {
        bgStyle: { background: 'linear-gradient(145deg, #020617 0%, #0f172a 50%, #1e1b4b 100%)', animation: 'bio-zap 4s ease-in-out infinite' },
        textColor: '#22d3ee',
        btnStyle: { background: 'transparent', border: '1.5px solid rgba(34,211,238,0.6)', borderRadius: '4px', color: '#22d3ee', padding: '14px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.1em', boxShadow: '0 0 12px rgba(34,211,238,0.2), 0 0 40px rgba(34,211,238,0.06), inset 0 0 12px rgba(34,211,238,0.04)' },
        fontClass: 'font-sans', accent: '#22d3ee',
        effects: ['particles', 'neon-border', 'scanlines'], particleColor: '#67e8f9',
    },

    // ★ Iron Temple — Gym image, bold solid buttons [IMAGE]
    fit_iron: {
        bgStyle: { background: '#0a0f14' },
        textColor: '#f0f9ff',
        btnStyle: { background: '#f97316', border: 'none', borderRadius: '6px', color: '#ffffff', padding: '15px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.06em', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' },
        fontClass: 'font-sans', accent: '#fb923c',
        bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)' },
    },

    // ═══════════════════ FOODIE ═══════════════════

    // ✦ Espresso — Dark roast, warm glass pill buttons
    food_espresso: {
        bgStyle: { background: 'linear-gradient(145deg, #1c1210 0%, #3d2820 40%, #5c3a28 100%)' },
        textColor: '#f5e6d3',
        btnStyle: { background: 'rgba(245,230,211,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245,230,211,0.2)', borderRadius: '9999px', color: '#f5e6d3', padding: '15px 28px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-serif', accent: '#d4a574',
        meshGlow: 'radial-gradient(circle at 30% 20%, rgba(212,165,116,0.15), transparent 60%)',
    },

    // ✦ Omakase — Clean white, minimal solid button with red accent
    food_omakase: {
        bgStyle: { background: '#fafaf9' },
        textColor: '#1c1917',
        btnStyle: { background: '#1c1917', border: 'none', borderRadius: '10px', color: '#fafaf9', padding: '16px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' },
        fontClass: 'font-sans', accent: '#dc2626',
    },

    // ✦ Earth Bowl — Green organic, outlined green pills
    food_earth: {
        bgStyle: { background: 'linear-gradient(160deg, #f7fee7 0%, #ecfccb 40%, #d9f99d 100%)' },
        textColor: '#1a2e05',
        btnStyle: { background: 'transparent', border: '2px solid #65a30d', borderRadius: '9999px', color: '#3f6212', padding: '14px 28px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans', accent: '#65a30d',
    },

    // ★ Neon Bites — Retro pink diner, neon glow pill buttons [ANIMATED]
    food_neon: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0a0a 0%, #2d0a1e 40%, #1a0a0a 100%)', animation: 'bio-flicker 5s ease-in-out infinite' },
        textColor: '#fb7185',
        btnStyle: { background: 'transparent', border: '1.5px solid rgba(251,113,133,0.5)', borderRadius: '9999px', color: '#fda4af', padding: '15px 28px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 15px rgba(251,113,133,0.15), 0 0 45px rgba(251,113,133,0.05), inset 0 0 15px rgba(251,113,133,0.03)' },
        fontClass: 'font-sans', accent: '#fb7185',
        effects: ['particles', 'shimmer', 'neon-border'], particleColor: '#fb7185',
    },

    // ★ Farm Table — Rustic food image, warm card buttons [IMAGE]
    food_farm: {
        bgStyle: { background: '#1a1510' },
        textColor: '#fef3c7',
        btnStyle: { background: 'rgba(254,243,199,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(254,243,199,0.18)', borderRadius: '12px', color: '#fef3c7', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-serif', accent: '#f59e0b',
        bgImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(26,21,16,0.9) 100%)' },
    },

    // ═══════════════════ MUSIC ═══════════════════

    // ✦ Synthwave — Deep purple, retro neon outlined buttons
    music_synth: {
        bgStyle: { background: 'linear-gradient(135deg, #0f0326 0%, #1e0845 30%, #2e1065 60%, #1e0845 100%)' },
        textColor: '#e879f9',
        btnStyle: { background: 'rgba(232,121,249,0.06)', border: '1px solid rgba(232,121,249,0.35)', borderRadius: '4px', color: '#f0abfc', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(232,121,249,0.1), inset 0 0 20px rgba(232,121,249,0.03)', letterSpacing: '0.06em' },
        fontClass: 'font-mono', accent: '#d946ef',
        meshGlow: 'radial-gradient(circle at 20% 80%, rgba(192,38,211,0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15), transparent 50%)',
    },

    // ✦ Subwoofer — Navy/cyan, frosted dark card buttons
    music_sub: {
        bgStyle: { background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)' },
        textColor: '#38bdf8',
        btnStyle: { background: 'rgba(56,189,248,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px', color: '#7dd3fc', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 24px rgba(56,189,248,0.06)' },
        fontClass: 'font-sans', accent: '#0ea5e9',
        meshGlow: 'radial-gradient(circle at 50% 100%, rgba(14,165,233,0.12), transparent 60%)',
    },

    // ✦ Analog — Warm stone/gold, warm serif pill buttons
    music_analog: {
        bgStyle: { background: 'linear-gradient(145deg, #292524 0%, #44403c 50%, #57534e 100%)' },
        textColor: '#fde68a',
        btnStyle: { background: 'rgba(253,230,138,0.1)', border: '1px solid rgba(253,230,138,0.25)', borderRadius: '9999px', color: '#fde68a', padding: '15px 28px', fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif' },
        fontClass: 'font-serif', accent: '#fbbf24',
        effects: ['grain'],
    },

    // ★ Equalizer — Animated bars + particles, glass buttons [ANIMATED]
    music_eq: {
        bgStyle: { background: 'linear-gradient(145deg, #020617, #1e1b4b, #4c1d95, #2e1065)', backgroundSize: '200% 200%', animation: 'bio-wave 8s ease-in-out infinite' },
        textColor: '#c084fc',
        btnStyle: { background: 'rgba(192,132,252,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(192,132,252,0.25)', borderRadius: '8px', color: '#d8b4fe', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 20px rgba(192,132,252,0.08)' },
        fontClass: 'font-mono', accent: '#a855f7',
        effects: ['bars', 'particles', 'scanbeam'], particleColor: '#c084fc',
    },

    // ★ Backstage — Concert image, frosted buttons [IMAGE]
    music_stage: {
        bgStyle: { background: '#0a0510' },
        textColor: '#faf5ff',
        btnStyle: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#faf5ff', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-sans', accent: '#c084fc',
        bgImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(10,5,16,0.35) 0%, rgba(10,5,16,0.9) 100%)' },
        effects: ['grain'],
    },

    // ═══════════════════ TECH ═══════════════════

    // ✦ Terminal — Green on black, monospace outlined buttons
    tech_terminal: {
        bgStyle: { background: 'linear-gradient(180deg, #0a0f14 0%, #0d1117 50%, #0a0f14 100%)' },
        textColor: '#4ade80',
        btnStyle: { background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '4px', color: '#4ade80', padding: '14px 24px', fontSize: '12px', fontWeight: 500, fontFamily: 'monospace', letterSpacing: '0.04em' },
        fontClass: 'font-mono', accent: '#22c55e',
        meshGlow: 'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.06), transparent 50%)',
    },

    // ✦ Neural Net — Indigo/purple, gradient-fill card buttons
    tech_neural: {
        bgStyle: { background: 'linear-gradient(145deg, #0c0a20 0%, #1e1b4b 35%, #312e81 70%, #1e1b4b 100%)' },
        textColor: '#a5b4fc',
        btnStyle: { background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', backdropFilter: 'blur(16px)', border: '1px solid rgba(165,180,252,0.15)', borderRadius: '16px', color: '#c7d2fe', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(99,102,241,0.1)' },
        fontClass: 'font-sans', accent: '#6366f1',
        meshGlow: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(168,85,247,0.1), transparent 50%)',
    },

    // ✦ Launch Day — Blue SaaS, elevated white card buttons
    tech_launch: {
        bgStyle: { background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 35%, #0ea5e9 70%, #38bdf8 100%)' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '12px', color: '#0369a1', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' },
        fontClass: 'font-sans', accent: '#38bdf8',
    },

    // ★ Matrix — Animated green rain, scanlines + glow buttons [ANIMATED]
    tech_matrix: {
        bgStyle: { background: '#020a02', position: 'relative' as const },
        textColor: '#4ade80',
        btnStyle: { background: 'transparent', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '2px', color: '#4ade80', padding: '14px 24px', fontSize: '11px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' as const, boxShadow: '0 0 10px rgba(74,222,128,0.08), inset 0 0 10px rgba(74,222,128,0.03)' },
        fontClass: 'font-mono', accent: '#22c55e',
        effects: ['rain', 'scanlines', 'particles', 'grain'], particleColor: '#4ade80',
    },

    // ★ Dev Stack — Code image, monospace buttons [IMAGE]
    tech_stack: {
        bgStyle: { background: '#050810' },
        textColor: '#e0f2fe',
        btnStyle: { background: 'rgba(224,242,254,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(224,242,254,0.12)', borderRadius: '6px', color: '#e0f2fe', padding: '14px 24px', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' },
        fontClass: 'font-mono', accent: '#38bdf8',
        bgImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,8,16,0.5) 0%, rgba(5,8,16,0.94) 100%)' },
        effects: ['scanlines'],
    },

    // ═══════════════════ CREATIVE / ART ═══════════════════

    // ✦ White Cube — Gallery minimal, thin outlined serif buttons
    art_cube: {
        bgStyle: { background: '#ffffff' },
        textColor: '#171717',
        btnStyle: { background: 'transparent', border: '1.5px solid #171717', borderRadius: '0px', color: '#171717', padding: '15px 24px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const, fontFamily: 'Georgia, serif' },
        fontClass: 'font-serif', accent: '#171717',
    },

    // ✦ Watercolor — Pastel wash, soft frosted pills
    art_wash: {
        bgStyle: { background: 'linear-gradient(135deg, #fdf2f8 0%, #dbeafe 25%, #faf5ff 50%, #ecfdf5 75%, #fef9c3 100%)' },
        textColor: '#374151',
        btnStyle: { background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: 'none', borderRadius: '9999px', color: '#4b5563', padding: '15px 28px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' },
        fontClass: 'font-serif', accent: '#8b5cf6',
    },

    // ✦ Pixel Neon — Black + neon green, hard-edge glow buttons
    art_neon: {
        bgStyle: { background: '#000000' },
        textColor: '#00ff88',
        btnStyle: { background: 'transparent', border: '1.5px solid #00ff88', borderRadius: '0px', color: '#00ff88', padding: '14px 24px', fontSize: '11px', fontWeight: 700, boxShadow: '0 0 15px rgba(0,255,136,0.15), inset 0 0 15px rgba(0,255,136,0.04)', textTransform: 'uppercase' as const, letterSpacing: '0.12em', fontFamily: 'monospace' },
        fontClass: 'font-mono', accent: '#00ff88',
        meshGlow: 'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.05), transparent 70%)',
    },

    // ★ Kaleidoscope — Animated color-shifting, white glass buttons [ANIMATED]
    art_kaleid: {
        bgStyle: { background: 'linear-gradient(135deg, #f43f5e, #8b5cf6, #06b6d4, #f59e0b, #10b981, #ec4899)', backgroundSize: '400% 400%', animation: 'bio-kaleid 12s ease-in-out infinite' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '16px', color: '#ffffff', padding: '15px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' },
        fontClass: 'font-sans', accent: '#a78bfa',
        effects: ['orbs', 'grain'], particleColor: '#ffffff',
    },

    // ★ Atelier — Art studio image, warm glass buttons [IMAGE]
    art_atelier: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#fef3c7',
        btnStyle: { background: 'rgba(254,243,199,0.06)', backdropFilter: 'blur(20px)', border: '1px solid rgba(254,243,199,0.15)', borderRadius: '14px', color: '#fef3c7', padding: '15px 24px', fontSize: '13px', fontWeight: 600, fontFamily: 'Georgia, serif' },
        fontClass: 'font-serif', accent: '#f59e0b',
        bgImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(10,10,10,0.9) 100%)' },
    },

    // ═══════════════════ GAMING ═══════════════════

    // ✦ RGB — Black with conic RGB glow, emerald glow buttons
    game_rgb: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#34d399',
        btnStyle: { background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(52,211,153,0.4)', borderRadius: '8px', color: '#6ee7b7', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(52,211,153,0.08), 0 0 60px rgba(52,211,153,0.02)', letterSpacing: '0.06em' },
        fontClass: 'font-mono', accent: '#10b981',
        meshGlow: 'conic-gradient(from 0deg at 50% 50%, rgba(239,68,68,0.06), rgba(250,204,21,0.06), rgba(74,222,128,0.06), rgba(56,189,248,0.06), rgba(168,85,247,0.06), rgba(239,68,68,0.06))',
    },

    // ✦ Twitch — Purple gradient, purple glass pill buttons
    game_twitch: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0a2e 0%, #2d1b69 40%, #5b21b6 100%)' },
        textColor: '#e9d5ff',
        btnStyle: { background: 'rgba(147,51,234,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '9999px', color: '#d8b4fe', padding: '15px 28px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 20px rgba(147,51,234,0.12)' },
        fontClass: 'font-sans', accent: '#a855f7',
        meshGlow: 'radial-gradient(circle at 50% 0%, rgba(147,51,234,0.2), transparent 60%)',
    },

    // ✦ 8-Bit — Pixel retro, blocky bordered buttons
    game_8bit: {
        bgStyle: { background: '#1a1a2e' },
        textColor: '#eab308',
        btnStyle: { background: '#16213e', border: '3px solid #eab308', borderRadius: '0px', color: '#eab308', padding: '14px 24px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.08em', boxShadow: '4px 4px 0px #eab30850' },
        fontClass: 'font-mono', accent: '#eab308',
    },

    // ★ Cyberpunk — Animated neon city, full-effect buttons [ANIMATED]
    game_cyber: {
        bgStyle: { background: 'linear-gradient(135deg, #0a0a2e, #1a0a3e, #2a0a4e, #1a0a2e)', animation: 'bio-glitch 3s steps(1) infinite' },
        textColor: '#f9a8d4',
        btnStyle: { background: 'rgba(236,72,153,0.06)', border: '2px solid rgba(236,72,153,0.45)', borderRadius: '2px', color: '#f9a8d4', padding: '14px 24px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.14em', boxShadow: '0 0 18px rgba(236,72,153,0.12), inset 0 0 18px rgba(236,72,153,0.03)' },
        fontClass: 'font-mono', accent: '#ec4899',
        effects: ['particles', 'scanlines', 'neon-border', 'scanbeam', 'spotlight'], particleColor: '#f472b6',
    },

    // ★ Battle Station — Gaming setup image, glass buttons [IMAGE]
    game_arena: {
        bgStyle: { background: '#050510' },
        textColor: '#e0f2fe',
        btnStyle: { background: 'rgba(224,242,254,0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '6px', color: '#e0f2fe', padding: '14px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' },
        fontClass: 'font-mono', accent: '#8b5cf6',
        bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,5,16,0.35) 0%, rgba(5,5,16,0.92) 100%)' },
        effects: ['scanlines'],
    },

    // ═══════════════════ CREATOR PRO ═══════════════════

    // ✦ Obsidian — Dark premium, minimal glass card buttons
    biz_obsidian: {
        bgStyle: { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
        textColor: '#e2e8f0',
        btnStyle: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '12px', color: '#cbd5e1', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-sans', accent: '#3b82f6',
    },

    // ✦ Gradient — Vibrant gradient, white pill buttons
    biz_gradient: {
        bgStyle: { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #ec4899 60%, #f43f5e 100%)' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: '9999px', color: '#7c3aed', padding: '15px 28px', fontSize: '13px', fontWeight: 800, boxShadow: '0 6px 24px rgba(0,0,0,0.18)' },
        fontClass: 'font-sans', accent: '#f472b6',
        meshGlow: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 50%)',
    },

    // ✦ Paper — Light clean, solid dark card buttons
    biz_paper: {
        bgStyle: { background: '#f8fafc' },
        textColor: '#0f172a',
        btnStyle: { background: '#0f172a', border: 'none', borderRadius: '10px', color: '#f8fafc', padding: '16px 24px', fontSize: '13px', fontWeight: 600, boxShadow: '0 2px 8px rgba(15,23,42,0.08)' },
        fontClass: 'font-sans', accent: '#0f172a',
    },

    // ★ Glass UI — Animated glass morphism, orbs + shimmer [ANIMATED]
    biz_glass: {
        bgStyle: { background: 'linear-gradient(135deg, #1e293b, #334155, #475569, #334155)', backgroundSize: '200% 200%', animation: 'bio-morph 12s ease-in-out infinite' },
        textColor: '#f1f5f9',
        btnStyle: { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', color: '#f1f5f9', padding: '15px 24px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
        fontClass: 'font-sans', accent: '#60a5fa',
        effects: ['orbs', 'shimmer'], particleColor: '#93c5fd',
    },

    // ★ Skyline — City image, glass buttons [IMAGE]
    biz_skyline: {
        bgStyle: { background: '#050510' },
        textColor: '#f1f5f9',
        btnStyle: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-sans', accent: '#60a5fa',
        bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,5,16,0.25) 0%, rgba(5,5,16,0.9) 100%)' },
    },
};

const DEFAULT_THEME: ThemeConfig = {
    bgStyle: { background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' },
    textColor: '#e2e8f0',
    btnStyle: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#e2e8f0', padding: '15px 24px', fontSize: '13px', fontWeight: 600 },
    fontClass: 'font-sans', accent: '#64748b',
};

export const getTheme = (id: string = 'photo_aura'): ThemeConfig => {
    return THEMES[id] || DEFAULT_THEME;
};

// ══════════════════════════════════════════════════════════
// VISUALS LAB — Gen-Z Template Picker
// ══════════════════════════════════════════════════════════
export const VisualsLab = ({ profile, updateProfile }: any) => {
    const [selectedNiche, setSelectedNiche] = useState('photography');

    return (
        <div className="space-y-6">
            <ThemeAnimationStyles />

            {/* ── Category Pills ── */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {NICHE_CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedNiche(cat.id)}
                        className={cn(
                            "flex-shrink-0 h-10 px-5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all",
                            selectedNiche === cat.id
                                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                : "bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800"
                        )}>
                        {cat.icon} {cat.name}
                    </button>
                ))}
            </div>

            {/* ── Template Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {NICHE_TEMPLATES[selectedNiche]?.map((tpl) => {
                    const tCfg = getTheme(tpl.id);
                    const isSelected = profile?.theme === tpl.id;
                    const isAnimated = tpl.badge === 'Animated';
                    const isImage = tpl.badge === 'Image';

                    return (
                        <button key={tpl.id} onClick={() => updateProfile({ theme: tpl.id })}
                            className={cn(
                                "group relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all duration-300 outline-none cursor-pointer",
                                isSelected
                                    ? "border-rose-500 shadow-2xl shadow-rose-500/20 scale-[1.02]"
                                    : "border-transparent hover:border-rose-500/30 hover:shadow-xl"
                            )}>

                            <div className="absolute inset-0" style={tCfg.bgStyle}>
                                <ThemeEffectsLayer theme={tCfg} mini />
                                <div className="absolute inset-0 flex flex-col items-center pt-8 px-4 opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-[5]">
                                    <div className="w-10 h-10 rounded-full mb-2" style={{ border: `2px solid ${tCfg.textColor}30`, backgroundColor: `${tCfg.textColor}10` }} />
                                    <div className="w-14 h-1.5 rounded-full mb-1" style={{ backgroundColor: `${tCfg.textColor}25` }} />
                                    <div className="w-10 h-1 rounded-full mb-5" style={{ backgroundColor: `${tCfg.textColor}15` }} />
                                    <div className="w-full space-y-2">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="w-full h-7 transition-all duration-500"
                                                style={{ ...tCfg.btnStyle, padding: 0, fontSize: 0 }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {isSelected && (
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center z-20 shadow-lg">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                            )}

                            {tpl.badge && (
                                <div className={cn(
                                    "absolute top-3 left-3 px-2.5 py-1 text-white text-[8px] font-black uppercase rounded-full shadow-lg flex items-center gap-1 z-20",
                                    isAnimated ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                                        isImage ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
                                            "bg-gradient-to-r from-rose-500 to-pink-500"
                                )}>
                                    {isAnimated ? <Zap size={8} /> : isImage ? <ImageIcon size={8} /> : <Sparkles size={8} />}
                                    {tpl.badge}
                                </div>
                            )}

                            <div className="absolute bottom-0 inset-x-0 p-2.5 z-10">
                                <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-2xl group-hover:translate-y-[-2px] transition-transform duration-300">
                                    <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{tpl.name}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-[0.15em]" style={{ color: tCfg.accent }}>{tpl.style}</span>
                                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tCfg.accent}20` }}>
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tCfg.accent }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
