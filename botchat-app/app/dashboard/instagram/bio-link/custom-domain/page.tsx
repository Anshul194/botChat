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

            <div className="max-w-full space-y-8 relative z-10 p-6 md:p-12">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/10">
                                <Zap size={24} />
                            </div>
                            <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                Domain Studio
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                                Custom Domains
                            </h1>
                            <p className="text-[var(--muted-foreground)] font-medium max-w-xl">
                                Manage your branded domains for your Bio Links to ensure a consistent brand experience.
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

                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="h-16 rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-xl flex items-center px-6 shadow-sm flex-1 w-full">
                        <Search className="w-4 h-4 text-[var(--muted-foreground)] mr-3" />
                        <input 
                            placeholder="Search your domains..." 
                            className="bg-transparent text-sm font-medium focus:outline-none flex-1" 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                        />
                    </div>
                    <div className="flex items-center bg-[var(--card)]/50 backdrop-blur-xl border border-[var(--border)] p-1.5 rounded-[1.5rem] shadow-sm shrink-0">
                        <button onClick={() => setView('row')} className={cn("p-2.5 rounded-xl transition-all", view === 'row' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                            <MoreVertical size={18} className="rotate-90" />
                        </button>
                        <button onClick={() => setView('card')} className={cn("p-2.5 rounded-xl transition-all", view === 'card' ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                            <Grid size={18} />
                        </button>
                    </div>
                </div>

                <div className="min-h-[400px]">
                    {isLoading && domains.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-[var(--muted-foreground)]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest">Syncing Domains...</p>
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
                        <div className="bg-[var(--card)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-sm">
                            {view === 'row' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[var(--border)] bg-slate-50/50 dark:bg-slate-900/50">
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Domain Identity</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Control Center</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]/50">
                                            {filtered.map((d: any) => (
                                                <DomainRow key={d.domain_id || d.id} d={d} onEdit={() => handleOpenModal(d)} onDelete={() => handleDelete(d.domain_id || d.id)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
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
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white">Enable Domain</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Toggle domain visibility</p>
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
                        <p className="font-black text-lg text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors leading-tight">{d.domain}</p>
                        <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                <LinkIcon size={10} className="text-primary/50" /> Index: {d.custom_index_url || "N/A"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-2 uppercase tracking-widest">
                                <LinkIcon size={10} className="text-red-500/50" /> 404: {d.custom_not_found_url || "N/A"}
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
                    <span className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700">
                        Inactive
                    </span>
                )}
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                    <button onClick={onEdit} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-transparent hover:border-primary/20 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                        <Edit3 size={18} />
                    </button>
                    <ActionDropdown item={d} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </td>
        </tr>
    );
}

function DomainCard({ d, onEdit, onDelete }: any) {
    return (
        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all group relative overflow-hidden" onClick={onEdit}>
            <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Globe size={26} />
                </div>
                <ActionDropdown item={d} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div className="space-y-1 mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-tight truncate">{d.domain}</h3>
                <div className="flex items-center gap-2">
                    {d.is_enabled === 1 ? (
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={10} /> Live
                        </span>
                    ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inactive</span>
                    )}
                </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Index Landing</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{d.custom_index_url || "Default"}</p>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                        <Copy size={14} />
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
                <button className="w-10 h-10 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600">
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-2xl border-slate-100 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-2xl">
                <DropdownMenuItem onClick={onEdit} className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <Edit3 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Configure</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer" onClick={() => window.open(`https://${item.domain}`, '_blank')}>
                    <ExternalLink size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Visit Domain</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <LineChart size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Activity Log</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="h-11 rounded-xl gap-3 px-3 cursor-pointer">
                    <BarChart2 size={16} className="text-slate-500" /> <span className="font-bold text-xs uppercase tracking-wider">Deep Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-white/5" />
                <DropdownMenuItem onClick={onDelete} className="h-11 rounded-xl gap-3 px-3 text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer">
                    <Trash2 size={16} className="text-red-500" /> <span className="font-bold text-xs uppercase tracking-wider">Remove Domain</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
