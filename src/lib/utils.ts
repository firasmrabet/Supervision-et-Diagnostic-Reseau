import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = typeof window !== "undefined" ? localStorage.getItem("netpulse_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers as any,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("netpulse_token");
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export const providers = [
  { id: "gemini", name: "Google Gemini", color: "#4285F4", icon: "G" },
  { id: "mistral", name: "Mistral AI", color: "#ff7000", icon: "M" },
  { id: "groq", name: "Groq", color: "#f55036", icon: "G" },
  { id: "nvidia", name: "NVIDIA NIM", color: "#76b900", icon: "N" },
  { id: "cerebras", name: "Cerebras", color: "#00d4ff", icon: "C" },
  { id: "sambanova", name: "SambaNova", color: "#7c3aed", icon: "S" },
  { id: "cohere", name: "Cohere", color: "#39d353", icon: "C" },
  { id: "openrouter", name: "OpenRouter", color: "#6366f1", icon: "O" },
  { id: "github", name: "GitHub Models", color: "#f0f6fc", icon: "GH" },
];
