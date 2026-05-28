"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Check, Sparkles, Zap, Shield, Crown,
    ArrowRight, MessageSquare, Workflow, BarChart3,
    HelpCircle, ChevronDown
} from "lucide-react";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

const plans = [
    {
        name: "Starter",
        price: { monthly: "$29", annual: "$19" },
        description: "Essential automation for emerging creators.",
        icon: Zap,
        color: "#6366f1",
        features: [
            "1,000 Automated DMs / mo",
            "Unlimited Post Auto-Replies",
            "Basic Flow Builder",
            "1 Instagram Account",
            "Standard Analytics"
        ]
    },
    {
        name: "Growth",
        price: { monthly: "$79", annual: "$59" },
        description: "Advanced tools for scaling influencers & brands.",
        icon: Sparkles,
        color: "#FF2D78",
        popular: true,
        features: [
            "10,000 Automated DMs / mo",
            "Advanced AI Intent Logic",
            "Unlimited Bio-Link Pages",
            "3 Meta Accounts (IG/FB)",
            "Deep Conversion Tracking",
            "Priority Support"
        ]
    },
    {
        name: "Elite",
        price: { monthly: "$199", annual: "$149" },
        description: "Full power for agencies and large-scale brands.",
        icon: Crown,
        color: "#f59e0b",
        features: [
            "100,000 Automated DMs / mo",
            "Custom AI Voice Training",
            "White-label Bio Links",
            "Unlimited Meta Accounts",
            "Advanced CRM Integration",
            "Dedicated Account Manager"
        ]
    }
];

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

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <main className="min-h-screen bg-white">
            <Navbar forceLight={true} />

            {/* High-Impact Hero Banner */}
            <section className="relative pt-44 pb-24 overflow-hidden bg-[#06000d]">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] rounded-full bg-[#FF2D78]/20 blur-[150px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[150px]" />
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-[#FF2D78]" />
                            <span className="text-xs font-black tracking-[0.2em] uppercase text-pink-200/80">
                                Investment in your growth
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-[1000] text-white mb-8 tracking-tighter leading-none">
                            Simple Plans. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C] animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                                Infinite Scale.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
                            Stop paying for what you don't use. Choose a plan that grows as fast as your content does.
                        </p>

                        {/* Social Proof Trust Bar */}
                        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-500 mb-20">
                            {['INSTAGRAM', 'FACEBOOK', 'THREADS', 'WHATSAPP'].map(name => (
                                <span key={name} className="text-white font-black tracking-[0.4em] text-sm">{name}</span>
                            ))}
                        </div>

                        {/* Professional Toggle */}
                        <div className="flex items-center justify-center gap-6 mb-12">
                            <span className={`text-xs font-black uppercase tracking-widest ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Billed Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="w-16 h-8 rounded-full bg-white/10 p-1 flex items-center transition-all relative border border-white/10"
                            >
                                <motion.div
                                    className="w-6 h-6 rounded-full bg-[#FF2D78] shadow-[0_0_15px_rgba(255,45,120,0.5)]"
                                    animate={{ x: isAnnual ? 32 : 0 }}
                                />
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`relative flex flex-col p-8 rounded-[36px] transition-all duration-300 ${plan.popular
                                    ? 'bg-gray-950 text-white shadow-2xl ring-4 ring-[#FF2D78]/20'
                                    : 'bg-white border border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-6 right-8 px-3 py-1 rounded-full bg-[#FF2D78] text-white text-[10px] font-black uppercase tracking-widest">
                                        Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${plan.popular ? 'bg-white/10' : 'bg-gray-50'}`}>
                                        <plan.icon className="w-7 h-7" style={{ color: plan.popular ? 'white' : plan.color }} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                                    <p className={`text-sm mb-8 font-medium ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-5xl font-black tracking-tight">{isAnnual ? plan.price.annual : plan.price.monthly}</span>
                                        <span className={`text-sm font-bold ${plan.popular ? 'text-gray-500' : 'text-gray-400'}`}>/mo</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feature, j) => (
                                        <div key={j} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-white/10 text-[#FF2D78]' : 'bg-green-50 text-green-500'}`}>
                                                <Check className="w-3 h-3" strokeWidth={4} />
                                            </div>
                                            <span className={`text-sm font-semibold ${plan.popular ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/auth/sign-up"
                                    className={`block w-full py-5 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${plan.popular
                                        ? 'bg-white text-black hover:bg-gray-100'
                                        : 'bg-black text-white hover:bg-gray-800 shadow-xl'
                                        }`}
                                >
                                    Get Started
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Professional Full-Width FAQ Section */}
            <section className="py-24 bg-gray-50/50 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#FF2D78] mb-4">Support Hub</h2>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight">Everything you need to know.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                        {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100">
                                        <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-[#FF2D78] transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 mb-3">{faq.q}</h4>
                                        <p className="text-gray-500 text-[15px] font-medium leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 p-10 rounded-[40px] bg-white border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
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

            {/* Final Trust CTA */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="flex items-center justify-center -space-x-4 mb-10">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 shadow-sm" />
                        ))}
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
    );
}
