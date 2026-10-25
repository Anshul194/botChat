"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Facebook, ShieldCheck, ExternalLink } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useTenantSettings, sanitizeAppName } from "@/providers/TenantSettingsProvider";
import BrandLogo from "@/components/BrandLogo";

/* ─── Static fallback data ─────────────────────────────────────── */
const PLATFORM_NAME = "MegaDM";
const PLATFORM_TAGLINE = "The world's most advanced automation engine for social growth and precision conversion.";

const SOLUTIONS = [
    { label: "Comment Automation", href: "/features" },
    { label: "DM Funnels", href: "/features" },
    { label: "Lead Capture", href: "/features" },
    { label: "AI Workflows", href: "/features" },
    { label: "Flow Builder", href: "/features" },
];

const PLATFORM_LINKS = [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog Insights", href: "/blog" },
    { label: "Platform Guide", href: "/features" },
];

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/home/privacy_policy" },
    { label: "Terms of Use", href: "/home/terms_use" },
    { label: "Disclaimer", href: "/home/disclaimer" },
    { label: "Accessibility Statement", href: "/home/accessibility" },
    { label: "Cookie Policy", href: "/home/cookie_policy" },
    { label: "Browser Caching", href: "/home/browser_caching" },
    { label: "Contact Us", href: "/contact" },
    { label: "Sitemap", href: "/sitemap.xml" },
];

const SOCIALS = [
    { icon: <Instagram size={18} />, href: "#", name: "Instagram" },
    { icon: <Twitter size={18} />, href: "#", name: "Twitter" },
    { icon: <Facebook size={18} />, href: "#", name: "Facebook" },
    { icon: <Linkedin size={18} />, href: "#", name: "LinkedIn" },
];

const PRODUCT_PILLARS = [
    { title: "Meta Graph API", sub: "Official & Compliant" },
    { title: "Instagram & Facebook", sub: "Native Multi-Channel" },
    { title: "Visual Flow Builder", sub: "Drag & Drop Funnels" },
    { title: "Smart Unified Inbox", sub: "24/7 Lead Capture" },
];

