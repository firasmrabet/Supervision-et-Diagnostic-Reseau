"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Copy, Check, Bot, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { providers } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/types";

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAssistant = message.role === "assistant";
  const providerDetails = isAssistant && message.provider !== "system"
    ? providers.find((p) => p.id === message.provider)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${!isAssistant ? "justify-end" : "justify-start"}`}
    >
      {isAssistant && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg glow-primary">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl p-5 ${
          !isAssistant
            ? "bg-primary/10 border border-primary/20 text-primary-foreground"
            : "bg-surface-elevated border border-white/10"
        }`}
      >
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");
                const isInline = inline || !match;
                
                return !isInline ? (
                  <div className="relative group rounded-md overflow-hidden my-4 border border-white/10">
                    <div className="flex items-center justify-between px-4 py-2 bg-black/40 text-xs text-text-muted">
                      <span>{match?.[1] || "code"}</span>
                      <button
                        onClick={() => copyToClipboard(codeString, `code-${index}`)}
                        className="hover:text-white transition-colors"
                      >
                        {copiedId === `code-${index}` ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="p-4 bg-black/60 overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </div>
                  </div>
                ) : (
                  <code className="bg-black/30 px-1.5 py-0.5 rounded text-primary text-sm" {...props}>
                    {children}
                  </code>
                );
              },
              a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {providerDetails && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: providerDetails.color }}
            />
            <span className="text-xs text-text-muted font-medium">
              {providerDetails.name} • {message.model}
            </span>
            <button
              onClick={() => copyToClipboard(message.content, `msg-${index}`)}
              className="ml-auto text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-xs"
            >
              {copiedId === `msg-${index}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-primary" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Response
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!isAssistant && (
        <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-5 h-5 text-text-secondary" />
        </div>
      )}
    </motion.div>
  );
}
