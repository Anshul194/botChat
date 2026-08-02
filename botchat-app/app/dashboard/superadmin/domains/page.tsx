"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, XCircle, Search, AlertCircle, Eye, X, ExternalLink, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSuperAdminDomainRequests, approveDomainRequest, rejectDomainRequest, clearSuperAdminDomainsError } from "@/store/slices/superadminDomainsSlice";
import { toast } from "sonner";

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 28 } },
};

export default function SuperAdminDomainsPage() {
    const dispatch = useAppDispatch();
    const { requests, isLoading, isApproving, isRejecting } = useAppSelector((s) => s.superadminDomains);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Rejection Modal State
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [suggestedFix, setSuggestedFix] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Details Modal State
    const [viewingId, setViewingId] = useState<number | null>(null);

    const viewingRequest = viewingId ? requests.find(r => r.id === viewingId) : null;

    useEffect(() => {
        dispatch(fetchSuperAdminDomainRequests());
    }, [dispatch]);

    // Lock body scroll when any modal is open
    useEffect(() => {
        const isOpen = !!viewingRequest || !!rejectingId;
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [viewingRequest, rejectingId]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearSuperAdminDomainsError());
        };
    }, [dispatch]);

    const filteredRequests = requests.filter(req => {
        const matchSearch = req.domain_name.toLowerCase().includes(search.toLowerCase()) || 
                            req.actual_domain_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "all" ? true : req.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this domain? This will provision an SSL certificate and configure routing.")) return;
        try {
            await dispatch(approveDomainRequest(id)).unwrap();
            toast.success("Domain approved successfully. SSL certificate generation started.");
        } catch (error: any) {
            toast.error(error || "Failed to approve domain");
        }
    };

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingId || !rejectReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }
        setIsSubmitting(true);
        try {
            await dispatch(rejectDomainRequest({ 
                id: rejectingId, 
                reason: rejectReason.trim(), 
                suggested_fix: suggestedFix.trim() || undefined
            })).unwrap();
            setRejectingId(null);
            setRejectReason("");
            setSuggestedFix("");
            toast.success("Domain request rejected successfully.");
        } catch (error: any) {
            toast.error(error || "Failed to reject domain");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 space-y-8 pb-32 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl" style={{ background: "var(--brand-gradient)", color: "white" }}>
                            <Globe className="w-6 h-6" />
                        </div>
                        Custom Domains
                    </h1>
                    <p style={{ color: "var(--muted-foreground)" }}>
                        Manage tenant domain mapping requests
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        type="text"
                        placeholder="Search domains..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium outline-none transition-all focus:ring-2 focus:ring-[var(--primary)]/20"
                        style={{
                            background: "var(--card)",
                            borderColor: "var(--input)",
                            color: "var(--foreground)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                        }}
                    />
                </div>
                
                <div className="flex bg-[var(--card)] p-1 rounded-xl border border-[var(--border)]">
                    {[
                        { id: "all", label: "All" },
                        { id: "0", label: "Pending" },
                        { id: "1", label: "Approved" },
                        { id: "2", label: "Rejected" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                                statusFilter === tab.id
                                    ? "bg-[var(--background)] shadow-sm text-[var(--foreground)]"
                                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-4 border-[var(--muted-foreground)] border-t-[var(--primary)] animate-spin"></div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-[var(--card)] border border-[var(--border)] rounded-2xl">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-1">No requests found</h3>
                    <p style={{ color: "var(--muted-foreground)" }}>
                        {search || statusFilter !== "all" ? "Try adjusting your filters" : "No domain change requests yet"}
                    </p>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
                    {filteredRequests.map(req => (
                        <motion.div key={req.id} variants={itemVariants} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 hover:shadow-lg transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            {req.domain_name}
                                            <a href={`https://${req.domain_name}`} target="_blank" rel="noreferrer" className="text-[var(--muted-foreground)] hover:text-[var(--primary)]">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </h3>
                                        {req.status === "0" && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>}
                                        {req.status === "1" && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approved</span>}
                                        {req.status === "2" && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>}
                                    </div>
                                    <div className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                                        Target: {req.actual_domain_name}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setViewingId(req.id)}
                                        className="px-3 py-2 rounded-xl text-sm font-semibold border hover:bg-[var(--background)] transition-colors"
                                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    {req.status === "0" && (
                                        <>
                                            <button 
                                                onClick={() => setRejectingId(req.id)}
                                                disabled={isRejecting === req.id}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/50 transition-colors disabled:opacity-50"
                                                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                                            >
                                                {isRejecting === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(req.id)}
                                                disabled={isApproving === req.id}
                                                className="px-4 py-2 rounded-xl text-sm font-semibold transition-transform active:scale-95 disabled:opacity-50"
                                                style={{ background: "var(--brand-gradient)", color: "white" }}
                                            >
                                                {isApproving === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {req.status === "2" && req.rejection_reason && (
                                <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <div className="font-semibold text-rose-500 mb-1 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Rejection Reason
                                    </div>
                                    <p className="text-sm text-rose-400">{req.rejection_reason}</p>
                                    {req.suggested_fix && (
                                        <div className="mt-2 text-sm">
                                            <span className="font-semibold text-rose-500">Suggested Fix:</span> <span className="text-rose-400">{req.suggested_fix}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Details Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setViewingId(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="relative w-full max-w-lg shadow-2xl border border-[var(--border)] rounded-2xl flex flex-col"
                        style={{ background: "var(--background)", maxHeight: "85vh" }}
                    >
                        {/* Sticky Header */}
                        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center rounded-t-2xl flex-shrink-0" style={{ background: "var(--card)" }}>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Globe className="w-5 h-5" /> Domain Request Details
                            </h3>
                            <button onClick={() => setViewingId(null)} className="p-2 rounded-full hover:bg-[var(--background)] transition-colors">
                                <X className="w-4 h-4 text-[var(--muted-foreground)]" />
                            </button>
                        </div>
                        {/* Scrollable Body */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-5">
                            <div className="flex flex-col gap-1 pb-4 border-b border-[var(--border)]">
                                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Requested Domain</label>
                                <p className="font-bold text-xl text-[var(--foreground)]">{viewingRequest.domain_name}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Status</label>
                                    <div className="mt-0.5">
                                        {viewingRequest.status === "0" && <span className="text-amber-500 font-semibold flex items-center gap-1.5"><Clock className="w-4 h-4" /> Pending</span>}
                                        {viewingRequest.status === "1" && <span className="text-emerald-500 font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Approved</span>}
                                        {viewingRequest.status === "2" && <span className="text-rose-500 font-semibold flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Rejected</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Submitted</label>
                                    <p className="font-medium text-[var(--foreground)] mt-0.5">{new Date(viewingRequest.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Target Address</label>
                                    <p className="font-medium text-[var(--foreground)] mt-0.5 break-all">{viewingRequest.actual_domain_name || "N/A"}</p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Tenant</label>
                                    <div className="mt-0.5">
                                        <p className="font-semibold text-[var(--foreground)]">{viewingRequest.name || "—"}</p>
                                        {viewingRequest.email && <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{viewingRequest.email}</p>}
                                        <p className="text-xs opacity-50 mt-0.5">ID: {viewingRequest.tenant_id}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {viewingRequest.rejection_reason && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <label className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-1.5 block">Rejection Reason</label>
                                    <p className="text-sm text-rose-600 dark:text-rose-400 leading-relaxed">{viewingRequest.rejection_reason}</p>
                                </div>
                            )}
                            {viewingRequest.suggested_fix && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <label className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-1.5 block">Suggested Fix</label>
                                    <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">{viewingRequest.suggested_fix}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setRejectingId(null)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        className="relative w-full max-w-md shadow-2xl border border-[var(--border)] rounded-2xl"
                        style={{ background: "var(--background)" }}
                    >
                        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center rounded-t-2xl" style={{ background: "var(--card)" }}>
                            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-500">
                                <XCircle className="w-5 h-5" /> Reject Domain
                            </h3>
                            {!isSubmitting && (
                                <button onClick={() => setRejectingId(null)} className="p-2 rounded-full hover:bg-[var(--background)] transition-colors">
                                    <X className="w-4 h-4 text-[var(--muted-foreground)]" />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleReject} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Rejection Reason <span className="text-rose-500">*</span></label>
                                <textarea
                                    required
                                    rows={3}
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Explain why this domain request is being rejected..."
                                    className="w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm resize-none"
                                    style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--foreground)" }}>Suggested Fix <span className="opacity-50 font-normal text-xs ml-1">(Optional)</span></label>
                                <textarea
                                    rows={2}
                                    value={suggestedFix}
                                    onChange={e => setSuggestedFix(e.target.value)}
                                    placeholder="e.g. Try using a subdomain instead, verify DNS records..."
                                    className="w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 transition-all text-sm resize-none"
                                    style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                                <button
                                    type="button"
                                    onClick={() => setRejectingId(null)}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
                                    style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--foreground)" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !rejectReason.trim()}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 justify-center min-w-[140px]"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
