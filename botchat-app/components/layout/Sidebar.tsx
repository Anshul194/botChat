"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ChevronDown,
    LayoutDashboard,
    MessagesSquare,
    Zap,
    GitBranch,
    Instagram,
    Facebook,
    Inbox,
    BarChart2,
    Users2,
    Target,
    Link2,
    Settings2,
    CreditCard,
    Plus,
    LogOut,
    Layers2,
    BookOpen,
    FileText,
    FolderOpen,
    PenLine,
    Globe2,
    Fingerprint,
    Unlink2,
    UserCog,
    Crown,
    ShieldCheck,
    Blocks,
    SendHorizonal,
    BrainCircuit,
    ImagePlus,
    Rss,
    QrCode,
    PlugZap,
    Cpu,
    Tag,
    LayoutGrid,
    TrendingUp,
    Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { usePlanFeature } from "@/hooks/usePlanFeature";
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
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        ariaLabel: "Go to Dashboard overview",
    },
];

const growthNav = [
    {
        label: "Social Posting",
        icon: ImagePlus,
        href: "/dashboard/posts/studio",
        badge: "Pro",
        ariaLabel: "Social media post studio",
        feature: "social_posting",
    },
    {
        label: "Broadcasts",
        icon: SendHorizonal,
        href: "/dashboard/broadcasts",
        ariaLabel: "Send broadcast messages",
        feature: "broadcast",
    },
    {
        label: "AI Training",
        icon: BrainCircuit,
        href: "/dashboard/ai-training",
        badge: "New",
        ariaLabel: "Train your AI assistant",
        feature: "bot_ai_agent",
    },
];

const workspaceNav = [
    {
        label: "Settings",
        icon: Settings2,
        href: "/dashboard/settings",
        ariaLabel: "Workspace settings",
    },
    {
        label: "Billing",
        icon: CreditCard,
        href: "/dashboard/billing",
        ariaLabel: "Billing and subscription",
    },
    {
        label: "Notifications",
        icon: Bell,
        href: "/dashboard/notifications",
        ariaLabel: "View notifications",
    },
];

const adminNav = [
    {
        label: "Revenue Center",
        icon: TrendingUp,
        href: "/dashboard/superadmin/revenue",
        ariaLabel: "Revenue analytics",
    },
    {
        label: "Subscriptions",
        icon: Crown,
        href: "/dashboard/superadmin/subscriptions",
        ariaLabel: "Manage tenant subscriptions",
    },
    {
        label: "Plan Management",
        icon: ShieldCheck,
        href: "/dashboard/plans",
        ariaLabel: "Manage subscription plans",
    },
    {
        label: "Modules",
        icon: Blocks,
        href: "/dashboard/modules",
        ariaLabel: "Manage system modules",
    },
];

