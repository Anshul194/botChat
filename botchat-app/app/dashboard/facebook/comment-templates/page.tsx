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
  { id: "recent", label: "Recent", icon: "🕐" as string, emojis: [] as string[] },
  { id: "smileys", label: "Smileys & People", icon: "😀", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤧", "🥵", "🥶", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮", "😲", "😳", "🥺", "😦", "😧", "😨", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "👋", "🤚", "✋", "🖖", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "👍", "👎", "✊", "👏", "🙌", "🤝", "🙏", "💪", "🫶", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"] },
  { id: "animals", label: "Animals & Nature", icon: "🐻", emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🦂", "🐢", "🐍", "🦎", "🦕", "🦖", "🦈", "🐬", "🐋", "🐳", "🦭", "🐊", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐈", "🐓", "🦤", "🦚", "🦜", "🦢", "🕊", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐿", "🦔", "🌸", "🌺", "🌹", "🌷", "🌼", "🌻", "🌞", "🌝", "🌚", "🌙", "⭐", "🌟", "💫", "✨", "☀️", "⛅", "☁️", "🌈", "☔", "⚡", "🔥", "🌊", "💧", "🌿", "🍀", "🍁", "🍃", "🌱", "🌲", "🌳", "🌴", "🪴", "🦋", "🐾", "🍄", "🌵"] },
  { id: "food", label: "Food & Drink", icon: "🍎", emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🥕", "🧄", "🧅", "🥔", "🍠", "🥜", "🫘", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🧀", "🥚", "🍳", "🧈", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🫔", "🌮", "🌯", "🥙", "🧆", "🥚", "🍲", "🍛", "🍜", "🍝", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥮", "🍢", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🍩", "🍪", "🌰", "🥐", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧉", "🍾"] },
  { id: "activity", label: "Activities", icon: "⚽", emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🏓", "🏸", "🥊", "🥋", "⛳", "🏹", "🎣", "🤿", "🎽", "🎿", "🛷", "🥌", "⛸", "🛹", "🛼", "🪂", "🏋️", "🤼", "🤸", "🤺", "⛹️", "🤾", "🏌️", "🏇", "🧘", "🏄", "🏊", "🤽", "🚵", "🚴", "🎯", "🎳", "🎮", "🕹", "🎲", "♟", "🧩", "🪄", "🎭", "🎨", "🎬", "🎤", "🎧", "🎼", "🎵", "🎶", "🎸", "🎹", "🪗", "🥁", "🪘", "🎺", "🎻", "🏆", "🥇", "🥈", "🥉", "🏅", "🎖", "🎗", "🎫", "🎟", "🎪"] },
  { id: "travel", label: "Travel & Places", icon: "✈️", emojis: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍", "🛵", "🛺", "🚲", "🛴", "🛹", "🛼", "🚏", "🛣", "🛤", "⛽", "🚨", "🚥", "🚦", "🛑", "🚧", "⚓", "🛥", "🚢", "✈️", "🛩", "🛫", "🛬", "🪂", "💺", "🚁", "🚟", "🚠", "🚡", "🛰", "🚀", "🛸", "🌍", "🌎", "🌏", "🌐", "🗺", "🧭", "🏔", "⛰", "🌋", "🗻", "🏕", "🏖", "🏜", "🏝", "🏞", "🏟", "🏛", "🏗", "🧱", "🪨", "🪵", "🛖", "🏠", "🏡", "🏢", "🏣", "🏤", "🏥", "🏦", "🏨", "🏩", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "💒", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩", "🕋", "⛲", "⛺", "🌁", "🌃", "🌄", "🌅", "🌆", "🌇", "🌉", "🎠", "🎡", "🎢", "💈"] },
  { id: "objects", label: "Objects", icon: "💡", emojis: ["💡", "🔦", "🕯", "🪔", "🔮", "🧿", "💎", "💍", "🛒", "🎁", "🎀", "🎊", "🎉", "🎈", "🧨", "✨", "🎇", "🎆", "🎃", "🎄", "🎋", "🧸", "🪆", "🖼", "🎰", "🪅", "📱", "💻", "⌨️", "🖱", "🖨", "📞", "☎️", "📟", "📠", "📺", "📻", "🧭", "⏰", "⌛", "⏱", "🗓", "📅", "📆", "🗒", "📇", "📋", "📁", "📂", "🗂", "🗃", "🗄", "🗑", "🔒", "🔓", "🔏", "🔑", "🗝", "🔨", "🪓", "⛏", "⚒", "🛠", "🗡", "⚔️", "🛡", "🪚", "🔧", "🪛", "🔩", "⚙️", "🗜", "⚖️", "🦯", "🔗", "⛓", "🪝", "🧲", "🪜", "🧰", "🧲", "🔬", "🔭", "📡", "💊", "🩺", "🩹", "🩻", "🧬", "🧫", "🧪", "🌡", "🧹", "🧺", "🧻", "🪣", "🧼", "🪥", "🧽", "🧴", "🛁", "🪒", "🧷", "🧶", "🪡", "🧵", "🪢", "🔐", "📎", "📏", "📐", "✂️", "🗃", "🗄", "🗑", "📦", "📫", "📪", "📬", "📭", "📮", "🗳", "✏️", "✒️", "🖋", "🖊", "🖌", "🖍", "📝", "💼", "📔", "📒", "📚", "📖", "🔖", "🏷", "💰", "🪙", "💴", "💵", "💶", "💷", "💸", "💳", "🧾", "📊", "📈", "📉", "🗂", "📋", "📌", "📍", "✂️", "🔎", "🔍"] },
  { id: "symbols", label: "Symbols", icon: "🔣", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💯", "🔥", "✨", "🌟", "⚡", "💥", "💫", "🎯", "👑", "💰", "💸", "🎉", "🙏", "💪", "🤝", "✅", "❌", "‼️", "⁉️", "❓", "💬", "💭", "🗯", "📢", "📣", "🔔", "🚀", "💎", "🌈", "💤", "🆚", "🆕", "🆓", "🆒", "🆗", "🆙", "🆘", "⛔", "🚫", "🔞", "♻️", "⚜️", "🔅", "🔆", "📶", "🎵", "🎶", "🔱", "⚡", "🌀", "♾", "♻️", "✔️", "☑️", "🔲", "🔳", "⬛", "⬜", "◼️", "◻️", "◾", "◽", "▪️", "▫️", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🏁", "🚩", "🎌", "🏴", "🏳️"] },
  { id: "flags", label: "Flags", icon: "🏴", emojis: ["🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏳️‍⚧️", "🏴‍☠️", "🇦🇫", "🇦🇱", "🇩🇿", "🇦🇩", "🇦🇴", "🇦🇷", "🇦🇲", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇨🇻", "🇰🇭", "🇨🇲", "🇨🇦", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇴", "🇨🇬", "🇨🇷", "🇭🇷", "🇨🇺", "🇨🇾", "🇨🇿", "🇩🇰", "🇩🇯", "🇩🇴", "🇪🇨", "🇪🇬", "🇸🇻", "🇪🇹", "🇫🇮", "🇫🇷", "🇬🇦", "🇬🇲", "🇬🇪", "🇩🇪", "🇬🇭", "🇬🇷", "🇬🇹", "🇬🇳", "🇭🇹", "🇭🇳", "🇭🇰", "🇭🇺", "🇮🇸", "🇮🇳", "🇮🇩", "🇮🇷", "🇮🇶", "🇮🇪", "🇮🇱", "🇮🇹", "🇯🇲", "🇯🇵", "🇯🇴", "🇰🇿", "🇰🇪", "🇰🇵", "🇰🇷", "🇰🇼", "🇰🇬", "🇱🇦", "🇱🇧", "🇱🇷", "🇱🇾", "🇱🇮", "🇱🇹", "🇱🇺", "🇲🇬", "🇲🇼", "🇲🇾", "🇲🇻", "🇲🇱", "🇲🇹", "🇲🇷", "🇲🇽", "🇲🇨", "🇲🇳", "🇲🇪", "🇲🇦", "🇳🇵", "🇳🇱", "🇳🇿", "🇳🇬", "🇳🇴", "🇴🇲", "🇵🇰", "🇵🇦", "🇵🇬", "🇵🇾", "🇵🇪", "🇵🇭", "🇵🇱", "🇵🇹", "🇶🇦", "🇷🇴", "🇷🇺", "🇷🇼", "🇸🇦", "🇸🇳", "🇷🇸", "🇸🇱", "🇸🇬", "🇸🇰", "🇸🇮", "🇸🇴", "🇿🇦", "🇸🇸", "🇪🇸", "🇱🇰", "🇸🇩", "🇸🇷", "🇸🇿", "🇸🇪", "🇨🇭", "🇸🇾", "🇹🇼", "🇹🇯", "🇹🇿", "🇹🇭", "🇹🇱", "🇹🇬", "🇹🇹", "🇹🇳", "🇹🇷", "🇹🇲", "🇺🇬", "🇺🇦", "🇦🇪", "🇬🇧", "🇺🇸", "🇺🇾", "🇺🇿", "🇻🇪", "🇻🇳", "🇾🇪", "🇿🇲", "🇿🇼"] },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface CommentTemplate { id: number; name: string; messages: string[]; is_active: boolean; created_at?: string; }
