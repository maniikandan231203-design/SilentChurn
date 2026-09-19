"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Zap, Sparkles, Check, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickVisitModal({ isOpen, onClose }: QuickVisitModalProps) {
  const { quickLogVisit, currentIndustry, config } = useApp();
  const [commandText, setCommandText] = useState("");
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string; customerName?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;

    const res = quickLogVisit(commandText);
    setLastResult({
      success: res.success,
      message: res.message,
      customerName: res.customer?.name,
    });

    if (res.success) {
      setCommandText("");
      setTimeout(() => {
        setLastResult(null);
        onClose();
      }, 1400);
    }
  };

  const handlePresetSample = (sample: string) => {
    setCommandText(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Fast Staff Visit Logger
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Command Line
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Type <code className="text-emerald-700 font-mono font-semibold bg-emerald-50 px-1 rounded">done [name] [phone]</code> or plain details to instant-log.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Quick Command Input</span>
              <span className="text-slate-400 lowercase font-normal">press enter to execute</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
                placeholder="e.g. done Sarah Jenkins +447822411099"
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!commandText.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>Record</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Result Alert */}
          {lastResult && (
            <div
              className={cn(
                "p-3.5 rounded-2xl text-xs flex items-center gap-3 animate-in slide-in-from-bottom-2 border",
                lastResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              )}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              </div>
              <p className="font-semibold">{lastResult.message}</p>
            </div>
          )}

          {/* Presets / Sample Examples */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Click to test staff shortcut templates:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePresetSample("done Sarah Jenkins +447822411099")}
                className="text-left p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="text-xs text-slate-800 font-mono font-semibold group-hover:text-emerald-700">
                  done Sarah Jenkins +447822411099
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Recover at-risk customer ({config.currency} {currentIndustry.avgTicketPrice})
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSample("done Liam O'Connor +447955833211")}
                className="text-left p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="text-xs text-slate-800 font-mono font-semibold group-hover:text-emerald-700">
                  done Liam O'Connor +447955833211
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Recover Stage 2 offer lead
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSample("done Maya Lin +447700987654")}
                className="text-left p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="text-xs text-slate-800 font-mono font-semibold group-hover:text-emerald-700">
                  done Maya Lin +447700987654
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Auto-register new walk-in client
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSample("done +447911234890")}
                className="text-left p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
              >
                <div className="text-xs text-slate-800 font-mono font-semibold group-hover:text-emerald-700">
                  done +447911234890
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Phone-only quick checkout
                </div>
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Staff can send this exact syntax via WhatsApp bot or use this modal at the front desk. SilentChurn resets the churn timer, calculates recovered revenue, and triggers automated retention rules.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
