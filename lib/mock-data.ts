export interface IndustryPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  defaultFrequencyDays: number;
  frequencyRange: string;
  defaultOverduePercent: number;
  atRiskDays: number;
  churnDays: number;
  avgTicketPrice: number;
  typicalOffers: string[];
}

export const INDUSTRY_PRESETS: IndustryPreset[] = [
  {
    id: "salon",
    name: "Hair & Beauty Salons",
    category: "Personal Care",
    icon: "Scissors",
    description: "Colour, cuts, styling, extensions and treatments.",
    defaultFrequencyDays: 35,
    frequencyRange: "4 – 6 Weeks (28–42 days)",
    defaultOverduePercent: 40,
    atRiskDays: 49,
    churnDays: 90,
    avgTicketPrice: 65,
    typicalOffers: ["15% off next root touch-up", "Free Olaplex conditioning treatment", "£10 styling voucher"],
  },
  {
    id: "barbershop",
    name: "Barbershops & Grooming",
    category: "Personal Care",
    icon: "Sparkles",
    description: "Fades, beard trims, hot towel shaves.",
    defaultFrequencyDays: 14,
    frequencyRange: "2 – 3 Weeks (12–21 days)",
    defaultOverduePercent: 40,
    atRiskDays: 20,
    churnDays: 60,
    avgTicketPrice: 28,
    typicalOffers: ["Complimentary beard oil treatment", "£5 off full cut & shave", "Free hot towel upgrade"],
  },
  {
    id: "cafe",
    name: "Cafés & Coffee Shops",
    category: "Food & Beverage",
    icon: "Coffee",
    description: "Specialty coffee, pastries, lunch bites.",
    defaultFrequencyDays: 7,
    frequencyRange: "7 – 14 Days",
    defaultOverduePercent: 50,
    atRiskDays: 11,
    churnDays: 30,
    avgTicketPrice: 9.5,
    typicalOffers: ["Free pastry with your next flat white", "Double loyalty stamps this week", "Buy 1 get 1 50% off on brunch"],
  },
  {
    id: "restaurant",
    name: "Casual & Fine Dining",
    category: "Hospitality",
    icon: "Utensils",
    description: "Evening dining, family lunches, weekend dinners.",
    defaultFrequencyDays: 28,
    frequencyRange: "3 – 5 Weeks (21–35 days)",
    defaultOverduePercent: 40,
    atRiskDays: 39,
    churnDays: 90,
    avgTicketPrice: 48,
    typicalOffers: ["Complimentary dessert or glass of prosecco", "20% off midweek tables", "Chef's starter on the house"],
  },
  {
    id: "gym",
    name: "Gyms & Boutique Fitness",
    category: "Wellness",
    icon: "Dumbbell",
    description: "Pilates, HIIT, personal training, open gym.",
    defaultFrequencyDays: 4,
    frequencyRange: "3 – 7 Days",
    defaultOverduePercent: 75,
    atRiskDays: 7,
    churnDays: 45,
    avgTicketPrice: 55,
    typicalOffers: ["Free 1-on-1 PT coaching session", "Bring a friend free this weekend", "Free smoothie at the shake bar"],
  },
  {
    id: "spa",
    name: "Spas & Wellness Retreats",
    category: "Wellness",
    icon: "Flame",
    description: "Massages, facials, hydrotherapy, body scrubs.",
    defaultFrequencyDays: 45,
    frequencyRange: "6 – 8 Weeks (40–60 days)",
    defaultOverduePercent: 35,
    atRiskDays: 60,
    churnDays: 120,
    avgTicketPrice: 95,
    typicalOffers: ["20-min sauna access upgrade", "£20 off 60-minute deep tissue", "Complimentary aromatherapy oil"],
  },
  {
    id: "clinic",
    name: "Aesthetics & Dental Clinics",
    category: "Medical Care",
    icon: "HeartPulse",
    description: "Skin therapy, dental hygiene, laser treatments.",
    defaultFrequencyDays: 60,
    frequencyRange: "8 – 12 Weeks (60–90 days)",
    defaultOverduePercent: 30,
    atRiskDays: 78,
    churnDays: 150,
    avgTicketPrice: 140,
    typicalOffers: ["Complimentary skin barrier analysis", "£25 voucher towards booster session", "Free clinical aftercare kit"],
  },
  {
    id: "shisha",
    name: "Shisha & Cocktail Lounges",
    category: "Nightlife",
    icon: "GlassWater",
    description: "Evening lounge visits, shisha heads, signature drinks.",
    defaultFrequencyDays: 14,
    frequencyRange: "1 – 3 Weeks (7–21 days)",
    defaultOverduePercent: 50,
    atRiskDays: 21,
    churnDays: 60,
    avgTicketPrice: 42,
    typicalOffers: ["Complimentary coal & flavour refresher", "Free mocktail with shisha order", "VIP booth reservation pass"],
  },
  {
    id: "hotel",
    name: "Boutique Hotels & Stays",
    category: "Hospitality",
    icon: "Building2",
    description: "Weekend getaways, staycations, business stays.",
    defaultFrequencyDays: 90,
    frequencyRange: "3 – 6 Months (90–180 days)",
    defaultOverduePercent: 30,
    atRiskDays: 120,
    churnDays: 240,
    avgTicketPrice: 220,
    typicalOffers: ["Late 2pm checkout & glass of wine", "15% off return weekend stay", "Free room category upgrade"],
  },
];

