"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import VerificationBanner from "@/components/VerificationBanner";
import PlanExpiredBanner from "@/components/subscription/PlanExpiredBanner";
import { usePlanFeature } from "@/hooks/usePlanFeature";
import { OnboardingTourProvider } from "@/components/onboarding/OnboardingTour";

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { canAccess, loading: subscriptionLoading } = usePlanFeature();

    // Protection logic
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push("/auth/sign-in");
        }
    }, [isAuthenticated, isInitialized, router]);

    useEffect(() => {
        if (!isInitialized || !isAuthenticated || subscriptionLoading) return;
        if (pathname.startsWith("/social/smart-inbox") && !canAccess("smart_inbox")) {
            router.replace("/dashboard/billing");
        }
    }, [canAccess, isAuthenticated, isInitialized, pathname, router, subscriptionLoading]);

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
            <div className="flex items-center justify-center min-h-screen bg-[#06030f]">
                <div className="w-10 h-10 border-4 border-[#1d6ef5] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (<OnboardingTourProvider>
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
            {/* Mobile overlay backdrop */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-[190] md:hidden"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar: desktop always visible, mobile as drawer */}
            <div
                className={[
                    "fixed inset-y-0 left-0 z-[200] md:relative md:flex md:z-auto",
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

            {/* Main area - topbar + page content */}
            <div className="flex flex-col flex-1 min-w-0 relative">
                <Topbar
                    onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    collapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileSidebarOpen={mobileSidebarOpen}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <VerificationBanner />
                    <PlanExpiredBanner />
                    {children}
                </main>
            </div>
        </div>
    </OnboardingTourProvider>);
}
