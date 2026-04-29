"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const pathname = usePathname();
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
