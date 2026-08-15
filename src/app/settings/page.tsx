"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchAPI, providers } from "@/lib/utils";
import { useSettings } from "@/components/providers/SettingsProvider";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Palette,
  Server,
  Check,
  AlertTriangle,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("providers");
  const [saved, setSaved] = useState(false);
  const { settings, updateSettings } = useSettings();

  const handleSave = async () => {
    try {
      await fetchAPI("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify({
          theme: settings.theme,
          accent_color: settings.accentColor,
          animations_enabled: settings.animationsEnabled,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <Header />
        <main className="p-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Page title */}
            <motion.div variants={item} className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <p className="text-text-secondary mt-1">Configure your NetPulse AI instance</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center gap-2 glow-primary"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved!" : "Save Changes"}
              </motion.button>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={item} className="flex gap-2">
              {[
                { id: "providers", label: "AI Providers", icon: Server },
                { id: "alerts", label: "Alerts", icon: Bell },
                { id: "security", label: "Security", icon: Shield },
                { id: "appearance", label: "Appearance", icon: Palette },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "glass text-text-secondary hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Content */}
            <motion.div variants={item}>
              {activeTab === "providers" && (
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-6">AI Provider Configuration</h3>
                  <div className="space-y-4">
                    {providers.map((provider, i) => (
                      <motion.div
                        key={provider.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                            style={{
                              backgroundColor: `${provider.color}20`,
                              color: provider.color,
                            }}
                          >
                            {provider.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-text-primary">{provider.name}</h4>
                            <p className="text-xs text-text-muted">
                              {provider.id === "mistral" && "~1B tokens/mois, 500K TPM"}
                              {provider.id === "groq" && "30 RPM, 1000 RPD"}
                              {provider.id === "nvidia" && "~40 RPM"}
                              {provider.id === "cerebras" && "5 RPM, 1M tokens/jour"}
                              {provider.id === "sambanova" && "20 RPM, 200K TPD"}
                              {provider.id === "cohere" && "20 RPM, 1000 appels/mois"}
                              {provider.id === "openrouter" && "20 RPM, 50 RPD par modele"}
                              {provider.id === "github" && "10-15 RPM, 50-150 RPD"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-primary">Active</span>
                          </div>
                          <div className="w-10 h-5 bg-primary/20 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary rounded-full transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {activeTab === "alerts" && (
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-6">Alert Settings</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Critical Alerts", description: "Immediate notification for critical issues", enabled: true },
                      { label: "Warning Alerts", description: "Notify for potential issues", enabled: true },
                      { label: "Info Alerts", description: "General information notifications", enabled: false },
                      { label: "AI Analysis Alerts", description: "AI-generated insights and recommendations", enabled: true },
                    ].map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                        <div>
                          <h4 className="text-sm font-medium text-text-primary">{alert.label}</h4>
                          <p className="text-xs text-text-muted">{alert.description}</p>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${alert.enabled ? "bg-primary/20" : "bg-white/10"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${alert.enabled ? "right-0.5 bg-primary" : "left-0.5 bg-text-muted"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {activeTab === "security" && (
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-6">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="text-sm font-medium text-text-primary">API Key Encryption</h4>
                      <p className="text-xs text-text-muted mt-1">All API keys are encrypted at rest</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary">AES-256 encryption active</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="text-sm font-medium text-text-primary">Access Control</h4>
                      <p className="text-xs text-text-muted mt-1">Role-based access control</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-xs text-primary">RBAC enabled</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-accent">Security Recommendation</span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        Enable two-factor authentication for enhanced security
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === "appearance" && (
                <GlassCard>
                  <h3 className="text-lg font-semibold text-text-primary mb-6">Appearance Settings</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="text-sm font-medium text-text-primary">Theme</h4>
                      <p className="text-xs text-text-muted mt-1">Select your preferred theme</p>
                      <div className="flex gap-3 mt-3">
                        <button 
                          onClick={() => updateSettings({ theme: "dark" })}
                          className={`px-4 py-2 rounded-xl text-sm transition-all ${settings.theme === "dark" ? "bg-primary/10 text-primary border border-primary/20" : "glass text-text-secondary border border-transparent"}`}
                        >
                          Dark
                        </button>
                        <button 
                          onClick={() => updateSettings({ theme: "light" })}
                          className={`px-4 py-2 rounded-xl text-sm transition-all ${settings.theme === "light" ? "bg-primary/10 text-primary border border-primary/20" : "glass text-text-secondary border border-transparent"}`}
                        >
                          Light
                        </button>
                        <button 
                          onClick={() => updateSettings({ theme: "system" })}
                          className={`px-4 py-2 rounded-xl text-sm transition-all ${settings.theme === "system" ? "bg-primary/10 text-primary border border-primary/20" : "glass text-text-secondary border border-transparent"}`}
                        >
                          System
                        </button>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="text-sm font-medium text-text-primary">Accent Color</h4>
                      <p className="text-xs text-text-muted mt-1">Customize the accent color</p>
                      <div className="flex gap-3 mt-3">
                        {["#06d6a0", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"].map((color) => (
                          <button
                            key={color}
                            onClick={() => updateSettings({ accentColor: color })}
                            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${settings.accentColor === color ? 'border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="text-sm font-medium text-text-primary">Animations</h4>
                      <p className="text-xs text-text-muted mt-1">Enable or disable animations</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div 
                          onClick={() => updateSettings({ animationsEnabled: !settings.animationsEnabled })}
                          className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${settings.animationsEnabled ? 'bg-primary/20' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${settings.animationsEnabled ? 'right-0.5 bg-primary' : 'left-0.5 bg-text-muted'}`} />
                        </div>
                        <span className={`text-xs ${settings.animationsEnabled ? 'text-primary' : 'text-text-muted'}`}>
                          {settings.animationsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
