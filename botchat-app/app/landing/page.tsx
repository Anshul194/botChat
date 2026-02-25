"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    MessageSquare,
    Zap,
    BarChart2,
    Bot,
    Users,
    Instagram,
    Facebook,
    ArrowRight,
    Check,
    Star,
    GitBranch,
    Shield,
    Globe,
    ChevronRight,
    Play,
    Sparkles,
    TrendingUp,
    Clock,
    Target,
    ChevronDown,
    Menu,
    X,
} from "lucide-react";

const features = [
    {
        icon: Bot,
        title: "AI-Powered Auto Replies",
        desc: "Let our AI handle conversations intelligently. Train it on your brand voice and watch it engage customers 24/7.",
        color: "#7c3aed",
        grad: "from-purple-500 to-pink-500",
    },
    {
        icon: GitBranch,
        title: "Visual Flow Builder",
        desc: "Create complex automation sequences with a drag-and-drop canvas. No coding required.",
        color: "#06b6d4",
        grad: "from-cyan-500 to-blue-500",
    },
    {
        icon: MessageSquare,
        title: "Unified Inbox",
        desc: "Manage Instagram DMs and Facebook Messenger conversations in one beautiful interface.",
        color: "#ec4899",
        grad: "from-pink-500 to-rose-500",
    },
    {
        icon: BarChart2,
        title: "Advanced Analytics",
        desc: "Track engagement, leads, and conversion rates with real-time dashboards and reports.",
        color: "#10b981",
        grad: "from-emerald-500 to-teal-500",
    },
    {
        icon: Target,
        title: "Comment → DM Funnels",
        desc: "Turn every comment into a private conversation. Capture leads the moment they engage.",
        color: "#f59e0b",
        grad: "from-yellow-500 to-orange-500",
    },
    {
        icon: Shield,
        title: "Meta Compliant",
        desc: "Fully compliant with Instagram and Facebook Platform Policies. Safe, secure, and reliable.",
        color: "#8b5cf6",
        grad: "from-violet-500 to-purple-500",
    },
];

const testimonials = [
    {
        name: "Aryan Mehta",
        role: "E-commerce Founder",
        company: "StyleCart",
        text: "BotChat tripled our Instagram DM response rate. We're converting 3x more leads now without any extra effort. Absolute game-changer!",
        avatar: "AM",
        grad: "from-pink-500 to-orange-400",
        stars: 5,
    },
    {
        name: "Priya Singh",
        role: "Marketing Director",
        company: "GrowthAgency",
        text: "The flow builder is insane. We built a whole lead nurturing sequence in 20 minutes. Our clients love the results.",
        avatar: "PS",
        grad: "from-purple-500 to-cyan-400",
        stars: 5,
    },
    {
        name: "James Wilson",
        role: "Content Creator",
        company: "1.2M followers",
        text: "Finally an automation tool that doesn't feel spammy. The AI replies are incredibly natural and my engagement has gone through the roof.",
        avatar: "JW",
        grad: "from-blue-500 to-green-400",
        stars: 5,
    },
];

const plans = [
    {
        name: "Starter",
        price: 29,
        desc: "Perfect for creators",
        features: ["1 IG + 1 FB account", "500 auto-replies/mo", "3 automation flows", "Basic analytics"],
        color: "#06b6d4",
        cta: "Start Free Trial",
    },
    {
        name: "Pro",
        price: 79,
        desc: "For growing businesses",
        features: ["3 IG + 3 FB accounts", "Unlimited auto-replies", "Unlimited flows + AI", "Advanced analytics", "A/B testing", "Priority support"],
        color: "#7c3aed",
        popular: true,
        cta: "Start Free Trial",
    },
    {
        name: "Business",
        price: 199,
        desc: "Enterprise power",
        features: ["Unlimited accounts", "Custom AI training", "White-label", "API access", "Dedicated manager", "SLA guarantee"],
        color: "#f59e0b",
        cta: "Contact Sales",
    },
];

const stats = [
    { value: "10M+", label: "Messages Automated" },
    { value: "50K+", label: "Active Businesses" },
    { value: "94%", label: "Average Open Rate" },
    { value: "3.8x", label: "Average ROI Increase" },
];

