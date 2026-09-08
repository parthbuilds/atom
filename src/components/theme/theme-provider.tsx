"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ThemeTokens {
  radius?: string;
  primary?: string;
  background?: string;
  foreground?: string;
  card?: string;
  accent?: string;
  mode?: "dark" | "light";
}

interface ThemeContextType {
  tokens: ThemeTokens;
  setTokens: (tokens: ThemeTokens) => void;
  updateToken: (key: keyof ThemeTokens, value: string) => void;
  toggleMode: () => void;
}

const defaultTokens: ThemeTokens = {
  radius: "0.625rem",
  primary: "221.2 83.2% 53.3%", // Clean Vibrant Blue
  mode: "light",
};

const ThemeContext = createContext<ThemeContextType>({
  tokens: defaultTokens,
  setTokens: () => {},
  updateToken: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({
  children,
  initialTokens,
}: {
  children: React.ReactNode;
  initialTokens?: ThemeTokens | null;
}) {
  const [tokens, setTokensState] = useState<ThemeTokens>(() => {
    return initialTokens || defaultTokens;
  });

  const applyTokensToCss = (t: ThemeTokens) => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    const isLight = t.mode === "light";

    // Set class for Tailwind darkMode: ["class"]
    if (isLight) {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }

    // Set primary and radius (universal brand styling)
    if (t.radius) {
      root.style.setProperty("--radius", t.radius);
    }
    if (t.primary) {
      root.style.setProperty("--primary", t.primary);
      root.style.setProperty("--ring", t.primary);
    }

    // When in light mode, ensure light surface colors are applied cleanly
    if (isLight) {
      root.style.setProperty("--background", t.background || "0 0% 100%");
      root.style.setProperty("--foreground", t.foreground || "222.2 84% 4.9%");
      root.style.setProperty("--card", t.card || "0 0% 100%");
      root.style.setProperty("--card-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--popover", "0 0% 100%");
      root.style.setProperty("--popover-foreground", "222.2 84% 4.9%");
      root.style.setProperty("--muted", "210 40% 96.1%");
      root.style.setProperty("--muted-foreground", "215.4 16.3% 46.9%");
      root.style.setProperty("--border", "214.3 31.8% 91.4%");
      root.style.setProperty("--input", "214.3 31.8% 91.4%");
      root.style.setProperty("--accent", t.accent || "210 40% 96.1%");
      root.style.setProperty("--accent-foreground", "222.2 47.4% 11.2%");
      root.style.setProperty("--primary-foreground", "210 40% 98%");
    } else {
      root.style.setProperty("--background", t.background || "224 71% 4%");
      root.style.setProperty("--foreground", t.foreground || "213 31% 91%");
      root.style.setProperty("--card", t.card || "224 71% 6%");
      root.style.setProperty("--card-foreground", "213 31% 91%");
      root.style.setProperty("--popover", "224 71% 5%");
      root.style.setProperty("--popover-foreground", "215 20.2% 65.1%");
      root.style.setProperty("--muted", "223 47% 11%");
      root.style.setProperty("--muted-foreground", "215.4 16.3% 56.9%");
      root.style.setProperty("--border", "216 34% 17%");
      root.style.setProperty("--input", "216 34% 17%");
      root.style.setProperty("--accent", t.accent || "216 34% 17%");
      root.style.setProperty("--accent-foreground", "210 40% 98%");
      root.style.setProperty("--primary-foreground", "210 40% 98%");
    }
  };

  // Restore saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("atom_theme_tokens");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTokensState((prev) => {
          const next = { ...prev, ...parsed };
          applyTokensToCss(next);
          return next;
        });
        return;
      }
    } catch {
      // ignore
    }
    applyTokensToCss(tokens);
  }, []);

  useEffect(() => {
    applyTokensToCss(tokens);
  }, [tokens]);

  const setTokens = (newTokens: ThemeTokens) => {
    setTokensState(newTokens);
    applyTokensToCss(newTokens);
    if (typeof window !== "undefined") {
      localStorage.setItem("atom_theme_tokens", JSON.stringify(newTokens));
    }
  };

  const updateToken = (key: keyof ThemeTokens, value: string) => {
    const updated = { ...tokens, [key]: value };
    // If switching mode, clear out any static background/card overrides unless explicitly provided
    if (key === "mode") {
      delete updated.background;
      delete updated.card;
      delete updated.foreground;
    }
    setTokens(updated);
  };

  const toggleMode = () => {
    const newMode = tokens.mode === "light" ? "dark" : "light";
    updateToken("mode", newMode);
  };

  return (
    <ThemeContext.Provider value={{ tokens, setTokens, updateToken, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
