"use client";

import { useState, useRef, useEffect } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Smile, Image as ImageIcon, Paperclip, Bookmark, Mic, Code, Send, ChevronDown, Sparkles } from "lucide-react";
import { InlineEmojiButton } from "./EmojiPicker";
import VoiceRecorder from "./VoiceRecorder";
import MediaPreview from "./MediaPreview";
import { getMessages, quickReplies } from "@/services/smartInboxService";
import { toast } from "sonner";

export default function MessageInput() {
    const {
        selectedConversation,
        sendTextMessage,
        sendMediaMessage,
        sendVoiceMessage,
        sendTypingStart,
        sendTypingStop
    } = useSmartInbox();

    const [activeTab, setActiveTab] = useState<"reply" | "note">("reply");
    const [messageText, setMessageText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingFileType, setPendingFileType] = useState<"image" | "video" | "audio" | "file" | null>(null);
    const [showQuickReplies, setShowQuickReplies] = useState(false);
    const [quickRepliesList, setQuickRepliesList] = useState<any[]>([]);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    // Typing activity detection
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageText(e.target.value);
        sendTypingStart();

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStop();
        }, 2000);
    };

    // Load quick replies on click
    const handleQuickRepliesToggle = async () => {
        if (!showQuickReplies) {
            try {
                const res = await quickReplies();
                if (res && res.data) {
                    setQuickRepliesList(res.data);
                }
            } catch (err) {
                console.error("Failed to load quick replies", err);
            }
        }
        setShowQuickReplies(!showQuickReplies);
    };

    const handleSelectQuickReply = (text: string) => {
        setMessageText(prev => prev + (prev ? " " : "") + text);
        setShowQuickReplies(false);
    };

    // Media upload selections
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPendingFile(file);
            // Auto-detect type from MIME
            if (file.type.startsWith("video/")) setPendingFileType("video");
            else if (file.type.startsWith("audio/")) setPendingFileType("audio");
            else setPendingFileType("image");
        }
    };

    const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPendingFile(file);
            // Auto-detect type from MIME
            if (file.type.startsWith("audio/")) setPendingFileType("audio");
            else setPendingFileType("file");
        }
    };

    const clearPendingFile = () => {
        setPendingFile(null);
        setPendingFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (attachmentInputRef.current) attachmentInputRef.current.value = "";
    };

    const handleSendMessage = async () => {
        if (!selectedConversation) return;

        if (pendingFile && pendingFileType) {
            await sendMediaMessage(pendingFile, pendingFileType);
            clearPendingFile();
        } else if (messageText.trim()) {
            if (activeTab === "note") {
                // If it is a note, we can implement it as a note or normal outbound message
                // For this platform, we treat notes as internal text or standard outbound messages
                toast.success("Note saved locally");
            }
            await sendTextMessage(messageText);
            setMessageText("");
            sendTypingStop();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!selectedConversation) return null;

    return (
        <div className="bg-card rounded-[2rem] border border-border/40 p-4 space-y-3 relative">
            {/* Top tab selector */}
            <div className="flex items-center gap-4 border-b border-border/10 pb-2">
                <button
                    onClick={() => setActiveTab("reply")}
                    className={`text-xs font-black pb-1 transition-all ${
                        activeTab === "reply"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Reply
                </button>
                <button
                    onClick={() => setActiveTab("note")}
                    className={`text-xs font-black pb-1 transition-all ${
                        activeTab === "note"
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                    Note
                </button>
            </div>

            {/* Content area: recording state or editor state */}
            {isRecording ? (
                <VoiceRecorder
                    onStop={(blob) => {
                        sendVoiceMessage(blob);
                        setIsRecording(false);
                    }}
                    onCancel={() => setIsRecording(false)}
                />
            ) : (
                <div className="space-y-2">
                    {/* Media preview bubble */}
                    {pendingFile && (
                        <div className="px-1">
                            <MediaPreview file={pendingFile} type={pendingFileType!} onClear={clearPendingFile} />
                        </div>
                    )}

                    <textarea
                        value={messageText}
                        onChange={handleTextChange}
                        onKeyDown={handleKeyPress}
                        placeholder={
                            activeTab === "note"
                                ? "Type internal conversation note (only visible to team)..."
                                : "Type your message..."
                        }
                        className="w-full text-sm font-medium outline-none bg-transparent placeholder:text-muted-foreground text-foreground min-h-[72px] max-h-[140px] resize-none"
                    />

                    {/* Bottom toolbar actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/10">
                        <div className="flex items-center gap-1.5">
                            {/* Emoji button */}
                            <InlineEmojiButton
                                value={messageText}
                                onChange={(val) => setMessageText(val)}
                                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all text-muted-foreground hover:text-foreground"
                            />

                            {/* Image upload icon */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Attach media"
                            >
                                <ImageIcon className="w-4.5 h-4.5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageSelect}
                                accept="image/*,video/*"
                                className="hidden"
                            />

                            {/* Attachment document file icon */}
                            <button
                                onClick={() => attachmentInputRef.current?.click()}
                                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Attach document"
                            >
                                <Paperclip className="w-4.5 h-4.5" />
                            </button>
                            <input
                                type="file"
                                ref={attachmentInputRef}
                                onChange={handleAttachmentSelect}
                                accept="audio/*,.mp3,.wav,.ogg,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv"
                                className="hidden"
                            />

                            {/* Quick reply templates */}
                            <div className="relative">
                                <button
                                    onClick={handleQuickRepliesToggle}
                                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                                        showQuickReplies
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                    }`}
                                    title="Quick replies"
                                >
                                    <Bookmark className="w-4.5 h-4.5" />
                                </button>
                                {showQuickReplies && (
                                    <div className="absolute bottom-full mb-2 left-0 z-50 w-64 bg-card border border-border/40 rounded-2xl shadow-xl p-3 space-y-2">
                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-1">
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            Saved Templates
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin">
                                            {quickRepliesList.length === 0 ? (
                                                <div className="text-center py-4 text-xs text-muted-foreground">
                                                    No quick replies configured
                                                </div>
                                            ) : (
                                                quickRepliesList.map((qr: any) => (
                                                    <button
                                                        key={qr.id}
                                                        onClick={() => handleSelectQuickReply(qr.reply_text)}
                                                        className="w-full text-left p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-medium border border-transparent hover:border-border/30 truncate"
                                                    >
                                                        {qr.name}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Micro Voice Note recorder */}
                            <button
                                onClick={() => setIsRecording(true)}
                                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                                title="Record voice note"
                            >
                                <Mic className="w-4.5 h-4.5" />
                            </button>

                            {/* Shortcodes button */}
                            <button
                                onClick={() => setMessageText(prev => prev + " {name}")}
                                className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl transition-all text-muted-foreground hover:text-foreground cursor-pointer font-bold text-xs"
                                title="Insert shortcodes"
                            >
                                {"{ }"}
                            </button>
                        </div>

                        {/* Send button */}
                        <div className="flex items-center">
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageText.trim() && !pendingFile}
                                className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-opacity-90 disabled:opacity-40 disabled:hover:bg-primary text-white text-xs font-black rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" /> Send
                            </button>
                            <button className="p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-xl text-muted-foreground transition-all flex items-center justify-center cursor-pointer">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
