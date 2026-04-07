"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Emoji Category Data ────────────────────────────────────────────────────────
const EMOJI_CATEGORIES = [
  {
    id: "recent",
    label: "Recent",
    icon: "🕐",
    emojis: [] as string[],
  },
  {
    id: "smileys",
    label: "Smileys & People",
    icon: "😀",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇",
      "🥰","😍","🤩","😘","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭",
      "🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌",
      "😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯",
      "🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😲","😳","🥺","😦",
      "😧","😨","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤",
      "😡","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","👾",
      "🤖","👋","🤚","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","👍","👎",
      "✊","👏","🙌","🤝","🙏","💪","🫶","❤️","🧡","💛","💚","💙","💜",
      "🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝",
    ],
  },
  {
    id: "animals",
    label: "Animals & Nature",
    icon: "🐻",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷",
      "🐽","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉",
      "🦇","🐺","🐗","🐴","🦄","🐝","🦋","🐌","🐞","🐜","🦟","🐢","🐍",
      "🦎","🦕","🦖","🦈","🐬","🐋","🐳","🦭","🐊","🦓","🦍","🦧","🦣",
      "🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖",
      "🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐓","🦤","🦚","🦜",
      "🦢","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐿","🦔","🌸","🌺",
      "🌹","🌷","🌼","🌻","🌞","🌝","🌚","🌙","⭐","🌟","💫","✨","☀️",
      "⛅","☁️","🌈","☔","⚡","🔥","🌊","💧","🌿","🍀","🍁","🍃","🌱",
      "🌲","🌳","🌴","🪴","🍄","🌵",
    ],
  },
  {
    id: "food",
    label: "Food & Drink",
    icon: "🍎",
    emojis: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑",
      "🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🫑","🥕",
      "🧄","🧅","🥔","🍠","🥜","🫘","🌰","🍞","🥐","🥖","🫓","🥨","🧀",
      "🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫔",
      "🌮","🌯","🥙","🧆","🍲","🍛","🍜","🍝","🍣","🍱","🥟","🦪","🍤",
      "🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫",
      "🍩","🍪","🌰","🥐","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍺","🍻",
      "🥂","🥃","🍸","🍹","🧉","🍾",
    ],
  },
  {
    id: "activity",
    label: "Activities",
    icon: "⚽",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🏐","🎱","🏓","🥊","🥋","⛳","🎣","🤿",
      "🎽","🎿","🥌","🏋️","🤼","🤸","🤺","⛹️","🤾","🏌️","🧘","🏊","🤽",
      "🚴","🎯","🎮","🕹","🎲","🧩","🪄","🎬","🎵","🎶","🎸","🎹","🥁",
      "🎷","🎺","🎻","🏆","🥇","🥈","🥉","🎖","🎗","🎟",
    ],
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: "✈️",
    emojis: [
      "🚗","🚕","🚙","🏎","🚎","🛻","🚐","🚑","🚒","🚓","🚌","🚎","🏍",
      "🛺","🚲","🛴","🛼","🚡","🚟","🚠","🛩","✈️","🚀","🛸","🌍","🌎",
      "🌏","🗺","⛰️","🌋","🗻","🏕","🏖","🏜","🏝","🏞","🏟","🏛","🏗",
      "🏘","🏚","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫",
      "🏬","🏭","🏯","🏰","⛪","🕌","🕍","🕋","⛩","🗼","🗽","🗾","🎌",
      "⛽","🌉","🌃","🌆","🌇","🌉","🎠","🎡","🎢","💈",
    ],
  },
  {
    id: "objects",
    label: "Objects",
    icon: "💡",
    emojis: [
      "💡","🔦","🕯","🪔","🧿","💎","💍","🎁","🎀","🎉","🎊","🎈","🎆",
      "🎇","✨","🪅","📱","💻","⌨","🖥","🖨","🖱","☎","📞","📠","📺",
      "📻","🧭","⌚","⏱","⏰","⌛","⏳","📅","📆","🗒","📋","📁","📂",
      "🗃","🗑","🔑","🗝","🔨","⛏","🪛","🔧","⚙","🪤","⚖","🔗","⛓",
      "🪝","🧰","🔍","🔬","🔭","📡","💊","🩺","🩻","🧬","🔬","🗑","📦",
      "📫","📬","📭","📮","📝","📄","📃","📑","🗒","📓","📔","📒","📕",
      "📗","📘","📙","📚","🔖","💰","💵","💳","💸","🪙",
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "🔣",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞",
      "💓","💗","💖","💘","💝","💯","🔥","✨","🌟","⚡","💥","💫","🎯",
      "👑","💰","💸","🎉","🙏","💪","🤝","✅","❌","‼️","⁉️","❓","💬",
      "💭","🗯","📢","📣","🔔","🚀","💎","🌈","💤","✔️","☑️","♻️","⚜️",
      "🔱","🌀","♾","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤",
      "🏁","🚩","🎌","🏴","🏳️",
    ],
  },
];

