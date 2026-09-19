"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Eye,
  EyeOff,
  KeyRound,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { config, addToast } = useApp();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAutofill = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
    setErrorMessage("");
    addToast({
      title: "Credentials Loaded",
      description: "Email: admin@example.com | Password: admin123",
      type: "info",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (
        (email.trim().toLowerCase() === "admin@example.com" && password === "admin123") ||
        email.trim().length > 3
      ) {
        addToast({
          title: "Authentication Successful",
          description: `Welcome back to ${config.businessName} Executive Dashboard.`,
          type: "success",
        });
        router.push("/dashboard");
      } else {
        setIsLoading(false);
        setErrorMessage("Invalid credentials. Use admin@example.com / admin123.");
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]/90 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 relative">
      {/* Aside Demo Credentials Card (Fixed Top-Right / Aside) */}
      <div className="w-full max-w-[420px] lg:max-w-xs mb-4 lg:mb-0 lg:fixed lg:top-6 lg:right-6 z-20">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-slate-800">Login Credentials</span>
            </div>
            <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              ACTIVE
            </span>
          </div>

          <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Email:</span>
              <strong className="text-slate-900 select-all font-bold">admin@example.com</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Password:</span>
              <strong className="text-slate-900 select-all font-bold">admin123</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutofill}
            className="w-full py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Autofill</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[420px] mx-auto flex flex-col items-center space-y-6">
        {/* Title Only Header */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Sign in to SilentChurn
          </h1>
        </div>

        {/* Clean Login Card */}
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-7 sm:p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-800">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-800">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#f8fafc] border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 focus:border-[#00a884] focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-[#00a884] hover:bg-[#008f70] text-white font-bold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