const faqs = [
    { q: "Is BotChat compliant with Meta's policies?", a: "Yes! We are fully compliant with Instagram Messaging API and Facebook Messenger Platform policies. All permissions are properly requested following Meta's guidelines." },
    { q: "How long does it take to set up?", a: "Most users are up and running in under 10 minutes. Our onboarding wizard guides you through connecting your accounts and creating your first automation." },
    { q: "Can I try before I buy?", a: "Absolutely! We offer a 14-day free trial on all plans with no credit card required. You get full access to all features during the trial." },
    { q: "What platforms are supported?", a: "We support Instagram Business Accounts and Facebook Pages. Both platforms are fully integrated for a seamless unified experience." },
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [mobileMenu, setMobileMenu] = useState(false);
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <div className="min-h-screen" style={{ background: "var(--background)" }}>
            {/* Navigation */}
            <nav
                className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-300"
                style={{
                    background: isLight ? "rgba(255,255,255,0.85)" : "rgba(10,10,15,0.85)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderBottom: "1px solid var(--glass-border)",
                }}
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">BotChat</span>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            {item}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Sign In
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: "var(--brand-gradient)", color: "white" }}
                    >
                        Start Free Trial
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="md:hidden flex items-center gap-2">
                    <ThemeToggle />
                    <button onClick={() => setMobileMenu(!mobileMenu)}>
                        {mobileMenu ? <X className="w-5 h-5" style={{ color: "var(--foreground)" }} /> : <Menu className="w-5 h-5" style={{ color: "var(--foreground)" }} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenu && (
                <div className="fixed inset-0 z-40 pt-16 transition-all duration-300" style={{ background: isLight ? "rgba(248,248,252,0.98)" : "rgba(10,10,15,0.97)", backdropFilter: "blur(20px)" }}>
                    <div className="p-6 space-y-4">
                        {["Features", "Pricing", "Testimonials", "FAQ"].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenu(false)} className="block text-lg font-medium text-foreground py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                                {item}
                            </a>
                        ))}
                        <Link href="/dashboard" className="block" onClick={() => setMobileMenu(false)}>
                            <button className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--brand-gradient)", color: "white" }}>
                                Start Free Trial
                            </button>
                        </Link>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 md:px-6 text-center relative overflow-hidden">
                {/* Background orbs */}
                <div className="absolute top-20 left-1/4 w-80 h-80 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#7c3aed" }} />
                <div className="absolute top-40 right-1/4 w-60 h-60 rounded-full blur-[100px] opacity-15 pointer-events-none" style={{ background: "#ec4899" }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 blur-[80px] opacity-10 pointer-events-none" style={{ background: "#06b6d4" }} />

                <div className="relative max-w-5xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a855f7" }}>
                        <Sparkles className="w-4 h-4" />
                        AI-Powered Instagram & Facebook Automation
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(124,58,237,0.3)" }}>NEW</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
                        Automate Your <br />
                        <span className="gradient-text">Social Media DMs</span> <br />
                        at Scale
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Turn Instagram comments and Facebook messages into revenue. BotChat automates your DMs with AI, captures leads, and nurtures customers — all on autopilot.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold transition-all hover:opacity-90 hover:scale-105"
                            style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }}
                        >
                            Start Free Trial — 14 Days
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-7 py-4 rounded-2xl text-base font-semibold transition-all"
                            style={{
                                background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
                                color: "var(--foreground)",
                                border: "1px solid var(--glass-border)",
                            }}
                        >
                            <Play className="w-4 h-4" />
                            Watch Demo
                        </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">No credit card required · Setup in 5 minutes · Cancel anytime</p>

                    {/* Social proof */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <div className="flex -space-x-2">
                            {["AM", "PS", "JW", "KR", "MB"].map((a, i) => (
                                <div
                                    key={a}
                                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{
                                        borderColor: "var(--background)",
                                        background: `hsl(${240 + i * 30}, 70%, 60%)`,
                                        zIndex: 5 - i,
                                    }}
                                >
                                    {a}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <span className="text-foreground font-semibold">50,000+</span> businesses already automating
                        </div>
                    </div>
                </div>

                {/* Hero Dashboard Preview */}
                <div className="relative max-w-5xl mx-auto mt-16">
                    <div
                        className="rounded-3xl overflow-hidden p-2"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 100px rgba(124,58,237,0.15)",
                        }}
                    >
                        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)" }}>
                            {/* Mock dashboard header */}
                            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="flex-1 mx-4 h-6 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
                            </div>

                            {/* Mock content */}
                            <div className="flex h-64">
                                {/* Mock sidebar */}
                                <div className="w-48 border-r p-3 space-y-2" style={{ borderColor: "rgba(255,255,255,0.05)", background: "var(--sidebar)" }}>
                                    {["Dashboard", "Inbox", "Automations", "Analytics"].map((item, i) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-2 px-2 py-2 rounded-lg"
                                            style={i === 0 ? { background: "rgba(124,58,237,0.2)" } : {}}
                                        >
                                            <div className="w-4 h-4 rounded" style={{ background: i === 0 ? "#7c3aed" : "rgba(255,255,255,0.1)" }} />
                                            <div className="h-2.5 rounded-full flex-1" style={{ background: i === 0 ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)", width: `${60 + i * 10}%` }} />
                                        </div>
                                    ))}
                                </div>

                                {/* Mock main */}
                                <div className="flex-1 p-4 space-y-3">
                                    <div className="grid grid-cols-4 gap-3">
                                        {["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"].map((color) => (
                                            <div key={color} className="h-16 rounded-xl p-3 flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                <div className="w-6 h-6 rounded-lg" style={{ background: `${color}20` }} />
                                                <div className="h-4 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2 h-28 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            {/* Mini chart bars */}
                                            <div className="flex items-end gap-1.5 h-full p-4">
                                                {[40, 70, 50, 90, 65, 80, 55].map((h, i) => (
                                                    <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i % 2 === 0 ? "#7c3aed" : "#ec4899", opacity: 0.7 }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="h-28 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div className="space-y-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex gap-2 items-center">
                                                        <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${230 + i * 30}, 70%, 60%)` }} />
                                                        <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badges */}
                    <div
                        className="absolute -left-4 top-1/3 float-anim px-3 py-2 rounded-xl hidden md:flex items-center gap-2 text-sm font-medium"
                        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", backdropFilter: "blur(10px)" }}
                    >
                        <Bot className="w-4 h-4" />
                        AI replied in 1.2s
                    </div>
                    <div
                        className="absolute -right-4 top-1/4 float-anim px-3 py-2 rounded-xl hidden md:flex items-center gap-2 text-sm font-medium"
                        style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#a855f7", backdropFilter: "blur(10px)", animationDelay: "1s" }}
                    >
                        <TrendingUp className="w-4 h-4" />
                        +124 leads today
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 border-y" style={{ borderColor: "var(--glass-border)", background: isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)" }}>
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <div className="text-4xl font-extrabold gradient-text mb-2">{s.value}</div>
                            <div className="text-sm text-muted-foreground">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}>
                            <Zap className="w-3 h-3" />
                            POWERFUL FEATURES
                        </div>
                        <h2 className="text-4xl font-bold text-foreground mb-4">Everything you need to automate</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">A complete platform for Instagram and Facebook automation that actually drives results</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feat, i) => (
                            <div
                                key={feat.title}
                                className="glass-card rounded-2xl p-6 group hover:border-opacity-50 transition-all duration-300 hover:translate-y-[-4px]"
                                style={{ "--hover-color": feat.color } as React.CSSProperties}
                            >
                                <div
                                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.grad} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <feat.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-foreground text-lg mb-2">{feat.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-24 px-6" style={{ background: isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Up and running in 5 minutes</h2>
                        <p className="text-muted-foreground text-lg">No technical skills required</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connecting line */}
                        <div className="absolute top-10 left-1/4 right-1/4 h-0.5 hidden md:block" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)" }} />

                        {[
                            { step: "01", title: "Connect Your Accounts", desc: "Link your Instagram Business Account and Facebook Page via secure OAuth in seconds.", icon: Instagram, color: "#ec4899" },
                            { step: "02", title: "Build Your Flow", desc: "Use our visual drag-and-drop builder to create automation sequences. Choose from 20+ templates.", icon: GitBranch, color: "#7c3aed" },
                            { step: "03", title: "Watch Leads Roll In", desc: "Activate your automation and watch your DMs handle themselves while you focus on growth.", icon: TrendingUp, color: "#10b981" },
                        ].map((step) => (
                            <div key={step.step} className="text-center glass-card rounded-2xl p-8 relative">
                                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: `${step.color}15`, border: `2px solid ${step.color}30` }}>
                                    <step.icon className="w-8 h-8" style={{ color: step.color }} />
                                </div>
                                <div className="absolute top-4 right-4 text-xs font-bold opacity-20" style={{ color: step.color }}>{step.step}</div>
                                <h3 className="font-bold text-foreground text-lg mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Loved by 50,000+ businesses</h2>
                        <p className="text-muted-foreground text-lg">Real results from real customers</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonials.map((t, i) => (
                            <div key={t.name} className="glass-card rounded-2xl p-6 relative" style={i === 1 ? { border: "1px solid rgba(124,58,237,0.3)" } : {}}>
                                {i === 1 && (
                                    <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: "var(--brand-gradient)" }} />
                                )}
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(t.stars)].map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-current" style={{ color: "#f59e0b" }} />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.grad} flex items-center justify-center text-xs font-bold text-white`}>{t.avatar}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6" style={{ background: isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.01)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
                        <p className="text-muted-foreground text-lg">14-day free trial · No credit card required · Cancel anytime</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className="glass-card rounded-2xl p-7 relative overflow-hidden"
                                style={plan.popular ? { border: `1px solid ${plan.color}40`, boxShadow: `0 20px 60px ${plan.color}15` } : {}}
                            >
                                {plan.popular && (
                                    <>
                                        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "var(--brand-gradient)" }} />
                                        <div className="absolute top-5 right-5 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "var(--brand-gradient)", color: "white" }}>POPULAR</div>
                                    </>
                                )}

                                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>

                                <div className="flex items-end gap-1 mb-6">
                                    <span className="text-4xl font-extrabold text-foreground">${plan.price}</span>
                                    <span className="text-muted-foreground mb-1">/month</span>
                                </div>

                                <div className="space-y-2.5 mb-7">
                                    {plan.features.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                                            <span className="text-sm text-muted-foreground">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link href="/dashboard">
                                    <button
                                        className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                                        style={plan.popular ? { background: "var(--brand-gradient)", color: "white" } : { background: `${plan.color}15`, color: plan.color, border: `1px solid ${plan.color}30` }}
                                    >
                                        {plan.cta}
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl font-bold text-foreground mb-4">Frequently asked questions</h2>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="glass-card rounded-2xl overflow-hidden cursor-pointer"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <div className="flex items-center justify-between px-5 py-4">
                                    <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                                </div>
                                {openFaq === i && (
                                    <div className="px-5 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                        <p className="text-sm text-muted-foreground leading-relaxed pt-3">{faq.a}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div
                        className="rounded-3xl p-12 relative overflow-hidden"
                        style={{
                            background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, rgba(10,10,15,0.8) 70%)",
                            border: "1px solid rgba(124,58,237,0.2)",
                            boxShadow: "0 30px 80px rgba(124,58,237,0.2)",
                        }}
                    >
                        <div className="absolute inset-0 opacity-30" style={{ background: "var(--brand-gradient-soft)" }} />
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--brand-gradient)", boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }}>
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-foreground mb-4">Ready to automate?</h2>
                            <p className="text-muted-foreground text-lg mb-8">Join 50,000+ businesses using BotChat to grow on autopilot</p>
                            <Link href="/dashboard">
                                <button
                                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:opacity-90 hover:scale-105"
                                    style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 8px 30px rgba(124,58,237,0.5)" }}
                                >
                                    Start Your Free Trial Today
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </Link>
                            <p className="text-xs text-muted-foreground mt-4">14 days free · No credit card needed · Setup in 5 min</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-12 px-6" style={{ borderColor: "var(--glass-border)" }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                                    <MessageSquare className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="font-bold gradient-text">BotChat</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">AI-powered Instagram & Facebook automation for modern businesses.</p>
                        </div>
                        {[
                            { title: "Product", links: ["Features", "Pricing", "Flow Builder", "Analytics", "Changelog"] },
                            { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Partners"] },
                            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Data Deletion", "Cookie Policy"] },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="font-semibold text-foreground text-sm mb-4">{col.title}</h4>
                                <ul className="space-y-2.5">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{link}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t" style={{ borderColor: "var(--glass-border)" }}>
                        <p className="text-xs text-muted-foreground">© 2025 BotChat. All rights reserved. Meta compliant platform.</p>
                        <div className="flex items-center gap-4">
                            {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((s) => (
                                <a key={s} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{s}</a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
