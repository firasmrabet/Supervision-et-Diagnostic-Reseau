"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "primary" | "secondary" | "accent" | "danger" | "none";
}

export function GlassCard({ children, className, hover = true, glow = "none" }: GlassCardProps) {
  const glowClass = {
    primary: "glow-primary",
    secondary: "glow-secondary",
    accent: "glow-accent",
    danger: "glow-danger",
    none: "",
  }[glow];

  return (
    <div
      className={cn(
        "glass rounded-2xl p-6",
        hover && "card-hover",
        glowClass,
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: "primary" | "secondary" | "accent" | "danger";
}

export function StatCard({ title, value, unit, icon, trend, trendValue, color = "primary" }: StatCardProps) {
  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    accent: "text-accent",
    danger: "text-danger",
  }[color];

  return (
    <GlassCard className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn("text-3xl font-bold", colorClasses)}>{value}</span>
            {unit && <span className="text-text-muted text-sm">{unit}</span>}
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs",
              trend === "up" ? "text-primary" : trend === "down" ? "text-danger" : "text-text-muted"
            )}>
              <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl glass-light", colorClasses)}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-5">
        {icon}
      </div>
    </GlassCard>
  );
}

interface StatusBadgeProps {
  status: "online" | "warning" | "offline";
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    online: "status-online",
    warning: "status-warning",
    offline: "status-offline",
  }[status];

  const labels = {
    online: "Online",
    warning: "Warning",
    offline: "Offline",
  }[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", colors)} />
      <span className="text-sm text-text-secondary">{label || labels}</span>
    </div>
  );
}
