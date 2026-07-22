"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MessageSquare, Plus, Trash2, Loader2, Check,
  Sparkles, Tag, Smile, Clock, Search, Save, RefreshCw
} from "lucide-react";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

// ── Emoji DB ──────────────────────────────────────────────────────────────────
const EC = [
  { id: "recent", label: "Recent", icon: "🕐" as string, emojis: [] as string[] },
  { id: "smileys", label: "Smileys & People", icon: "😀", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😚", "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤧", "🥵", "🥶", "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮", "😲", "😳", "🥺", "😦", "😧", "😨", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖", "👋", "🤚", "✋", "🖖", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "👍", "👎", "✊", "👏", "🙌", "🤝", "🙏", "💪", "🫶", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝"] },
  { id: "animals", label: "Animals & Nature", icon: "🐻", emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷", "🦂", "🐢", "🐍", "🦎", "🦕", "🦖", "🦈", "🐬", "🐋", "🐳", "🦭", "🐊", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐈", "🐓", "🦤", "🦚", "🦜", "🦢", "🕊", "🐇", "🦝", "🦨", "🦡", "🦦", "🦥", "🐁", "🐿", "🦔", "🌸", "🌺", "🌹", "🌷", "🌼", "🌻", "🌞", "🌝", "🌚", "🌙", "⭐", "🌟", "💫", "✨", "☀️", "⛅", "☁️", "🌈", "☔", "⚡", "🔥", "🌊", "💧", "🌿", "🍀", "🍁", "🍃", "🌱", "🌲", "🌳", "🌴", "🪴", "🦋", "🐾", "🍄", "🌵"] },
  { id: "food", label: "Food & Drink", icon: "🍎", emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🥕", "🧄", "🧅", "🥔", "🍠", "🥜", "🫘", "🌰", "🍞", "🥐", "🥖", "🫓", "🥨", "🧀", "🥚", "🍳", "バター", "🥞", "🧇", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🫔", "🌮", "🌯", "🥙", "🧆", "🥚", "🍲", "🍛", "🍜", "🍝", "🍣", "🍱", "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥮", "🍢", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "ポップコーン", "🍩", "🍪", "🌰", "🥐", "☕", "🫖", "🍵", "🧃", "🥤", "🧋", "🍶", "🍺", "🍻", "🥂", "ワイン", "🥃", "🍸", "🍹", "🧉", "🍾"] },
  { id: "activity", label: "Activities", icon: "⚽", emojis: ["⚽", "🏀", "🏈", "⚾", "🥎", "テニス", "🏐", "ラグビー", "🥏", "🎱", "🏓", "バドミントン", "🥊", "🥋", "⛳", "🏹", "🎣", "🤿", "🎽", "スキー", "🛷", "🥌", "スケート", "スケボー", "🛼", "🪂", "🏋️", "🤼", "🤸", "🤺", "⛹️", "🤾", "🏌️", "競馬", "🧘", "サーフィン", "🏊", "🤽", "マウンテンバイク", "🚴", "🎯", "ボウリング", "🎮", "🕹", "🎲", "将棋", "🧩", "🪄", "演劇", "パレット", "🎬", "マイク", "ヘッドフォン", "🎼", "🎵", "🎶", "ギター", "ピアノ", "アコーディオン", "ドラム", "🪘", "トランペット", "バイオリン", "🏆", "🥇", "🥈", "🥉", "メダル", "🎖", "🎗", "チケット", "🎟", "サーカス"] },
  { id: "travel", label: "Travel & Places", icon: "✈️", emojis: ["🚗", "🚕", "🚙", "バス", "🚎", "🏎", "パトカー", "救急車", "消防車", "バン", "🛻", "トラック", "🚛", "トラクター", "バイク", "スクーター", "🛺", "自転車", "キックボード", "スケボー", "🛼", "🚏", "高速道路", "線路", "ガソリンスタンド", "警報", "信号", "🚦", "ストップ", "工事", "⚓", "ボート", "船", "✈️", "🛩", "離陸", "着陸", "🪂", "座席", "ヘリコプター", "🚟", "ロープウェイ", "🚡", "人工衛星", "ロケット", "UFO", "地球", "アメリカ", "アジア", "🌐", "地図", "方位磁石", "山", "⛰️", "火山", "富士山", "キャンプ", "砂浜", "砂漠", "無人島", "公園", "スタジアム", "古典建築", "建設", "レンガ", "石", "薪", "小屋", "家", "庭", "ビル", "郵便局", "建物", "銀行", "ホテル", "ラブホテル", "コンビニ", "学校", "デパート", "工場", "日本のお城", "西洋のお城", "結婚式", "東京タワー", "自由の女神", "教会", "モスク", "ヒンドゥー寺院", "シナゴーグ", "鳥居", "カアバ", "噴水", "テント", "霧", "夜景", "日の出", "朝日", "夕焼け", "夕方", "橋", "メリーゴーランド", "観覧車", "ジェットコースター", "床屋"] },
  { id: "objects", label: "Objects", icon: "💡", emojis: ["💡", "懐中電灯", "キャンドル", "🪔", "クリスタル", "🧿", "宝石", "指輪", "カート", "プレゼント", "リボン", "くす玉", "クラッカー", "風船", "爆竹", "✨", "線香花火", "花火", "カボチャ", "クリスマスツリー", "七夕", "クマ", "マトリョーシカ", "絵画", "スロット", "🪅", "スマホ", "パソコン", "キーボード", "マウス", "プリンター", "電話", "固定電話", "ポケベル", "FAX", "テレビ", "ラジオ", "コンパス", "時計", "砂時計", "ウォッチ", "カレンダー", "壁掛けカレンダー", "予定表", "名刺入れ", "クリップボード", "フォルダ", "開いたフォルダ", "見出しカード", "ファイルボックス", "キャビネット", "ゴミ箱", "鍵", "開いた鍵", "万年筆と鍵", "鍵", "古い鍵", "ハンマー", "斧", "つるはし", "ハンマーとつるはし", "工具", "ナイフ", "剣", "盾", "のこぎり", "レンチ", "ドライバー", "ボルト", "歯車", "万力", "天秤", "杖", "リンク", "鎖", "フック", "磁石", "はしご", "工具箱", "磁石", "顕微鏡", "望遠鏡", "アンテナ", "カプセル", "ステレオ", "絆創膏", "レントゲン", "DNA", "シャーレ", "試験管", "温度計", "ほうき", "かご", "トイレットペーパー", "バケツ", "石鹸", "歯ブラシ", "スポンジ", "ローション", "風呂", "カミソリ", "安全ピン", "毛糸", "針", "糸", "結び目", "閉じた鍵", "クリップ", "定規", "三角定規", "ハサミ", "見出し", "キャビネット", "ゴミ箱", "段ボール", "ポスト", "閉じたポスト", "開いたポスト", "空のポスト", "郵便受け", "投票箱", "鉛筆", "ペン先", "万年筆", "ボールペン", "筆", "クレヨン", "メモ", "バッグ", "ノート", "帳簿", "本", "開いた本", "しおり", "値札", "お金", "コイン", "円", "ドル", "ユーロ", "ポンド", "お札", "カード", "領収書", "グラフ", "折れ線グラフ", "棒グラフ", "見出し", "クリップボード", "画鋲", "ピン", "ハサミ", "虫眼鏡", "🔍"] },
  { id: "symbols", label: "Symbols", icon: "🔣", emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💯", "🔥", "✨", "🌟", "⚡", "💥", "💫", "🎯", "👑", "💰", "💸", "🎉", "🙏", "💪", "🤝", "✅", "❌", "‼️", "⁉️", "❓", "💬", "💭", "🗯", "📢", "📣", "🔔", "🚀", "💎", "🌈", "💤", "🆚", "🆕", "🆓", "🆒", "🆗", "🆙", "🆘", "⛔", "🚫", "🔞", "♻️", "⚜️", "🔅", "🔆", "📶", "🎵", "🎶", "🔱", "⚡", "🌀", "♾", "♻️", "✔️", "☑️", "🔲", "🔳", "⬛", "⬜", "◼️", "◻️", "◾", "◽", "▪️", "▫️", "🔶", "🔷", "🔸", "🔹", "🔺", "🔻", "💠", "🔘", "🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🏁", "🚩", "🎌", "🏴", "🏳️"] },
];

