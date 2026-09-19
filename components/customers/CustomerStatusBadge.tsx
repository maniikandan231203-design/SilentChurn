"use client";

import React from "react";
import { CustomerStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Send, Gift, Sparkles, Ban, XCircle } from "lucide-react";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({ status, className }: CustomerStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Active Regular
        </span>
      );

    case "at_risk":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300",
            className
          )}
        >
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          At Risk (+40% Overdue)
        </span>
      );

    case "stage_1_sent":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200",
            className
          )}
        >
          <Send className="w-3 h-3 text-blue-600" />
          Stage 1 Sent
        </span>
      );

    case "stage_2_sent":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200",
            className
          )}
        >
          <Gift className="w-3 h-3 text-purple-600" />
          Stage 2 Offer Sent
        </span>
      );

    case "recovered":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs",
            className
          )}
        >
          <Sparkles className="w-3 h-3 text-emerald-700" />
          Recovered ❇️
        </span>
      );

    case "churned":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200",
            className
          )}
        >
          <XCircle className="w-3 h-3 text-rose-600" />
          Churned (90d Cooldown)
        </span>
      );

    case "opted_out":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300",
            className
          )}
        >
          <Ban className="w-3 h-3 text-slate-400" />
          Opted Out (STOP)
        </span>
      );

    default:
      return null;
  }
}
