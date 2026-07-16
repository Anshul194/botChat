"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    getBroadcastMessage,
    saveBroadcastMessage,
    previewBroadcastMessage,
    getBroadcastReadiness,
    getBroadcastTemplates,
    getBroadcastAssets,
} from "@/services/messengerBroadcast.service";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    Loader2,
    MessageSquare,
    Image as ImageIcon,
    CheckCircle2,
    MousePointerClick,
    LayoutTemplate,
    Zap,
    Plus,
    Trash2,
    GripVertical,
    ChevronRight,
    ChevronLeft,
    AlertCircle,
    Save,
    Library,
    Copy,
    FolderOpen,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ─── Type Definitions ───────────────────────────────────────────────────────

type MessageType = "text" | "image" | "button" | "carousel" | "quick_reply";

interface ButtonItem {
    type: "web_url" | "postback";
    title: string;
    url?: string;
    payload?: string;
}

interface CarouselCard {
    title: string;
    subtitle: string;
    image_url: string;
    buttons: ButtonItem[];
}

interface QuickReply {
    content_type: "text";
    title: string;
    payload: string;
}

// ─── Placeholder Chip ────────────────────────────────────────────────────────

const PLACEHOLDERS = ["{{first_name}}", "{{last_name}}", "{{full_name}}", "{{page_name}}"];

function PlaceholderChips({ onInsert }: { onInsert: (v: string) => void }) {
    return (
        <div className="flex flex-wrap gap-1.5 pt-1">
            {PLACEHOLDERS.map((v) => (
                <button
                    key={v}
                    type="button"
                    onClick={() => onInsert(v)}
                    className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-md font-mono hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                >
                    {v}
                </button>
            ))}
        </div>
    );
}

// ─── Text Builder ────────────────────────────────────────────────────────────

function TextBuilder({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
    const insert = (v: string) => onChange({ ...payload, message: (payload.message || "") + " " + v });
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Message Text</label>
            <Textarea
                rows={6}
                placeholder="Hi {{first_name}}, we have an exciting offer for you! 🎉"
                value={payload?.message || ""}
                onChange={(e) => onChange({ ...payload, message: e.target.value })}
                className="resize-none font-mono text-sm"
            />
            <div>
                <p className="text-xs text-neutral-500 mb-1.5">Insert personalisation variable:</p>
                <PlaceholderChips onInsert={insert} />
            </div>
            <div className="flex justify-between text-xs text-neutral-400">
                <span>{(payload?.message || "").length} characters</span>
                <span className={payload?.message?.length > 2000 ? "text-red-500" : ""}>Max 2000</span>
            </div>
        </div>
    );
}

// ─── Image Builder ───────────────────────────────────────────────────────────

function ImageBuilder({ payload, onChange, onOpenMediaPicker }: { payload: any; onChange: (p: any) => void; onOpenMediaPicker: (onSelect: (url: string) => void) => void }) {
    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Image / GIF URL</label>
                <div className="flex items-center gap-2">
                    <Input
                        type="url"
                        placeholder="https://example.com/promo-banner.jpg"
                        value={payload?.url || ""}
                        onChange={(e) => onChange({ ...payload, url: e.target.value })}
                        className="flex-1"
                    />
                    <Button variant="outline" type="button" onClick={() => onOpenMediaPicker((url) => onChange({ ...payload, url }))}>
                        <Library className="w-4 h-4 mr-2" /> Library
                    </Button>
                </div>
            </div>
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Caption (optional)</label>
                <Input
                    placeholder="Caption text shown under the image…"
                    value={payload?.caption || ""}
                    onChange={(e) => onChange({ ...payload, caption: e.target.value })}
                />
            </div>
            <p className="text-xs text-neutral-500">Supported: JPG, PNG, GIF, WebP. Max 8 MB. For video use a separate MP4 URL.</p>
        </div>
    );
}

// ─── Button Builder ──────────────────────────────────────────────────────────

