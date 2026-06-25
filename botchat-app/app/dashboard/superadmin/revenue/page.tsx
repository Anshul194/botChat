"use client";

import { motion } from "framer-motion";
import RevenueCards from "@/components/superadmin/RevenueCards";
import RevenueOverviewChart from "@/components/superadmin/RevenueOverviewChart";
import RevenueByPlanChart from "@/components/superadmin/RevenueByPlanChart";
import PaymentAnalyticsChart from "@/components/superadmin/PaymentAnalyticsChart";
import ExpiringSoonAlert from "@/components/superadmin/ExpiringSoonAlert";
import TopTenantsTable from "@/components/superadmin/TopTenantsTable";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function RevenueDashboardPage() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-xl font-black" style={{ color: "var(--foreground)" }}>Revenue Center</h1>
                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                    Revenue analytics, payment metrics, and tenant insights
                </p>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={itemVariants}>
                <RevenueCards />
            </motion.div>

            {/* Revenue Overview + Revenue by Plan */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueOverviewChart />
                </div>
                <div>
                    <RevenueByPlanChart />
                </div>
            </motion.div>

            {/* Payment Analytics */}
            <motion.div variants={itemVariants}>
                <PaymentAnalyticsChart />
            </motion.div>

            {/* Expiring Soon + Top Tenants */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpiringSoonAlert />
                <TopTenantsTable />
            </motion.div>
        </motion.div>
    );
}
