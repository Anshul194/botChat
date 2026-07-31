"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQ_CATEGORIES = [
    {
        label: "General",
        faqs: [
            {
                q: "Is BotChat compliant with Meta's terms of service?",
                a: "Yes. We exclusively use the official Meta Messenger & Instagram Graph APIs. Unlike unofficial bots that scrape web data, our platform is fully recognized by Meta, ensuring your account remains safe and policy-compliant."
            },
            {
                q: "Which platforms does BotChat support?",
                a: "BotChat currently supports Facebook Pages, Instagram Professional accounts, WhatsApp Business (Cloud API), and Telegram. All four channels are available from a single unified inbox."
            },
            {
                q: "Do I need to install anything?",
                a: "No. BotChat is fully cloud-hosted. Just sign up, connect your social accounts, and you're live — no downloads, no servers, no DevOps required."
            },
        ]
    },
    {
        label: "Billing",
        faqs: [
            {
                q: "How does annual billing work?",
                a: "Annual plans are billed upfront for 12 months, giving you a 20% discount compared to the monthly rate. You can cancel anytime — unused months are refunded on a pro-rated basis."
            },
            {
                q: "Can I switch plans at any time?",
                a: "Absolutely. You can upgrade or downgrade at any time from your billing dashboard. Pro-rated adjustments are automatically calculated and applied to your next invoice."
            },
            {
                q: "Is there a free trial?",
                a: "Yes — every plan includes a free trial period with full feature access. No credit card is required to start. You only pay when you're ready to go live."
            },
        ]
    },
    {
        label: "Features",
        faqs: [
            {
                q: "What counts as a 'Message Credit'?",
                a: "Any private message sent by the bot in response to a user action — a post comment, story mention, or DM. Comment replies themselves are unlimited on all plans and do not count against your credits."
            },
            {
                q: "How does the AI Reply Builder work?",
                a: "The AI Reply Builder uses OpenAI (GPT-4), Google Gemini, or Anthropic Claude — your choice — to understand message intent and generate on-brand responses automatically. It supports conditional logic, flow branching, and custom training data."
            },
            {
                q: "Can I use my own custom domain for Bio Links?",
                a: "Yes. You can connect your own domain to your bio link pages on eligible plans. Custom domains must be verified via DNS, and setup typically takes under 5 minutes."
            },
        ]
    },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="border-b border-gray-100 last:border-0"
        >
            <button
                onClick={() => setOpen(v => !v)}
                className="flex items-start justify-between w-full py-5 text-left gap-4 group"
                aria-expanded={open}
            >
                <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#FF2D78] transition-colors leading-snug">
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 mt-0.5"
                >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${open ? "border-[#FF2D78] bg-[#FF2D78]" : "border-gray-200 bg-white"}`}>
                        {open
                            ? <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            : <Plus className="w-3.5 h-3.5 text-gray-500" strokeWidth={3} />
                        }
                    </div>
                </motion.div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-600 font-medium leading-relaxed pb-5 pr-10 text-base">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQ() {
    const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].label);

    const active = FAQ_CATEGORIES.find(c => c.label === activeCategory) ?? FAQ_CATEGORIES[0];

    return (
        <section className="py-24 bg-white overflow-hidden" id="faq">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/8 text-[#FF2D78] uppercase tracking-wider mb-5"
                    >
                        FAQ
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.05 }}
                        className="text-4xl md:text-5xl font-black text-black mb-4 tracking-tight"
                    >
                        Common Questions.{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                            Straight Answers.
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-600 text-lg max-w-xl mx-auto font-medium"
                    >
                        Everything you need to know before getting started.
                    </motion.p>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 justify-center mb-8 overflow-x-auto pb-1 no-scrollbar">
                    {FAQ_CATEGORIES.map(cat => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveCategory(cat.label)}
                            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-black transition-all ${
                                activeCategory === cat.label
                                    ? "bg-[#FF2D78] text-white shadow-md shadow-[#FF2D78]/30"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ list */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 divide-y divide-gray-100"
                    >
                        {active.faqs.map((faq, i) => (
                            <FAQItem key={`${activeCategory}-${i}`} q={faq.q} a={faq.a} index={i} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h4 className="text-xl font-black text-white mb-1.5">Still have questions?</h4>
                        <p className="text-gray-500 font-medium text-sm">
                            Chat with our team or browse the documentation.
                        </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button className="px-6 py-3 rounded-full bg-white/10 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                            Docs
                        </button>
                        <button className="px-6 py-3 rounded-full bg-[#FF2D78] text-white font-black text-sm uppercase tracking-widest hover:bg-[#e7266a] transition-all shadow-lg shadow-[#FF2D78]/30">
                            Contact Us
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