// ── Recent Emojis Context ──────────────────────────────────────────────────────
interface RecentCtx {
  recent: string[];
  addRecent: (e: string) => void;
}

const RecentContext = createContext<RecentCtx>({
  recent: [],
  addRecent: () => {},
});

export function EmojiRecentProvider({ children }: { children: React.ReactNode }) {
  const [recent, setRecent] = useState<string[]>([]);
  const addRecent = useCallback(
    (e: string) => setRecent((p) => [e, ...p.filter((x) => x !== e)].slice(0, 32)),
    []
  );
  return (
    <RecentContext.Provider value={{ recent, addRecent }}>
      {children}
    </RecentContext.Provider>
  );
}

export function useRecentEmojis() {
  return useContext(RecentContext);
}

// ── EmojiPicker Component ──────────────────────────────────────────────────────
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  recent?: string[];
  style?: React.CSSProperties;
}

export function EmojiPicker({ onSelect, onClose, recent = [], style }: EmojiPickerProps) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(`emoji-cat-${id}`);
    if (el && listRef.current) {
      listRef.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
    setQuery("");
  };

  const categories = EMOJI_CATEGORIES.map((c) =>
    c.id === "recent" ? { ...c, emojis: recent } : c
  );

  const filtered = query
    ? categories.flatMap((c) => c.emojis).filter((e) => e.includes(query)).slice(0, 98)
    : null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 8 }}
      transition={{ duration: 0.15 }}
      className="w-[320px] sm:w-[350px] max-w-[calc(100vw-32px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 rounded-[24px] shadow-[0_24px_80px_-8px_rgba(0,0,0,0.22)] overflow-hidden z-[9999]"
      style={{ fontFamily: "system-ui, sans-serif", maxHeight: "calc(100vh - 40px)", ...style }}
    >
      {/* Category tabs */}
      <div className="flex items-center px-3 pt-3 pb-2 gap-0.5 overflow-x-auto border-b border-slate-100 dark:border-slate-800 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[17px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
            title={cat.label}
          >
            {cat.id === "recent" ? (
              <Clock className="w-4 h-4 text-slate-400" />
            ) : (
              cat.icon
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search emojis…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 outline-none placeholder:text-slate-400 text-slate-700 dark:text-slate-200 focus:border-pink-300 transition-colors"
          />
        </div>
      </div>

      {/* Emoji grid */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-3 pb-3 scroll-smooth min-h-[160px] max-h-[300px]"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
      >
        {filtered ? (
          <div className="pt-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Results ({filtered.length})
            </p>
            <div className="grid grid-cols-8 gap-0.5">
              {filtered.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(emoji); setQuery(""); }}
                  className="text-[20px] h-9 w-9 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ) : (
          categories
            .filter((c) => c.id !== "recent" || recent.length > 0)
            .map((cat) => (
              <div key={cat.id} id={`emoji-cat-${cat.id}`} className="mb-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 sticky top-0 bg-white dark:bg-slate-900 py-1">
                  {cat.label}
                </p>
                <div className="grid grid-cols-8 gap-0.5">
                  {cat.emojis.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => onSelect(emoji)}
                      className="text-[20px] h-9 w-9 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all active:scale-90"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </motion.div>
  );
}

// ── TextareaWithEmoji Component ────────────────────────────────────────────────
interface TextareaWithEmojiProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  wrapperClassName?: string;
  recent?: string[];
  onAddRecent?: (e: string) => void;
  /** Position of emoji picker: 'top' opens above the button, 'bottom' opens below */
  pickerPosition?: "top" | "bottom" | "auto";
  minHeight?: string;
}

export function TextareaWithEmoji({
  value,
  onChange,
  placeholder = "Type your message here...",
  rows = 4,
  className = "",
  wrapperClassName = "",
  recent = [],
  onAddRecent,
  pickerPosition = "auto",
  minHeight = "100px",
}: TextareaWithEmojiProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const insertEmoji = useCallback(
    (emoji: string) => {
      onAddRecent?.(emoji);
      const el = textareaRef.current;
      if (!el) {
        onChange(value + emoji);
        return;
      }
      const start = el.selectionStart ?? value.length;
      const end = el.selectionEnd ?? value.length;
      const newVal = value.slice(0, start) + emoji + value.slice(end);
      onChange(newVal);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            start + emoji.length,
            start + emoji.length
          );
        }
      }, 0);
      setShowEmoji(false);
    },
    [value, onChange, onAddRecent]
  );

  // Compute picker position relative to button
  const getPickerStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return { position: "fixed", bottom: 80, right: 20 };
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove =
      pickerPosition === "top" ||
      (pickerPosition === "auto" && spaceBelow < 320 && spaceAbove > spaceBelow);

    if (openAbove) {
      return {
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const getDynamicPickerStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove =
      pickerPosition === "top" ||
      (pickerPosition === "auto" && spaceBelow < 320 && spaceAbove > spaceBelow);
    return { maxHeight: Math.max(200, (openAbove ? spaceAbove : spaceBelow) - 24) };
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full outline-none font-medium text-[14px] text-slate-700 dark:text-slate-200 resize-none bg-transparent",
          className
        )}
        style={{ minHeight }}
      />

      {/* Emoji button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowEmoji((v) => !v)}
        className={cn(
          "absolute bottom-2 right-2 p-1.5 rounded-lg transition-all",
          showEmoji
            ? "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400"
            : "text-slate-300 hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20"
        )}
        title="Add emoji"
      >
        <Smile className="w-4 h-4" />
      </button>

      {/* Picker portal */}
      <AnimatePresence>
        {showEmoji && (
          <div className="fixed inset-0 z-[9990] pointer-events-none">
            <div
              className="absolute inset-0 pointer-events-auto"
              onClick={() => setShowEmoji(false)}
            />
            <div
              className="pointer-events-auto"
              style={getPickerStyle()}
            >
              <EmojiPicker
                onSelect={insertEmoji}
                onClose={() => setShowEmoji(false)}
                recent={recent}
                style={getDynamicPickerStyle()}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── InlineEmojiButton — for simple <input> fields ─────────────────────────────
interface InlineEmojiButtonProps {
  value: string;
  onChange: (v: string) => void;
  recent?: string[];
  onAddRecent?: (e: string) => void;
  className?: string;
}

export function InlineEmojiButton({
  value,
  onChange,
  recent = [],
  onAddRecent,
  className = "",
}: InlineEmojiButtonProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = useCallback(
    (emoji: string) => {
      onAddRecent?.(emoji);
      onChange(value + emoji);
      setShowEmoji(false);
    },
    [value, onChange, onAddRecent]
  );

  const getPickerStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return { position: "fixed", bottom: 80, right: 20 };
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < 320 && spaceAbove > spaceBelow;
    if (openAbove) {
      return {
        position: "fixed",
        bottom: window.innerHeight - rect.top + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return {
      position: "fixed",
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const getDynamicPickerStyle = (): React.CSSProperties => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openAbove = spaceBelow < 320 && spaceAbove > spaceBelow;
    return { maxHeight: Math.max(200, (openAbove ? spaceAbove : spaceBelow) - 24) };
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowEmoji((v) => !v)}
        className={cn(
          "p-1.5 rounded-lg transition-all flex-shrink-0",
          showEmoji
            ? "bg-pink-100 text-pink-600"
            : "text-slate-400 hover:text-pink-500 hover:bg-pink-50",
          className
        )}
        title="Add emoji"
      >
        <Smile className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {showEmoji && (
          <div className="fixed inset-0 z-[9990] pointer-events-none">
            <div
              className="absolute inset-0 pointer-events-auto"
              onClick={() => setShowEmoji(false)}
            />
            <div className="pointer-events-auto" style={getPickerStyle()}>
              <EmojiPicker
                onSelect={handleSelect}
                onClose={() => setShowEmoji(false)}
                recent={recent}
                style={getDynamicPickerStyle()}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
