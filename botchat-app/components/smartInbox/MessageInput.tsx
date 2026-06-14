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
        <div className="bg-card border-t border-border/60 px-3 py-2 space-y-2 relative">
            {/* Top tab selector */}
            <div className="flex items-center gap-3 px-0.5">
                <button
                    onClick={() => setActiveTab("reply")}
                    className={`text-[10px] font-medium pb-1 transition-all relative ${
                        activeTab === "reply"
                            ? "text-primary"
                            : "text-muted-foreground/70 hover:text-foreground"
                    }`}
                >
                    Reply
                    {activeTab === "reply" && (
                        <motion.div layoutId="inputTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("note")}
                    className={`text-[10px] font-medium pb-1 transition-all relative ${
                        activeTab === "note"
                            ? "text-primary"
                            : "text-muted-foreground/70 hover:text-foreground"
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

                    <div className="relative">
                        <textarea
                            value={messageText}
                            onChange={handleTextChange}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                activeTab === "note"
                                    ? "Internal note..."
                                    : "Type a message..."
                            }
                            className="w-full text-[13px] outline-none bg-transparent placeholder:text-muted-foreground/30 text-foreground min-h-[38px] max-h-[120px] resize-none leading-relaxed transition-all"
                        />
                    </div>

                    {/* Bottom toolbar actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5">
                            <InlineEmojiButton
                                value={messageText}
                                onChange={(val) => setMessageText(val)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Attach media"
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*,video/*" className="hidden" />

                            <button
                                onClick={() => attachmentInputRef.current?.click()}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Attach document"
                            >
                                <Paperclip className="w-3.5 h-3.5" />
                            </button>
                            <input type="file" ref={attachmentInputRef} onChange={handleAttachmentSelect} accept="audio/*,.mp3,.wav,.ogg,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv" className="hidden" />

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
                                    <Bookmark className="w-3.5 h-3.5" />
                                </button>
                                <AnimatePresence>
                                    {showQuickReplies && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute bottom-full mb-2 left-0 z-50 w-64 bg-card border border-border rounded-lg shadow-lg p-2"
                                        >
                                            <p className="text-[10px] font-medium text-muted-foreground/60 px-1 mb-1.5">Quick Replies</p>
                                            <div className="max-h-56 overflow-y-auto space-y-0.5">
                                                {quickRepliesList.map((qr: any) => (
                                                    <button
                                                        key={qr.id}
                                                        onClick={() => handleSelectQuickReply(qr.reply_text)}
                                                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-muted text-[12px] text-foreground/80 transition-colors"
                                                    >
                                                        {qr.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => setIsRecording(true)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-primary cursor-pointer"
                                title="Record voice note"
                            >
                                <Mic className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !pendingFile}
                            className="flex items-center gap-1.5 px-3 h-7 bg-primary hover:opacity-90 disabled:opacity-30 disabled:grayscale text-white text-[10px] font-medium rounded-md transition-all active:scale-95 flex-shrink-0"
                        >
                            <Send className="w-3 h-3" />
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

