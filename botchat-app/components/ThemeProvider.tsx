"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = (localStorage.getItem("botchat-theme") as Theme) || "light";
        setTheme(stored);
        applyTheme(stored);
    }, []);

    function applyTheme(t: Theme) {
        const root = document.documentElement;
        root.classList.remove("dark", "light");
        root.classList.add(t);
    }

    function toggleTheme() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        localStorage.setItem("botchat-theme", next);
    }

    if (!mounted) return <>{children}</>;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
