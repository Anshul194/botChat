"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPlans, fetchMyPlan } from "@/store/slices/plansSlice";
import VerificationBanner from "@/components/VerificationBanner";
import PlanExpiredBanner from "@/components/subscription/PlanExpiredBanner";
import BillingWarningBanner from "@/components/subscription/BillingWarningBanner";
import RenewalPopup from "@/components/subscription/RenewalPopup";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import { OnboardingTourProvider } from "@/components/onboarding/OnboardingTour";

const EXPIRED_ALLOWED_PATHS = ["/dashboard/billing", "/dashboard/profile"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated, isInitialized, user } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { canAccess, loading: subscriptionLoading, isExpired, expired, isSuperAdmin } = usePlanFeature();

    const routeFeature = getRouteFeature(pathname);

    useEffect(() => {
        if (isInitialized && isAuthenticated) {
            dispatch(fetchPlans());
            dispatch(fetchMyPlan());
        }
    }, [dispatch, isAuthenticated, isInitialized]);

    // Protection logic
    useEffect(() => {
        // Only redirect if initialization is complete and not authenticated
        if (isInitialized && !isAuthenticated) {
            router.push("/auth/sign-in");
        }
    }, [isAuthenticated, isInitialized, router]);

    useEffect(() => {
        if (isSuperAdmin) return;
        if (!isInitialized || !isAuthenticated || subscriptionLoading || !routeFeature) return;
        if (!canAccess(routeFeature)) router.replace("/dashboard/billing");
    }, [canAccess, isAuthenticated, isInitialized, routeFeature, router, subscriptionLoading, isSuperAdmin]);

    // Expired plan guard: redirect to billing unless on allowed paths
    useEffect(() => {
        if (isSuperAdmin) return;
        if (!isInitialized || !isAuthenticated || subscriptionLoading) return;
        if (!expired && !isExpired()) return;
        const isAllowed = EXPIRED_ALLOWED_PATHS.some((p) => pathname.startsWith(p));
        if (!isAllowed && pathname.startsWith("/dashboard")) {
            router.replace("/dashboard/billing");
        }
    }, [expired, isExpired, isAuthenticated, isInitialized, pathname, router, subscriptionLoading, isSuperAdmin]);

    // Handle global sidebar toggle events
    useEffect(() => {
        const handleToggle = () => setMobileSidebarOpen(prev => !prev);
        const handleClose = () => setMobileSidebarOpen(false);
        const handleOpen = () => setMobileSidebarOpen(true);
        const handleDesktopCollapse = () => setSidebarCollapsed(true);
        const handleDesktopExpand = () => setSidebarCollapsed(false);

        window.addEventListener("toggleMobileSidebar", handleToggle);
        window.addEventListener("closeMobileSidebar", handleClose);
        window.addEventListener("openMobileSidebar", handleOpen);
        window.addEventListener("collapseDesktopSidebar", handleDesktopCollapse);
        window.addEventListener("expandDesktopSidebar", handleDesktopExpand);

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("toggleMobileSidebar", handleToggle);
            window.removeEventListener("closeMobileSidebar", handleClose);
            window.removeEventListener("openMobileSidebar", handleOpen);
            window.removeEventListener("collapseDesktopSidebar", handleDesktopCollapse);
            window.removeEventListener("expandDesktopSidebar", handleDesktopExpand);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        // Theme and appearance are handled by ThemeProvider at the root layout level
    }, []);

    // Collapse sidebar on navigation
    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [pathname]);

    // Show loading state while initializing or while not authenticated
    if (!isInitialized || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (<OnboardingTourProvider>
        <>
            <div
                data-dashboard-theme="true"
                className="flex h-screen overflow-hidden"
                style={{
                    background: "var(--app-surface-bg, var(--background))",
                    fontFamily: "var(--app-font-family, inherit)",
                    fontSize: "var(--app-font-size, inherit)",
                    fontWeight: "var(--app-font-weight, inherit)",
                }}
            >

                {/* ── Mobile overlay backdrop ── */}
                {mobileSidebarOpen && (
                    <div
                        className="fixed inset-0 z-[55] md:hidden"
                        style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                        onClick={() => setMobileSidebarOpen(false)}
                    />
                )}

                {/* ── Sidebar: desktop always visible, mobile as drawer ── */}
                <div
                    className={[
                        "fixed inset-y-0 left-0 z-[60] md:relative md:flex md:z-auto",
                        "transition-transform duration-300 ease-in-out",
                        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    ].join(" ")}
                >
                    <Sidebar
                        collapsed={mobileSidebarOpen ? false : sidebarCollapsed}
                        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                        onClose={() => setMobileSidebarOpen(false)}
                    />
                </div>

                {/* ── Main area ─ topbar + page content ── */}
                <div className="flex flex-col flex-1 min-w-0 relative">
                    <Topbar
                        onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        collapsed={sidebarCollapsed}
                        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                        mobileSidebarOpen={mobileSidebarOpen}
                    />
                    <main className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
                        <VerificationBanner />
                        <PlanExpiredBanner />
                        <BillingWarningBanner />
                        {children}
                    </main>
                </div>
            </div>
            <RenewalPopup />
        </>
    </OnboardingTourProvider>);
}

function getRouteFeature(pathname: string): string | null {
    if (pathname.startsWith("/dashboard/billing")) return null;
    if (pathname.startsWith("/dashboard/broadcasts") || pathname.startsWith("/dashboard/broadcast-templates") || pathname.startsWith("/dashboard/content-library")) return "broadcast";
    if (pathname.startsWith("/dashboard/posts/studio")) return "social_posting";
    if (pathname.includes("/analytics") || pathname.startsWith("/dashboard/analytics")) return "analytics";
    if (pathname.includes("custom-domain")) return "domains";
    if (pathname.includes("pixels")) return "pixels";
    if (pathname.startsWith("/dashboard/inbox")) return "smart_inbox";
    if (pathname.startsWith("/dashboard/instagram/bio-links") || pathname.startsWith("/dashboard/instagram/bio-link")) return "bio_links";
    if (pathname.startsWith("/dashboard/shortened-links")) return "short_links";
    if (pathname.startsWith("/dashboard/vcard-links")) return "vcard";
    if (pathname.startsWith("/dashboard/ai-training")) return "bot_ai_agent";
    return null;
}

