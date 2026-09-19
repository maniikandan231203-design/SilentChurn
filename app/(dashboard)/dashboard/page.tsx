"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LiveEventFeed } from "@/components/dashboard/LiveEventFeed";
import { CustomerStatusBadge } from "@/components/customers/CustomerStatusBadge";
import { CustomerDrawer } from "@/components/customers/CustomerDrawer";
import { Customer } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  Sparkles,
  Send,
  Gift,
  ArrowRight,
  AlertTriangle,
  Users,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { customers, config, currentIndustry, triggerManualStage1, triggerManualStage2, refreshData, isLoading } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const atRiskCustomers = customers
    .filter((c) => c.status === "at_risk" || c.status === "stage_1_sent" || c.status === "stage_2_sent")
    .slice(0, 5);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {currentIndustry.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Live AI win-back monitoring for <strong className="text-slate-800">{config.businessName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync Live DB</span>
          </button>
          <Link
            href="/customers"
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>All Customers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <MetricCards />

      {/* Grid: Revenue Chart (7 cols) + Live Event Feed (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <RevenueChart />
        </div>
        <div className="lg:col-span-5">
          <LiveEventFeed />
        </div>
      </div>

      {/* Immediate Win-Back Queue */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                High-Priority Win-Back Queue
              </h3>
              <p className="text-xs text-slate-500">
                Customers overdue past their natural cycle who require WhatsApp outreach.
              </p>
            </div>
          </div>

          <Link
            href="/customers"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View all ({customers.filter(c => c.status === "at_risk" || c.status.startsWith("stage_")).length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {atRiskCustomers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            🎉 All customers are currently active or recovered! No immediate churn risks.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {atRiskCustomers.map((customer) => (
              <div
                key={customer.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/80 rounded-2xl px-3 -mx-3 transition-colors"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer min-w-0"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {customer.name}
                      </span>
                      <CustomerStatusBadge status={customer.status} />
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                      <span>{customer.phone}</span>
                      <span>•</span>
                      <span>{customer.serviceType}</span>
                      <span>•</span>
                      <span className="text-amber-700 font-semibold">{customer.daysSinceLastVisit}d absent</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {customer.status === "at_risk" && (
                    <button
                      onClick={() => triggerManualStage1(customer.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Stage 1</span>
                    </button>
                  )}

                  {customer.status === "stage_1_sent" && (
                    <button
                      onClick={() => triggerManualStage2(customer.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Send Stage 2 Offer</span>
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Drawer Details */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}

