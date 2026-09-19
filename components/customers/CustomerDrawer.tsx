"use client";

import React, { useState } from "react";
import { Customer } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Phone,
  Calendar,
  Send,
  Gift,
  History,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDrawer({ customer, onClose }: CustomerDrawerProps) {
  const {
    config,
    triggerManualStage1,
    triggerManualStage2,
    markRecovered,
    sendManualWhatsAppMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"chat" | "history" | "diagnostics">("chat");
  const [replyMessage, setReplyMessage] = useState("");

  if (!customer) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    sendManualWhatsAppMessage(customer.id, replyMessage);
    setReplyMessage("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/90">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-lg font-bold text-slate-800 shadow-xs">
                  {customer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{customer.name}</h2>
                    <span className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded font-bold">
                      {customer.countryCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-medium">{customer.phone}</span>
                    <span>•</span>
                    <span className="text-slate-700 font-bold">{customer.serviceType}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Risk Banner */}
            <div className="mt-5 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Current Status:</span>
                <CustomerStatusBadge status={customer.status} />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Churn Risk Score
                </span>
                <span
                  className={cn(
                    "text-xs font-bold font-mono",
                    customer.churnRiskScore > 50
                      ? "text-rose-600"
                      : customer.churnRiskScore > 20
                      ? "text-amber-600"
                      : "text-emerald-700"
                  )}
                >
                  {customer.churnRiskScore}% Risk
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerManualStage1(customer.id)}
                className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Stage 1</span>
              </button>

              <button
                onClick={() => triggerManualStage2(customer.id)}
                className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Send Offer</span>
              </button>

              <button
                onClick={() => markRecovered(customer.id)}
                className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mark Recovered</span>
              </button>
            </div>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-4 gap-2 px-6 py-4 bg-slate-50/60 border-b border-slate-200 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Visits</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{customer.totalVisits}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Spend</span>
              <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
                {formatCurrency(customer.totalSpend, config.currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Avg Frequency</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{customer.averageFrequencyDays}d</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Days Absent</span>
              <p
                className={cn(
                  "text-sm font-extrabold mt-0.5 font-mono",
                  customer.daysSinceLastVisit > 30 ? "text-amber-700" : "text-slate-700"
                )}
              >
                {customer.daysSinceLastVisit}d
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
                activeTab === "chat"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Live Log ({customer.messages.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
                activeTab === "history"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>Visit Timeline ({customer.history.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={cn(
                "py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
                activeTab === "diagnostics"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Risk & Notes</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeTab === "chat" && (
              <div className="flex flex-col h-full space-y-4">
                {/* Chat Container */}
                <div className="flex-1 space-y-3.5 pr-1 overflow-y-auto max-h-[380px] p-3 rounded-2xl whatsapp-bg border border-slate-200">
                  {customer.messages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No WhatsApp messages sent yet. Use the action buttons above to trigger automated win-back.
                    </div>
                  ) : (
                    customer.messages.map((msg) => {
                      const isBusiness = msg.sender === "business";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[85%]",
                            isBusiness ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "p-3 rounded-2xl text-xs leading-relaxed shadow-xs",
                              isBusiness
                                ? "bg-[#d9fdd3] text-slate-900 border border-emerald-200 rounded-tr-none"
                                : "bg-white text-slate-900 border border-slate-200 rounded-tl-none"
                            )}
                          >
                            <p className="whitespace-pre-line font-medium">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1.5">
                              <span>{msg.timestamp}</span>
                              {isBusiness && (
                                <CheckCheck className="w-3 h-3 text-emerald-600 inline ml-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Direct Message Input */}
                <form onSubmit={handleSendReply} className="pt-2 border-t border-slate-200 flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Send WhatsApp concierge text to ${customer.name}...`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={!replyMessage.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                {customer.history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900">{record.service}</span>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{record.date}</span>
                          <span>•</span>
                          <span className="text-slate-400 font-medium">{record.loggedBy}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-mono font-extrabold text-xs text-emerald-700">
                      {formatCurrency(record.amount, config.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "diagnostics" && (
              <div className="space-y-4 text-xs text-slate-700">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Retention Interval Analysis</span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    Customer has an average visit interval of <strong>{customer.averageFrequencyDays} days</strong>.
                    The automated churn trigger threshold is set to +{config.overdueTriggerPercent}% overdue (
                    {Math.round(customer.averageFrequencyDays * (1 + config.overdueTriggerPercent / 100))} days).
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">Staff Notes & Preferences</h4>
                  <p className="text-slate-600 leading-relaxed italic">
                    {customer.notes || "No specific customer notes provided."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
