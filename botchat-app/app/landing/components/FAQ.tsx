"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface FaqItemData {
    id: number;
    question: string;
    answer: string;
    is_featured: boolean;
}

type GroupedFaqs = Record<string, FaqItemData[]>;

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-start justify-between w-full py-5 text-left gap-4 group"
                aria-expanded={open}
            >
                <span
                    className="text-base sm:text-lg font-bold leading-snug transition-colors group-hover:text-[#FF2D78]"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                >
                    {q}
                </span>
                <motion.div
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="shrink-0 mt-0.5"
                >
                    <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                            open ? "border-[#FF2D78] bg-[#FF2D78]" : ""
                        }`}
                        style={!open ? { borderColor: "rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.05)" } : {}}
                    >
                        {open ? (
                            <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        ) : (
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} style={{ color: "rgba(255,255,255,0.5)" }} />
                        )}
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
                        <div
                            className="font-medium leading-relaxed pb-5 pr-10 text-base prose prose-invert max-w-none"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                            dangerouslySetInnerHTML={{ __html: a }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FAQ() {
    const [faqGroups, setFaqGroups] = useState<GroupedFaqs>({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("");

    useEffect(() => {
        api.get("/public/faqs/landing")
            .then((res) => {
                if (res.data?.success && res.data?.data) {
                    const groups = res.data.data;
                    setFaqGroups(groups);
                    const cats = Object.keys(groups);
                    if (cats.length > 0) {
                        setActiveCategory(cats[0]);
                    }
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const categoryNames = Object.keys(faqGroups);
    const activeFaqs = activeCategory && faqGroups[activeCategory] ? faqGroups[activeCategory] : [];

    return (
        <section
            className="py-24 overflow-hidden relative"
            id="faq"
            style={{ background: "linear-gradient(180deg, #0d0617 0%, #06000d 100%)" }}
        >
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
                        className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
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
                        className="text-lg max-w-xl mx-auto font-medium"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                    >
                        Everything you need to know before getting started.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center items-center text-white/50">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading FAQs...
                    </div>
                ) : categoryNames.length === 0 ? (
                    <div className="p-12 text-center text-white/50 rounded-3xl border border-white/10 bg-white/5">
                        No FAQs published yet.
                    </div>
                ) : (
                    <>
                        {/* Dynamic Category Tabs (Only categories with active FAQs) */}
                        <div className="flex gap-2 justify-center mb-8 overflow-x-auto pb-1 no-scrollbar">
                            {categoryNames.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-black transition-all border ${
                                        activeCategory === cat
                                            ? "bg-[#FF2D78] text-white shadow-md border-transparent"
                                            : "text-white/60 hover:text-white border-white/10"
                                    }`}
                                    style={activeCategory !== cat ? { background: "rgba(255,255,255,0.06)" } : {}}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Active Category FAQ List */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-3xl border px-6 divide-y divide-white/10"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    borderColor: "rgba(255,255,255,0.08)",
                                }}
                            >
                                {activeFaqs.map((faq, i) => (
                                    <FAQItem key={`${activeCategory}-${faq.id}`} q={faq.question} a={faq.answer} index={i} />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </>
                )}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-gray-950 to-gray-900 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h4 className="text-xl font-black text-white mb-1.5">Still have questions?</h4>
                        <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
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

