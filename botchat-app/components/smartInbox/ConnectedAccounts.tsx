"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Facebook, Instagram, Plus, Check, ChevronDown, Search, Users } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

/* ─────────────────────────────────────────────────
   Dropdown rendered via portal so overflow:hidden
   on parent headers/cards never clips it.
───────────────────────────────────────────────── */
function PlatformDropdown({
    platform,
    accounts,
    selectedAccount,
    selectAccount,
    getUnread,
    isOpen,
    onClose,
    anchorRef,
}: {
    platform: "instagram" | "facebook";
    accounts: any[];
    selectedAccount: any;
    selectAccount: (a: any) => void;
    getUnread: (id: number) => number;
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const [q, setQ] = useState("");
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const panelRef = useRef<HTMLDivElement>(null);
    const isFB = platform === "facebook";

    const filtered = accounts.filter(a =>
        a.name.toLowerCase().includes(q.toLowerCase())
    );

    // Compute position from anchor every time it opens
    useEffect(() => {
        if (!isOpen || !anchorRef.current) return;
        const rect = anchorRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + 8,
            left: rect.left,
        });
    }, [isOpen, anchorRef]);

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                panelRef.current && !panelRef.current.contains(target) &&
                anchorRef.current && !anchorRef.current.contains(target)
            ) onClose();
        };
        // slight delay so the open-click doesn't immediately close
        const timer = setTimeout(() => document.addEventListener("mousedown", handle), 10);
        return () => { clearTimeout(timer); document.removeEventListener("mousedown", handle); };
    }, [isOpen, onClose, anchorRef]);

    // Reset search on close
    useEffect(() => { if (!isOpen) setQ(""); }, [isOpen]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    style={{
                        position: "fixed",
                        top: coords.top,
                        left: coords.left,
                        zIndex: 9999,
                        width: 260,
                        background: "var(--card)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 16,
                        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center gap-2.5 px-3 py-2.5 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                            isFB
                                ? "bg-blue-600"
                                : "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                        )}>
                            {isFB
                                ? <Facebook className="w-3.5 h-3.5 text-white fill-white" />
                                : <Instagram className="w-3.5 h-3.5 text-white" />
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black uppercase tracking-wider leading-tight" style={{ color: "var(--foreground)" }}>
                                {isFB ? "Facebook" : "Instagram"}
                            </p>
                            <p className="text-[10px] leading-tight" style={{ color: "var(--muted-foreground)" }}>
                                {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div
                        className="px-3 py-2 flex-shrink-0"
                        style={{ borderBottom: "1px solid var(--glass-border)" }}
                    >
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--muted-foreground)" }} />
                            <input
                                autoFocus
                                type="text"
                                value={q}
                                onChange={e => setQ(e.target.value)}
                                placeholder="Search accounts…"
                                className="w-full pl-7 pr-3 h-7 rounded-lg text-[12px] outline-none"
                                style={{
                                    background: "var(--glass-bg)",
                                    border: "1px solid var(--glass-border)",
                                    color: "var(--foreground)",
                                }}
                            />
                        </div>
                    </div>

                    {/* Scrollable account list */}
                    <div style={{ overflowY: "auto", maxHeight: 300, padding: "6px" }}>

                        {/* "All [platform]" row */}
                      

                        <div style={{ height: 1, margin: "4px 8px", background: "var(--glass-border)" }} />

                        {filtered.length === 0 ? (
                            <p className="text-center text-[11px] py-4" style={{ color: "var(--muted-foreground)" }}>
                                No accounts found
                            </p>
                        ) : filtered.map(acc => {
                            const isSelected = selectedAccount?.id === acc.id;
                            const unread = getUnread(acc.id);
                            return (
                                <AccountRow
                                    key={acc.id}
                                    label={acc.name}
                                    sublabel={unread > 0 ? `${unread} unread` : undefined}
                                    isSelected={isSelected}
                                    isFB={isFB}
                                    avatar={acc.profile_pic}
                                    initial={acc.name[0]?.toUpperCase()}
                                    unread={unread}
                                    onClick={() => {
                                        selectAccount(isSelected ? null : acc);
                                        onClose();
                                    }}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}

/* ─────────────────────────────────────────────────
   Reusable row inside the dropdown
───────────────────────────────────────────────── */
function AccountRow({
    label, sublabel, isSelected, isFB, icon, avatar, initial, unread, onClick,
}: {
    label: string;
    sublabel?: string;
    isSelected: boolean;
    isFB: boolean;
    icon?: React.ReactNode;
    avatar?: string;
    initial?: string;
    unread?: number;
    onClick: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const [imgError, setImgError] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "8px 10px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                outline: "none",
                background: isSelected
                    ? "var(--nav-active-bg)"
                    : hovered
                        ? "var(--nav-hover-bg)"
                        : "transparent",
                transition: "background 0.12s ease",
            }}
        >
            {/* Avatar / Icon */}
            <div style={{ position: "relative", flexShrink: 0 }}>
                {avatar && !imgError ? (
                    <img
                        src={avatar}
                        alt={label}
                        onError={() => setImgError(true)}
                        style={{
                            width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
                            outline: isSelected ? `2px solid ${isFB ? "#2563eb" : "#ec4899"}` : "none",
                            outlineOffset: 1,
                        }}
                    />
                ) : (
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 900, color: "white",
                        background: isFB
                            ? "#1877f2"
                            : "linear-gradient(135deg, #f09433, #dc2743, #bc1888)",
                    }}>
                        {icon ?? initial}
                    </div>
                )}
                {(unread ?? 0) > 0 && (
                    <span style={{
                        position: "absolute", top: -2, right: -2,
                        minWidth: 14, height: 14, padding: "0 2px",
                        borderRadius: 99, background: "#ef4444",
                        color: "white", fontSize: 8, fontWeight: 900,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1.5px solid var(--card)",
                    }}>
                        {(unread ?? 0) > 9 ? "9+" : unread}
                    </span>
                )}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <p style={{
                    fontSize: 12, fontWeight: 600, fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
                    color: isSelected ? "var(--nav-active-color)" : "var(--foreground)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    {label}
                </p>
                {sublabel && (
                    <p style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1 }}>
                        {sublabel}
                    </p>
                )}
            </div>

            {/* Checkmark */}
            {isSelected && (
                <Check
                    style={{ width: 13, height: 13, flexShrink: 0, color: isFB ? "#2563eb" : "#ec4899" }}
                    strokeWidth={3}
                />
            )}
        </button>
    );
}

/* ─────────────────────────────────────────────────
   Main export
───────────────────────────────────────────────── */
export default function ConnectedAccounts() {
    const { accounts, selectedAccount, selectAccount, conversations } = useSmartInbox();

    const [openDropdown, setOpenDropdown] = useState<"instagram" | "facebook" | null>(null);
    const igBtnRef = useRef<HTMLButtonElement>(null);
    const fbBtnRef = useRef<HTMLButtonElement>(null);

    const igAccounts = accounts.filter(a => a.platform === "instagram");
    const fbAccounts = accounts.filter(a => a.platform === "facebook");

    const getUnread = useCallback((id: number) =>
        conversations.filter(c => c.platform_account_id === id)
            .reduce((s, c) => s + (c.unread_count || 0), 0),
        [conversations]);

    const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);
    const igUnread = igAccounts.reduce((s, a) => s + getUnread(a.id), 0);
    const fbUnread = fbAccounts.reduce((s, a) => s + getUnread(a.id), 0);

    const activePlatform = selectedAccount?.platform ?? "all";

    function pillStyle(active: boolean, color?: "ig" | "fb") {
        if (active && color === "ig") return {
            background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)",
            color: "#fff", border: "1px solid transparent",
        };
        if (active && color === "fb") return {
            background: "#1877f2", color: "#fff", border: "1px solid transparent",
        };
        if (active) return {
            background: "var(--foreground)", color: "var(--background)", border: "1px solid var(--foreground)",
        };
        return {
            background: "transparent", color: "var(--muted-foreground)",
            border: "1px solid var(--glass-border)",
        };
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", minWidth: 0 }}>

            {/* ALL */}
            <button
                onClick={() => { selectAccount(null); setOpenDropdown(null); }}
                className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer"
                style={pillStyle(activePlatform === "all")}
            >
                All
                {totalUnread > 0 && (
                    <span style={{
                        minWidth: 18, height: 18, padding: "0 4px", borderRadius: 99,
                        fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center",
                        background: activePlatform === "all" ? "var(--background)" : "var(--glass-border)",
                        color: activePlatform === "all" ? "var(--foreground)" : "var(--foreground)",
                    }}>
                        {totalUnread > 99 ? "99+" : totalUnread}
                    </span>
                )}
            </button>

            {/* Separator */}
            {(igAccounts.length > 0 || fbAccounts.length > 0) && (
                <div style={{ width: 1, height: 20, background: "var(--glass-border)", flexShrink: 0 }} />
            )}

            {/* INSTAGRAM pill + dropdown */}
            {igAccounts.length > 0 && (
                <>
                    <button
                        ref={igBtnRef}
                        onClick={() => setOpenDropdown(d => d === "instagram" ? null : "instagram")}
                        className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer"
                        style={pillStyle(activePlatform === "instagram" || openDropdown === "instagram", "ig")}
                    >
                        <Instagram className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline whitespace-nowrap">Instagram</span>
                        <span style={{
                            minWidth: 18, height: 18, padding: "0 4px", borderRadius: 99,
                            fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center",
                            background: (activePlatform === "instagram" || openDropdown === "instagram") ? "rgba(255,255,255,0.28)" : "var(--glass-border)",
                            color: (activePlatform === "instagram" || openDropdown === "instagram") ? "#fff" : "var(--foreground)",
                        }}>
                            {igAccounts.length}
                        </span>
                        {igUnread > 0 && (
                            <span style={{ minWidth: 15, height: 15, padding: "0 3px", borderRadius: 99, background: "#ef4444", color: "#fff", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {igUnread > 99 ? "99+" : igUnread}
                            </span>
                        )}
                        <ChevronDown className={cn("w-3 h-3 flex-shrink-0 transition-transform duration-150", openDropdown === "instagram" && "rotate-180")} />
                    </button>

                    <PlatformDropdown
                        platform="instagram"
                        accounts={igAccounts}
                        selectedAccount={selectedAccount}
                        selectAccount={selectAccount}
                        getUnread={getUnread}
                        isOpen={openDropdown === "instagram"}
                        onClose={() => setOpenDropdown(null)}
                        anchorRef={igBtnRef}
                    />
                </>
            )}

            {/* FACEBOOK pill + dropdown */}
            {fbAccounts.length > 0 && (
                <>
                    <button
                        ref={fbBtnRef}
                        onClick={() => setOpenDropdown(d => d === "facebook" ? null : "facebook")}
                        className="flex-shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-bold transition-all duration-150 cursor-pointer"
                        style={pillStyle(activePlatform === "facebook" || openDropdown === "facebook", "fb")}
                    >
                        <Facebook className="w-3.5 h-3.5 flex-shrink-0 fill-current" />
                        <span className="hidden sm:inline whitespace-nowrap">Facebook</span>
                        <span style={{
                            minWidth: 18, height: 18, padding: "0 4px", borderRadius: 99,
                            fontSize: 9, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center",
                            background: (activePlatform === "facebook" || openDropdown === "facebook") ? "rgba(255,255,255,0.28)" : "var(--glass-border)",
                            color: (activePlatform === "facebook" || openDropdown === "facebook") ? "#fff" : "var(--foreground)",
                        }}>
                            {fbAccounts.length}
                        </span>
                        {fbUnread > 0 && (
                            <span style={{ minWidth: 15, height: 15, padding: "0 3px", borderRadius: 99, background: "#ef4444", color: "#fff", fontSize: 8, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {fbUnread > 99 ? "99+" : fbUnread}
                            </span>
                        )}
                        <ChevronDown className={cn("w-3 h-3 flex-shrink-0 transition-transform duration-150", openDropdown === "facebook" && "rotate-180")} />
                    </button>

                    <PlatformDropdown
                        platform="facebook"
                        accounts={fbAccounts}
                        selectedAccount={selectedAccount}
                        selectAccount={selectAccount}
                        getUnread={getUnread}
                        isOpen={openDropdown === "facebook"}
                        onClose={() => setOpenDropdown(null)}
                        anchorRef={fbBtnRef}
                    />
                </>
            )}

            {/* Add account */}
            <button
                onClick={() => window.dispatchEvent(new CustomEvent("openInstagramConnect"))}
                title="Connect new account"
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                style={{ border: "1.5px dashed var(--glass-border)", color: "var(--muted-foreground)", background: "transparent" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.color = "var(--muted-foreground)"; }}
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}
