"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCards() {
  const { metrics, config, customers } = useApp();

  const atRiskCount = customers.filter((c) => c.status === "at_risk").length;
  const recoveredCount = customers.filter((c) => c.status === "recovered").length;

  const cards = [
    {
      title: "Total Customers",
      value: `${customers.length}`,
      icon: Users,
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      borderColor: "border-indigo-200/90",
      iconColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
      glow: "",
    },
    {
      title: "Customers At Risk",
      value: `${atRiskCount}`,
      icon: AlertTriangle,
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      borderColor: "border-amber-200/90",
      iconColor: "text-amber-700 bg-amber-50 border-amber-200",
      glow: atRiskCount > 0 ? "glow-amber" : "",
    },
    {
      title: "Recovered Customers",
      value: `${recoveredCount}`,
      icon: Sparkles,
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      borderColor: "border-purple-200/90",
      iconColor: "text-purple-700 bg-purple-50 border-purple-200",
      glow: "glow-purple",
    },
    {
      title: "Recovered Revenue",
      value: formatCurrency(metrics.recoveredRevenue, config.currency),
      icon: TrendingUp,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      borderColor: "border-emerald-200/90",
      iconColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      glow: "glow-emerald",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={cn(
              "relative p-6 rounded-3xl bg-white border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md group",
              card.borderColor,
              card.glow
            )}
          >
            {/* Background Gradient Accent */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity",
                card.gradient
              )}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">
                  {card.title}
                </span>
                <div className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
              </div>

              <div
                className={cn(
                  "p-3 rounded-2xl border flex items-center justify-center shadow-xs",
                  card.iconColor
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
