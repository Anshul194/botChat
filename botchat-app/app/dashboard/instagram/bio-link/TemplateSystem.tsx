"use client";

import React, { useState } from "react";
import {
    Camera, ShoppingBag, Sparkles, Coffee,
    Music, Laptop, Palette, Gamepad2, Briefcase,
    HeartPulse, Dumbbell, Zap, ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// ══════════════════════════════════════════════════════════
// CSS KEYFRAMES — Injected once for all animated themes
// ══════════════════════════════════════════════════════════
const KEYFRAMES_CSS = `
@keyframes bio-aurora{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes bio-float{0%,100%{transform:translateY(0) scale(1);opacity:.4}50%{transform:translateY(-18px) scale(1.15);opacity:.85}}
@keyframes bio-pulse{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.7;transform:scale(1.12)}}
@keyframes bio-shimmer{0%{transform:translateX(-150%)}100%{transform:translateX(250%)}}
@keyframes bio-bars{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@keyframes bio-glow{0%,100%{box-shadow:0 0 5px currentColor,0 0 15px currentColor}50%{box-shadow:0 0 25px currentColor,0 0 50px currentColor,0 0 80px currentColor}}
@keyframes bio-scan{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}
@keyframes bio-orb{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(30px,-20px) scale(1.1)}50%{transform:translate(-15px,25px) scale(.9)}75%{transform:translate(20px,10px) scale(1.05)}}
@keyframes bio-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes bio-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
`;

export const ThemeAnimationStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: KEYFRAMES_CSS }} />
);

