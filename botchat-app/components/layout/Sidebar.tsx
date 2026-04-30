"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ChevronDown, ChevronRight, LayoutDashboard, Inbox, Zap, GitBranch,
    Instagram, Facebook, MessageSquare, BarChart3, Users, Target, Link2,
    Settings, CreditCard, Plus, LogOut, Layers, Contact
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    onClose?: () => void;
}

const mainNav = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inbox", icon: Inbox, href: "/dashboard/inbox", badge: "12" }
];

const growthNav = [
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Contacts", icon: Users, href: "/dashboard/contacts" },
    { label: "Social Posting", icon: Plus, href: "/dashboard/posts/studio", badge: "Pro" },
    { label: "Campaigns", icon: Target, href: "/dashboard/campaigns" },
    { label: "Shortened Links", icon: Link2, href: "/dashboard/shortened-links" },
    { label: "Vcard Links", icon: Contact, href: "/dashboard/vcard-links" },
    { label: "AI Training", icon: MessageSquare, href: "/dashboard/ai-training", badge: "New" },
];

const workspaceNav = [
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
    { label: "Billing", icon: CreditCard, href: "/dashboard/billing" },
];

const adminNav = [
    { label: "User Management", icon: Users, href: "/dashboard/users" },
    { label: "Plan Management", icon: CreditCard, href: "/dashboard/plans" },
    { label: "Modules", icon: Layers, href: "/dashboard/modules" },
];