export type CustomerStatus =
  | "active"
  | "at_risk"
  | "stage_1_sent"
  | "stage_2_sent"
  | "recovered"
  | "churned"
  | "opted_out";

export interface MessageLog {
  id: string;
  sender: "business" | "customer" | "system";
  text: string;
  timestamp: string;
  status: "delivered" | "read" | "sent" | "received";
  stage?: "welcome" | "name_request" | "stage_1" | "stage_2" | "opt_out" | "manual";
}

export interface VisitRecord {
  id: string;
  date: string;
  service: string;
  amount: number;
  loggedBy: "Counter QR" | "Staff Quick-Log" | "WhatsApp Direct" | "Online Booking";
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  countryCode: string;
  serviceType: string;
  preferredStaff?: string;
  totalVisits: number;
  totalSpend: number;
  averageFrequencyDays: number;
  lastVisitDate: string;
  daysSinceLastVisit: number;
  status: CustomerStatus;
  churnRiskScore: number; // 0 to 100
  predictedLossValue: number;
  optInDate: string;
  notes?: string;
  history: VisitRecord[];
  messages: MessageLog[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: "welcome" | "name_request" | "stage_1" | "stage_2" | "opt_out";
  triggerDescription: string;
  delayHours: number;
  headline: string;
  body: string;
  callToAction: string;
  variables: string[];
  isActive: boolean;
}

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl_welcome",
    name: "Welcome & Counter Opt-In",
    type: "welcome",
    triggerDescription: "Immediate dispatch on counter QR check-in scan or WhatsApp opt-in",
    delayHours: 0,
    headline: "Welcome to {{business_name}}! 🎉",
    body: "Hi {{name}}! Thank you for visiting {{business_name}} today. We have registered your loyalty profile. We'll make sure you get VIP priority booking and exclusive member perks.\n\nReply with STOP anytime to opt out.",
    callToAction: "Save Contact Card",
    variables: ["{{name}}", "{{business_name}}"],
    isActive: true,
  },
  {
    id: "tpl_name_request",
    name: "WhatsApp Name Request",
    type: "name_request",
    triggerDescription: "When a customer initiates via WhatsApp Direct QR without providing full name",
    delayHours: 0,
    headline: "Quick question for your profile 👇",
    body: "Hey there! Thanks for reaching out to {{business_name}}. To save your loyalty profile and upcoming visit perks, what's your first and last name?",
    callToAction: "Reply with full name",
    variables: ["{{business_name}}"],
    isActive: true,
  },
  {
    id: "tpl_stage_1",
    name: "Stage 1 Win-Back (Friendly Rebooking)",
    type: "stage_1",
    triggerDescription: "Triggered automatically when customer exceeds average visit interval by 40%",
    delayHours: 0,
    headline: "We miss you at {{business_name}}! ✨",
    body: "Hey {{name}}, it's been {{days_absent}} days since your last {{service_type}} with us! Life gets busy, but your hair/wellness deserves some TLC.\n\nWould you like us to hold a slot for you this week?",
    callToAction: "Book My Visit Now",
    variables: ["{{name}}", "{{business_name}}", "{{days_absent}}", "{{service_type}}"],
    isActive: true,
  },
  {
    id: "tpl_stage_2",
    name: "Stage 2 Incentive Follow-Up",
    type: "stage_2",
    triggerDescription: "Triggered 7 days after Stage 1 if no visit is logged",
    delayHours: 168,
    headline: "A special gift for {{name}} 🎁",
    body: "Hi {{name}}, we'd love to see you again at {{business_name}}. To make your return extra sweet, here is {{offer}} for your next booking!\n\nJust show this message or click below to claim.",
    callToAction: "Claim {{offer}} Code: WINBACK15",
    variables: ["{{name}}", "{{business_name}}", "{{days_absent}}", "{{offer}}"],
    isActive: true,
  },
  {
    id: "tpl_opt_out",
    name: "Opt-Out (STOP) Confirmation",
    type: "opt_out",
    triggerDescription: "Triggered immediately when customer replies STOP / UNSUBSCRIBE",
    delayHours: 0,
    headline: "Subscription Updated",
    body: "You have been unsubscribed from {{business_name}} automated messages. No further reminders will be sent. You can text START at any time to re-subscribe. Have a great day!",
    callToAction: "Unsubscribed",
    variables: ["{{business_name}}"],
    isActive: true,
  },
];