export default function Sidebar({ collapsed, onToggle, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(s => s.auth);
    const { settings } = useTenantSettings();
    const { canAccess } = usePlanFeature();

    const [showLogout, setShowLogout] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [facebookOpen, setFacebookOpen] = useState(false);
    const [instagramOpen, setInstagramOpen] = useState(false);
    const [bioLinksOpen, setBioLinksOpen] = useState(false);
    const [blogOpen, setBlogOpen] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);

    const navigate = (href: string) => {
        setPendingRoute(href);
        try { window.dispatchEvent(new CustomEvent('nav:start', { detail: { href } })); } catch { }
        const fallback = setTimeout(() => {
            try {
                if (window.location.pathname !== href) window.location.href = href;
            } catch (e) { }
        }, 6000);
        try {
            router.push(href);
            clearTimeout(fallback);
        } catch (e) {
            clearTimeout(fallback);
        }
    };

    useEffect(() => {
        const current = pendingRoute || pathname || "";

        setFacebookOpen(current.startsWith("/dashboard/facebook"));

        setInstagramOpen(
            current.startsWith("/dashboard/instagram") &&
            !current.startsWith("/dashboard/instagram/bio-link") &&
            !current.startsWith("/dashboard/instagram/bio-links")
        );

        setBioLinksOpen(
            current.startsWith("/dashboard/instagram/bio-link") ||
            current.startsWith("/dashboard/instagram/bio-links")
        );

        if (current.startsWith("/dashboard/blog")) setBlogOpen(true);

        if (pendingRoute && pathname === pendingRoute) {
            setPendingRoute(null);
            try { window.dispatchEvent(new CustomEvent('nav:done')); } catch { }
        }
    }, [pathname, pendingRoute]);

    const isSuperAdmin = useMemo(() => {
        return user?.role === 'SUPER_ADMIN';
    }, [user]);

    const isTenantAdmin = useMemo(() => {
        return user?.role === 'ADMIN';
    }, [user]);

    const canManageUsers = useMemo(() => {
        return isSuperAdmin || isTenantAdmin;
    }, [isSuperAdmin, isTenantAdmin]);

    const canShow = (feature?: string) => !feature || isSuperAdmin || canAccess(feature);

    const visibleGrowthNav = useMemo(
        () => growthNav.filter(item => canShow(item.feature)),
        [isSuperAdmin, canAccess]
    );

    const bioLinkItems = useMemo(() => [
        { label: "Bio Link Manager", href: "/dashboard/instagram/bio-links", icon: LayoutGrid, badge: "Premium", ariaLabel: "Manage bio links", feature: "bio_links" },
        { label: "Shortened Links", href: "/dashboard/shortened-links", icon: Unlink2, badge: "Premium", ariaLabel: "Manage shortened URLs", feature: "short_links" },
        { label: "Vcard Links", href: "/dashboard/vcard-links", icon: QrCode, badge: "Premium", ariaLabel: "Manage vcard links", feature: "vcard" },
        { label: "Custom Domains", href: "/dashboard/instagram/bio-link/custom-domain", icon: Globe2, ariaLabel: "Manage custom domains", feature: "domains" },
        { label: "Tracking Pixels", href: "/dashboard/instagram/bio-link/pixels", icon: Fingerprint, ariaLabel: "Manage tracking pixels", feature: "pixels" },
    ].filter(item => canShow(item.feature)), [isSuperAdmin, canAccess]);

    const { showModal } = useModal();

    const currentPath = pendingRoute || pathname;
    const isBioLinksActive =
        currentPath.startsWith("/dashboard/instagram/bio-link") ||
        currentPath.startsWith("/dashboard/instagram/bio-links");
    const isInstagramActive =
        currentPath.startsWith("/dashboard/instagram") && !isBioLinksActive;

    const handleInstagramConnect = async () => {
        const width = 600, height = 750;
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
                        if (window.location.pathname.startsWith('/dashboard/instagram'))
                            window.location.reload();
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
        collapsed: { width: "4rem", transition: { type: "spring", stiffness: 300, damping: 30 } },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 },
    };

    return (
        <TooltipProvider delayDuration={0}>
            {/* nav landmark for SEO / accessibility */}
            <motion.aside
                role="navigation"
                aria-label="Main navigation"
                initial={false}
                animate={collapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className="h-full flex flex-col border-r transition-colors"
                style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
            >
                {/* Logo / Brand */}
                <div
                    className="h-16 flex items-center px-4 border-b flex-shrink-0"
                    style={{ borderColor: "var(--sidebar-border)" }}
                >
                    <Link
                        href="/dashboard"
                        aria-label={`${settings.appName} – go to dashboard`}
                        className="flex items-center gap-2.5"
                    >
                        <motion.div
                            whileHover={{ rotate: 12, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                            style={{ background: "var(--primary)" }}
                        >
                            {settings.logo ? (
                                <img src={settings.logo} alt={settings.appName} className="w-5 h-5 object-contain" />
                            ) : (
                                <MessagesSquare className="w-4 h-4 text-white" aria-hidden="true" />
                            )}
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
                                    {settings.appName}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>

                {/* Navigation */}
                <motion.nav
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    aria-label="Sidebar navigation"
                    className="flex-1 overflow-y-auto px-1.5 py-3 space-y-5 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700"
                >
                    {/* MAIN */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <SectionLabel label="Main" />
                        )}
                        {mainNav.map(item => (
                            <NavItem
                                key={item.href}
                                item={item}
                                collapsed={collapsed}
                                pathname={currentPath}
                                onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(item.href); }}
                            />
                        ))}
                    </motion.div>

                    {/* SOCIAL */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && <SectionLabel label="Social" />}
                        {canShow("smart_inbox") && (
                            <div data-tour="sidebar-inbox">
                                <NavItem
                                    item={{
                                        label: "Smart Inbox",
                                        icon: Inbox,
                                        href: "/social/smart-inbox",
                                        ariaLabel: "Open shared smart inbox",
                                    }}
                                    collapsed={collapsed}
                                    pathname={currentPath}
                                    onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate("/social/smart-inbox"); }}
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* PLATFORMS */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && (
                            <div className="px-3 pb-1.5 flex items-center justify-between">
                                <span
                                    className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: "var(--nav-active-color)" }}
                                >
                                    Platforms
                                </span>

                            </div>
                        )}

                        {/* Facebook */}
                        <div data-tour="sidebar-facebook">
                            <NavAccordion
                                label="Facebook"
                                icon={Facebook}
                                isOpen={facebookOpen}
                                onToggle={() => setFacebookOpen(!facebookOpen)}
                                collapsed={collapsed}
                                items={[
                                    { label: "Connect Account", href: "/dashboard/facebook", icon: PlugZap, ariaLabel: "Connect Facebook account" },
                                    { label: "Bot Replies", href: "/dashboard/facebook/bot-replies", icon: Cpu, ariaLabel: "Manage Facebook bot replies" },
                                    { label: "Comment Manager", href: "/dashboard/facebook/comment-manager", icon: MessagesSquare, ariaLabel: "Manage Facebook comments" },
                                ]}
                                pathname={currentPath}
                                navigate={navigate}
                                onClose={onClose}
                            />
                        </div>

                        {/* Instagram */}
                        <div data-tour="sidebar-instagram">
                            <NavAccordion
                                label="Instagram"
                                icon={Instagram}
                                isOpen={instagramOpen}
                                onToggle={() => setInstagramOpen(!instagramOpen)}
                                collapsed={collapsed}
                                items={[
                                    { label: "Connect Account", href: "/dashboard/instagram", icon: PlugZap, ariaLabel: "Connect Instagram account" },
                                    { label: "Bot Replies", href: "/dashboard/instagram/bot-replies", icon: Cpu, ariaLabel: "Manage Instagram bot replies" },
                                    { label: "Comment Manager", href: "/dashboard/instagram/comment-manager", icon: MessagesSquare, ariaLabel: "Manage Instagram comments" },
                                ]}
                                pathname={currentPath}
                                navigate={navigate}
                                onClose={onClose}
                            />
                        </div>

                        {/* Bio Links */}
                        {bioLinkItems.length > 0 && (
                            <div data-tour="sidebar-bio-links">
                                <NavAccordion
                                    label="Bio Links"
                                    icon={Link2}
                                    isOpen={bioLinksOpen}
                                    onToggle={() => setBioLinksOpen(!bioLinksOpen)}
                                    collapsed={collapsed}
                                    items={bioLinkItems}
                                    pathname={currentPath}
                                    navigate={navigate}
                                    onClose={onClose}
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* GROWTH */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && <SectionLabel label="Growth" />}
                        {visibleGrowthNav.map(item => {
                            const tourId = item.href === "/dashboard/broadcasts"
                                ? "sidebar-broadcasts"
                                : item.href === "/dashboard/ai-training"
                                    ? "sidebar-ai-training"
                                    : item.href === "/dashboard/posts/studio"
                                        ? "sidebar-posts"
                                        : undefined;
                            return (
                                <div key={item.href} data-tour={tourId}>
                                    <NavItem
                                        item={item}
                                        collapsed={collapsed}
                                        pathname={currentPath}
                                        onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(item.href); }}
                                    />
                                </div>
                            );
                        })}

                        {isSuperAdmin && (
                            <NavAccordion
                                label="Blog Manager"
                                icon={Rss}
                                isOpen={blogOpen}
                                onToggle={() => setBlogOpen(!blogOpen)}
                                collapsed={collapsed}
                                items={[
                                    { label: "All Blogs", href: "/dashboard/blog", icon: BookOpen, ariaLabel: "View all blog posts" },
                                    { label: "Categories", href: "/dashboard/blog/categories", icon: Tag, ariaLabel: "Manage blog categories" },
                                    { label: "Create Post", href: "/dashboard/blog/create", icon: PenLine, ariaLabel: "Create a new blog post" },
                                ]}
                                pathname={currentPath}
                                navigate={navigate}
                                onClose={onClose}
                            />
                        )}
                    </motion.div>

                    {/* TEAM */}
                    {canManageUsers && (
                        <motion.div variants={itemVariants} className="space-y-0.5">
                            {!collapsed && <SectionLabel label="Team" />}
                            <NavItem
                                item={{ label: "User Management", icon: UserCog, href: "/dashboard/users", ariaLabel: "Manage users" }}
                                collapsed={collapsed}
                                pathname={currentPath}
                                onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate("/dashboard/users"); }}
                            />
                            {isTenantAdmin && (
                                <NavItem
                                    item={{ label: "Plan Management", icon: ShieldCheck, href: "/dashboard/plans", ariaLabel: "Manage subscription plans" }}
                                    collapsed={collapsed}
                                    pathname={currentPath}
                                    onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate("/dashboard/plans"); }}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* WORKSPACE */}
                    <motion.div variants={itemVariants} className="space-y-0.5">
                        {!collapsed && <SectionLabel label="Workspace" />}
                        {workspaceNav.map(item => (
                            <div key={item.href} data-tour={item.href === "/dashboard/billing" ? "sidebar-billing" : undefined}>
                                <NavItem
                                    item={item}
                                    collapsed={collapsed}
                                    pathname={currentPath}
                                    onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(item.href); }}
                                />
                            </div>
                        ))}
                    </motion.div>

                    {/* ADMIN */}
                    {isSuperAdmin && (
                        <motion.div variants={itemVariants} className="space-y-0.5">
                            {!collapsed && (
                                <div className="px-3 pb-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] dark:text-[var(--foreground)]">
                                        Administration
                                    </span>
                                </div>
                            )}
                            {adminNav.map(item => (
                                <NavItem
                                    key={item.href}
                                    item={item}
                                    collapsed={collapsed}
                                    pathname={currentPath}
                                    onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(item.href); }}
                                />
                            ))}
                        </motion.div>
                    )}
                </motion.nav>

                {/* Bottom User Section */}
                <div
                    className="p-3 border-t overflow-hidden flex-shrink-0"
                    style={{ borderColor: "var(--sidebar-border)" }}
                >
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => !collapsed && setShowLogout(true)}
                        aria-label="Open logout menu"
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                            collapsed && "justify-center"
                        )}
                    >
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            aria-hidden="true"
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
                                    <LogOut
                                        className="w-4 h-4 transition-colors"
                                        aria-hidden="true"
                                        style={{ color: "var(--muted-foreground)" }}
                                    />
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
                        <div
                            className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: "var(--nav-active-bg)" }}
                        >
                            <LogOut className="w-9 h-9" style={{ color: "var(--nav-active-color)" }} aria-hidden="true" />
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

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-3 pb-1.5"
        >
            <span
                className="text-xs font-semibold uppercase tracking-wider opacity-80"
                style={{ color: "var(--sidebar-foreground)" }}
            >
                {label}
            </span>
        </motion.div>
    );
}

