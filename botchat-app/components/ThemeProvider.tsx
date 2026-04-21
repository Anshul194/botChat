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
    const [activeAppearance, setActiveAppearance] = useState<any>(null);

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
        
        // Initial application of all variables
        import("@/lib/appearance").then(({ previewAppearance, loadSavedAppearance }) => {
            const currentApp = loadSavedAppearance();
            setActiveAppearance(currentApp);
            previewAppearance(currentApp);
        });
        
        setMounted(true);

        const syncTheme = (e: any) => {
            if (e.detail) {
                // If the event provides the whole appearance object, use it
                if (typeof e.detail === "object") {
                    const settings = e.detail;
                    setActiveAppearance(settings);
                    const incomingTheme = settings.darkMode ? "dark" : "light";
                    setTheme(incomingTheme);
                    document.documentElement.classList.remove("dark", "light");
                    document.documentElement.classList.add(incomingTheme);
                    localStorage.setItem("botchat-theme", incomingTheme);
                    import("@/lib/appearance").then(({ applyAppearanceVariables }) => {
                        applyAppearanceVariables(settings);
                    });
                } else if (typeof e.detail === "string") {
                    const incomingTheme = e.detail as Theme;
                    setTheme(incomingTheme);
                    document.documentElement.classList.remove("dark", "light");
                    document.documentElement.classList.add(incomingTheme);
                    localStorage.setItem("botchat-theme", incomingTheme);
                    
                    // Re-apply variables based on the new theme state
                    setActiveAppearance((prev: any) => {
                        if (!prev) return prev;
                        const updated = { ...prev, darkMode: incomingTheme === "dark" };
                        import("@/lib/appearance").then(({ applyAppearanceVariables }) => {
                            applyAppearanceVariables(updated);
                        });
                        return updated;
                    });
                }
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
        
        // Update the current active appearance by merging the new mode
        if (activeAppearance) {
            const updated = { ...activeAppearance, darkMode: next === "dark" };
            setActiveAppearance(updated);
            localStorage.setItem("botchat.appearance", JSON.stringify(updated));
            import("@/lib/appearance").then(({ applyAppearanceVariables, previewAppearance }) => {
                applyAppearanceVariables(updated);
                // Also dispatch for any other listeners (like Settings page)
                const event = new CustomEvent("botchat-appearance-updated", { detail: updated });
                window.dispatchEvent(event);
            });
        }
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
