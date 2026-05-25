"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Zap, Sparkles, MessageSquare, Radio, Shield,
    BarChart3, Workflow, Mail, Users, MessageCircle,
    Layers, Cpu, MousePointer2, ExternalLink, ArrowRight,
    Monitor, Smartphone, Globe, Cloud, Lock, Heart
} from "lucide-react";
import Navbar from "../landing/components/Navbar";
import Footer from "../landing/components/Footer";

const featureCategories = [
    {
        title: "Meta Automation",
        description: "Scale your presence across Instagram and Facebook with the world's most advanced AI-driven automation ecosystem.",
        features: [
            {
                icon: MessageSquare,
                name: "Post & Reel Auto Reply",
                desc: "Universal automation for Instagram and Facebook posts.",
                longDesc: "Never miss a comment. Whether it's an Instagram Reel or a Facebook Post, our bot replies to every comment and sends an instant DM to nurture the lead.",
                points: ["Cross-platform sync", "Keyword-triggered DMs", "Comment sentiment analysis", "Automatic lead capture"],
                color: "#FF2060"
            },
            {
                icon: Radio,
                name: "Messenger & DM Bots",
                desc: "Powerful 24/7 chat bots for your private messages.",
                longDesc: "Deploy intelligent bots that handle everything from basic FAQs to complex sales funnels inside Instagram DMs and Facebook Messenger.",
                points: ["Rich media support", "Multi-step flow support", "Human handoff system", "Messenger API compliant"],
                color: "#E1306C"
            },
            {
                icon: Shield,
                name: "Follow-Gated Exclusive",
                desc: "Reward fans who follow your Meta profiles.",
                longDesc: "Lock your best deals behind a 'Follow' check. The bot automatically verifies if the user follows you on IG or FB before granting access.",
                points: ["Instant follow verification", "Story mention triggers", "Group invite automation", "Loyalty badge system"],
                color: "#C13584"
            },
            {
                icon: MessageCircle,
                name: "AI Comment Filtering",
                desc: "Keep your community safe with intelligent moderation.",
                longDesc: "Automatically hide or delete spam, negative vibes, or competitor links. Use AI to keep your comment section clean and professional.",
                points: ["Profanity filtering", "competitor link blocking", "Spam account detection", "Manual review queue"],
                color: "#833AB4"
            }
        ]
    },
    {
        title: "AI & Workflows",
        description: "Intelligent systems that handle the heavy lifting, learned from your unique brand voice.",
        features: [
            {
                icon: Cpu,
                name: "AI Training",
                desc: "Train your own AI model to handle customer queries with your voice.",
                longDesc: "Upload your brand documents, FAQs, and past conversations to train a custom AI that speaks exactly like you while handling 90% of support.",
                points: ["Custom knowledge base", "Brand voice alignment", "Multi-language support", "Human handoff logic"],
                color: "#FF2D78"
            },
            {
                icon: Workflow,
                name: "Flow Builder",
                desc: "Build complex chat flows with our drag-and-drop editor.",
                longDesc: "Create sophisticated multi-step automation funnel. Guide users from the first comment to the final checkout using logical branching and delays.",
                points: ["Visual drag-and-drop interface", "Logical branching (If/Else)", "API & CRM integrations", "Wait & Delay nodes"],
                color: "#5851DB"
            },
            {
                icon: Zap,
                name: "Instant Responses",
                desc: "Zero-latency replies ensuring your audience never has to wait.",
                longDesc: "Response time is the #1 factor in conversion. Our edge-cloud infrastructure ensures that your replies are delivered in milliseconds.",
                points: ["Global edge infrastructure", "24/7 autonomous operation", "Zero-delay processing", "High-concurrency support"],
                color: "#405DE6"
            },
            {
                icon: Mail,
                name: "Email Collector",
                desc: "Capture emails directly within the chat and sync to your CRM.",
                longDesc: "DMs are the best place to collect leads. Our system seamlessly captures and verifies email addresses inside the chat window for your list.",
                points: ["In-chat lead forms", "Real-time email verification", "Automatic export to Mailchimp/Klaviyo", "GDPR & CCPA compliant"],
                color: "#285AEB"
            }
        ]
    },
    {
        title: "Bio Links & Utilities",
        description: "Everything you need to turn your profile traffic into measurable revenue.",
        features: [
            {
                icon: Layers,
                name: "Premium Bio Links",
                desc: "Beautiful, high-converting landing pages for your bio.",
                longDesc: "Create stunning, customizable link-in-bio pages that load instantly and drive users to your most important products and content.",
                points: ["Custom domain support", "Premium layout templates", "Embedded video & media", "Pixel & tracking support"],
                color: "#FF2D78"
            },
            {
                icon: MousePointer2,
                name: "Shortened Links",
                desc: "Track every click with professional link shortening.",
                longDesc: "Replace long, ugly URLs with branded short links. Track every click, geographic origin, and device type for complete campaign visibility.",
                points: ["Branded domains", "Geographic tracking", "Device & browser analytics", "Dynamic redirection"],
                color: "#E1306C"
            },
            {
                icon: Smartphone,
                name: "VCard Links",
                desc: "Digital business cards that save directly to contacts.",
                longDesc: "Modern networking. Share a link that allows users to save your contact information, photo, and social links directly to their phone's contact list.",
                points: ["Instant 'Add to Contacts'", "Custom profile photos", "Social profile linking", "Contact download tracking"],
                color: "#C13584"
            },
            {
                icon: Users,
                name: "Smart CRM",
                desc: "Manage and segment your leads directly within the platform.",
                longDesc: "Don't just collect leads—manage them. Our built-in CRM allows you to tag, segment, and track the journey of every user who interacts with your automation.",
                points: ["Lead segmentation", "Interaction history", "Custom lead tagging", "Exportable CRM data"],
                color: "#405DE6"
            },
            {
                icon: BarChart3,
                name: "Deep Analytics",
                desc: "Granular data on every interaction, click, and conversion.",
                longDesc: "Stop guessing what works. Get a bird's-eye view of your entire automation ecosystem with real-time ROI tracking and engagement metrics.",
                points: ["Conversion funnel tracking", "Automated ROI calculation", "Periodic performance reports", "Exportable data sheets"],
                color: "#833AB4"
            }
        ]
    }
];

