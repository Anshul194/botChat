"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface CarouselCard {
    title: string;
    subtitle?: string;
    image?: string;
    buttons?: Array<{ title: string }>;
}

interface CarouselMessageProps {
    cards: CarouselCard[];
}

export default function CarouselMessage({ cards }: CarouselMessageProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -200 : 200,
            behavior: "smooth",
        });
    };

    if (!cards || cards.length === 0) {
        return <span className="text-xs text-muted-foreground italic">Carousel unavailable</span>;
    }

    return (
        <div className="relative max-w-[320px] group">
            {/* Scroll buttons */}
            {cards.length > 1 && (
                <>
                    <button
                        onClick={() => scroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-10 w-6 h-6 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-10 w-6 h-6 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </>
            )}

            {/* Card strip */}
            <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scroll-snap-x snap-mandatory scrollbar-none pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className="snap-start flex-shrink-0 w-[160px] rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm"
                    >
                        {card.image && (
                            <img
                                src={card.image}
                                alt={card.title}
                                className="w-full h-24 object-cover"
                            />
                        )}
                        <div className="p-2.5">
                            <p className="text-xs font-semibold line-clamp-2 leading-snug">{card.title}</p>
                            {card.subtitle && (
                                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{card.subtitle}</p>
                            )}
                            {card.buttons && card.buttons.length > 0 && (
                                <div className="mt-2 flex flex-col gap-1">
                                    {card.buttons.map((btn, bi) => (
                                        <div
                                            key={bi}
                                            className="text-[10px] font-semibold text-center text-primary px-2 py-1 rounded-md border border-primary/30 bg-primary/5 truncate"
                                        >
                                            {btn.title}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
