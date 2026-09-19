"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { MessageTemplate } from "@/lib/mock-data";
import { MobilePreview } from "./MobilePreview";
import {
  Tag,
  Play,
  Save,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplateEditor() {
  const { templates, updateTemplate, config, currentIndustry, addToast } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || "tpl_welcome");

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const [formData, setFormData] = useState<MessageTemplate>(currentTemplate);
  const [previewName, setPreviewName] = useState("Sarah");
  const [previewDays, setPreviewDays] = useState(45);
  const [previewOffer, setPreviewOffer] = useState(config.defaultOffer || "15% off your next session");

  // Sync form when template changes
  const handleSelectTemplate = (tpl: MessageTemplate) => {
    setSelectedTemplateId(tpl.id);
    setFormData(tpl);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTemplate(formData.id, formData);
  };

  const insertVariable = (variableTag: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + " " + variableTag,
    }));
  };

  const availableVariables = [
    { tag: "{{name}}", label: "Customer Name" },
    { tag: "{{business_name}}", label: "Business Name" },
    { tag: "{{days_absent}}", label: "Days Absent" },
    { tag: "{{service_type}}", label: "Past Service" },
    { tag: "{{offer}}", label: "Incentive Offer" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Template Selection & Editor (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Template Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {templates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className={cn(
                  "p-4 rounded-3xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2",
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-400 shadow-xs ring-1 ring-emerald-400/40"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-xs font-extrabold truncate",
                      isSelected ? "text-emerald-900" : "text-slate-900"
                    )}
                  >
                    {tpl.name}
                  </span>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      tpl.isActive ? "bg-emerald-500" : "bg-slate-300"
                    )}
                  />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                  {tpl.triggerDescription}
                </p>
              </button>
            );
          })}
        </div>

        {/* Editor Card */}
        <form
          onSubmit={handleSave}
          className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Message Template Editor</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                  {formData.type}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{formData.triggerDescription}</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 font-semibold cursor-pointer flex items-center gap-2">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 bg-white border-slate-300 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Headline Title
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. We miss you at Lumina Luxe! ✨"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Body Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                WhatsApp Message Body
              </label>
              <span className="text-[11px] text-slate-400 font-mono font-medium">
                {formData.body.length} characters
              </span>
            </div>

            <textarea
              rows={5}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-sans leading-relaxed font-medium"
            />

            {/* Variable Pills */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mb-1.5">
                <Tag className="w-3 h-3 text-emerald-600" />
                <span>Click to insert dynamic customer tags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableVariables.map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariable(v.tag)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-mono text-emerald-900 transition-all flex items-center gap-1 shadow-2xs font-semibold"
                  >
                    <span>+</span>
                    <span>{v.tag}</span>
                    <span className="text-[10px] text-slate-500">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              WhatsApp Action Button / Incentive Callout
            </label>
            <input
              type="text"
              value={formData.callToAction}
              onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
              placeholder="e.g. Book My Visit Now"
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                addToast({
                  title: "Test WhatsApp Dispatched",
                  description: `Simulated test push sent to staff test device.`,
                  type: "info",
                });
              }}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Send Test Preview</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Live Mobile Smartphone Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Smartphone Sandbox</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">LIVE PREVIEW</span>
          </div>

          {/* Preview Interpolation Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Test Customer Name</label>
              <input
                type="text"
                value={previewName}
                onChange={(e) => setPreviewName(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase font-bold">Days Absent</label>
              <input
                type="number"
                value={previewDays}
                onChange={(e) => setPreviewDays(Number(e.target.value))}
                className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Mobile Mockup */}
        <MobilePreview
          template={formData}
          sampleCustomerName={previewName}
          sampleDaysAbsent={previewDays}
          sampleOffer={previewOffer}
        />
      </div>
    </div>
  );
}
