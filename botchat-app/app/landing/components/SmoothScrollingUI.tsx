"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

export default function SmoothScrollingUI() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col gap-3 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-12 h-12 bg-white text-[#FF2D78] border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-colors dark:bg-[#110a14] dark:border-[rgba(255,45,120,0.15)]"
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>

            <button
                onClick={scrollToBottom}
                className="flex items-center justify-center w-12 h-12 bg-[#FF2D78] text-white rounded-full shadow-lg hover:bg-[#e8175d] transition-colors"
                aria-label="Scroll to bottom"
            >
                <ArrowDown className="w-5 h-5" />
            </button>
        </div>
    );
}
