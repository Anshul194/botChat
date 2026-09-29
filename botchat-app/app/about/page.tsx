"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    Sparkles, Shield, Zap, Heart, Users,
    Target, ArrowRight, CheckCircle2, MessageSquare,
    Cpu, Layers, Award, Globe, Rocket, Play
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

const VALUES = [
    {
        icon: Shield,
        title: "100% Meta API Safety",
        color: "#10B981",
        description: "We believe growth should never risk your account. MegaDM is engineered strictly on Meta's Official Messenger & Instagram Graph APIs — zero browser scraping, zero shadowbans.",
    },
    {
        icon: Cpu,
        title: "AI with Human Touch",
        color: "#0EA5E9",
        description: "Our AI agents are built to sound like you, not a robotic script. We help you create authentic, contextual interactions that build lasting customer loyalty.",
    },
    {
        icon: Target,
        title: "Conversion-Focused",
        color: "#FF2D78",
        description: "Every feature we build has one metric in mind: your growth. From comment-to-DM triggers to instant product links, we turn social engagement into measurable revenue.",
    },
    {
        icon: Layers,
        title: "Creator Simplicity",
        color: "#7C3AED",
        description: "Enterprise power shouldn't require enterprise complexity. Our drag-and-drop flow builder and ready-made templates let anyone launch funnels in under three minutes.",
    },
];

const MILESTONES = [
    {
        year: "2024",
        title: "The Problem We Saw",
        desc: "Creators were losing 80% of potential sales simply because they couldn't reply to thousands of Instagram DMs and comments in time. Existing tools were clunky or violated Meta terms.",
    },
    {
        year: "2025",
        title: "Official Meta Integration",
        desc: "We built MegaDM from the ground up using Meta's official APIs, launching the Smart Unified Inbox, Visual Flow Builder, and automated Comment-to-DM engine.",
    },
    {
        year: "2026",
        title: "The All-in-One Engine",
        desc: "Today, MegaDM powers thousands of creators, e-commerce stores, and marketing agencies worldwide with 24/7 AI agents, bio links, and multi-page management.",
    },
];

