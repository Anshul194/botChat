"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
    {
        name: "Sarah Chen",
        role: "Instagram Creator",
        handle: "@sarahchenstyle",
        followers: "412K followers",
        text: "BotChat 10x'd my Instagram DM response rate overnight. I used to manually reply to hundreds of comments — now my bot handles everything while I sleep. It's insane how much time I've saved.",
        stars: 5,
        avatar: "SC",
        gradient: "from-pink-400 to-rose-600",
    },
    {
        name: "Marcus Rivera",
        role: "Digital Marketing Agency",
        handle: "@riveramarketing",
        followers: "23 client accounts",
        text: "Managing 20+ Facebook pages was a nightmare. With BotChat, every client account runs automated comment replies and inbox routing. Our team went from 8 people to 3 for the same output.",
        stars: 5,
        avatar: "MR",
        gradient: "from-violet-400 to-purple-600",
    },
    {
        name: "Priya Sharma",
        role: "E-commerce Brand Owner",
        handle: "@priyabeauty",
        followers: "218K followers",
        text: "The AI Reply Builder is a game changer. Our bot understands product questions, handles complaints intelligently, and even upsells. It's like having a senior customer support agent working 24/7.",
        stars: 5,
        avatar: "PS",
        gradient: "from-cyan-400 to-blue-600",
    },
    {
        name: "Jordan Kim",
        role: "Content Creator",
        handle: "@jordankreates",
        followers: "1.2M followers",
        text: "Bio Links plus Social Posting in one platform is a dream. I publish once and the automation handles the rest. My link-in-bio analytics alone have helped me negotiate better brand deals.",
        stars: 5,
        avatar: "JK",
        gradient: "from-amber-400 to-orange-600",
    },
    {
        name: "Anika Patel",
        role: "SaaS Startup Founder",
        handle: "@anikatechlife",
        followers: "67K followers",
        text: "The Developer API is incredibly well-documented. We integrated BotChat into our CRM in under a day. Webhooks work flawlessly — every new subscriber lands directly in our pipeline.",
        stars: 5,
        avatar: "AP",
        gradient: "from-emerald-400 to-teal-600",
    },
];

function Stars({ count }: { count: number }) {
    return (
        <div className="flex gap-1">
            {[...Array(count)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#FF2D78] text-[#FF2D78]" />
            ))}
        </div>
    );
}

export default function Testimonials() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent(i => (i === 0 ? TESTIMONIALS.length - 1 : i - 1));
    const next = () => setCurrent(i => (i === TESTIMONIALS.length - 1 ? 0 : i + 1));

    const t = TESTIMONIALS[current];

    return (
        <section className="py-24 bg-gray-50/60 border-t border-gray-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        Testimonials
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        Loved by{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            creators worldwide.
                        </span>
                    </motion.h2>
                </div>

                {/* Featured testimonial */}
                <div className="relative max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10"
                        >
                            <div className="flex items-start gap-5 mb-6">
                                {/* Avatar */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg`}>
                                    {t.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900 text-lg">{t.name}</p>
                                    <p className="text-[15px] font-semibold text-gray-600">{t.role}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-sm font-bold text-gray-500">{t.handle}</span>
                                        <span className="text-sm font-bold text-[#FF2D78]">{t.followers}</span>
                                    </div>
                                </div>
                                <Stars count={t.stars} />
                            </div>

                            <blockquote className="text-gray-800 font-medium text-lg leading-relaxed">
                                "{t.text}"
                            </blockquote>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        <button
                            onClick={prev}
                            className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#FF2D78] hover:text-[#FF2D78] transition-all shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {TESTIMONIALS.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`rounded-full transition-all ${i === current ? "w-8 h-2 bg-[#FF2D78]" : "w-2 h-2 bg-gray-200"}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-[#FF2D78] hover:text-[#FF2D78] transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mini grid below */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-14 max-w-3xl mx-auto">
                    {TESTIMONIALS.map((t, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                                i === current
                                    ? "border-[#FF2D78] bg-[#FF2D78]/5 shadow-md"
                                    : "border-gray-100 bg-white hover:border-gray-200"
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-black text-sm`}>
                                {t.avatar}
                            </div>
                            <span className="text-xs font-bold text-gray-500 truncate w-full text-center">{t.name.split(" ")[0]}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}