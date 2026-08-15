"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/GlassCard";
import { fetchAPI } from "@/lib/utils";
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  Loader2,
  Sparkles,
  Shield,
  Copy,
  Check,
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const reportTypes = [
  {
    id: "health",
    title: "Network Health Report",
    description: "Full health check of all detected devices, interfaces, and connectivity",
    icon: CheckCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    id: "security",
    title: "Security Audit",
    description: "WiFi security analysis, open device assessment, and vulnerability scan",
    icon: Shield,
    color: "text-danger",
    bgColor: "bg-danger/10",
    borderColor: "border-danger/20",
    gradient: "from-danger/20 to-danger/5",
  },
  {
    id: "performance",
    title: "Performance Analysis",
    description: "Bandwidth utilization, latency analysis, and throughput optimization",
    icon: TrendingUp,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/20",
    gradient: "from-secondary/20 to-secondary/5",
  },
  {
    id: "incident",
    title: "Incident Detection",
    description: "Anomaly detection, offline nodes, high-latency patterns, suspicious activity",
    icon: Activity,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/20",
    gradient: "from-accent/20 to-accent/5",
  },
];

interface GeneratedReport {
  content: string;
  provider: string;
  model: string;
  type: string;
  timestamp: string;
}

export default function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<GeneratedReport[]>([]);
  const [copied, setCopied] = useState(false);

  const generateReport = async (reportType: string) => {
    setGenerating(reportType);
    setCurrentReport(null);
    try {
      const res = await fetchAPI("/api/reports/generate", {
        method: "POST",
        body: JSON.stringify({ report_type: reportType }),
      });
      const report: GeneratedReport = {
        content: res.report,
        provider: res.provider,
        model: res.model,
        type: reportType,
        timestamp: new Date().toISOString(),
      };
      setCurrentReport(report);
      setHistory((prev) => [report, ...prev]);
    } catch (err) {
      console.error("Report generation failed:", err);
      setCurrentReport({
        content: "## ❌ Report Generation Failed\n\nPlease ensure the backend is running and AI providers are configured.",
        provider: "error",
        model: "system",
        type: reportType,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setGenerating(null);
    }
  };

  const copyReport = () => {
    if (currentReport) {
      navigator.clipboard.writeText(currentReport.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReport = () => {
    if (!currentReport) return;
    const typeLabel = reportTypes.find(r => r.id === currentReport.type)?.title || "Report";
    const blob = new Blob([currentReport.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NetPulse_${typeLabel.replace(/\s/g, "_")}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                  AI Reports
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-normal">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    Powered by Live Data
                  </span>
                </h1>
                <p className="text-text-secondary mt-1">Generate intelligent reports from your real-time network data</p>
              </div>
            </motion.div>

            {/* Report type cards */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((type) => {
                const isGenerating = generating === type.id;
                return (
                  <motion.div
                    key={type.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => generateReport(type.id)}
                      disabled={generating !== null}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                        currentReport?.type === type.id
                          ? `${type.bgColor} ${type.borderColor} shadow-lg`
                          : "bg-surface border-white/5 hover:border-white/15"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                      <div className="relative z-10">
                        <div className={`p-3 rounded-xl ${type.bgColor} w-fit mb-4`}>
                          {isGenerating ? (
                            <Loader2 className={`w-6 h-6 ${type.color} animate-spin`} />
                          ) : (
                            <type.icon className={`w-6 h-6 ${type.color}`} />
                          )}
                        </div>
                        <h3 className="text-base font-bold text-text-primary mb-1">{type.title}</h3>
                        <p className="text-xs text-text-muted leading-relaxed">{type.description}</p>
                        {isGenerating && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-primary">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            Analyzing network...
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Generated report display */}
            <AnimatePresence mode="wait">
              {currentReport && (
                <motion.div
                  key={currentReport.timestamp}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GlassCard className="relative overflow-hidden">
                    {/* Report header */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-text-primary">
                            {reportTypes.find(r => r.id === currentReport.type)?.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-muted">
                              Generated {new Date(currentReport.timestamp).toLocaleString()}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">
                              {currentReport.provider} • {currentReport.model}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyReport}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
                        >
                          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                        <button
                          onClick={downloadReport}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-sm font-medium glow-primary"
                        >
                          <Download className="w-4 h-4" />
                          Download .md
                        </button>
                      </div>
                    </div>

                    {/* Report content */}
                    <div className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-strong:text-text-primary prose-li:text-text-secondary prose-td:text-text-secondary prose-th:text-text-primary">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto rounded-lg border border-white/10 my-4">
                              <table className="w-full" {...props} />
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-4 py-3 bg-white/5 text-left text-xs uppercase tracking-wider font-bold" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-4 py-3 border-t border-white/5 text-sm" {...props} />
                          ),
                          code({ node, inline, className, children, ...props }: any) {
                            const isInline = inline || !/language-/.test(className || "");
                            return isInline ? (
                              <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary text-sm" {...props}>
                                {children}
                              </code>
                            ) : (
                              <div className="rounded-lg overflow-hidden my-4 border border-white/10">
                                <div className="bg-black/60 p-4 overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </div>
                              </div>
                            );
                          },
                        }}
                      >
                        {currentReport.content}
                      </ReactMarkdown>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {!currentReport && !generating && (
              <motion.div variants={item}>
                <GlassCard className="text-center py-16">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center mb-6 border border-white/5">
                      <FileText className="w-10 h-10 text-text-muted opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-2">No Report Generated Yet</h3>
                    <p className="text-text-muted max-w-md">
                      Select a report type above to generate an AI-powered analysis of your live network data.
                      Reports are created in real-time using your actual network state.
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Report history */}
            {history.length > 1 && (
              <motion.div variants={item}>
                <GlassCard>
                  <h3 className="text-base font-semibold text-text-primary mb-4">Report History (This Session)</h3>
                  <div className="space-y-2">
                    {history.slice(1).map((report, i) => {
                      const typeInfo = reportTypes.find(r => r.id === report.type);
                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentReport(report)}
                          className="w-full text-left p-3 rounded-xl bg-surface border border-white/5 hover:border-white/15 transition-all flex items-center gap-4"
                        >
                          <div className={`p-2 rounded-lg ${typeInfo?.bgColor}`}>
                            {typeInfo && <typeInfo.icon className={`w-4 h-4 ${typeInfo.color}`} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">{typeInfo?.title}</p>
                            <p className="text-xs text-text-muted">{new Date(report.timestamp).toLocaleString()}</p>
                          </div>
                          <span className="text-xs text-text-muted px-2 py-1 bg-white/5 rounded">{report.provider}</span>
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
