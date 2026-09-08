"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProtonLogo } from "@/components/ui/proton-logo";
import {
  X,
  Send,
  Trash2,
  ChevronRight,
  User,
  Plus,
  Mic,
  MicOff,
  FileText,
  Volume2,
  VolumeX,
  Paperclip,
} from "lucide-react";

export interface AtomAiAction {
  label: string;
  action: string;
  href?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file";
  size?: string;
}

export interface AtomAiMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  actions?: AtomAiAction[];
  attachments?: ChatAttachment[];
  timestamp: string;
}

interface AtomAiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
  role: string;
  onOpenTopup?: () => void;
  onLeadGenerated?: () => void;
}

const PRESET_PROMPTS = [
  { label: "💳 Wallet & CPL", query: "Check my wallet balance, usage rates, and Cost Per Lead" },
  { label: "✨ Simulate Lead", query: "Simulate a test lead to preview the WhatsApp qualifier" },
  { label: "🎙️ Voice Agent", query: "What is the status and latency of the Sarvam Hinglish voice agent?" },
  { label: "📱 WhatsApp API", query: "How does the WhatsApp Cloud API integration work?" },
  { label: "🛡️ RBAC Roles", query: "Explain the permission matrix for my current role" },
];

function renderInlineTokens(str: string) {
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1 py-0.5 rounded text-[10px] font-mono bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <div key={idx} className="flex items-center gap-1.5 font-semibold text-[13px] pt-1 pb-0.5 border-b border-current/10 mb-1">
              <span className="size-1.5 rounded-full bg-primary shrink-0" />
              {trimmed.replace(/^###\s+/, "")}
            </div>
          );
        }

        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="size-1 rounded-full bg-current/40 mt-2 shrink-0" />
              <span className="flex-1">{renderInlineTokens(trimmed.replace(/^[•-]\s+/, ""))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[11px] font-mono text-current/50 shrink-0 mt-0.5 w-4">{numMatch[1]}.</span>
              <span className="flex-1">{renderInlineTokens(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInlineTokens(trimmed)}</p>;
      })}
    </div>
  );
}

