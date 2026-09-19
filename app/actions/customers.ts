"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const DEFAULT_ORG_ID = "e1000000-0000-4000-8000-000000000001";

/**
 * Fetch all customers for an organization with their service configs and visit logs
 */
export async function getCustomers(organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase
    .from("customers")
    .select(`
      *,
      service_configurations:primary_service_id (*)
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers from Supabase:", error);
    return [];
  }

  return data || [];
}

/**
 * Create or register a new customer
 */
export async function createCustomer(data: {
  name: string;
  phone: string;
  serviceId?: string;
  organizationId?: string;
}) {
  const supabase = createAdminClient();
  const orgId = data.organizationId || DEFAULT_ORG_ID;

  let cleanPhone = data.phone.trim();
  if (!cleanPhone.startsWith("+")) cleanPhone = `+${cleanPhone}`;

  // Check if customer already exists
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("phone_number", cleanPhone)
    .eq("organization_id", orgId)
    .single();

  if (existingCustomer) {
    return { success: true, customer: existingCustomer };
  }

  const { data: customer, error } = await supabase
    .from("customers")
    .insert({
      organization_id: orgId,
      name: data.name.trim(),
      phone_number: cleanPhone,
      primary_service_id: data.serviceId || null,
      status: "active",
      opted_in: true,
      total_visits: 0,
      total_spend: 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true, customer };
}

/**
 * Record a visit for a customer
 */
export async function recordVisit(data: {
  customerId: string;
  spendAmount: number;
  serviceName?: string;
  loggedBy?: "qr_self" | "staff_whatsapp" | "manual_dashboard";
  organizationId?: string;
}) {
  const supabase = createAdminClient();
  const orgId = data.organizationId || DEFAULT_ORG_ID;

  const { data: visit, error } = await supabase
    .from("visits")
    .insert({
      organization_id: orgId,
      customer_id: data.customerId,
      visit_date: new Date().toISOString(),
      spend_amount: data.spendAmount,
      service_name: data.serviceName || null,
      logged_by: data.loggedBy || "manual_dashboard",
    })
    .select()
    .single();

  if (error) {
    console.error("Error recording visit:", error);
    return { success: false, error: error.message };
  }

  // Fetch updated customer metrics
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", data.customerId)
    .single();

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true, visit, customer };
}

/**
 * Trigger manual Stage 1 Win-Back message
 */
export async function triggerManualStage1(customerId: string, organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("customers")
    .update({
      status: "stage_1_sent",
      stage_1_sent_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Trigger manual Stage 2 Incentive message
 */
export async function triggerManualStage2(customerId: string, organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("customers")
    .update({
      status: "stage_2_sent",
      stage_2_sent_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Mark a customer recovered
 */
export async function markCustomerRecovered(
  customerId: string,
  spendAmount: number = 75,
  organizationId: string = DEFAULT_ORG_ID
) {
  const supabase = createAdminClient();

  // Record a visit which fires the DB trigger and marks them recovered
  const result = await recordVisit({
    customerId,
    spendAmount,
    loggedBy: "manual_dashboard",
    organizationId,
  });

  return result;
}

export async function getInitialDashboardData(organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient() as any;

  // 1. Organization settings
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", organizationId)
    .single();

  // 2. Templates
  const { data: templates } = await supabase
    .from("message_templates")
    .select("*")
    .eq("organization_id", organizationId);

  // 3. Customers with service configs, visits, and messages
  const { data: customers } = await supabase
    .from("customers")
    .select(`
      *,
      service_configurations:primary_service_id (*),
      visits (*),
      messages_log (*)
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  // 4. Recent visits globally
  const { data: recentVisits } = await supabase
    .from("visits")
    .select(`
      *,
      customers ( name, phone_number, status )
    `)
    .eq("organization_id", organizationId)
    .order("visit_date", { ascending: false })
    .limit(10);

  // 5. Recent messages globally
  const { data: recentMessages } = await supabase
    .from("messages_log")
    .select(`
      *,
      customers ( name, phone_number )
    `)
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    organization: org,
    templates: templates || [],
    customers: customers || [],
    recentVisits: recentVisits || [],
    recentMessages: recentMessages || [],
  };
}

export async function sendDirectMessage(customerId: string, text: string, organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient();

  // In a real scenario, this calls WhatsApp API.
  // Here we just log it.
  const { data, error } = await supabase
    .from("messages_log")
    .insert({
      organization_id: organizationId,
      customer_id: customerId,
      type: "manual",
      body: text,
      direction: "outbound",
      status: "delivered",
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, message: data };
}

export async function updateMessageTemplate(type: string, data: any, organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("message_templates")
    .update(data)
    .eq("type", type)
    .eq("organization_id", organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateOrganization(data: any, organizationId: string = DEFAULT_ORG_ID) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update(data)
    .eq("id", organizationId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
