/**
 * AI Win-Back Copy Generator
 * Generates high-converting, personalized WhatsApp retention messages using LLM API
 * with robust local fallback heuristics.
 */

interface GenerateWinBackCopyParams {
  customerName: string;
  businessName: string;
  serviceType: string;
  daysAbsent: number;
  stage: "stage_1" | "stage_2";
  offer?: string;
}

export async function generatePersonalizedWinBackMessage({
  customerName,
  businessName,
  serviceType,
  daysAbsent,
  stage,
  offer = "15% off your next appointment",
}: GenerateWinBackCopyParams): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && !apiKey.includes("your-openai")) {
    try {
      const systemPrompt = `You are an elite retention specialist for a luxury high-end ${businessName}.
Write a warm, concise WhatsApp win-back message for a customer who hasn't visited in a while.
Guidelines:
- Keep it under 50 words.
- Natural, friendly, and non-salesy tone.
- Do not use cheesy hashtags.
- Include a clear, easy call to action to rebook.`;

      const userPrompt = stage === "stage_1"
        ? `Customer: ${customerName}
Service: ${serviceType}
Days absent: ${daysAbsent} days
Goal: Warm, conversational reminder that it's time for their regular service.`
        : `Customer: ${customerName}
Service: ${serviceType}
Days absent: ${daysAbsent} days
Offer: ${offer}
Goal: Polite incentive offer to welcome them back.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 120,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const copy = data.choices?.[0]?.message?.content?.trim();
        if (copy) return copy;
      }
    } catch (error) {
      console.warn("[AI GENERATION] LLM call failed, falling back to dynamic template.", error);
    }
  }

  // High-converting Dynamic Heuristic Fallback Templates
  if (stage === "stage_1") {
    return `Hey ${customerName}, it's been ${daysAbsent} days since your last ${serviceType} at ${businessName}! Life gets busy, but your self-care deserves some time. Would you like us to hold a slot for you this week? 💆‍♀️`;
  } else {
    return `Hi ${customerName}, we'd love to see you again at ${businessName}. To make your return extra special, here is ${offer} for your next booking! Just reply here or show this message when you visit. ✨`;
  }
}