export function AtomAiPanel({
  isOpen,
  onClose,
  orgId,
  orgName,
  role,
  onOpenTopup,
  onLeadGenerated,
}: AtomAiPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<AtomAiMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingLead, setGeneratingLead] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 100) + "px";
  };

  const resetHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        sender: "assistant",
        text: `### ⚛️ Proton Operations Assistant\n\nHello! I'm **Proton**, your autonomous copilot for **${orgName}**.\n\nI monitor your live automation queues, credit telemetry, and telephony latency in real-time. How can I help?`,
        actions: [
          { label: "✨ Simulate Inbound Lead", action: "test_lead" },
          { label: "💳 Check Wallet & Rates", action: "check_balance" },
          { label: "🎙️ Maya Voice Agent", action: "navigate", href: "/voice-agent" },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }
  }, [orgId, orgName]);

  useEffect(() => {
    if (isOpen) setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, [messages, isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);

  const toggleVoice = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = "en-IN";
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const t = e.results[0][0].transcript;
        setInput(p => p ? `${p} ${t}` : t);
        setIsListening(false);
        setTimeout(adjustHeight, 10);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      speechRecognitionRef.current = rec;
      rec.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        setInput("Check my current wallet balance and active automations");
        setIsListening(false);
      }, 1500);
    }
  };

  const speakMessage = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/###|\*\*|•|`|-/g, "").replace(/\n/g, ". "));
    u.rate = 1.05;
    u.onend = () => setIsSpeaking(null);
    u.onerror = () => setIsSpeaking(null);
    setIsSpeaking(msgId);
    window.speechSynthesis.speak(u);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setAttachments(p => [...p, {
          id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          name: file.name,
          url: ev.target?.result as string,
          type: file.type.startsWith("image/") ? "image" : "file",
          size: `${(file.size / 1024).toFixed(1)} KB`,
        }]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => setAttachments(p => p.filter(a => a.id !== id));

  const handleActionClick = async (act: AtomAiAction) => {
    if (act.action === "open_topup") {
      onOpenTopup ? onOpenTopup() : router.push("/billing");
    } else if (act.action === "navigate" && act.href) {
      router.push(act.href);
      if (window.innerWidth < 1024) onClose();
    } else if (act.action === "test_lead") {
      await handleSimulateLead();
    } else if (act.action === "check_balance") {
      await sendMessage("Check my current wallet balance and credit burn rates");
    }
  };

  const handleSimulateLead = async () => {
    setGeneratingLead(true);
    try {
      const names = ["Aarav Sharma", "Riya Sen", "Kunal Deshmukh", "Ananya Iyer", "Deepak Patel"];
      const name = names[Math.floor(Math.random() * names.length)];
      const phone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId, name, phone,
          email: `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          notes: "Generated by Proton Simulator. Qualified intent: High.",
          source: "WhatsApp Lead Qualifier",
          tags: ["Proton Lead Simulation", "WhatsApp Inbound"],
        }),
      });
      if (res.ok) {
        if (onLeadGenerated) onLeadGenerated();
        setMessages(p => [...p, {
          id: `lead-${Date.now()}`,
          sender: "assistant",
          text: `### ✅ Inbound Lead Dispatched\n\n• **Name:** ${name}\n• **Contact:** \`${phone}\`\n• **Channel:** Meta Cloud API Webhook\n• **Status:** QUALIFIED → Maya Outbound Scheduled`,
          actions: [
            { label: "📋 Open CRM", action: "navigate", href: "/crm" },
            { label: "🎙️ Monitor Voice", action: "navigate", href: "/voice-agent" },
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
    } catch (e) { console.error(e); }
    finally { setGeneratingLead(false); }
  };

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if ((!query && !attachments.length) || loading) return;

    const currentAttachments = [...attachments];
    setAttachments([]);
    setInput("");
    resetHeight();

    const userMsg: AtomAiMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query || "Uploaded attachments for analysis",
      attachments: currentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, message: query || "Uploaded attachment", role }),
      });
      if (res.ok) {
        const data = await res.json();
        let replyText = data.reply || "Processing your query against live telemetry.";
        if (currentAttachments.length > 0) {
          replyText = `### 📎 Attachments Received\n\nIngested **${currentAttachments.length}** file(s) into context.\n\n` + replyText;
        }
        setMessages(p => [...p, {
          id: `bot-${Date.now()}`,
          sender: "assistant",
          text: replyText,
          actions: data.actions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      } else {
        const err = await res.json();
        setMessages(p => [...p, {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `### ⚠️ Notice\n\n${err.error || "Unable to reach operations kernel."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
      }
    } catch (e: any) {
      setMessages(p => [...p, {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `### ⚠️ Connection Failed\n\nCould not connect to Proton: ${e.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); setIsSpeaking(null); }
    setMessages([{
      id: `w-${Date.now()}`,
      sender: "assistant",
      text: `### ⚛️ Proton Copilot\n\nContext reset. Connected to **${orgName}**. How can I help?`,
      actions: [
        { label: "✨ Simulate Lead", action: "test_lead" },
        { label: "💳 Check Wallet", action: "check_balance" },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[1.5px] z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className="fixed top-0 right-0 h-screen w-[380px] max-w-[calc(100vw-16px)] bg-background border-l border-border/60 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200 overflow-hidden"
        aria-label="Proton AI Assistant"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0 bg-background">
          <div className="flex items-center gap-2.5">
            {/* Logo - deliberately small and refined */}
            <div className="size-7 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center overflow-hidden shrink-0">
              <ProtonLogo className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-semibold text-foreground tracking-tight">Proton</span>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/15">
                  AI
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span suppressHydrationWarning className="truncate max-w-[160px]">{orgName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={clearChat}
              title="Clear chat"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center justify-center transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close (Esc)"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 flex items-center justify-center transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* ── Quick Prompts ── */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/40 overflow-x-auto no-scrollbar shrink-0">
          {PRESET_PROMPTS.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => sendMessage(p.query)}
              disabled={loading}
              className="flex-shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full bg-muted/50 hover:bg-muted border border-border/50 hover:border-border text-foreground/75 hover:text-foreground transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-4">
          {messages.map(m => {
            const isUser = m.sender === "user";
            return (
              <div key={m.id} className={`flex gap-2 min-w-0 ${isUser ? "justify-end" : "justify-start"}`}>
                {/* Assistant avatar */}
                {!isUser && (
                  <div className="size-6 rounded-md bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    <ProtonLogo className="size-3.5" />
                  </div>
                )}

                <div className={`max-w-[86%] min-w-0 flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div className={`rounded-2xl px-3.5 py-2.5 break-words overflow-hidden ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 border border-border/40 text-foreground rounded-tl-sm"
                  }`}>
                    {/* Assistant header row */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1.5 border-b border-border/30 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground/60">Proton</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakMessage(m.id, m.text)}
                            className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          >
                            {isSpeaking === m.id ? <VolumeX className="size-3 text-amber-400" /> : <Volume2 className="size-3" />}
                          </button>
                          <span>{m.timestamp}</span>
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {m.attachments.map(att => (
                          <div key={att.id} className="rounded-lg overflow-hidden border border-border/30">
                            {att.type === "image" ? (
                              <img src={att.url} alt={att.name} className="max-h-36 w-full object-cover" />
                            ) : (
                              <div className="flex items-center gap-2 px-2.5 py-2 bg-background/30 text-[11px]">
                                <FileText className="size-3.5 shrink-0 opacity-60" />
                                <span className="truncate flex-1 font-mono">{att.name}</span>
                                <span className="text-[9px] opacity-50">{att.size}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message text */}
                    {isUser ? (
                      <span className="text-[13px] leading-relaxed break-words">{m.text}</span>
                    ) : (
                      <FormattedMessage text={m.text} />
                    )}

                    {/* User timestamp */}
                    {isUser && (
                      <p className="text-[9px] text-right text-primary-foreground/50 mt-1 font-mono">{m.timestamp}</p>
                    )}
                  </div>

                  {/* Action buttons (outside bubble) */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          disabled={generatingLead}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-background border border-border/60 hover:border-border hover:bg-muted/50 text-foreground/80 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {act.label}
                          <ChevronRight className="size-2.5 opacity-50" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {isUser && (
                  <div className="size-6 rounded-md bg-muted border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="size-6 rounded-md bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                <ProtonLogo className="size-3.5" />
              </div>
              <div className="px-3.5 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/40 flex items-center gap-2">
                <span className="flex gap-[3px]">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground/40"
                      style={{ animation: `pulse 1.2s ease-in-out ${d}s infinite` }}
                    />
                  ))}
                </span>
                <span className="text-[11px] text-muted-foreground/70">Querying live telemetry…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Area ── */}
        <div className="shrink-0 border-t border-border/40 bg-background px-3 pt-2.5 pb-3 space-y-2">
          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {attachments.map(att => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/50 border border-border/50 text-[11px] shrink-0 max-w-[150px]"
                >
                  {att.type === "image"
                    ? <img src={att.url} alt={att.name} className="size-4 rounded object-cover shrink-0" />
                    : <FileText className="size-3 shrink-0 opacity-60" />
                  }
                  <span className="truncate flex-1 font-mono text-[10px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="size-3.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="size-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.csv,.txt,.docx"
            multiple
            className="hidden"
          />

          {/* Row: upload + textarea + voice + send */}
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach file or image"
              className="size-9 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="size-4" />
            </button>

            {/* Textarea wrapper */}
            <div className={`flex-1 flex items-end gap-0 rounded-xl border transition-colors overflow-hidden ${
              isListening
                ? "border-primary/50 ring-2 ring-primary/15 bg-background"
                : "border-border/50 bg-muted/20 focus-within:border-border/80 focus-within:bg-background"
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); adjustHeight(); }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isListening ? "Listening… speak now" : "Ask Proton anything…"}
                rows={1}
                disabled={loading}
                className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 px-3 py-2.5 resize-none outline-none leading-relaxed max-h-[100px] overflow-y-auto"
              />
            </div>

            <button
              type="button"
              onClick={toggleVoice}
              title={isListening ? "Stop listening" : "Voice input"}
              className={`size-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                isListening
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border/50 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {isListening ? <MicOff className="size-3.5" /> : <Mic className="size-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={(!input.trim() && !attachments.length) || loading}
              className="size-9 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.95] text-primary-foreground flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <Send className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground/40 font-mono px-0.5">
            <span>Voice · Images · Live Telemetry</span>
            <span>↵ Send · ⇧↵ Newline</span>
          </div>
        </div>
      </aside>
    </>
  );
}
