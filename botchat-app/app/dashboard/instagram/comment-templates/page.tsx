"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Trash2, Edit2, Loader2, Check, X, ChevronLeft, RefreshCw, Search, Tag, Sparkles, Calendar, Hash, AlertTriangle, Smile, Clock, Instagram } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ── Emoji DB (Same as others) ──────────────────────────────────────────────────
const EC = [
  { id:"recent",  label:"Recent",          icon:"🕐" as string, emojis:[] as string[] },
  { id:"smileys", label:"Smileys & People", icon:"😀", emojis:["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😲","😳","🥺","😦","😧","😨","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","💩","🤡","👹","👺","👻","👽","👾","🤖","👋","🤚","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","👍","👎","✊","👏","🙌","🤝","🙏","💪","🫶","❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝"] },
  { id:"animals",  label:"Animals & Nature",  icon:"🐻", emojis:["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷","🦂","🐢","🐍","🦎","🦕","🦖","🦈","🐬","🐋","🐳","🦭","🐊","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐈","🐓","🦤","🦚","🦜","🦢","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐿","🦔","🌸","🌺","🌹","🌷","🌼","🌻","🌞","🌝","🌚","🌙","⭐","🌟","💫","✨","☀️","⛅","☁️","🌈","☔","⚡","🔥","🌊","💧","🌿","🍀","🍁","🍃","🌱","🌲","🌳","🌴","🪴","🦋","🐾","🍄","🌵"] },
  { id:"food",     label:"Food & Drink",      icon:"🍎", emojis:["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶","🫑","🥕","🧄","🧅","🥔","🍠","🥜","🫘","🌰","🍞","🥐","🥖","🫓","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🌭","🍔","🍟","🍕","🫔","🌮","🌯","🥙","🧆","🥚","🍲","🍛","🍜","🍝","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥐","☕","🫖","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾"] },
  { id:"activity", label:"Activities",         icon:"⚽", emojis:["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🥊","🥋","⛳","🏹","🎣","🤿","🎽","🎿","🛷","🥌","⛸","🛹","🛼","🪂","🏋️","🤼","🤸","🤺","⛹️","🤾","🏌️","🏇","🧘","サーフィン","🏊","🤽","マウンテンバイク","🚴","🎯","ボウリング","🎮","🕹","🎲","将棋","🧩","🪄","演劇","パレット","🎬","マイク","ヘッドフォン","🎼","🎵","🎶","ギター","ピアノ","アコーディオン","ドラム","🪘","トランペット","バイオリン","🏆","🥇","🥈","🥉","メダル","🎖","🎗","チケット","🎟","サーカス"] },
  { id:"travel",   label:"Travel & Places",    icon:"✈️", emojis:["🚗","🚕","🚙","バス","🚎","🏎","パトカー","救急車","消防車","バン","🛻","トラック","🚛","トラクター","バイク","スクーター","🛺","自転車","キックボード","スケボー","🛼","🚏","高速道路","線路","ガソリンスタンド","警報","信号","🚦","ストップ","工事","⚓","ボート","船","✈️","🛩","離陸","着陸","🪂","座席","ヘリコプター","🚟","ロープウェイ","🚡","人工衛星","ロケット","UFO","地球","アメリカ","アジア","🌐","地図","方位磁石","山","⛰️","火山","富士山","キャンプ","砂浜","砂漠","無人島","公園","スタジアム","古典建築","建設","レンガ","石","薪","小屋","家","庭","ビル","郵便局","建物","銀行","ホテル","ラブホテル","コンビニ","学校","デパート","工場","日本のお城","西洋のお城","結婚式","東京タワー","自由の女神","教会","モスク","ヒンドゥー寺院","シナゴーグ","鳥居","カアバ","噴水","テント","霧","夜景","日の出","朝日","夕焼け","夕方","橋","メリーゴーランド","観覧車","ジェットコースター","床屋"] },
  { id:"objects",  label:"Objects",             icon:"💡", emojis:["💡","懐中電灯","キャンドル","🪔","クリスタル","🧿","宝石","指輪","カート","プレゼント","リボン","くす玉","クラッカー","風船","爆竹","✨","線香花火","花火","カボチャ","クリスマスツリー","七夕","クマ","マトリョーシカ","絵画","スロット","🪅","スマホ","パソコン","キーボード","マウス","プリンター","電話","固定電話","ポケベル","FAX","テレビ","ラジオ","コンパス","時計","砂時計","ウォッチ","カレンダー","壁掛けカレンダー","予定表","名刺入れ","クリップボード","フォルダ","開いたフォルダ","見出しカード","ファイルボックス","キャビネット","ゴミ箱","鍵","開いた鍵","万年筆と鍵","鍵","古い鍵","ハンマー","斧","つるはし","ハンマーとつるはし","工具","ナイフ","剣","盾","のこぎり","レンチ","ドライバー","ボルト","歯車","万力","天秤","杖","リンク","鎖","フック","磁石","はしご","工具箱","磁石","顕微鏡","望遠鏡","アンテナ","カプセル","ステレオ","絆創膏","レントゲン","DNA","シャーレ","試験管","温度計","ほうき","かご","トイレットペーパー","バケツ","石鹸","歯ブラシ","スポンジ","ローーション","風呂","カミソリ","安全ピン","毛糸","針","糸","結び目","閉じた鍵","クリップ","定規","三角定規","ハサミ","見出し","キャビネット","ゴミ箱","段ボール","ポスト","閉じたポスト","開いたポスト","空のポスト","郵便受け","投票箱","鉛筆","ペン先","万年筆","ボールペン","筆","クレヨン","メモ","バッグ","ノート","帳簿","本","開いた本","しおり","値札","お金","コイン","円","ドル","ユーロ","ポンド","お札","カード","領収書","グラフ","折れ線グラフ","棒グラフ","見出し","クリップボード","画鋲","ピン","ハサミ","虫眼鏡","🔍"] },
  { id:"symbols",  label:"Symbols",             icon:"🔣", emojis:["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💯","🔥","✨","🌟","⚡","💥","💫","🎯","👑","💰","💸","🎉","🙏","💪","🤝","✅","❌","‼️","⁉️","❓","💬","💭","🗯","📢","📣","🔔","🚀","💎","🌈","💤","🆚","🆕","🆓","🆒","🆗","🆙","🆘","⛔","🚫","🔞","♻️","⚜️","🔅","🔆","📶","🎵","🎶","🔱","⚡","🌀","♾","♻️","✔️","☑️","🔲","🔳","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️","🔶","🔷","🔸","🔹","🔺","🔻","💠","🔘","🔴","🟠","🟡","🟢","🔵","🟣","⚫","⚪","🟤","🏁","🚩","🎌","🏴","🏳️"] },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface CommentTemplate { id:number; name:string; messages:string[]; is_active:boolean; created_at?:string; }
interface ApiMeta { current_page:number; last_page:number; per_page:number; total:number; }
function fmtDate(d?:string){ if(!d) return "—"; return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }

// ── Emoji Picker ──────────────────────────────────────────────────────
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
      className="w-[320px] sm:w-[400px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 rounded-[32px] shadow-[0_32px_96px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
      onClick={e=>e.stopPropagation()}
    >
      <div className="flex items-center px-4 pt-4 pb-2 gap-1 overflow-x-auto no-scrollbar border-b border-slate-50 dark:border-slate-800">
        {EC.map(cat => (
          <button key={cat.id} onClick={()=>scrollTo(cat.id)}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-[18px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            {cat.id==="recent" ? <Clock className="w-4 h-4 text-slate-400"/> : cat.icon}
          </button>
        ))}
      </div>
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
          <input type="text" placeholder="Search emojis…" value={q} onChange={e=>setQ(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-[14px] rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-pink-500/10 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>
      <div ref={listRef} className="max-h-[320px] overflow-y-auto px-4 pb-4 custom-scrollbar scroll-smooth no-scrollbar">
        {allFiltered ? (
          <div className="pt-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Results</p>
            <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
              {allFiltered.map((emoji,i) => (
                <button key={i} onClick={()=>{onSelect(emoji); setQ("");}} className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/20 transition-all">{emoji}</button>
              ))}
            </div>
          </div>
        ) : (
          EC.filter(c=>c.id!=="recent").map(cat => (
            <div key={cat.id} id={`cat-${cat.id}`} className="mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">{cat.label}</p>
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {cat.emojis.map((emoji,i) => (
                  <button key={i} onClick={()=>onSelect(emoji)} className="text-[26px] h-11 w-11 flex items-center justify-center rounded-xl hover:bg-pink-50 dark:hover:bg-pink-500/20 transition-all">{emoji}</button>
                ))}
              </div>
            </div>
          ))
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  const insertEmoji = useCallback((emoji:string) => {
    addRecent(emoji);
    const el = textRef.current;
    if(!el){ onChange(value+emoji); return; }
    const s = el.selectionStart ?? value.length;
    const e2 = el.selectionEnd ?? value.length;
    onChange(value.slice(0,s)+emoji+value.slice(e2));
    setTimeout(()=>{ if(textRef.current){ textRef.current.focus(); textRef.current.setSelectionRange(s+emoji.length,s+emoji.length); }}, 0);
  },[value, onChange, addRecent]);

  return (
    <div className="relative">
      <div className={cn(
        "rounded-[32px] border-2 bg-white transition-all overflow-hidden shadow-sm",
        showEmoji ? "border-pink-500 shadow-xl shadow-pink-500/5 ring-4 ring-pink-500/5" : "border-slate-100 focus-within:border-pink-400/60"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/60 flex items-center justify-center shadow-sm">
              <span className="text-[12px] font-black text-pink-600">{index+1}</span>
            </div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Rotation Node</span>
          </div>
          {showRemove && (
            <button onClick={onRemove} className="p-2.5 rounded-xl text-slate-200 hover:text-rose-500 transition-all">
              <Trash2 className="w-4 h-4"/>
            </button>
          )}
        </div>
        <textarea ref={textRef} rows={3} value={value} onChange={e=>onChange(e.target.value)}
          placeholder={`Enter the automated response text here…`}
          className="w-full px-8 py-5 text-[15px] font-bold resize-none outline-none bg-white text-slate-800 placeholder:text-slate-200 leading-relaxed min-h-[110px]"
        />
        <div className="flex items-center justify-end px-6 pb-4">
          <button ref={buttonRef} type="button" onClick={()=>setShowEmoji(!showEmoji)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[12px] font-black transition-all border uppercase tracking-widest",
              showEmoji ? "bg-pink-100 border-pink-200 text-pink-600 shadow-inner" : "bg-white border-slate-100 text-slate-400 hover:text-pink-600"
            )}
          >
            <Smile className="w-4 h-4"/>
            {showEmoji ? "Close Picker" : "Add Emoji"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showEmoji && (
          <div className="fixed inset-0 z-[200] pointer-events-none">
            <div className="absolute inset-0 pointer-events-auto" onClick={()=>setShowEmoji(false)}/>
            <div style={{ position: 'fixed', bottom: window.innerHeight - (buttonRef.current?.getBoundingClientRect().top ?? 0) + 12, right: window.innerWidth - (buttonRef.current?.getBoundingClientRect().right ?? 0), pointerEvents: 'auto' }}>
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
    if(!name){ toast.error("Template name required"); return; }
    if(!messages.length){ toast.error("Resource pool empty"); return; }
    
    setIsSaving(true);
    const payload = { 
        name, 
        messages, 
        platform: "instagram" 
    };

    try {
      if(mode==="create") {
        await api.post("/instagram/comment-template", payload);
      } else {
        await api.patch(`/instagram/comment-template/${initial!.id}`, payload);
      }
      toast.success(mode==="create"?"Deployment successful! 🎉":"Update locked! ✅");
      onSaved();
    } catch(err:any){ toast.error(err?.response?.data?.message??"Sync error"); }
    finally{ setIsSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}/>
      <motion.div
        initial={{opacity:0,scale:0.96,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.96,y:20}}
        className="relative z-10 w-full max-w-none sm:max-w-[1050px] min-h-screen sm:min-h-0 bg-[#fdfdff] dark:bg-slate-900 rounded-none sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
        onClick={e=>e.stopPropagation()}
      >
        <div className="flex items-center gap-5 px-10 py-7 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-200">
            <Sparkles className="w-6 h-6 text-white"/>
          </div>
          <div className="flex-1">
            <h2 className="text-[18px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
              {mode==="create"?"Initialize IG Template":"Modify Asset"}
            </h2>
            <p className="text-[11px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
              {mode==="create"?"Define randomized response rotation for Instagram.":`Editing Node: ${initial?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="p-3 rounded-[20px] text-slate-300 hover:text-rose-500 transition-all">
            <X className="w-6 h-6"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar uppercase tracking-[0.05em]">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Template Asset Identity <span className="text-rose-500">*</span></label>
            <input autoFocus type="text" placeholder='e.g. "Viral IG Response Set"' value={formName}
              onChange={e=>setFormName(e.target.value)}
              className="w-full px-8 py-5 rounded-[28px] bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 focus:border-pink-500 text-[15px] font-black text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-200"
            />
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Resource Pool <span className="text-rose-500">*</span></label>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 uppercase">Automated randomized rotation</p>
              </div>
              <button type="button" onClick={addRow}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-pink-50 text-pink-600 text-[12px] font-black uppercase tracking-widest hover:bg-pink-100 transition-all border border-pink-100 shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={3}/> Add Resource
              </button>
            </div>

            <div className="space-y-5">
              {formMessages.map((msg,idx)=>(
                <motion.div key={idx} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                  <MessageRow value={msg} index={idx} onChange={v=>updateRow(idx,v)}
                    onRemove={()=>removeRow(idx)} showRemove={formMessages.length>1}
                    recent={recent} addRecent={addRecent}
                  />
                </motion.div>
              ))}
            </div>

            {formMessages.filter(m=>m.trim()).length>0 && (
              <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-50/30 to-rose-50/30 dark:from-slate-800/40 border border-pink-100/50">
                <p className="text-[10px] font-black text-pink-500 mb-3 flex items-center gap-2 uppercase tracking-widest">
                  <Tag className="w-4 h-4"/> Rotation Preview
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {formMessages.filter(m=>m.trim()).map((m,i)=>(
                    <span key={i} className="text-[13px] px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-pink-50 text-slate-700 dark:text-slate-300 font-bold shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 px-10 py-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="flex-1 py-5 rounded-[22px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-black text-[13px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-[2.5] py-5 rounded-[22px] bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-[14px] uppercase tracking-[0.2em] shadow-2xl shadow-pink-200 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Check className="w-5 h-5" strokeWidth={3}/>}
            {isSaving ? "Synchronizing Asset..." : (mode==="create"?"Deploy Asset":"Lock Changes")}
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
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className={cn("w-2 h-2 rounded-full",dot[color])}/>
      <span className="text-[12px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest"><span className="text-slate-900 dark:text-white">{value}</span> {label}</span>
    </div>
  );
}

export default function InstagramCommentTemplatesPage(){
  const router = useRouter();
  const [templates,setTemplates] = useState<CommentTemplate[]>([]);
  const [isLoading,setIsLoading] = useState(true);
  const [search,setSearch] = useState("");
  const [deletingId,setDeletingId] = useState<number|null>(null);
  const [confirmDeleteId,setConfirmDeleteId] = useState<number|null>(null);
  const [formModal,setFormModal] = useState<{open:boolean;mode:"create"|"edit";template:CommentTemplate|null}>({open:false,mode:"create",template:null});

  const fetchTemplates = async()=>{
    setIsLoading(true);
    try{
      const res = await api.get("/instagram/comment-template?platform=instagram");
      const b = res.data;
      if(b?.success||b?.is_success){setTemplates(Array.isArray(b.data)?b.data:[]);}
      else if(Array.isArray(b))setTemplates(b);
    }catch{toast.error("Failed to load inventory");}
    finally{setIsLoading(false);}
  };
  useEffect(()=>{fetchTemplates();},[]);

  const handleDelete = async(id:number)=>{
    setDeletingId(id);
    try{
      await api.delete(`/instagram/comment-template/${id}`);
      toast.success("Asset Purged");
      setTemplates(p=>p.filter(t=>t.id!==id));
      setConfirmDeleteId(null);
    }catch{toast.error("Purge failed");}
    finally{setDeletingId(null);}
  };

  const openEdit = async(tpl:CommentTemplate)=>{
    const tid = toast.loading("Accessing Node...");
    try{
      const res = await api.get(`/instagram/comment-template/${tpl.id}`);
      const raw=res.data; const detail=raw?.data??tpl;
      setFormModal({open:true,mode:"edit",template:detail});
      toast.dismiss(tid);
    }catch{setFormModal({open:true,mode:"edit",template:tpl}); toast.dismiss(tid);}
  };

  const filtered = templates.filter(t=>
    t.name.toLowerCase().includes(search.toLowerCase())||
    t.messages?.some(m=>m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1400px] w-full px-8 lg:px-10 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button onClick={()=>router.back()} className="w-10 h-10 flex items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all active:scale-90">
              <ChevronLeft className="w-5 h-5"/>
            </button>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Instagram · Automation Hub</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">Comment Inventory</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <button onClick={fetchTemplates} disabled={isLoading} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-300 hover:text-pink-500 hover:bg-pink-50/50 transition-all disabled:opacity-40 active:scale-90">
              <RefreshCw className={cn("w-4 h-4",isLoading&&"animate-spin")}/>
            </button>
            <button onClick={()=>setFormModal({open:true,mode:"create",template:null})}
              className="flex items-center gap-3 px-8 py-3.5 rounded-[22px] bg-pink-600 hover:bg-pink-700 text-white font-black text-[12px] uppercase tracking-widest shadow-xl shadow-pink-100 active:scale-95 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5"/>
              <span>INITIALIZE NEW</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 sm:px-10 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Stat color="pink" label="Total Assets" value={templates.length}/>
            <Stat color="emerald" label="Distributed" value={templates.filter(t=>t.is_active).length}/>
          </div>
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-pink-500 transition-colors"/>
            <input type="text" placeholder="Lookup Templates…" value={search} onChange={e=>setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-[22px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[14px] font-bold outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-500/5 transition-all shadow-sm placeholder:text-slate-200"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-8 px-10 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
            {["Asset Identity","Resource Count","Lifecycle","Last Modified","Actions"].map(c=>(
              <span key={c} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c}</span>
            ))}
          </div>

          {!isLoading&&filtered.length===0&&(
            <div className="flex flex-col items-center py-32 text-center">
              <div className="w-20 h-20 rounded-[32px] bg-pink-50 dark:bg-pink-900/10 flex items-center justify-center mb-6">
                <Instagram className="w-10 h-10 text-pink-300 dark:text-pink-700"/>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{search?"No Search Results":"Inventory Empty"}</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs font-medium uppercase tracking-wide italic leading-relaxed">{search?"Try a different identification key.":"Initialize your first Instagram randomized response pool."}</p>
            </div>
          )}

          {!isLoading&&filtered.length>0&&(
            <div className="divide-y divide-slate-50 dark:divide-slate-800/80">
              {filtered.map((tpl,idx)=>(
                <motion.div key={tpl.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:idx*0.04}}
                  className="grid grid-cols-[2fr_1fr_1fr_1.2fr_140px] gap-8 px-10 py-8 items-center group hover:bg-slate-50/20 dark:hover:bg-slate-800/20 transition-all border-b border-transparent last:border-0"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shadow-sm group-hover:bg-pink-600 transition-all group/icon">
                      <MessageSquare className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight group-hover:text-pink-600 transition-colors">{tpl.name}</p>
                      <div className="flex items-center gap-2 mt-1.5 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 w-fit">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Node ID: {tpl.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Hash className="w-4 h-4" strokeWidth={2.5}/>
                    <span className="text-[12px] font-black text-slate-700 dark:text-slate-300">{tpl.messages?.length??0}<span className="font-bold text-[10px] ml-1 uppercase">Elements</span></span>
                  </div>
                  <div>
                    {tpl.is_active
                      ?<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/50"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>Live</span>
                      :<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200">Idle</span>
                    }
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Calendar className="w-4 h-4" strokeWidth={2.5}/>
                    <span className="text-[12px] font-black uppercase tracking-widest leading-none">{fmtDate(tpl.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={()=>openEdit(tpl)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-pink-600 hover:border-pink-300 transition-all text-[11px] font-black uppercase tracking-widest">
                      <Edit2 className="w-3.5 h-3.5"/> Edit
                    </button>
                    <button onClick={()=>setConfirmDeleteId(tpl.id)} disabled={deletingId===tpl.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 hover:text-rose-600 hover:border-rose-300 transition-all disabled:opacity-30 active:scale-95">
                      {deletingId===tpl.id?<Loader2 className="w-4 h-4 animate-spin"/>:<Trash2 className="w-4 h-4"/>}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {formModal.open&&(
          <TemplateFormModal mode={formModal.mode} initial={formModal.template}
            onClose={()=>setFormModal(s=>({...s,open:false}))}
            onSaved={()=>{setFormModal(s=>({...s,open:false}));fetchTemplates();}}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDeleteId!==null&&(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={()=>setConfirmDeleteId(null)}/>
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="relative z-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-10 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-[24px] bg-rose-50 flex items-center justify-center mx-auto mb-6">
                 <AlertTriangle className="w-8 h-8 text-rose-500"/>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Scrub Asset?</h3>
              <p className="text-sm text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-wide mb-10">Permanently purge this item from the Instagram automation hub?</p>
              <div className="flex gap-4">
                <button onClick={()=>setConfirmDeleteId(null)} className="flex-1 py-4.5 rounded-[22px] bg-slate-100 dark:bg-slate-800 text-slate-600 font-black text-[13px] uppercase">Abort</button>
                <button onClick={()=>handleDelete(confirmDeleteId)} disabled={deletingId!==null}
                  className="flex-1 py-4.5 rounded-[22px] bg-rose-600 text-white font-black text-[14px] uppercase shadow-xl shadow-rose-200 active:scale-95 transition-all"
                >
                  {deletingId!==null?"Purging...":"Purge Node"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
