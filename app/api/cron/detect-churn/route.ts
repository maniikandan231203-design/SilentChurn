import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { generatePersonalizedWinBackMessage } from "@/lib/ai";

/**
 * Scheduled Cron Engine: Detect Silent Churn & Execute Multi-Stage Win-Back Automations
 * Endpoint: /api/cron/detect-churn
 * Security: Protected by Bearer CRON_SECRET token
 */
export async function GET(request: NextRequest) {
  return handleDetectChurn(request);
}

export async function POST(request: NextRequest) {
  return handleDetectChurn(request);
}

async function handleDetectChurn(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const urlSecret = request.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.CRON_SECRET || "silentchurn_cron_secret";

  const isAuthorized =
    authHeader === `Bearer ${expectedSecret}` ||
    urlSecret === expectedSecret ||
    process.env.NODE_ENV === "development";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized: Invalid cron secret" }, { status: 401 });
  }

  const supabase = createAdminClient() as any;
  const results = {
    organizationsEvaluated: 0,
    stage1Dispatched: 0,
    stage2Dispatched: 0,
    churnedMarked: 0,
    errors: [] as string[],
  };

  try {
    // 1. Fetch all active organizations
    const { data: orgs, error: orgError } = await supabase
      .from("organizations")
      .select("*");

    if (orgError) throw orgError;
    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ message: "No organizations found", results });
    }

    results.organizationsEvaluated = orgs.length;

    for (const org of orgs) {
      // -----------------------------------------------------------------------
      // TASK A: FLAG AT-RISK & DISPATCH STAGE 1 WIN-BACK
      // -----------------------------------------------------------------------
      // Find customers who are active or recovered, opted-in, and have a last_visit_at
      const { data: candidates, error: candidateError } = await supabase
        .from("customers")
        .select(`
          *,
          service_configurations:primary_service_id (*)
        `)
        .eq("organization_id", org.id)
        .eq("opted_in", true)
        .in("status", ["active", "recovered", "at_risk"])
        .not("last_visit_at", "is", null);

      if (!candidateError && candidates) {
        for (const customer of candidates) {
          const lastVisitDate = new Date(customer.last_visit_at!);
          const now = new Date();
          const daysAbsent = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

          const overduePercent = customer.service_configurations?.overdue_threshold_percentage || 40;
          const avgCycle = customer.average_cycle_days || customer.service_configurations?.default_cycle_days || 28;
          const thresholdDays = avgCycle * (1 + overduePercent / 100);

          if (daysAbsent >= thresholdDays && customer.status !== "stage_1_sent") {
            // Customer is overdue! Generate AI win-back message
            const winBackCopy = await generatePersonalizedWinBackMessage({
              customerName: customer.name,
              businessName: org.name,
              serviceType: customer.service_configurations?.service_name || "service",
              daysAbsent,
              stage: "stage_1",
            });

            // Dispatch WhatsApp message
            const dispatchResult = await sendWhatsAppMessage({
              to: customer.phone_number,
              body: winBackCopy,
              phoneNumberId: org.whatsapp_phone_number_id || undefined,
            });

            // Update customer status to stage_1_sent
            await supabase
              .from("customers")
              .update({
                status: "stage_1_sent",
                stage_1_sent_at: new Date().toISOString(),
              })
              .eq("id", customer.id);

            // Audit in messages_log
            await supabase.from("messages_log").insert({
              organization_id: org.id,
              customer_id: customer.id,
              type: "stage_1",
              body: winBackCopy,
              direction: "outbound",
              whatsapp_message_id: dispatchResult.messageId || null,
              status: dispatchResult.success ? "sent" : "failed",
            });

            results.stage1Dispatched++;
          }
        }
      }

      // -----------------------------------------------------------------------
      // TASK B: STAGE 2 ESCALATION (7+ DAYS AFTER STAGE 1)
      // -----------------------------------------------------------------------
      const stage2Cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: stage1Customers, error: stage1Error } = await supabase
        .from("customers")
        .select(`
          *,
          service_configurations:primary_service_id (*)
        `)
        .eq("organization_id", org.id)
        .eq("opted_in", true)
        .eq("status", "stage_1_sent")
        .lte("stage_1_sent_at", stage2Cutoff);

      if (!stage1Error && stage1Customers) {
        for (const customer of stage1Customers) {
          const lastVisitDate = new Date(customer.last_visit_at!);
          const now = new Date();
          const daysAbsent = Math.floor((now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));

          const offer = "15% off your next booking (Code: WINBACK15)";
          const incentiveCopy = await generatePersonalizedWinBackMessage({
            customerName: customer.name,
            businessName: org.name,
            serviceType: customer.service_configurations?.service_name || "treatment",
            daysAbsent,
            stage: "stage_2",
            offer,
          });

          // Dispatch Stage 2 message
          const dispatchResult = await sendWhatsAppMessage({
            to: customer.phone_number,
            body: incentiveCopy,
            phoneNumberId: org.whatsapp_phone_number_id || undefined,
          });

          // Update customer status to stage_2_sent
          await supabase
            .from("customers")
            .update({
              status: "stage_2_sent",
              stage_2_sent_at: new Date().toISOString(),
            })
            .eq("id", customer.id);

          // Audit in messages_log
          await supabase.from("messages_log").insert({
            organization_id: org.id,
            customer_id: customer.id,
            type: "stage_2_offer",
            body: incentiveCopy,
            direction: "outbound",
            whatsapp_message_id: dispatchResult.messageId || null,
            status: dispatchResult.success ? "sent" : "failed",
          });

          results.stage2Dispatched++;
        }
      }

      // -----------------------------------------------------------------------
      // TASK C: 90-DAY CHURN WINDOW & COOLDOWN SUPPRESSION
      // -----------------------------------------------------------------------
      // Mark customers churned if:
      // 1. Stage 2 was sent >= 7 days ago and still no visit, OR
      // 2. Days absent >= 90 days
      const churnStage2Cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const churn90DaysCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const { data: churnCandidates, error: churnError } = await supabase
        .from("customers")
        .select("id, name, status, stage_2_sent_at, last_visit_at")
        .eq("organization_id", org.id)
        .in("status", ["stage_2_sent", "stage_1_sent"])
        .or(`stage_2_sent_at.lte.${churnStage2Cutoff},last_visit_at.lte.${churn90DaysCutoff}`);

      if (!churnError && churnCandidates) {
        for (const customer of churnCandidates) {
          await supabase
            .from("customers")
            .update({
              status: "churned",
              churned_at: new Date().toISOString(),
            })
            .eq("id", customer.id);

          results.churnedMarked++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err: any) {
    console.error("[CRON DETECT CHURN ERROR]", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
