"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { GlassCard, StatCard, StatusBadge } from "@/components/ui/GlassCard";
import {
  Activity,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Zap,
  Globe,
  Radio,
} from "lucide-react";
import { fetchAPI } from "@/lib/utils";
import type { NetworkStats, NetworkDevice, NetworkAlert } from "@/types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const NetworkScene3D = dynamic(() => import("@/components/3d/NetworkScene"), { ssr: false });

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

export default function DashboardPage() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [bandwidthData, setBandwidthData] = useState<any[]>([]);

  useEffect(() => {
    // Generate initial history
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 5000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
      usage: Math.random() * 5 + 1
    }));
    setBandwidthData(initialData);

    const fetchData = async () => {
      try {
        const [statsRes, devicesRes, alertsRes] = await Promise.all([
          fetchAPI("/api/network/stats"),
          fetchAPI("/api/network/devices"),
          fetchAPI("/api/network/alerts"),
        ]);
        
        // Update stats with real device counts
        statsRes.devices_online = devicesRes.devices.filter((d: any) => d.status === 'online').length;
        statsRes.devices_total = devicesRes.devices.length;
        
        setStats(statsRes);
        setDevices(devicesRes.devices);
        setAlerts(alertsRes.alerts);

        // Update real-time chart
        setBandwidthData(prev => {
          const newData = [...prev.slice(1), {
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
            usage: statsRes.throughput_mbps || Math.random() * 5 + 1
          }];
          return newData;
        });

      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                  Network Dashboard
                  <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary glow-primary">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    LIVE
                  </div>
                </h1>
                <p className="text-text-secondary mt-1">Real-time network intelligence overview</p>
              </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Devices Online"
                value={stats?.devices_online || 0}
                unit={`/ ${stats?.devices_total || 0}`}
                icon={<Server className="w-5 h-5" />}
                trend="up"
                trendValue="LAN Detected"
                color="primary"
              />
              <StatCard
                title="Total Data Transferred"
                value={stats?.bandwidth_used || 0}
                unit={`MB`}
                icon={<Activity className="w-5 h-5" />}
                trend="up"
                trendValue="Current session"
                color="secondary"
              />
              <StatCard
                title="Throughput"
                value={stats?.throughput_mbps || 0}
                unit="MB/s"
                icon={<Zap className="w-5 h-5" />}
                trend="stable"
                trendValue="Real-time"
                color="accent"
              />
              <StatCard
                title="Packet Loss"
                value={stats?.packet_loss || 0}
                unit="drops"
                icon={<Globe className="w-5 h-5" />}
                trend={stats?.packet_loss && stats.packet_loss > 0 ? "down" : "stable"}
                trendValue="Interface errors"
                color={stats?.packet_loss && stats.packet_loss > 0 ? "danger" : "primary"}
              />
            </motion.div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* 3D Network Map */}
              <motion.div variants={item} className="xl:col-span-2">
                <GlassCard className="h-[450px] relative overflow-hidden p-0 border-white/10">
                  <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <h3 className="text-xl font-bold text-text-primary tracking-wide">Network Topology</h3>
                    <p className="text-sm text-text-secondary mt-1">Live 3D interactive mapping</p>
                  </div>
                  <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(6,214,160,0.8)]" />
                      <span className="text-white font-medium">Gateway</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                      <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                      <span className="text-white font-medium">Workstation</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-xs">
                      <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      <span className="text-white font-medium">IoT Device</span>
                    </div>
                  </div>
                  <NetworkScene3D />
                </GlassCard>
              </motion.div>

              {/* Bandwidth Chart */}
              <motion.div variants={item} className="flex flex-col gap-6">
                <GlassCard className="flex-1 flex flex-col h-[215px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-text-primary">Live Throughput</h3>
                    <span className="text-xs text-primary px-2 py-1 rounded bg-primary/10">MB/s</span>
                  </div>
                  <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bandwidthData}>
                        <defs>
                          <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} minTickGap={20} />
                        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickFormatter={(val) => `${val}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: 'var(--primary)' }}
                        />
                        <Area type="monotone" dataKey="usage" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" animationDuration={300} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                {/* Active Alerts */}
                <GlassCard className="flex-1 flex flex-col h-[211px] overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-text-primary">Recent Alerts</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-text-secondary text-xs font-medium">
                      {alerts.length} Total
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border transition-all ${
                          alert.severity === "critical"
                            ? "bg-danger/5 border-danger/20"
                            : alert.severity === "warning"
                            ? "bg-accent/5 border-accent/20"
                            : "bg-white/5 border-white/10"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-md ${
                              alert.severity === "critical" ? "bg-danger/10 text-danger" : 
                              alert.severity === "warning" ? "bg-accent/10 text-accent" : "bg-white/10 text-text-secondary"
                            }`}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-text-primary leading-tight">{alert.message}</p>
                            <p className="text-[10px] text-text-muted mt-1 font-mono">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Devices table */}
            <motion.div variants={item}>
              <GlassCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Radio className="w-5 h-5 text-secondary" />
                    Detected LAN Devices
                  </h3>
                  <span className="text-sm text-text-muted px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    Auto-refreshed via ARP
                  </span>
                </div>
                <div className="overflow-x-auto custom-scrollbar pb-2">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Device Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">IP Address</th>
                        <th className="py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">MAC Address</th>
                        <th className="py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">Latency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.slice(0, 10).map((device: any, i) => (
                        <motion.tr
                          key={device.id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-colors">
                                <Server className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
                              </div>
                              <span className="text-sm font-medium text-text-primary">{device.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-secondary">{device.ip}</td>
                          <td className="py-3 px-4 text-sm font-mono text-text-muted">{device.mac}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={device.status} />
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-1.5">
                              {device.latency > 0 ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                  <span className="text-text-secondary">{device.latency}ms</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                                  <span className="text-text-muted">Timeout</span>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                      {devices.length === 0 && !loading && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-text-muted">
                            No devices detected on the network
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
