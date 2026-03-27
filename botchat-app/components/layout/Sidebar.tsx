"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ChevronDown, ChevronRight, LayoutDashboard, Inbox, Zap, GitBranch,
    Instagram, Facebook, MessageSquare, BarChart3, Users, Target,
    Settings, CreditCard, Plus, LogOut, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import {
    Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    onClose?: () => void;
}

const mainNav = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Inbox", icon: Inbox, href: "/dashboard/inbox", badge: "12" },
    { label: "Automations", icon: Zap, href: "/dashboard/automations" },
    { label: "Flow Builder", icon: GitBranch, href: "/dashboard/flows", badge: "New" },
];

const growthNav = [
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Contacts", icon: Users, href: "/dashboard/contacts" },
    { label: "Campaigns", icon: Target, href: "/dashboard/campaigns" },
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

    useEffect(() => {
        setMounted(true);
        if (pathname.startsWith("/dashboard/facebook")) {
            setFacebookOpen(true);
        }
        if (pathname.startsWith("/dashboard/instagram")) {
            setInstagramOpen(true);
        }
    }, [pathname]);

    const isSuperAdmin = useMemo(() => {
        if (!mounted || !user) return false;
        const role = (user.role || user.type || "").toLowerCase();
        return role.includes("super_admin") || role.includes("admin");
    }, [user, mounted]);

    const { showModal } = useModal();

    const isFacebookActive = pathname.startsWith("/dashboard/facebook");
    const isInstagramActive = pathname.startsWith("/dashboard/instagram");

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
        <>
            <motion.aside
                initial={false}
                animate={collapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className="h-full flex flex-col bg-white dark:bg-neutral-950 border-r border-neutral-200/70 dark:border-neutral-800/70 transition-colors"
            >
                {/* Logo / Brand */}
                <div className="h-16 flex items-center px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <motion.div 
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-sm flex-shrink-0"
                        >
                            <MessageSquare className="w-4 h-4 text-white" />
                        </motion.div>
                        <AnimatePresence mode="wait">
                            {!collapsed && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-semibold text-lg tracking-tight text-neutral-900 dark:text-white"
                                >
                                    BotChat
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* New Automation Button */}
                <div className="p-3 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                            collapsed
                                ? "bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-950/50"
                                : "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/10 hover:brightness-105"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                >
                                    New Automation
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
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
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Main
                                </span>
                            </motion.div>
                        )}
                        {mainNav.map(item => (
                            <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} onClose={onClose} />
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
                                <span className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
                                    Platforms
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={handleInstagramConnect}
                                    className="text-xs font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Connect
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Instagram Accordion */}
                        <div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setInstagramOpen(prev => !prev);
                                    if (!instagramOpen && !isInstagramActive) {
                                        router.push("/dashboard/instagram");
                                    }
                                }}
                                className={cn(
                                    "group relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    isInstagramActive
                                        ? "bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-medium shadow-sm"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        isInstagramActive ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                                    )}>
                                        <Instagram className={cn(
                                            "w-4.5 h-4.5",
                                            isInstagramActive ? "text-pink-600 dark:text-pink-400" : "text-neutral-600 dark:text-neutral-400"
                                        )} />
                                    </div>
                                    {!collapsed && <span className="font-medium">Instagram</span>}
                                </div>

                                {!collapsed && (
                                    <motion.div
                                        animate={{ rotate: instagramOpen ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                    </motion.div>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {instagramOpen && !collapsed && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-1 space-y-0.5 pl-11 pr-3 py-1">
                                            {[
                                                { label: "Connect Account", href: "/dashboard/instagram" },
                                                { label: "Bot Replies", href: "/dashboard/instagram/bot-replies" },
                                                { label: "Comment Manager", href: "/dashboard/instagram/comment-manager", badge: "Live" },
                                                { label: "Bio Link (Portfolio)", href: "/dashboard/instagram/bio-link", badge: "Premium" },
                                            ].map(sub => {
                                                const isActive = sub.href === "/dashboard/instagram" ? pathname === "/dashboard/instagram" : pathname.startsWith(sub.href);
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        onClick={onClose}
                                                        className={cn(
                                                            "group relative flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                                            isActive
                                                                ? "text-pink-700 dark:text-pink-300 bg-pink-50/60 dark:bg-pink-950/30"
                                                                : "text-neutral-600 dark:text-neutral-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                                                        )}
                                                    >
                                                        <div className="absolute left-0 w-1 h-1 rounded-full bg-pink-400/60 group-hover:bg-pink-500 transition-colors" />
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
                        </div>
 
                        {/* Facebook Accordion */}
                        <div>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setFacebookOpen(prev => !prev);
                                    if (!facebookOpen && !isFacebookActive) {
                                        router.push("/dashboard/facebook");
                                    }
                                }}
                                className={cn(
                                    "group relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    isFacebookActive
                                        ? "bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 font-medium shadow-sm"
                                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                        isFacebookActive ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                                    )}>
                                        <Facebook className={cn(
                                            "w-4.5 h-4.5",
                                            isFacebookActive ? "text-pink-600 dark:text-pink-400" : "text-neutral-600 dark:text-neutral-400"
                                        )} />
                                    </div>
                                    {!collapsed && <span className="font-medium">Facebook</span>}
                                </div>
 
                                {!collapsed && (
                                    <motion.div
                                        animate={{ rotate: facebookOpen ? 180 : 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                                    </motion.div>
                                )}
                            </motion.button>
 
                            {/* Submenu – with smooth accordion animation */}
                            <AnimatePresence>
                                {facebookOpen && !collapsed && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-1 space-y-0.5 pl-11 pr-3 py-1">
                                            {[
                                                { label: "Connect Account", href: "/dashboard/facebook" },
                                                { label: "Bot Replies", href: "/dashboard/facebook/bot-replies" },
                                                { label: "Comment Manager", href: "/dashboard/facebook/comment-manager", badge: "Live" },
                                            ].map(sub => {
                                                const isActive = sub.href === "/dashboard/facebook" ? pathname === "/dashboard/facebook" : pathname.startsWith(sub.href);
                                                return (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        onClick={onClose}
                                                        className={cn(
                                                            "group relative flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                                            isActive
                                                                ? "text-pink-700 dark:text-pink-300 bg-pink-50/60 dark:bg-pink-950/30"
                                                                : "text-neutral-600 dark:text-neutral-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                                                        )}
                                                    >
                                                        <div className="absolute left-0 w-1 h-1 rounded-full bg-pink-400/60 group-hover:bg-pink-500 transition-colors" />
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
                        </div>
                    </motion.div>

                    {/* GROWTH */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 pb-1.5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Growth
                                </span>
                            </motion.div>
                        )}
                        {growthNav.map(item => (
                            <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} onClose={onClose} />
                        ))}
                    </motion.div>

                    {/* ADMIN */}
                    {isSuperAdmin && (
                        <motion.div variants={itemVariants} className="space-y-0.5">
                            {!collapsed && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-3 pb-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                        Administration
                                    </span>
                                </motion.div>
                            )}
                            {adminNav.map(item => (
                                <NavItem key={item.href} item={item} collapsed={collapsed} pathname={pathname} onClose={onClose} />
                            ))}
                        </motion.div>
                    )}
                </motion.nav>

                {/* Bottom User Section */}
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 overflow-hidden flex-shrink-0">
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
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0"
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
                                        <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                                            {user?.name || "User"}
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                            {user?.email || "Pro"}
                                        </div>
                                    </div>
                                    <LogOut className="w-4 h-4 text-neutral-400 hover:text-rose-500 transition-colors" />
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
                        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
                            <LogOut className="w-9 h-9 text-rose-500" />
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
                            className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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
        </>
    );
}

// Reusable single navigation item with Framer Motion hover states
function NavItem({
    item,
    collapsed,
    pathname,
    onClose,
}: {
    item: { label: string; icon: any; href: string; badge?: string };
    collapsed: boolean;
    pathname: string;
    onClose?: () => void;
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
                onClick={onClose}
                className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                    isActive
                        ? "bg-pink-50/70 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                )}
            >
                {isActive && (
                    <motion.div 
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 bg-pink-500 rounded-full"
                    />
                )}
                
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive ? "bg-white dark:bg-neutral-900 shadow-sm" : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                )}>
                    <item.icon className={cn(
                        "w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110",
                        isActive ? "text-pink-600 dark:text-pink-400" : "text-neutral-600 dark:text-neutral-400"
                    )} />
                </div>

                <AnimatePresence mode="wait">
                    {!collapsed && (
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
                                                item.badge === "Premium" ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300" :
                                                    "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                                    )}
                                >
                                    {item.badge}
                                </motion.span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    );
}