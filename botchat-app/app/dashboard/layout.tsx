"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Close mobile sidebar on route change / resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileSidebarOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>

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
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Topbar
                    onMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    collapsed={sidebarCollapsed}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    mobileSidebarOpen={mobileSidebarOpen}
                />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
