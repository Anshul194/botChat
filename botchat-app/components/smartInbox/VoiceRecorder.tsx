"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, CheckCircle2 } from "lucide-react";

interface VoiceRecorderProps {
    onStop: (blob: Blob) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ onStop, onCancel }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startRecording();
        return () => {
            stopTimer();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                onStop(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            startTimer();
        } catch (err) {
            console.error("Failed to access microphone:", err);
            onCancel();
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            stopTimer();
        }
    };

    const startTimer = () => {
        setDuration(0);
        timerRef.current = setInterval(() => {
            setDuration((prev) => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const formatDuration = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
    };

    return (
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 px-4 py-2 rounded-2xl w-full">
            <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-foreground">Recording {formatDuration(duration)}</span>
            </div>
            
            <div className="flex-1" />

            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-red-500 rounded-lg transition-all"
                    title="Cancel"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <button
                    onClick={stopRecording}
                    className="p-1.5 bg-primary text-white rounded-lg transition-all active:scale-95 flex items-center justify-center"
                    title="Send Voice Note"
                >
                    <CheckCircle2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