export default function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(s => s.auth);

    const [showLogout, setShowLogout] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [facebookOpen, setFacebookOpen] = useState(false);
    const [instagramOpen, setInstagramOpen] = useState(false);
    const [bioLinksOpen, setBioLinksOpen] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    // Centralized navigate helper: sets pending route, fires nav:start, calls router.push,
    // and falls back to a full redirect if router doesn't complete within timeout.
    const navigate = (href: string) => {
        setPendingRoute(href);
        try { window.dispatchEvent(new CustomEvent('nav:start', { detail: { href } })); } catch {}
        const fallback = setTimeout(() => {
            try {
                if (window.location.pathname !== href) window.location.href = href;
            } catch (e) {}
        }, 6000);
        // router.push returns a promise in App Router
        try {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            router.push(href).finally(() => clearTimeout(fallback));
        } catch (e) {
            clearTimeout(fallback);
        }
    };

    useEffect(() => {
        setMounted(true);

        // Determine the path we should consider active: pendingRoute (in-flight) or the current pathname.
        const current = pendingRoute || pathname || "";

        // Open accordions based on the current (possibly pending) path so the UI reflects navigation immediately.
        if (current.startsWith("/dashboard/facebook")) {
            setFacebookOpen(true);
        } else {
            setFacebookOpen(false);
        }

        if (current.startsWith("/dashboard/instagram") && !current.startsWith("/dashboard/instagram/bio-link") && !current.startsWith("/dashboard/instagram/bio-links")) {
            setInstagramOpen(true);
        } else {
            setInstagramOpen(false);
        }

        if (current.startsWith("/dashboard/instagram/bio-link") || current.startsWith("/dashboard/instagram/bio-links")) {
            setBioLinksOpen(true);
        } else {
            setBioLinksOpen(false);
        }

        // Clear pendingRoute only after the router has updated the pathname to match it.
        if (pendingRoute && pathname === pendingRoute) {
            setPendingRoute(null);
            try {
                window.dispatchEvent(new CustomEvent('nav:done'));
            } catch (e) {
                // ignore
            }
        }
    }, [pathname, pendingRoute]);

    const isSuperAdmin = useMemo(() => {
        if (!mounted || !user) return false;
        const role = (user.role || user.type || "").toLowerCase();
        return role.includes("super_admin") || role.includes("admin");
    }, [user, mounted]);

    const { showModal } = useModal();

    const currentPath = pendingRoute || pathname;
    const isFacebookActive = currentPath.startsWith("/dashboard/facebook");
    const isBioLinksActive = currentPath.startsWith("/dashboard/instagram/bio-link") || currentPath.startsWith("/dashboard/instagram/bio-links");
    const isInstagramActive = currentPath.startsWith("/dashboard/instagram") && !isBioLinksActive;

    const handleInstagramConnect = async () => {
        const width = 600;
        const height = 750;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        const popup = window.open(
            "about:blank",
            "instagram-connect",
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            showModal("error", "Error", "Popup blocked! Please allow popups for this site.");
            return;
        }

        showModal("loading", "Linking Instagram", "Connecting to system...");
        try {
            const res = await api.get("/social/instagram-connect/redirect");
            const redirectUrl = res.data?.data?.url || res.data?.data?.redirect_url;

            if (redirectUrl) {
                showModal("success", "Ready", "Please complete the setup in the popup.");
                popup.location.href = redirectUrl;

                const pollTimer = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(pollTimer);
                        if (window.location.pathname.startsWith('/dashboard/instagram')) {
                            window.location.reload();
                        }
                    }
                }, 800);
            } else {
                popup.close();
                throw new Error("No redirect URL received");
            }
        } catch (err: any) {
            popup?.close();
            showModal("error", "Error", err.response?.data?.message || "Failed to connect Instagram");
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await dispatch(logoutUser());
        router.replace("/auth/sign-in");
    };

    const sidebarVariants: Variants = {
        expanded: { width: "16rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
        collapsed: { width: "4rem", transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <TooltipProvider delayDuration={0}>
            <motion.aside
                initial={false}
                animate={collapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className="h-full flex flex-col border-r transition-colors"
                style={{
                    background: "var(--sidebar)",
                    borderColor: "var(--sidebar-border)",
                }}
            >
                {/* Logo / Brand */}
                <div className="h-16 flex items-center px-4 border-b flex-shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
                    <div className="flex items-center gap-2.5">
                        <motion.div
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                            style={{ background: "var(--primary)" }}
                        >
                            <MessageSquare className="w-4 h-4 text-white" />
                        </motion.div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-semibold text-lg tracking-tight"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    BotChat
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>



                {/* Navigation */}
                <motion.nav
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex-1 overflow-y-auto px-1.5 py-3 space-y-5 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
                >
                    {/* MAIN */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-3 pb-1.5"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sidebar-foreground)", opacity: 0.78 }}>
                                    Main
                                </span>
                            </motion.div>
                        )}
                        {mainNav.map(item => (
                            <NavItem key={item.href} item={item} collapsed={collapsed} pathname={currentPath} onClick={(e) => { e.preventDefault(); const href = item.href; if (onClose) onClose(); navigate(href); }} />
                        ))}
                    </motion.div>

                    {/* PLATFORMS */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-3 pb-1.5 flex items-center justify-between"
                            >
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--nav-active-color)" }}>
                                    Platforms
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={handleInstagramConnect}
                                    className="text-xs font-medium flex items-center gap-1 opacity-90 hover:opacity-100"
                                    style={{ color: "var(--nav-active-color)" }}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Connect
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Facebook Accordion */}
                        <NavAccordion
                            label="Facebook"
                            icon={Facebook}
                            isOpen={facebookOpen}
                            onToggle={() => setFacebookOpen(!facebookOpen)}
                            collapsed={collapsed}
                            items={[
                                { label: "Connect Account", href: "/dashboard/facebook" },
                                { label: "Bot Replies", href: "/dashboard/facebook/bot-replies" },
                                { label: "Comment Manager", href: "/dashboard/facebook/comment-manager", badge: "Live" },
                            ]}
                            pathname={currentPath}
                            navigate={navigate}
                            onClose={onClose}
                        />

                        {/* Instagram Accordion */}
                        <NavAccordion
                            label="Instagram"
                            icon={Instagram}
                            isOpen={instagramOpen}
                            onToggle={() => setInstagramOpen(!instagramOpen)}
                            collapsed={collapsed}
                            items={[
                                { label: "Connect Account", href: "/dashboard/instagram" },
                                { label: "Bot Replies", href: "/dashboard/instagram/bot-replies" },
                                { label: "Comment Manager", href: "/dashboard/instagram/comment-manager", badge: "Live" },
                            ]}
                            pathname={currentPath}
                            navigate={navigate}
                            onClose={onClose}
                        />

                        {/* Bio Links Accordion */}
                        <NavAccordion
                            label="Bio Links"
                            icon={Link2}
                            isOpen={bioLinksOpen}
                            onToggle={() => setBioLinksOpen(!bioLinksOpen)}
                            collapsed={collapsed}
                            items={[
                                { label: "Bio Link Manager", href: "/dashboard/instagram/bio-links", badge: "Premium" },
                                { label: "Shortened Links", href: "/dashboard/shortened-links", badge: "Premium" },
                                { label: "Analytics", href: "/dashboard/instagram/bio-links/analytics", badge: "" },
                            ]}
                            pathname={currentPath}
                            navigate={navigate}
                            onClose={onClose}
                        />
                    </motion.div>

                    {/* GROWTH */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 pb-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--sidebar-foreground)", opacity: 0.78 }}>
                                    Growth
                                </span>
                            </motion.div>
                        )}
                        {growthNav.map(item => (
                            <NavItem key={item.href} item={item} collapsed={collapsed} pathname={currentPath} onClick={(e) => { e.preventDefault(); const href = item.href; if (onClose) onClose(); navigate(href); }} />
                        ))}
                    </motion.div>

                    {/* ADMIN */}
                    {isSuperAdmin && (
                        <motion.div variants={itemVariants} className="space-y-0.5">
                            {!collapsed && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 pb-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                        Administration
                                    </span>
                                </motion.div>
                            )}
                            {adminNav.map(item => (
                                <NavItem key={item.href} item={item} collapsed={collapsed} pathname={currentPath} onClick={(e) => { e.preventDefault(); const href = item.href; if (onClose) onClose(); navigate(href); }} />
                            ))}
                        </motion.div>
                    )}
                </motion.nav>

                {/* Bottom User Section */}
                <div className="p-3 border-t overflow-hidden flex-shrink-0" style={{ borderColor: "var(--sidebar-border)" }}>
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => !collapsed && setShowLogout(true)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                            collapsed && "justify-center"
                        )}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0"
                            style={{ background: "var(--primary)" }}
                        >
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </motion.div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex-1 text-left min-w-0 flex items-center justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium truncate" style={{ color: "var(--foreground)" }}>
                                            {user?.name || "User"}
                                        </div>
                                        <div className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
                                            {user?.email || "Pro"}
                                        </div>
                                    </div>
                                    <LogOut className="w-4 h-4 text-neutral-400 transition-colors" style={{ color: "var(--muted-foreground)" }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Logout Confirmation Dialog */}
            <Dialog open={showLogout} onOpenChange={setShowLogout}>
                <DialogContent className="sm:max-w-sm rounded-[2rem] p-8">
                    <DialogHeader className="text-center">
                        <div className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "var(--nav-active-bg)" }}>
                            <LogOut className="w-9 h-9" style={{ color: "var(--nav-active-color)" }} />
                        </div>
                        <DialogTitle className="text-2xl font-black tracking-tight">Log out?</DialogTitle>
                        <DialogDescription className="text-neutral-500 dark:text-neutral-400 mt-2 text-base">
                            You will be signed out from your account. Any unsaved changes may be lost.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-4 mt-8">
                        <button
                            onClick={() => setShowLogout(false)}
                            className="flex-1 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="flex-1 py-4 rounded-2xl text-white font-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            style={{ background: "var(--primary)", boxShadow: "var(--shadow-card)" }}
                        >
                            {isLoggingOut ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                "Confirm Logout"
                            )}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}

