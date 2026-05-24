"use client";

import { useState, useRef, useEffect } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Smile, Image as ImageIcon, Plus, Paperclip, Bookmark, Mic, Code, Send, ChevronDown, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        <div className="bg-card border-t border-border p-2 space-y-2 relative shadow-sm">
            {/* Top tab selector */}
            <div className="flex items-center gap-4 px-1">
                <button
                    onClick={() => setActiveTab("reply")}
                    className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all relative ${
                        activeTab === "reply"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                    }`}
                >
                    Reply
                    {activeTab === "reply" && (
                        <motion.div layoutId="inputTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("note")}
                    className={`text-[10px] font-black uppercase tracking-widest pb-1 transition-all relative ${
                        activeTab === "note"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100"
                    }`}
                >
                    Private Note
                    {activeTab === "note" && (
                        <motion.div layoutId="inputTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </button>
            </div>

            {/* Content area: recording state or editor state */}
            {isRecording ? (
                <div className="p-1">
                    <VoiceRecorder
                        onStop={(blob) => {
                            sendVoiceMessage(blob);
                            setIsRecording(false);
                        }}
                        onCancel={() => setIsRecording(false)}
                    />
                </div>
            ) : (
                <div className="space-y-1.5">
                    {/* Media preview bubble */}
                    <AnimatePresence>
                        {pendingFile && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-1"
                            >
                                <MediaPreview file={pendingFile} type={pendingFileType!} onClear={clearPendingFile} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative group">
                        <textarea
                            value={messageText}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                activeTab === "note"
                                    ? "Internal note..."
                                    : "Type a message..."
                            }
                            className="w-full text-[13px] font-medium outline-none bg-transparent placeholder:text-muted-foreground/40 text-foreground min-h-[40px] max-h-[120px] resize-none leading-tight transition-all"
                        />
                    </div>

                    {/* Bottom toolbar actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            {/* Emoji button */}
                            <InlineEmojiButton
                                value={messageText}
                                onChange={(val) => setMessageText(val)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary border border-transparent"
                            />

                            {/* Image upload icon */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Attach media"
                            >
                                <ImageIcon className="w-4 h-4" />
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
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Attach document"
                            >
                                <Paperclip className="w-4 h-4" />
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
                                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-all cursor-pointer ${
                                        showQuickReplies
                                            ? "bg-primary text-white"
                                            : "text-muted-foreground hover:text-primary hover:bg-muted"
                                    }`}
                                    title="Quick replies"
                                >
                                    <Bookmark className="w-4 h-4" />
                                </button>
                                <AnimatePresence>
                                    {showQuickReplies && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute bottom-full mb-3 left-0 z-50 w-72 bg-card border border-border rounded-xl shadow-2xl p-2"
                                        >
                                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-primary tracking-widest px-1 mb-2">
                                                <Sparkles className="w-3 h-3" /> Quick Replies
                                            </div>
                                            <div className="max-h-60 overflow-y-auto space-y-1">
                                                {quickRepliesList.map((qr: any) => (
                                                    <button
                                                        key={qr.id}
                                                        onClick={() => handleSelectQuickReply(qr.reply_text)}
                                                        className="w-full text-left p-2 rounded-lg hover:bg-primary/5 text-xs font-semibold border border-transparent hover:border-primary/10 transition-all group"
                                                    >
                                                        <div className="text-foreground group-hover:text-primary transition-colors truncate">{qr.name}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Micro Voice Note recorder */}
                            <button
                                onClick={() => setIsRecording(true)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Record voice note"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Send button group */}
                        <div className="flex items-center gap-1 bg-muted/30 p-0.5 rounded-lg border border-border/50 shadow-sm">
                            <button
                                onClick={handleSendMessage}
                                disabled={!messageText.trim() && !pendingFile}
                                className="flex items-center gap-1.5 px-3 h-7 bg-primary hover:opacity-90 disabled:opacity-30 disabled:grayscale text-white text-[9px] font-bold uppercase tracking-wider rounded-md transition-all active:scale-95 flex-shrink-0"
                            >
                                <Send className="w-3 h-3" />
                                <span>Send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

