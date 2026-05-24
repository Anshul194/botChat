"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioMessageProps {
    url: string;
    duration?: number;
}

export default function AudioMessage({ url, duration }: AudioMessageProps) {
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ?? 0);
    const audioRef = useRef<HTMLAudioElement>(null);

    if (!url) return <span className="text-xs text-muted-foreground italic">Audio unavailable</span>;

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play();
        }
        setPlaying(!playing);
    };

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio) return;
        const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        setProgress(pct);
        setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setTotalDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        setPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    };

    const fmt = (s: number) => {
        if (!s || isNaN(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-2.5 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl px-3 py-2.5 min-w-[220px] max-w-[280px]">
            {/* Hidden native audio element */}
            <audio
                ref={audioRef}
                src={url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
                className="hidden"
            />

            {/* Play/Pause button */}
            <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm hover:bg-primary/90 transition-colors"
            >
                {playing
                    ? <Pause className="w-3.5 h-3.5 text-white" />
                    : <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                }
            </button>

            {/* Waveform progress bar + timestamps */}
            <div className="flex-1 space-y-1">
                {/* Seek bar */}
                <div
                    className="h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Time labels */}
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-medium">{fmt(currentTime)}</span>
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                        <Volume2 className="w-2.5 h-2.5" />
                        <span className="text-[10px] font-medium">{fmt(totalDuration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
