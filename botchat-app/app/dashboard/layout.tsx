"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Protection logic
    useEffect(() => {
        // Only redirect if initialization is complete and not authenticated
        if (isInitialized && !isAuthenticated) {
            router.push("/auth/sign-in");
        }
    }, [isAuthenticated, isInitialized, router]);

    // Show loading state while initializing or while not authenticated
    if (!isInitialized || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0f1e]">
                <div className="w-10 h-10 border-4 border-[#FF2D78] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    const isAutomationPage = pathname?.includes("/dashboard/flows") || pathname?.includes("/bot-replies") || pathname?.includes("/comment-manager") || pathname?.includes("/dashboard/posts/studio");

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
        setSidebarCollapsed(true);
        setMobileSidebarOpen(false);
    }, [pathname]);

    return (
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
                    className="fixed inset-0 z-[190] md:hidden"
                    style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar: desktop always visible, mobile as drawer ── */}
            <div
                className={[
                    "fixed inset-y-0 left-0 z-[200] md:relative md:flex md:z-auto",
                    "transition-transform duration-300 ease-in-out",
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                ].join(" ")}
            >
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                    onClose={() => setMobileSidebarOpen(false)}
                />
            </div>

            {/* ── Main area ─ topbar + page content ── */}
            <div className="flex flex-col flex-1 min-w-0 relative">
                {!isAutomationPage && (
                    <Topbar
                        onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        collapsed={sidebarCollapsed}
                        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                        mobileSidebarOpen={mobileSidebarOpen}
                    />
                )}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
