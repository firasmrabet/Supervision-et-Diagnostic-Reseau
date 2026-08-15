"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Zap,
  Shield,
  Activity,
  ArrowRight,
  Globe,
  Cpu,
  Wifi,
  BarChart3,
} from "lucide-react";

const AICore3D = dynamic(() => import("@/components/3d/AICore"), { ssr: false });

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-pattern relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px]" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* 3D Scene */}
        {mounted && (
          <div className="absolute inset-0 opacity-30">
            <AICore3D />
          </div>
        )}

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="text-center relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-primary animate-float">
              <Zap className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-6xl md:text-8xl font-bold mb-4"
          >
            <span className="text-gradient">NetPulse</span>
            <span className="text-text-primary"> AI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xl md:text-2xl text-text-secondary mb-8 max-w-2xl mx-auto"
          >
            AI-Powered Network Intelligence Platform
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {[
              { icon: Cpu, label: "8 AI Providers", color: "text-primary" },
              { icon: Wifi, label: "Real-time Monitoring", color: "text-secondary" },
              { icon: Shield, label: "Security Analysis", color: "text-accent" },
              { icon: BarChart3, label: "Predictive Analytics", color: "text-primary" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.3 }}
                className="flex items-center gap-2 px-4 py-2 glass rounded-full"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm text-text-secondary">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 214, 160, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl flex items-center gap-2 glow-primary"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/ai-chat")}
              className="px-8 py-4 glass text-text-primary font-semibold rounded-xl flex items-center gap-2 border border-white/10 hover:border-primary/30 transition-colors"
            >
              <Activity className="w-5 h-5" />
              Try AI Assistant
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 text-text-muted"
        >
          {[
            { label: "Uptime", value: "99.99%" },
            { label: "Latency", value: "<15ms" },
            { label: "AI Providers", value: "8 Active" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
