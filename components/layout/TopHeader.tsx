"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { QrCode, LogOut } from "lucide-react";

export function TopHeader() {
  const { config, addToast } = useApp();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    addToast({
      title: "Signed Out",
      description: "You have successfully logged out.",
      type: "info",
    });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 shadow-sm">
      {/* Left Area */}
      <div className="flex items-center gap-4 ml-12 lg:ml-0" />

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Counter Kiosk Link */}
        <Link
          href={`/checkin/${config.businessSlug || "lumina-luxe"}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500/40 text-xs text-slate-700 hover:text-emerald-700 transition-colors shadow-sm font-semibold"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          <span>Counter Kiosk</span>
        </Link>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 py-1.5 px-2 rounded-2xl hover:bg-slate-100/80 transition-colors focus:outline-none"
          >
            {/* Light Cyan Avatar Circle with initial 'A' */}
            <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-800 font-bold text-xs shadow-2xs">
              A
            </div>
            <span className="text-sm font-bold text-slate-800 hidden sm:inline">
              admin
            </span>
          </button>

          {/* Logout Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3.5 space-y-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Details */}
              <div className="space-y-0.5 px-1 pt-0.5">
                <div className="font-extrabold text-sm text-slate-900 tracking-tight">
                  admin
                </div>
                <div className="text-xs text-slate-400 font-medium truncate">
                  admin@example.com
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Red Log out Action */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-sm font-bold transition-colors text-left group"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