export default function AboutPage() {
    return (
        <>
            <PageMeta
                title="About Us — MegaDM | The Story Behind Social Automation"
                description="Learn about MegaDM's mission to empower creators and businesses with safe, official Instagram and Facebook automation tools that drive real revenue."
            />
            <main className="min-h-screen" style={{ background: '#06000d', color: '#ffffff' }}>
                <Navbar />

                {/* HERO SECTION */}
                <section className="relative pt-44 sm:pt-52 pb-20 overflow-hidden">
                    {/* Ambient Glows */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[650px] h-[650px] rounded-full blur-[140px]" style={{ background: 'rgba(255,45,120,0.18)' }} />
                        <div className="absolute top-[20%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[130px]" style={{ background: 'rgba(124,58,237,0.14)' }} />
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.08 }} />
                    </div>

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                        <motion.div initial={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,45,120,0.14)', border: '1px solid rgba(255,45,120,0.35)' }}>
                                <Sparkles className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>
                                    About MegaDM
                                </span>
                            </div>

                            <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 76px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '24px' }}>
                                Empowering the Next<br />
                                <span style={{ background: 'linear-gradient(to right, #FF2D78, #FF80AB, #E1306C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Generation of Creators.
                                </span>
                            </h1>

                            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.92)', maxWidth: '720px', lineHeight: 1.7, fontWeight: 500, marginBottom: '36px' }}>
                                We are on a mission to transform social interactions into automated, high-converting relationships. Built exclusively on Meta&apos;s Official APIs for total account safety.
                            </p>

                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-12" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', color: '#ffffff' }}>
                                <Shield className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                                <span>Built on Meta&apos;s Official API</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* MISSION & STORY SECTION */}
                <section className="py-20 relative z-10" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.25)' }}>
                                    <Rocket className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                    <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>Our Mission</span>
                                </div>
                                <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: '20px' }}>
                                    Stop Losing Revenue<br />
                                    To Unanswered DMs.
                                </h2>
                                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.90)', lineHeight: 1.7, marginBottom: '20px', fontWeight: 500 }}>
                                    In today&apos;s social commerce landscape, speed is everything. When a follower asks &ldquo;How much?&rdquo; or &ldquo;Where can I buy this?&rdquo;, waiting even 15 minutes causes them to scroll away to a competitor.
                                </p>
                                <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: '28px', fontWeight: 500 }}>
                                    MegaDM was born to bridge that gap. We equip creators, coaches, brands, and agencies with an enterprise-grade automation engine that responds in under 3 seconds, captures contact details, and closes sales 24 hours a day, 7 days a week.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#FF2D78', marginBottom: '4px' }}>&lt; 3 sec</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Average Response Time</div>
                                    </div>
                                    <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '28px', fontWeight: 900, color: '#10B981', marginBottom: '4px' }}>0 Risk</div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>Official Meta API Policy</div>
                                    </div>
                                </div>
                            </div>

                            {/* Clean visual graphic */}
                            <div className="relative">
                                <div className="absolute inset-0 blur-[60px] rounded-3xl pointer-events-none" style={{ background: 'rgba(255,45,120,0.15)' }} />
                                <div className="relative rounded-3xl overflow-hidden" style={{ border: '1.5px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 70px rgba(0,0,0,0.7)', background: '#0e0319' }}>
                                    <Image
                                        src="/y.webp"
                                        alt="MegaDM Platform Overview"
                                        width={900}
                                        height={600}
                                        className="w-full h-auto block"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* OUR VALUES */}
                <section className="py-24">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)' }}>
                                <Heart className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>Core Principles</span>
                            </div>
                            <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '14px' }}>
                                What Sets MegaDM Apart
                            </h2>
                            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.90)', maxWidth: '580px', margin: '0 auto', fontWeight: 500 }}>
                                We are committed to building software that puts security, honesty, and tangible business results first.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {VALUES.map((val, i) => {
                                const Icon = val.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-8 rounded-3xl transition-all duration-300"
                                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                                    >
                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: `${val.color}25` }}>
                                            <Icon className="w-7 h-7" style={{ color: val.color }} />
                                        </div>
                                        <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#ffffff', marginBottom: '10px' }}>
                                            {val.title}
                                        </h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontWeight: 500 }}>
                                            {val.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* JOURNEY & TIMELINE */}
                <section className="py-20 relative" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-16">
                            <h2 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '12px' }}>
                                The Road We&apos;ve Traveled
                            </h2>
                            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
                                From a simple comment auto-responder to an all-in-one growth ecosystem.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {MILESTONES.map((m, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 rounded-3xl"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <div
                                        className="px-5 py-2.5 rounded-2xl font-black text-lg shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #FF2D78, #E1306C)', color: '#ffffff' }}
                                    >
                                        {m.year}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>{m.title}</h3>
                                        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontWeight: 500 }}>{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BOTTOM CTA */}
                <section className="py-28 relative overflow-hidden" style={{ background: '#03000a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-[140px]" style={{ background: 'rgba(255,45,120,0.2)' }} />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
                        <h2 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px' }}>
                            Join the Future of<br />Social Commerce
                        </h2>
                        <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.90)', fontWeight: 500, marginBottom: '38px' }}>
                            Start converting your Instagram and Facebook followers into automated sales today.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/auth/sign-up"
                                className="group inline-flex items-center justify-center gap-2.5 px-9 rounded-full font-bold text-base text-white transition-all hover:scale-105 whitespace-nowrap"
                                style={{
                                    background: 'linear-gradient(135deg, #FF2D78, #E1306C)',
                                    boxShadow: '0 20px 50px rgba(255,45,120,0.45)',
                                    height: '54px',
                                    lineHeight: 1,
                                }}
                            >
                                <span>Start Free Trial</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2.5 px-9 rounded-full font-bold text-base transition-all hover:scale-105 whitespace-nowrap"
                                style={{
                                    background: 'rgba(255,255,255,0.10)',
                                    border: '1.5px solid rgba(255,255,255,0.25)',
                                    color: '#ffffff',
                                    height: '54px',
                                    lineHeight: 1,
                                }}
                            >
                                Contact Sales
                            </Link>
                        </div>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginTop: '28px', fontWeight: 600 }}>
                            Built on Meta&apos;s Official API
                        </p>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
