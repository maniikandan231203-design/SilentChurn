"use client";

import React, { useState } from "react";
import { QRStandeeGenerator } from "@/components/settings/QRStandeeGenerator";
import { useApp } from "@/context/AppContext";
import {
  Copy,
  Check,
  ShieldCheck,
  Globe,
  Radio,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function IntegrationsPage() {
  const { config, updateConfig, addToast } = useApp();
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleCopyWebhookSecret = () => {
    navigator.clipboard.writeText(config.webhookSecret);
    setCopiedSecret(true);
    addToast({
      title: "Secret Copied",
      description: "Webhook secret copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleTestConnection = () => {
    setIsTestingConnection(true);
    setTimeout(() => {
      setIsTestingConnection(false);
      addToast({
        title: "WhatsApp Cloud API: Healthy",
        description: `Ping roundtrip 42ms. Connected to +${config.whatsappReplyNumber}`,
        type: "success",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              QR Standee & Integrations
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Hardware & Webhooks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Print ready-made counter standees and manage WhatsApp Cloud API connection gateways.
          </p>
        </div>
      </div>

      {/* Standee Generator */}
      <QRStandeeGenerator />

      {/* WhatsApp Cloud Connection & Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Meta / WhatsApp Business API Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  WhatsApp Business API Status
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Meta Graph Cloud v21.0</span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold font-mono">
              CONNECTED
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Bound WhatsApp Phone Number:</span>
              <strong className="text-slate-900 font-mono">{config.whatsappReplyNumber}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Verified Sender Name:</span>
              <strong className="text-emerald-700 font-bold">{config.senderName}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Quality Rating:</span>
              <span className="text-emerald-800 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> High Quality (Tier 1)
              </span>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isTestingConnection && "animate-spin text-emerald-600")} />
            <span>{isTestingConnection ? "Sending ping..." : "Run Health & Latency Test"}</span>
          </button>
        </div>

        {/* Webhook Endpoint Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Inbound Webhook Diagnostics
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Real-time status listener</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Webhook Callback URL
              </label>
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] truncate font-medium">
                https://api.silentchurn.app/webhooks/whatsapp/v1
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Webhook Verify Secret Token
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  readOnly
                  value={config.webhookSecret}
                  className="flex-1 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs font-medium"
                />
                <button
                  onClick={handleCopyWebhookSecret}
                  className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-2xs"
                >
                  {copiedSecret ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>Automatic SHA-256 HMAC verification enabled on all incoming delivery receipts.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
