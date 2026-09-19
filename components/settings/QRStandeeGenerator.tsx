"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  QrCode,
  Printer,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  MessageSquare,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function QRStandeeGenerator() {
  const { config, updateConfig, addToast } = useApp();
  const [qrType, setQrType] = useState<"form" | "whatsapp_direct">("form");
  const [standeeTheme, setStandeeTheme] = useState<"emerald" | "light_clean" | "luxury">("emerald");
  const [copied, setCopied] = useState(false);

  const checkinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/checkin/${config.businessSlug || "lumina-luxe"}`
    : `https://silentchurn.app/checkin/${config.businessSlug || "lumina-luxe"}`;

  const whatsappDirectUrl = `https://wa.me/${config.whatsappReplyNumber.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(config.businessName)}%2C%20I'd%20like%20to%20register%20my%20loyalty%20profile!`;

  const targetUrl = qrType === "form" ? checkinUrl : whatsappDirectUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    addToast({
      title: "Link Copied!",
      description: "Counter URL copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate SVG QR Code Grid Pattern for high fidelity display
  const renderSVGQRCode = () => {
    return (
      <svg
        viewBox="0 0 200 200"
        className="w-44 h-44 sm:w-52 sm:h-52 bg-white p-3 rounded-2xl shadow-md border border-slate-200"
      >
        {/* Finder pattern top-left */}
        <rect x="15" y="15" width="50" height="50" fill="#0f172a" rx="8" />
        <rect x="25" y="25" width="30" height="30" fill="white" rx="4" />
        <rect x="33" y="33" width="14" height="14" fill="#059669" rx="3" />

        {/* Finder pattern top-right */}
        <rect x="135" y="15" width="50" height="50" fill="#0f172a" rx="8" />
        <rect x="145" y="25" width="30" height="30" fill="white" rx="4" />
        <rect x="153" y="33" width="14" height="14" fill="#059669" rx="3" />

        {/* Finder pattern bottom-left */}
        <rect x="15" y="135" width="50" height="50" fill="#0f172a" rx="8" />
        <rect x="25" y="145" width="30" height="30" fill="white" rx="4" />
        <rect x="33" y="153" width="14" height="14" fill="#059669" rx="3" />

        {/* Dense QR data dots */}
        <rect x="75" y="20" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="95" y="20" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="115" y="20" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="75" y="40" width="10" height="10" fill="#059669" rx="2" />
        <rect x="95" y="40" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="75" y="60" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="105" y="60" width="10" height="10" fill="#059669" rx="2" />

        <rect x="20" y="75" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="40" y="75" width="10" height="10" fill="#059669" rx="2" />
        <rect x="60" y="75" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="80" y="80" width="14" height="14" fill="#0f172a" rx="3" />
        <rect x="105" y="80" width="12" height="12" fill="#059669" rx="2" />
        <rect x="130" y="75" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="155" y="75" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="175" y="75" width="10" height="10" fill="#059669" rx="2" />

        <rect x="20" y="95" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="40" y="95" width="10" height="10" fill="#059669" rx="2" />
        <rect x="70" y="105" width="12" height="12" fill="#059669" rx="2" />
        <rect x="95" y="100" width="16" height="16" fill="#0f172a" rx="3" />
        <rect x="120" y="105" width="12" height="12" fill="#059669" rx="2" />
        <rect x="145" y="95" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="170" y="95" width="10" height="10" fill="#059669" rx="2" />

        <rect x="75" y="135" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="95" y="135" width="10" height="10" fill="#059669" rx="2" />
        <rect x="115" y="135" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="75" y="155" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="105" y="155" width="10" height="10" fill="#059669" rx="2" />
        <rect x="125" y="155" width="10" height="10" fill="#0f172a" rx="2" />
        <rect x="145" y="145" width="12" height="12" fill="#0f172a" rx="2" />
        <rect x="165" y="155" width="10" height="10" fill="#059669" rx="2" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Standee Setup Controls (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* QR Mode Switcher */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" />
              <span>Till Counter QR Standee Generator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Place this sign on your reception desk or coffee till counter for 5-second customer check-ins.
            </p>
          </div>

          {/* QR Destination Type */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setQrType("form")}
              className={cn(
                "p-4 rounded-2xl border text-left space-y-1 transition-all",
                qrType === "form"
                  ? "bg-emerald-50/70 border-emerald-400 text-slate-900 shadow-xs ring-1 ring-emerald-400/40"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Option A: Form QR</span>
                <Smartphone className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Redirects customer to clean web check-in form (`/checkin/[id]`)
              </p>
            </button>

            <button
              onClick={() => setQrType("whatsapp_direct")}
              className={cn(
                "p-4 rounded-2xl border text-left space-y-1 transition-all",
                qrType === "whatsapp_direct"
                  ? "bg-emerald-50/70 border-emerald-400 text-slate-900 shadow-xs ring-1 ring-emerald-400/40"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Option B: WhatsApp Direct</span>
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Instantly opens WhatsApp with pre-filled "Hi" to your number
              </p>
            </button>
          </div>

          {/* Callout Text on Standee */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Standee Callout Text
            </label>
            <input
              type="text"
              value={config.counterCalloutText}
              onChange={(e) => updateConfig({ counterCalloutText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Theme Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Standee Card Style</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStandeeTheme("emerald")}
                className={cn(
                  "p-2 rounded-xl border text-xs font-bold transition-all text-center",
                  standeeTheme === "emerald"
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "bg-white border-slate-200 text-slate-600"
                )}
              >
                Emerald Clean
              </button>
              <button
                onClick={() => setStandeeTheme("light_clean")}
                className={cn(
                  "p-2 rounded-xl border text-xs font-bold transition-all text-center",
                  standeeTheme === "light_clean"
                    ? "bg-slate-100 border-slate-400 text-slate-900"
                    : "bg-white border-slate-200 text-slate-600"
                )}
              >
                Minimal White
              </button>
              <button
                onClick={() => setStandeeTheme("luxury")}
                className={cn(
                  "p-2 rounded-xl border text-xs font-bold transition-all text-center",
                  standeeTheme === "luxury"
                    ? "bg-amber-50 border-amber-400 text-amber-900"
                    : "bg-white border-slate-200 text-slate-600"
                )}
              >
                Warm Gold
              </button>
            </div>
          </div>

          {/* Quick Copy Link & Print Action */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2.5">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print A5 / A6 Counter Standee</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy URL"}</span>
            </button>
          </div>
        </div>

        {/* Counter Hardware Placement Best Practices */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Counter Standee Best Practices
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Place printed acrylic standees directly next to the payment terminal or till counter. Customers scan the QR code in under 5 seconds to enroll into your VIP loyalty club.
          </p>
        </div>
      </div>

      {/* Right Column: High-Res Ready-to-Print Standee Preview (6 cols) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Counter Standee Live Preview</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">Standard A5 Display Card</span>
        </div>

        {/* Printable Standee Card */}
        <div
          id="printable-standee"
          className={cn(
            "relative mx-auto w-full max-w-sm rounded-3xl p-8 text-center shadow-xl transition-all border flex flex-col items-center justify-between space-y-6",
            standeeTheme === "emerald" &&
              "bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/60 border-emerald-300 text-slate-900",
            standeeTheme === "light_clean" &&
              "bg-white border-slate-300 text-slate-900",
            standeeTheme === "luxury" &&
              "bg-gradient-to-b from-white via-amber-50/60 to-amber-100/60 border-amber-300 text-slate-900"
          )}
        >
          {/* Logo / Badge */}
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-[11px] font-extrabold tracking-widest uppercase text-emerald-900 shadow-2xs">
              VIP Loyalty Check-In
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
              {config.businessName}
            </h2>
            <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed font-medium">
              {config.counterCalloutText}
            </p>
          </div>

          {/* High Res SVG QR Code Container */}
          <div className="p-3 bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col items-center">
            {renderSVGQRCode()}
            <span className="mt-2 text-[10px] font-bold font-mono tracking-wider text-slate-700 uppercase">
              {qrType === "form" ? "Scan to Open VIP Form" : "Scan to WhatsApp Direct"}
            </span>
          </div>

          {/* Bottom Instructions */}
          <div className="space-y-1.5 w-full pt-2 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Instant VIP Priority Booking & Perks</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              No app download required • Takes only 5 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
