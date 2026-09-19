"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  Check,
} from "lucide-react";
import { createCustomer, recordVisit } from "@/app/actions/customers";

const COUNTRY_DIAL_CODES = [
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+1", country: "United States / Canada", flag: "🇺🇸" },
  { code: "+971", country: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
];

export default function PublicCheckinPage() {
  const { config, currentIndustry, addCheckinCustomer } = useApp();

  const [name, setName] = useState("");
  const [phoneWithoutCode, setPhoneWithoutCode] = useState("");
  const [countryCode, setCountryCode] = useState("+44");
  const [selectedService, setSelectedService] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Trigger confetti upon success
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#6ee7b7", "#38bdf8", "#fbbf24"],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneWithoutCode.trim()) return;

    setIsSubmitting(true);

    const fullPhone = `${countryCode} ${phoneWithoutCode.trim()}`;
    
    try {
      // First try to create the customer in Supabase
      const customerResult = await createCustomer({
        name: name.trim(),
        phone: fullPhone,
      });
      
      // If customer was created or already existed (we could handle that too, but at least we try to store)
      // If we had the customer ID, we could also record a visit, but for now we'll just ensure they are in DB.
      if (customerResult.success && customerResult.customer) {
        await recordVisit({
          customerId: customerResult.customer.id,
          spendAmount: 0, // Or some default
          loggedBy: "qr_self",
          serviceName: selectedService || "Counter Check-in"
        });
      }
    } catch (error) {
      console.error("Error storing customer in database:", error);
    }

    // Update local state (for UI/demo purposes)
    addCheckinCustomer({
      name: name.trim(),
      phone: fullPhone,
      service: selectedService || currentIndustry.name.split(" ")[0] + " Care",
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    triggerCelebration();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-900">
      <div className="w-full max-w-md mb-6">
        <h1 className="text-[26px] font-extrabold text-center text-slate-900 tracking-tight">
          Check in to SilentChurn
        </h1>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Phone Input with International Dial Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-2 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white"
                >
                  {COUNTRY_DIAL_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>

                <input
                  type="tel"
                  required
                  value={phoneWithoutCode}
                  onChange={(e) => setPhoneWithoutCode(e.target.value)}
                  placeholder="7822 411099"
                  className="flex-1 w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Service Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-900">Service Name</label>
              <input
                type="text"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                placeholder="Standard Service"
                className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[15px] transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? "Checking in..." : "Check in"}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 mx-auto flex items-center justify-center text-emerald-500">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                You're Checked In, {name}! 🎉
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setName("");
                setPhoneWithoutCode("");
                setSelectedService("");
                setIsSuccess(false);
              }}
              className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors pt-4"
            >
              Check in another guest →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