interface ApiMeta { current_page: number; last_page: number; per_page: number; total: number; }
function fmtDate(d?: string) { if (!d) return "—"; return formatDate(new Date(d), 'DD MMM, YYYY'); }

// ── WhatsApp Emoji Picker ──────────────────────────────────────────────────────
function EmojiPicker({ onSelect, onClose, recent }: { onSelect: (e: string) => void; onClose: () => void; recent: string[] }) {
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (el && listRef.current) {
      listRef.current.scrollTo({ top: el.offsetTop - 10, behavior: "smooth" });
    }
    setQ("");
  };

  const allFiltered = q ? EC.flatMap(c => c.emojis).filter(e => e.includes(q)).slice(0, 100) : null;

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="w-[325px] sm:w-[400px] bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Category tabs (Jump to) */}
      <div className="flex items-center px-4 pt-4 pb-2 gap-1 overflow-x-auto no-scrollbar border-b border-[var(--border)]">
        {EC.map(cat => (
          <button key={cat.id} onClick={() => scrollTo(cat.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[18px] hover:bg-[var(--muted)] transition-all active:scale-90"
            title={cat.label}
          >
            {cat.id === "recent" ? <Clock className="w-4 h-4 text-[var(--muted-foreground)]" /> : cat.icon}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input type="text" placeholder="Search emojis…" value={q} onChange={e => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-[13.5px] rounded-2xl bg-[var(--muted)] border border-[var(--border)] outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Content Area */}
      <div ref={listRef} className="max-h-[320px] overflow-y-auto px-4 pb-4 custom-scrollbar scroll-smooth">
        {allFiltered ? (
          <div className="pt-2">
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-3">Search Results</p>
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
              {allFiltered.map((emoji, i) => (
                <button key={i} onClick={() => { onSelect(emoji); setQ(""); }}
                  className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--primary)]/20 transition-all hover:scale-125 active:scale-90"
                >{emoji}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Recent */}
            {recent.length > 0 && (
              <div id="cat-recent" className="pt-2 mb-4">
                <p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Recent</p>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {recent.map((emoji, i) => (
                    <button key={i} onClick={() => onSelect(emoji)}
                      className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-[var(--primary)]/10 transition-all hover:scale-125 active:scale-90"
                    >{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {/* All Categories in one list */}
            {EC.filter(c => c.id !== "recent").map(cat => (
              <div key={cat.id} id={`cat-${cat.id}`} className="mb-6">
                <p className="text-[10px] font-medium text-[var(--muted-foreground)] mb-3 px-1">{cat.label}</p>
                <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                  {cat.emojis.map((emoji, i) => (
                    <button key={i} onClick={() => onSelect(emoji)}
                      className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--primary)]/20 transition-all hover:scale-125 active:scale-90"
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
function MessageRow({ value, index, onChange, onRemove, showRemove, recent, addRecent }: {
  value: string; index: number; onChange: (v: string) => void; onRemove: () => void; showRemove: boolean;
  recent: string[]; addRecent: (e: string) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = useCallback((emoji: string) => {
    addRecent(emoji);
    const el = textRef.current;
    if (!el) { onChange(value + emoji); return; }
    const s = el.selectionStart ?? value.length;
    const e2 = el.selectionEnd ?? value.length;
    onChange(value.slice(0, s) + emoji + value.slice(e2));
    setTimeout(() => {
      if (!textRef.current) return;
      textRef.current.focus();
      textRef.current.setSelectionRange(s + emoji.length, s + emoji.length);
    }, 0);
  }, [value, onChange, addRecent]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      {/* Card-style input */}
      <div className={cn(
        "rounded-2xl border bg-[var(--card)] transition-all overflow-hidden shadow-sm",
        showEmoji ? "border-[var(--primary)] shadow-xl shadow-[var(--primary)]/5 ring-4 ring-[var(--primary)]/5" : "border-[var(--border)] focus-within:border-[var(--primary)]/50"
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--muted)]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-sm">
              <span className="text-[11px] font-bold text-[var(--primary)]">{index + 1}</span>
            </div>
            <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Message context</span>
          </div>
          {showRemove && (
            <button onClick={onRemove} className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Textarea */}
        <textarea ref={textRef} rows={3} value={value} onChange={e => onChange(e.target.value)}
          placeholder={`Enter the automated comment text here…`}
          className="w-full px-6 py-4 text-[14.5px] font-medium resize-none outline-none bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] leading-relaxed min-h-[100px]"
        />

        {/* Emoji trigger row */}
        <div className="flex items-center justify-end px-5 pb-3">
          <button ref={buttonRef} type="button" onClick={() => setShowEmoji(v => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-[12.5px] font-bold transition-all border",
              showEmoji ? "bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]" : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/20"
            )}
          >
            <Smile className={cn("w-4 h-4 transition-transform", showEmoji && "scale-110")} />
            {showEmoji ? "Choose Emoji" : "Add Emoji"}
          </button>
        </div>
      </div>

      {/* Fixed Emoji Picker to avoid clipping */}
      <AnimatePresence>
        {showEmoji && (
          <div className="fixed inset-0 z-[200] pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" onClick={() => setShowEmoji(false)} />
            <div
              style={{
                position: 'fixed',
                bottom: window.innerHeight - (buttonRef.current?.getBoundingClientRect().top ?? 0) + 12,
                right: window.innerWidth - (buttonRef.current?.getBoundingClientRect().right ?? 0),
                pointerEvents: 'auto'
              }}
            >
              <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} recent={recent} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Template Form Modal ────────────────────────────────────────────────────────
export function TemplateFormModal({ mode, initial, onClose, onSaved }: {
  mode: "create" | "edit"; initial: CommentTemplate | null; onClose: () => void; onSaved: () => void;
}) {
  const [formName, setFormName] = useState(initial?.name ?? "");
  const [formMessages, setFormMessages] = useState<string[]>(initial?.messages?.length ? initial.messages : [""]);
  const [isSaving, setIsSaving] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  const addRecent = (e: string) => setRecent(p => [e, ...p.filter(x => x !== e)].slice(0, 32));
  const addRow = () => setFormMessages(p => [...p, ""]);
  const updateRow = (i: number, v: string) => setFormMessages(p => p.map((m, idx) => idx === i ? v : m));
  const removeRow = (i: number) => setFormMessages(p => p.length > 1 ? p.filter((_, idx) => idx !== i) : p);

  const handleSave = async () => {
    const name = formName.trim();
    const messages = formMessages.map(m => m.trim()).filter(Boolean);
    if (!name) { toast.error("Template name is required"); return; }
    if (!messages.length) { toast.error("Add at least one message"); return; }

    setIsSaving(true);
    const payload = {
      _token: "xPVUKlvKC2lW1ArIjvRCKVyCmJhsoUrUaUyC6bGr",
      id: mode === "edit" ? initial?.id : "",
      name: name,
      messages: messages
    };

    try {
      if (mode === "create") {
        await api.post("/facebook/comment-template", payload, {
          headers: { Accept: "application/json", "Content-Type": "application/json" }
        });
      } else {
        await api.patch(`/facebook/comment-template/${initial!.id}`, payload, {
          headers: { Accept: "application/json", "Content-Type": "application/json" }
        });
      }
      toast.success(mode === "create" ? "Template created! 🎉" : "Template updated! ✅");
      onSaved();
    } catch (err: any) { toast.error(err?.response?.data?.message ?? "Save failed"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className="relative z-10 w-full max-w-none sm:max-w-[1050px] min-h-screen sm:min-h-0 bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[94vh]"
        onClick={e => e.stopPropagation()}

      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 sm:px-8 py-5 border-b border-[var(--border)] bg-[var(--muted)]/20">
          <div className="w-11 h-11 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20 flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-[15px] font-bold text-[var(--foreground)] uppercase tracking-tight truncate">
              {mode === "create" ? "Create Comment Template" : "Edit Template"}
            </h2>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {mode === "create" ? "Define a reusable pool of auto comment phrases." : `Updating: ${initial?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider ml-0.5">
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input autoFocus type="text" placeholder='e.g. "Positive Comments 🔥"' value={formName}
              onChange={e => setFormName(e.target.value)}
              className="w-full px-5 py-3 sm:py-4 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-[14.5px] font-semibold text-[var(--foreground)] outline-none transition-all placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]/50"
            />
          </div>

          {/* Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider ml-0.5">
                  Auto Messages <span className="text-rose-500">*</span>
                </label>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">One phrase will be picked randomly when auto-commenting.</p>
              </div>
              <button type="button" onClick={addRow}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] text-[12px] font-bold hover:bg-[var(--primary)]/20 transition-all border border-[var(--primary)]/20"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Add More
              </button>
            </div>

            <AnimatePresence>
              {formMessages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}>
                  <MessageRow value={msg} index={idx} onChange={v => updateRow(idx, v)}
                    onRemove={() => removeRow(idx)} showRemove={formMessages.length > 1}
                    recent={recent} addRecent={addRecent}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Preview */}
            {formMessages.filter(m => m.trim()).length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--primary)]/5 border border-[var(--primary)]/10">
                <p className="text-[10px] font-bold text-[var(--primary)] mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                  <Tag className="w-3 h-3" /> Preview · Rotates randomly
                </p>
                <div className="flex flex-wrap gap-2">
                  {formMessages.filter(m => m.trim()).map((m, i) => (
                    <span key={i} className="text-[12.5px] px-3 py-1.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-medium shadow-sm break-words">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 sm:px-8 py-5 border-t border-[var(--border)]">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[14px] transition-all flex items-center justify-center gap-1.5 active:scale-95 bg-[var(--card)]">
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-[2] py-3 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-bold text-[14px] shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Check className="w-4 h-4" />{mode === "create" ? "Create Template" : "Save Changes"}</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function Stat({ color, label, value }: { color: "pink" | "emerald" | "slate"; label: string; value: number }) {
  const dot = { pink: "bg-[var(--primary)]", emerald: "bg-emerald-500", slate: "bg-[var(--muted-foreground)]" };
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div className={cn("w-2 h-2 rounded-full", dot[color])} />
      <span className="text-[12px] font-bold text-[var(--muted-foreground)]"><span className="text-[var(--foreground)]">{value}</span> {label}</span>
    </div>
  );
}

export default function CommentTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CommentTemplate[]>([]);
  const [meta, setMeta] = useState<ApiMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [formModal, setFormModal] = useState<{ open: boolean; mode: "create" | "edit"; template: CommentTemplate | null }>({ open: false, mode: "create", template: null });

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/facebook/comment-template", { headers: { Accept: "application/json", "Content-Type": "application/json" } });
      const b = res.data;
      if (b?.success || b?.is_success) { setTemplates(Array.isArray(b.data) ? b.data : []); if (b.meta) setMeta(b.meta); }
      else if (Array.isArray(b)) setTemplates(b);
    } catch { toast.error("Failed to load"); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchTemplates(); }, []);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/facebook/comment-template/${id}`, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
      toast.success("Template deleted");
      setTemplates(p => p.filter(t => t.id !== id));
      setConfirmDeleteId(null);
    } catch { toast.error("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const openEdit = async (tpl: CommentTemplate) => {
    try {
      const res = await api.get(`/facebook/comment-template/${tpl.id}`, { headers: { Accept: "application/json", "Content-Type": "application/json" } });
      const raw = res.data; const detail = raw?.data ?? (raw?.success ? raw.data : tpl);
      setFormModal({ open: true, mode: "edit", template: detail ?? tpl });
    } catch { setFormModal({ open: true, mode: "edit", template: tpl }); }
  };

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.messages?.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-transparent w-full min-w-0">
      {/* ── UNIFIED PAGE HEADER ─────────────────────────────────────────── */}
      <div className="sticky top-[-16px] md:top-[-24px] z-[50] flex flex-col -mx-4 -mt-4 md:-mx-6 md:-mt-6" style={{
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)"
      }}>
        {/* Top row: back + title + actions */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-8 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--primary)]">
                Facebook · Comment Manager
              </span>
              <h1 className="text-[14px] md:text-[16px] font-black leading-none uppercase tracking-tight" style={{ color: "var(--foreground)" }}>
                Comment Templates
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchTemplates} disabled={isLoading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[#0866FF] hover:bg-[var(--muted)] disabled:opacity-40">
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
            <button onClick={() => setFormModal({ open: true, mode: "create", template: null })}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#0866FF] hover:bg-[#0866FF]/95 text-white font-bold text-[11px] uppercase shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW TEMPLATE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto px-0 md:px-6 lg:px-8 py-6 space-y-6 md:space-y-8">
        {/* Stats + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Stat color="pink" label="Total" value={templates.length} />
            <Stat color="emerald" label="Active" value={templates.filter(t => t.is_active).length} />
            {meta && <Stat color="slate" label="Per Page" value={meta.per_page} />}
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input type="text" placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[#0866FF]/50 focus:ring-2 focus:ring-[#0866FF]/10 transition-all min-w-[260px] shadow-sm placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-transparent md:bg-[var(--card)] border border-transparent md:border-[var(--border)] rounded-2xl md:shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-4 px-6 py-3 border-b border-[var(--border)] bg-[var(--muted)]/50">
            {["Template Name", "Messages", "Status", "Created", "Actions"].map(c => (
              <span key={c} className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">{c}</span>
            ))}
          </div>

          {isLoading && (
            <div className="divide-y divide-[var(--border)]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-4 px-6 py-4 items-center bg-[var(--card)] border border-[var(--border)] md:border-none rounded-xl md:rounded-zero my-3 md:my-0">
                  <div className="h-4 rounded-lg bg-[var(--muted)] animate-pulse w-3/4" /><div className="h-4 rounded-lg bg-[var(--muted)] animate-pulse w-1/2" />
                  <div className="h-5 rounded-full bg-[var(--muted)] animate-pulse w-16" /><div className="h-4 rounded-lg bg-[var(--muted)] animate-pulse w-2/3" />
                  <div className="h-8 rounded-xl bg-[var(--muted)] animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center bg-[var(--card)] border border-[var(--border)] md:border-none rounded-xl">
              <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] uppercase">{search ? "No results" : "No templates yet"}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1.5 max-w-xs">{search ? "Try a different keyword." : "Create your first comment template."}</p>
              {!search && <button onClick={() => setFormModal({ open: true, mode: "create", template: null })}
                className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-sm shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all">
                <Plus className="w-4 h-4" /> Create Template
              </button>}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="divide-y divide-[var(--border)]/70">
              {filtered.map((tpl, idx) => (
                <motion.div key={tpl.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                  className="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-3 md:gap-4 px-5 py-5 md:px-6 md:py-4 items-start md:items-center bg-[var(--card)] border border-[var(--border)] md:border-none rounded-2xl md:rounded-none my-3 md:my-0 hover:bg-[var(--muted)]/30 group transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 w-full md:w-auto">
                    <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/100/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)]/100/20 transition-colors">
                      <MessageSquare className="w-4.5 h-4.5 text-[var(--primary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold text-[var(--foreground)] truncate group-hover:text-[#0866FF] transition-colors">{tpl.name}</p>
                      {tpl.messages?.[0] && <p className="text-[11px] text-[var(--muted-foreground)] italic truncate mt-0.5 max-w-[320px]">{tpl.messages[0]}</p>}
                    </div>
                  </div>
                  {/* Desktop-only individual grid cells */}
                  <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] w-fit">
                    <Hash className="w-3 h-3 text-[var(--muted-foreground)]" />
                    <span className="text-[12px] font-bold text-[var(--foreground)]">{tpl.messages?.length ?? 0}<span className="font-medium text-[var(--muted-foreground)] ml-0.5">msgs</span></span>
                  </div>
                  <div className="hidden md:block">
                    {tpl.is_active
                      ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</span>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-[11px] font-bold border border-[var(--border)]"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />Inactive</span>
                    }
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 text-[var(--muted-foreground)]">
                    <Calendar className="w-3.5 h-3.5 text-[var(--border)] flex-shrink-0" />
                    <span className="text-[12px] font-medium">{fmtDate(tpl.created_at)}</span>
                  </div>

                  {/* Mobile-only grouped row */}
                  <div className="flex md:hidden flex-wrap items-center gap-2.5 w-full mt-1.5 border-t border-[var(--border)] pt-2.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[11px] font-bold text-[var(--foreground)]">
                      <Hash className="w-3 h-3 text-[var(--muted-foreground)]" />
                      <span>{tpl.messages?.length ?? 0} msgs</span>
                    </div>
                    <div className="scale-95 transform origin-left">
                      {tpl.is_active
                        ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold border border-emerald-500/20"><span className="w-1 h-1 rounded-full bg-emerald-500 mr-1 inline-block animate-pulse" />Active</span>
                        : <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] text-[11px] font-bold border border-[var(--border)]">Inactive</span>
                      }
                    </div>
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)] text-[11px] font-semibold ml-auto">
                      <Calendar className="w-3 h-3 text-[var(--muted-foreground)] flex-shrink-0" />
                      <span>{fmtDate(tpl.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions cell */}
                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t border-[var(--border)] md:border-transparent w-full md:w-auto justify-end">
                    <button onClick={() => openEdit(tpl)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[#0866FF] hover:border-[#0866FF]/30 hover:bg-[#0866FF]/5 transition-all text-[11px] font-bold">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => setConfirmDeleteId(tpl.id)} disabled={deletingId === tpl.id}
                      className="p-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-rose-500 hover:border-rose-300 hover:bg-rose-500/5 transition-all disabled:opacity-30">
                      {deletingId === tpl.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--muted)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-[var(--muted-foreground)]">Showing <span className="text-[var(--foreground)]">{filtered.length}</span> of <span className="text-[var(--foreground)]">{templates.length}</span> templates</p>
              {meta && <p className="text-[11px] text-[var(--muted-foreground)] font-semibold">{meta.total} total · {meta.per_page} per page</p>}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {formModal.open && (
          <TemplateFormModal mode={formModal.mode} initial={formModal.template}
            onClose={() => setFormModal(s => ({ ...s, open: false }))}
            onSaved={() => { setFormModal(s => ({ ...s, open: false })); fetchTemplates(); }}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setConfirmDeleteId(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative z-10 bg-[var(--card)] border border-[var(--border)] rounded-none sm:rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] uppercase truncate">Delete Template?</h3>
                  <p className="text-[13px] text-[var(--muted-foreground)] mt-1">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 font-bold text-[13px] transition-all">Cancel</button>
                <button onClick={() => handleDelete(confirmDeleteId)} disabled={deletingId !== null}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] shadow-lg shadow-rose-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deletingId !== null ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4" />Delete</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
