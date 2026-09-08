"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Bot,
  PhoneCall,
  CreditCard,
  Layers,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Zap,
  Globe,
  Radio,
  Sliders,
  Check,
  MessageSquare,
  TrendingUp,
  Clock,
  ChevronRight,
  Terminal,
  Activity,
  ArrowUpRight,
  Play,
  Volume2,
} from "lucide-react";
import { AtomWordmark, AtomOrbitO } from "@/components/ui/atom-wordmark";

export default function HomePage() {
  const [activeSimulator, setActiveSimulator] = useState<"whatsapp" | "voice" | "wallet">("whatsapp");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="synthio-scope relative min-h-screen bg-[#f8f7f3] text-neutral-950 font-synthio-body selection:bg-neutral-900 selection:text-white">
      {/* Architectural Blueprint Vertical Dashed Guide Lines */}
      <div
        className="pointer-events-none fixed inset-0 z-40 mx-auto hidden max-w-[1180px] xl:block"
        aria-hidden="true"
      >
        <div className="absolute top-0 bottom-0 left-0 w-px dashed-line-v opacity-25" />
        <div className="absolute top-0 bottom-0 right-0 w-px dashed-line-v opacity-25" />
      </div>

      {/* Floating Synthio-style Header */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-[#f8f7f3]/90 backdrop-blur-md border-b border-[#e2e0d8] shadow-xs py-3.5"
            : "bg-transparent py-5"
          }`}
      >
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo with Orbiting Electron in the "O" */}
          <div className="flex items-center gap-3">
            <AtomWordmark size="md" showBadge badgeText="Platform" href="/" />
          </div>

          {/* Nav Center Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
            <a href="#features" className="transition-colors hover:text-neutral-950">
              Capabilities
            </a>
            <a href="#live-engine" className="transition-colors hover:text-neutral-950">
              Interactive Engine
            </a>
            <a href="#architecture" className="transition-colors hover:text-neutral-950">
              Architecture
            </a>
          </nav>

          {/* Auth Action Cluster */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/docs"
              className="hidden sm:inline-flex text-xs font-medium text-neutral-600 hover:text-neutral-950 px-3 py-1.5 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-neutral-800 hover:text-neutral-950 px-3 py-1.5 rounded-md hover:bg-neutral-200/50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-950 text-white hover:bg-neutral-800 px-4 py-2 rounded-full shadow-xs active:scale-95 transition-all"
            >
              <span>Sign Up</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-28 pb-20 sm:pt-36 sm:pb-24">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          {/* Telemetry Badge Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#edf5f0] border border-emerald-300/70 text-[11px] font-synthio-mono text-emerald-900 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <span className="font-semibold uppercase tracking-wider">
                PRODUCTION MULTI-TENANT AI AUTOMATION PLATFORM
              </span>
              <span className="text-emerald-500 font-bold">•</span>
              <span className="text-emerald-700">SUB-180MS</span>
            </div>
          </div>

          {/* Hero Headings */}
          <div className="text-center max-w-[880px] mx-auto space-y-5">
            <h1 className="font-synthio-heading text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.08] text-neutral-950">
              Turn Inbound Traffic Into Booked Customers{" "}
              <span className="inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent underline decoration-blue-200 underline-offset-8">
                On Complete Autopilot
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-[720px] mx-auto font-normal">
              Self-onboard in 3 minutes, get deterministic AI-suggested WhatsApp bots, voice calling agents, and booking funnels. Pay with an INR credit wallet.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-95 group"
              >
                <span>Sign Up for Free</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white border border-[#d8d6ce] text-neutral-800 font-medium text-sm hover:bg-neutral-50 hover:border-neutral-400 transition-all shadow-2xs"
              >
                <span>Sign In to Dashboard →</span>
              </Link>
            </div>

            {/* 4 Architectural Guarantee Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 text-xs text-neutral-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Multi-Tenant RBAC Enforced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Sarvam AI (Hinglish Voice) + ElevenLabs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Razorpay Credit Wallet &amp; Auto-Alerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Live White-Label CSS Theming</span>
              </div>
            </div>
          </div>

          {/* Interactive Live Engine Simulator Showcase */}
          <div id="live-engine" className="mt-16 sm:mt-20">
            <div className="rounded-2xl border border-[#e2e0d8] bg-white shadow-sm overflow-hidden">
              {/* Simulator Tabs Header */}
              <div className="px-5 py-3.5 bg-[#faf9f6] border-b border-[#e2e0d8] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-rose-400/80 inline-block" />
                  <span className="size-3 rounded-full bg-amber-400/80 inline-block" />
                  <span className="size-3 rounded-full bg-emerald-400/80 inline-block" />
                  <span className="ml-2 font-synthio-mono text-[11px] text-neutral-500 uppercase tracking-widest hidden sm:inline">
                    LIVE AUTOMATION KERNEL // ATOM-v2.4
                  </span>
                </div>

                {/* Tab selector */}
                <div className="flex items-center gap-1 bg-[#f0eee6] p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveSimulator("whatsapp")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${activeSimulator === "whatsapp"
                        ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                        : "text-neutral-600 hover:text-neutral-900"
                      }`}
                  >
                    WhatsApp Qualifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSimulator("voice")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${activeSimulator === "voice"
                        ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                        : "text-neutral-600 hover:text-neutral-900"
                      }`}
                  >
                    Voice AI (Hinglish)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSimulator("wallet")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${activeSimulator === "wallet"
                        ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                        : "text-neutral-600 hover:text-neutral-900"
                      }`}
                  >
                    Credit Wallet Metering
                  </button>
                </div>
              </div>

              {/* Simulator Active Pane */}
              <div className="p-6 sm:p-8 bg-[#fdfcf9]">
                {activeSimulator === "whatsapp" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#edf5f0] text-emerald-800 border border-emerald-200 text-xs font-medium">
                        <Bot className="size-3.5 text-emerald-600" />
                        <span>Meta Cloud API • 2.8s Response</span>
                      </div>
                      <h3 className="font-synthio-heading text-2xl font-bold text-neutral-950 tracking-tight">
                        Instant Lead Qualification &amp; CRM Sync
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        When prospects message your WhatsApp, Atom greets them instantly, parses intent, collects budget constraints, and locks the qualified deal directly into your central CRM table.
                      </p>
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>Average Response Time:</span>
                          <span className="font-semibold text-emerald-700">1.8 Seconds</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>Lead Validation Accuracy:</span>
                          <span className="font-semibold text-neutral-900">99.4% Deterministic</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 pb-1 font-synthio-mono">
                          <span>Usage Metering:</span>
                          <span className="font-semibold text-blue-700">₹0.18 / qualified message</span>
                        </div>
                      </div>
                    </div>

                    {/* Chat simulator preview */}
                    <div className="lg:col-span-7 rounded-xl border border-[#e2e0d8] bg-white p-4 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            WA
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-neutral-900">Atom AI Receptionist</div>
                            <div className="text-[10px] text-emerald-600 font-mono">Online • Meta Cloud Webhook</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                          Tenant: Demo Clinic
                        </span>
                      </div>

                      {/* Messages sequence */}
                      <div className="space-y-2.5 text-xs">
                        <div className="max-w-[80%] bg-neutral-100 text-neutral-800 p-2.5 rounded-lg rounded-tl-none">
                          Hi, I want to book a root canal consultation for tomorrow afternoon. What is the fee?
                        </div>
                        <div className="max-w-[85%] ml-auto bg-[#eff6ff] border border-blue-200 text-blue-950 p-2.5 rounded-lg rounded-tr-none space-y-1">
                          <p>
                            Namaste! Our root canal consultations start at ₹800 including digital X-rays. We have slots open tomorrow at <strong>2:30 PM</strong> and <strong>5:00 PM</strong> with Dr. Sharma.
                          </p>
                          <div className="text-[10px] text-blue-700 font-mono pt-1 border-t border-blue-200/50 flex items-center gap-1">
                            <CheckCircle2 className="size-3 text-blue-600" />
                            <span>Qualifying: Intent [Booking] • Slot Proposed • Latency 1.6s</span>
                          </div>
                        </div>
                        <div className="max-w-[80%] bg-neutral-100 text-neutral-800 p-2.5 rounded-lg rounded-tl-none">
                          Tomorrow 5:00 PM works perfect for me!
                        </div>
                        <div className="max-w-[85%] ml-auto bg-[#edf5f0] border border-emerald-200 text-emerald-950 p-2.5 rounded-lg rounded-tr-none">
                          <div className="font-semibold text-emerald-900 mb-0.5">Appointment Confirmed! 🎉</div>
                          <p>
                            Slot reserved for tomorrow 5:00 PM. SMS confirmation sent to +91 98765 43210.
                          </p>
                          <div className="text-[10px] text-emerald-700 font-mono pt-1 mt-1 border-t border-emerald-200/50 flex items-center justify-between">
                            <span>Written to CRM Lead #4129</span>
                            <span>Wallet: -₹0.18</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimulator === "voice" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#faf5ea] text-amber-800 border border-amber-200 text-xs font-medium">
                        <PhoneCall className="size-3.5 text-amber-600" />
                        <span>Sarvam AI Hinglish • Sub-180ms Latency</span>
                      </div>
                      <h3 className="font-synthio-heading text-2xl font-bold text-neutral-950 tracking-tight">
                        Fluent Hinglish Voice Outreach &amp; Intake
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Powered by Sarvam AI and ElevenLabs, our telephony agents converse fluidly in native Indian languages and natural Hinglish with zero awkward robotic pauses.
                      </p>

                      {/* Interactive audio preview trigger */}
                      <button
                        type="button"
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Volume2 className="size-3.5 text-amber-300 animate-pulse" />
                            <span>Stop Voice Sample</span>
                          </>
                        ) : (
                          <>
                            <Play className="size-3.5 text-amber-300 fill-amber-300" />
                            <span>Simulate 180ms Voice Sample</span>
                          </>
                        )}
                      </button>

                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>Speech-to-Speech Engine:</span>
                          <span className="font-semibold text-neutral-900">Sarvam Saaras + Flash 2.5</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>Telephony Latency:</span>
                          <span className="font-semibold text-emerald-700">142ms First Token</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 pb-1 font-synthio-mono">
                          <span>Relationship Tracking:</span>
                          <span className="font-semibold text-neutral-900">First Contact → Booked Slot</span>
                        </div>
                      </div>
                    </div>

                    {/* Audio stream simulation display */}
                    <div className="lg:col-span-7 rounded-xl border border-[#e2e0d8] bg-white p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Radio className="size-4 text-rose-600 animate-pulse" />
                          <span className="text-xs font-semibold text-neutral-900">Live Call Session #8902</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Active Stream: 00:48
                        </span>
                      </div>

                      {/* Simulated Audio Waveform */}
                      <div className="bg-[#faf9f6] border border-[#e8e6de] rounded-lg p-4 flex items-center justify-center gap-1.5 h-20">
                        {[12, 28, 16, 32, 24, 40, 18, 22, 36, 14, 30, 26, 38, 15, 20, 34, 18, 28, 12, 24, 32, 16, 26].map(
                          (height, i) => (
                            <div
                              key={i}
                              className={`w-1.5 rounded-full transition-all duration-300 ${isPlayingAudio
                                  ? "bg-indigo-600 animate-pulse"
                                  : "bg-neutral-300"
                                }`}
                              style={{
                                height: isPlayingAudio
                                  ? `${Math.max(8, (height * 1.2) % 48)}px`
                                  : `${Math.max(6, height * 0.4)}px`,
                                animationDelay: `${i * 60}ms`,
                              }}
                            />
                          )
                        )}
                      </div>

                      <div className="bg-[#faf5ea] border border-amber-200/80 rounded-lg p-3 text-xs space-y-1">
                        <div className="text-[10px] uppercase font-mono text-amber-900 font-semibold flex items-center justify-between">
                          <span>Live Hinglish Transcript</span>
                          <span>Sentiment: High Purchase Intent</span>
                        </div>
                        <p className="text-neutral-800 italic">
                          &quot;Haan bilkul sir, humare team kal subah 11 baje demo schedule kar sakti hai. Kya aapka email confirm kar doon?&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSimulator === "wallet" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#eff6ff] text-blue-800 border border-blue-200 text-xs font-medium">
                        <CreditCard className="size-3.5 text-blue-600" />
                        <span>Prepaid INR Wallet • Razorpay Auto-Alerts</span>
                      </div>
                      <h3 className="font-synthio-heading text-2xl font-bold text-neutral-950 tracking-tight">
                        Granular INR Usage Metering &amp; Auto-Recharge
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Zero surprise monthly cloud bills. Every WhatsApp message, voice minute, and CRM webhook is metered to the exact paise. Real-time low-balance notifications ensure your automations never pause.
                      </p>
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>Voice Telephony Cost:</span>
                          <span className="font-semibold text-neutral-900">₹2.40 / minute</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 border-b border-neutral-200/70 pb-1.5 font-synthio-mono">
                          <span>WhatsApp Inbound + AI Token:</span>
                          <span className="font-semibold text-neutral-900">₹0.18 / exchange</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-600 pb-1 font-synthio-mono">
                          <span>Low Balance Threshold:</span>
                          <span className="font-semibold text-amber-700">Auto-Alert at ₹250</span>
                        </div>
                      </div>
                    </div>

                    {/* Wallet visualizer */}
                    <div className="lg:col-span-7 rounded-xl border border-[#e2e0d8] bg-white p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[11px] font-mono text-neutral-500 uppercase">Current Tenant Balance</div>
                          <div className="font-synthio-heading text-3xl font-black text-neutral-900 tracking-tight">
                            ₹4,820.50
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                          Active &amp; Funded
                        </span>
                      </div>

                      {/* Usage bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono text-neutral-600">
                          <span>Monthly Allocation Used</span>
                          <span>38% (₹2,179.50)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full w-[38%]" />
                        </div>
                      </div>

                      {/* Recent transactions log */}
                      <div className="border-t border-neutral-100 pt-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-neutral-700">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span>Voice Call #4928 (3m 12s)</span>
                          </div>
                          <span className="font-mono text-neutral-900 font-semibold">-₹7.68</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-700">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>WhatsApp Lead Intake (4 msgs)</span>
                          </div>
                          <span className="font-mono text-neutral-900 font-semibold">-₹0.72</span>
                        </div>
                        <div className="flex items-center justify-between text-neutral-700">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-600" />
                            <span>Razorpay Wallet Top-up</span>
                          </div>
                          <span className="font-mono text-emerald-700 font-semibold">+₹5,000.00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-[#e2e0d8] bg-white shadow-2xs">
              <div className="font-synthio-mono text-xs text-neutral-500 uppercase tracking-wider">
                Voice Latency
              </div>
              <div className="font-synthio-heading text-3xl font-black text-neutral-950 mt-1">
                &lt;180 ms
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                Sarvam &amp; ElevenLabs neural pipeline
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#e2e0d8] bg-white shadow-2xs">
              <div className="font-synthio-mono text-xs text-neutral-500 uppercase tracking-wider">
                Inbound Resolution
              </div>
              <div className="font-synthio-heading text-3xl font-black text-emerald-700 mt-1">
                99.4%
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                Zero missed leads or dropped sessions
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#e2e0d8] bg-white shadow-2xs">
              <div className="font-synthio-mono text-xs text-neutral-500 uppercase tracking-wider">
                Self-Serve Setup
              </div>
              <div className="font-synthio-heading text-3xl font-black text-neutral-950 mt-1">
                3 Mins
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                Instant deterministic bot recommendation
              </div>
            </div>

            <div className="p-5 rounded-xl border border-[#e2e0d8] bg-white shadow-2xs">
              <div className="font-synthio-mono text-xs text-neutral-500 uppercase tracking-wider">
                Pricing Model
              </div>
              <div className="font-synthio-heading text-3xl font-black text-blue-700 mt-1">
                Prepaid INR
              </div>
              <div className="text-xs text-neutral-600 mt-1">
                Pay per call &amp; message, no fixed lock-in
              </div>
            </div>
          </div>

          {/* Feature Bento Grid (All 6 core capabilities) */}
          <div id="features" className="mt-24 sm:mt-32">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <div className="inline-flex items-center gap-1.5 text-xs font-synthio-mono uppercase tracking-widest text-neutral-600 bg-neutral-200/60 px-3 py-1 rounded-md">
                <Sliders className="size-3 text-neutral-600" />
                Comprehensive Platform Suite
              </div>
              <h2 className="font-synthio-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                Engineered for High-Conversion Multi-Tenant Autopilot
              </h2>
              <p className="text-sm sm:text-base text-neutral-600">
                Everything required to transform raw inbound interest into qualified CRM records and paid bookings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. WhatsApp AI Qualifier */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#edf5f0] text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Bot className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-emerald-800 bg-[#edf5f0] px-2 py-0.5 rounded border border-emerald-200">
                    META CLOUD API
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    WhatsApp AI Qualifier
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Greets inbound leads in under 3 seconds, qualifies budget and intent via Meta Cloud API, and writes directly into your central CRM table.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-emerald-700 font-medium gap-1">
                  <span>Zero human delay</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>

              {/* 2. Voice AI Outreach */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#faf5ea] text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PhoneCall className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-amber-800 bg-[#faf5ea] px-2 py-0.5 rounded border border-amber-200">
                    SARVAM + ELEVENLABS
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    Voice AI Outreach
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Sarvam AI-powered cold &amp; warm calling agent speaking fluent Hinglish. Automatically tracks relationship stages from first contact to booked slot.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-amber-800 font-medium gap-1">
                  <span>Sub-180ms conversational voice</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>

              {/* 3. Credit-Wallet & Low Balance */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#eff6ff] text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <CreditCard className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-blue-800 bg-[#eff6ff] px-2 py-0.5 rounded border border-blue-200">
                    RAZORPAY INTEGRATION
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    Credit-Wallet &amp; Low Balance
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Automated INR usage metering per conversation and call minute. Low-balance alerts notify businesses before automations can pause.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-blue-700 font-medium gap-1">
                  <span>Granular paise-level billing</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>

              {/* 4. 1-Week Starter Website */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#f5f3ff] text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Globe className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-indigo-800 bg-[#f5f3ff] px-2 py-0.5 rounded border border-indigo-200">
                    HOSTED FUNNELS
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    1-Week Starter Website
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    No website? Our onboarding captures a tailored brief for a 1-week launch while instantly providing a hosted booking landing page.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-indigo-700 font-medium gap-1">
                  <span>Instant appointment landing pages</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>

              {/* 5. Cost-Per-Lead (CPL) Analytics */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#fdf2f8] text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BarChart3 className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-rose-800 bg-[#fdf2f8] px-2 py-0.5 rounded border border-rose-200">
                    REAL-TIME ROI
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    Cost-Per-Lead (CPL)
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Instrumented CPL and ROI analytics show exactly how many ₹ in credits each automation consumed vs how many qualified leads it delivered.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-rose-700 font-medium gap-1">
                  <span>True profitability visibility</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>

              {/* 6. Agency Super-Admin */}
              <div className="p-6 rounded-2xl border border-[#e2e0d8] bg-white shadow-2xs hover:shadow-sm transition-all space-y-4 group">
                <div className="flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-[#f0fdf4] text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShieldCheck className="size-5" />
                  </div>
                  <span className="font-synthio-mono text-[10px] text-emerald-800 bg-[#f0fdf4] px-2 py-0.5 rounded border border-emerald-200">
                    FLEET RBAC
                  </span>
                </div>
                <div>
                  <h3 className="font-synthio-heading text-lg font-bold text-neutral-950">
                    Agency Super-Admin
                  </h3>
                  <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                    Command center for our agency to oversee client fleets, track global ARR/MRR, manage the n8n template catalog, and support businesses.
                  </p>
                </div>
                <div className="pt-2 border-t border-neutral-100 flex items-center text-xs text-emerald-700 font-medium gap-1">
                  <span>Centralized tenant operations</span>
                  <ChevronRight className="size-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Overview Section */}
          <div id="architecture" className="mt-24 sm:mt-32 p-8 sm:p-12 rounded-3xl border border-[#e2e0d8] bg-[#f5f4ee] relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#dedcd4] font-synthio-mono text-xs text-neutral-700">
                <Terminal className="size-3.5 text-neutral-600" />
                DETERMINISTIC STACK SPECIFICATION
              </div>
              <h2 className="font-synthio-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-950">
                Multi-Tenant Architecture Built for Scalable Autonomy
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                Atom isolates each organization through tenant-scoped Prisma schemas, RBAC middleware, and dedicated webhook dispatchers. Designed to operate 24/7 without manual intervention.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#dedcd4] space-y-2">
                <div className="font-synthio-heading font-bold text-sm text-neutral-900">
                  Prisma Tenant Scoping
                </div>
                <p className="text-xs text-neutral-600">
                  Strict organizationId filtering on every query guarantees client data separation across leads and billing records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#dedcd4] space-y-2">
                <div className="font-synthio-heading font-bold text-sm text-neutral-900">
                  n8n &amp; Webhook Catalog
                </div>
                <p className="text-xs text-neutral-600">
                  Pre-baked automation workflows trigger instantly upon customer qualification with automated fallback retries.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#dedcd4] space-y-2">
                <div className="font-synthio-heading font-bold text-sm text-neutral-900">
                  Live CSS Theming
                </div>
                <p className="text-xs text-neutral-600">
                  Every business tenant can brand their booking portal with custom colors, logos, and custom domain routing.
                </p>
              </div>
            </div>
          </div>

          {/* Final Call to Action Strip */}
          <div className="mt-20 text-center py-16 px-6 rounded-3xl border border-[#e2e0d8] bg-white shadow-xs space-y-6">
            <div className="flex justify-center">
              <AtomWordmark size="lg" showBadge badgeText="Get Started" />
            </div>
            <h2 className="font-synthio-heading text-3xl sm:text-4xl font-black tracking-tight text-neutral-950 max-w-xl mx-auto">
              Ready to Turn Inbound Leads Into Customers Automatically?
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto">
              Set up your account in under 3 minutes. Zero credit card needed to explore the deterministic automation catalog.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-neutral-950 text-white font-medium text-sm hover:bg-neutral-800 transition-all shadow-md active:scale-95 group"
              >
                <span>Sign Up for Free</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-[#f8f7f3] border border-[#d8d6ce] text-neutral-800 font-medium text-sm hover:bg-neutral-100 transition-all"
              >
                <span>Sign In to Dashboard →</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Synthio-styled Footer */}
      <footer className="border-t border-[#e2e0d8] bg-[#f4f3ee] py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1140px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-neutral-600">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <AtomWordmark size="sm" showBadge badgeText="SaaS" href="/" />
            <span className="hidden sm:inline text-neutral-400">|</span>
            <span className="font-synthio-mono text-[11px] text-neutral-500">
              Multi-Tenant Self-Serve SaaS • Next.js, shadcn/ui &amp; Prisma
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/docs" className="hover:text-neutral-950 transition-colors">
              Documentation
            </Link>
            <Link href="/login" className="hover:text-neutral-950 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-neutral-950 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="max-w-[1140px] mx-auto mt-6 pt-6 border-t border-[#e8e6de] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500 font-synthio-mono">
          <div>
            Atom Automation Platform © 2026. Designed with Precision, Engineered for Scale.
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            <span>All Systems Operational • 99.98% Telephony Uptime</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
