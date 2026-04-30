"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDomains, createDomain, updateDomain, deleteDomain, Domain } from "@/store/slices/domainsSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-14 pl-6 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
        </div>
    </div>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-all cursor-pointer",
            checked ? "bg-slate-900 dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-800"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

export default function CustomDomainPage() {
    const dispatch = useAppDispatch();
    const { domains, isLoading } = useAppSelector(state => state.domains);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
    const [formData, setFormData] = useState({
        domain: "",
        custom_index_url: "",
        custom_not_found_url: "",
        is_enabled: true
    });

    useEffect(() => {
        dispatch(fetchDomains());
    }, [dispatch]);

    const handleOpenModal = (domain?: Domain) => {
        if (domain) {
            setEditingDomain(domain);
            setFormData({
                domain: domain.domain || "",
                custom_index_url: domain.custom_index_url || "",
                custom_not_found_url: domain.custom_not_found_url || "",
                is_enabled: domain.is_enabled === 1
            });
        } else {
            setEditingDomain(null);
            setFormData({
                domain: "",
                custom_index_url: "",
                custom_not_found_url: "",
                is_enabled: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const payload = {
            domain: formData.domain,
            custom_index_url: formData.custom_index_url,
            custom_not_found_url: formData.custom_not_found_url,
            is_enabled: formData.is_enabled ? 1 : 0
        };

        if (editingDomain) {
            await dispatch(updateDomain({ domainId: editingDomain.domain_id || (editingDomain as any).id, data: payload }));
        } else {
            await dispatch(createDomain(payload));
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this custom domain?")) {
            await dispatch(deleteDomain(id));
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-5xl mx-auto space-y-8 relative z-10 p-6 md:p-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Globe size={24} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                Bio Link Studio
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                Custom Domains
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl">
                                Manage your branded domains for your Bio Links.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="h-14 px-8 rounded-2xl bg-primary text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                        Add Domain
                    </button>
                </motion.div>

                <div className="min-h-[400px]">
                    {isLoading && domains.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest">Loading Domains...</p>
                        </div>
                    ) : domains.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-[3rem] border-2 border-dashed border-[var(--border)]"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <Globe size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Custom Domains</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                You haven't added any custom domains yet. Connect a domain to white-label your bio links.
                            </p>
                            <button onClick={() => handleOpenModal()} className="rounded-2xl h-12 px-8 bg-primary text-white font-black uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Domain
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid gap-4">
                            {domains.map((d: any) => (
                                <div key={d.domain_id || d.id} className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-xl transition-shadow">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">
                                                {d.domain}
                                            </h3>
                                            {d.is_enabled === 1 ? (
                                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 text-sm text-slate-500">
                                            <p className="flex items-center gap-2">
                                                <LinkIcon size={14} /> Index: {d.custom_index_url || "N/A"}
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <LinkIcon size={14} /> 404: {d.custom_not_found_url || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleOpenModal(d)} className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(d.domain_id || d.id)} className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ModalShell 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editingDomain ? "Edit Domain" : "Add Domain"}
                icon={<Globe size={20} />}
                footer={
                    <div className="flex gap-4">
                        <button onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={!formData.domain}
                            className="flex-[1.5] h-14 px-8 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Save size={18} />
                            Save Domain
                        </button>
                    </div>
                }
            >
                <div className="space-y-6 py-2">
                    <InputField
                        label="Domain Name"
                        placeholder="e.g., links.mybrand.com"
                        value={formData.domain}
                        onChange={(e: any) => setFormData({ ...formData, domain: e.target.value })}
                    />
                    <InputField
                        label="Custom Index URL (Optional)"
                        placeholder="https://example.com"
                        value={formData.custom_index_url}
                        onChange={(e: any) => setFormData({ ...formData, custom_index_url: e.target.value })}
                    />
                    <InputField
                        label="Custom 404 URL (Optional)"
                        placeholder="https://example.com/404"
                        value={formData.custom_not_found_url}
                        onChange={(e: any) => setFormData({ ...formData, custom_not_found_url: e.target.value })}
                    />
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Enable Domain</p>
                            <p className="text-xs text-slate-500">Toggle domain visibility</p>
                        </div>
                        <ToggleSwitch
                            checked={formData.is_enabled}
                            onChange={(val) => setFormData({ ...formData, is_enabled: val })}
                        />
                    </div>
                </div>
            </ModalShell>
        </div>
    );
}
