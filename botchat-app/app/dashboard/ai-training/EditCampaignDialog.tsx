"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Edit2, Loader2, X, Tag, AlignLeft, Bot, CheckCircle,
    Plus, Trash2, Globe, FileText, Database, Table2,
    MessageSquareText, ChevronDown, Search, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    updateCampaign, clearSelectedCampaign,
    fetchKnowledgeSources, createKnowledgeSource, deleteKnowledgeSource,
    type Campaign, type KnowledgeSource, type SourceType,
} from "@/store/slices/aiTrainingSlice";
import { useModal } from "@/components/providers/ModalProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    FormField, StyledInput, StyledTextarea, StatusRadio,
} from "./CreateCampaignPanel";

// ── Source type config ────────────────────────────────────────────────────────
const SOURCE_TYPES: {
    type: SourceType;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}[] = [
    { type: "manual",  label: "Manual FAQ / Content",    icon: MessageSquareText, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { type: "url",     label: "Website URL Scraping",    icon: Globe,             color: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-950/30"    },
    { type: "file",    label: "File Upload (PDF / Doc)", icon: FileText,          color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
    { type: "api",     label: "External API Source",     icon: Database,          color: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-50 dark:bg-amber-950/30"  },
    { type: "sheet",   label: "Google Sheets",           icon: Table2,            color: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-50 dark:bg-rose-950/30"    },
];

type TabKey = "processed" | SourceType;
const TABS: { key: TabKey; label: string }[] = [
    { key: "processed", label: "Processed Contents" },
    { key: "url",       label: "URLs"               },
    { key: "file",      label: "Files"              },
    { key: "api",       label: "API Sources"        },
    { key: "sheet",     label: "Sheets"             },
    { key: "manual",    label: "Manual FAQ"         },
];

// ── Source status badge ───────────────────────────────────────────────────────
function SourceStatusBadge({ status }: { status?: string }) {
    const s = (status || "pending").toLowerCase();
    const styles: Record<string, string> = {
        active:    "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        pending:   "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        failed:    "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        processed: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    };
    return (
        <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase tracking-wide",
            styles[s] ?? styles.pending
        )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {s}
        </span>
    );
}

// ── Add Source Modal ──────────────────────────────────────────────────────────
function AddSourceModal({
    type,
    campaignId,
    open,
    onClose,
}: {
    type: SourceType | null;
    campaignId: number;
    open: boolean;
    onClose: () => void;
}) {
    const dispatch = useAppDispatch();
    const { isAddingSource } = useAppSelector((s) => s.aiTraining);
    const fileRef = useRef<HTMLInputElement>(null);

    const [title, setTitle]     = useState("");
    const [content, setContent] = useState("");
    const [url, setUrl]         = useState("");
    const [sheetUrl, setSheetUrl] = useState("");
    const [sheetName, setSheetName] = useState("");
    const [apiUrl, setApiUrl]   = useState("");
    const [method, setMethod]   = useState("GET");
    const [headers, setHeaders] = useState("");
    const [file, setFile]       = useState<File | null>(null);

    const reset = () => {
        setTitle(""); setContent(""); setUrl("");
        setSheetUrl(""); setSheetName(""); setApiUrl("");
        setMethod("GET"); setHeaders(""); setFile(null);
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async () => {
        if (!type) return;
        let payload: FormData | Record<string, any>;

        if (type === "manual") {
            if (!title.trim()) return toast.error("Title is required");
            payload = { type, title, content };
        } else if (type === "url") {
            if (!url.trim()) return toast.error("URL is required");
            payload = { type, url };
        } else if (type === "file") {
            if (!file) return toast.error("Please select a file");
            const fd = new FormData();
            fd.append("type", type);
            fd.append("file", file);
            payload = fd;
        } else if (type === "api") {
            if (!apiUrl.trim()) return toast.error("API URL is required");
            payload = { type, api_url: apiUrl, method, headers };
        } else {
            if (!sheetUrl.trim()) return toast.error("Sheet URL is required");
            payload = { type, sheet_url: sheetUrl, sheet_name: sheetName };
        }

        const res = await dispatch(createKnowledgeSource({ campaignId, payload }));
        if (createKnowledgeSource.fulfilled.match(res)) {
            toast.success("Source added successfully!");
            handleClose();
        } else {
            toast.error((res.payload as string) || "Failed to add source");
        }
    };

    if (!open || !type) return null;
    const cfg = SOURCE_TYPES.find(s => s.type === type)!;

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-full max-w-[480px] bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", cfg.bg)}>
                                    <cfg.icon className={cn("w-4 h-4", cfg.color)} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                        Add {cfg.label}
                                    </h3>
                                    <p className="text-xs text-neutral-400">
                                        Add a new knowledge source to this campaign
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-4">
                            {type === "manual" && (
                                <>
                                    <FormField label="Question / Title" required>
                                        <StyledInput placeholder="e.g. How do I reset my password?" value={title} onChange={setTitle} />
                                    </FormField>
                                    <FormField label="Answer / Content">
                                        <StyledTextarea placeholder="Enter the full answer or knowledge content..." value={content} onChange={setContent} rows={5} />
                                    </FormField>
                                </>
                            )}
                            {type === "url" && (
                                <FormField label="Website URL" required>
                                    <StyledInput placeholder="https://example.com/docs" value={url} onChange={setUrl} />
                                </FormField>
                            )}
                            {type === "file" && (
                                <FormField label="Upload File (PDF / Doc)" required>
                                    <div
                                        onClick={() => fileRef.current?.click()}
                                        className={cn(
                                            "w-full rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center gap-2 cursor-pointer transition-all",
                                            file
                                                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                                                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
                                        )}
                                    >
                                        <FileText className={cn("w-6 h-6", file ? "text-emerald-500" : "text-neutral-400")} />
                                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                                            {file ? file.name : "Click to browse file"}
                                        </p>
                                        <p className="text-xs text-neutral-400">PDF, DOC, DOCX — Max 10MB</p>
                                    </div>
                                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                                        onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                                </FormField>
                            )}
                            {type === "api" && (
                                <>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <FormField label="API Endpoint URL" required>
                                                <StyledInput placeholder="https://api.example.com/data" value={apiUrl} onChange={setApiUrl} />
                                            </FormField>
                                        </div>
                                        <FormField label="Method">
                                            <select
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                                className="w-full h-11 px-3 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-pink-400 dark:focus:border-pink-500"
                                            >
                                                {["GET","POST","PUT"].map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </FormField>
                                    </div>
                                    <FormField label="Headers (JSON)" hint='e.g. {"Authorization": "Bearer token"}'>
                                        <StyledTextarea placeholder='{"Authorization": "Bearer your-token"}' value={headers} onChange={setHeaders} rows={3} />
                                    </FormField>
                                </>
                            )}
                            {type === "sheet" && (
                                <>
                                    <FormField label="Google Sheet URL" required>
                                        <StyledInput placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={setSheetUrl} />
                                    </FormField>
                                    <FormField label="Sheet / Tab Name">
                                        <StyledInput placeholder="e.g. Sheet1" value={sheetName} onChange={setSheetName} />
                                    </FormField>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/60 dark:bg-neutral-900/60">
                            <button onClick={handleClose} className="h-9 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isAddingSource}
                                className="h-9 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
                            >
                                {isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-3.5 h-3.5" /> Add Source</>}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Knowledge Base Sources section ────────────────────────────────────────────
function KnowledgeBaseSources({ campaign }: { campaign: Campaign }) {
    const dispatch = useAppDispatch();
    const { knowledgeSources, isLoadingSources } = useAppSelector((s) => s.aiTraining);
    const { showConfirm, showModal } = useModal();

    const [activeTab, setActiveTab]   = useState<TabKey>("processed");
    const [showDropdown, setShowDropdown] = useState(false);
    const [addType, setAddType]       = useState<SourceType | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchKnowledgeSources(campaign.id));
    }, [campaign.id, dispatch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
                setShowDropdown(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const openAddModal = (type: SourceType) => {
        setAddType(type);
        setShowDropdown(false);
        setAddModalOpen(true);
    };

    const handleDelete = (source: KnowledgeSource) => {
        showConfirm({
            title: "Remove Source?",
            message: "This knowledge source will be permanently removed from the campaign.",
            confirmText: "Remove",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                const res = await dispatch(deleteKnowledgeSource({ campaignId: campaign.id, sourceId: source.id }));
                if (deleteKnowledgeSource.fulfilled.match(res)) {
                    showModal("success", "Removed", "Knowledge source removed.");
                } else {
                    toast.error("Failed to remove source");
                }
            },
        });
    };

    // Filter sources for each tab
    const getTabSources = (tab: TabKey): KnowledgeSource[] => {
        if (tab === "processed") return knowledgeSources.filter(s => s.status === "processed" || s.status === "active");
        return knowledgeSources.filter(s => s.type === tab);
    };

    const tabSources = getTabSources(activeTab);

    // Table columns per tab
    const renderRow = (s: KnowledgeSource, idx: number) => {
        const mainCell = () => {
            if (activeTab === "processed" || s.type === "manual") return (
                <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{s.title || "—"}</p>
                    {s.content && <p className="text-[10px] text-neutral-400 truncate mt-0.5">{s.content}</p>}
                </td>
            );
            if (s.type === "url") return <td className="px-4 py-3 max-w-[220px]"><p className="text-xs text-blue-600 dark:text-blue-400 truncate font-medium">{s.url || "—"}</p></td>;
            if (s.type === "file") return <td className="px-4 py-3 max-w-[220px]"><p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{s.file_name || "—"}</p></td>;
            if (s.type === "api") return (
                <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 truncate font-medium">{s.api_url || "—"}</p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{s.method}</span>
                </td>
            );
            if (s.type === "sheet") return <td className="px-4 py-3 max-w-[220px]"><p className="text-xs text-rose-600 dark:text-rose-400 truncate font-medium">{s.sheet_url || "—"}</p></td>;
            return <td className="px-4 py-3">—</td>;
        };

        const colLabel = () => {
            if (activeTab === "processed" || s.type === "manual") return "Content";
            if (s.type === "url") return "URL";
            if (s.type === "file") return "File Name";
            if (s.type === "api") return "API URL";
            if (s.type === "sheet") return "Sheet URL";
            return "Source";
        };

        return { mainCell, colLabel };
    };

    const firstSource = tabSources[0];
    const colLabel = firstSource ? renderRow(firstSource, 0).colLabel() : "Source";

    return (
        <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-pink-500" />
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Knowledge Base Sources
                    </h3>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                        {knowledgeSources.length}
                    </span>
                </div>

                {/* Add Knowledge Source dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(p => !p)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Knowledge Source
                        <ChevronDown className={cn("w-3 h-3 transition-transform", showDropdown && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-10 overflow-hidden py-1"
                            >
                                {SOURCE_TYPES.map((src) => (
                                    <button
                                        key={src.type}
                                        onClick={() => openAddModal(src.type)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-left transition-colors group"
                                    >
                                        <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0", src.bg)}>
                                            <src.icon className={cn("w-3.5 h-3.5", src.color)} />
                                        </div>
                                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                            {src.label}
                                        </span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 mb-4 overflow-x-auto">
                {TABS.map((tab) => {
                    const count = getTabSources(tab.key).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all",
                                activeTab === tab.key
                                    ? "border-pink-500 text-pink-600 dark:text-pink-400"
                                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            )}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    activeTab === tab.key
                                        ? "bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400"
                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[40px_1fr_100px_60px] bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800">
                    {["No.", colLabel, "Status", "Action"].map((h) => (
                        <div key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                            {h}
                        </div>
                    ))}
                </div>

                {/* Table body */}
                {isLoadingSources ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                        <span className="text-xs text-neutral-400">Loading sources...</span>
                    </div>
                ) : tabSources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <AlertCircle className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">No data available in table</p>
                    </div>
                ) : (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {tabSources.map((source, idx) => {
                            const { mainCell } = renderRow(source, idx);
                            return (
                                <div key={source.id} className="grid grid-cols-[40px_1fr_100px_60px] items-center hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors">
                                    <div className="px-4 py-3 text-xs text-neutral-400 font-medium">{idx + 1}</div>
                                    {mainCell()}
                                    <div className="px-4 py-3">
                                        <SourceStatusBadge status={source.status} />
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(source)}
                                            className="w-7 h-7 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                            title="Remove source"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Table footer */}
                {tabSources.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                        <p className="text-[10px] text-neutral-400">
                            Showing {tabSources.length} of {tabSources.length} entries
                        </p>
                    </div>
                )}
            </div>

            {/* Add Source Modal */}
            <AddSourceModal
                type={addType}
                campaignId={campaign.id}
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
            />
        </div>
    );
}

// ── Edit Campaign Panel ───────────────────────────────────────────────────────
const DEFAULT_FORM = {
    name: "",
    status: "active" as "active" | "inactive",
    description: "",
    system_prompt: "",
};

interface Props {
    campaign: Campaign | null;
    open: boolean;
    onClose: () => void;
}

export default function EditCampaignDialog({ campaign, open, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { isSubmitting } = useAppSelector((s) => s.aiTraining);
    const [form, setForm] = useState(DEFAULT_FORM);

    useEffect(() => {
        if (campaign) {
            setForm({
                name: campaign.name || "",
                status: (campaign.status as "active" | "inactive") || "active",
                description: campaign.description || "",
                system_prompt: campaign.system_prompt || "",
            });
        }
    }, [campaign]);

    const set = (key: keyof typeof DEFAULT_FORM) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleClose = () => {
        dispatch(clearSelectedCampaign());
        onClose();
    };

    const handleSave = async () => {
        if (!campaign || !form.name.trim()) return toast.error("Campaign name is required");
        const res = await dispatch(updateCampaign({ id: campaign.id, ...form }));
        if (updateCampaign.fulfilled.match(res)) {
            toast.success("Campaign updated successfully!");
        } else {
            toast.error((res.payload as string) || "Failed to update campaign");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
            <DialogContent className="sm:max-w-[760px] p-0 gap-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white dark:bg-neutral-950">
                {/* Panel Header */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-white">
                                Edit Campaign
                            </DialogTitle>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                {campaign?.name}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 max-h-[75vh]">
                    {/* ── Section: Campaign Details ── */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
                            Campaign Details
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <FormField label="Campaign Name" icon={Tag} required>
                                    <StyledInput placeholder="Enter Campaign Name" value={form.name} onChange={set("name")} />
                                </FormField>
                            </div>
                            <div className="col-span-2">
                                <FormField label="Status" icon={CheckCircle}>
                                    <StatusRadio value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} />
                                </FormField>
                            </div>
                            <div className="col-span-2">
                                <FormField label="Description" icon={AlignLeft}>
                                    <StyledTextarea placeholder="Enter description about this campaign" value={form.description} onChange={set("description")} rows={2} />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* ── Section: AI Config ── */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
                            AI Configuration
                        </p>
                        <FormField
                            label="System Persona / Prompt (Global)"
                            icon={Bot}
                            hint="This prompt will be sent as the base persona for all pages using this campaign."
                        >
                            <StyledTextarea
                                placeholder="Enter the global AI persona or instructions for this campaign"
                                value={form.system_prompt}
                                onChange={set("system_prompt")}
                                rows={4}
                            />
                        </FormField>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-neutral-100 dark:border-neutral-800" />

                    {/* ── Section: Knowledge Base Sources ── */}
                    {campaign && <KnowledgeBaseSources campaign={campaign} />}
                </div>

                {/* Panel Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/60 dark:bg-neutral-900/60 flex-shrink-0">
                    <button
                        onClick={handleClose}
                        className="h-10 px-5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
