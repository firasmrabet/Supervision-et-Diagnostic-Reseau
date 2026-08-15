"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { fetchAPI } from "@/lib/utils";

interface Settings {
  theme: string;
  accentColor: string;
  animationsEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "dark",
  accentColor: "#06d6a0",
  animationsEnabled: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

// Helper to hex to rgba for the glow effect
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  const applySettingsToDOM = (newSettings: Settings) => {
    if (typeof document === "undefined") return;

    // Apply theme
    const html = document.documentElement;
    if (newSettings.theme === "dark") {
      html.classList.add("dark");
    } else if (newSettings.theme === "light") {
      html.classList.remove("dark");
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
    }

    // Apply accent color
    if (newSettings.accentColor) {
      html.style.setProperty("--primary", newSettings.accentColor);
      html.style.setProperty("--primary-glow", hexToRgba(newSettings.accentColor, 0.3));
    }

    // Apply animations
    if (!newSettings.animationsEnabled) {
      html.style.setProperty("--animation-duration", "0s");
      html.classList.add("disable-animations");
    } else {
      html.style.removeProperty("--animation-duration");
      html.classList.remove("disable-animations");
    }
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      applySettingsToDOM(updated);
      return updated;
    });
  };

  useEffect(() => {
    setMounted(true);
    // Fetch initial settings from API if user is logged in
    const token = typeof window !== "undefined" ? localStorage.getItem("netpulse_token") : null;
    if (token) {
      fetchAPI("/api/user/me")
        .then((data) => {
          if (data) {
            updateSettings({
              theme: data.theme || "dark",
              accentColor: data.accent_color || "#06d6a0",
              animationsEnabled: data.animations_enabled ?? true,
            });
          }
        })
        .catch((err) => console.error("Failed to load user settings:", err));
    } else {
      applySettingsToDOM(defaultSettings);
    }
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
