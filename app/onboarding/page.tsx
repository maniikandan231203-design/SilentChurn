"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { INDUSTRY_PRESETS } from "@/lib/mock-data";
import {
  Scissors,
  Sparkles,
  Coffee,
  Utensils,
  Dumbbell,
  Flame,
  HeartPulse,
  GlassWater,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Store,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const { config, updateConfig, setIndustry } = useApp();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [selectedIndustryId, setSelectedIndustryId] = useState(config.industryId || "salon");
  const [overduePercent, setOverduePercent] = useState(config.overdueTriggerPercent || 40);
  const [stage2Days, setStage2Days] = useState(config.stage2DelayDays || 7);
  const [cooldownDays, setCooldownDays] = useState(config.churnCooldownDays || 90);

  const [businessName, setBusinessName] = useState(config.businessName);
  const [businessSlug, setBusinessSlug] = useState(config.businessSlug);
  const [currency, setCurrency] = useState(config.currency || "GBP");
  const [whatsappNumber, setWhatsappNumber] = useState(config.whatsappReplyNumber || "+44 7700 900450");
  const [defaultOffer, setDefaultOffer] = useState(config.defaultOffer || "15% off your next booking");

  const selectedIndustry = INDUSTRY_PRESETS.find((i) => i.id === selectedIndustryId) || INDUSTRY_PRESETS[0];

  const getIndustryIcon = (id: string) => {
    switch (id) {
      case "salon":
        return <Scissors className="w-5 h-5" />;
      case "barbershop":
        return <Sparkles className="w-5 h-5" />;
      case "cafe":
        return <Coffee className="w-5 h-5" />;
      case "restaurant":
        return <Utensils className="w-5 h-5" />;
      case "gym":
        return <Dumbbell className="w-5 h-5" />;
      case "spa":
        return <Flame className="w-5 h-5" />;
      case "clinic":
        return <HeartPulse className="w-5 h-5" />;
      case "shisha":
        return <GlassWater className="w-5 h-5" />;
      case "hotel":
        return <Building2 className="w-5 h-5" />;
      default:
        return <Store className="w-5 h-5" />;
    }
  };

  const handleFinish = () => {
    setIndustry(selectedIndustryId);
    updateConfig({
      businessName,
      businessSlug,
      currency,
      whatsappReplyNumber: whatsappNumber,
      overdueTriggerPercent: overduePercent,
      stage2DelayDays: stage2Days,
      churnCooldownDays: cooldownDays,
      defaultOffer,
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 bg-grid-pattern text-slate-900 flex flex-col justify-between p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 p-0.5 shadow-md">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">
            Silent<span className="text-emerald-600">Churn</span>
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
                currentStep === step
                  ? "bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-xs"
                  : currentStep > step
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              <span>{step}</span>
              <span className="hidden sm:inline">
                {step === 1 ? "Industry" : step === 2 ? "Thresholds" : "Brand Profile"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {/* STEP 1: Multi-Industry Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  Step 1 of 3: Industry & Cycle Presets
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  What type of service business do you operate?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  SilentChurn automatically configures typical visit frequencies and churn baseline intervals for your industry.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {INDUSTRY_PRESETS.map((ind) => {
                  const isSelected = ind.id === selectedIndustryId;
                  return (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => {
                        setSelectedIndustryId(ind.id);
                        setOverduePercent(ind.defaultOverduePercent);
                      }}
                      className={cn(
                        "p-4 rounded-3xl border text-left flex flex-col justify-between space-y-3 transition-all duration-200 group shadow-xs",
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400/40"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={cn(
                            "p-2.5 rounded-2xl border transition-colors",
                            isSelected
                              ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : "bg-slate-100 border-slate-200 text-slate-600 group-hover:text-slate-900"
                          )}
                        >
                          {getIndustryIcon(ind.id)}
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{ind.name}</h4>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 block mt-0.5">
                          {ind.frequencyRange}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2 font-medium">
                          {ind.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Churn Threshold Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  Step 2 of 3: Dynamic Churn Thresholds
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Configure win-back trigger rules for {selectedIndustry.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  Adjust overdue thresholds to control exactly when automated WhatsApp reminders fire.
                </p>
              </div>

              {/* Threshold Interactive Sliders */}
              <div className="space-y-5">
                {/* At-Risk Overdue % Trigger */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">Stage 1 Overdue Trigger Percentage</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Triggered when customer is +{overduePercent}% past their regular {selectedIndustry.defaultFrequencyDays}-day interval (Day {Math.round(selectedIndustry.defaultFrequencyDays * (1 + overduePercent / 100))}).
                      </p>
                    </div>
                    <span className="text-lg font-extrabold font-mono text-emerald-800 bg-white px-3 py-1 rounded-2xl border border-emerald-200 shadow-2xs">
                      +{overduePercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={overduePercent}
                    onChange={(e) => setOverduePercent(Number(e.target.value))}
                    className="w-full accent-emerald-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold">
                    <span>Aggressive (+20%)</span>
                    <span>Standard (+40%)</span>
                    <span>Relaxed (+100%)</span>
                  </div>
                </div>

                {/* Stage 2 Delay Days */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">Stage 2 Offer Follow-Up Delay</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Days to wait after Stage 1 message before sending promotional incentive.
                      </p>
                    </div>
                    <span className="text-lg font-extrabold font-mono text-purple-800 bg-white px-3 py-1 rounded-2xl border border-purple-200 shadow-2xs">
                      {stage2Days} Days
                    </span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="21"
                    step="1"
                    value={stage2Days}
                    onChange={(e) => setStage2Days(Number(e.target.value))}
                    className="w-full accent-purple-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 90-Day Churn Cooldown */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900">Churn Suppression Cooldown</span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Stop messaging customer if unrecovered after this period to avoid spam.
                      </p>
                    </div>
                    <span className="text-lg font-extrabold font-mono text-rose-800 bg-white px-3 py-1 rounded-2xl border border-rose-200 shadow-2xs">
                      {cooldownDays} Days
                    </span>
                  </div>

                  <input
                    type="range"
                    min="45"
                    max="180"
                    step="15"
                    value={cooldownDays}
                    onChange={(e) => setCooldownDays(Number(e.target.value))}
                    className="w-full accent-rose-600 bg-slate-200 h-2 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Brand & WhatsApp Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-2">
                  Step 3 of 3: Brand Personalization
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Personalize your business identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                  These details appear on your counter standee QR signs and WhatsApp message signatures.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Business Trading Name
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Counter QR URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 text-[11px] text-slate-500 rounded-l-2xl font-medium">
                        /checkin/
                      </span>
                      <input
                        type="text"
                        value={businessSlug}
                        onChange={(e) => setBusinessSlug(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-r-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      WhatsApp Reply Phone Number
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Billing Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="AED">AED (AED)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Stage 2 Incentive Offer Headline
                  </label>
                  <input
                    type="text"
                    value={defaultOffer}
                    onChange={(e) => setDefaultOffer(e.target.value)}
                    placeholder="e.g. 15% off your next booking"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch Retention Engine</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-500 py-2 font-medium">
        SilentChurn Automated Retention Platform • Configured for {selectedIndustry.name}
      </div>
    </div>
  );
}
