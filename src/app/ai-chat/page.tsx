"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChatMessage } from "@/components/ui/ChatMessage";
import { fetchAPI, providers } from "@/lib/utils";
import {
  Send,
  Sparkles,
  Loader2,
  Zap,
  Brain,
  Code,
  Shield,
  Wifi,
  Activity
} from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types";

const taskTypes = [
  { id: "chat", label: "General Chat", icon: Brain, color: "text-primary" },
  { id: "diagnostic", label: "Diagnostics", icon: Zap, color: "text-accent" },
  { id: "analysis", label: "Deep Analysis", icon: Activity, color: "text-secondary" },
  { id: "code", label: "Code Generation", icon: Code, color: "text-primary" },
  { id: "security", label: "Security Audit", icon: Shield, color: "text-danger" },
];

const SUGGESTIONS = [
  { icon: Wifi, text: "Scan my current WiFi network for security issues" },
  { icon: Activity, text: "Ping Google DNS and analyze latency" },
  { icon: Shield, text: "Are there any unknown devices on my LAN?" },
  { icon: Code, text: "Write a PowerShell script to flush DNS" }
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content: "Hello! I'm NetPulse AI, your intelligent network assistant powered by Google Gemini and other top models.\n\nI can help you with:\n- **Network Diagnostics** - Analyze alerts and find root causes\n- **Security Audits** - Detect vulnerabilities and threats\n- **Code Generation** - Write scripts for network automation\n- **Deep Analysis** - Understand complex network patterns\n\nHow can I assist you today?",
      provider: "gemini",
      model: "NetPulse AI v2.0",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState("chat");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load latest session or create one
    const initChat = async () => {
      try {
        const sessions = await fetchAPI("/api/chat/sessions");
        if (sessions.length > 0) {
          const latestId = sessions[0].id;
          setSessionId(latestId);
          const history = await fetchAPI(`/api/chat/sessions/${latestId}`);
          if (history.messages && history.messages.length > 0) {
            setMessages((prev) => [...prev, ...history.messages]);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    initChat();
  }, []);

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessageType = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const assistantMessageIndex = messages.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", provider: "unknown", model: "unknown" }
      ]);

      const token = localStorage.getItem("netpulse_token");
      const response = await fetch("http://localhost:8000/api/chat/stream", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageText,
          task_type: taskType,
          max_tokens: 2048,
          temperature: 0.7,
          session_id: sessionId
        }),
      });

      if (!response.ok) throw new Error("Failed to stream response");
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        let done = false;
        let isFirstChunk = true;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim());
            
            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                
                if (isFirstChunk && data._provider) {
                  // Set provider metadata
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      provider: data._provider,
                      model: data._model
                    };
                    return newMessages;
                  });
                  isFirstChunk = false;
                } else if (data.content) {
                  // Append text content
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[assistantMessageIndex] = {
                      ...newMessages[assistantMessageIndex],
                      content: newMessages[assistantMessageIndex].content + data.content
                    };
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Failed to parse chunk:", line);
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: "I apologize, but I encountered an error processing your request. Please ensure the backend is running.",
          provider: "error",
          model: "system",
        };
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        <Header />
        <main className="p-6 h-[calc(100vh-64px)] flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div>
                <h1 className="text-3xl font-bold text-text-primary">AI Assistant Pro</h1>
                <p className="text-text-secondary mt-1">Multi-LLM network intelligence (Gemini, Groq, Mistral)</p>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm text-text-secondary">Smart Routing Active</span>
              </div>
            </div>

            {/* Chat container */}
            <div className="flex-1 flex gap-6 min-h-0">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col h-full relative">
                <GlassCard className="flex-1 flex flex-col min-h-0 h-full relative z-10">
                  <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar pb-4">
                    <AnimatePresence initial={false}>
                      {messages.map((message, i) => (
                        <ChatMessage key={i} message={message} index={i} />
                      ))}
                    </AnimatePresence>
                    
                    {loading && messages[messages.length - 1]?.role === "user" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <div className="bg-surface-elevated border border-white/10 rounded-2xl p-5 flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-sm text-text-secondary">
                            Routing to best model for {taskType}...
                          </span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-1" />
                  </div>

                  {/* Input Area */}
                  <div className="mt-4 pt-4 border-t border-white/5 bg-background/50 backdrop-blur-md sticky bottom-0">
                    {messages.length === 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                        {SUGGESTIONS.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(suggestion.text)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors whitespace-nowrap flex-shrink-0"
                          >
                            <suggestion.icon className="w-3 h-3" />
                            {suggestion.text}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                            }
                          }}
                          placeholder="Ask anything about your network... (Shift+Enter for new line)"
                          className="w-full pl-4 pr-12 py-4 rounded-xl bg-surface border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all resize-none h-[60px] max-h-[200px] custom-scrollbar"
                          disabled={loading}
                          rows={1}
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend()}
                        disabled={loading || !input.trim()}
                        className="px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed glow-primary h-[60px]"
                      >
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline font-medium">Send</span>
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Sidebar - Task types */}
              <div className="w-80 flex-shrink-0 hidden xl:block h-full">
                <GlassCard className="h-full flex flex-col">
                  <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Task Type
                  </h3>
                  <div className="space-y-2 flex-1">
                    {taskTypes.map((task) => (
                      <motion.button
                        key={task.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTaskType(task.id)}
                        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                          taskType === task.id
                            ? "bg-primary/10 border border-primary/20 text-primary glow-primary"
                            : "bg-white/5 border border-transparent text-text-secondary hover:bg-white/10 hover:text-text-primary"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${taskType === task.id ? 'bg-primary/20' : 'bg-white/5'}`}>
                          <task.icon className={`w-5 h-5 ${task.color}`} />
                        </div>
                        <span className="text-sm font-medium">{task.label}</span>
                        {taskType === task.id && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(6,214,160,0.8)]" />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5">
                    <h4 className="text-sm font-medium text-text-secondary mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Active Providers
                    </h4>
                    <div className="space-y-3">
                      {providers.slice(0, 4).map((provider) => (
                        <div
                          key={provider.id}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-white/5 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full shadow-lg"
                              style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}80` }}
                            />
                            <span className="text-sm font-medium text-text-primary">{provider.name}</span>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            Ready
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