export interface LiveEvent {
  id: string;
  type: "checkin" | "stage_1_sent" | "stage_2_sent" | "recovered" | "opt_out" | "quick_log";
  customerName: string;
  customerPhone: string;
  service?: string;
  amount?: number;
  detail: string;
  timestamp: string;
  badgeColor: string;
}

export const INITIAL_EVENTS: LiveEvent[] = [
  {
    id: "evt_1",
    type: "recovered",
    customerName: "Alexandria Vance",
    customerPhone: "+44 7911 234890",
    service: "Balayage & Cut",
    amount: 125,
    detail: "Recovered via 15% Stage 2 Offer after 52 days absent",
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    badgeColor: "emerald",
  },
  {
    id: "evt_2",
    type: "recovered",
    customerName: "Daniel Craig",
    customerPhone: "+44 7711 654321",
    service: "Gentleman's Cut & Hot Shave",
    amount: 42,
    detail: "Walk-in recovery confirmed following Stage 1 reminder",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    badgeColor: "emerald",
  },
  {
    id: "evt_3",
    type: "stage_1_sent",
    customerName: "Sarah Jenkins",
    customerPhone: "+44 7822 411099",
    service: "Colour & Cut",
    amount: 80,
    detail: "Stage 1 Win-Back message dispatched (49 days absent)",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    badgeColor: "blue",
  },
  {
    id: "evt_4",
    type: "stage_2_sent",
    customerName: "Liam O'Connor",
    customerPhone: "+44 7955 833211",
    service: "Deep Tissue Massage",
    amount: 85,
    detail: "Stage 2 Incentive dispatched (+15% Voucher)",
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    badgeColor: "purple",
  },
];

