"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Instagram, Facebook, X } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickFind() {
    const { accounts, selectAccount } = useSmartInbox();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredAccounts = accounts.filter(acc => 
        acc.name.toLowerCase().includes(query.toLowerCase()) ||
        acc.platform.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false);
            if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Quick Find Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg transition-all group border border-border"
            >
                <Search className={`w-4 h-4 transition-colors ${isOpen ? "text-primary" : "group-hover:text-primary"}`} />
                <span className="text-xs font-semibold">Quick Find</span>
                <div className="flex items-center gap-1 opacity-50">
                    <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded flex items-center justify-center">⌘</span>
                    <span className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded flex items-center justify-center">K</span>
                </div>
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-[320px] bg-card border border-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                    >
                        <div className="p-3 border-b border-border bg-muted/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search accounts..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                                {query && (
                                    <button 
                                        onClick={() => setQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto p-2">
                            <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
                                Accounts ({filteredAccounts.length})
                            </div>
                            
                            {filteredAccounts.length === 0 ? (
                                <div className="p-4 text-center text-xs text-muted-foreground italic">
                                    No accounts found for "{query}"
                                </div>
                            ) : (
                                filteredAccounts.map((account) => (
                                    <button
                                        key={account.id}
                                        onClick={() => {
                                            selectAccount(account);
                                            setIsOpen(false);
                                            setQuery("");
                                        }}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-lg transition-colors group text-left"
                                    >
                                        <div className="relative">
                                            {account.profile_pic && !imgErrors[account.id] ? (
                                                <img 
                                                    src={account.profile_pic} 
                                                    alt="" 
                                                    onError={() => setImgErrors(prev => ({ ...prev, [account.id]: true }))}
                                                    className="w-8 h-8 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-normal text-xs text-white" style={{ background: account.platform === "instagram" ? "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" : "#1877f2" }}>
                                                    {account.name[0]?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border border-card bg-background flex items-center justify-center">
                                                {account.platform === "instagram" ? (
                                                    <Instagram className="w-2 h-2 text-[var(--primary)]" />
                                                ) : (
                                                    <Facebook className="w-2 h-2 text-blue-600" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate group-hover:text-primary transition-colors" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
                                                {account.name}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-normal truncate opacity-60" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
                                                {account.platform}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