// Reusable Accordion with hover support for collapsed state
function NavAccordion({
    label,
    icon: Icon,
    isOpen,
    onToggle,
    collapsed,
    items,
    pathname,
    navigate,
    onClose
}: {
    label: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    collapsed: boolean;
    items: { label: string; href: string; badge?: string }[];
    pathname: string;
    navigate: (href: string) => void;
    onClose?: () => void;
}) {
    const isActive = items.some(item => 
        item.href === "/dashboard/facebook" || item.href === "/dashboard/instagram" 
            ? pathname === item.href 
            : pathname.startsWith(item.href)
    );

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative"
            onMouseEnter={() => collapsed && setIsHovered(true)}
            onMouseLeave={() => collapsed && setIsHovered(false)}
        >
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    if (collapsed) {
                        const firstHref = items[0].href;
                        if (onClose) onClose();
                        navigate(firstHref);
                    } else {
                        onToggle();
                    }
                }}
                className={cn(
                    "group relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                        ? "font-medium shadow-sm"
                        : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                )}
                style={isActive ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" } : { color: "var(--sidebar-foreground)" }}
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isActive ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                    )}>
                        <Icon className={cn(
                            "w-4.5 h-4.5",
                            isActive ? "" : "text-neutral-600 dark:text-neutral-400"
                        )} style={isActive ? { color: "var(--nav-active-color)" } : undefined} />
                    </div>
                    {!collapsed && <span className="font-medium">{label}</span>}
                </div>

                {!collapsed && (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <ChevronDown className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    </motion.div>
                )}
            </motion.button>

            {/* Normal Submenu (Expanded) */}
            <AnimatePresence>
                {isOpen && !collapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 space-y-0.5 pl-11 pr-3 py-1">
                            {items.map(sub => {
                                const isSubActive = sub.href === "/dashboard/facebook" || sub.href === "/dashboard/instagram" 
                                    ? pathname === sub.href 
                                    : pathname.startsWith(sub.href);
                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        prefetch={false}
                                        onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(sub.href); }}
                                        className={cn(
                                            "group relative flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                            isSubActive ? "" : "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                                        )}
                                        style={isSubActive ? { color: "var(--nav-active-color)", background: "var(--nav-active-bg)" } : { color: "var(--sidebar-foreground)" }}
                                    >
                                        <div className="absolute left-0 w-1 h-1 rounded-full transition-colors" style={{ background: "var(--nav-active-border)" }} />
                                        <span className="flex-1 truncate">{sub.label}</span>
                                        {sub.badge && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                {sub.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Floating Panel (Collapsed) - Now using Tooltip Portal to prevent clipping */}
            <AnimatePresence>
                {collapsed && (
                    <Tooltip open={isHovered} onOpenChange={setIsHovered}>
                        <TooltipTrigger asChild>
                            <div className="absolute inset-0 z-10" />
                        </TooltipTrigger>
                        <TooltipContent 
                            side="right" 
                            sideOffset={10} 
                            className="p-2 min-w-[200px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl overflow-hidden"
                        >
                            <div className="px-3 py-2 mb-1 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{label}</span>
                            </div>
                            <div className="space-y-0.5">
                                {items.map(sub => {
                                    const isSubActive = pathname.startsWith(sub.href);
                                    return (
                                        <button
                                            key={sub.href}
                                            onClick={() => { if (onClose) onClose(); navigate(sub.href); setIsHovered(false); }}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                                                isSubActive ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                            style={{ color: isSubActive ? "var(--nav-active-color)" : "var(--sidebar-foreground)" }}
                                        >
                                            <span className="truncate">{sub.label}</span>
                                            {sub.badge && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                    {sub.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                )}
            </AnimatePresence>
        </div>
    );
}

// Reusable single navigation item with Framer Motion hover states
function NavItem({
    item,
    collapsed,
    pathname,
    onClick,
}: {
    item: { label: string; icon: any; href: string; badge?: string };
    collapsed: boolean;
    pathname: string;
    onClick?: (e: React.MouseEvent) => void;
}) {
    // For the main Dashboard link, use exact match to avoid highlighting it on all sub-pages.
    const isActive = item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
        >
            <Link
                href={item.href}
                prefetch={false}
                onClick={onClick}
                className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                    isActive
                        ? ""
                        : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                )}
                style={isActive ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" } : { color: "var(--sidebar-foreground)" }}
            >
                {isActive && (
                    <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 rounded-full"
                        style={{ background: "var(--nav-active-border)" }}
                    />
                )}

                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                )}>
                    <item.icon className={cn(
                        "w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "" : "text-neutral-600 dark:text-neutral-400"
                    )} style={isActive ? { color: "var(--nav-active-color)" } : undefined} />
                </div>

                <AnimatePresence mode="wait">
                    {!collapsed ? (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 flex items-center justify-between min-w-0"
                        >
                            <span className="truncate font-medium">{item.label}</span>
                            {item.badge && (
                                <motion.span
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={cn(
                                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                        item.badge === "New" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
                                            item.badge === "Live" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
                                                item.badge === "Premium" ? "" :
                                                    "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                    )}
                                    style={item.badge === "Premium" ? { background: "var(--brand-gradient-soft)", color: "var(--nav-active-color)" } : undefined}
                                >
                                    {item.badge}
                                </motion.span>
                            )}
                        </motion.div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="absolute inset-0 z-10" />
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10} className="bg-neutral-900 text-white border-none font-bold">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    );
}