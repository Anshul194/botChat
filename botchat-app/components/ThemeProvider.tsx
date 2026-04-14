"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Init theme from appearance if it exists, else botchat-theme
        let initialTheme: Theme = "dark";
        const rawApp = localStorage.getItem("botchat.appearance");
        if (rawApp) {
            try {
                const parsed = JSON.parse(rawApp);
                initialTheme = parsed.darkMode ? "dark" : "light";
            } catch(e) {}
        } else {
            const stored = localStorage.getItem("botchat-theme") as Theme | null;
            if (stored) initialTheme = stored;
        }

        setTheme(initialTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(initialTheme);
        localStorage.setItem("botchat-theme", initialTheme);
        setMounted(true);

        const syncTheme = (e: any) => {
            if (e.detail && typeof e.detail === "string") {
                const incomingTheme = e.detail as Theme;
                setTheme(incomingTheme);
                document.documentElement.classList.remove("dark", "light");
                document.documentElement.classList.add(incomingTheme);
                localStorage.setItem("botchat-theme", incomingTheme);
            }
        };

        window.addEventListener("botchat-appearance-updated", syncTheme);
        return () => window.removeEventListener("botchat-appearance-updated", syncTheme);
    }, []);

    function toggleTheme() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(next);
        localStorage.setItem("botchat-theme", next);
        
        // Re-read and apply appearance variables
        const rawApp = localStorage.getItem("botchat.appearance");
        if (rawApp) {
            try {
                const parsed = JSON.parse(rawApp);
                parsed.darkMode = next === "dark";
                localStorage.setItem("botchat.appearance", JSON.stringify(parsed));
                
                // Dynamically import to avoid circular dependency loops if any
                import("@/lib/appearance").then(({ applyAppearanceVariables }) => {
                    applyAppearanceVariables(parsed);
                });
            } catch(e) {}
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
