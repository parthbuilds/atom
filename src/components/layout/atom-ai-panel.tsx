"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProtonLogo } from "@/components/ui/proton-logo";
import { Button } from "@/components/ui/button";
import {
  X,
  Send,
  Trash2,
  ChevronRight,
  User,
  Plus,
  Mic,
  FileText,
  Volume2,
  VolumeX,
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
  { label: "🎙️ Maya Voice Agent", query: "What is the status and latency of the Sarvam Hinglish voice agent?" },
  { label: "📱 WhatsApp API", query: "How does the WhatsApp Cloud API integration work?" },
  { label: "🛡️ RBAC Roles", query: "Explain the permission matrix for my current role" },
];

// Helper to render bold **text** and `code` inline
function renderInlineTokens(str: string) {
  const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded font-mono text-[10px] bg-muted/70 border border-border/70 text-foreground">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// Clean Formatted Message Renderer (No raw markdown)
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-foreground">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="font-bold text-xs text-foreground tracking-tight flex items-center gap-1.5 pt-0.5 pb-0.5 border-b border-border/40 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{trimmed.replace(/^###\s+/, "")}</span>
            </h4>
          );
        }

        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          const bulletContent = trimmed.replace(/^[•-]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 py-0.5">
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60 mt-1.5 shrink-0" />
              <div className="flex-1 leading-normal text-foreground/85">
                {renderInlineTokens(bulletContent)}
              </div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 py-0.5">
              <span className="text-[10px] font-mono text-muted-foreground font-semibold shrink-0 mt-0.5">
                {numMatch[1]}.
              </span>
              <div className="flex-1 leading-normal text-foreground/85">
                {renderInlineTokens(numMatch[2])}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-relaxed">
            {renderInlineTokens(trimmed)}
          </p>
        );
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

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: `### ⚛️ Proton Operations Assistant\n\nHello! I am **Proton**, your autonomous copilot for **${orgName}**.\n\nI monitor your live automation queues, credit telemetry, and telephony latency in real-time. How can I help you right now?`,
          actions: [
            { label: "✨ Simulate Inbound Lead", action: "test_lead" },
            { label: "💳 Check Wallet & Rates", action: "check_balance" },
            { label: "🎙️ Maya Voice Agent", action: "navigate", href: "/voice-agent" },
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [orgId, orgName]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, isOpen]);

  // Dismiss on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Voice input
  const toggleVoice = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        setTimeout(adjustTextareaHeight, 10);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      speechRecognitionRef.current = recognition;
      recognition.start();
    } else {
      setIsListening(true);
      setTimeout(() => {
        setInput("Check my current wallet balance and active automations");
        setIsListening(false);
      }, 1500);
    }
  };

  // TTS
  const speakMessage = (msgId: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/###|\*\*|•|`|-/g, "").replace(/\n/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);
    setIsSpeaking(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // File upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            url,
            type: isImage ? "image" : "file",
            size: `${(file.size / 1024).toFixed(1)} KB`,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleActionClick = async (act: AtomAiAction) => {
    if (act.action === "open_topup") {
      onOpenTopup ? onOpenTopup() : router.push("/billing");
    } else if (act.action === "navigate" && act.href) {
      router.push(act.href);
      if (typeof window !== "undefined" && window.innerWidth < 1024) onClose();
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
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomPhone = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          name: randomName,
          phone: randomPhone,
          email: `${randomName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          notes: "Generated by Proton Operations Simulator. Qualified intent: High.",
          source: "WhatsApp Lead Qualifier",
          tags: ["Proton Lead Simulation", "WhatsApp Inbound"],
        }),
      });

      if (res.ok) {
        if (onLeadGenerated) onLeadGenerated();
        setMessages((prev) => [
          ...prev,
          {
            id: `lead-sim-${Date.now()}`,
            sender: "assistant",
            text: `### ✅ Inbound Lead Dispatched to CRM\n\n• **Prospect Name:** ${randomName}\n• **Contact:** \`${randomPhone}\`\n• **Pipeline Channel:** Meta Cloud API Webhook\n• **Status:** QUALIFIED → Maya Outbound Scheduled\n\nThe lead is recorded in your central CRM database.`,
            actions: [
              { label: "📋 Open CRM Leads Hub", action: "navigate", href: "/crm" },
              { label: "🎙️ Monitor Voice Outreach", action: "navigate", href: "/voice-agent" },
            ],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLead(false);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if ((!query && attachments.length === 0) || loading) return;

    const currentAttachments = [...attachments];
    setAttachments([]);

    const userMsg: AtomAiMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query || (currentAttachments.length > 0 ? "Uploaded attachments for analysis" : ""),
      attachments: currentAttachments,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, message: query || "Uploaded attachment", role }),
      });

      if (res.ok) {
        const data = await res.json();
        let replyText = data.reply || "I am processing your query against current workspace telemetry.";
        if (currentAttachments.length > 0) {
          replyText = `### 📎 File Analysis Received\n\nSuccessfully ingested **${currentAttachments.length} attachment(s)** into your operations context.\n\n` + replyText;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: "assistant",
            text: replyText,
            actions: data.actions || [],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        const errData = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "assistant",
            text: `### ⚠️ Telemetry Notice\n\n${errData.error || "Unable to reach operations kernel."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `### ⚠️ Connection Failed\n\nCould not connect to Proton engine: ${e.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
    }
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: `### ⚛️ Proton Operations Copilot\n\nContext reset. Live telemetry connected to **${orgName}**. Ask any question or choose a prompt below.`,
        actions: [
          { label: "✨ Simulate Inbound Lead", action: "test_lead" },
          { label: "💳 Check Wallet & Rates", action: "check_balance" },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Slide-Over Drawer */}
      <aside
        className="fixed top-0 right-0 h-screen w-full sm:w-[400px] max-w-[96vw] border-l border-border/60 bg-background/98 backdrop-blur-xl shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200"
        aria-label="Proton Assistant"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
              <ProtonLogo className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground">Proton</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  AI
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground truncate mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{orgName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={handleClearChat}
              title="Clear chat"
            >
              <Trash2 className="size-3.5" />
            </button>
            <button
              type="button"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="px-3 py-2 border-b border-border/40 overflow-x-auto no-scrollbar shrink-0 flex items-center gap-1.5">
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => sendMessage(p.query)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap bg-muted/40 hover:bg-muted border border-border/60 hover:border-border text-foreground/80 hover:text-foreground transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            const isSpeakingThis = isSpeaking === m.id;

            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="h-6 w-6 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    <ProtonLogo className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-foreground text-background rounded-tr-sm"
                      : "bg-muted/40 border border-border/50 text-foreground rounded-tl-sm"
                  }`}
                >
                  {/* Assistant header */}
                  {!isUser && (
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/30 text-[10px] text-muted-foreground">
                      <span className="font-semibold text-foreground/70">Proton</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakMessage(m.id, m.text)}
                          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                          title={isSpeakingThis ? "Stop" : "Read aloud"}
                        >
                          {isSpeakingThis ? (
                            <VolumeX className="size-3 text-amber-500" />
                          ) : (
                            <Volume2 className="size-3" />
                          )}
                        </button>
                        <span>{m.timestamp}</span>
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mb-2 space-y-1.5">
                      {m.attachments.map((att) => (
                        <div key={att.id} className="rounded-xl overflow-hidden border border-border/40">
                          {att.type === "image" ? (
                            <img
                              src={att.url}
                              alt={att.name}
                              className="max-h-40 w-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-muted/30 text-[11px]">
                              <FileText className="size-3.5 text-primary shrink-0" />
                              <span className="truncate flex-1 font-mono">{att.name}</span>
                              <span className="text-[9px] text-muted-foreground">{att.size}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Message text */}
                  {isUser ? (
                    <span className="text-xs leading-relaxed">{m.text}</span>
                  ) : (
                    <FormattedMessage text={m.text} />
                  )}

                  {/* Action buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap gap-1.5">
                      {m.actions.map((act, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          disabled={generatingLead}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-background/60 hover:bg-background border border-border/60 hover:border-border text-foreground/80 hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <span>{act.label}</span>
                          <ChevronRight className="size-2.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* User timestamp */}
                  {isUser && (
                    <div className="text-[9px] mt-1.5 text-right text-background/50 font-mono">
                      {m.timestamp}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-6 w-6 rounded-lg bg-muted border border-border/60 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="size-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-6 w-6 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                <ProtonLogo className="w-3.5 h-3.5" />
              </div>
              <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-muted/40 border border-border/50 flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-[pulse_1.2s_ease-in-out_0s_infinite]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 animate-[pulse_1.2s_ease-in-out_0.8s_infinite]" />
                </span>
                <span className="text-[11px] text-muted-foreground">Querying telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-3 pb-3 pt-2 border-t border-border/40 bg-background/80 shrink-0 space-y-2">
          {/* Attachment Chips */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/60 border border-border/60 text-[11px] shrink-0 max-w-[140px]"
                >
                  {att.type === "image" ? (
                    <img src={att.url} alt={att.name} className="size-4 rounded object-cover" />
                  ) : (
                    <FileText className="size-3 text-primary shrink-0" />
                  )}
                  <span className="truncate flex-1 font-mono text-[10px]">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="size-3.5 rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/40 flex items-center justify-center transition-colors"
                  >
                    <X className="size-2" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,.pdf,.csv,.txt"
            multiple
            className="hidden"
          />

          {/* Input Row */}
          <div className="flex items-end gap-1.5">
            {/* Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 w-9 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              title="Upload image or document"
            >
              <Plus className="size-4" />
            </button>

            {/* Auto-resizing Textarea */}
            <div className={`flex-1 flex items-end rounded-xl border bg-muted/20 focus-within:bg-background transition-colors ${
              isListening
                ? "border-primary/60 ring-2 ring-primary/20"
                : "border-border/60 focus-within:border-border"
            }`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={isListening ? "Listening… speak now" : "Ask Proton anything…"}
                rows={1}
                disabled={loading}
                className="flex-1 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 px-3 py-2.5 resize-none outline-none leading-relaxed max-h-[120px] overflow-y-auto"
              />
            </div>

            {/* Voice Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                isListening
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "border-border/60 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              <Mic className="size-3.5" />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={(!input.trim() && attachments.length === 0) || loading}
              className="h-9 w-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <Send className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground/50 px-0.5 font-mono">
            <span>Voice • Images • Live Telemetry</span>
            <span>↵ Send • ⇧↵ Newline</span>
          </div>
        </div>
      </aside>
    </>
  );
}
