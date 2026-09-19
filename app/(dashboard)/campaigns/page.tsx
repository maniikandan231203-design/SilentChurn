"use client";

import React from "react";
import { TemplateEditor } from "@/components/campaigns/TemplateEditor";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Campaigns & AI Messaging Studio
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              WhatsApp Cloud
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Customize automated WhatsApp copy, insert dynamic customer variables, and test live on mobile preview.
          </p>
        </div>
      </div>

      {/* Main Studio Editor */}
      <TemplateEditor />
    </div>
  );
}