interface CommentTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingTemplate: any | null;
  platform: "facebook" | "instagram";
}

// ── Emoji Picker Component ──────────────────────────────────────────────────
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
      className="w-[320px] sm:w-[380px] bg-[var(--card)] dark:bg-[var(--background)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl shadow-[0_32px_96px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
    >
      <div className="flex items-center px-4 pt-4 pb-2 gap-1 overflow-x-auto no-scrollbar border-b border-[var(--border)] dark:border-[var(--border)]">
        {EC.map(cat => (
          <button key={cat.id} onClick={() => scrollTo(cat.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[18px] hover:bg-[var(--muted)]/60 dark:hover:bg-[var(--muted)] transition-all active:scale-90"
          >
            {cat.id === "recent" ? <Clock className="w-4 h-4 text-[var(--muted-foreground)]/70" /> : cat.icon}
          </button>
        ))}
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/70" />
          <input type="text" placeholder="Search emojis…" value={q} onChange={e => setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] border-none outline-none focus:ring-2 focus:ring-primary/10 placeholder:text-[var(--muted-foreground)]/70 text-[var(--foreground)] dark:text-[var(--foreground)]"
          />
        </div>
      </div>
      <div ref={listRef} className="max-h-[300px] overflow-y-auto px-4 pb-4 custom-scrollbar scroll-smooth no-scrollbar">
        {allFiltered ? (
          <div className="pt-2">
            <p className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest mb-3">Results</p>
            <div className="grid grid-cols-7 gap-1">
              {allFiltered.map((emoji, i) => (
                <button key={i} onClick={() => { onSelect(emoji); setQ(""); }} className="text-[24px] h-10 w-10 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all">{emoji}</button>
              ))}
            </div>
          </div>
        ) : (
          EC.filter(c => c.id !== "recent").map(cat => (
            <div key={cat.id} id={`cat-${cat.id}`} className="mb-6">
              <p className="text-[10px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest mb-3 px-1">{cat.label}</p>
              <div className="grid grid-cols-7 gap-1">
                {cat.emojis.map((emoji, i) => (
                  <button key={i} onClick={() => onSelect(emoji)} className="text-[24px] h-10 w-10 flex items-center justify-center rounded-xl hover:bg-primary/10 transition-all">{emoji}</button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// ── Message Row Component ────────────────────────────────────────────────────
function MessageRow({ value, index, onChange, onRemove, showRemove, recent, addRecent }: {
  value: string; index: number; onChange: (v: string) => void; onRemove: () => void; showRemove: boolean;
  recent: string[]; addRecent: (e: string) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const insertEmoji = useCallback((emoji: string) => {
    addRecent(emoji);
    const el = textRef.current;
    if (!el) { onChange(value + emoji); return; }
    const s = el.selectionStart ?? value.length;
    const e2 = el.selectionEnd ?? value.length;
    onChange(value.slice(0, s) + emoji + value.slice(e2));
    setTimeout(() => { if (textRef.current) { textRef.current.focus(); textRef.current.setSelectionRange(s + emoji.length, s + emoji.length); } }, 0);
  }, [value, onChange, addRecent]);

  return (
    <div className="relative">
      <div className={cn(
        "rounded-2xl border-2 bg-[var(--card)] dark:bg-[var(--background)] transition-all overflow-hidden shadow-sm",
        showEmoji ? "border-primary shadow-xl shadow-[var(--primary)]/10 ring-4 ring-primary/5" : "border-[var(--border)] dark:border-[var(--border)] focus-within:border-primary/60"
      )}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] dark:border-[var(--border)] bg-[var(--muted)]/50 dark:bg-[var(--muted)]/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[var(--card)] dark:bg-[var(--muted)] border border-[var(--border)] dark:border-[var(--border)] flex items-center justify-center shadow-sm">
              <span className="text-[11px] font-black text-primary">{index + 1}</span>
            </div>
            <span className="text-[11px] font-black text-[var(--muted-foreground)]/70 uppercase tracking-widest">Random Payload</span>
          </div>
          {showRemove && (
            <button onClick={onRemove} className="p-2 rounded-xl text-[var(--muted-foreground)]/50 hover:text-rose-500 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <textarea ref={textRef} rows={3} value={value} onChange={e => onChange(e.target.value)}
          placeholder={`Enter the automated response text here…`}
          className="w-full px-6 py-4 text-[15px] font-medium resize-none outline-none bg-transparent text-[var(--foreground)] dark:text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 leading-relaxed min-h-[90px]"
        />
        <div className="flex items-center justify-end px-5 pb-3">
          <button ref={buttonRef} type="button" onClick={() => setShowEmoji(!showEmoji)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all border",
              showEmoji ? "bg-primary/10 border-primary/20 text-primary" : "bg-[var(--card)] dark:bg-[var(--muted)] border-[var(--border)] dark:border-[var(--border)] text-[var(--muted-foreground)] hover:text-primary"
            )}
          >
            <Smile className="w-4 h-4" />
            {showEmoji ? "Choose Emoji" : "Add Emoji"}
          </button>
        </div>
      </div>

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

// ── MAIN MODAL COMPONENT ─────────────────────────────────────────────────────
export function CommentTemplateModal({ isOpen, onClose, onSaved, editingTemplate, platform }: CommentTemplateModalProps) {
  const { showModal } = useModal();
  const [name, setName] = useState("");
  const [messages, setMessages] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (editingTemplate) {
      setName(editingTemplate.name || "");
      setMessages(editingTemplate.messages?.length ? editingTemplate.messages : [""]);
    } else {
      setName("");
      setMessages([""]);
    }
  }, [editingTemplate, isOpen]);

  const addRecent = (e: string) => setRecent(p => [e, ...p.filter(x => x !== e)].slice(0, 32));
  const addRow = () => setMessages([...messages, ""]);
  const handleSave = async () => {
    if (!name.trim()) return showModal("error", "Error", "Template name is required");
    const filtered = messages.map(m => m.trim()).filter(Boolean);
    if (!filtered.length) return showModal("error", "Error", "Add at least one message");

    setIsSaving(true);
    try {
      const endpoint = platform === "facebook" ? "/facebook/comment-template" : "/instagram/comment-template";
      const payload = { name, messages: filtered, platform };
      let res;
      if (editingTemplate?.id) res = await api.patch(`${endpoint}/${editingTemplate.id}`, payload);
      else res = await api.post(endpoint, payload);

      if (res.data.success || res.data.is_success) {
        showModal("success", "Success", "Success : Template Distributed");
        onSaved();
        onClose();
      }
    } catch (err) { showModal("error", "Error", "Deployment failure"); }
    finally { setIsSaving(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }}
            className="bg-[var(--card)] dark:bg-[var(--background)] rounded-none sm:rounded-2xl shadow-2xl w-full max-w-[1050px] overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[94vh] relative z-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-10 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:py-6 bg-[var(--card)] dark:bg-[var(--background)] border-b border-[var(--border)] dark:border-[var(--border)] shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] sm:text-[18px] font-black text-[var(--foreground)] dark:text-white uppercase tracking-tight leading-none truncate">{editingTemplate ? 'Edit Template' : 'Initialize Template'}</h2>
                <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)]/70 font-bold uppercase tracking-[0.2em] mt-1.5 truncate">{platform} Automation Node</p>
              </div>
              <button onClick={onClose} className="p-2 sm:p-3 rounded-2xl text-[var(--muted-foreground)]/50 hover:text-rose-500 transition-all shrink-0"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-10 space-y-6 sm:space-y-8 no-scrollbar">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest ml-1">Template Asset Identity <span className="text-rose-500">*</span></label>
                <input autoFocus type="text" placeholder='e.g. "Viral Engagement Set"' value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-[24px] bg-[var(--card)] dark:bg-slate-950 border-2 border-[var(--border)] dark:border-[var(--border)] focus:border-primary text-[14px] sm:text-[15px] font-bold outline-none transition-all placeholder:text-[var(--muted-foreground)]/30"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center px-1 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-[var(--muted-foreground)] uppercase tracking-widest leading-none">Payload Inventory <span className="text-rose-500">*</span></label>
                    <p className="text-[10px] text-[var(--muted-foreground)]/70 font-medium uppercase tracking-tight mt-1">Randomized response rotation</p>
                  </div>
                  <button onClick={addRow} className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl bg-primary/10 text-primary text-[11px] sm:text-[12px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20">
                    <Plus className="w-4 h-4" strokeWidth={3} /> Add Resource
                  </button>
                </div>

                <div className="space-y-4">
                  {messages.map((m, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <MessageRow
                        value={m}
                        index={idx}
                        onChange={v => { const nm = [...messages]; nm[idx] = v; setMessages(nm); }}
                        onRemove={() => setMessages(messages.filter((_, i) => i !== idx))}
                        showRemove={messages.length > 1}
                        recent={recent}
                        addRecent={addRecent}
                      />
                    </motion.div>
                  ))}
                </div>

                {messages.some(m => m.trim()) && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-pink-50/50 dark:from-slate-800/50 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Rotation Preview</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {messages.filter(m => m.trim()).map((m, i) => (
                        <span key={i} className="text-[12px] px-4 py-2 rounded-2xl bg-[var(--card)] dark:bg-[var(--background)] border border-primary/10 text-[var(--foreground)] dark:text-[var(--muted-foreground)]/50 font-bold shadow-sm">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 sm:gap-4 px-4 sm:px-10 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:py-6 bg-[var(--card)] dark:bg-[var(--background)] border-t border-[var(--border)] dark:border-[var(--border)] shrink-0">
              <button onClick={onClose} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-[var(--muted)]/50 dark:bg-[var(--muted)] text-[var(--muted-foreground)] font-black text-[12px] sm:text-[13px] uppercase tracking-widest hover:bg-[var(--muted)]/80 transition-all active:scale-95">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-[2.5] py-2.5 sm:py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-[12px] sm:text-[14px] uppercase tracking-widest shadow-xl shadow-[var(--primary)]/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span className="truncate">{isSaving ? "Synchronizing Asset..." : (editingTemplate ? "Finalize Changes" : "Register Node")}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
