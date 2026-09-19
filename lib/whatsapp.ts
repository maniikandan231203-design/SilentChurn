/**
 * WhatsApp Cloud API Client
 * Sends direct WhatsApp messages, templates, and interactive buttons via Meta Graph API
 */

interface SendWhatsAppMessageParams {
  to: string; // E.164 formatted phone number (e.g., +447822411099 or 447822411099)
  body: string;
  phoneNumberId?: string;
  apiToken?: string;
}

interface WhatsAppApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage({
  to,
  body,
  phoneNumberId,
  apiToken,
}: SendWhatsAppMessageParams): Promise<WhatsAppApiResponse> {
  const token = apiToken || process.env.WHATSAPP_API_TOKEN;
  const phoneId = phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Clean phone number: remove +, spaces, hyphens
  const cleanPhone = to.replace(/[^\d]/g, "");

  // If credentials are mock/placeholder, log simulation and return synthetic success
  if (!token || token.includes("your-meta") || !phoneId || phoneId.includes("your-whatsapp")) {
    console.log(`[WHATSAPP SIMULATION] Outbound to ${cleanPhone}: "${body.replace(/\n/g, " ")}"`);
    return {
      success: true,
      messageId: `wamid_simulated_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanPhone,
        type: "text",
        text: {
          preview_url: false,
          body,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WHATSAPP ERROR]", data);
      return {
        success: false,
        error: data.error?.message || "Failed to dispatch WhatsApp message",
      };
    }

    const messageId = data.messages?.[0]?.id;
    return {
      success: true,
      messageId,
    };
  } catch (err: any) {
    console.error("[WHATSAPP EXCEPTION]", err);
    return {
      success: false,
      error: err.message || "Network error dispatching WhatsApp message",
    };
  }
}
