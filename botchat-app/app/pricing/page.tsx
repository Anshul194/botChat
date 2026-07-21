"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Check, Sparkles, Crown, ArrowRight, HelpCircle, Smartphone,
    MessageSquare, Users, Bot, Send, Globe, Wifi, Activity, Zap
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";
import type { Plan } from "@/store/slices/plansSlice";

const iconMap: Record<string, any> = {
    zap: Zap, crown: Crown, sparkles: Sparkles, smart_inbox: Activity,
    whatsapp: Smartphone, telegram: Send, facebook: Globe, instagram: Globe,
    connect_account: Users, message_credit: MessageSquare, subscribers: Users,
    bot_ai_token: Bot, broadcast: Wifi,
};

const fallbackIcons = [Zap, Crown, Sparkles, MessageSquare];

const faqs = [
    {
        q: "Is botChat compliant with Meta's terms?",
        a: "Yes. We exclusively use the official Meta Messenger API. Unlike 'unofficial' bots that scrape web data, our platform is fully recognized and approved by Meta, ensuring your account stays safe."
    },
    {
        q: "How does the annual billing work?",
        a: "Our annual plans are billed upfront for 12 months. This allows us to provide a significant 30% discount compared to the monthly subscription rate."
    },
    {
        q: "Can I upgrade or downgrade my plan later?",
        a: "Absolutely. You can switch between plans at any time from your billing dashboard. Pro-rated adjustments will be automatically applied to your account."
    },
    {
        q: "What counts as an 'Automated DM'?",
        a: "Any private message sent by the bot to a user in response to a comment, story mention, or direct message. Post comment replies themselves are completely unlimited on all plans."
    },
    {
        q: "Do you offer custom enterprise solutions?",
        a: "Yes. If you manage an agency with 10+ accounts or need more than 100k DMs per month, our solutions team can build a custom package for you."
    },
    {
        q: "What is 'AI Intent Logic'?",
        a: "Instead of simple keyword matching, our AI understands the context of a user's message. It can distinguish between a compliment, a complaint, or a genuine sales inquiry."
    }
];