// ── PARTICLE SEEDS (deterministic positions) ──
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
// THEME EFFECTS LAYER — renders all visual effects
// ══════════════════════════════════════════════════════════
export const ThemeEffectsLayer = ({ theme, mini = false }: { theme: ThemeConfig; mini?: boolean }) => {
    const fx = theme.effects || [];
    return (
        <>
            {/* Background Image */}
            {theme.bgImage && (
                <div className="absolute inset-0 z-[0]" style={{
                    backgroundImage: `url(${theme.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }} />
            )}

            {/* Overlay for image readability */}
            {theme.overlayStyle && (
                <div className="absolute inset-0 z-[1]" style={theme.overlayStyle} />
            )}

            {/* Mesh glow */}
            {theme.meshGlow && (
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: theme.meshGlow }} />
            )}

            {/* Floating particles */}
            {fx.includes('particles') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    {PARTICLE_SEEDS.slice(0, mini ? 4 : 8).map((p, i) => (
                        <div key={i} className="absolute rounded-full"
                            style={{
                                width: `${p.s}px`, height: `${p.s}px`,
                                backgroundColor: theme.particleColor || theme.accent,
                                left: `${p.x}%`, top: `${p.y}%`,
                                animation: `bio-float ${p.d}s ease-in-out infinite`,
                                animationDelay: `${p.dl}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Pulsing orbs */}
            {fx.includes('orbs') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute w-32 h-32 rounded-full blur-2xl" style={{
                        backgroundColor: `${theme.accent}20`,
                        top: '20%', left: '10%',
                        animation: 'bio-orb 8s ease-in-out infinite',
                    }} />
                    <div className="absolute w-24 h-24 rounded-full blur-2xl" style={{
                        backgroundColor: `${theme.accent}18`,
                        bottom: '15%', right: '10%',
                        animation: 'bio-orb 10s ease-in-out infinite reverse',
                    }} />
                    {!mini && <div className="absolute w-20 h-20 rounded-full blur-xl" style={{
                        backgroundColor: `${theme.accent}15`,
                        top: '50%', left: '50%',
                        animation: 'bio-orb 6s ease-in-out infinite 2s',
                    }} />}
                </div>
            )}

            {/* Film grain texture */}
            {fx.includes('grain') && (
                <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    opacity: 0.045,
                    mixBlendMode: 'overlay' as const,
                }} />
            )}

            {/* CRT scanlines */}
            {fx.includes('scanlines') && (
                <div className="absolute inset-0 z-[2] pointer-events-none" style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 3px)',
                }} />
            )}

            {/* Moving scan beam */}
            {fx.includes('scanbeam') && !mini && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute left-0 right-0 h-20" style={{
                        background: `linear-gradient(180deg, transparent, ${theme.accent}12, transparent)`,
                        animation: 'bio-scan 4s linear infinite',
                    }} />
                </div>
            )}

            {/* Equalizer bars */}
            {fx.includes('bars') && (
                <div className={cn(
                    "absolute bottom-0 inset-x-0 flex items-end justify-center gap-[3px] px-6 z-[2] pointer-events-none",
                    mini ? "h-1/4 opacity-20" : "h-1/3 opacity-15"
                )}>
                    {Array.from({ length: mini ? 6 : 12 }).map((_, i) => (
                        <div key={i} className="flex-1 rounded-t-sm"
                            style={{
                                backgroundColor: theme.accent,
                                animation: `bio-bars ${0.5 + (i % 5) * 0.15}s ease-in-out infinite`,
                                animationDelay: `${i * 0.08}s`,
                                transformOrigin: 'bottom',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Shimmer streak */}
            {fx.includes('shimmer') && (
                <div className="absolute inset-0 overflow-hidden z-[2] pointer-events-none">
                    <div className="absolute top-0 h-full w-1/4" style={{
                        background: `linear-gradient(90deg, transparent, ${theme.accent}10, transparent)`,
                        animation: 'bio-shimmer 4s ease-in-out infinite',
                    }} />
                </div>
            )}

            {/* Neon glow border */}
            {fx.includes('neon-border') && !mini && (
                <div className="absolute inset-[2px] rounded-[42px] z-[2] pointer-events-none" style={{
                    boxShadow: `inset 0 0 30px ${theme.accent}15, inset 0 0 60px ${theme.accent}08`,
                }} />
            )}
        </>
    );
};

// ── NICHE CATEGORIES ──
export const NICHE_CATEGORIES = [
    { id: 'photography', name: 'Photography', icon: <Camera size={16} /> },
    { id: 'healthcare', name: 'Healthcare', icon: <HeartPulse size={16} /> },
    { id: 'fashion', name: 'Fashion', icon: <ShoppingBag size={16} /> },
    { id: 'fitness', name: 'Fitness', icon: <Dumbbell size={16} /> },
    { id: 'food', name: 'Food', icon: <Coffee size={16} /> },
    { id: 'music', name: 'Music', icon: <Music size={16} /> },
    { id: 'tech', name: 'Tech', icon: <Laptop size={16} /> },
    { id: 'art', name: 'Art', icon: <Palette size={16} /> },
    { id: 'gaming', name: 'Gaming', icon: <Gamepad2 size={16} /> },
    { id: 'business', name: 'Business', icon: <Briefcase size={16} /> },
];

// ── TEMPLATE DEFINITIONS ──
export interface TemplateItem {
    id: string;
    name: string;
    style: string;
    badge?: string;
}

export const NICHE_TEMPLATES: Record<string, TemplateItem[]> = {
    photography: [
        { id: 'photo_nature', name: 'Nature Focus', style: 'Earthy', badge: 'Popular' },
        { id: 'photo_vibrant', name: 'Color Burst', style: 'Artistic' },
        { id: 'photo_mono', name: 'B&W Portfolio', style: 'Minimal' },
        { id: 'photo_portrait', name: 'Golden Hour', style: 'Warm' },
        { id: 'photo_cinematic', name: 'Cinematic', style: 'Film Noir', badge: 'Animated' },
        { id: 'photo_forest', name: 'Forest Light', style: 'Natural', badge: 'Image' },
    ],
    healthcare: [
        { id: 'health_clinical', name: 'Clinical Pure', style: 'Medical', badge: 'Popular' },
        { id: 'health_yoga', name: 'Yoga Breath', style: 'Zen' },
        { id: 'health_wellness', name: 'Wellness Aura', style: 'Holistic' },
        { id: 'health_aurora', name: 'Calm Aurora', style: 'Mindful', badge: 'Animated' },
        { id: 'health_garden', name: 'Healing Garden', style: 'Nature', badge: 'Image' },
    ],
    fashion: [
        { id: 'fashion_vogue', name: 'Vogue Editorial', style: 'Elite', badge: 'Trending' },
        { id: 'fashion_pastel', name: 'Pastel Dream', style: 'Soft' },
        { id: 'fashion_street', name: 'Street Edge', style: 'Urban' },
        { id: 'fashion_luxury', name: 'Black Luxe', style: 'Luxury' },
        { id: 'fashion_neon', name: 'Neon Runway', style: 'Glow', badge: 'Animated' },
        { id: 'fashion_studio', name: 'Fashion Studio', style: 'Editorial', badge: 'Image' },
    ],
    fitness: [
        { id: 'fit_beast', name: 'Power Beast', style: 'Bold', badge: 'Popular' },
        { id: 'fit_yoga', name: 'Zen Flow', style: 'Calm' },
        { id: 'fit_runner', name: 'Run Trail', style: 'Energy' },
        { id: 'fit_neon', name: 'Electric Pump', style: 'Neon', badge: 'Animated' },
        { id: 'fit_outdoor', name: 'Outdoor Grind', style: 'Raw', badge: 'Image' },
    ],
    food: [
        { id: 'food_coffee', name: 'Dark Roast', style: 'Cafe', badge: 'Trending' },
        { id: 'food_sushi', name: 'Sushi Bar', style: 'Japanese' },
        { id: 'food_organic', name: 'Farm Fresh', style: 'Organic' },
        { id: 'food_neon', name: 'Neon Diner', style: 'Retro', badge: 'Animated' },
        { id: 'food_rustic', name: 'Rustic Table', style: 'Artisan', badge: 'Image' },
    ],
    music: [
        { id: 'music_synth', name: 'Synth Wave', style: 'Retro', badge: 'Popular' },
        { id: 'music_bass', name: 'Bass Drop', style: 'Techno' },
        { id: 'music_acoustic', name: 'Vinyl Warm', style: 'Classic' },
        { id: 'music_visualizer', name: 'Equalizer', style: 'Beats', badge: 'Animated' },
        { id: 'music_concert', name: 'Live Stage', style: 'Concert', badge: 'Image' },
    ],
    tech: [
        { id: 'tech_code', name: 'Code Terminal', style: 'Developer', badge: 'Trending' },
        { id: 'tech_ai', name: 'Neural Net', style: 'AI' },
        { id: 'tech_startup', name: 'Launch Pad', style: 'Modern' },
        { id: 'tech_matrix', name: 'Matrix Rain', style: 'Cyber', badge: 'Animated' },
        { id: 'tech_circuit', name: 'Circuit Board', style: 'Hardware', badge: 'Image' },
    ],
    art: [
        { id: 'art_gallery', name: 'Gallery White', style: 'Museum' },
        { id: 'art_watercolor', name: 'Watercolor', style: 'Paint' },
        { id: 'art_digital', name: 'Neon Canvas', style: 'Digital', badge: 'Popular' },
        { id: 'art_abstract', name: 'Living Color', style: 'Abstract', badge: 'Animated' },
        { id: 'art_studio', name: 'Paint Studio', style: 'Creative', badge: 'Image' },
    ],
    gaming: [
        { id: 'game_rgb', name: 'RGB Beast', style: 'Pro', badge: 'Trending' },
        { id: 'game_twitch', name: 'Purple Stream', style: 'Live' },
        { id: 'game_retro', name: 'Pixel Quest', style: 'Retro' },
        { id: 'game_cyber', name: 'Cyberpunk', style: 'Neon', badge: 'Animated' },
        { id: 'game_arena', name: 'Game Arena', style: 'Setup', badge: 'Image' },
    ],
    business: [
        { id: 'biz_corporate', name: 'Navy Suite', style: 'Corporate' },
        { id: 'biz_startup', name: 'Gradient Rise', style: 'Startup', badge: 'Trending' },
        { id: 'biz_consultant', name: 'Slate Pro', style: 'Consult' },
        { id: 'biz_glass', name: 'Glass Office', style: 'Modern', badge: 'Animated' },
        { id: 'biz_skyline', name: 'City Skyline', style: 'Urban', badge: 'Image' },
    ],
};

// ── THEME CONFIG INTERFACE ──
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

// ── UTILITY ──
export function isColorLight(hex: string): boolean {
    const c = hex.replace('#', '');
    if (c.length < 6) return false;
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// ══════════════════════════════════════════════════════════
// 52 UNIQUE THEMES
// Types: Gradient | Animated (CSS anim + effects) | Image
// ══════════════════════════════════════════════════════════
const THEMES: Record<string, ThemeConfig> = {

    // ═══ PHOTOGRAPHY ═══
    photo_nature: {
        bgStyle: { background: 'linear-gradient(145deg, #1a472a 0%, #2d6a40 40%, #1a472a 100%)' },
        textColor: '#d4edda',
        btnStyle: { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '9999px', color: '#d4edda', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#4ade80',
        meshGlow: 'radial-gradient(ellipse at 80% 20%, rgba(74,222,128,0.12), transparent 60%)',
    },
    photo_vibrant: {
        bgStyle: { background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 30%, #8b5cf6 70%, #6366f1 100%)' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', color: '#ffffff', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 8px 32px rgba(236,72,153,0.25)' },
        fontClass: 'font-sans',
        accent: '#f472b6',
        meshGlow: 'radial-gradient(circle at 30% 70%, rgba(244,63,94,0.25), transparent 50%), radial-gradient(circle at 70% 20%, rgba(139,92,246,0.25), transparent 50%)',
    },
    photo_mono: {
        bgStyle: { background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)' },
        textColor: '#e5e5e5',
        btnStyle: { background: 'transparent', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '0px', color: '#ffffff', padding: '14px 24px', fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' as const },
        fontClass: 'font-sans',
        accent: '#a3a3a3',
    },
    photo_portrait: {
        bgStyle: { background: 'linear-gradient(145deg, #92400e 0%, #d97706 50%, #f59e0b 100%)' },
        textColor: '#fefce8',
        btnStyle: { background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#fef3c7', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#fbbf24',
        meshGlow: 'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.2), transparent 60%)',
    },
    // ★ ANIMATED — Cinematic film look with grain + scanlines + pulsing orbs
    photo_cinematic: {
        bgStyle: { background: 'linear-gradient(-45deg, #0f0c29, #302b63, #24243e, #0f0c29)', backgroundSize: '400% 400%', animation: 'bio-aurora 12s ease infinite' },
        textColor: '#c4b5fd',
        btnStyle: { background: 'rgba(196,181,253,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: '8px', color: '#ddd6fe', padding: '14px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' },
        fontClass: 'font-sans',
        accent: '#8b5cf6',
        effects: ['grain', 'scanlines', 'orbs'],
        particleColor: '#a78bfa',
    },
    // ★ IMAGE — Forest light with nature backdrop
    photo_forest: {
        bgStyle: { background: '#0a1a0f' },
        textColor: '#d1fae5',
        btnStyle: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#d1fae5', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#34d399',
        bgImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,20,10,0.75) 100%)' },
    },

    // ═══ HEALTHCARE ═══
    health_clinical: {
        bgStyle: { background: 'linear-gradient(160deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)' },
        textColor: '#1e3a5f',
        btnStyle: { background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '14px', color: '#1d4ed8', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 2px 12px rgba(59,130,246,0.08)' },
        fontClass: 'font-sans',
        accent: '#3b82f6',
    },
    health_yoga: {
        bgStyle: { background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 40%, #5eead4 100%)' },
        textColor: '#134e4a',
        btnStyle: { background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '9999px', color: '#0f766e', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#14b8a6',
    },
    health_wellness: {
        bgStyle: { background: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 40%, #fbcfe8 100%)' },
        textColor: '#831843',
        btnStyle: { background: '#ffffff', border: '1px solid #fce7f3', borderRadius: '18px', color: '#be185d', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 16px rgba(190,24,93,0.06)' },
        fontClass: 'font-sans',
        accent: '#ec4899',
    },
    // ★ ANIMATED — Calming aurora waves with floating orbs
    health_aurora: {
        bgStyle: { background: 'linear-gradient(-45deg, #0d9488, #2dd4bf, #a7f3d0, #6ee7b7, #0d9488)', backgroundSize: '400% 400%', animation: 'bio-aurora 10s ease infinite' },
        textColor: '#f0fdfa',
        btnStyle: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px', color: '#f0fdfa', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#2dd4bf',
        effects: ['orbs', 'shimmer'],
        particleColor: '#99f6e4',
    },
    // ★ IMAGE — Healing garden backdrop
    health_garden: {
        bgStyle: { background: '#0a1510' },
        textColor: '#ecfdf5',
        btnStyle: { background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '16px', color: '#ecfdf5', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#6ee7b7',
        bgImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,30,20,0.8) 100%)' },
    },

    // ═══ FASHION ═══
    fashion_vogue: {
        bgStyle: { background: '#fafafa' },
        textColor: '#0a0a0a',
        btnStyle: { background: '#0a0a0a', border: 'none', borderRadius: '0px', color: '#fafafa', padding: '16px 24px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif',
        accent: '#0a0a0a',
    },
    fashion_pastel: {
        bgStyle: { background: 'linear-gradient(160deg, #fdf4ff 0%, #fae8ff 35%, #e9d5ff 70%, #d8b4fe 100%)' },
        textColor: '#581c87',
        btnStyle: { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(216,180,254,0.4)', borderRadius: '9999px', color: '#7e22ce', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 20px rgba(168,85,247,0.08)' },
        fontClass: 'font-sans',
        accent: '#a855f7',
    },
    fashion_street: {
        bgStyle: { background: 'linear-gradient(180deg, #18181b 0%, #27272a 100%)' },
        textColor: '#fafafa',
        btnStyle: { background: 'transparent', border: '2px solid #ef4444', borderRadius: '4px', color: '#fafafa', padding: '14px 24px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
        fontClass: 'font-sans',
        accent: '#ef4444',
    },
    fashion_luxury: {
        bgStyle: { background: 'linear-gradient(145deg, #0c0a09 0%, #1c1917 50%, #0c0a09 100%)' },
        textColor: '#d4a574',
        btnStyle: { background: 'transparent', border: '1px solid rgba(212,165,116,0.4)', borderRadius: '0px', color: '#d4a574', padding: '14px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif',
        accent: '#d4a574',
        meshGlow: 'radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.08), transparent 70%)',
    },
    // ★ ANIMATED — Neon runway with glow borders + particles
    fashion_neon: {
        bgStyle: { background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)' },
        textColor: '#f0abfc',
        btnStyle: { background: 'rgba(240,171,252,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(240,171,252,0.35)', borderRadius: '0px', color: '#f5d0fe', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(240,171,252,0.1), 0 0 40px rgba(240,171,252,0.04)', letterSpacing: '0.1em', textTransform: 'uppercase' as const },
        fontClass: 'font-sans',
        accent: '#e879f9',
        effects: ['particles', 'neon-border', 'shimmer'],
        particleColor: '#e879f9',
    },
    // ★ IMAGE — Fashion studio editorial backdrop
    fashion_studio: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#fafafa',
        btnStyle: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0px', color: '#fafafa', padding: '16px 24px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif',
        accent: '#f472b6',
        bgImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)' },
    },

    // ═══ FITNESS ═══
    fit_beast: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0000 0%, #450a0a 40%, #7f1d1d 100%)' },
        textColor: '#fca5a5',
        btnStyle: { background: 'linear-gradient(90deg, #dc2626, #ef4444)', border: 'none', borderRadius: '6px', color: '#ffffff', padding: '14px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.08em', transform: 'skewX(-2deg)' },
        fontClass: 'font-sans',
        accent: '#ef4444',
        meshGlow: 'radial-gradient(circle at 50% 80%, rgba(239,68,68,0.15), transparent 60%)',
    },
    fit_yoga: {
        bgStyle: { background: 'linear-gradient(145deg, #e0e7ff 0%, #c7d2fe 40%, #a5b4fc 100%)' },
        textColor: '#312e81',
        btnStyle: { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '9999px', color: '#4338ca', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#6366f1',
    },
    fit_runner: {
        bgStyle: { background: 'linear-gradient(135deg, #431407 0%, #c2410c 50%, #fb923c 100%)' },
        textColor: '#fff7ed',
        btnStyle: { background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fed7aa', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans',
        accent: '#f97316',
        meshGlow: 'radial-gradient(circle at 80% 80%, rgba(251,146,60,0.25), transparent 50%)',
    },
    // ★ ANIMATED — Electric neon pump with glow + particles
    fit_neon: {
        bgStyle: { background: 'linear-gradient(-45deg, #020617, #0f172a, #1e1b4b, #020617)', backgroundSize: '400% 400%', animation: 'bio-aurora 8s ease infinite' },
        textColor: '#22d3ee',
        btnStyle: { background: 'rgba(34,211,238,0.08)', border: '2px solid rgba(34,211,238,0.5)', borderRadius: '4px', color: '#22d3ee', padding: '14px 24px', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.1em', boxShadow: '0 0 16px rgba(34,211,238,0.15)' },
        fontClass: 'font-sans',
        accent: '#22d3ee',
        effects: ['particles', 'neon-border', 'scanlines'],
        particleColor: '#67e8f9',
    },
    // ★ IMAGE — Outdoor gym/workout backdrop
    fit_outdoor: {
        bgStyle: { background: '#0a0f14' },
        textColor: '#f0f9ff',
        btnStyle: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#f0f9ff', padding: '14px 24px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
        fontClass: 'font-sans',
        accent: '#fb923c',
        bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)' },
    },

    // ═══ FOOD ═══
    food_coffee: {
        bgStyle: { background: 'linear-gradient(145deg, #1c1210 0%, #3d2820 40%, #5c3a28 100%)' },
        textColor: '#f5e6d3',
        btnStyle: { background: 'rgba(245,230,211,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245,230,211,0.2)', borderRadius: '9999px', color: '#f5e6d3', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#d4a574',
        meshGlow: 'radial-gradient(circle at 30% 20%, rgba(212,165,116,0.12), transparent 60%)',
    },
    food_sushi: {
        bgStyle: { background: '#fafaf9' },
        textColor: '#1c1917',
        btnStyle: { background: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '8px', color: '#dc2626', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
        fontClass: 'font-sans',
        accent: '#dc2626',
    },
    food_organic: {
        bgStyle: { background: 'linear-gradient(160deg, #ecfccb 0%, #d9f99d 40%, #a3e635 100%)' },
        textColor: '#1a2e05',
        btnStyle: { background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '9999px', color: '#365314', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans',
        accent: '#65a30d',
    },
    // ★ ANIMATED — Retro neon diner with glow + bars
    food_neon: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0a0a 0%, #2d0a1e 40%, #1a0a0a 100%)' },
        textColor: '#fb7185',
        btnStyle: { background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.35)', borderRadius: '9999px', color: '#fda4af', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 20px rgba(251,113,133,0.08)' },
        fontClass: 'font-sans',
        accent: '#fb7185',
        effects: ['particles', 'shimmer', 'neon-border'],
        particleColor: '#fb7185',
    },
    // ★ IMAGE — Rustic wooden table artisan vibe
    food_rustic: {
        bgStyle: { background: '#1a1510' },
        textColor: '#fef3c7',
        btnStyle: { background: 'rgba(254,243,199,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(254,243,199,0.2)', borderRadius: '12px', color: '#fef3c7', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#f59e0b',
        bgImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(26,21,16,0.88) 100%)' },
    },

    // ═══ MUSIC ═══
    music_synth: {
        bgStyle: { background: 'linear-gradient(135deg, #0f0326 0%, #1e0845 30%, #2e1065 60%, #1e0845 100%)' },
        textColor: '#e879f9',
        btnStyle: { background: 'rgba(232,121,249,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(232,121,249,0.3)', borderRadius: '4px', color: '#f0abfc', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 24px rgba(232,121,249,0.12), inset 0 0 24px rgba(232,121,249,0.04)', letterSpacing: '0.05em' },
        fontClass: 'font-mono',
        accent: '#d946ef',
        meshGlow: 'radial-gradient(circle at 20% 80%, rgba(192,38,211,0.15), transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.15), transparent 50%)',
    },
    music_bass: {
        bgStyle: { background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)' },
        textColor: '#38bdf8',
        btnStyle: { background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '10px', color: '#7dd3fc', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 24px rgba(56,189,248,0.08)' },
        fontClass: 'font-sans',
        accent: '#0ea5e9',
        meshGlow: 'radial-gradient(circle at 50% 100%, rgba(14,165,233,0.12), transparent 60%)',
    },
    music_acoustic: {
        bgStyle: { background: 'linear-gradient(145deg, #292524 0%, #44403c 50%, #57534e 100%)' },
        textColor: '#fde68a',
        btnStyle: { background: 'rgba(253,230,138,0.08)', border: '1px solid rgba(253,230,138,0.2)', borderRadius: '9999px', color: '#fde68a', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#fbbf24',
    },
    // ★ ANIMATED — Live equalizer with bars + particles + scan beam
    music_visualizer: {
        bgStyle: { background: 'linear-gradient(-45deg, #020617, #1e1b4b, #4c1d95, #1e1b4b, #020617)', backgroundSize: '400% 400%', animation: 'bio-aurora 6s ease infinite' },
        textColor: '#c084fc',
        btnStyle: { background: 'rgba(192,132,252,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '8px', color: '#d8b4fe', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 0 20px rgba(192,132,252,0.1)' },
        fontClass: 'font-mono',
        accent: '#a855f7',
        effects: ['bars', 'particles', 'scanbeam'],
        particleColor: '#c084fc',
    },
    // ★ IMAGE — Live concert stage backdrop
    music_concert: {
        bgStyle: { background: '#0a0510' },
        textColor: '#faf5ff',
        btnStyle: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px', color: '#faf5ff', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans',
        accent: '#c084fc',
        bgImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(10,5,16,0.4) 0%, rgba(10,5,16,0.85) 100%)' },
        effects: ['grain'],
    },

    // ═══ TECH ═══
    tech_code: {
        bgStyle: { background: 'linear-gradient(180deg, #0a0f14 0%, #0d1117 50%, #0a0f14 100%)' },
        textColor: '#4ade80',
        btnStyle: { background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px', color: '#4ade80', padding: '14px 24px', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.03em' },
        fontClass: 'font-mono',
        accent: '#22c55e',
        meshGlow: 'radial-gradient(circle at 50% 0%, rgba(74,222,128,0.06), transparent 50%)',
    },
    tech_ai: {
        bgStyle: { background: 'linear-gradient(145deg, #0c0a20 0%, #1e1b4b 35%, #312e81 70%, #1e1b4b 100%)' },
        textColor: '#a5b4fc',
        btnStyle: { background: 'rgba(99,102,241,0.1)', backdropFilter: 'blur(16px)', border: '1px solid rgba(165,180,252,0.2)', borderRadius: '16px', color: '#c7d2fe', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(99,102,241,0.12)' },
        fontClass: 'font-sans',
        accent: '#6366f1',
        meshGlow: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(168,85,247,0.1), transparent 50%)',
    },
    tech_startup: {
        bgStyle: { background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 35%, #0ea5e9 70%, #38bdf8 100%)' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '12px', color: '#ffffff', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' },
        fontClass: 'font-sans',
        accent: '#38bdf8',
        meshGlow: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08), transparent 50%)',
    },
    // ★ ANIMATED — Matrix rain with scanlines + scan beam + green glow
    tech_matrix: {
        bgStyle: { background: '#020a02' },
        textColor: '#4ade80',
        btnStyle: { background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '2px', color: '#4ade80', padding: '14px 24px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase' as const, boxShadow: '0 0 12px rgba(74,222,128,0.06)' },
        fontClass: 'font-mono',
        accent: '#22c55e',
        effects: ['scanlines', 'scanbeam', 'particles', 'grain'],
        particleColor: '#4ade80',
        meshGlow: 'radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.04), transparent 70%)',
    },
    // ★ IMAGE — Circuit/code backdrop
    tech_circuit: {
        bgStyle: { background: '#050810' },
        textColor: '#e0f2fe',
        btnStyle: { background: 'rgba(224,242,254,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(224,242,254,0.15)', borderRadius: '8px', color: '#e0f2fe', padding: '14px 24px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' },
        fontClass: 'font-mono',
        accent: '#38bdf8',
        bgImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,8,16,0.5) 0%, rgba(5,8,16,0.92) 100%)' },
        effects: ['scanlines'],
    },

    // ═══ ART ═══
    art_gallery: {
        bgStyle: { background: '#ffffff' },
        textColor: '#171717',
        btnStyle: { background: 'transparent', border: '1.5px solid #171717', borderRadius: '0px', color: '#171717', padding: '14px 24px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' as const },
        fontClass: 'font-serif',
        accent: '#171717',
    },
    art_watercolor: {
        bgStyle: { background: 'linear-gradient(135deg, #fdf2f8 0%, #dbeafe 25%, #faf5ff 50%, #ecfdf5 75%, #fef9c3 100%)' },
        textColor: '#374151',
        btnStyle: { background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '9999px', color: '#4b5563', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#8b5cf6',
    },
    art_digital: {
        bgStyle: { background: '#000000' },
        textColor: '#00ff88',
        btnStyle: { background: 'transparent', border: '1px solid #00ff88', borderRadius: '0px', color: '#00ff88', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 16px rgba(0,255,136,0.1), inset 0 0 16px rgba(0,255,136,0.03)', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace' },
        fontClass: 'font-mono',
        accent: '#00ff88',
        meshGlow: 'radial-gradient(circle at 50% 50%, rgba(0,255,136,0.06), transparent 70%)',
    },
    // ★ ANIMATED — Living color abstract with shifting aurora + orbs
    art_abstract: {
        bgStyle: { background: 'linear-gradient(-45deg, #f43f5e, #8b5cf6, #06b6d4, #f59e0b, #10b981, #f43f5e)', backgroundSize: '600% 600%', animation: 'bio-aurora 15s ease infinite' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '16px', color: '#ffffff', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' },
        fontClass: 'font-sans',
        accent: '#a78bfa',
        effects: ['orbs', 'grain'],
        particleColor: '#ffffff',
    },
    // ★ IMAGE — Colorful art studio backdrop
    art_studio: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#fef3c7',
        btnStyle: { background: 'rgba(254,243,199,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(254,243,199,0.18)', borderRadius: '12px', color: '#fef3c7', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-serif',
        accent: '#f59e0b',
        bgImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(10,10,10,0.88) 100%)' },
    },

    // ═══ GAMING ═══
    game_rgb: {
        bgStyle: { background: '#0a0a0a' },
        textColor: '#34d399',
        btnStyle: { background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(52,211,153,0.4)', borderRadius: '8px', color: '#6ee7b7', padding: '14px 24px', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(52,211,153,0.1), 0 0 60px rgba(52,211,153,0.03)', letterSpacing: '0.05em' },
        fontClass: 'font-mono',
        accent: '#10b981',
        meshGlow: 'conic-gradient(from 0deg at 50% 50%, rgba(239,68,68,0.06), rgba(251,146,60,0.06), rgba(250,204,21,0.06), rgba(74,222,128,0.06), rgba(56,189,248,0.06), rgba(168,85,247,0.06), rgba(239,68,68,0.06))',
    },
    game_twitch: {
        bgStyle: { background: 'linear-gradient(145deg, #1a0a2e 0%, #2d1b69 40%, #5b21b6 100%)' },
        textColor: '#e9d5ff',
        btnStyle: { background: 'rgba(147,51,234,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '12px', color: '#d8b4fe', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(147,51,234,0.15)' },
        fontClass: 'font-sans',
        accent: '#a855f7',
        meshGlow: 'radial-gradient(circle at 50% 0%, rgba(147,51,234,0.2), transparent 60%)',
    },
    game_retro: {
        bgStyle: { background: '#1a1a2e' },
        textColor: '#eab308',
        btnStyle: { background: '#16213e', border: '2px solid #eab308', borderRadius: '0px', color: '#eab308', padding: '14px 24px', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase' as const, letterSpacing: '0.08em' },
        fontClass: 'font-mono',
        accent: '#eab308',
    },
    // ★ ANIMATED — Cyberpunk neon with full effects
    game_cyber: {
        bgStyle: { background: 'linear-gradient(-45deg, #0a0a2e, #1a0a3e, #2a0a4e, #0a0a2e)', backgroundSize: '400% 400%', animation: 'bio-aurora 6s ease infinite' },
        textColor: '#f0abfc',
        btnStyle: { background: 'rgba(240,171,252,0.06)', border: '2px solid rgba(236,72,153,0.5)', borderRadius: '2px', color: '#f9a8d4', padding: '14px 24px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.12em', boxShadow: '0 0 20px rgba(236,72,153,0.12), inset 0 0 20px rgba(236,72,153,0.04)' },
        fontClass: 'font-mono',
        accent: '#ec4899',
        effects: ['particles', 'scanlines', 'neon-border', 'scanbeam'],
        particleColor: '#f472b6',
    },
    // ★ IMAGE — Gaming arena/setup backdrop
    game_arena: {
        bgStyle: { background: '#050510' },
        textColor: '#e0f2fe',
        btnStyle: { background: 'rgba(224,242,254,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '6px', color: '#e0f2fe', padding: '14px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' },
        fontClass: 'font-mono',
        accent: '#8b5cf6',
        bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,5,16,0.4) 0%, rgba(5,5,16,0.9) 100%)' },
        effects: ['scanlines'],
    },

    // ═══ BUSINESS ═══
    biz_corporate: {
        bgStyle: { background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
        textColor: '#e2e8f0',
        btnStyle: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', color: '#cbd5e1', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans',
        accent: '#3b82f6',
    },
    biz_startup: {
        bgStyle: { background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #ec4899 60%, #f43f5e 100%)' },
        textColor: '#ffffff',
        btnStyle: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '9999px', color: '#ffffff', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
        fontClass: 'font-sans',
        accent: '#f472b6',
        meshGlow: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.08), transparent 50%)',
    },
    biz_consultant: {
        bgStyle: { background: '#f8fafc' },
        textColor: '#0f172a',
        btnStyle: { background: '#0f172a', border: 'none', borderRadius: '10px', color: '#f8fafc', padding: '14px 24px', fontSize: '13px', fontWeight: 600 },
        fontClass: 'font-sans',
        accent: '#0f172a',
    },
    // ★ ANIMATED — Glass office with animated gradient + orbs
    biz_glass: {
        bgStyle: { background: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #1e293b)', backgroundSize: '400% 400%', animation: 'bio-aurora 10s ease infinite' },
        textColor: '#f1f5f9',
        btnStyle: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: '#f1f5f9', padding: '14px 24px', fontSize: '13px', fontWeight: 700, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' },
        fontClass: 'font-sans',
        accent: '#60a5fa',
        effects: ['orbs', 'shimmer'],
        particleColor: '#93c5fd',
    },
    // ★ IMAGE — City skyline backdrop
    biz_skyline: {
        bgStyle: { background: '#050510' },
        textColor: '#f1f5f9',
        btnStyle: { background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#f1f5f9', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
        fontClass: 'font-sans',
        accent: '#60a5fa',
        bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        overlayStyle: { background: 'linear-gradient(180deg, rgba(5,5,16,0.3) 0%, rgba(5,5,16,0.88) 100%)' },
    },
};

const DEFAULT_THEME: ThemeConfig = {
    bgStyle: { background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)' },
    textColor: '#e2e8f0',
    btnStyle: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#e2e8f0', padding: '14px 24px', fontSize: '13px', fontWeight: 700 },
    fontClass: 'font-sans',
    accent: '#64748b',
};

export const getTheme = (id: string = 'photo_mono'): ThemeConfig => {
    return THEMES[id] || DEFAULT_THEME;
};

// ══════════════════════════════════════════════════════════
// VISUALS LAB — Template picker for the Creator Studio
// ══════════════════════════════════════════════════════════
export const VisualsLab = ({ profile, updateProfile }: any) => {
    const [selectedNiche, setSelectedNiche] = useState('photography');

    return (
        <div className="space-y-6">
            {/* Inject animation keyframes */}
            <ThemeAnimationStyles />

            {/* ── Niche Category Pills ── */}
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
                                "group relative aspect-[9/16] rounded-2xl overflow-hidden border-2 transition-all duration-300 outline-none",
                                isSelected
                                    ? "border-rose-500 shadow-2xl shadow-rose-500/20 scale-[1.02]"
                                    : "border-transparent hover:border-rose-500/30 hover:shadow-xl"
                            )}>

                            {/* Background fill */}
                            <div className="absolute inset-0" style={tCfg.bgStyle}>
                                {/* All effects (images, overlays, particles, etc.) */}
                                <ThemeEffectsLayer theme={tCfg} mini />

                                {/* Mini phone wireframe preview */}
                                <div className="absolute inset-0 flex flex-col items-center pt-8 px-4 opacity-50 group-hover:opacity-80 transition-opacity duration-500 z-[5]">
                                    <div className="w-10 h-10 rounded-full mb-2"
                                        style={{ border: `2px solid ${tCfg.textColor}30`, backgroundColor: `${tCfg.textColor}10` }} />
                                    <div className="w-14 h-1.5 rounded-full mb-1"
                                        style={{ backgroundColor: `${tCfg.textColor}25` }} />
                                    <div className="w-10 h-1 rounded-full mb-5"
                                        style={{ backgroundColor: `${tCfg.textColor}15` }} />
                                    <div className="w-full space-y-2">
                                        {[1, 2, 3].map(n => (
                                            <div key={n} className="w-full h-7 transition-all duration-500"
                                                style={{ ...tCfg.btnStyle, padding: 0, fontSize: 0 }} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Selected checkmark */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center z-20 shadow-lg">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            )}

                            {/* Badge */}
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

                            {/* Label overlay */}
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
