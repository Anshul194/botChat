"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, Edit2, Loader2, Check, X, ChevronLeft, RefreshCw, Search, Tag, Sparkles, Calendar, Hash, AlertTriangle, Smile, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { useRouter } from "next/navigation";

// ── Emoji DB ──────────────────────────────────────────────────────────────────
const EC = [
  { id:"recent",  label:"Recent",          icon:"🕐" as string, emojis:[] as string[] },
  { id:"smileys", label:"Smileys & People", icon:"😀", emojis:["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😲","😳","🥺","😦","😧","😨","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","👾","🤖","👋","🤚","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","👍","👎","✊","👏","🙌","🤝","🙏","💪","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝"] },
  { id:"animals",  label:"Animals & Nature",  icon:"🐻", emojis:["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂","🐢","🐍","🦎","🦕","🦖","🦈","🐬","🐋","🐳","🦭","🐊","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐓","🦤","🦚","🦜","🦢","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐿","🦔","🌸","🌺","🌹","🌷","🌼","🌻","🌞","🌝","🌚","🌙","⭐","🌟","💫","✨","☀️","⛅","☁️","🌈","☔","⚡","🔥","🌊","💧","🌿","🍀","🍁","🍃","🌱","🌲","🌳","🌴","🪴","🦋","🐾","🍄","🌵"] },
  { id:"food",     label:"Food & Drink",      icon:"🍎", emojis:["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🫑","🥕","🧄","🧅","🥔","🍠","🥜","🫘","🌰","🍞","🥐","🥖","🫓","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫔","🌮","🌯","🥙","🧆","🥚","🍲","🍛","🍜","🍝","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥐","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾"] },
  { id:"activity", label:"Activities",         icon:"⚽", emojis:["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🥊","🥋","⛳","🏹","🎣","🤿","🎽","🎿","🛷","🥌","⛸","🛹","🛼","🪂","🏋️","🤼","🤸","🤺","⛹️","🤾","🏌️","🏇","🧘","🏄","🏊","🤽","🚵","🚴","🎯","🎳","🎮","🕹","🎲","♟","🧩","🪄","🎭","🎨","🎬","🎤","🎧","🎼","🎵","🎶","🎸","🎹","🪗","🥁","🪘","🎺","🎻","🏆","🥇","🥈","🥉","🏅","🎖","🎗","🎫","🎟","🎪"] },
  { id:"travel",   label:"Travel & Places",    icon:"✈️", emojis:["🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍","🛵","🛺","🚲","🛴","🛹","🛼","🚏","🛣","🛤","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛥","🚢","✈️","🛩","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰","🚀","🛸","🌍","🌎","🌏","🌐","🗺","🧭","🏔","⛰","🌋","🗻","🏕","🏖","🏜","🏝","🏞","🏟","🏛","🏗","🧱","🪨","🪵","🛖","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","💒","🗼","🗽","⛪","🕌","🛕","🕍","⛩","🕋","⛲","⛺","🌁","🌃","🌄","🌅","🌆","🌇","🌉","🎠","🎡","🎢","💈"] },
  { id:"objects",  label:"Objects",             icon:"💡", emojis:["💡","🔦","🕯","🪔","🔮","🧿","💎","💍","🛒","🎁","🎀","🎊","🎉","🎈","🧨","✨","🎇","🎆","🎃","🎄","🎋","🧸","🪆","🖼","🎰","🪅","📱","💻","⌨️","🖱","🖨","📞","☎️","📟","📠","📺","📻","🧭","⏰","⌛","⏱","🗓","📅","📆","🗒","📇","📋","📁","📂","🗂","🗃","🗄","🗑","🔒","🔓","🔏","🔑","🗝","🔨","🪓","⛏","⚒","🛠","🗡","⚔️","🛡","🪚","🔧","🪛","🔩","⚙️","🗜","⚖️","🦯","🔗","⛓","🪝","🧲","🪜","🧰","🧲","🔬","🔭","📡","💊","🩺","🩹","🩻","🧬","🧫","🧪","🌡","🧹","🧺","🧻","🪣","🧼","🪥","🧽","🧴","🛁","🪒","🧷","🧶","🪡","🧵","🪢","🔐","📎","📏","📐","✂️","🗃","🗄","🗑","📦","📫","📪","📬","📭","📮","🗳","✏️","✒️","🖋","🖊","🖌","🖍","📝","💼","📔","📒","📚","📖","🔖","🏷","💰","🪙","💴","💵","💶","💷","💸","💳","🧾","📊","📈","📉","🗂","📋","📌","📍","✂️","🔎","🔍"] },
  { id:"symbols",  label:"Symbols",             icon:"🔣", emojis:["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💯","🔥","✨","🌟","⚡","💥","💫","🎯","👑","💰","💸","🎉","🙏","💪","🤝","✅","❌","‼️","⁉️","❓","💬","💭","🗯","📢","📣","🔔","🚀","💎","🌈","💤","🆚","🆕","🆓","🆒","🆗","🆙","🆘","⛔","🚫","🔞","♻️","⚜️","🔅","🔆","📶","🎵","🎶","🔱","⚡","🌀","♾","♻️","✔️","☑️","🔲","🔳","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🏁","🚩","🎌","🏴","🏳️"] },
  { id:"flags",    label:"Flags",               icon:"🏴", emojis:["🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇫","🇦🇱","🇩🇿","🇦🇩","🇦🇴","🇦🇷","🇦🇲","🇦🇺","🇦🇹","🇦🇿","🇧🇸","🇧🇭","🇧🇩","🇧🇧","🇧🇾","🇧🇪","🇧🇿","🇧🇯","🇧🇴","🇧🇦","🇧🇼","🇧🇷","🇧🇳","🇧🇬","🇧🇫","🇧🇮","🇨🇻","🇰🇭","🇨🇲","🇨🇦","🇨🇫","🇹🇩","🇨🇱","🇨🇳","🇨🇴","🇨🇬","🇨🇷","🇭🇷","🇨🇺","🇨🇾","🇨🇿","🇩🇰","🇩🇯","🇩🇴","🇪🇨","🇪🇬","🇸🇻","🇪🇹","🇫🇮","🇫🇷","🇬🇦","🇬🇲","🇬🇪","🇩🇪","🇬🇭","🇬🇷","🇬🇹","🇬🇳","🇭🇹","🇭🇳","🇭🇰","🇭🇺","🇮🇸","🇮🇳","🇮🇩","🇮🇷","🇮🇶","🇮🇪","🇮🇱","🇮🇹","🇯🇲","🇯🇵","🇯🇴","🇰🇿","🇰🇪","🇰🇵","🇰🇷","🇰🇼","🇰🇬","🇱🇦","🇱🇧","🇱🇷","🇱🇾","🇱🇮","🇱🇹","🇱🇺","🇲🇬","🇲🇼","🇲🇾","🇲🇻","🇲🇱","🇲🇹","🇲🇷","🇲🇽","🇲🇨","🇲🇳","🇲🇪","🇲🇦","🇳🇵","🇳🇱","🇳🇿","🇳🇬","🇳🇴","🇴🇲","🇵🇰","🇵🇦","🇵🇬","🇵🇾","🇵🇪","🇵🇭","🇵🇱","🇵🇹","🇶🇦","🇷🇴","🇷🇺","🇷🇼","🇸🇦","🇸🇳","🇷🇸","🇸🇱","🇸🇬","🇸🇰","🇸🇮","🇸🇴","🇿🇦","🇸🇸","🇪🇸","🇱🇰","🇸🇩","🇸🇷","🇸🇿","🇸🇪","🇨🇭","🇸🇾","🇹🇼","🇹🇯","🇹🇿","🇹🇭","🇹🇱","🇹🇬","🇹🇹","🇹🇳","🇹🇷","🇹🇲","🇺🇬","🇺🇦","🇦🇪","🇬🇧","🇺🇸","🇺🇾","🇺🇿","🇻🇪","🇻🇳","🇾🇪","🇿🇲","🇿🇼"] },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface CommentTemplate { id:number; name:string; messages:string[]; is_active:boolean; created_at?:string; }
interface ApiMeta { current_page:number; last_page:number; per_page:number; total:number; }
function fmtDate(d?:string){ if(!d) return "—"; return formatDate(new Date(d), 'DD MMM, YYYY'); }

// ── WhatsApp Emoji Picker ──────────────────────────────────────────────────────
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
    if(el && listRef.current) {
      listRef.current.scrollTo({ top: el.offsetTop - 10, behavior: "smooth" });
    }
    setQ("");
  };

  const allFiltered = q ? EC.flatMap(c => c.emojis).filter(e => e.includes(q)).slice(0,100) : null;

  return (
    <motion.div ref={ref}
      initial={{opacity:0,scale:0.95,y:10}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:10}}
      className="w-[320px] sm:w-[400px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-2xl shadow-[0_32px_96px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
      onClick={e=>e.stopPropagation()}
    >
      {/* Category tabs (Jump to) */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-1 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-800">
        {EC.map(cat => (
          <button key={cat.id} onClick={()=>scrollTo(cat.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[18px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title={cat.label}
          >
            {cat.id==="recent" ? <Clock className="w-4 h-4 text-slate-400"/> : cat.icon}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Search emojis…" value={q} onChange={e=>setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-pink-500/10 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Content Area */}
      <div ref={listRef} className="max-h-[320px] overflow-y-auto px-4 pb-4 custom-scrollbar scroll-smooth">
        {allFiltered ? (
          <div className="pt-2">
            <p className="text-[10px] font-medium text-slate-500 mb-3">Search Results</p>
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
              {allFiltered.map((emoji,i) => (
                <button key={i} onClick={()=>{onSelect(emoji); setQ("");}}
                  className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/20 transition-all hover:scale-125 active:scale-90"
                >{emoji}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Recent */}
            {recent.length > 0 && (
              <div id="cat-recent" className="pt-2 mb-4">
                <p className="text-[10px] font-medium text-slate-500 mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Recent</p>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {recent.map((emoji,i) => (
                    <button key={i} onClick={()=>onSelect(emoji)}
                      className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-pink-50 transition-all hover:scale-125 active:scale-90"
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories in one list */}
            {EC.filter(c=>c.id!=="recent").map(cat => (
              <div key={cat.id} id={`cat-${cat.id}`} className="mb-6">
                <p className="text-[10px] font-medium text-slate-500 mb-3 px-1">{cat.label}</p>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {cat.emojis.map((emoji,i) => (
                    <button key={i} onClick={()=>onSelect(emoji)}
                      className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/20 transition-all hover:scale-125 active:scale-90"
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Message Row ────────────────────────────────────────────────────────────────
function MessageRow({ value, index, onChange, onRemove, showRemove, recent, addRecent }:{
  value:string; index:number; onChange:(v:string)=>void; onRemove:()=>void; showRemove:boolean;
  recent:string[]; addRecent:(e:string)=>void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = useCallback((emoji:string) => {
    addRecent(emoji);
    const el = textRef.current;
    if(!el){ onChange(value+emoji); return; }
    const s = el.selectionStart ?? value.length;
    const e2 = el.selectionEnd ?? value.length;
    onChange(value.slice(0,s)+emoji+value.slice(e2));
    setTimeout(()=>{
      if(!textRef.current) return;
      textRef.current.focus();
      textRef.current.setSelectionRange(s+emoji.length,s+emoji.length);
    }, 0);
  },[value, onChange, addRecent]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      {/* Card-style input */}
      <div className={cn(
        "rounded-2xl border-2 bg-white transition-all overflow-hidden shadow-sm",
        showEmoji ? "border-pink-400 shadow-xl shadow-pink-500/5 ring-4 ring-pink-500/5" : "border-slate-200/70 focus-within:border-pink-400/60 focus-within:shadow-xl focus-within:shadow-pink-500/5 focus-within:ring-4 focus-within:ring-pink-500/5"
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
              <span className="text-[11px] font-semibold text-pink-600">{index+1}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">Message context</span>
          </div>
          {showRemove && (
            <button onClick={onRemove} className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <Trash2 className="w-4 h-4"/>
            </button>
          )}
        </div>

        {/* Textarea */}
        <textarea ref={textRef} rows={3} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={`Enter the automated comment text here…`}
          className="w-full px-6 py-4 text-[15px] font-medium resize-none outline-none bg-white text-slate-800 placeholder:text-slate-300 leading-relaxed min-h-[100px]"
        />

        {/* Emoji trigger row */}
        <div className="flex items-center justify-end px-5 pb-3">
          <button ref={buttonRef} type="button" onClick={()=>setShowEmoji(v=>!v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-[13px] font-bold transition-all border",
              showEmoji ? "bg-pink-50 border-pink-100 text-pink-600" : "bg-white border-slate-100 text-slate-500 hover:text-pink-600 hover:bg-pink-50/50 hover:border-pink-100"
            )}
          >
            <Smile className={cn("w-4 h-4 transition-transform", showEmoji && "scale-110")}/>
            {showEmoji ? "Choose Emoji" : "Add Emoji"}
          </button>
        </div>
      </div>

      {/* Fixed Emoji Picker to avoid clipping */}
      <AnimatePresence>
        {showEmoji && (
          <div className="fixed inset-0 z-[200] pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" onClick={()=>setShowEmoji(false)}/>
            <div 
              style={{
                position: 'fixed',
                bottom: window.innerHeight - (buttonRef.current?.getBoundingClientRect().top ?? 0) + 12,
                right: window.innerWidth - (buttonRef.current?.getBoundingClientRect().right ?? 0),
                pointerEvents: 'auto'
              }}
            >
              <EmojiPicker onSelect={insertEmoji} onClose={()=>setShowEmoji(false)} recent={recent}/>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Template Form Modal ────────────────────────────────────────────────────────
export function TemplateFormModal({ mode, initial, onClose, onSaved }:{
  mode:"create"|"edit"; initial:CommentTemplate|null; onClose:()=>void; onSaved:()=>void;
}) {
  const [formName, setFormName] = useState(initial?.name??"");
  const [formMessages, setFormMessages] = useState<string[]>(initial?.messages?.length ? initial.messages : [""]);
  const [isSaving, setIsSaving] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const addRecent = (e:string) => setRecent(p => [e,...p.filter(x=>x!==e)].slice(0,32));
  const addRow = () => setFormMessages(p=>[...p,""]);
  const updateRow = (i:number,v:string) => setFormMessages(p=>p.map((m,idx)=>idx===i?v:m));
  const removeRow = (i:number) => setFormMessages(p=>p.length>1?p.filter((_,idx)=>idx!==i):p);

  const handleSave = async () => {
    const name = formName.trim();
    const messages = formMessages.map(m=>m.trim()).filter(Boolean);
    if(!name){ toast.error("Template name is required"); return; }
    if(!messages.length){ toast.error("Add at least one message"); return; }
    
    setIsSaving(true);
    const payload = {
      _token: "xPVUKlvKC2lW1ArIjvRCKVyCmJhsoUrUaUyC6bGr",
      id: mode === "edit" ? initial?.id : "",
      name: name,
      messages: messages
    };

    try {
      if(mode==="create") {
        await api.post("/facebook/comment-template", payload, {
          headers: { Accept: "application/json", "Content-Type": "application/json" }
        });
      } else {
        await api.patch(`/facebook/comment-template/${initial!.id}`, payload, {
          headers: { Accept: "application/json", "Content-Type": "application/json" }
        });
      }
      toast.success(mode==="create"?"Template created! 🎉":"Template updated! ✅");
      onSaved();
    } catch(err:any){ toast.error(err?.response?.data?.message??"Save failed"); }
    finally{ setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <motion.div
        initial={{opacity:0,scale:0.96,y:24}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96,y:24}}
        transition={{type:"spring",stiffness:380,damping:32}}
        className="relative z-10 w-full max-w-none sm:max-w-[1050px] min-h-screen sm:min-h-0 bg-[#fdfdff] rounded-none sm:rounded-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e=>e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-8 py-5 bg-white border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-pink-500 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-200 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white"/>
          </div>
          <div className="flex-1">
            <h2 className="text-[16px] font-semibold text-slate-900 uppercase tracking-tight">
              {mode==="create"?"Create Comment Template":"Edit Template"}
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {mode==="create"?"Define a reusable pool of auto comment phrases.":`Updating: ${initial?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-500">
              Template Name <span className="text-rose-400">*</span>
            </label>
            <input autoFocus type="text" placeholder='e.g. "Positive Comments 🔥"' value={formName}
              onChange={e=>setFormName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:border-pink-400 focus:shadow-lg focus:shadow-pink-100 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-medium text-slate-500">
                  Auto Messages <span className="text-rose-400">*</span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">One phrase will be picked randomly when auto-commenting.</p>
              </div>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 text-[12px] font-bold hover:bg-pink-100 transition-all border border-pink-100"
              >
                <Plus className="w-3.5 h-3.5"/> Add More
              </button>
            </div>

            <AnimatePresence>
              {formMessages.map((msg,idx)=>(
                <motion.div key={idx} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,height:0}} transition={{duration:0.15}}>
                  <MessageRow value={msg} index={idx} onChange={v=>updateRow(idx,v)}
                    onRemove={()=>removeRow(idx)} showRemove={formMessages.length>1}
                    recent={recent} addRecent={addRecent}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Preview */}
            {formMessages.filter(m=>m.trim()).length>0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-50 border border-pink-100">
                <p className="text-[10px] font-medium text-pink-500 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3"/> Preview · Rotates randomly
                </p>
                <div className="flex flex-wrap gap-2">
                  {formMessages.filter(m=>m.trim()).map((m,i)=>(
                    <span key={i} className="text-[13px] px-3 py-1.5 rounded-xl bg-white border border-pink-100 text-slate-700 font-medium shadow-sm break-words">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-5 bg-white border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-[14px] hover:bg-slate-200 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-[2] py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[14px] shadow-lg shadow-pink-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSaving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:<><Check className="w-4 h-4"/>{mode==="create"?"Create Template":"Save Changes"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function Stat({color,label,value}:{color:"pink"|"emerald"|"slate";label:string;value:number}){
  const dot={pink:"bg-pink-500",emerald:"bg-emerald-500",slate:"bg-slate-400"};
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className={cn("w-2 h-2 rounded-full",dot[color])}/>
      <span className="text-[12px] font-bold text-slate-600"><span className="text-slate-900">{value}</span> {label}</span>
    </div>
  );
}

export default function CommentTemplatesPage(){
  const router = useRouter();
  const [templates,setTemplates] = useState<CommentTemplate[]>([]);
  const [meta,setMeta] = useState<ApiMeta|null>(null);
  const [isLoading,setIsLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [deletingId,setDeletingId] = useState<number|null>(null);
  const [confirmDeleteId,setConfirmDeleteId] = useState<number|null>(null);
  const [formModal,setFormModal] = useState<{open:boolean;mode:"create"|"edit";template:CommentTemplate|null}>({open:false,mode:"create",template:null});

  const fetchTemplates = async()=>{
    setIsLoading(true);
    try{
      const res = await api.get("/facebook/comment-template",{headers:{Accept:"application/json","Content-Type":"application/json"}});
      const b = res.data;
      if(b?.success||b?.is_success){setTemplates(Array.isArray(b.data)?b.data:[]);if(b.meta)setMeta(b.meta);}
      else if(Array.isArray(b))setTemplates(b);
    }catch{toast.error("Failed to load");}
    finally{setIsLoading(false);}
  };
  useEffect(()=>{fetchTemplates();},[]);

  const handleDelete = async(id:number)=>{
    setDeletingId(id);
    try{
      await api.delete(`/facebook/comment-template/${id}`,{headers:{Accept:"application/json","Content-Type":"application/json"}});
      toast.success("Template deleted");
      setTemplates(p=>p.filter(t=>t.id!==id));
      setConfirmDeleteId(null);
    }catch{toast.error("Delete failed");}
    finally{setDeletingId(null);}
  };

  const openEdit = async(tpl:CommentTemplate)=>{
    try{
      const res = await api.get(`/facebook/comment-template/${tpl.id}`,{headers:{Accept:"application/json","Content-Type":"application/json"}});
      const raw=res.data; const detail=raw?.data??(raw?.success?raw.data:tpl);
      setFormModal({open:true,mode:"edit",template:detail??tpl});
    }catch{setFormModal({open:true,mode:"edit",template:tpl});}
  };

  const filtered = templates.filter(t=>
    t.name.toLowerCase().includes(search.toLowerCase())||
    t.messages?.some(m=>m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#0f172a] font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
        <div className="max-w-[1400px] w-full px-6 lg:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={()=>router.back()} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Facebook · Comment Manager</p>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Comment Templates</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <button onClick={fetchTemplates} disabled={isLoading} className="w-11 h-11 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all disabled:opacity-40 active:scale-90">
              <RefreshCw className={cn("w-4 h-4",isLoading&&"animate-spin")}/>
            </button>
            <button onClick={()=>setFormModal({open:true,mode:"create",template:null})}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-[13px] shadow-xl shadow-pink-500/30 active:scale-95 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5"/>
              <span>NEW TEMPLATE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-8">
        {/* Stats + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Stat color="pink" label="Total" value={templates.length}/>
            <Stat color="emerald" label="Active" value={templates.filter(t=>t.is_active).length}/>
            {meta&&<Stat color="slate" label="Per Page" value={meta.per_page}/>}
          </div>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
            <input type="text" placeholder="Search templates…" value={search} onChange={e=>setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/10 transition-all min-w-[260px] shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-4 px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            {["Template Name","Messages","Status","Created","Actions"].map(c=>(
              <span key={c} className="text-[10px] font-medium text-slate-500">{c}</span>
            ))}
          </div>

          {isLoading&&(
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {[1,2,3,4].map(i=>(
                <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-4 px-6 py-4 items-center">
                  <div className="h-4 rounded-lg bg-slate-100 animate-pulse w-3/4"/><div className="h-4 rounded-lg bg-slate-100 animate-pulse w-1/2"/>
                  <div className="h-5 rounded-full bg-slate-100 animate-pulse w-16"/><div className="h-4 rounded-lg bg-slate-100 animate-pulse w-2/3"/>
                  <div className="h-8 rounded-xl bg-slate-100 animate-pulse"/>
                </div>
              ))}
            </div>
          )}

          {!isLoading&&filtered.length===0&&(
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-pink-300"/>
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-white uppercase">{search?"No results":"No templates yet"}</h3>
              <p className="text-sm text-slate-400 mt-1.5 max-w-xs">{search?"Try a different keyword.":"Create your first comment template."}</p>
              {!search&&<button onClick={()=>setFormModal({open:true,mode:"create",template:null})}
                className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:scale-105 transition-all">
                <Plus className="w-4 h-4"/> Create Template
              </button>}
            </div>
          )}

          {!isLoading&&filtered.length>0&&(
            <div className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {filtered.map((tpl,idx)=>(
                <motion.div key={tpl.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:idx*0.04}}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-4 px-6 py-4 items-center group hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                      <MessageSquare className="w-4 h-4 text-pink-500"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">{tpl.name}</p>
                      {tpl.messages?.[0]&&<p className="text-[11px] text-slate-400 italic truncate mt-0.5 max-w-[240px]">{tpl.messages[0]}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 w-fit">
                    <Hash className="w-3 h-3 text-slate-400"/>
                    <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{tpl.messages?.length??0}<span className="font-medium text-slate-400 ml-0.5">msgs</span></span>
                  </div>
                  <div>
                    {tpl.is_active
                      ?<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[11px] font-bold border border-emerald-100"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Active</span>
                      :<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold border border-slate-200"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>Inactive</span>
                    }
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-300 flex-shrink-0"/>
                    <span className="text-[12px] font-medium">{fmtDate(tpl.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={()=>openEdit(tpl)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-pink-600 hover:border-pink-300 hover:bg-pink-50 transition-all text-[11px] font-bold">
                      <Edit2 className="w-3.5 h-3.5"/> Edit
                    </button>
                    <button onClick={()=>setConfirmDeleteId(tpl.id)} disabled={deletingId===tpl.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 transition-all disabled:opacity-30">
                      {deletingId===tpl.id?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Trash2 className="w-3.5 h-3.5"/>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading&&filtered.length>0&&(
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">Showing <span className="text-slate-600 dark:text-slate-300">{filtered.length}</span> of <span className="text-slate-600 dark:text-slate-300">{templates.length}</span> templates</p>
              {meta&&<p className="text-[11px] text-slate-400 font-medium">{meta.total} total · {meta.per_page} per page</p>}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {formModal.open&&(
          <TemplateFormModal mode={formModal.mode} initial={formModal.template}
            onClose={()=>setFormModal(s=>({...s,open:false}))}
            onSaved={()=>{setFormModal(s=>({...s,open:false}));fetchTemplates();}}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDeleteId!==null&&(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setConfirmDeleteId(null)}/>
            <motion.div initial={{opacity:0,scale:0.95,y:8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:8}}
              transition={{type:"spring",stiffness:400,damping:30}}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-500"/>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase">Delete Template?</h3>
                  <p className="text-[13px] text-slate-500 mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-[13px] hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={()=>handleDelete(confirmDeleteId)} disabled={deletingId!==null}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-[13px] shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deletingId!==null?<><Loader2 className="w-4 h-4 animate-spin"/>Deleting…</>:<><Trash2 className="w-4 h-4"/>Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
