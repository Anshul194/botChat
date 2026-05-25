"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Edit2, Loader2, X, Tag, AlignLeft, Bot, CheckCircle,
    Plus, Trash2, Globe, FileText, Database, Table2,
    MessageSquareText, ChevronDown, Search, AlertCircle,
    Save, RefreshCcw
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
import api from "@/lib/api";

// ── Source type config ────────────────────────────────────────────────────────
const SOURCE_TYPES: {
    type: SourceType;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
}[] = [
        { type: "manual", label: "Manual FAQ / Content", icon: MessageSquareText, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30" },
        { type: "url", label: "Website URL Scraping", icon: Globe, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
        { type: "file", label: "File Upload (PDF / Doc)", icon: FileText, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
        { type: "api", label: "External API Source", icon: Database, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
        { type: "sheet", label: "Google Sheets", icon: Table2, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
    ];

type TabKey = "processed" | SourceType;
const TABS: { key: TabKey; label: string }[] = [
    { key: "processed", label: "Processed Contents" },
    { key: "url", label: "URLs" },
    { key: "file", label: "Files" },
    { key: "api", label: "API Sources" },
    { key: "sheet", label: "Sheets" },
    { key: "manual", label: "Manual FAQ" },
];

// ── Source status badge ───────────────────────────────────────────────────────
function SourceStatusBadge({ status }: { status?: string }) {
    const s = (status || "pending").toLowerCase();
    const styles: Record<string, string> = {
        active: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        pending: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        failed: "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        processed: "bg-primary/10 text-primary border-primary/20",
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
    onSuccess,
}: {
    type: SourceType | null;
    campaignId: number;
    open: boolean;
    onClose: () => void;
    onSuccess?: (type: SourceType) => void;
}) {
    const dispatch = useAppDispatch();
    const { isAddingSource } = useAppSelector((s) => s.aiTraining);
    const { showModal } = useModal();
    const fileRef = useRef<HTMLInputElement>(null);

    // Manual format
    const [manualFormat, setManualFormat] = useState<"faq" | "raw">("faq");
    const [manualQuestion, setManualQuestion] = useState("");
    const [manualAnswer, setManualAnswer] = useState("");
    const [manualTitle, setManualTitle] = useState("");
    const [manualContent, setManualContent] = useState("");

    // URL
    const [url, setUrl] = useState("");
    const [urlFetchType, setUrlFetchType] = useState("");
    const [urlFetchName, setUrlFetchName] = useState("");
    const [urlRemoveSelectors, setUrlRemoveSelectors] = useState([{ type: "", name: "" }]);

    // File
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState("");
    const [fileParseMode, setFileParseMode] = useState("raw_response");
    const [previewContent, setPreviewContent] = useState("");
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    // API
    const [apiName, setApiName] = useState("");
    const [apiMethod, setApiMethod] = useState("GET");
    const [apiUrl, setApiUrl] = useState("");
    const [apiListKey, setApiListKey] = useState("");
    const [apiTitleKey, setApiTitleKey] = useState("title");
    const [apiContentKey, setApiContentKey] = useState("description");

    // Sheet
    const [sheetUrl, setSheetUrl] = useState("");
    const [sheetName, setSheetName] = useState("");
    const [sheetTitleKey, setSheetTitleKey] = useState("");
    const [sheetContentKey, setSheetContentKey] = useState("");

    const reset = () => {
        setManualFormat("faq"); setManualQuestion(""); setManualAnswer(""); setManualTitle(""); setManualContent("");
        setUrl(""); setUrlFetchType(""); setUrlFetchName(""); setUrlRemoveSelectors([{ type: "", name: "" }]);
        setFile(null); setFileUrl(""); setFileParseMode("raw_response"); setPreviewContent("");
        setApiName(""); setApiUrl(""); setApiMethod("GET"); setApiListKey(""); setApiTitleKey("title"); setApiContentKey("description");
        setSheetUrl(""); setSheetName(""); setSheetTitleKey(""); setSheetContentKey("");
    };

    const handleGeneratePreview = async (mode: "raw_response" | "generate_faq") => {
        if (!file) return toast.error("Please select a file first");
        setFileParseMode(mode);
        setIsPreviewLoading(true);
        try {
            const fd = new FormData();
            fd.append("campaign_id", campaignId.toString());
            fd.append("file", file);
            fd.append("parse_mode", mode);
            const res = await api.post("/ai-training/sources/file/preview", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const extracted = res.data?.ai_content || res.data?.data?.ai_content || res.data?.data?.extracted_content || res.data?.extracted_content || res.data?.data || "";
            const uploadedUrl = res.data?.file_url || res.data?.data?.file_url || "";
            setPreviewContent(typeof extracted === 'string' ? extracted : JSON.stringify(extracted));
            if (uploadedUrl) setFileUrl(uploadedUrl);
            toast.success("Preview generated successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate preview");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async (overrideUrlMode?: "raw_response" | "generate_faq") => {
        if (!type) return;
        let payload: FormData | Record<string, any>;
        let endpoint = "";

        if (type === "manual") {
            endpoint = "/ai-training/contents";
            if (manualFormat === "faq") {
                if (!manualQuestion.trim() || !manualAnswer.trim()) return toast.error("Question and Answer are required");
                payload = { campaign_id: campaignId.toString(), content_format: "faq", question: manualQuestion, answer: manualAnswer };
            } else {
                if (!manualTitle.trim() || !manualContent.trim()) return toast.error("Topic Title and Content are required");
                payload = { campaign_id: campaignId.toString(), content_format: "raw", title: manualTitle, content_text: manualContent };
            }
        } else if (type === "url") {
            if (!url.trim()) return toast.error("URL is required");
            endpoint = "/ai-training/sources/url";
            payload = {
                campaign_id: campaignId.toString(),
                url,
                fetch_mode: overrideUrlMode || "generate_faq",
                fetch_config: { type: urlFetchType, name: urlFetchName },
                remove_configs: urlRemoveSelectors.filter(r => r.name.trim() !== "")
            };
        } else if (type === "file") {
            if (!file) return toast.error("Please select a file");
            if (!previewContent.trim()) return toast.error("Please generate content preview first");
            endpoint = "/ai-training/sources/file/save";
            const fd = new FormData();
            fd.append("campaign_id", campaignId.toString());
            fd.append("extracted_content", previewContent);
            fd.append("parse_mode", fileParseMode);
            if (file) fd.append("file", file);
            if (fileUrl) fd.append("file_url", fileUrl);
            payload = fd;
        } else if (type === "api") {
            if (!apiUrl.trim()) return toast.error("API URL is required");
            endpoint = "/ai-training/sources/api";
            payload = {
                campaign_id: campaignId.toString(),
                api_name: apiName || "Custom API",
                method: apiMethod,
                endpoint_url: apiUrl,
                response_mapping_json: { list_key: apiListKey, title: apiTitleKey, content: apiContentKey }
            };
        } else {
            if (!sheetUrl.trim()) return toast.error("Sheet URL is required");
            endpoint = "/ai-training/sources/google-sheet";
            payload = {
                campaign_id: campaignId.toString(),
                sheet_url: sheetUrl,
                sheet_name: sheetName,
                mapping_json: { question: sheetTitleKey, answer: sheetContentKey }
            };
        }

        const res = await dispatch(createKnowledgeSource({ campaignId, endpoint, payload }));
        if (createKnowledgeSource.fulfilled.match(res)) {
            onSuccess?.(type);
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
                    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="w-full max-w-[700px] bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: "calc(100vh - 2rem)" }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                {type === "manual" ? "Add Manual Content/FAQ" : `Add ${cfg.label}`}
                            </h3>
                            <button onClick={handleClose} className="w-7 h-7 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-5 space-y-5 overflow-y-auto min-h-[300px]">
                            {type === "manual" && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Content Format</label>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setManualFormat("faq")}>
                                                <div className={cn("w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors", manualFormat === "faq" ? "border-primary bg-primary" : "border-neutral-300 dark:border-neutral-600")}>
                                                    {manualFormat === "faq" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">Q&A / FAQ</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setManualFormat("raw")}>
                                                <div className={cn("w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors", manualFormat === "raw" ? "border-primary bg-primary" : "border-neutral-300 dark:border-neutral-600")}>
                                                    {manualFormat === "raw" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">Raw Text/Info</span>
                                            </label>
                                        </div>
                                    </div>

                                    {manualFormat === "faq" ? (
                                        <>
                                            <FormField label="Question">
                                                <StyledTextarea value={manualQuestion} onChange={setManualQuestion} rows={3} />
                                            </FormField>
                                            <FormField label="Answer">
                                                <StyledTextarea value={manualAnswer} onChange={setManualAnswer} rows={4} />
                                            </FormField>
                                        </>
                                    ) : (
                                        <>
                                            <FormField label="Topic Title">
                                                <StyledInput value={manualTitle} onChange={setManualTitle} />
                                            </FormField>
                                            <FormField label="Content / Instructions">
                                                <StyledTextarea value={manualContent} onChange={setManualContent} rows={5} />
                                            </FormField>
                                        </>
                                    )}
                                </>
                            )}

                            {type === "url" && (
                                <div className="space-y-6">
                                    <FormField label="Campaign URL" hint="Add a webpage link that contains relevant content for training your bot. Example: https://botsocialai.com" required>
                                        <StyledInput placeholder="Enter your URL" value={url} onChange={setUrl} />
                                    </FormField>

                                    <div>
                                        <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1 mb-2">
                                            Fetch Content Configuration <span className="text-[10px] font-normal text-neutral-500">(Use selectors to specify which parts of the webpage the AI should learn from.)</span>
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FormField label="Selector Type">
                                                <select value={urlFetchType} onChange={(e) => setUrlFetchType(e.target.value)} className="w-full h-11 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-1 focus:ring-primary">
                                                    <option value="">Select Selector</option>
                                                    <option value="id">ID</option>
                                                    <option value="class">Class</option>
                                                    <option value="tag">Tag</option>

                                                </select>
                                            </FormField>
                                            <FormField label="Selector Name">
                                                <StyledInput placeholder="Enter Your Selector Name" value={urlFetchName} onChange={setUrlFetchName} className="rounded-md" />
                                            </FormField>
                                        </div>
                                    </div>

                                    <div>
                                        <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1 mb-2">
                                            Remove Content Configuration <span className="text-[10px] font-normal text-neutral-500">(Specify areas to exclude if the webpage contains unnecessary details.)</span>
                                        </h5>
                                        <div className="space-y-3 mb-3">
                                            {urlRemoveSelectors.map((sel, idx) => (
                                                <div key={idx} className="flex gap-3 items-end">
                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                        <FormField label={idx === 0 ? "Selector Type" : ""}>
                                                            <select value={sel.type} onChange={(e) => { const n = [...urlRemoveSelectors]; n[idx].type = e.target.value; setUrlRemoveSelectors(n); }} className="w-full h-11 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-1 focus:ring-primary">
                                                                <option value="">Select Selector</option>
                                                                <option value="id">ID</option>
                                                                <option value="class">Class</option>
                                                                <option value="tag">Tag</option>
                                                            </select>
                                                        </FormField>
                                                        <FormField label={idx === 0 ? "Selector Name" : ""}>
                                                            <StyledInput placeholder="Enter Your Selector Name" value={sel.name} onChange={(v) => { const n = [...urlRemoveSelectors]; n[idx].name = v; setUrlRemoveSelectors(n); }} className="rounded-md" />
                                                        </FormField>
                                                    </div>
                                                    <button onClick={() => setUrlRemoveSelectors(urlRemoveSelectors.filter((_, i) => i !== idx))} className="h-11 w-11 rounded-md bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white flex-shrink-0 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setUrlRemoveSelectors([...urlRemoveSelectors, { type: "", name: "" }])} className="text-xs font-bold text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                                            + Add Remove Selector
                                        </button>
                                    </div>
                                </div>
                            )}

                            {type === "file" && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold text-primary uppercase tracking-wide flex flex-wrap items-center gap-2 mb-1">
                                            UPLOAD FILE
                                            <span className="text-xs normal-case text-neutral-500 font-normal">
                                                (Upload documents (PDF, Word, Excel, CSV, OpenDocument, TXT) with structured information for the bot to learn from.
                                            </span>
                                        </h4>
                                        <p className="text-xs text-neutral-500 leading-relaxed mb-4">
                                            Example: Training manuals, product guides, FAQs. Accepted Formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV, OpenDocument (.ods, .odt), TXT.)
                                        </p>

                                        {/* Input Row */}
                                        <div className="flex items-center w-full pt-1">
                                            <div className="h-11 flex-1 flex items-center px-4 border border-neutral-300 dark:border-neutral-700 rounded-l-md bg-white dark:bg-neutral-900 text-sm text-neutral-700 dark:text-neutral-300 truncate">
                                                {file ? file.name : "Select a file..."}
                                            </div>
                                            <button
                                                onClick={() => fileRef.current?.click()}
                                                className="h-11 px-6 text-white text-sm font-semibold rounded-r-md transition-colors shadow-sm"
                                                style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 12px -2px rgba(29, 110, 245, 0.25)" }}
                                            >
                                                Upload
                                            </button>
                                        </div>
                                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />

                                        <p className="text-[11px] text-neutral-500 mt-2">
                                            Accepted Formats: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), CSV, OpenDocument (.ods, .odt), TXT.
                                        </p>
                                    </div>

                                    {/* Parse Mode Buttons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleGeneratePreview("raw_response")}
                                            disabled={isPreviewLoading}
                                            className={cn("h-11 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all border disabled:opacity-60", fileParseMode === "raw_response" ? "text-white shadow-md shadow-primary/25 border-transparent" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300")}
                                            style={fileParseMode === "raw_response" ? { background: "var(--brand-gradient)" } : {}}
                                        >
                                            <RefreshCcw className={cn("w-4 h-4", isPreviewLoading && fileParseMode === "raw_response" && "animate-spin")} /> Generate Raw Response
                                        </button>
                                        <button
                                            onClick={() => handleGeneratePreview("generate_faq")}
                                            disabled={isPreviewLoading}
                                            className={cn("h-11 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-all border disabled:opacity-60", fileParseMode === "generate_faq" ? "text-white shadow-md shadow-primary/25 border-transparent" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300")}
                                            style={fileParseMode === "generate_faq" ? { background: "var(--brand-gradient)" } : {}}
                                        >
                                            <RefreshCcw className={cn("w-4 h-4", isPreviewLoading && fileParseMode === "generate_faq" && "animate-spin")} /> Generate FAQ
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[11px] text-neutral-500">
                                            Generate Raw Response: Accurate and in-depth responses without splitting content.
                                        </p>
                                        <p className="text-[11px] text-neutral-500">
                                            Generate FAQ: Optimized for efficiency, split into clear, concise sections.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-2 block">Extracted / AI Content Preview</label>
                                        <textarea
                                            value={previewContent}
                                            onChange={(e) => setPreviewContent(e.target.value)}
                                            placeholder={file ? (isPreviewLoading ? "Generating preview..." : "Click a Generate button to preview content.") : "No file selected."}
                                            className="w-full h-40 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 p-4 overflow-y-auto text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            readOnly={!file || !previewContent}
                                        />
                                    </div>
                                </div>
                            )}

                            {type === "api" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="API Name / Label" required>
                                            <StyledInput placeholder="e.g. Shopify Products" value={apiName} onChange={setApiName} className="rounded-md" />
                                        </FormField>
                                        <FormField label="HTTP Method">
                                            <select value={apiMethod} onChange={(e) => setApiMethod(e.target.value)} className="w-full h-11 px-3 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm focus:ring-1 focus:ring-primary">
                                                <option value="GET">GET</option>
                                                <option value="POST">POST</option>
                                                <option value="PUT">PUT</option>
                                            </select>
                                        </FormField>
                                    </div>
                                    <FormField label="Endpoint URL" required>
                                        <StyledInput placeholder="https://api.example.com/data" value={apiUrl} onChange={setApiUrl} className="rounded-md" />
                                    </FormField>
                                    <div>
                                        <h5 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-2">Response Mapping (JSON Paths)</h5>
                                        <div className="grid grid-cols-3 gap-3 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 border border-neutral-100 dark:border-neutral-800 rounded-md">
                                            <FormField label="List Key (optional)">
                                                <StyledInput placeholder="data.items" value={apiListKey} onChange={setApiListKey} className="rounded-md" />
                                            </FormField>
                                            <FormField label="Title Key">
                                                <StyledInput placeholder="title" value={apiTitleKey} onChange={setApiTitleKey} className="rounded-md" />
                                            </FormField>
                                            <FormField label="Content Key">
                                                <StyledInput placeholder="description" value={apiContentKey} onChange={setApiContentKey} className="rounded-md" />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {type === "sheet" && (
                                <div className="space-y-4">
                                    <FormField label="Google Sheet URL" hint="Ensure the sheet is public or shared with our service account." required>
                                        <StyledInput placeholder="https://docs.google.com/spreadsheets/d/..." value={sheetUrl} onChange={setSheetUrl} className="rounded-md" />
                                    </FormField>
                                    <FormField label="Worksheet Name/GID">
                                        <StyledInput placeholder="Sheet1 (Optional)" value={sheetName} onChange={setSheetName} className="rounded-md" />
                                    </FormField>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Title Column">
                                            <StyledInput placeholder="Product Name" value={sheetTitleKey} onChange={setSheetTitleKey} className="rounded-md" />
                                        </FormField>
                                        <FormField label="Content Column">
                                            <StyledInput placeholder="Description" value={sheetContentKey} onChange={setSheetContentKey} className="rounded-md" />
                                        </FormField>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className={cn("border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex-shrink-0 flex items-center", type === "url" ? "px-6 py-4 justify-between" : "px-6 py-4 justify-end gap-3")}>
                            {type === "url" ? (
                                <>
                                    <div>
                                        <p className="text-[10px] text-neutral-500">Generate Raw Response: Single text box extraction.</p>
                                        <p className="text-[10px] text-neutral-500">Generate FAQ: Split content into clear FAQ entries.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleSubmit("raw_response")} disabled={isAddingSource} className="h-10 px-5 rounded-md bg-white border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-semibold transition-colors disabled:opacity-60">{isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Raw Response"}</button>
                                        <button onClick={() => handleSubmit("generate_faq")} disabled={isAddingSource} className="h-10 px-5 rounded-md text-white text-sm font-semibold shadow-md active:scale-95 transition-all disabled:opacity-60" style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 12px -2px rgba(29, 110, 245, 0.25)" }}>{isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate FAQ"}</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleClose} className="h-10 px-5 rounded-md bg-white border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-semibold transition-colors">
                                        Close
                                    </button>
                                    <button
                                        onClick={() => handleSubmit()}
                                        disabled={isAddingSource}
                                        className="h-10 px-5 rounded-md text-white text-sm font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 12px -2px rgba(29, 110, 245, 0.25)" }}
                                    >
                                        {isAddingSource ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                            <>
                                                {type === "api" ? "Save & Sync API" : type === "sheet" ? "Import Data" : "Save Content"}
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
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
    const { showConfirm, showModal, hideModal } = useModal();

    const [activeTab, setActiveTab] = useState<TabKey>("processed");
    const [showDropdown, setShowDropdown] = useState(false);
    const [addType, setAddType] = useState<SourceType | null>(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Processed content state
    const [processedContents, setProcessedContents] = useState<any[]>([]);
    const [isLoadingContents, setIsLoadingContents] = useState(false);

    const fetchContents = async () => {
        setIsLoadingContents(true);
        try {
            const res = await api.get('/ai-training/contents', { params: { campaign_id: campaign.id } });
            setProcessedContents(res.data?.data || res.data || []);
        } catch (error) {
            console.error("Failed to fetch processed content", error);
        } finally {
            setIsLoadingContents(false);
        }
    };

    useEffect(() => {
        dispatch(fetchKnowledgeSources(campaign.id));
    }, [campaign.id, dispatch]);

    useEffect(() => {
        if (activeTab === "processed") {
            fetchContents();
        }
    }, [activeTab, campaign.id]);

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

    const handleDelete = (source: any) => {
        showConfirm({
            title: "Remove Source?",
            message: "This item will be permanently removed from the campaign.",
            confirmText: "Remove",
            cancelText: "Cancel",
            type: "danger",
            onConfirm: async () => {
                if (source._is_content) {
                    try {
                        await api.delete(`/ai-training/contents/${source.id}`);
                        setProcessedContents(prev => prev.filter(c => c.id !== source.id));
                        showModal("success", "Removed", "Processed content removed.");
                        fetchContents(); // Refresh list
                    } catch (e) {
                        toast.error("Failed to remove content");
                    }
                } else {
                    // Logic to delete based on source type mapping to specific endpoints
                    let deleteEndpoint = "";
                    if (source.type === 'url') deleteEndpoint = `/ai-training/sources/url/${source.id}`;
                    else if (source.type === 'file') deleteEndpoint = `/ai-training/sources/file/${source.id}`;
                    else if (source.type === 'api') deleteEndpoint = `/ai-training/sources/api/${source.id}`;
                    else if (source.type === 'sheet') deleteEndpoint = `/ai-training/sources/google-sheet/${source.id}`;

                    if (deleteEndpoint) {
                        try {
                            await api.delete(deleteEndpoint);
                            // Refresh logic (we could trigger a re-fetch of campaign details here)
                            dispatch(fetchKnowledgeSources(campaign.id));
                            showModal("success", "Removed", "Knowledge source removed.");
                        } catch (e) {
                            toast.error("Failed to remove source");
                        }
                    } else {
                        // Fallback to legacy generic thunk if type is missing or mismatch
                        const res = await dispatch(deleteKnowledgeSource({ campaignId: campaign.id, sourceId: source.id }));
                        if (deleteKnowledgeSource.fulfilled.match(res)) {
                            showModal("success", "Removed", "Knowledge source removed.");
                        } else {
                            toast.error("Failed to remove source");
                        }
                    }
                }
            },
        });
    };

    // Filter sources for each tab
    const getTabSources = (tab: TabKey): any[] => {
        if (tab === "processed") {
            return processedContents.map(c => ({
                ...c,
                _is_content: true,
                title: c.title || c.question,
                content: c.content_text || c.extracted_content || c.answer || c.content,
                status: "processed"
            }));
        }
        return knowledgeSources.filter(s => s.type === tab);
    };

    const tabSources = getTabSources(activeTab);

    // Table columns per tab
    const renderRow = (s: any, idx: number) => {
        const mainCell = () => {
            if (activeTab === "processed" || s.type === "manual") return (
                <div className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">{s.title || "—"}</p>
                    {(s.content) && <p className="text-[10px] text-neutral-400 truncate mt-0.5">{s.content}</p>}
                </div>
            );
            if (s.type === "url") return <div className="px-4 py-3 max-w-[220px]"><p className="text-xs text-primary truncate font-medium">{s.url || "—"}</p></div>;
            if (s.type === "file") return <div className="px-4 py-3 max-w-[220px]"><p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{s.file_name || "—"}</p></div>;
            if (s.type === "api") return (
                <div className="px-4 py-3 max-w-[220px]">
                    <p className="text-xs text-neutral-800 dark:text-neutral-200 truncate font-medium">{s.endpoint_url || "—"}</p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{s.method}</span>
                </div>
            );
            if (s.type === "sheet") return <div className="px-4 py-3 max-w-[220px]"><p className="text-xs text-rose-600 dark:text-rose-400 truncate font-medium">{s.sheet_url || "—"}</p></div>;
            return <div className="px-4 py-3">—</div>;
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
                    <div className="w-1 h-4 rounded-full bg-primary" />
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
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                        style={{ background: "var(--brand-gradient)" }}
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
                                    ? "border-primary text-primary"
                                    : "border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            )}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                                    activeTab === tab.key
                                        ? "bg-primary/10 text-primary"
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
                <div className={cn("grid bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800", activeTab === "processed" ? "grid-cols-[40px_1.5fr_1fr_100px_60px]" : "grid-cols-[40px_1fr_100px_60px]")}>
                    {(activeTab === "processed" ? ["No.", colLabel, "Source Details", "Status", "Action"] : ["No.", colLabel, "Status", "Action"]).map((h) => (
                        <div key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                            {h}
                        </div>
                    ))}
                </div>

                {/* Table body */}
                {isLoadingSources || isLoadingContents ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-xs text-neutral-400">Loading data...</span>
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
                                <div key={source.id} className={cn("grid items-center hover:bg-neutral-50/60 dark:hover:bg-neutral-900/30 transition-colors", activeTab === "processed" ? "grid-cols-[40px_1.5fr_1fr_100px_60px]" : "grid-cols-[40px_1fr_100px_60px]")}>
                                    <div className="px-4 py-3 text-xs text-neutral-400 font-medium">{idx + 1}</div>
                                    {mainCell()}
                                    {activeTab === "processed" && (
                                        <div className="px-4 py-3 flex flex-col gap-1 overflow-hidden">
                                            <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-300 uppercase shrink-0 truncate">
                                                {source.source_type || "Source"} • {source.content_format || "Raw"}
                                            </span>
                                            <span className="text-[10px] text-neutral-400 truncate w-full" title={source.source_reference}>
                                                {source.source_reference || "—"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="px-4 py-3">
                                        <SourceStatusBadge status={source.status} />
                                    </div>
                                    <div className="px-4 py-3 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDelete(source);
                                            }}
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
                onSuccess={(type) => {
                    dispatch(fetchKnowledgeSources(campaign.id));
                    if (type === "manual") fetchContents();
                    setActiveTab(type); // Auto switch to the new source tab
                    
                    // Show success modal from the parent to ensure it handles its own state
                    const cfg = SOURCE_TYPES.find(s => s.type === type);
                    showModal("success", "Source Added", `${cfg?.label || "Source"} has been added successfully.`);
                    
                    // Auto-close success modal after 3 seconds
                    setTimeout(() => {
                        hideModal();
                    }, 3000);
                }}
            />
        </div>
    );
}

// ── Edit Campaign Panel ───────────────────────────────────────────────────────
const DEFAULT_FORM = {
    name: "",
    status: "active" as "active" | "inactive",
    description: "",
    prompt_message: "",
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
                prompt_message: campaign.prompt_message || "",
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
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Edit2 className="w-4 h-4 text-primary" />
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
                                value={form.prompt_message}
                                onChange={set("prompt_message")}
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
                        className="h-10 px-6 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                        style={{ background: "var(--brand-gradient)", boxShadow: "0 4px 12px -2px rgba(29, 110, 245, 0.25)" }}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
