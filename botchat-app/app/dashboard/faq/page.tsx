"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { Search, Loader2, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FaqItem {
    id: number;
    question: string;
    answer: string;
    is_featured: boolean;
}

type GroupedFaqs = Record<string, FaqItem[]>;

export default function TenantFaqPage() {
    const [faqGroups, setFaqGroups] = useState<GroupedFaqs>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [openIds, setOpenIds] = useState<number[]>([]);

    const fetchFaqs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/faqs/tenant", {
                params: { search: search.trim() || undefined },
            });
            if (res.data?.success) {
                setFaqGroups(res.data.data);
            }
        } catch {
            toast.error("Failed to load FAQ items.");
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchFaqs();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchFaqs]);

    const toggleFaq = (id: number) => {
        setOpenIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const categoryNames = Object.keys(faqGroups);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
                <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                    <HelpCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                    Frequently Asked Questions
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                    Have questions? Search our comprehensive help guide for answers regarding bot automation, billing, and settings.
                </p>
            </div>

            {/* Search Input */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 shadow-sm max-w-xl mx-auto">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                    <input
                        type="text"
                        placeholder="Search questions or keywords..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-transparent focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Accordion List */}
            {loading ? (
                <div className="p-12 flex justify-center items-center text-[var(--muted-foreground)]">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading FAQs...
                </div>
            ) : categoryNames.length === 0 ? (
                <div className="p-12 text-center text-xs sm:text-sm text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                    No FAQs found matching your search.
                </div>
            ) : (
                <div className="space-y-8">
                    {categoryNames.map((category) => (
                        <div key={category} className="space-y-3">
                            <h2 className="text-xs font-black uppercase tracking-wider text-primary border-b border-[var(--border)] pb-2">
                                {category}
                            </h2>
                            <div className="space-y-3">
                                {faqGroups[category].map((faq) => {
                                    const isOpen = openIds.includes(faq.id);
                                    return (
                                        <div
                                            key={faq.id}
                                            className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm transition-all"
                                        >
                                            <button
                                                onClick={() => toggleFaq(faq.id)}
                                                className="w-full text-left p-4.5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[var(--foreground)] hover:text-primary transition-colors"
                                            >
                                                <span>{faq.question}</span>
                                                {isOpen ? (
                                                    <ChevronUp className="w-4 h-4 shrink-0 text-primary" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted-foreground)]" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-4.5 pb-4 text-xs sm:text-sm text-[var(--muted-foreground)] border-t border-[var(--border)]/50 pt-3 leading-relaxed prose prose-sm max-w-none">
                                                    <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
