"use client";

import { Lock, ShieldCheck, Sparkles } from "lucide-react";

const security = [
    "Role-based access control",
    "Audit logs for every automation change",
    "Encrypted data in transit and at rest",
    "GDPR-friendly data handling workflows",
];

export default function TrustAndFinalCTA() {
    return (
        <>
            <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #06000d 0%, #0d0617 100%)" }}>
                {/* ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
                        style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
                </div>

                <div className="mx-auto max-w-7xl px-6 relative z-10">
                    <div className="rounded-3xl border p-8"
                        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: "#FF2D78" }}>Security / trust</p>
                        <h3 className="mt-3 text-3xl font-bold text-white font-display">Enterprise-grade controls for every message</h3>
                        <div className="mt-7 grid gap-4 md:grid-cols-2">
                            {security.map((item) => (
                                <div key={item} className="flex items-start gap-3 rounded-2xl border px-4 py-4"
                                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.04)" }}>
                                    <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-400" />
                                    <p className="font-body" style={{ color: "rgba(255,255,255,0.8)" }}>{item}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white border"
                            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                            <Lock className="h-4 w-4" /> SOC 2-ready architecture
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative py-20 overflow-hidden" style={{ background: "#0d0617" }}>
                {/* pink glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
                        style={{ background: "radial-gradient(ellipse, rgba(255,45,120,0.15) 0%, transparent 70%)", filter: "blur(80px)" }} />
                </div>

                <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em]" style={{ color: "#FF2D78" }}>Final CTA</p>
                    <h3 className="mt-3 text-4xl font-bold text-white font-display">Ready to automate your next 10,000 conversations?</h3>
                    <p className="mx-auto mt-4 max-w-2xl font-body" style={{ color: "rgba(255,255,255,0.6)" }}>
                        Start free, launch your first workflow today, and scale without increasing support headcount.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                        <a href="/auth/sign-up"
                            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition"
                            style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)", boxShadow: "0 8px 24px rgba(255,45,120,0.4)" }}>
                            Start free trial
                            <Sparkles className="h-4 w-4" />
                        </a>
                        <a href="/auth/sign-in"
                            className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold transition"
                            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)" }}>
                            Talk to sales
                        </a>
                    </div>
                </div>

                {/* Sticky CTA bar */}
                <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur md:flex md:items-center md:justify-between md:px-6"
                    style={{ borderColor: "rgba(255,45,120,0.3)", background: "rgba(9,0,13,0.96)" }}>
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                        <span className="font-semibold" style={{ color: "#FF80AB" }}></span> Start your free BotChat workspace in 2 minutes.
                    </p>
                    <a href="/auth/sign-up"
                        className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition md:mt-0"
                        style={{ background: "#FF2D78" }}>
                        Get Started
                        <Sparkles className="h-4 w-4" />
                    </a>
                </div>
            </section>
        </>
    );
}
