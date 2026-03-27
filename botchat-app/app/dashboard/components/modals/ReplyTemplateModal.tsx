"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    X, Zap, Save, Loader2, RefreshCw, Layers, 
    Sparkles, Smile, Clock, Search, Check, Send
} from "lucide-react";
import { useModal } from "@/components/providers/ModalProvider";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ── Emoji DB ──────────────────────────────────────────────────────────────────
const EC = [
  { id:"recent",  label:"Recent",          icon:"🕐" as string, emojis:[] as string[] },
  { id:"smileys", label:"Smileys & People", icon:"😀", emojis:["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😲","😳","🥺","😦","😧","😨","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","👾","🤖","👋","🤚","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","👍","👎","✊","👏","🙌","🤝","🙏","💪","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝"] },
  { id:"animals",  label:"Animals & Nature",  icon:"🐻", emojis:["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂","🐢","🐍","🦎","🦕","🦖","🦈","🐬","🐋","🐳","🦭","🐊","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐓","🦤","🦚","🦜","🦢","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐿","🦔","🌸","🌺","🌹","🌷","🌼","🌻","🌞","🌝","🌚","🌙","⭐","🌟","💫","✨","☀️","⛅","☁️","🌈","☔","⚡","🔥","🌊","💧","🌿","🍀","🍁","🍃","🌱","🌲","🌳","🌴","🪴","🦋","🐾","🍄","🌵"] },
];

interface ReplyTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    editingTemplate: any | null;
    platform: "facebook" | "instagram";
}