const highlights = [
    {
        title: "Global Reach",
        subtitle: "Scale without limits",
        desc: "Our platform handles millions of interactions daily across the globe.",
        icon: Globe
    },
    {
        title: "Cloud Powered",
        subtitle: "Reliable & Fast",
        desc: "Infrastructure built on world-class cloud providers for 99.9% uptime.",
        icon: Cloud
    },
    {
        title: "Secure & Private",
        subtitle: "Your data is safe",
        desc: "Enterprise-grade encryption and privacy controls for your peace of mind.",
        icon: Lock
    }
];

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar forceLight={true} />

            {/* Hero Section */}
            <section className="relative pt-44 pb-24 overflow-hidden bg-[#06000d]">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#FF2D78]/20 blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[900px] h-[900px] rounded-full bg-[#E1306C]/10 blur-[140px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[100px]" />
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(255,45,120,.3) 1px, transparent 1px)",
                            backgroundSize: "40px 40px"
                        }}
                    />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-[#FF2D78]" />
                            <span className="text-xs font-bold tracking-[0.2em] uppercase text-pink-200/80">
                                The Future of Social Growth
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black text-white mb-10 tracking-tight leading-[0.95]">
                            Meta <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] via-[#FF80AB] to-[#E1306C] animate-shimmer" style={{ backgroundSize: '200% auto' }}>
                                Mastered
                            </span>
                        </h1>

                        <p className="text-xl text-pink-100/60 max-w-2xl mx-auto leading-relaxed font-medium">
                            Automate Instagram & Facebook like a pro. Engagement, sales, and bio-links all in one high-performance platform.
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/auth/sign-up" className="group relative px-10 py-5 rounded-2xl bg-[#FF2D78] text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,45,120,0.3)]">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <Link href="/pricing" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg backdrop-blur-md hover:bg-white/10 transition-all">
                                View Plans
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Interactive Bot Mockup Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 space-y-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-[#FF2D78] font-black tracking-widest uppercase mb-4 block">Interactive Live Demo</span>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                                    Facebook & Instagram <br />
                                    <span className="text-[#FF2D78]">Replied in Seconds.</span>
                                </h2>
                                <p className="text-xl text-gray-500 leading-relaxed font-medium">
                                    Our intelligent Meta-Bot handles complex inquiries on both Instagram and Facebook Messenger simultaneously.
                                </p>
                            </motion.div>

                            <div className="space-y-6">
                                {[
                                    { t: "AI Intent Recognition", d: "Doesn't just matching keywords. It understands context, tone, and intent." },
                                    { t: "Visual Flow Designer", d: "Build your dream automation funnel with our drag-and-drop canvas." },
                                    { t: "Cross-Platform Unified Inbox", d: "Manage all your Meta messages in one blazing fast dashboard." }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-5 p-6 rounded-[32px] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-md text-[#FF2D78] flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{item.t}</h4>
                                            <p className="text-gray-500 font-medium text-sm leading-relaxed">{item.d}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative flex justify-center">
                            <div className="w-full max-w-[380px] aspect-[9/19] rounded-[60px] border-[12px] border-gray-950 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative overflow-hidden">
                                {/* iPhone Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-950 rounded-b-3xl z-30" />

                                {/* App UI */}
                                <div className="pt-12 px-6 pb-4 border-b border-gray-50 flex items-center gap-3 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF2D78] to-[#E1306C]" />
                                    <div>
                                        <div className="text-xs font-black">Meta Master Bot</div>
                                        <div className="text-[10px] text-green-500 font-bold">Online & Active</div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 h-[440px] overflow-hidden flex flex-col justify-end bg-gray-50/30">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1 }}
                                        className="self-start bg-white shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-xs font-bold max-w-[85%] text-gray-800"
                                    >
                                        Hello! I noticed you commented on our latest post about Bio-Links. 🔗
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 2 }}
                                        className="self-start bg-white shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-xs font-bold max-w-[85%] text-gray-800"
                                    >
                                        Would you like me to send you the early-access setup guide?
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 3 }}
                                        className="self-end bg-[#FF2D78] text-white p-4 rounded-2xl rounded-tr-sm text-xs font-black shadow-lg shadow-[#FF2D78]/20"
                                    >
                                        Yes, absolutely! 🚀
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 4 }}
                                        className="self-start bg-white shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-sm text-xs font-bold max-w-[85%] text-gray-800"
                                    >
                                        Great! Here is your personal link:
                                        <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-dashed border-[#FF2D78]/30">
                                            <div className="text-[10px] font-black text-[#FF2D78] uppercase mb-1">Your Bio-Link</div>
                                            <div className="text-[10px] text-gray-400 truncate font-mono">botchat.ai/u/yourname</div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="absolute bottom-0 inset-x-0 h-20 bg-white border-t border-gray-50 px-6 flex items-center gap-3">
                                    <div className="flex-1 h-10 rounded-full bg-gray-100 px-4 flex items-center text-[10px] text-gray-400 font-bold">Write a message...</div>
                                    <div className="w-10 h-10 rounded-full bg-[#FF2D78]/10 flex items-center justify-center text-[#FF2D78]">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -left-12 bottom-20 p-5 rounded-3xl bg-white shadow-2xl border border-gray-100 z-30 hidden md:block"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase text-gray-400">Live Metric</span>
                                </div>
                                <div className="text-xl font-black text-gray-900">+42% CR</div>
                                <div className="text-[10px] font-bold text-gray-500">Auto-Reply Lift</div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Secondary mockup area for Bio-Links */}
                <div className="mt-32 max-w-7xl mx-auto px-6">
                    <div className="bg-gray-50 rounded-[64px] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 border border-gray-100">
                        <div className="md:w-1/2 order-2 md:order-1">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D78] to-[#E1306C] rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-white p-4 rounded-3xl border border-gray-100 shadow-xl">
                                    <div className="w-full aspect-video bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 overflow-hidden font-black text-[#FF2D78]">
                                        <MessageSquare className="w-12 h-12 mb-2 animate-bounce" />
                                        <span className="text-xs ml-2">PREMIUM TEMPLATES</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2 order-1 md:order-2">
                            <span className="text-pink-500 font-black tracking-widest uppercase mb-4 block">Visual Bio-Links</span>
                            <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">One Link. <br />Infinite Possibilities.</h3>
                            <p className="text-lg text-gray-600 font-medium leading-relaxed">
                                Our bio-link system isn't just a list of buttons. It's a high-performance landing page builder that integrates directly with your bot's lead capture data.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Categories */}
            {featureCategories.map((category, catIdx) => (
                <section key={catIdx} id={category.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')} className={`py-24 ${catIdx % 2 === 1 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">{category.title}</h2>
                            <p className="text-xl text-gray-500 max-w-3xl leading-relaxed font-medium">{category.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {category.features.map((feature, fIdx) => (
                                <motion.div
                                    key={fIdx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: fIdx * 0.1 }}
                                    className="group relative p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                                >
                                    <div
                                        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none"
                                        style={{ backgroundColor: feature.color }}
                                    />

                                    <div className="relative z-10">
                                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                                            <div
                                                className="w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-500"
                                                style={{ backgroundColor: `${feature.color}15` }}
                                            >
                                                <feature.icon className="w-8 h-8" style={{ color: feature.color }} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{feature.name}</h3>
                                                <p className="text-[#FF2D78] font-bold text-sm tracking-widest uppercase">{feature.desc}</p>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-lg leading-relaxed mb-8 font-medium">
                                            {feature.longDesc}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {feature.points?.map((point, pIdx) => (
                                                <div key={pIdx} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-green-50 text-green-500 flex-shrink-0">
                                                        <Heart className="w-3 h-3 fill-current" />
                                                    </div>
                                                    <span className="text-gray-700 text-sm font-semibold">{point}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
                                            <Link href="/auth/sign-up" className="flex items-center gap-2 text-gray-900 font-black hover:text-[#FF2D78] transition-colors group/link">
                                                Activate Feature
                                                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                            <div className="px-4 py-1.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                Meta Powered
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* Showcase Section */}
            <section className="py-32 bg-gray-950 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF2D78]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="text-[#FF2D78] font-black tracking-widest uppercase mb-4 block">Enterprise Ready</span>
                                <h2 className="text-5xl md:text-7xl font-black mb-10 leading-[0.95] tracking-tight">
                                    Built for the <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">Modern Creator</span>
                                </h2>
                                <div className="space-y-8">
                                    {[
                                        { t: "Intelligent AI Engine", d: "Learns from your past interactions to craft the perfect response every time." },
                                        { t: "Infinite Scalability", d: "Whether you get 10 comments or 10 million, our infrastructure never blinks." },
                                        { t: "Seamless Integration", d: "Connect your entire Meta ecosystem in less than 60 seconds with one-click OAuth." },
                                        { t: "Strategic Insights", d: "Beyond numbers—get real strategic advice on how to improve your engagement." }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-6 group">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#FF2D78]/20 group-hover:border-[#FF2D78]/30 transition-all duration-300">
                                                <Sparkles className="w-5 h-5 text-[#FF2D78]" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white mb-2">{item.t}</h4>
                                                <p className="text-gray-400 leading-relaxed font-medium">{item.d}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 flex items-center gap-8">
                                    <Link href="/auth/sign-up" className="inline-flex items-center gap-3 px-10 py-5 bg-[#FF2D78] hover:bg-[#e7266a] text-white font-bold rounded-full transition-all group scale-110 shadow-2xl shadow-[#FF2D78]/20">
                                        Start Your Journey
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10 rounded-[60px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(255,45,120,0.15)] bg-gray-900/40 backdrop-blur-3xl p-6"
                            >
                                <div className="aspect-[4/3] bg-black/40 rounded-[40px] flex items-center justify-center border border-white/5 relative overflow-hidden group">
                                    <Sparkles className="w-24 h-24 text-[#FF2D78] animate-pulse relative z-10" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D78]/5 to-transparent" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Highlights Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {highlights.map((item, i) => (
                            <div key={i} className="text-center group">
                                <div className="w-20 h-20 mx-auto mb-8 rounded-[24px] bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#FF2D78]/5 to-transparent rounded-[24px]" />
                                    <item.icon className="w-10 h-10 text-gray-800" />
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF2D78] mb-2">{item.subtitle}</h4>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed max-w-[280px] mx-auto font-medium">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="relative rounded-[48px] bg-gradient-to-br from-[#FF2D78] to-[#E1306C] p-12 md:p-20 text-center overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">
                                Ready to scale <br className="hidden md:block" />
                                your Meta presence?
                            </h2>
                            <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                                Join the elite 1% of creators who use intelligent automation to dominate their niche.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link href="/auth/sign-up" className="w-full sm:w-auto px-12 py-6 bg-white text-[#FF2D78] font-black rounded-full transition-all hover:scale-105 shadow-xl">
                                    Get Started Free
                                </Link>
                                <Link href="/pricing" className="w-full sm:w-auto px-12 py-6 bg-black/20 text-white font-black rounded-full backdrop-blur-md border border-white/20 hover:bg-black/30">
                                    View Pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
