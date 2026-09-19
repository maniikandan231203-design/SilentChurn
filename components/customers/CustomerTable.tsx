"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Customer } from "@/lib/mock-data";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { CustomerDrawer } from "./CustomerDrawer";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  Send,
  Gift,
  Sparkles,
  ChevronRight,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CustomerTable() {
  const { customers, config, triggerManualStage1, triggerManualStage2, markRecovered } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sortField, setSortField] = useState<"days" | "spend" | "visits">("days");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filterTabs = [
    { id: "all", label: "All Customers", count: customers.length },
    { id: "at_risk", label: "At Risk", count: customers.filter((c) => c.status === "at_risk").length, color: "text-amber-800" },
    { id: "stage_1_sent", label: "Stage 1 Sent", count: customers.filter((c) => c.status === "stage_1_sent").length, color: "text-blue-800" },
    { id: "stage_2_sent", label: "Stage 2 Sent", count: customers.filter((c) => c.status === "stage_2_sent").length, color: "text-purple-800" },
    { id: "recovered", label: "Recovered", icon: Sparkles, count: customers.filter((c) => c.status === "recovered").length, color: "text-emerald-800" },
    { id: "active", label: "Active", count: customers.filter((c) => c.status === "active").length },
    { id: "churned", label: "Churned (90d)", count: customers.filter((c) => c.status === "churned").length },
    { id: "opted_out", label: "Opted Out", count: customers.filter((c) => c.status === "opted_out").length },
  ];

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let fieldA = 0;
        let fieldB = 0;
        if (sortField === "days") {
          fieldA = a.daysSinceLastVisit;
          fieldB = b.daysSinceLastVisit;
        } else if (sortField === "spend") {
          fieldA = a.totalSpend;
          fieldB = b.totalSpend;
        } else if (sortField === "visits") {
          fieldA = a.totalVisits;
          fieldB = b.totalVisits;
        }
        return sortOrder === "desc" ? fieldB - fieldA : fieldA - fieldB;
      });
  }, [customers, searchQuery, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: "days" | "spend" | "visits") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, service..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort("days")}
            className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors shadow-xs font-semibold"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort: {sortField === "days" ? "Days Absent" : sortField === "spend" ? "Spend" : "Visits"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border",
                  tab.id === "recovered"
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-xs"
                    : isActive
                    ? "bg-slate-100 text-slate-900 border-slate-300 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <span>{tab.label}</span>
                {TabIcon && (
                  <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center p-0.5">
                    <TabIcon className="w-2.5 h-2.5 fill-white" />
                  </div>
                )}
                <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                  tab.id === "recovered"
                    ? "bg-emerald-200/80 text-emerald-900"
                    : isActive
                    ? "bg-slate-200 text-slate-900"
                    : "bg-slate-100 text-slate-600",
                  tab.color
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Customer Pipeline Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Customer & Phone</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Avg Cycle</th>
                <th className="py-3.5 px-4 cursor-pointer" onClick={() => toggleSort("days")}>
                  <div className="flex items-center gap-1 hover:text-slate-900">
                    <span>Days Absent</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Pipeline Status</th>
                <th className="py-3.5 px-4 text-right">Quick Win-Back Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isOverdue = cust.daysSinceLastVisit > cust.averageFrequencyDays * 1.3;

                  return (
                    <tr
                      key={cust.id}
                      onClick={() => setSelectedCustomer(cust)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Customer Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-800 group-hover:border-emerald-400 group-hover:bg-emerald-50 transition-colors shadow-2xs">
                            {cust.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                              {cust.name}
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 font-medium">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              <span>{cust.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="py-4 px-4">
                        <span className="text-slate-800 font-semibold">{cust.serviceType}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                          {cust.totalVisits} visits
                        </div>
                      </td>

                      {/* Avg Frequency */}
                      <td className="py-4 px-4 font-mono font-medium text-slate-700">
                        {cust.averageFrequencyDays} days
                      </td>

                      {/* Days Since Last Visit */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono font-extrabold text-sm",
                              cust.daysSinceLastVisit === 0
                                ? "text-emerald-700"
                                : isOverdue
                                ? "text-amber-800"
                                : "text-slate-800"
                            )}
                          >
                            {cust.daysSinceLastVisit === 0 ? "Today" : `${cust.daysSinceLastVisit}d`}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                          Last: {cust.lastVisitDate}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <CustomerStatusBadge status={cust.status} />
                      </td>

                      {/* Quick Actions */}
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {cust.status === "at_risk" && (
                            <button
                              onClick={() => triggerManualStage1(cust.id)}
                              title="Send Stage 1 Reminder"
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {cust.status === "stage_1_sent" && (
                            <button
                              onClick={() => triggerManualStage2(cust.id)}
                              title="Send Stage 2 Incentive Offer"
                              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors shadow-xs"
                            >
                              <Gift className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {cust.status !== "recovered" && cust.status !== "active" && (
                            <button
                              onClick={() => markRecovered(cust.id)}
                              title="Mark Recovered & Log Visit"
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-xs"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedCustomer(cust)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Drawer */}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
}
