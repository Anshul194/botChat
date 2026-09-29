"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Sparkles, Mail, MessageSquare, Phone, MapPin,
    Clock, Shield, ArrowRight, CheckCircle2, Send,
    HelpCircle, Layers, Users, Check
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

export default function ContactPage() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        handle: "",
        topic: "General Inquiry",
        message: "",
    });
    const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        setTimeout(() => {
            setStatus("success");
        }, 1000);
    };

    return (
        <>
            <PageMeta
                title="Contact Us — MegaDM | We're Here to Help"
                description="Get in touch with the MegaDM team for product questions, enterprise custom setups, and agency partnerships. Fast support within 2 hours."
            />
            <main className="min-h-screen" style={{ background: '#06000d', color: '#ffffff' }}>
                <Navbar />

                {/* HERO SECTION */}
                <section className="relative pt-44 sm:pt-52 pb-14 overflow-hidden">
                    {/* Background glows */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px]" style={{ background: 'rgba(255,45,120,0.18)' }} />
                        <div className="absolute top-[15%] right-[-5%] w-[550px] h-[550px] rounded-full blur-[130px]" style={{ background: 'rgba(124,58,237,0.14)' }} />
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.08 }} />
                    </div>

                    <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                        <motion.div initial={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: 'rgba(255,45,120,0.14)', border: '1px solid rgba(255,45,120,0.35)' }}>
                                <Mail className="w-3.5 h-3.5" style={{ color: '#FF2D78' }} />
                                <span className="text-xs font-black tracking-[0.25em] uppercase" style={{ color: '#FF80AB' }}>
                                    Get in Touch
                                </span>
                            </div>

                            <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 76px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '22px' }}>
                                Let&apos;s Talk About<br />
                                <span style={{ background: 'linear-gradient(to right, #FF2D78, #FF80AB, #E1306C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                    Your Growth.
                                </span>
                            </h1>

                            <p style={{ fontSize: '19px', color: 'rgba(255,255,255,0.92)', maxWidth: '640px', lineHeight: 1.65, fontWeight: 500, marginBottom: '32px' }}>
                                Have questions about our features, pricing, or enterprise custom setups? Send us a message and our team will get back to you promptly.
                            </p>

                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold mb-6" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', color: '#ffffff' }}>
                                <Shield className="w-4 h-4 shrink-0" style={{ color: '#10B981' }} />
                                <span>Built on Meta&apos;s Official API</span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CONTACT CHANNELS & FORM SECTION */}
                <section className="py-12 pb-24 relative z-10">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                            {/* Left Column: Direct Contact Info */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="p-8 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
                                        Direct Channels
                                    </h2>
                                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '24px', fontWeight: 500 }}>
                                        Reach out directly to the right department for the fastest response.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,45,120,0.15)' }}>
                                                <Mail className="w-5 h-5" style={{ color: '#FF2D78' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Customer Support</div>
                                                <a href="mailto:support@megadm.com" style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }} className="hover:underline">
                                                    support@megadm.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(124,58,237,0.15)' }}>
                                                <Users className="w-5 h-5" style={{ color: '#A78BFA' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>Sales & Enterprise</div>
                                                <a href="mailto:sales@megadm.com" style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }} className="hover:underline">
                                                    sales@megadm.com
                                                </a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.15)' }}>
                                                <Layers className="w-5 h-5" style={{ color: '#10B981' }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>White Label & Agencies</div>
                                                <a href="mailto:partners@megadm.com" style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }} className="hover:underline">
                                                    partners@megadm.com
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Response Time Card */}
                                <div className="p-6 rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(255,45,120,0.12), rgba(124,58,237,0.08))', border: '1.5px solid rgba(255,45,120,0.3)' }}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-5 h-5" style={{ color: '#FF2D78' }} />
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>Lightning Fast Response</div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.6, fontWeight: 500 }}>
                                        Our support engineers and account managers typically respond in under 2 hours during active business hours.
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Interactive Form */}
                            <div className="lg:col-span-7">
                                <div className="p-8 sm:p-10 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
                                    {status === "success" ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
                                            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(16,185,129,0.2)', border: '2px solid #10B981' }}>
                                                <Check className="w-8 h-8" style={{ color: '#10B981' }} />
                                            </div>
                                            <h3 style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', marginBottom: '12px' }}>
                                                Message Sent Successfully!
                                            </h3>
                                            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.88)', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 1.6, fontWeight: 500 }}>
                                                Thank you for reaching out. A MegaDM team member has received your message and will reply to your email shortly.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setStatus("idle");
                                                    setFormState({ name: "", email: "", handle: "", topic: "General Inquiry", message: "" });
                                                }}
                                                className="px-8 py-3.5 rounded-full font-bold text-sm text-white"
                                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                                            >
                                                Send Another Message
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                                                Send Us a Message
                                            </h2>
                                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.80)', marginBottom: '24px', fontWeight: 500 }}>
                                                Fill out the details below and we&apos;ll be in touch.
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                                        Your Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Sarah Jenkins"
                                                        value={formState.name}
                                                        onChange={e => setFormState({ ...formState, name: e.target.value })}
                                                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.06)',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            color: '#ffffff',
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                                        Work Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="sarah@company.com"
                                                        value={formState.email}
                                                        onChange={e => setFormState({ ...formState, email: e.target.value })}
                                                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.06)',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            color: '#ffffff',
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                                        Instagram Handle / Brand
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="@yourbrand"
                                                        value={formState.handle}
                                                        onChange={e => setFormState({ ...formState, handle: e.target.value })}
                                                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                                        style={{
                                                            background: 'rgba(255,255,255,0.06)',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            color: '#ffffff',
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                                        Inquiry Topic *
                                                    </label>
                                                    <select
                                                        value={formState.topic}
                                                        onChange={e => setFormState({ ...formState, topic: e.target.value })}
                                                        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
                                                        style={{
                                                            background: '#120520',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            color: '#ffffff',
                                                        }}
                                                    >
                                                        <option value="General Inquiry">General Inquiry</option>
                                                        <option value="Sales & Enterprise Plan">Sales & Enterprise Plan</option>
                                                        <option value="Technical Support">Technical Support</option>
                                                        <option value="White Label & Agency Partnership">White Label & Agency Partnership</option>
                                                        <option value="Billing & Account">Billing & Account</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                                    Message *
                                                </label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    placeholder="How can we help your Instagram or Facebook growth?"
                                                    value={formState.message}
                                                    onChange={e => setFormState({ ...formState, message: e.target.value })}
                                                    className="w-full px-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none resize-none"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.15)',
                                                        color: '#ffffff',
                                                    }}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={status === "sending"}
                                                className="w-full inline-flex items-center justify-center gap-2.5 px-8 rounded-full font-bold text-base text-white transition-all hover:scale-[1.02] cursor-pointer"
                                                style={{
                                                    background: 'linear-gradient(135deg, #FF2D78, #E1306C)',
                                                    boxShadow: '0 12px 35px rgba(255,45,120,0.4)',
                                                    height: '52px',
                                                }}
                                            >
                                                {status === "sending" ? (
                                                    <span>Sending Message...</span>
                                                ) : (
                                                    <>
                                                        <span>Send Message</span>
                                                        <Send className="w-4 h-4" />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* QUICK ASSISTANCE CARDS */}
                <section className="py-16 relative" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <HelpCircle className="w-8 h-8 mb-4" style={{ color: '#FF2D78' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>Looking for Pricing?</h3>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>
                                    Review our transparent Starter, Pro, and Enterprise tiers with zero hidden charges.
                                </p>
                                <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#FF80AB' }}>
                                    View Pricing Plans <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Sparkles className="w-8 h-8 mb-4" style={{ color: '#7C3AED' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>Explore All Features</h3>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>
                                    See all 12 core automation modules from the visual flow builder to AI agents.
                                </p>
                                <Link href="/features" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#A78BFA' }}>
                                    Browse Features <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <Layers className="w-8 h-8 mb-4" style={{ color: '#10B981' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>White Label For Agencies</h3>
                                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '16px', fontWeight: 500 }}>
                                    Launch your own branded social automation platform under your domain and logo.
                                </p>
                                <Link href="/white-label" className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: '#34D399' }}>
                                    White Label Program <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