function ButtonBuilder({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
    const buttons: ButtonItem[] = payload?.buttons || [];

    const insert = (v: string) => onChange({ ...payload, text: (payload.text || "") + " " + v });

    const addButton = () => {
        if (buttons.length >= 3) { toast.error("Maximum 3 buttons allowed by Meta."); return; }
        onChange({ ...payload, buttons: [...buttons, { type: "web_url", title: "", url: "" }] });
    };

    const updateButton = (i: number, data: Partial<ButtonItem>) => {
        const updated = buttons.map((b, idx) => (idx === i ? { ...b, ...data } : b));
        onChange({ ...payload, buttons: updated });
    };

    const removeButton = (i: number) => {
        onChange({ ...payload, buttons: buttons.filter((_, idx) => idx !== i) });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Button Message Text</label>
                <Textarea
                    rows={3}
                    placeholder="Hi {{first_name}}, check out our latest offer!"
                    value={payload?.text || ""}
                    onChange={(e) => onChange({ ...payload, text: e.target.value })}
                    className="resize-none"
                />
                <PlaceholderChips onInsert={insert} />
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Buttons ({buttons.length}/3)</label>
                    <Button type="button" variant="outline" size="sm" onClick={addButton} disabled={buttons.length >= 3}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Button
                    </Button>
                </div>

                {buttons.map((btn, i) => (
                    <div key={i} className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 space-y-3 bg-neutral-50 dark:bg-neutral-900/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-neutral-400" />
                                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Button {i + 1}</span>
                            </div>
                            <button type="button" onClick={() => removeButton(i)} className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">Type</label>
                                <Select
                                    value={btn.type}
                                    onValueChange={(v) => updateButton(i, { type: v as "web_url" | "postback", url: "", payload: "" })}
                                >
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="web_url">🔗 URL</SelectItem>
                                        <SelectItem value="postback">⚡ Postback</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">Title (max 20 chars)</label>
                                <Input
                                    className="h-8 text-sm"
                                    placeholder="e.g. Visit Website"
                                    maxLength={20}
                                    value={btn.title}
                                    onChange={(e) => updateButton(i, { title: e.target.value })}
                                />
                            </div>
                        </div>
                        {btn.type === "web_url" ? (
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">URL</label>
                                <Input
                                    className="h-8 text-sm"
                                    type="url"
                                    placeholder="https://yourwebsite.com/offer"
                                    value={btn.url || ""}
                                    onChange={(e) => updateButton(i, { url: e.target.value })}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs text-neutral-500 mb-1 block">Postback Payload</label>
                                <Input
                                    className="h-8 text-sm font-mono"
                                    placeholder="e.g. PROMO_CLICKED"
                                    value={btn.payload || ""}
                                    onChange={(e) => updateButton(i, { payload: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                ))}
                {buttons.length === 0 && (
                    <p className="text-sm text-neutral-500 text-center py-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                        No buttons yet. Add up to 3 buttons.
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Carousel Builder ────────────────────────────────────────────────────────

const defaultCard = (): CarouselCard => ({ title: "", subtitle: "", image_url: "", buttons: [] });

function CarouselBuilder({ payload, onChange, onOpenMediaPicker }: { payload: any; onChange: (p: any) => void; onOpenMediaPicker: (onSelect: (url: string) => void) => void }) {
    const cards: CarouselCard[] = payload?.elements || [defaultCard()];
    const [activeCard, setActiveCard] = useState(0);

    const updateCard = (i: number, data: Partial<CarouselCard>) => {
        const updated = cards.map((c, idx) => (idx === i ? { ...c, ...data } : c));
        onChange({ ...payload, elements: updated });
    };

    const addCard = () => {
        if (cards.length >= 10) { toast.error("Maximum 10 carousel cards allowed by Meta."); return; }
        const next = [...cards, defaultCard()];
        onChange({ ...payload, elements: next });
        setActiveCard(next.length - 1);
    };

    const removeCard = (i: number) => {
        if (cards.length <= 1) { toast.error("Carousel needs at least 1 card."); return; }
        const next = cards.filter((_, idx) => idx !== i);
        onChange({ ...payload, elements: next });
        setActiveCard(Math.min(activeCard, next.length - 1));
    };

    const addCardButton = (cardIndex: number) => {
        const card = cards[cardIndex];
        if (card.buttons.length >= 3) { toast.error("Maximum 3 buttons per card."); return; }
        updateCard(cardIndex, { buttons: [...card.buttons, { type: "web_url", title: "", url: "" }] });
    };

    const updateCardButton = (cardIndex: number, btnIndex: number, data: Partial<ButtonItem>) => {
        const card = cards[cardIndex];
        const buttons = card.buttons.map((b, i) => (i === btnIndex ? { ...b, ...data } : b));
        updateCard(cardIndex, { buttons });
    };

    const removeCardButton = (cardIndex: number, btnIndex: number) => {
        const card = cards[cardIndex];
        updateCard(cardIndex, { buttons: card.buttons.filter((_, i) => i !== btnIndex) });
    };

    const card = cards[activeCard] || defaultCard();

    return (
        <div className="space-y-4">
            {/* Card Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {cards.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setActiveCard(i)}
                        className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${activeCard === i ? "bg-primary text-white border-primary" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"}`}
                    >
                        Card {i + 1}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={addCard}
                    disabled={cards.length >= 10}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600 hover:border-primary hover:text-primary transition-all disabled:opacity-40"
                >
                    <Plus className="w-3 h-3 inline mr-1" /> Add Card
                </button>
                {cards.length > 1 && (
                    <button
                        type="button"
                        onClick={() => removeCard(activeCard)}
                        className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 px-2 py-1.5 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Card Editor */}
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Card Title *</label>
                        <Input
                            placeholder="Product Name"
                            value={card.title}
                            onChange={(e) => updateCard(activeCard, { title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-neutral-500 mb-1 block">Image URL</label>
                        <div className="flex items-center gap-1">
                            <Input
                                type="url"
                                placeholder="https://example.com/card.jpg"
                                value={card.image_url}
                                onChange={(e) => updateCard(activeCard, { image_url: e.target.value })}
                                className="flex-1"
                            />
                            <Button variant="outline" type="button" size="icon" onClick={() => onOpenMediaPicker((url) => updateCard(activeCard, { image_url: url }))}>
                                <Library className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-neutral-500 mb-1 block">Subtitle</label>
                    <Input
                        placeholder="Short description for this card"
                        value={card.subtitle}
                        onChange={(e) => updateCard(activeCard, { subtitle: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Buttons ({card.buttons.length}/3)</label>
                        <Button type="button" variant="outline" size="sm" onClick={() => addCardButton(activeCard)} disabled={card.buttons.length >= 3} className="h-7 text-xs">
                            <Plus className="w-3 h-3 mr-1" /> Add
                        </Button>
                    </div>
                    {card.buttons.map((btn, bi) => (
                        <div key={bi} className="flex gap-2 items-start bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-2">
                            <Select
                                value={btn.type}
                                onValueChange={(v) => updateCardButton(activeCard, bi, { type: v as "web_url" | "postback", url: "", payload: "" })}
                            >
                                <SelectTrigger className="h-7 text-xs w-28 flex-shrink-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="web_url">🔗 URL</SelectItem>
                                    <SelectItem value="postback">⚡ Postback</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                className="h-7 text-xs"
                                placeholder="Button title"
                                maxLength={20}
                                value={btn.title}
                                onChange={(e) => updateCardButton(activeCard, bi, { title: e.target.value })}
                            />
                            <Input
                                className="h-7 text-xs"
                                placeholder={btn.type === "web_url" ? "https://..." : "PAYLOAD_KEY"}
                                value={btn.type === "web_url" ? (btn.url || "") : (btn.payload || "")}
                                onChange={(e) => updateCardButton(activeCard, bi, btn.type === "web_url" ? { url: e.target.value } : { payload: e.target.value })}
                            />
                            <button type="button" onClick={() => removeCardButton(activeCard, bi)} className="text-red-400 hover:text-red-600 flex-shrink-0 pt-1">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Quick Reply Builder ─────────────────────────────────────────────────────

function QuickReplyBuilder({ payload, onChange }: { payload: any; onChange: (p: any) => void }) {
    const replies: QuickReply[] = payload?.quick_replies || [];

    const insert = (v: string) => onChange({ ...payload, text: (payload.text || "") + " " + v });

    const addReply = () => {
        if (replies.length >= 13) { toast.error("Maximum 13 quick replies allowed by Meta."); return; }
        onChange({ ...payload, quick_replies: [...replies, { content_type: "text", title: "", payload: "" }] });
    };

    const updateReply = (i: number, data: Partial<QuickReply>) => {
        onChange({ ...payload, quick_replies: replies.map((r, idx) => (idx === i ? { ...r, ...data } : r)) });
    };

    const removeReply = (i: number) => {
        onChange({ ...payload, quick_replies: replies.filter((_, idx) => idx !== i) });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-2">Prompt Message</label>
                <Textarea
                    rows={3}
                    placeholder="Hi {{first_name}}, what can we help you with today?"
                    value={payload?.text || ""}
                    onChange={(e) => onChange({ ...payload, text: e.target.value })}
                    className="resize-none"
                />
                <PlaceholderChips onInsert={insert} />
            </div>

            <Separator />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quick Replies ({replies.length}/13)</label>
                    <Button type="button" variant="outline" size="sm" onClick={addReply} disabled={replies.length >= 13}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Reply
                    </Button>
                </div>
                {replies.map((r, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <Input
                            className="text-sm"
                            placeholder="Reply title (max 20 chars)"
                            maxLength={20}
                            value={r.title}
                            onChange={(e) => updateReply(i, { title: e.target.value })}
                        />
                        <Input
                            className="text-sm font-mono"
                            placeholder="PAYLOAD_KEY"
                            value={r.payload}
                            onChange={(e) => updateReply(i, { payload: e.target.value })}
                        />
                        <button type="button" onClick={() => removeReply(i)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                {replies.length === 0 && (
                    <p className="text-sm text-neutral-500 text-center py-4 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                        Add quick reply chips (e.g. "Yes", "No", "Tell me more")
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Live Preview ────────────────────────────────────────────────────────────

function MessengerPreview({ messageType, preview }: { messageType: MessageType; preview: any }) {
    const [carouselIdx, setCarouselIdx] = useState(0);

    useEffect(() => setCarouselIdx(0), [preview]);

    const Bubble = ({ children }: { children: React.ReactNode }) => (
        <div className="flex justify-start mb-3">
            <div className="bg-white dark:bg-[#3E4042] rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[85%] text-sm text-neutral-900 dark:text-neutral-100">
                {children}
            </div>
        </div>
    );

    return (
        <div className="h-[520px] p-4 overflow-y-auto flex flex-col justify-end gap-1">
            {messageType === "text" && (
                <Bubble>
                    <p className="whitespace-pre-wrap">{preview?.message || <span className="text-neutral-400 italic">Start typing to preview…</span>}</p>
                </Bubble>
            )}

            {messageType === "image" && (
                <Bubble>
                    {preview?.url ? (
                        <div className="space-y-2">
                            <img src={preview.url} alt="Preview" className="rounded-xl max-w-full object-cover max-h-48" />
                            {preview.caption && <p className="text-xs text-neutral-600">{preview.caption}</p>}
                        </div>
                    ) : (
                        <div className="bg-neutral-100 dark:bg-neutral-700 w-48 h-36 rounded-xl flex items-center justify-center text-neutral-400 text-xs">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                    )}
                </Bubble>
            )}

            {messageType === "button" && (
                <div className="space-y-2 max-w-[85%]">
                    <Bubble>
                        <p className="whitespace-pre-wrap">{preview?.text || <span className="text-neutral-400 italic">Button message text…</span>}</p>
                    </Bubble>
                    {(preview?.buttons || []).map((btn: ButtonItem, i: number) => (
                        <div key={i} className="bg-white dark:bg-[#3E4042] border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-2 text-center text-blue-600 dark:text-blue-400 text-sm font-semibold shadow-sm cursor-default">
                            {btn.title || `Button ${i + 1}`}
                        </div>
                    ))}
                </div>
            )}

            {messageType === "carousel" && (
                <div className="space-y-2 w-full">
                    {(() => {
                        const cards = preview?.elements || [];
                        const card = cards[carouselIdx];
                        return (
                            <div className="bg-white dark:bg-[#3E4042] rounded-2xl overflow-hidden shadow-md max-w-[220px]">
                                {card?.image_url && <img src={card.image_url} alt={card.title} className="w-full h-28 object-cover" />}
                                <div className="p-3">
                                    <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{card?.title || "Card Title"}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">{card?.subtitle || "Subtitle"}</p>
                                    {(card?.buttons || []).map((b: ButtonItem, bi: number) => (
                                        <div key={bi} className="mt-2 border-t border-neutral-100 dark:border-neutral-700 pt-1.5 text-center text-blue-600 dark:text-blue-400 text-xs font-semibold">
                                            {b.title || `Btn ${bi + 1}`}
                                        </div>
                                    ))}
                                </div>
                                {cards.length > 1 && (
                                    <div className="flex items-center justify-between px-3 pb-2">
                                        <button onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))} disabled={carouselIdx === 0} className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs text-neutral-400">{carouselIdx + 1} / {cards.length}</span>
                                        <button onClick={() => setCarouselIdx(Math.min(cards.length - 1, carouselIdx + 1))} disabled={carouselIdx === cards.length - 1} className="text-neutral-400 hover:text-neutral-600 disabled:opacity-30">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

            {messageType === "quick_reply" && (
                <div className="space-y-2 max-w-[85%]">
                    <Bubble>
                        <p className="whitespace-pre-wrap">{preview?.text || <span className="text-neutral-400 italic">Prompt message text…</span>}</p>
                    </Bubble>
                    <div className="flex flex-wrap gap-1.5">
                        {(preview?.quick_replies || []).map((qr: QuickReply, i: number) => (
                            <div key={i} className="bg-white dark:bg-[#3E4042] border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full px-3 py-1 shadow-sm cursor-default">
                                {qr.title || `Reply ${i + 1}`}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Default Payloads ────────────────────────────────────────────────────────

const DEFAULT_PAYLOADS: Record<MessageType, any> = {
    text: { message: "" },
    image: { url: "", caption: "" },
    button: { text: "", buttons: [] },
    carousel: { elements: [defaultCard()] },
    quick_reply: { text: "", quick_replies: [] },
};

// ─── Message Type Config ─────────────────────────────────────────────────────

const MESSAGE_TYPES = [
    { id: "text" as MessageType, icon: MessageSquare, label: "Text" },
    { id: "image" as MessageType, icon: ImageIcon, label: "Image / Media" },
    { id: "button" as MessageType, icon: MousePointerClick, label: "Buttons" },
    { id: "carousel" as MessageType, icon: LayoutTemplate, label: "Carousel" },
    { id: "quick_reply" as MessageType, icon: Zap, label: "Quick Replies" },
];

// ─── Template Picker Modal ───────────────────────────────────────────────────

function TemplatePickerModal({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (payload: any, type: MessageType) => void }) {
    const { data, isLoading } = useQuery({
        queryKey: ["broadcastTemplatesPicker"],
        queryFn: () => getBroadcastTemplates({ per_page: 50 }),
        enabled: open,
    });
    
    const templates = data?.data || [];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle>Use a Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-purple" /></div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-10 text-neutral-500">No templates found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {templates.map((t: any) => (
                                <div key={t.id} onClick={() => {
                                    onSelect(t.payload_json, t.message_type as MessageType);
                                    onClose();
                                }} className="p-4 rounded-xl cursor-pointer transition-colors border border-neutral-800 hover:border-brand-purple hover:bg-white/5">
                                    <h4 className="font-bold text-sm mb-1">{t.name}</h4>
                                    <p className="text-xs text-brand-purple mb-2">{t.category} • {t.message_type}</p>
                                    <p className="text-xs text-neutral-400 line-clamp-2">{t.description || "No description"}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Media Library Picker Modal ──────────────────────────────────────────────

function MediaLibraryModal({ open, onClose, onSelect, filterType }: { open: boolean; onClose: () => void; onSelect: (url: string) => void; filterType?: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ["broadcastAssetsPicker", filterType],
        queryFn: () => getBroadcastAssets({ type: filterType || 'all', per_page: 50 }),
        enabled: open,
    });
    
    const assets = data?.data || [];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-3xl bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle>Content Library</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-brand-purple" /></div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-10 text-neutral-500">No media found. Upload in the Content Library page.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {assets.map((asset: any) => (
                                <div key={asset.id} onClick={() => {
                                    onSelect(asset.url);
                                    onClose();
                                }} className="group relative aspect-square rounded-xl bg-neutral-800 overflow-hidden cursor-pointer border-2 border-transparent hover:border-brand-purple">
                                    {asset.type === 'image' || asset.type === 'gif' ? (
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                    ) : asset.type === 'video' ? (
                                        <video src={asset.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <FolderOpen className="w-8 h-8 text-neutral-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                        <span className="text-xs font-semibold text-white truncate max-w-full">{asset.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MessageBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const campaignId = Number(params.id);

    const [messageType, setMessageType] = useState<MessageType>("text");
    const [payload, setPayload] = useState<any>({ message: "" });
    const [preview, setPreview] = useState<any>(null);
    const [isDirty, setIsDirty] = useState(false);

    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    // Note: We need a way to pass the selected media URL to the specific component that requested it.
    // For simplicity, since Image Builder is the main consumer, we could pass a callback, but let's 
    // just pass `setIsMediaPickerOpen` down or manage a global callback state.
    const [mediaSelectCallback, setMediaSelectCallback] = useState<((url: string) => void) | null>(null);

    const openMediaPicker = (onSelect: (url: string) => void) => {
        setMediaSelectCallback(() => onSelect);
        setIsMediaPickerOpen(true);
    };

    // Fetch existing message
    const { data: campaignData, isLoading } = useQuery({
        queryKey: ["broadcastMessage", campaignId],
        queryFn: () => getBroadcastMessage(campaignId),
    });

    useEffect(() => {
        if (campaignData?.data) {
            if (campaignData.data.message_type) setMessageType(campaignData.data.message_type as MessageType);
            if (campaignData.data.message_payload) setPayload(campaignData.data.message_payload);
            if (campaignData.data.preview_payload) setPreview(campaignData.data.preview_payload);
        }
    }, [campaignData]);

    // Save Mutation
    const saveMutation = useMutation({
        mutationFn: (status: string) => saveBroadcastMessage(campaignId, {
            message_type: messageType,
            message_payload: payload,
            content_status: status
        }),
        onSuccess: (res) => {
            if (res.data?.preview_payload) setPreview(res.data.preview_payload);
            setIsDirty(false);
        },
        onError: (err: any) => {
            const errors = err.response?.data?.errors;
            if (errors) {
                Object.values(errors).forEach((e: any) => toast.error(e[0]));
            } else {
                toast.error("Failed to save message.");
            }
        }
    });

    // Preview Mutation
    const previewMutation = useMutation({
        mutationFn: () => previewBroadcastMessage({ message_type: messageType, message_payload: payload }),
        onSuccess: (res) => { if (res.data?.preview_payload) setPreview(res.data.preview_payload); }
    });

    // Autosave Debounce (3s)
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            saveMutation.mutate("draft");
            previewMutation.mutate();
        }, 3000);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [payload, messageType, isDirty]);

    // Live preview update (on payload change without debounce for preview panel)
    useEffect(() => {
        setPreview(payload);
    }, [payload]);

    const handlePayloadChange = (newPayload: any) => {
        setPayload(newPayload);
        setIsDirty(true);
    };

    const handleTypeChange = (type: MessageType) => {
        setMessageType(type);
        setPayload(DEFAULT_PAYLOADS[type]);
        setIsDirty(true);
    };

    const handleSave = () => saveMutation.mutate("draft");

    const handleContinue = () => {
        saveMutation.mutate("completed", {
            onSuccess: () => {
                toast.success("Message validated and saved!");
                router.push(`/dashboard/broadcasts/${campaignId}/schedule`);
            },
            onError: () => {
                toast.error("Please fix validation errors before continuing.");
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const autosaveStatus = saveMutation.isPending ? "Saving…" : isDirty ? "Unsaved changes" : "All changes saved ✓";

    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Wizard Progress Bar */}
            <div className="flex flex-col gap-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="-mx-4 flex items-center gap-3 overflow-x-auto px-4 text-sm font-medium text-neutral-500 no-scrollbar sm:mx-0 sm:px-0">
                    <span className="flex shrink-0 items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Campaign</span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-neutral-300" />
                    <span className="flex shrink-0 items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Audience</span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-neutral-300" />
                    <span className="flex shrink-0 items-center gap-1.5 text-primary font-bold"><MessageSquare className="w-4 h-4" /> Message</span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-neutral-300" />
                    <span className="shrink-0 text-neutral-400">Review &amp; Schedule</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <span className={`text-xs ${isDirty ? "text-amber-500" : "text-emerald-500"}`}>
                        {autosaveStatus}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={saveMutation.isPending || !isDirty}>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Draft
                    </Button>
                    <Button onClick={handleContinue} disabled={saveMutation.isPending}>
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save & Continue
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT PANEL: Builder */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Message Type Selector */}
                    <Card>
                            <CardHeader className="border-b dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Message Builder</CardTitle>
                                        <CardDescription>Compose your broadcast payload</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setIsTemplatePickerOpen(true)}>
                                        <Library className="w-4 h-4 mr-2" />
                                        Use Template
                                    </Button>
                                </div>
                            </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {MESSAGE_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => handleTypeChange(type.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-all text-sm font-semibold ${
                                            messageType === type.id
                                                ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                                : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 text-neutral-600 dark:text-neutral-400"
                                        }`}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Composer */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Compose Message</CardTitle>
                            <CardDescription>
                                {messageType === "text" && "Plain text message with personalisation variables."}
                                {messageType === "image" && "Send an image, GIF, or media URL."}
                                {messageType === "button" && "Text message with up to 3 call-to-action buttons. Meta limit: 3 buttons."}
                                {messageType === "carousel" && "A horizontal card slider with images and buttons. Meta limit: 10 cards, 3 buttons/card."}
                                {messageType === "quick_reply" && "Tap-to-reply chips shown below the message. Meta limit: 13 quick replies."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {messageType === "text" && <TextBuilder payload={payload} onChange={handlePayloadChange} />}
                            {messageType === "image" && <ImageBuilder payload={payload} onChange={handlePayloadChange} onOpenMediaPicker={openMediaPicker} />}
                            {messageType === "button" && <ButtonBuilder payload={payload} onChange={handlePayloadChange} />}
                            {messageType === "carousel" && <CarouselBuilder payload={payload} onChange={handlePayloadChange} onOpenMediaPicker={openMediaPicker} />}
                            {messageType === "quick_reply" && <QuickReplyBuilder payload={payload} onChange={handlePayloadChange} />}
                        </CardContent>
                    </Card>

                    {/* Meta Limits Info */}
                    <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Meta Graph API Limits:</strong> Button templates max 3 buttons · Carousel max 10 cards · Quick Replies max 13 · Button title max 20 chars · Text max 2,000 chars. Messages violating limits will be rejected on send.
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Live Messenger Preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6">
                        <Card className="border-0 shadow-xl overflow-hidden bg-[#F0F2F5] dark:bg-[#18191A]">
                            <CardHeader className="bg-white dark:bg-[#242526] border-b border-neutral-200 dark:border-neutral-700 py-3 px-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <MessageSquare className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">Your Page</p>
                                            <p className="text-xs text-neutral-500">Messenger Preview</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">Live</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <MessengerPreview messageType={messageType} preview={preview} />
                            </CardContent>
                            <div className="bg-white dark:bg-[#242526] border-t border-neutral-200 dark:border-neutral-700 px-4 py-2.5">
                                <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#3E4042] rounded-full px-4 py-2 text-xs text-neutral-400">
                                    <span className="flex-1">Preview only — not clickable</span>
                                    <span className="text-xs">Aa</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
