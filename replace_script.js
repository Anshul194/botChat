const fs = require('fs');

const code = fs.readFileSync('botchat-app/app/dashboard/facebook/comment-manager/page.tsx', 'utf8');

const prefixIdx = code.indexOf('// ── Full Page Campaign Modal ──────────────────────────────────────────────────');
if (prefixIdx === -1) {
  console.log("Could not find FullPageCampaignModal");
  process.exit(1);
}

const prefix = code.slice(0, prefixIdx);

const newContent = `// ── Full Page Campaign Modal ──────────────────────────────────────────────────
function FPC_Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
    return (
        <div className="space-y-1.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            {children}
        </div>
    );
}

function FPC_Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onClick}>
            {label && <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>}
            <div className="flex items-center gap-2">
                <div className={"w-10 h-5 rounded-full relative transition-all duration-200 " + (active ? "bg-pink-500" : "bg-slate-200")}>
                    <div className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all " + (active ? "left-5.5" : "left-0.5")} />
                </div>
                <span className="text-xs font-medium text-slate-400 w-6">{active ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

function FPC_UploadBox({ label, value, onChange, icon: Icon }: { label: string; value: string | null; onChange: (v: string | null) => void; icon: any }) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { onChange(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };
    const isVideo = label.toLowerCase().includes("video");

    return (
        <div className="space-y-2 flex-1">
            <label className="text-[11px] font-bold text-slate-500 px-1 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" /> {label}
            </label>
            <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white group focus-within:border-pink-400 overflow-hidden transition-all shadow-xs h-[44px]">
                <input type="file" ref={fileInputRef} className="hidden" accept={isVideo ? "video/*" : "image/*"} onChange={handleFileChange} />
                <div onClick={() => fileInputRef.current?.click()} className="bg-pink-600 text-white px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-pink-700">
                    <Plus className="w-4 h-4" /> Upload
                </div>
                <input type="text" placeholder={"Put your " + (isVideo ? 'video' : 'image') + " URL here or click upload"} value={value || ""} onChange={e => onChange(e.target.value || null)} className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 px-4 placeholder:text-slate-300" />
            </div>
        </div>
    );
}

function FPC_CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={"w-11 h-5 rounded-full relative transition-all " + (active ? "bg-pink-600" : "bg-slate-300 shadow-inner")}>
            <div className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " + (active ? "left-6.5" : "left-0.5")} />
        </div>
    );
}

export function FullPageCampaignModal({ page, onClose, onSaved }: { page: any; onClose: () => void; onSaved: () => void }) {
    const { showModal } = useModal();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [campaignId, setCampaignId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        reply_type: "generic" as "generic" | "filter",
        multiple_reply_enabled: false,
        comment_reply_enabled: true,
        hide_after_reply: false,
        message: "",
        image: "",
        video: "",
        private_template_id: "" as string | number | null,
        offensive: {
            hide_comment: false,
            delete_comment: false,
            offensive_keywords: "",
            private_reply_template_id: "" as string | number | null
        }
    });

    const [filterRules, setFilterRules] = useState<any[]>([]);

    useEffect(() => {
        if (page) {
            fetchTemplates();
            fetchCampaign();
        }
    }, [page]);

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const pageId = page?.page_id || page?.id;
            const res = await api.get("/facebook/bot-replies?page_id=" + pageId);
            setTemplates(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const fetchCampaign = async () => {
        setIsLoadingData(true);
        try {
            const res = await api.get("/facebook/report/full-page-reply");
            const currentId = String(page?.page_id || page?.id);
            if (!currentId) return;
            const campaignData = (res.data?.data || []).find((c: any) => String(c.page_id) === currentId);

            if (campaignData) {
                const c = campaignData;
                setCampaignId(c.id);
                setForm({
                    name: c.name || "",
                    reply_type: c.reply_type === "filter" ? "filter" : "generic",
                    multiple_reply_enabled: c.multiple_reply_enabled === "1" || !!c.multiple_reply_enabled,
                    comment_reply_enabled: c.comment_reply_enabled !== "0" && c.comment_reply_enabled !== false,
                    hide_after_reply: c.hide_after_reply === "1" || !!c.hide_after_reply,
                    message: c.message || "",
                    image: c.image || "",
                    video: c.video || "",
                    private_template_id: c.private_template_id ? String(c.private_template_id) : "",
                    offensive: {
                        hide_comment: c.hide_comment === "1" || !!c.hide_comment,
                        delete_comment: c.delete_comment === "1" || !!c.delete_comment,
                        offensive_keywords: c.offensive_keywords || "",
                        private_reply_template_id: c.offensive_private_reply_template_id ? String(c.offensive_private_reply_template_id) : "",
                    }
                });
                
                const rules = (c.rules || c.filters || []).map((r: any) => ({
                    id: r.id?.toString() || Math.random().toString(),
                    keyword: r.keyword || r.keywords || "",
                    match_type: r.match_type || "contains",
                    message: r.message || "",
                    image: r.image || "",
                    video: r.video || "",
                    private_template_id: r.private_template_id ? String(r.private_template_id) : ""
                }));
                // Even if no rules, add one default one
                if (rules.length === 0) rules.push({ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" });
                setFilterRules(rules);
            } else {
                setFilterRules([{ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }]);
            }
        } catch (err) {
            console.error("Global campaign sync error");
        } finally { 
            setIsLoadingData(false); 
        }
    };

    const handleSave = async () => {
        if (!form.name.trim()) return toast.error("Campaign name is required");
        if (!page) return toast.error("No page selected");
        setIsSaving(true);
        try {
            const fd = new FormData();
            fd.append("facebook_page_id", page?.page_id || page?.id);
            fd.append("name", form.name);
            fd.append("reply_type", form.reply_type);
            fd.append("multiple_reply_enabled", form.multiple_reply_enabled ? "1" : "0");
            fd.append("comment_reply_enabled", form.comment_reply_enabled ? "1" : "0");
            fd.append("hide_after_reply", form.hide_after_reply ? "1" : "0");

            fd.append("message", form.message || "");
            fd.append("image", form.image || "");
            fd.append("video", form.video || "");
            fd.append("private_template_id", form.private_template_id || "");

            fd.append("offensive[hide_comment]", form.offensive.hide_comment ? "1" : "0");
            fd.append("offensive[delete_comment]", form.offensive.delete_comment ? "1" : "0");
            fd.append("offensive[offensive_keywords]", form.offensive.offensive_keywords || "");
            fd.append("offensive[private_reply_template_id]", form.offensive.private_reply_template_id || "");

            if (form.reply_type === "filter") {
                filterRules.forEach((rule, i) => {
                    fd.append("rules[" + i + "][keyword]", rule.keyword || "");
                    fd.append("rules[" + i + "][match_type]", rule.match_type || "contains");
                    fd.append("rules[" + i + "][message]", rule.message || "");
                    fd.append("rules[" + i + "][image]", rule.image || "");
                    fd.append("rules[" + i + "][video]", rule.video || "");
                    fd.append("rules[" + i + "][private_template_id]", rule.private_template_id || "");
                });
            }

            const config = { headers: { "Content-Type": "multipart/form-data" } };
            if (campaignId) {
                fd.append("_method", "PUT");
                await api.post("/facebook/full-page-reply/" + campaignId, fd, config);
            } else {
                await api.post("/facebook/full-page-reply", fd, config);
            }
            toast.success("Campaign synced successfully!");
            onSaved();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Operation failed");
        } finally { setIsSaving(false); }
    };

    const handleAddRule = () => {
        setFilterRules([
            ...filterRules,
            { id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }
        ]);
    };

    if (!page) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
                className={cn(
                    "relative z-10 w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                    "max-w-[980px]"
                )}
            >
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-[13px] font-semibold text-slate-800">
                                {campaignId ? "Edit Full Page Campaign" : "Create Full Page Campaign"}
                            </h2>
                            <p className="text-[10px] font-bold text-pink-500 uppercase leading-none mt-1">Page: {page.page_name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">
                    {isLoadingData ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                                    <FPC_Field label="Auto Reply Campaign Name" required>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                            placeholder="Write your auto reply campaign name here"
                                        />
                                    </FPC_Field>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                                        <h3 className="text-sm font-semibold text-slate-700">Offensive Comments Settings</h3>
                                    </div>
                                    <div className="flex gap-8">
                                        <FPC_Toggle label="Hide Comment" active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} />
                                        <FPC_Toggle label="Delete Comment" active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600">Offensive keywords <span className="text-slate-400 font-normal">(comma separated)</span></label>
                                            <div className="relative">
                                                <textarea rows={4} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] resize-none"
                                                    placeholder="keyword1, keyword2..."
                                                />
                                                <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-sm font-medium text-slate-600">Private reply template</label>
                                                <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                    <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={form.offensive.private_reply_template_id ?? ""}
                                                    onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                >
                                                    <option value="">Please select a message template</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between py-1 px-1">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to send reply message to a user multiple times?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to enable comment reply?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <EyeOff className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to hide comments after comment reply?</span>
                                        </div>
                                        <FPC_Toggle label="" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                    </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "generic" })}>
                                        <FPC_CapsuleSwitch active={form.reply_type === "generic"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "generic" ? "text-pink-600" : "text-slate-400")}>Generic message for all comments</span>
                                    </div>
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "filter" })}>
                                        <FPC_CapsuleSwitch active={form.reply_type === "filter"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "filter" ? "text-pink-600" : "text-slate-400")}>Send different messages by keyword filter</span>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {form.reply_type === "generic" ? (
                                        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                                            <FPC_Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                    <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                        className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]" placeholder="Type your message here..."
                                                    />
                                                    <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                </div>
                                            </FPC_Field>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FPC_UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                <FPC_UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                        <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                                                    </label>
                                                    <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                        <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                    >
                                                        <option value="">Please select a message template</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {filterRules.map((rule, idx) => (
                                                <div key={rule.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-8 relative group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                    {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-slate-700" : "text-slate-400")}>Exact match</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                    {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-slate-700" : "text-slate-400")}>Contains word</span>
                                                            </div>
                                                        </div>
                                                        {filterRules.length > 1 && (
                                                            <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <FPC_Field label="Filter Word/Sentence" required>
                                                        <input type="text" value={rule.keyword} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keyword: e.target.value } : r))}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            placeholder="Write your filter word here"
                                                        />
                                                    </FPC_Field>

                                                    <FPC_Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                        <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                            <textarea rows={4} value={rule.message} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: e.target.value } : r))}
                                                                className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                                                            />
                                                            <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                        </div>
                                                    </FPC_Field>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <FPC_UploadBox label="Image for Comment Reply" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                                                        <FPC_UploadBox label="Video for Comment Reply" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                                <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                                                            </label>
                                                            <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                                <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                    <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <select value={rule.private_template_id ?? ""} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, private_template_id: e.target.value } : r))}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                            >
                                                                <option value="">Please select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-end">
                                                <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 font-semibold text-[11px]  hover:bg-pink-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-100/20">
                                                    <Plus className="w-4 h-4" /> Add another filter rule
                                                </button>
                                            </div>

                                            {/* Fallback */}
                                            <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <Info className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-500">Fallback reply (when no filter matches)</span>
                                                </div>
                                                <FPC_Field label="Message for Comment Reply" icon={MessageCircle}>
                                                    <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                        <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                            className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                                                        />
                                                        <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                    </div>
                                                </FPC_Field>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <FPC_UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                    <FPC_UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between px-1">
                                                        <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                            <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template (Fallback)
                                                        </label>
                                                        <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                            <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                        >
                                                            <option value="">Please select a message template</option>
                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0">
                    <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={isSaving || isLoadingData} className="flex-[2] py-3.5 rounded-xl bg-pink-600 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                        <span>{campaignId ? "UPDATE CAMPAIGN" : "SAVE CHANGES"}</span>
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

`;

fs.writeFileSync('botchat-app/app/dashboard/facebook/comment-manager/page.tsx', prefix + newContent);
