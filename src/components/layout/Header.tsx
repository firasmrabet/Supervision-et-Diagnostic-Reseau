"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, User, Activity, Wifi, LogOut } from "lucide-react";
import { providers } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState<{email: string; role: string} | null>(null);
  const router = useRouter();

  const [notifications, setNotifications] = useState([
    { id: 1, title: "High Latency Detected", desc: "Workstation A is experiencing 150ms latency.", time: "2 min ago", type: "warning" },
    { id: 2, title: "New Device Connected", desc: "Unknown device (Mac: 00:1A:2B...) joined LAN.", time: "15 min ago", type: "info" },
    { id: 3, title: "AI Report Ready", desc: "Weekly Security Audit has been generated.", time: "1 hr ago", type: "success" },
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem("netpulse_user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("netpulse_token");
    localStorage.removeItem("netpulse_user");
    router.push("/login");
  };
  
  return (
    <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search devices, alerts, or ask AI..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/10">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Center: AI Providers */}
      <div className="hidden lg:flex items-center gap-2">
        {providers.map((provider) => (
          <motion.div
            key={provider.id}
            whileHover={{ scale: 1.1, y: -2 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
            style={{
              backgroundColor: `${provider.color}20`,
              color: provider.color,
              border: `1px solid ${provider.color}40`,
            }}
            title={provider.name}
          >
            {provider.icon}
          </motion.div>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Activity className="w-3 h-3 text-primary animate-pulse" />
          <span className="text-xs font-medium text-primary">LIVE</span>
        </div>

        {/* WiFi indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
          <Wifi className="w-3 h-3 text-secondary" />
          <span className="text-xs font-medium text-secondary">Connected</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-xl transition-colors ${showNotifications ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5 text-text-secondary" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-bold text-text-primary">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-xs text-primary cursor-pointer hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <p className={`text-sm font-bold ${notif.type === 'warning' ? 'text-warning' : notif.type === 'success' ? 'text-primary' : 'text-secondary'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-text-muted mt-1">{notif.desc}</p>
                      <p className="text-[10px] text-text-muted/70 mt-2">{notif.time}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative border-l border-white/10 pl-4">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-xl transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium">{user ? user.email.split('@')[0] : 'Guest'}</p>
              <p className="text-xs text-text-muted">{user ? 'Network Engineer' : 'Please Login'}</p>
            </div>
          </button>

          <AnimatePresence>
          {showProfile && (
             <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden z-50 py-1"
             >
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push("/login")}
                    className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </button>
                )}
             </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