// ─── NavAccordion ─────────────────────────────────────────────────────────────
function NavAccordion({
    label,
    icon: Icon,
    isOpen,
    onToggle,
    collapsed,
    items,
    pathname,
    navigate,
    onClose,
}: {
    label: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    collapsed: boolean;
    items: { label: string; href: string; icon?: any; badge?: string; ariaLabel?: string }[];
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
                        if (onClose) onClose();
                        navigate(items[0].href);
                    } else {
                        onToggle();
                    }
                }}
                aria-expanded={!collapsed ? isOpen : undefined}
                aria-label={`${label} menu`}
                className={cn(
                    "group relative w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                        ? "font-medium shadow-sm"
                        : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                )}
                style={isActive
                    ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" }
                    : { color: "var(--sidebar-foreground)" }
                }
            >
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isActive
                            ? "bg-[var(--card)] dark:bg-neutral-900 shadow-sm"
                            : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                    )}>
                        <Icon
                            className={cn("w-4 h-4", !isActive && "text-neutral-600 dark:text-neutral-400")}
                            style={isActive ? { color: "var(--nav-active-color)" } : undefined}
                            aria-hidden="true"
                        />
                    </div>
                    {!collapsed && <span className="font-medium">{label}</span>}
                </div>

                {!collapsed && (
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <ChevronDown className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} aria-hidden="true" />
                    </motion.div>
                )}
            </motion.button>

            {/* Expanded submenu */}
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
                                const SubIcon = sub.icon;
                                const isSubActive =
                                    sub.href === "/dashboard/facebook" || sub.href === "/dashboard/instagram"
                                        ? pathname === sub.href
                                        : pathname.startsWith(sub.href);
                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        prefetch={false}
                                        aria-label={sub.ariaLabel || sub.label}
                                        aria-current={isSubActive ? "page" : undefined}
                                        onClick={(e) => { e.preventDefault(); if (onClose) onClose(); navigate(sub.href); }}
                                        className={cn(
                                            "group relative flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                                            isSubActive
                                                ? ""
                                                : "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40"
                                        )}
                                        style={isSubActive
                                            ? { color: "var(--nav-active-color)", background: "var(--nav-active-bg)" }
                                            : { color: "var(--sidebar-foreground)" }
                                        }
                                    >
                                        <div className="absolute left-0 w-1 h-1 rounded-full" style={{ background: "var(--nav-active-border)" }} aria-hidden="true" />
                                        {SubIcon && (
                                            <SubIcon
                                                className={cn(
                                                    "w-3.5 h-3.5 flex-shrink-0",
                                                    isSubActive ? "" : "text-neutral-400 dark:text-neutral-500"
                                                )}
                                                style={isSubActive ? { color: "var(--nav-active-color)" } : undefined}
                                                aria-hidden="true"
                                            />
                                        )}
                                        <span className="flex-1 truncate">{sub.label}</span>
                                        {sub.badge && <SubBadge badge={sub.badge} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed hover floating panel via Tooltip */}
            <AnimatePresence>
                {collapsed && (
                    <Tooltip open={isHovered} onOpenChange={setIsHovered}>
                        <TooltipTrigger asChild>
                            <div className="absolute inset-0 z-10" aria-hidden="true" />
                        </TooltipTrigger>
                        <TooltipContent
                            side="right"
                            sideOffset={10}
                            className="p-2 min-w-[200px] bg-[var(--card)] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl overflow-hidden"
                        >
                            <div className="px-3 py-2 mb-1 border-b border-neutral-100 dark:border-neutral-800">
                                <span className="text-xs font-black uppercase tracking-widest text-neutral-400">{label}</span>
                            </div>
                            <div className="space-y-0.5">
                                {items.map(sub => {
                                    const SubIcon = sub.icon;
                                    const isSubActive = pathname.startsWith(sub.href);
                                    return (
                                        <button
                                            key={sub.href}
                                            onClick={() => { if (onClose) onClose(); navigate(sub.href); setIsHovered(false); }}
                                            aria-label={sub.ariaLabel || sub.label}
                                            aria-current={isSubActive ? "page" : undefined}
                                            className={cn(
                                                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                                                isSubActive
                                                    ? "bg-neutral-100 dark:bg-neutral-800"
                                                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                            style={{ color: isSubActive ? "var(--nav-active-color)" : "var(--sidebar-foreground)" }}
                                        >
                                            <span className="flex items-center gap-2.5 truncate">
                                                {SubIcon && (
                                                    <SubIcon
                                                        className={cn(
                                                            "w-3.5 h-3.5 flex-shrink-0",
                                                            isSubActive ? "" : "text-neutral-400"
                                                        )}
                                                        style={isSubActive ? { color: "var(--nav-active-color)" } : undefined}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {sub.label}
                                            </span>
                                            {sub.badge && <SubBadge badge={sub.badge} />}
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

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({
    item,
    collapsed,
    pathname,
    onClick,
}: {
    item: { label: string; icon: any; href: string; badge?: string; ariaLabel?: string };
    collapsed: boolean;
    pathname: string;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const isActive =
        item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className="w-full">
            <Link
                href={item.href}
                prefetch={false}
                onClick={onClick}
                aria-label={item.ariaLabel || item.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                    isActive ? "" : "hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
                )}
                style={isActive
                    ? { background: "var(--nav-active-bg)", color: "var(--nav-active-color)" }
                    : { color: "var(--sidebar-foreground)" }
                }
            >
                {isActive && (
                    <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 rounded-full"
                        style={{ background: "var(--nav-active-border)" }}
                        aria-hidden="true"
                    />
                )}

                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive
                        ? "bg-[var(--card)] dark:bg-neutral-900 shadow-sm"
                        : "bg-neutral-100 dark:bg-neutral-800/60 group-hover:bg-neutral-200/70 dark:group-hover:bg-neutral-700/60"
                )}>
                    <item.icon
                        className={cn(
                            "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                            !isActive && "text-neutral-600 dark:text-neutral-400"
                        )}
                        style={isActive ? { color: "var(--nav-active-color)" } : undefined}
                        aria-hidden="true"
                    />
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
                            {item.badge && <SubBadge badge={item.badge} />}
                        </motion.div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="absolute inset-0 z-10" aria-hidden="true" />
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

// ─── SubBadge ─────────────────────────────────────────────────────────────────
function SubBadge({ badge }: { badge: string }) {
    return (
        <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex-shrink-0",
                badge === "New"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : badge === "Live"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : badge === "Premium"
                            ? ""
                            : "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
            )}
            style={badge === "Premium"
                ? { background: "var(--brand-gradient-soft)", color: "var(--nav-active-color)" }
                : undefined
            }
        >
            {badge}
        </motion.span>
    );
}
