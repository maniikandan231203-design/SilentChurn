"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import { REVENUE_CHART_DATA } from "@/lib/mock-data";
import { TrendingUp, Clock, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevenueChart() {
  const { config } = useApp();
  const [activeTab, setActiveTab] = useState<"recovered" | "velocity">("recovered");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRecovered = Math.max(...REVENUE_CHART_DATA.map((d) => d.recovered));
  const maxAtRisk = Math.max(...REVENUE_CHART_DATA.map((d) => d.atRiskIdentified));

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Revenue Recovery & Win-Back Velocity
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              AI Churn Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking lost revenue salvaged across Stage 1 & Stage 2 automated WhatsApp workflows.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("recovered")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "recovered"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recovered Value</span>
          </button>
          <button
            onClick={() => setActiveTab("velocity")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              activeTab === "velocity"
                ? "bg-white text-emerald-800 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Win-Back Speed</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Visualization */}
      <div className="relative pt-6 pb-2">
        {activeTab === "recovered" ? (
          <div className="space-y-4">
            {/* Bars */}
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 pt-6 px-2 border-b border-slate-200">
              {REVENUE_CHART_DATA.map((item, idx) => {
                const heightPercent = Math.round((item.recovered / maxRecovered) * 85);
                const atRiskHeightPercent = Math.round((item.atRiskIdentified / maxAtRisk) * 100);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-14 z-30 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                        <div className="font-bold text-emerald-400">
                          {formatCurrency(item.recovered, config.currency)} Recovered
                        </div>
                        <div className="text-[10px] text-slate-300">
                          From {formatCurrency(item.atRiskIdentified, config.currency)} at-risk
                        </div>
                      </div>
                    )}

                    {/* Bar Columns */}
                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full">
                      {/* At Risk Background Column */}
                      <div
                        style={{ height: `${atRiskHeightPercent}%` }}
                        className="w-1/2 rounded-t-md bg-slate-200 group-hover:bg-slate-300 transition-all"
                      />
                      {/* Recovered Foreground Column */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-1/2 rounded-t-md bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:from-emerald-500 group-hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all"
                      />
                    </div>

                    {/* Month Label */}
                    <span className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-800">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend & Stats Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span className="text-slate-700 font-semibold">Recovered Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                  <span className="text-slate-500 font-medium">Identified At-Risk Pool</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>+274% overall ROI vs. standard churn</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Win-back velocity visualization */}
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 pt-6 px-2 border-b border-slate-200">
              {REVENUE_CHART_DATA.map((item, idx) => {
                const isHovered = hoveredIndex === idx;
                const heightPercent = Math.round((item.velocityDays / 7) * 85);

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {isHovered && (
                      <div className="absolute -top-12 z-30 px-3 py-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white shadow-xl whitespace-nowrap pointer-events-none">
                        <span className="font-bold text-cyan-400">{item.velocityDays} days</span> average return
                      </div>
                    )}

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-cyan-600 to-teal-400 group-hover:from-cyan-500 transition-all shadow-md shadow-cyan-500/20"
                    />

                    <span className="mt-3 text-[11px] font-bold text-slate-500 group-hover:text-slate-800">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Average Return Velocity: <strong className="text-slate-900">3.2 days</strong> from WhatsApp trigger</span>
              </div>
              <span className="text-slate-500">Faster rebooking leads to 42% higher annual client LTV.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