// ── Emoji Picker Component (Shared Logic) ────────────────────────────────────
function EmojiPicker({ onSelect, onClose, recent }: { onSelect:(e:string)=>void; onClose:()=>void; recent:string[] }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e:MouseEvent) => { if(ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const scrollTo = (id:string) => {
    const el = document.getElementById(`cat-${id}`);
    if(el && listRef.current) listRef.current.scrollTo({ top: el.offsetTop - 10, behavior: "smooth" });
    setQ("");
  };
  const allFiltered = q ? EC.flatMap(c => c.emojis).filter(e => e.includes(q)).slice(0,100) : null;
  return (
    <motion.div ref={ref} initial={{opacity:0,scale:0.95,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}}
      className="w-[320px] sm:w-[380px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-[32px] shadow-[0_32px_96px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
    >
      <div className="flex items-center px-4 pt-4 pb-2 gap-1 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-800">
        {EC.map(cat => (
          <button key={cat.id} onClick={()=>scrollTo(cat.id)} className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[18px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">{cat.icon}</button>
        ))}
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Search emojis…" value={q} onChange={e=>setQ(e.target.value)} className="w-full pl-10 pr-4 py-2 text-[13px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/10 text-slate-700 dark:text-slate-200" />
        </div>
      </div>
      <div ref={listRef} className="max-h-[300px] overflow-y-auto px-4 pb-4 no-scrollbar scroll-smooth">
        {allFiltered ? (
          <div className="grid grid-cols-7 gap-1 pt-2">{allFiltered.map((emoji,i) => <button key={i} onClick={()=>{onSelect(emoji); setQ("");}} className="text-[24px] h-10 w-10 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all">{emoji}</button>)}</div>
        ) : (
          EC.map(cat => (
            <div key={cat.id} id={`cat-${cat.id}`} className="mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">{cat.label}</p>
              <div className="grid grid-cols-7 gap-1">{cat.emojis.map((emoji,i) => <button key={i} onClick={()=>onSelect(emoji)} className="text-[24px] h-10 w-10 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all">{emoji}</button>)}</div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── MAIN MODAL COMPONENT ─────────────────────────────────────────────────────
export function ReplyTemplateModal({ isOpen, onClose, onSaved, editingTemplate, platform }: ReplyTemplateModalProps) {
    const { showModal } = useModal();
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [replyType, setReplyType] = useState("generic");
    const [isSaving, setIsSaving] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [recent, setRecent] = useState<string[]>([]);
    
    const textRef = useRef<HTMLTextAreaElement>(null);
    const emojiTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (editingTemplate) {
            setName(editingTemplate.name || "");
            setMessage(editingTemplate.message || "");
            setReplyType(editingTemplate.reply_type || "generic");
        } else {
            setName(""); setMessage(""); setReplyType("generic");
        }
    }, [editingTemplate, isOpen]);

    const addRecent = (e:string) => setRecent(p => [e,...p.filter(x=>x!==e)].slice(0,32));
    
    const insertEmoji = useCallback((emoji:string) => {
        addRecent(emoji);
        const el = textRef.current;
        if(!el){ setMessage(message+emoji); return; }
        const s = el.selectionStart ?? message.length;
        const e2 = el.selectionEnd ?? message.length;
        setMessage(message.slice(0,s)+emoji+message.slice(e2));
        setTimeout(()=>{ if(textRef.current){ textRef.current.focus(); textRef.current.setSelectionRange(s+emoji.length,s+emoji.length); }}, 0);
    },[message]);

    const handleSave = async () => {
        if (!name.trim()) return showModal("error", "Error", "Template name is required");
        if (!message.trim()) return showModal("error", "Error", "Response message is required");

        setIsSaving(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/auto-reply-template" : "/instagram/auto-reply-template";
            const payload = { name, message, reply_type: replyType, platform };
            let res;
            if (editingTemplate?.id) res = await api.patch(`${endpoint}/${editingTemplate.id}`, payload);
            else res = await api.post(endpoint, payload);

            if (res.data.success || res.data.is_success) {
                showModal("success", "Success", "Rule Finalized : Automation Synchronized");
                onSaved();
                onClose();
            }
        } catch(err) { showModal("error", "Error", "Deployment Rejected"); }
        finally { setIsSaving(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} 
                        className="bg-[#fdfdff] dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-[900px] overflow-hidden flex flex-col max-h-[94vh] relative z-10"
                        onClick={e=>e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-5 px-10 py-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Zap className="w-6 h-6 text-white text-blue-100"/>
                             </div>
                             <div className="flex-1">
                                <h2 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{editingTemplate ? 'Modify Auto Reply' : 'Initialize Auto Reply'}</h2>
                                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5">{platform} Automation Engine</p>
                             </div>
                             <button onClick={onClose} className="p-3 rounded-2xl text-slate-300 hover:text-rose-500 transition-all active:scale-95"><X className="w-6 h-6"/></button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Template Asset Identity <span className="text-rose-500">*</span></label>
                                <input autoFocus type="text" placeholder='e.g. "Customer Support Handshake"' value={name} onChange={e=>setName(e.target.value)}
                                    className="w-full px-6 py-4.5 rounded-[24px] bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-blue-500 text-[15px] font-bold outline-none transition-all placeholder:text-slate-200"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none">Response Metadata Payload <span className="text-rose-500">*</span></label>
                                    <button ref={emojiTriggerRef} type="button" onClick={()=>setShowEmoji(!showEmoji)} className={cn("flex items-center gap-2 px-5 py-2 rounded-[18px] text-[12px] font-bold border transition-all", showEmoji ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400 hover:text-blue-600")}>
                                        <Smile className="w-4 h-4"/> Add Emoji
                                    </button>
                                </div>
                                <div className="relative">
                                    <textarea ref={textRef} rows={5} value={message} onChange={e=>setMessage(e.target.value)}
                                        placeholder={`Deploy textual response asset here…`}
                                        className="w-full p-8 rounded-[32px] bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 text-[16px] font-medium outline-none focus:border-blue-500 transition-all resize-none shadow-inner"
                                    />
                                    <div className="absolute top-4 right-4 text-[10px] font-black text-slate-200 uppercase tracking-widest pointer-events-none">Static Payload</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Automation Logic Type</label>
                                <div className="flex gap-5">
                                    <button onClick={()=>setReplyType('generic')} className={cn("flex-1 p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group", replyType === 'generic' ? "border-blue-500 bg-blue-50/20 text-blue-600" : "border-slate-50 dark:border-slate-800 bg-slate-50/50 text-slate-300")}>
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", replyType==='generic' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-110" : "bg-white dark:bg-slate-800 text-slate-300 group-hover:scale-110")}>
                                            <Layers size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-black uppercase tracking-widest">Generic Response</p>
                                            <p className="text-[10px] font-medium uppercase mt-1 opacity-60">Fires for every interaction</p>
                                        </div>
                                    </button>
                                    <button onClick={()=>setReplyType('filtered')} className={cn("flex-1 p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group", replyType === 'filtered' ? "border-indigo-500 bg-indigo-50/20 text-indigo-600" : "border-slate-50 dark:border-slate-800 bg-slate-50/50 text-slate-300")}>
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", replyType==='filtered' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-110" : "bg-white dark:bg-slate-800 text-slate-300 group-hover:scale-110")}>
                                            <Zap size={24} />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[12px] font-black uppercase tracking-widest">Keyword Filtered</p>
                                            <p className="text-[10px] font-medium uppercase mt-1 opacity-60">Conditional deployment logic</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-4 px-10 py-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                             <button onClick={onClose} className="flex-1 py-5 rounded-[22px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[13px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel Activation</button>
                             <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-5 rounded-[22px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[14px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {isSaving ? "Synchronizing Asset..." : "Register Global Logic"}
                             </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {showEmoji && (
                  <div className="fixed inset-0 z-[200] pointer-events-none">
                    <div className="absolute inset-0 pointer-events-auto" onClick={()=>setShowEmoji(false)}/>
                    <div 
                      style={{
                        position: 'fixed',
                        bottom: window.innerHeight - (emojiTriggerRef.current?.getBoundingClientRect().top ?? 0) + 12,
                        right: window.innerWidth - (emojiTriggerRef.current?.getBoundingClientRect().right ?? 0),
                        pointerEvents: 'auto'
                      }}
                    >
                      <EmojiPicker onSelect={insertEmoji} onClose={()=>setShowEmoji(false)} recent={recent}/>
                    </div>
                  </div>
                )}
            </AnimatePresence>
        </AnimatePresence>
    );
}
