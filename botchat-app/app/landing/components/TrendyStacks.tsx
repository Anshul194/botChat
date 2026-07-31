"use client";

import { motion } from "framer-motion";
import { Facebook, Instagram, Smartphone, Send, Chrome } from "lucide-react";

const INTEGRATIONS = [
    { name: "Facebook",  icon: Facebook,    color: "#1877F2", bg: "rgba(24,119,242,0.08)" },
    { name: "Instagram", icon: Instagram,   color: "#C13584", bg: "rgba(193,53,132,0.08)" },
    { name: "WhatsApp",  icon: Smartphone,  color: "#25D366", bg: "rgba(37,211,102,0.08)" },
    { name: "Telegram",  icon: Send,        color: "#2AABEE", bg: "rgba(42,171,238,0.08)" },
    { name: "OpenAI",    label: "GPT",      color: "#10A37F", bg: "rgba(16,163,127,0.08)" },
    { name: "Gemini",    label: "Gemini",   color: "#4285F4", bg: "rgba(66,133,244,0.08)" },
    { name: "Claude",    label: "Claude",   color: "#D4631A", bg: "rgba(212,99,26,0.08)"  },
    { name: "Google",    icon: Chrome,      color: "#EA4335", bg: "rgba(234,67,53,0.08)"  },
    { name: "REST API",  label: "API",      color: "#6366F1", bg: "rgba(99,102,241,0.08)" },
    { name: "Webhook",   label: "Webhook",  color: "#0EA5E9", bg: "rgba(14,165,233,0.08)" },
];

const STATS = [
    { value: "20+",   label: "Modules"       },
    { value: "150+",  label: "Features"      },
    { value: "99.9%", label: "Uptime"        },
    { value: "100%",  label: "Cloud Hosted"  },
    { value: "AI",    label: "Powered"       },
    { value: "Meta",  label: "Verified"      },
];

function IntegrationBadge({ item, delay }: { item: typeof INTEGRATIONS[0]; delay: number }) {
    const Icon = "icon" in item ? item.icon : undefined;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.35 }}
            whileHover={{ scale: 1.08, y: -4 }}
            className="flex flex-col items-center gap-2.5 group cursor-default"
        >
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300"
                style={{ background: item.bg }}
            >
                {Icon ? (
                    <Icon className="w-7 h-7" style={{ color: item.color }} />
                ) : (
                    <span className="text-sm font-black" style={{ color: item.color }}>
                        {"label" in item ? item.label : item.name.substring(0, 3)}
                    </span>
                )}
            </div>
            <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{item.name}</span>
        </motion.div>
    );
}

export default function TrendyStacks() {
    return (
        <section className="py-24 bg-white border-t border-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                {/* Stats strip */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-20"
                >
                    {STATS.map((stat, i) => (
                        <div key={i} className="text-center p-4 rounded-2xl bg-gray-50 border border-gray-100">
                            <p className="text-2xl font-black text-black mb-1">{stat.value}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Integrations */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        Integrations
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        Connects to your{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            entire stack.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg max-w-xl mx-auto font-medium"
                    >
                        Native integrations with the platforms and AI models your team already relies on.
                    </motion.p>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-6 max-w-3xl mx-auto">
                    {INTEGRATIONS.map((item, i) => (
                        <IntegrationBadge key={item.name} item={item} delay={i * 0.05} />
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest mt-8"
                >
                    More integrations added regularly
                </motion.p>
            </div>
        </section>
    );
}
