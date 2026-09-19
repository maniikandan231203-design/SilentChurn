"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatRelativeTime } from "@/lib/utils";
import {
  Activity,
  QrCode,
  Send,
  Zap,
  CheckCircle2,
  Gift,
} from "lucide-react";

export function LiveEventFeed() {
  const { events, config } = useApp();

  const getEventIcon = (type: string) => {
    switch (type) {
      case "recovered":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "checkin":
        return <QrCode className="w-4 h-4 text-cyan-600" />;
      case "stage_1_sent":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "stage_2_sent":
        return <Gift className="w-4 h-4 text-purple-600" />;
      case "quick_log":
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col h-full">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Real-Time Event Stream</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 font-semibold">Live Webhook Ticker</span>
      </div>

      {/* Events List */}
      <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[420px] pr-1">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                  {getEventIcon(evt.type)}
                </div>
                <div className="truncate">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {evt.customerName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    {evt.customerPhone}
                  </span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono font-medium flex-shrink-0">
                {formatRelativeTime(evt.timestamp)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <p className="text-slate-600 text-[11px] leading-tight line-clamp-1">{evt.detail}</p>
              {evt.amount && (
                <span className="font-mono font-bold text-emerald-700 ml-2">
                  +{config.currency} {evt.amount}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