interface GeneralSettings {
    siteName?: string;
    platformName?: string;
    tagline?: string;
    supportEmail?: string;
    email?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    linkedinUrl?: string;
}

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const { settings } = useTenantSettings();
    const general = useSelector((state: RootState) => state.settings?.general as GeneralSettings | undefined);
    const platformName: string = sanitizeAppName(settings.appName || general?.siteName || general?.platformName || PLATFORM_NAME);
    const platformTagline: string = general?.tagline || PLATFORM_TAGLINE;
    const supportEmail: string = general?.supportEmail || general?.email || "support@megadm.chat";
    const socialLinks = {
        instagram: general?.instagramUrl || "#",
        twitter: general?.twitterUrl || "#",
        facebook: general?.facebookUrl || "#",
        linkedin: general?.linkedinUrl || "#",
    };

    const dynamicSocials = [
        { icon: <Instagram size={18} />, href: socialLinks.instagram, name: "Instagram" },
        { icon: <Twitter size={18} />, href: socialLinks.twitter, name: "Twitter" },
        { icon: <Facebook size={18} />, href: socialLinks.facebook, name: "Facebook" },
        { icon: <Linkedin size={18} />, href: socialLinks.linkedin, name: "LinkedIn" },
    ];
    const validSocials = dynamicSocials.filter(s => s.href && s.href !== "#");

    return (
        <footer className="relative text-white pt-24 pb-32 overflow-hidden antialiased" style={{ background: "#06000d" }}>

            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"
                style={{ background: "rgba(255,45,120,0.08)", filter: "blur(140px)" }} />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"
                style={{ background: "rgba(131,58,180,0.05)", filter: "blur(120px)" }} />

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* ── PLATFORM PILLARS BAR ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20 p-6 rounded-3xl border"
                    style={{ borderColor: "rgba(255,45,120,0.15)", background: "rgba(255,45,120,0.05)" }}>
                    {PRODUCT_PILLARS.map((p) => (
                        <div key={p.title} className="text-center">
                            <div className="text-base sm:text-lg font-black text-white">{p.title}</div>
                            <div className="text-xs font-semibold mt-1 text-slate-300">{p.sub}</div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-20 mb-20">

                    {/* Brand column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center">
                            <BrandLogo
                                variant="dark"
                                alt={platformName}
                                className="h-14 w-auto object-contain"
                            />
                        </div>

                        <p className="text-lg font-medium leading-relaxed max-w-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                            {platformTagline}
                        </p>

                        {/* Social icons - only rendered if configured with valid links */}
                        {validSocials.length > 0 && (
                            <div className="flex items-center gap-3">
                                {validSocials.map((social) => (
                                    <Link
                                        key={social.name}
                                        href={social.href}
                                        aria-label={`Visit us on ${social.name}`}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D78]"
                                        style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = "#FF2D78";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "#fff";
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#FF2D78";
                                            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
                                            (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)";
                                            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                                            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
                                        }}
                                    >
                                        {social.icon}
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Contact email if available */}
                        {supportEmail && (
                            <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D78] rounded"
                                style={{ color: "rgba(255,255,255,0.65)" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#FF2D78")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.65)")}>
                                <ExternalLink size={14} />
                                {supportEmail}
                            </a>
                        )}
                    </div>

                    {/* Link columns */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-10">

                            {/* Solutions */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "#FF2D78" }}>Solutions</h3>
                                <ul className="space-y-4">
                                    {SOLUTIONS.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href}
                                                className="text-[15px] font-medium flex items-center gap-2 group transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D78] rounded px-1"
                                                style={{ color: "rgba(255,255,255,0.75)" }}
                                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}>
                                                <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300" style={{ color: "#FF2D78" }}>—</span>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Platform Links */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.65)" }}>Platform</h3>
                                <ul className="space-y-4">
                                    {PLATFORM_LINKS.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href}
                                                className="text-[15px] font-medium flex items-center gap-2 group transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D78] rounded px-1"
                                                style={{ color: "rgba(255,255,255,0.75)" }}
                                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}>
                                                <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300" style={{ color: "#FF2D78" }}>—</span>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.65)" }}>Legal</h3>
                                <ul className="space-y-4">
                                    {LEGAL_LINKS.map((link) => (
                                        <li key={link.label}>
                                            <Link href={link.href}
                                                className="text-[15px] font-medium flex items-center gap-2 group transition-all duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D78] rounded px-1"
                                                style={{ color: "rgba(255,255,255,0.75)" }}
                                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#fff")}
                                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)")}>
                                                <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300" style={{ color: "#FF2D78" }}>—</span>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <button
                                            type="button"
                                            onClick={() => window.dispatchEvent(new Event("openCookieConsent"))}
                                            className="text-[15px] font-medium flex items-center gap-2 group transition-all duration-300 cursor-pointer text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FF2D78] rounded px-1"
                                            style={{ color: "rgba(255,255,255,0.75)" }}
                                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#fff")}
                                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)")}
                                            aria-label="Open cookie preferences dialog"
                                        >
                                            <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300" style={{ color: "#FF2D78" }}>—</span>
                                            Cookie Settings
                                        </button>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── BOTTOM BAR ── */}
                <div className="pt-10 border-t flex flex-col gap-6"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col gap-1 text-center md:text-left">
                            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.70)" }}>
                                &copy; {currentYear} {platformName}. Operated by MEGASTACK AI LLP. All rights reserved.
                            </p>
                            <p className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>
                                MegaDM is a product operated by MEGASTACK AI LLP &bull; Bhopal, Madhya Pradesh, India
                            </p>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border cursor-default group transition-colors duration-300"
                            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.color = "#fff")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.color = "rgba(255,255,255,0.65)")}>
                            <ShieldCheck size={14} style={{ color: "#FF2D78" }} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Built on Meta&apos;s Official API</span>
                        </div>
                    </div>

                </div>

            </div>
        </footer>
    );
}
