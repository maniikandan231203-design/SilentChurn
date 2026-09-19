"use client";

import React from "react";
import { CustomerTable } from "@/components/customers/CustomerTable";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Customer Management
        </h1>
      </div>

      {/* Main Filterable Table */}
      <CustomerTable />
    </div>
  );
}
