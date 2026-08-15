"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { GlassCard, StatusBadge } from "@/components/ui/GlassCard";
import { fetchAPI } from "@/lib/utils";
import {
  RefreshCw,
  Search,
  Maximize2,
  Minimize2,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  Server,
  ShieldAlert,
  Loader2
} from "lucide-react";
import type { NetworkDevice } from "@/types";

const NetworkScene3D = dynamic(() => import("@/components/3d/NetworkScene"), { ssr: false });

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function NetworkPage() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [wifiNetworks, setWifiNetworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"lan" | "wifi">("lan");

  const performScan = async () => {
    setLoading(true);
    try {
      if (activeTab === "lan") {
        const res = await fetchAPI("/api/network/devices");
        setDevices(res.devices);
      } else {
        const res = await fetchAPI("/api/network/wifi");
        setWifiNetworks(res.networks);
      }
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    performScan();
  }, [activeTab]);

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
            {/* Page title & Actions */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Network Scanner</h1>
                <p className="text-text-secondary mt-1">Real-time LAN and WiFi discovery</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 rounded-xl bg-surface border border-white/5">
                  <button
                    onClick={() => setActiveTab("lan")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === "lan" ? "bg-primary/20 text-primary glow-primary" : "text-text-secondary hover:text-white"
                    }`}
                  >
                    <Server className="w-4 h-4" /> LAN Devices
                  </button>
                  <button
                    onClick={() => setActiveTab("wifi")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === "wifi" ? "bg-secondary/20 text-secondary glow-secondary" : "text-text-secondary hover:text-white"
                    }`}
                  >
                    <Wifi className="w-4 h-4" /> WiFi Networks
                  </button>
                </div>
                <button
                  onClick={performScan}
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg hover:shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Scan Now
                </button>
              </div>
            </motion.div>

            {/* Main content */}
            <div className={`grid grid-cols-1 ${fullscreen ? "" : "lg:grid-cols-3"} gap-6 transition-all duration-500`}>
              
              {/* 3D Map */}
              <motion.div variants={item} className={`transition-all duration-500 ${fullscreen ? "col-span-1 h-[80vh]" : "lg:col-span-2 h-[500px]"}`}>
                <GlassCard className="h-full relative overflow-hidden p-0 border-white/10 group">
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h3 className="text-lg font-bold text-white drop-shadow-md">Topology Engine</h3>
                    <p className="text-xs text-text-secondary">
                      {activeTab === "lan" ? `${devices.length} nodes detected` : `${wifiNetworks.length} APs detected`}
                    </p>
                  </div>
                  <button
                    onClick={() => setFullscreen(!fullscreen)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md"
                  >
                    {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                  <NetworkScene3D />
                </GlassCard>
              </motion.div>

              {/* Discovery Results */}
              {!fullscreen && (
                <motion.div variants={item} className="h-[500px]">
                  <GlassCard className="h-full flex flex-col p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {activeTab === "lan" ? "Discovered Devices" : "Nearby Networks"}
                      </h3>
                      {loading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                      <AnimatePresence mode="popLayout">
                        {activeTab === "lan" ? (
                          // LAN VIEW
                          devices.length > 0 ? devices.map((device, i) => (
                            <motion.div
                              layout
                              key={device.id || i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedDevice(device)}
                              className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                selectedDevice?.id === device.id
                                  ? "bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(6,214,160,0.15)]"
                                  : "bg-surface border-white/5 hover:border-white/10"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Server className="w-4 h-4 text-primary" />
                                  <p className="text-sm font-bold text-text-primary">{device.name}</p>
                                </div>
                                <StatusBadge status={device.status} />
                              </div>
                              <div className="flex justify-between items-end mt-2">
                                <div>
                                  <p className="text-xs text-text-muted font-mono">{device.ip}</p>
                                  <p className="text-[10px] text-text-muted font-mono opacity-50">{device.mac}</p>
                                </div>
                                <div className="text-xs text-text-secondary flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                                  <Activity className="w-3 h-3 text-accent" />
                                  {device.latency}ms
                                </div>
                              </div>
                            </motion.div>
                          )) : (
                            !loading && (
                              <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Server className="w-12 h-12 mb-3" />
                                <p>No devices found</p>
                                <p className="text-xs">Click Scan Now to discover</p>
                              </div>
                            )
                          )
                        ) : (
                          // WIFI VIEW
                          wifiNetworks.length > 0 ? wifiNetworks.map((net, i) => (
                            <motion.div
                              layout
                              key={i}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ delay: i * 0.05 }}
                              className="p-3 rounded-xl bg-surface border border-white/5 hover:border-white/10 transition-all group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Wifi className="w-4 h-4 text-secondary group-hover:text-primary transition-colors" />
                                  <p className="text-sm font-bold text-text-primary">{net.ssid || "Hidden Network"}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-white/5 rounded">
                                  {net.signal}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                                {net.auth && (
                                  <span className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded">
                                    <ShieldAlert className="w-3 h-3 text-warning" />
                                    {net.auth}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          )) : (
                            !loading && (
                              <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50">
                                <Wifi className="w-12 h-12 mb-3" />
                                <p>No networks found</p>
                                <p className="text-xs">Ensure WiFi adapter is enabled</p>
                              </div>
                            )
                          )
                        )}
                      </AnimatePresence>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            {/* Selected device details (LAN only) */}
            <AnimatePresence>
              {selectedDevice && activeTab === "lan" && !fullscreen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 20, height: 0 }}
                >
                  <GlassCard className="border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Node Analysis: {selectedDevice.name}
                      </h3>
                      <button
                        onClick={() => setSelectedDevice(null)}
                        className="text-text-muted hover:text-text-primary text-sm font-medium px-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-surface border border-white/5 shadow-inner">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Device Type</p>
                        <p className="text-sm font-bold text-text-primary">{selectedDevice.device_type || selectedDevice.type || "Unknown"}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-surface border border-white/5 shadow-inner">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">IP Address</p>
                        <p className="text-sm font-bold text-secondary font-mono">{selectedDevice.ip}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-surface border border-white/5 shadow-inner">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Latency</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text-primary">{selectedDevice.latency}ms</p>
                          {selectedDevice.latency > 0 && selectedDevice.latency < 50 ? (
                            <ArrowDownRight className="w-4 h-4 text-primary" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-danger" />
                          )}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-surface border border-white/5 shadow-inner">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">MAC Address</p>
                        <p className="text-sm font-bold text-text-primary font-mono opacity-80">
                          {selectedDevice.mac}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
