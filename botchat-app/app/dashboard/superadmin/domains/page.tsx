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

    useEffect(() => {
        dispatch(fetchSuperAdminDomainRequests());
    }, [dispatch]);

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

    const viewingRequest = viewingId ? requests.find(r => r.id === viewingId) : null;

    return (
        <div className="p-4 sm:p-8 space-y-8 pb-32 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium outline-none transition-all focus:ring-2 focus:ring-opacity-20"
                        style={{
                            background: "var(--input-bg)",
                            borderColor: "var(--input-border)",
                            color: "var(--foreground)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                        }}
                    />
                </div>
                
                <div className="flex bg-[var(--surface-color)] p-1 rounded-xl border border-[var(--border-color)]">
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
                                    ? "bg-[var(--background-color)] shadow-sm text-[var(--foreground)]"
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
                    <div className="w-8 h-8 rounded-full border-4 border-[var(--muted-foreground)] border-t-[var(--brand-primary)] animate-spin"></div>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-20 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-1">No requests found</h3>
                    <p style={{ color: "var(--muted-foreground)" }}>
                        {search || statusFilter !== "all" ? "Try adjusting your filters" : "No domain change requests yet"}
                    </p>
                </div>
            ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4">
                    {filteredRequests.map(req => (
                        <motion.div key={req.id} variants={itemVariants} className="bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl p-5 hover:shadow-lg transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            {req.domain_name}
                                            <a href={`https://${req.domain_name}`} target="_blank" rel="noreferrer" className="text-[var(--muted-foreground)] hover:text-brand-primary">
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
                                        className="px-3 py-2 rounded-xl text-sm font-semibold border hover:bg-[var(--background-color)] transition-colors"
                                        style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
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
                                                style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingId(null)}></div>
                    <div className="relative bg-[var(--background-color)] rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--border-color)] overflow-hidden max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-color)]">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Globe className="w-5 h-5" /> Domain Request Details
                            </h3>
                            <button onClick={() => setViewingId(null)} className="p-2 rounded-full hover:bg-[var(--background-color)]">
                                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase opacity-60">Requested Domain</label>
                                    <p className="font-bold text-lg">{viewingRequest.domain_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase opacity-60">Current Domain</label>
                                    <p className="font-medium">{viewingRequest.actual_domain_name}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase opacity-60">Status</label>
                                    <p className="font-medium">
                                        {viewingRequest.status === "0" && <span className="text-amber-500">Pending</span>}
                                        {viewingRequest.status === "1" && <span className="text-emerald-500">Approved</span>}
                                        {viewingRequest.status === "2" && <span className="text-rose-500">Rejected</span>}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold uppercase opacity-60">Submitted</label>
                                    <p className="font-medium">{new Date(viewingRequest.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase opacity-60">Tenant ID</label>
                                    <p className="font-medium">{viewingRequest.tenant_id}</p>
                                </div>
                            </div>
                            {viewingRequest.rejection_reason && (
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                    <label className="text-xs font-semibold uppercase text-rose-500">Rejection Reason</label>
                                    <p className="text-sm">{viewingRequest.rejection_reason}</p>
                                </div>
                            )}
                            {viewingRequest.suggested_fix && (
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <label className="text-xs font-semibold uppercase text-amber-500">Suggested Fix</label>
                                    <p className="text-sm">{viewingRequest.suggested_fix}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setRejectingId(null)}></div>
                    <div className="relative bg-[var(--background-color)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--border-color)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--surface-color)]">
                            <h3 className="text-xl font-bold flex items-center gap-2 text-rose-500">
                                <XCircle className="w-6 h-6" /> Reject Domain
                            </h3>
                            {!isSubmitting && (
                                <button onClick={() => setRejectingId(null)} className="p-2 rounded-full hover:bg-[var(--background-color)]">
                                    <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleReject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Rejection Reason *</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Explain why this domain request is being rejected..."
                                    className="w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Suggested Fix (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={suggestedFix}
                                    onChange={e => setSuggestedFix(e.target.value)}
                                    placeholder="e.g. Try using a subdomain instead, verify DNS records..."
                                    className="w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                                    style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--foreground)" }}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRejectingId(null)}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--surface-color)] border border-[var(--border-color)] hover:opacity-80 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !rejectReason.trim()}
                                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
                                    {isSubmitting ? "Rejecting..." : "Confirm Rejection"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
