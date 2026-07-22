"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDomains, createDomain, updateDomain, deleteDomain, Domain } from "@/store/slices/domainsSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
    Globe,
    Plus,
    Trash2,
    Edit3,
    Save,
    Loader2,
    Link as LinkIcon,
    CheckCircle2,
    X,
    Zap,
    MoreVertical,
    Search,
    Copy,
    ExternalLink,
    BarChart2,
    LineChart,
    Grid
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-[var(--card)] dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl min-h-screen sm:min-h-0 overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center justify-center sm:hidden pt-2 pb-1">
                        <div className="w-10 h-1 rounded-full bg-[var(--muted)] dark:bg-slate-700" />
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-8 pt-2 sm:pt-8 pb-4 sm:pb-6 border-b border-[var(--border)] dark:border-[var(--border)]">
                        {icon && <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">{icon}</div>}
                        <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] dark:text-white flex-1 tracking-tight truncate">{title}</h2>
                        <button onClick={onClose} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80 transition-colors shrink-0">
                            <X size={16} className="sm:size-[18px]" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</div>
                    {footer && <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50 dark:bg-[var(--background)]">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-1.5 sm:space-y-2">
        <label className="text-[11px] font-black text-[var(--muted-foreground)]/70 dark:text-[var(--muted-foreground)] uppercase tracking-[0.2em] ml-2 block">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full h-12 sm:h-14 pl-4 sm:pl-6 pr-4 sm:pr-6 rounded-xl sm:rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--background)] border-2 border-transparent focus:border-[var(--border)]/70 dark:focus:border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--foreground)] dark:text-white outline-none transition-all placeholder:text-[var(--muted-foreground)]/50 dark:placeholder:text-[var(--muted-foreground)]"
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
            checked ? "bg-[var(--background)] dark:bg-slate-700" : "bg-[var(--muted)]/70 dark:bg-[var(--muted)]"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-[var(--card)] shadow transition-all",
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
    const [search, setSearch] = useState("");
    const [view, setView] = useState<'row' | 'card'>('row');

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

        try {
            if (editingDomain) {
                await dispatch(updateDomain({ domainId: editingDomain.domain_id || (editingDomain as any).id, data: payload })).unwrap();
            } else {
                await dispatch(createDomain(payload)).unwrap();
            }
            dispatch(fetchDomains());
            setIsModalOpen(false);
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this custom domain?")) {
            await dispatch(deleteDomain(id)).unwrap();
            dispatch(fetchDomains());
        }
    };

    const filtered = domains.filter((d: any) =>
        d.domain?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-primary/30 relative overflow-hidden">
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-full space-y-6 sm:space-y-8 relative z-10 p-4 sm:p-6 md:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6"
                >
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Zap size={20} className="sm:size-6" />
                            </div>
                            <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                                Domain Studio
                            </div>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1">
                            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[var(--foreground)] dark:text-white">
                                Custom Domains
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl text-xs sm:text-sm md:text-base">
                                Manage your branded domains for your Bio Links to ensure a consistent brand experience.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="h-12 sm:h-14 w-full lg:w-auto px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white text-[11px] sm:text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <Plus size={16} className="sm:size-[18px] group-hover:rotate-90 transition-transform duration-500" />
                        Add Domain
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 sm:h-16 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl px-4 sm:px-6 py-3 sm:py-0 shadow-sm"
                >
                    <div className="flex items-center gap-3 w-full sm:flex-1">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--muted-foreground)] group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search your domains..."
                                className="w-full pl-9 sm:pl-10 h-9 sm:h-10 bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center bg-[var(--background)] border border-[var(--border)] rounded-lg sm:rounded-xl p-0.5 sm:p-1 h-8 sm:h-10">
                            <button onClick={() => setView('row')} className={cn("px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1.5 sm:gap-2", view === 'row' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
                                <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-90" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">List</span>
                            </button>
                            <button onClick={() => setView('card')} className={cn("px-3 sm:px-4 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all flex items-center gap-1.5 sm:gap-2", view === 'card' ? "bg-primary text-primary-foreground shadow-md" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
                                <Grid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider">Cards</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <div className="min-h-[300px] sm:min-h-[400px]">
                    {isLoading && domains.length === 0 ? (
                        <div className="h-[300px] sm:h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest">Syncing Domains...</p>
                        </div>
                    ) : domains.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center text-center p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border-2 border-dashed border-[var(--border)]"
                        >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-primary">
                                <Globe size={24} className="sm:size-[32px]" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] dark:text-white mb-2">No Custom Domains</h3>
                            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto mb-6 sm:mb-8">
                                You haven't added any custom domains yet. Connect a domain to white-label your bio links.
                            </p>
                            <button onClick={() => handleOpenModal()} className="rounded-xl sm:rounded-2xl h-10 sm:h-12 px-6 sm:px-8 bg-primary text-white text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Add Domain
                            </button>
                        </motion.div>
                    ) : (
                        <div className="bg-[var(--card)] rounded-[1.5rem] sm:rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
                            {view === 'row' ? (
                                <>
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50 dark:bg-[var(--background)]/80">
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70">Domain Identity</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 text-center">Status</th>
                                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--muted-foreground)]/70 text-right">Control Center</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]/50">
                                                {filtered.map((d: any) => (
                                                    <DomainRow key={d.domain_id || d.id} d={d} onEdit={() => handleOpenModal(d)} onDelete={() => handleDelete(d.domain_id || d.id)} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden flex flex-col gap-3 p-3 sm:p-4">
                                        {filtered.map((d: any) => (
                                            <DomainMobileCard key={d.domain_id || d.id} d={d} onEdit={() => handleOpenModal(d)} onDelete={() => handleDelete(d.domain_id || d.id)} />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-8">
                                    {filtered.map((d: any) => (
                                        <DomainCard key={d.domain_id || d.id} d={d} onEdit={() => handleOpenModal(d)} onDelete={() => handleDelete(d.domain_id || d.id)} />
                                    ))}
                                </div>
                            )}
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
                    <div className="flex gap-3 sm:gap-4">
                        <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black uppercase tracking-widest text-[11px] hover:bg-[var(--muted)]/50 dark:hover:bg-[var(--card)]/5 transition-colors">Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={!formData.domain}
                            className="flex-[1.5] h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Save size={16} className="sm:size-[18px]" />
                            Save Domain
                        </button>
                    </div>
                }
            >
                <div className="space-y-4 sm:space-y-6 py-2">
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
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-[var(--muted)]/50 dark:bg-[var(--background)] rounded-xl sm:rounded-2xl border border-[var(--border)] dark:border-[var(--border)]">
                        <div className="min-w-0 flex-1 mr-2">
                            <p className="text-xs sm:text-sm font-black text-[var(--foreground)] dark:text-white">Enable Domain</p>
                            <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">Toggle domain visibility</p>
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

function DomainRow({ d, onEdit, onDelete }: any) {
    return (
        <tr className="group hover:bg-primary/[0.02] transition-colors cursor-pointer" onClick={onEdit}>
            <td className="px-8 py-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-sm">
                        <Globe size={24} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-lg text-[var(--foreground)] dark:text-white truncate group-hover:text-primary transition-colors leading-tight">{d.domain}</p>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-[10px] text-[var(--muted-foreground)]/70 font-bold flex items-center gap-2 uppercase tracking-widest">
                                <LinkIcon size={10} className="text-primary/50 shrink-0" /> <span className="truncate">Index: {d.custom_index_url || "N/A"}</span>
                            </p>
                            <p className="text-[10px] text-[var(--muted-foreground)]/70 font-bold flex items-center gap-2 uppercase tracking-widest">
                                <LinkIcon size={10} className="text-red-500/50 shrink-0" /> <span className="truncate">404: {d.custom_not_found_url || "N/A"}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 text-center">
                {d.is_enabled === 1 ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-green-200 dark:border-green-800">
                        <CheckCircle2 size={12} /> Active
                    </span>
                ) : (
                    <span className="inline-flex items-center px-4 py-2 bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--muted-foreground)] dark:text-[var(--muted-foreground)]/70 text-[10px] font-black uppercase tracking-widest rounded-xl border border-[var(--border)] dark:border-[var(--border)]">
                        Inactive
                    </span>
                )}
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit} className="w-10 h-10 rounded-xl bg-[var(--muted)]/50 dark:bg-[var(--card)]/5 border border-transparent hover:border-primary/20 flex items-center justify-center text-[var(--muted-foreground)]/70 hover:text-primary transition-all">
                        <Edit3 size={18} />
                    </button>
                    <ActionDropdown item={d} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </td>
        </tr>
    );
}

function DomainMobileCard({ d, onEdit, onDelete }: any) {
    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
            <button onClick={onEdit} className="w-full text-left px-4 pt-4 pb-3">
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Globe size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[var(--foreground)] dark:text-white truncate leading-snug">{d.domain}</h4>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium truncate flex items-center gap-1">
                            <LinkIcon size={9} className="text-primary shrink-0" /> {d.custom_index_url || "Default"}
                        </p>
                    </div>
                    {d.is_enabled === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border bg-green-50 dark:bg-green-900/20 text-green-600 border-green-100 dark:border-green-800">
                            <CheckCircle2 size={10} /> Live
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0 border bg-[var(--muted)]/50 dark:bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)]">
                            Off
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-[10px] text-[var(--muted-foreground)]/70 font-bold flex items-center gap-1 truncate max-w-[70%]">
                        <LinkIcon size={9} className="text-red-500/50 shrink-0" /> 404: {d.custom_not_found_url || "N/A"}
                    </p>
                    <span className="text-[9px] text-[var(--muted-foreground)]/70 font-medium shrink-0">Tap to manage →</span>
                </div>
            </button>

            <div className="border-t border-[var(--border)] grid grid-cols-3 divide-x divide-[var(--border)]">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-primary hover:bg-primary/5 transition-colors group/btn">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Edit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); window.open(`https://${d.domain}`, '_blank'); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--muted-foreground)]/70 hover:text-primary hover:bg-primary/5 transition-colors group/btn">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Visit</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="py-2.5 flex flex-col items-center justify-center gap-0.5 text-[var(--muted-foreground)]/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group/btn">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-bold uppercase tracking-wide opacity-70 group-hover/btn:opacity-100">Delete</span>
                </button>
            </div>
        </div>
    );
}

function DomainCard({ d, onEdit, onDelete }: any) {
    return (
        <div className="bg-[var(--muted)]/50 dark:bg-[var(--background)]/80 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-transparent hover:border-primary/20 hover:bg-[var(--card)] dark:hover:bg-[var(--background)] hover:shadow-xl transition-all group relative overflow-hidden" onClick={onEdit}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Globe size={22} className="sm:size-[26px]" />
                </div>
                <ActionDropdown item={d} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div className="space-y-1 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] dark:text-white group-hover:text-primary transition-colors leading-tight truncate">{d.domain}</h3>
                <div className="flex items-center gap-2">
                    {d.is_enabled === 1 ? (
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={10} /> Live
                        </span>
                    ) : (
                        <span className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Inactive</span>
                    )}
                </div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--card)] dark:bg-slate-950 border border-[var(--border)] dark:border-[var(--border)] space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest mb-0.5">Index Landing</p>
                        <p className="text-xs font-bold text-[var(--foreground)] dark:text-[var(--muted-foreground)]/50 truncate">{d.custom_index_url || "Default"}</p>
                    </div>
                    <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[var(--muted)]/50 dark:bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)]/70 hover:text-primary transition-colors shrink-0">
                        <Copy size={12} className="sm:size-[14px]" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ActionDropdown({ item, onEdit, onDelete }: any) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--muted)]/60 dark:hover:bg-[var(--card)]/10 transition-all text-[var(--muted-foreground)]/70 hover:text-[var(--muted-foreground)]">
                    <MoreVertical size={14} className="sm:size-[18px]" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 sm:w-60 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border-[var(--border)] dark:border-white/10 bg-[var(--card)]/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem onClick={onEdit} className="h-10 sm:h-11 rounded-lg sm:rounded-xl gap-2 sm:gap-3 px-2 sm:px-3 cursor-pointer">
                    <Edit3 size={14} className="sm:size-[16px] text-[var(--muted-foreground)]" /> <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Configure</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10 sm:h-11 rounded-lg sm:rounded-xl gap-2 sm:gap-3 px-2 sm:px-3 cursor-pointer" onClick={() => window.open(`https://${item.domain}`, '_blank')}>
                    <ExternalLink size={14} className="sm:size-[16px] text-[var(--muted-foreground)]" /> <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Visit Domain</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10 sm:h-11 rounded-lg sm:rounded-xl gap-2 sm:gap-3 px-2 sm:px-3 cursor-pointer">
                    <LineChart size={14} className="sm:size-[16px] text-[var(--muted-foreground)]" /> <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Activity Log</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-10 sm:h-11 rounded-lg sm:rounded-xl gap-2 sm:gap-3 px-2 sm:px-3 cursor-pointer">
                    <BarChart2 size={14} className="sm:size-[16px] text-[var(--muted-foreground)]" /> <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Deep Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-[var(--muted)]/50 dark:bg-[var(--card)]/5" />
                <DropdownMenuItem onClick={onDelete} className="h-10 sm:h-11 rounded-lg sm:rounded-xl gap-2 sm:gap-3 px-2 sm:px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={14} className="sm:size-[16px] text-red-500" /> <span className="font-bold text-[11px] sm:text-xs uppercase tracking-wider">Remove Domain</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
