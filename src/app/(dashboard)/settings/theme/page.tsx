"use client";

import React, { useState } from "react";
import { useTheme, ThemeTokens } from "@/components/theme/theme-provider";
import { useSession } from "@/components/auth/session-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Palette,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Sun,
  Moon,
  ShieldCheck,
  Save,
} from "lucide-react";

export default function ThemeSettingsPage() {
  const { tokens, updateToken, setTokens, toggleMode } = useTheme();
  const { currentSession } = useSession();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Preset Brand Accents (HSL)
  const presets = [
    {
      name: "Electric Blue (Default)",
      primary: "217 91% 60%",
    },
    {
      name: "Emerald Luxury",
      primary: "142 71% 45%",
    },
    {
      name: "Royal Violet",
      primary: "263 70% 50%",
    },
    {
      name: "Cyber Amber / Gold",
      primary: "38 92% 50%",
    },
    {
      name: "Crimson Red",
      primary: "346 77% 49%",
    },
  ];

  const handleRadiusChange = (val: string) => {
    updateToken("radius", val);
  };

  const handleSaveToDatabase = async () => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/orgs/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: currentSession.orgId,
          themeTokens: tokens,
        }),
      });
      if (res.ok) {
        setSaveStatus("Saved to Database ✓");
        setTimeout(() => setSaveStatus(null), 2500);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save theme");
        setSaveStatus(null);
      }
    } catch (e: any) {
      alert(e.message);
      setSaveStatus(null);
    }
  };

  const handleResetDefaults = () => {
    setTokens({
      radius: "0.625rem",
      primary: "217 91% 60%",
      mode: tokens.mode || "dark",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">White-Label & Dynamic Theming Studio</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            BRD Section 5: Real-time CSS variable tokens for {currentSession.orgName}. Changes apply instantly without rebuild.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleResetDefaults} className="text-xs gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSaveToDatabase} className="text-xs gap-1.5 font-semibold">
            <Save className="h-3.5 w-3.5" />
            {saveStatus || "Save Brand Theme"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preset Palettes */}
          <Card className="bg-card/75 border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Brand Color Palettes</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Click any palette to live-update all buttons, badges, links, and accents across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {presets.map((p) => {
                  const isSelected = tokens.primary === p.primary;
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        updateToken("primary", p.primary);
                      }}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                          : "border-border/70 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-6 w-6 rounded-full shadow-inner border border-white/20"
                          style={{ backgroundColor: `hsl(${p.primary})` }}
                        />
                        <span className="text-xs font-semibold text-foreground">{p.name}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Border Radius Slider (--radius token) */}
          <Card className="bg-card/75 border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Corner Radius (--radius token)</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Control the curvature of cards, inputs, dialogs, and buttons live. Current: <code className="text-primary font-mono">{tokens.radius || "0.625rem"}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Sharp (0rem)", val: "0rem" },
                  { label: "Subtle (0.375rem)", val: "0.375rem" },
                  { label: "Rounded (0.625rem)", val: "0.625rem" },
                  { label: "Pill (1.25rem)", val: "1.25rem" },
                ].map((r) => (
                  <button
                    key={r.val}
                    onClick={() => handleRadiusChange(r.val)}
                    className={`py-2 px-3 text-xs font-semibold border transition-all ${
                      tokens.radius === r.val
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                    }`}
                    style={{ borderRadius: r.val }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mode Switcher */}
          <Card className="bg-card/75 border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Light / Dark Appearance</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Toggle between sleek dark mode and high-contrast light mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Button
                  variant={tokens.mode === "dark" ? "default" : "outline"}
                  onClick={() => updateToken("mode", "dark")}
                  className="gap-2 text-xs"
                >
                  <Moon className="h-4 w-4" /> Dark Mode
                </Button>
                <Button
                  variant={tokens.mode === "light" ? "default" : "outline"}
                  onClick={() => updateToken("mode", "light")}
                  className="gap-2 text-xs"
                >
                  <Sun className="h-4 w-4" /> Light Mode
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Real-Time Preview Sandbox */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live Component Sandbox
          </div>

          <Card className="bg-card border-border shadow-xl space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm">Preview Card</div>
              <Badge variant="default" className="text-[10px]">
                Primary Badge
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This card instantly inherits your active border radius, primary HSL, and background variables.
            </p>

            <Input placeholder="Theme input test..." className="text-xs" />

            <div className="flex gap-2">
              <Button size="sm" className="w-1/2 text-xs">
                Primary Button
              </Button>
              <Button size="sm" variant="outline" className="w-1/2 text-xs">
                Outline
              </Button>
            </div>
          </Card>

          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-2">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> White-Label Upsell Ready
            </div>
            <p>
              Per BRD Section 9.5: &quot;White-label theming is your best upsell. Offer full color/logo/radius customization as a paid tier for agencies/franchises reselling under their own brand.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