const featureLabels: Record<string, string> = {
    connect_account: "Connected Accounts",
    message_credit: "Automated DMs / mo",
    subscribers: "Subscribers",
    bot_ai_token: "AI Tokens",
    broadcast: "Broadcast Campaigns",
    smart_inbox: "Smart Inbox",
    live_chat: "Live Chat",
    drip_campaign: "Drip Campaigns",
    ecommerce: "E-Commerce",
};

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnnual, setIsAnnual] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // TODO: Replace hardcoded URL with dynamic API base from config (resolveApiBaseUrl)
        fetch('https://api.megadm.chat/api/v1/public/plans', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer 2|SEjhqz8RiNIReWskv4No2rERcQncuVIEizJ1ShBI66ea70b9',
            },
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setPlans(d.data);
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const visiblePlans = plans.filter((p) => p.status);

    return (
        <>
            <PageMeta
                title="Pricing — BotChat | Plans for Creators & Agencies"
                description="Choose the right BotChat plan for your needs."
            />
            <main className="min-h-screen bg-white">
                <Navbar forceLight={true} />

                {/* Hero */}
                <section className="relative pt-44 pb-24 overflow-hidden bg-[#06000d]">
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#FF2D78]/20 blur-[150px] animate-pulse" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px]" />
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                <Sparkles className="w-4 h-4 text-[#FF2D78]" />
                                <span className="text-xs font-black tracking-[0.2em] uppercase text-pink-200/80">Investment in your growth</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-8xl font-[1000] text-white mb-6 md:mb-8 tracking-tighter leading-[1.1] md:leading-none">
                                Simple Plans. <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C] animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                                    Infinite Scale.
                                </span>
                            </h1>
                            <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed px-2">
                                Stop paying for what you don't use. Choose a plan that grows as fast as your content does.
                            </p>
                            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 mb-12 md:mb-20">
                                {['INSTAGRAM', 'FACEBOOK', 'THREADS', 'WHATSAPP'].map(name => (
                                    <span key={name} className="text-white font-black tracking-[0.4em] text-sm">{name}</span>
                                ))}
                            </div>

                            {/* Billing toggle */}
                            <div className="flex items-center justify-center gap-3 md:gap-6 mb-12">
                                <span className={`text-xs font-black uppercase tracking-widest ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Billed Monthly</span>
                                <button onClick={() => setIsAnnual(!isAnnual)} className="w-16 h-8 rounded-full bg-white/10 p-1 flex items-center transition-all relative border border-white/10">
                                    <motion.div className="w-6 h-6 rounded-full bg-[#FF2D78] shadow-[0_0_15px_rgba(255,45,120,0.5)]" animate={{ x: isAnnual ? 32 : 0 }} />
                                </button>
                                <span className={`text-xs font-black uppercase tracking-widest ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                                    Billed Annually <span className="ml-2 text-[10px] text-green-400 font-black">Save 30%</span>
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Grid */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-32">
                                <div className="w-8 h-8 border-4 border-[#FF2D78] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : visiblePlans.length === 0 ? (
                            <div className="text-center py-32">
                                <p className="text-gray-400 font-semibold text-lg">No plans available yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {visiblePlans.map((plan: Plan, i: number) => {
                                    const isPopular = plan.is_highlighted;
                                    const price = isAnnual ? Math.round(Number(plan.price) * 0.7) : Number(plan.price);
                                    const IconEl = fallbackIcons[i % fallbackIcons.length];
                                    const colors = ["#6366f1", "#FF2D78", "#f59e0b", "#0ea5e9"];

                                    return (
                                        <motion.div
                                            key={plan.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            viewport={{ once: true }}
                                            className={`relative flex flex-col p-8 rounded-[36px] transition-all duration-300 ${isPopular
                                                ? 'bg-gray-950 text-white shadow-2xl ring-4 ring-[#FF2D78]/20'
                                                : 'bg-white border border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            {isPopular && (
                                                <div className="absolute top-6 right-8 px-3 py-1 rounded-full bg-[#FF2D78] text-white text-[10px] font-black uppercase tracking-widest">
                                                    Popular
                                                </div>
                                            )}

                                            <div className="mb-8">
                                                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${isPopular ? 'bg-white/10' : 'bg-gray-50'}`}>
                                                    <IconEl className="w-7 h-7" style={{ color: isPopular ? 'white' : colors[i % colors.length] }} strokeWidth={2.5} />
                                                </div>
                                                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                                {plan.description && (
                                                    <p className={`text-sm mb-8 font-medium ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-5xl font-black tracking-tight">₹{price}</span>
                                                    <span className={`text-sm font-bold ${isPopular ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        / {plan.duration} {plan.duration_type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4 mb-10 flex-1">
                                                {plan.features && Object.entries(plan.features).filter(([, v]) => {
                                                    const val = typeof v === 'object' && v !== null ? (v as any).value : v;
                                                    return val !== "0";
                                                }).slice(0, 8).map(([key, val]) => {
                                                    const label = featureLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                                                    const raw = typeof val === 'object' && val !== null ? (val as any).value : val;
                                                    const display = raw === "1" ? "Unlimited" : raw;
                                                    return (
                                                        <div key={key} className="flex items-center gap-3">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-white/10 text-[#FF2D78]' : 'bg-green-50 text-green-500'}`}>
                                                                <Check className="w-3 h-3" strokeWidth={4} />
                                                            </div>
                                                            <span className={`text-sm font-semibold ${isPopular ? 'text-gray-300' : 'text-gray-700'}`}>
                                                                {display} {label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <Link
                                                href="/auth/sign-up"
                                                className={`block w-full py-5 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${isPopular
                                                    ? 'bg-white text-black hover:bg-gray-100'
                                                    : 'bg-black text-white hover:bg-gray-800 shadow-xl'
                                                    }`}
                                            >
                                                Get Started
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-24 bg-gray-50/50 border-y border-gray-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-16">
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF2D78] mb-4">Support Hub</h2>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tight">Everything you need to know.</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                            {faqs.map((faq, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }} className="group">
                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100">
                                            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-[#FF2D78] transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-gray-900 mb-3">{faq.q}</h4>
                                            <p className="text-gray-500 text-[15px] font-medium leading-relaxed">{faq.a}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-12 md:mt-20 p-6 md:p-10 rounded-[40px] bg-white border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h4 className="text-2xl font-black text-gray-900 mb-2">Still have questions?</h4>
                                <p className="text-gray-500 font-medium">Join our Discord community or talk to a real human.</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-8 py-4 rounded-full bg-gray-100 text-black font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all">Support Center</button>
                                <button className="px-8 py-4 rounded-full bg-black text-white font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition-all">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 bg-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <div className="flex items-center justify-center -space-x-4 mb-10">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 shadow-sm" />)}
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 mb-8">Join the 11,000+ creators scaling with botChat.</h2>
                        <div className="inline-flex items-center gap-8 p-1.5 rounded-full bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-2 pl-6">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black uppercase text-gray-400">Live & Operating</span>
                            </div>
                            <Link href="/auth/sign-up" className="px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest rounded-full hover:bg-gray-800 transition-all">
                                Claim Your Access
                            </Link>
                        </div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
}
