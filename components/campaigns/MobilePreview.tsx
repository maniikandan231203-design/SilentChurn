"use client";

import React from "react";
import { MessageTemplate } from "@/lib/mock-data";
import { useApp } from "@/context/AppContext";
import {
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  CheckCheck,
  Sparkles,
} from "lucide-react";

interface MobilePreviewProps {
  template: MessageTemplate;
  sampleCustomerName?: string;
  sampleDaysAbsent?: number;
  sampleOffer?: string;
}

export function MobilePreview({
  template,
  sampleCustomerName = "Sarah",
  sampleDaysAbsent = 48,
  sampleOffer = "15% off next booking",
}: MobilePreviewProps) {
  const { config, currentIndustry } = useApp();

  // Interpolate variables
  const formattedBody = template.body
    .replace(/{{name}}/g, sampleCustomerName)
    .replace(/{{business_name}}/g, config.businessName)
    .replace(/{{days_absent}}/g, String(sampleDaysAbsent))
    .replace(/{{service_type}}/g, currentIndustry.name.split(" ")[0] + " Service")
    .replace(/{{offer}}/g, sampleOffer);

  const formattedCTA = template.callToAction
    .replace(/{{offer}}/g, sampleOffer)
    .replace(/{{name}}/g, sampleCustomerName);

  return (
    <div className="relative mx-auto w-full max-w-[340px] rounded-[44px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-300 ring-1 ring-slate-400/30">
      {/* Smartphone Notch / Dynamic Island */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-6" />
      </div>

      {/* Screen Frame */}
      <div className="relative rounded-[34px] bg-[#efeae2] overflow-hidden flex flex-col h-[560px] border border-slate-300 shadow-inner">
        {/* WhatsApp Top Status Bar */}
        <div className="pt-7 px-4 pb-2.5 bg-[#008069] flex items-center justify-between text-white shadow-xs">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-white" />
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-emerald-800 text-xs shadow-xs">
              {config.businessName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {config.businessName}
                </span>
                <span className="w-3 h-3 rounded-full bg-white flex items-center justify-center text-[8px] text-emerald-700 font-bold">
                  ✓
                </span>
              </div>
              <span className="text-[10px] text-emerald-100 font-medium font-sans">Official Business</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-white">
            <Video className="w-4 h-4" />
            <Phone className="w-4 h-4" />
            <MoreVertical className="w-4 h-4" />
          </div>
        </div>

        {/* WhatsApp Chat Area */}
        <div className="flex-1 p-3.5 space-y-3 overflow-y-auto whatsapp-bg">
          {/* Security Notice Pill */}
          <div className="p-2 rounded-xl bg-[#ffeecd] border border-amber-200 text-[10px] text-amber-900 text-center leading-tight shadow-xs font-medium">
            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
          </div>

          {/* Timestamp Pill */}
          <div className="flex justify-center">
            <span className="px-2.5 py-0.5 rounded-md bg-white/90 shadow-2xs border border-slate-200/60 text-[10px] text-slate-600 font-bold">
              TODAY
            </span>
          </div>

          {/* Outgoing Message Bubble (from Business) */}
          <div className="max-w-[90%] ml-auto">
            <div className="p-3 rounded-2xl rounded-tr-none bg-[#d9fdd3] text-slate-900 shadow-sm space-y-1.5 border border-emerald-200 text-xs">
              {template.headline && (
                <p className="font-extrabold text-emerald-950 text-xs leading-snug">
                  {template.headline.replace(/{{name}}/g, sampleCustomerName).replace(/{{business_name}}/g, config.businessName)}
                </p>
              )}

              <p className="text-[11.5px] leading-relaxed text-slate-800 whitespace-pre-line font-medium">
                {formattedBody}
              </p>

              <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 pt-0.5">
                <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
              </div>
            </div>

            {/* Quick Action Button Pill */}
            {template.callToAction && (
              <div className="mt-1.5 p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-center transition-colors shadow-sm cursor-pointer">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {formattedCTA}
                </span>
              </div>
            )}
          </div>

          {/* Customer Sample Reply Simulation */}
          {template.type === "stage_2" && (
            <div className="max-w-[80%] mr-auto">
              <div className="p-2.5 rounded-2xl rounded-tl-none bg-white text-slate-900 shadow-sm text-xs border border-slate-200 font-medium">
                <p className="text-[11px]">Can I book this for Friday at 3pm please?</p>
                <div className="text-right text-[9px] text-slate-400 mt-1">10:44 AM</div>
              </div>
            </div>
          )}

          {template.type === "name_request" && (
            <div className="max-w-[80%] mr-auto">
              <div className="p-2.5 rounded-2xl rounded-tl-none bg-white text-slate-900 shadow-sm text-xs border border-slate-200 font-medium">
                <p className="text-[11px]">Hey, my name is Alex Vance!</p>
                <div className="text-right text-[9px] text-slate-400 mt-1">11:02 AM</div>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Bottom Input bar */}
        <div className="p-2 bg-[#f0f2f5] flex items-center gap-2 border-t border-slate-200">
          <div className="flex-1 px-3 py-1.5 rounded-full bg-white text-[11px] text-slate-500 border border-slate-200 shadow-2xs font-medium">
            Reply to message...
          </div>
          <div className="w-7 h-7 rounded-full bg-[#008069] flex items-center justify-center text-white text-xs shadow-xs">
            ➤
          </div>
        </div>
      </div>
    </div>
  );
}