// EXACTLY 2 CUSTOMERS FOR EACH OF THE 7 STATUSES (14 TOTAL):
// 1. At Risk (2)
// 2. Stage 1 Sent (2)
// 3. Stage 2 Sent (2)
// 4. Recovered (2)
// 5. Active (2)
// 6. Churned (90d) (2)
// 7. Opted Out (2)
export const INITIAL_CUSTOMERS: Customer[] = [
  // ================= 1. AT RISK (2) =================
  {
    id: "cust_risk_1",
    name: "Jessica Taylor",
    phone: "+44 7833 229100",
    countryCode: "+44",
    serviceType: "Gel Nails & Pedicure",
    preferredStaff: "Sophie",
    totalVisits: 3,
    totalSpend: 155,
    averageFrequencyDays: 21,
    lastVisitDate: "2026-08-01",
    daysSinceLastVisit: 32,
    status: "at_risk",
    churnRiskScore: 56,
    predictedLossValue: 50,
    optInDate: "2026-04-18",
    notes: "Overdue standard 21-day cycle by 11 days. Ready for Stage 1 automated reminder.",
    history: [
      { id: "v1", date: "2026-08-01", service: "Gel Nails & Pedi", amount: 55, loggedBy: "Counter QR" },
      { id: "v2", date: "2026-07-11", service: "Gel Nails", amount: 45, loggedBy: "Counter QR" },
      { id: "v3", date: "2026-06-20", service: "Express Manicure", amount: 35, loggedBy: "Online Booking" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Jessica! Welcome to Lumina Luxe. Your VIP loyalty profile is active! ✨",
        timestamp: "2026-04-18 11:15",
        status: "read",
        stage: "welcome",
      },
    ],
  },
  {
    id: "cust_risk_2",
    name: "Ethan Wright",
    phone: "+44 7711 334556",
    countryCode: "+44",
    serviceType: "Precision Fade & Style",
    preferredStaff: "Dave",
    totalVisits: 5,
    totalSpend: 140,
    averageFrequencyDays: 14,
    lastVisitDate: "2026-08-11",
    daysSinceLastVisit: 22,
    status: "at_risk",
    churnRiskScore: 62,
    predictedLossValue: 30,
    optInDate: "2026-03-05",
    notes: "Regular bi-weekly customer, now 8 days overdue standard cycle.",
    history: [
      { id: "v1", date: "2026-08-11", service: "Fade & Beard Shape", amount: 30, loggedBy: "Counter QR" },
      { id: "v2", date: "2026-07-28", service: "Skin Fade", amount: 25, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Ethan! Thanks for visiting us today. Your counter loyalty perk is saved.",
        timestamp: "2026-03-05 15:10",
        status: "read",
        stage: "welcome",
      },
    ],
  },

  // ================= 2. STAGE 1 SENT (2) =================
  {
    id: "cust_s1_1",
    name: "Sarah Jenkins",
    phone: "+44 7822 411099",
    countryCode: "+44",
    serviceType: "Colour & Cut",
    preferredStaff: "Chloe",
    totalVisits: 6,
    totalSpend: 480,
    averageFrequencyDays: 32,
    lastVisitDate: "2026-07-15",
    daysSinceLastVisit: 49,
    status: "stage_1_sent",
    churnRiskScore: 68,
    predictedLossValue: 80,
    optInDate: "2026-01-10",
    notes: "Friendly Stage 1 reminder dispatched on WhatsApp.",
    history: [
      { id: "v1", date: "2026-07-15", service: "Full Balayage", amount: 120, loggedBy: "Counter QR" },
      { id: "v2", date: "2026-06-12", service: "Root Retouch & Toner", amount: 75, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Sarah! Welcome to Lumina Luxe Salon. Your loyalty profile is live! ✨",
        timestamp: "2026-01-10 14:22",
        status: "read",
        stage: "welcome",
      },
      {
        id: "m2",
        sender: "business",
        text: "Hey Sarah, it's been 49 days since your last Balayage with Chloe! Life gets busy, but your hair deserves some TLC. Would you like us to hold a slot for you this Thursday or Friday?",
        timestamp: "2026-09-01 10:15",
        status: "delivered",
        stage: "stage_1",
      },
    ],
  },
  {
    id: "cust_s1_2",
    name: "Lucas Bennett",
    phone: "+44 7922 665431",
    countryCode: "+44",
    serviceType: "Beard Sculpt & Trim",
    preferredStaff: "Dave",
    totalVisits: 4,
    totalSpend: 110,
    averageFrequencyDays: 14,
    lastVisitDate: "2026-08-09",
    daysSinceLastVisit: 24,
    status: "stage_1_sent",
    churnRiskScore: 65,
    predictedLossValue: 28,
    optInDate: "2026-02-14",
    notes: "Stage 1 message delivered. Customer checked message today.",
    history: [
      { id: "v1", date: "2026-08-09", service: "Beard Sculpt", amount: 28, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hey Lucas, it's been 24 days since your last beard trim with Dave! Need a fresh shape-up for the weekend?",
        timestamp: "2026-09-01 12:40",
        status: "read",
        stage: "stage_1",
      },
    ],
  },

  // ================= 3. STAGE 2 SENT (2) =================
  {
    id: "cust_s2_1",
    name: "Liam O'Connor",
    phone: "+44 7955 833211",
    countryCode: "+44",
    serviceType: "Gentleman's Grooming",
    preferredStaff: "Dave",
    totalVisits: 14,
    totalSpend: 420,
    averageFrequencyDays: 14,
    lastVisitDate: "2026-07-26",
    daysSinceLastVisit: 38,
    status: "stage_2_sent",
    churnRiskScore: 84,
    predictedLossValue: 30,
    optInDate: "2025-08-15",
    notes: "Stage 2 incentive with 15% VIP discount code active.",
    history: [
      { id: "v1", date: "2026-07-26", service: "Skin Fade & Beard", amount: 30, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hey Liam, it's been 22 days since your last trim with Dave! Need a fresh fade for the weekend?",
        timestamp: "2026-08-19 12:00",
        status: "read",
        stage: "stage_1",
      },
      {
        id: "m2",
        sender: "business",
        text: "Hi Liam, Dave has a few VIP slots open. Here's 15% off your next session! Code: WINBACK15",
        timestamp: "2026-08-26 10:30",
        status: "delivered",
        stage: "stage_2",
      },
    ],
  },
  {
    id: "cust_s2_2",
    name: "Natasha Romanoff",
    phone: "+44 7811 554322",
    countryCode: "+44",
    serviceType: "Keratin Treatment",
    preferredStaff: "Marcus",
    totalVisits: 5,
    totalSpend: 625,
    averageFrequencyDays: 42,
    lastVisitDate: "2026-07-02",
    daysSinceLastVisit: 62,
    status: "stage_2_sent",
    churnRiskScore: 82,
    predictedLossValue: 125,
    optInDate: "2025-10-18",
    notes: "Sent Stage 2 complimentary Olaplex booster incentive.",
    history: [
      { id: "v1", date: "2026-07-02", service: "Keratin Express", amount: 125, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Natasha, we miss you at Lumina Luxe! It's been 50 days since your keratin session.",
        timestamp: "2026-08-21 11:10",
        status: "read",
        stage: "stage_1",
      },
      {
        id: "m2",
        sender: "business",
        text: "Hi Natasha, we'd love to welcome you back. Enjoy a complimentary Olaplex booster on your next appointment!",
        timestamp: "2026-08-28 09:30",
        status: "delivered",
        stage: "stage_2",
      },
    ],
  },

  // ================= 4. RECOVERED (2) =================
  {
    id: "cust_rec_1",
    name: "Alexandria Vance",
    phone: "+44 7911 234890",
    countryCode: "+44",
    serviceType: "Balayage & Gloss",
    preferredStaff: "Marcus",
    totalVisits: 9,
    totalSpend: 1125,
    averageFrequencyDays: 28,
    lastVisitDate: "2026-09-01",
    daysSinceLastVisit: 1,
    status: "recovered",
    churnRiskScore: 12,
    predictedLossValue: 125,
    optInDate: "2025-11-04",
    notes: "Successfully recovered after 52 days absent with 15% VIP offer.",
    history: [
      { id: "v1", date: "2026-09-01", service: "Balayage & Cut", amount: 125, loggedBy: "Counter QR" },
      { id: "v2", date: "2026-07-10", service: "Tone & Blowdry", amount: 60, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Alexandria, here is 15% off your next booking at Lumina Luxe! Use code WINBACK15.",
        timestamp: "2026-08-30 09:00",
        status: "read",
        stage: "stage_2",
      },
      {
        id: "m2",
        sender: "customer",
        text: "Amazing, thank you! Booking in for today at 2pm with Marcus.",
        timestamp: "2026-08-31 16:42",
        status: "received",
      },
      {
        id: "m3",
        sender: "business",
        text: "You're all set! See you at 2pm Alexandria. 💆‍♀️",
        timestamp: "2026-08-31 16:45",
        status: "read",
        stage: "manual",
      },
    ],
  },
  {
    id: "cust_rec_2",
    name: "Daniel Craig",
    phone: "+44 7711 654321",
    countryCode: "+44",
    serviceType: "Gentleman's Cut & Hot Shave",
    preferredStaff: "Dave",
    totalVisits: 8,
    totalSpend: 336,
    averageFrequencyDays: 21,
    lastVisitDate: "2026-09-01",
    daysSinceLastVisit: 1,
    status: "recovered",
    churnRiskScore: 10,
    predictedLossValue: 42,
    optInDate: "2025-12-01",
    notes: "Recovered following Stage 1 reminder, completed visit today.",
    history: [
      { id: "v1", date: "2026-09-01", service: "Gentleman's Cut & Hot Shave", amount: 42, loggedBy: "Counter QR" },
      { id: "v2", date: "2026-07-20", service: "Fade & Shave", amount: 42, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hey Daniel, it's been 28 days since your last hot shave with Dave. Would you like to reserve a chair this week?",
        timestamp: "2026-08-28 14:00",
        status: "read",
        stage: "stage_1",
      },
      {
        id: "m2",
        sender: "customer",
        text: "Thanks! Coming in this afternoon.",
        timestamp: "2026-08-31 11:20",
        status: "received",
      },
    ],
  },

  // ================= 5. ACTIVE (2) =================
  {
    id: "cust_act_1",
    name: "Priya Patel",
    phone: "+44 7400 119844",
    countryCode: "+44",
    serviceType: "HydraFacial Deluxe",
    preferredStaff: "Maya",
    totalVisits: 5,
    totalSpend: 475,
    averageFrequencyDays: 30,
    lastVisitDate: "2026-08-23",
    daysSinceLastVisit: 10,
    status: "active",
    churnRiskScore: 8,
    predictedLossValue: 95,
    optInDate: "2026-03-20",
    history: [
      { id: "v1", date: "2026-08-23", service: "HydraFacial Deluxe", amount: 95, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Priya! Thank you for visiting today. We hope you're glowing! ✨",
        timestamp: "2026-08-23 15:40",
        status: "read",
        stage: "welcome",
      },
    ],
  },
  {
    id: "cust_act_2",
    name: "Chloe Chen",
    phone: "+44 7799 441029",
    countryCode: "+44",
    serviceType: "Express Blowdry & Styling",
    preferredStaff: "Marcus",
    totalVisits: 7,
    totalSpend: 840,
    averageFrequencyDays: 35,
    lastVisitDate: "2026-08-20",
    daysSinceLastVisit: 13,
    status: "active",
    churnRiskScore: 12,
    predictedLossValue: 120,
    optInDate: "2025-09-12",
    history: [
      { id: "v1", date: "2026-08-20", service: "Wash & Blowdry", amount: 45, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Chloe! Thanks for visiting us for your blowdry.",
        timestamp: "2026-08-20 16:20",
        status: "read",
        stage: "welcome",
      },
    ],
  },

  // ================= 6. CHURNED (90d) (2) =================
  {
    id: "cust_ch_1",
    name: "David H. Miller",
    phone: "+44 7711 993422",
    countryCode: "+44",
    serviceType: "Beard Sculpt & Cut",
    preferredStaff: "Dave",
    totalVisits: 4,
    totalSpend: 120,
    averageFrequencyDays: 16,
    lastVisitDate: "2026-05-15",
    daysSinceLastVisit: 110,
    status: "churned",
    churnRiskScore: 99,
    predictedLossValue: 30,
    optInDate: "2026-02-12",
    notes: "Reached 90-day cooldown period without booking. Suppressed from automated outreach.",
    history: [
      { id: "v1", date: "2026-05-15", service: "Cut & Beard", amount: 30, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hey David, we miss having you in the chair. Would you like to rebook?",
        timestamp: "2026-06-10 14:00",
        status: "read",
        stage: "stage_1",
      },
      {
        id: "m2",
        sender: "business",
        text: "Hi David, enjoy 15% off your next grooming session with Dave!",
        timestamp: "2026-06-18 10:00",
        status: "delivered",
        stage: "stage_2",
      },
    ],
  },
  {
    id: "cust_ch_2",
    name: "Oliver Queen",
    phone: "+44 7855 009812",
    countryCode: "+44",
    serviceType: "Executive Scalp Therapy",
    preferredStaff: "Sophie",
    totalVisits: 3,
    totalSpend: 210,
    averageFrequencyDays: 28,
    lastVisitDate: "2026-05-08",
    daysSinceLastVisit: 117,
    status: "churned",
    churnRiskScore: 98,
    predictedLossValue: 70,
    optInDate: "2026-01-20",
    notes: "90+ days inactive. Placed in cooldown archive to preserve WhatsApp sender reputation.",
    history: [
      { id: "v1", date: "2026-05-08", service: "Scalp Therapy", amount: 70, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Oliver, it's been a while since your last visit. We'd love to welcome you back!",
        timestamp: "2026-06-15 10:00",
        status: "read",
        stage: "stage_1",
      },
    ],
  },

  // ================= 7. OPTED OUT (2) =================
  {
    id: "cust_opt_1",
    name: "Robert MacIntyre",
    phone: "+44 7900 882311",
    countryCode: "+44",
    serviceType: "Swedish Massage",
    preferredStaff: "Elena",
    totalVisits: 2,
    totalSpend: 160,
    averageFrequencyDays: 30,
    lastVisitDate: "2026-06-02",
    daysSinceLastVisit: 92,
    status: "opted_out",
    churnRiskScore: 0,
    predictedLossValue: 80,
    optInDate: "2026-05-01",
    notes: "Sent STOP on 2026-06-25. Suppressed from all future promotional campaigns.",
    history: [
      { id: "v1", date: "2026-06-02", service: "Deep Swedish Massage", amount: 80, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Robert, thanks for visiting Lumina Luxe today!",
        timestamp: "2026-06-02 17:30",
        status: "read",
        stage: "welcome",
      },
      {
        id: "m2",
        sender: "customer",
        text: "STOP",
        timestamp: "2026-06-25 09:12",
        status: "received",
      },
      {
        id: "m3",
        sender: "business",
        text: "You have been unsubscribed from Lumina Luxe automated messages. No further reminders will be sent.",
        timestamp: "2026-06-25 09:12",
        status: "delivered",
        stage: "opt_out",
      },
    ],
  },
  {
    id: "cust_opt_2",
    name: "Emma Watson",
    phone: "+44 7933 112244",
    countryCode: "+44",
    serviceType: "Root Retouch & Cut",
    preferredStaff: "Chloe",
    totalVisits: 3,
    totalSpend: 195,
    averageFrequencyDays: 28,
    lastVisitDate: "2026-06-08",
    daysSinceLastVisit: 86,
    status: "opted_out",
    churnRiskScore: 0,
    predictedLossValue: 65,
    optInDate: "2026-04-10",
    notes: "Replied STOP to unsubscribe. Compliance block in effect.",
    history: [
      { id: "v1", date: "2026-06-08", service: "Root Retouch", amount: 65, loggedBy: "Counter QR" },
    ],
    messages: [
      {
        id: "m1",
        sender: "business",
        text: "Hi Emma! Thank you for visiting today.",
        timestamp: "2026-06-08 14:10",
        status: "read",
        stage: "welcome",
      },
      {
        id: "m2",
        sender: "customer",
        text: "STOP",
        timestamp: "2026-07-01 10:05",
        status: "received",
      },
      {
        id: "m3",
        sender: "business",
        text: "You have been unsubscribed from Lumina Luxe automated messages. Reply START anytime to opt back in.",
        timestamp: "2026-07-01 10:05",
        status: "delivered",
        stage: "opt_out",
      },
    ],
  },
];

