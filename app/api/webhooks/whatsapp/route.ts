import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Default demo organization UUID if webhook payload doesn't map to a specific tenant
const DEFAULT_ORG_ID = "e1000000-0000-4000-8000-000000000001";

/**
 * GET Handler: Meta WhatsApp Webhook Handshake Verification
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "silentchurn_webhook_secret";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[WEBHOOK GET] Meta WhatsApp Webhook successfully verified.");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("[WEBHOOK GET] Unauthorized webhook verification attempt.", { mode, token });
  return NextResponse.json({ error: "Verification token mismatch" }, { status: 403 });
}

/**
 * POST Handler: Process Inbound WhatsApp Messages & Events
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = createAdminClient() as any;

    // Check if this is a WhatsApp message event
    const entry = payload?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // Event might be a status update (delivered, read, etc.)
      const statuses = value?.statuses;
      if (statuses && statuses.length > 0) {
        for (const st of statuses) {
          const wamid = st.id;
          const status = st.status; // 'sent' | 'delivered' | 'read' | 'failed'
          if (wamid && ["delivered", "read", "failed"].includes(status)) {
            await supabase
              .from("messages_log")
              .update({ status })
              .eq("whatsapp_message_id", wamid);
          }
        }
      }
      return NextResponse.json({ status: "handled_status" }, { status: 200 });
    }

    const message = messages[0];
    const rawSenderPhone = message.from; // e.g. "447822411099"
    const senderPhone = rawSenderPhone.startsWith("+") ? rawSenderPhone : `+${rawSenderPhone}`;
    const rawText = message.text?.body?.trim() || "";
    const wamid = message.id;
    const recipientPhoneId = value?.metadata?.phone_number_id;

    // 1. Identify Organization
    let organizationId = DEFAULT_ORG_ID;
    let organization: any = null;

    if (recipientPhoneId) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("*")
        .eq("whatsapp_phone_number_id", recipientPhoneId)
        .maybeSingle();

      if (orgData) {
        organizationId = orgData.id;
        organization = orgData;
      }
    }

    if (!organization) {
      const { data: defaultOrg } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .maybeSingle();
      organization = defaultOrg || {
        id: DEFAULT_ORG_ID,
        name: "Lumina Luxe Hair & Aesthetic Lounge",
        currency: "GBP",
        reply_phone_number: "+44 7700 900450",
      };
    }

    console.log(`[INBOUND MESSAGE] From: ${senderPhone} | Org: ${organization.name} | Text: "${rawText}"`);

    // -------------------------------------------------------------------------
    // FLOW 1: STAFF VISIT LOGGING COMMAND (`done [name] [phone] [amount?]`)
    // -------------------------------------------------------------------------
    const doneCommandMatch = rawText.match(/^done\s+(.+?)\s+(\+?\d[\d\s-]{7,15})(?:\s+(\d+(?:\.\d{1,2})?))?$/i);
    const isStaffSender = organization.staff_logging_number && 
      (senderPhone.replace(/\D/g, "") === organization.staff_logging_number.replace(/\D/g, ""));

    if (doneCommandMatch || (isStaffSender && rawText.toLowerCase().startsWith("done"))) {
      let customerName = "Customer";
      let customerPhone = "";
      let spendAmount = 0;

      if (doneCommandMatch) {
        customerName = doneCommandMatch[1].trim();
        customerPhone = doneCommandMatch[2].replace(/[^\d+]/g, "");
        if (!customerPhone.startsWith("+")) customerPhone = `+${customerPhone}`;
        spendAmount = doneCommandMatch[3] ? parseFloat(doneCommandMatch[3]) : 0;
      } else {
        const parts = rawText.replace(/^done\s+/i, "").split(/\s+/);
        customerName = parts[0] || "Customer";
        customerPhone = parts[1] || senderPhone;
      }

      // Check if customer exists in this organization
      const { data: existingCust } = await supabase
        .from("customers")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("phone_number", customerPhone)
        .maybeSingle();

      let targetCustomerId = existingCust?.id;
      let isNewCustomer = false;

      if (!targetCustomerId) {
        isNewCustomer = true;
        const { data: newCust, error: createError } = await supabase
          .from("customers")
          .insert({
            organization_id: organizationId,
            name: customerName,
            phone_number: customerPhone,
            status: "active",
            opted_in: true,
            total_visits: 0,
            total_spend: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        targetCustomerId = newCust.id;
      } else if (existingCust.name !== customerName && customerName !== "Customer") {
        // Update customer name if provided
        await supabase
          .from("customers")
          .update({ name: customerName })
          .eq("id", targetCustomerId);
      }

      // Record Visit
      const { error: visitError } = await supabase
        .from("visits")
        .insert({
          organization_id: organizationId,
          customer_id: targetCustomerId,
          visit_date: new Date().toISOString(),
          spend_amount: spendAmount,
          logged_by: "staff_whatsapp",
        });

      if (visitError) console.error("Error inserting visit:", visitError);

      // Fetch updated customer metrics (calculated automatically via DB trigger)
      const { data: updatedCust } = await supabase
        .from("customers")
        .select("total_visits, total_spend, status")
        .eq("id", targetCustomerId)
        .single();

      // Dispatch confirmation receipt to staff member
      const staffReceipt = `✅ Visit logged successfully!\n\nCustomer: ${customerName}\nPhone: ${customerPhone}\nSpend: ${organization.currency} ${spendAmount.toFixed(2)}\nTotal Visits: ${updatedCust?.total_visits || 1}\nStatus: ${updatedCust?.status?.toUpperCase() || "ACTIVE"}`;
      
      await sendWhatsAppMessage({
        to: senderPhone,
        body: staffReceipt,
        phoneNumberId: recipientPhoneId,
      });

      // If new customer, dispatch VIP welcome template
      if (isNewCustomer) {
        const welcomeBody = `Hi ${customerName}! Welcome to ${organization.name}. We've registered your loyalty profile. You'll receive VIP booking perks and exclusive member benefits.\n\nReply with STOP anytime to opt out.`;
        await sendWhatsAppMessage({
          to: customerPhone,
          body: welcomeBody,
          phoneNumberId: recipientPhoneId,
        });

        await supabase.from("messages_log").insert({
          organization_id: organizationId,
          customer_id: targetCustomerId,
          type: "welcome",
          body: welcomeBody,
          direction: "outbound",
          status: "sent",
        });
      }

      return NextResponse.json({ success: true, action: "staff_visit_logged" });
    }

    // -------------------------------------------------------------------------
    // FLOW 2: OPT-OUT COMPLIANCE (STOP / UNSUBSCRIBE / CANCEL)
    // -------------------------------------------------------------------------
    const normalizedText = rawText.toUpperCase();
    const isOptOutCommand = ["STOP", "UNSUBSCRIBE", "CANCEL", "QUIT", "END"].includes(normalizedText);
    const isOptInCommand = ["START", "UNSTOP", "RESUBSCRIBE"].includes(normalizedText);

    // Look up customer by phone
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("phone_number", senderPhone)
      .maybeSingle();

    if (isOptOutCommand && customer) {
      await supabase
        .from("customers")
        .update({
          opted_in: false,
          status: "opted_out",
        })
        .eq("id", customer.id);

      const optOutMsg = `You have been unsubscribed from ${organization.name} automated messages. No further reminders will be sent. Reply START anytime to re-subscribe.`;
      
      await sendWhatsAppMessage({
        to: senderPhone,
        body: optOutMsg,
        phoneNumberId: recipientPhoneId,
      });

      await supabase.from("messages_log").insert({
        organization_id: organizationId,
        customer_id: customer.id,
        type: "opt_out_confirm",
        body: optOutMsg,
        direction: "outbound",
        status: "sent",
      });

      return NextResponse.json({ success: true, action: "opted_out" });
    }

    if (isOptInCommand && customer) {
      await supabase
        .from("customers")
        .update({
          opted_in: true,
          status: "active",
        })
        .eq("id", customer.id);

      const welcomeBackMsg = `Welcome back to ${organization.name}! Your VIP reminders and loyalty perks are active again. 🎉`;
      await sendWhatsAppMessage({
        to: senderPhone,
        body: welcomeBackMsg,
        phoneNumberId: recipientPhoneId,
      });

      return NextResponse.json({ success: true, action: "opted_in" });
    }

    // -------------------------------------------------------------------------
    // FLOW 3: INBOUND WIN-BACK REPLIES (BOOKING INTENT / RECOVERY)
    // -------------------------------------------------------------------------
    if (customer && (customer.status === "stage_1_sent" || customer.status === "stage_2_sent")) {
      // Customer replied to a win-back outreach message!
      await supabase
        .from("customers")
        .update({
          status: "recovered",
        })
        .eq("id", customer.id);

      await supabase.from("messages_log").insert({
        organization_id: organizationId,
        customer_id: customer.id,
        type: "inbound_recovery_intent",
        body: rawText,
        direction: "inbound",
        whatsapp_message_id: wamid,
        status: "delivered",
      });

      // Warm Concierge Confirmation
      const conciergeReply = `Thank you ${customer.name}! We're delighted to welcome you back to ${organization.name}. Our concierge team has reserved your request and will confirm your preferred time shortly! ✨`;
      
      await sendWhatsAppMessage({
        to: senderPhone,
        body: conciergeReply,
        phoneNumberId: recipientPhoneId,
      });

      // Notify Staff Number if configured
      if (organization.staff_logging_number) {
        const staffAlert = `🎉 WIN-BACK RECOVERY: ${customer.name} (${customer.phone_number}) replied to Win-Back:\n\n"${rawText}"\n\nPlease reach out to confirm their booking!`;
        await sendWhatsAppMessage({
          to: organization.staff_logging_number,
          body: staffAlert,
          phoneNumberId: recipientPhoneId,
        });
      }

      return NextResponse.json({ success: true, action: "winback_recovery_confirmed" });
    }

    // -------------------------------------------------------------------------
    // FLOW 4: COUNTER QR SCAN / NAME INGESTION
    // -------------------------------------------------------------------------
    if (!customer) {
      // New visitor scanning Counter WhatsApp QR
      const { data: newVisitor } = await supabase
        .from("customers")
        .insert({
          organization_id: organizationId,
          name: "VIP Guest",
          phone_number: senderPhone,
          status: "active",
          opted_in: true,
        })
        .select()
        .single();

      const namePrompt = `Hey there! Welcome to ${organization.name} VIP Loyalty Club! 🎉\n\nTo personalize your visit profile and ensure you receive your perks, what is your first and last name?`;
      
      await sendWhatsAppMessage({
        to: senderPhone,
        body: namePrompt,
        phoneNumberId: recipientPhoneId,
      });

      if (newVisitor) {
        await supabase.from("messages_log").insert({
          organization_id: organizationId,
          customer_id: newVisitor.id,
          type: "name_request",
          body: namePrompt,
          direction: "outbound",
          status: "sent",
        });
      }

      return NextResponse.json({ success: true, action: "name_request_sent" });
    } else if (customer.name === "VIP Guest" && rawText.length >= 2 && rawText.length <= 40) {
      // Update customer name from reply
      await supabase
        .from("customers")
        .update({ name: rawText })
        .eq("id", customer.id);

      const nameSavedMsg = `Great to meet you, ${rawText}! Your loyalty profile is now active at ${organization.name}. Show this message at the counter to claim your visit perks! ✨`;
      await sendWhatsAppMessage({
        to: senderPhone,
        body: nameSavedMsg,
        phoneNumberId: recipientPhoneId,
      });

      return NextResponse.json({ success: true, action: "name_saved" });
    }

    // Default Fallback: Log inbound message
    if (customer) {
      await supabase.from("messages_log").insert({
        organization_id: organizationId,
        customer_id: customer.id,
        type: "general_inbound",
        body: rawText,
        direction: "inbound",
        whatsapp_message_id: wamid,
        status: "delivered",
      });
    }

    return NextResponse.json({ success: true, action: "logged" });
  } catch (err: any) {
    console.error("[WEBHOOK ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
