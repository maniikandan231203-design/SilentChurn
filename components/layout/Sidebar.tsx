"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard,
  Users,
  MessageSquareCode,
  QrCode,
  Sliders,
  ExternalLink,
  TrendingUp,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { config } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customer Management",
      href: "/customers",
      icon: Users,
    },
    {
      label: "Campaigns & AI Studio",
      href: "/campaigns",
      icon: MessageSquareCode,
    },
    {
      label: "QR & Integrations",
      href: "/settings/integrations",
      icon: QrCode,
    },
    {
      label: "Service Setup Wizard",
      href: "/onboarding",
      icon: Sliders,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-md backdrop-blur-md"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-white/95 border-r border-slate-200/90 flex flex-col transition-all duration-300 backdrop-blur-xl shadow-sm",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                Silent<span className="text-emerald-600">Churn</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Platform Engine
          </div>

          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-emerald-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Quick Counter Link */}
          <div className="pt-5 px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Till Standee Kiosk
          </div>

          <Link
            href={`/checkin/${config.businessSlug || "lumina-luxe"}`}
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 group transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Customer Self-Checkin</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700" />
          </Link>
        </div>

        {/* Footer Integration Status */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/70">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">WhatsApp Cloud API</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold font-mono px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200">
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Sender: <span className="text-slate-800 font-mono font-medium">{config.whatsappReplyNumber}</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