export interface BusinessConfig {
  businessName: string;
  businessSlug: string;
  industryId: string;
  currency: string;
  whatsappReplyNumber: string;
  senderName: string;
  overdueTriggerPercent: number; // e.g. 40%
  stage2DelayDays: number; // e.g. 7 days
  churnCooldownDays: number; // e.g. 90 days
  defaultOffer: string;
  isWhatsAppConnected: boolean;
  webhookSecret: string;
  qrDesignMode: "modern_emerald" | "sleek_dark" | "rose_gold" | "minimal_clean";
  counterCalloutText: string;
}

export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: "Lumina Luxe Hair & Aesthetic Lounge",
  businessSlug: "lumina-luxe",
  industryId: "salon",
  currency: "GBP",
  whatsappReplyNumber: "+44 7700 900450",
  senderName: "Lumina Concierge",
  overdueTriggerPercent: 40,
  stage2DelayDays: 7,
  churnCooldownDays: 90,
  defaultOffer: "15% off your next session",
  isWhatsAppConnected: true,
  webhookSecret: "whsec_live_9f8e7d6c5b4a3z2y1x0w",
  qrDesignMode: "modern_emerald",
  counterCalloutText: "Scan to claim VIP loyalty perks & priority booking in 5 seconds",
};

export const REVENUE_CHART_DATA = [
  { month: "Apr", recovered: 1240, atRiskIdentified: 3200, velocityDays: 6.2 },
  { month: "May", recovered: 1890, atRiskIdentified: 4100, velocityDays: 5.4 },
  { month: "Jun", recovered: 2450, atRiskIdentified: 4800, velocityDays: 4.8 },
  { month: "Jul", recovered: 3120, atRiskIdentified: 5200, velocityDays: 4.1 },
  { month: "Aug", recovered: 3940, atRiskIdentified: 5900, velocityDays: 3.6 },
  { month: "Sep (Proj)", recovered: 4680, atRiskIdentified: 6400, velocityDays: 3.2 },
];
