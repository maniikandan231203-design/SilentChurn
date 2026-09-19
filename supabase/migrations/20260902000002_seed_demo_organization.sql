-- =============================================================================
-- SILENT CHURN: PHASE 2 SEED DATA MIGRATION
-- Organization: Lumina Luxe Hair & Aesthetic Lounge (UUID: e1000000-0000-4000-8000-000000000001)
-- Exactly 2 Customers per Lifecycle Stage (14 total), Service Configs, & Message Templates
-- =============================================================================

-- 1. Insert Demo Organization
INSERT INTO silent_churn.organizations (
    id,
    name,
    industry_type,
    currency,
    reply_phone_number,
    staff_logging_number,
    whatsapp_phone_number_id,
    whatsapp_business_account_id
) VALUES (
    'e1000000-0000-4000-8000-000000000001',
    'Lumina Luxe Hair & Aesthetic Lounge',
    'Salon',
    'GBP',
    '+44 7700 900450',
    '+44 7700 900888',
    'wpa_phone_id_demo_1001',
    'waba_id_demo_1001'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Service Configurations for Lumina Luxe
INSERT INTO silent_churn.service_configurations (
    id,
    organization_id,
    service_name,
    default_cycle_days,
    overdue_threshold_percentage,
    stage_2_delay_days,
    cooldown_days,
    avg_ticket_price
) VALUES 
(
    'b1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000001',
    'Colour, Balayage & Cut',
    35,
    40,
    7,
    90,
    110.00
),
(
    'b1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000001',
    'Gel Nails & Pedicure',
    21,
    40,
    7,
    90,
    55.00
),
(
    'b1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000001',
    'Precision Barbering & Shave',
    14,
    40,
    7,
    90,
    30.00
),
(
    'b1000000-0000-4000-8000-000000000004',
    'e1000000-0000-4000-8000-000000000001',
    'HydraFacial Deluxe',
    30,
    40,
    7,
    90,
    95.00
),
(
    'b1000000-0000-4000-8000-000000000005',
    'e1000000-0000-4000-8000-000000000001',
    'Keratin Smoothing Treatment',
    42,
    40,
    7,
    90,
    125.00
)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Standard Message Templates
INSERT INTO silent_churn.message_templates (
    id,
    organization_id,
    type,
    system_prompt,
    template_body,
    offer_details,
    call_to_action
) VALUES 
(
    'd1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000001',
    'welcome',
    'Friendly counter greeting confirming VIP loyalty club enrolment.',
    'Hi {{name}}! Thank you for visiting {{business_name}} today. We have registered your loyalty profile. You will receive VIP priority booking and exclusive member perks.\n\nReply with STOP anytime to opt out.',
    'VIP Member Status',
    'Save Contact Card'
),
(
    'd1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000001',
    'name_request',
    'Polite prompt asking for customer name after inbound QR scan.',
    'Hey there! Thanks for reaching out to {{business_name}}. To save your loyalty profile and upcoming visit perks, what is your first and last name?',
    NULL,
    'Reply with full name'
),
(
    'd1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000001',
    'stage_1',
    'Conversational rebooking reminder when customer is +40% overdue.',
    'Hey {{name}}, it has been {{days_absent}} days since your last {{service_type}} with us! Life gets busy, but your hair/wellness deserves some TLC.\n\nWould you like us to hold a slot for you this week?',
    NULL,
    'Book My Visit Now'
),
(
    'd1000000-0000-4000-8000-000000000004',
    'e1000000-0000-4000-8000-000000000001',
    'stage_2_offer',
    'Incentive win-back message with special discount voucher.',
    'Hi {{name}}, we would love to see you again at {{business_name}}. To make your return extra sweet, here is {{offer}} for your next booking!\n\nJust show this message or click below to claim.',
    '15% off your next session (Code: WINBACK15)',
    'Claim 15% Voucher'
),
(
    'd1000000-0000-4000-8000-000000000005',
    'e1000000-0000-4000-8000-000000000001',
    'opt_out_confirm',
    'Compliance acknowledgment when STOP is received.',
    'You have been unsubscribed from {{business_name}} automated messages. No further reminders will be sent. Reply START at any time to re-subscribe.',
    NULL,
    'Unsubscribed'
)
ON CONFLICT (organization_id, type) DO UPDATE
SET template_body = EXCLUDED.template_body,
    offer_details = EXCLUDED.offer_details;

-- 4. Insert 14 Seed Customers (Exactly 2 for each lifecycle status)
INSERT INTO silent_churn.customers (
    id, organization_id, name, phone_number, primary_service_id, 
    total_visits, total_spend, average_cycle_days, last_visit_at, 
    status, opted_in, stage_1_sent_at, stage_2_sent_at, notes
) VALUES
-- 1. At Risk (2)
(
    'c1000000-0000-4000-8000-000000000001',
    'e1000000-0000-4000-8000-000000000001',
    'Jessica Taylor',
    '+447833229100',
    'b1000000-0000-4000-8000-000000000002',
    3,
    155.00,
    21,
    NOW() - INTERVAL '32 days',
    'at_risk',
    true,
    NULL,
    NULL,
    'Overdue 21-day cycle by 11 days. Ready for Stage 1 automated reminder.'
),
(
    'c1000000-0000-4000-8000-000000000002',
    'e1000000-0000-4000-8000-000000000001',
    'Ethan Wright',
    '+447711334556',
    'b1000000-0000-4000-8000-000000000003',
    5,
    140.00,
    14,
    NOW() - INTERVAL '22 days',
    'at_risk',
    true,
    NULL,
    NULL,
    'Regular bi-weekly customer, now 8 days overdue standard cycle.'
),

-- 2. Stage 1 Sent (2)
(
    'c1000000-0000-4000-8000-000000000003',
    'e1000000-0000-4000-8000-000000000001',
    'Sarah Jenkins',
    '+447822411099',
    'b1000000-0000-4000-8000-000000000001',
    6,
    480.00,
    32,
    NOW() - INTERVAL '49 days',
    'stage_1_sent',
    true,
    NOW() - INTERVAL '1 day',
    NULL,
    'Friendly Stage 1 reminder dispatched on WhatsApp.'
),
(
    'c1000000-0000-4000-8000-000000000004',
    'e1000000-0000-4000-8000-000000000001',
    'Lucas Bennett',
    '+447922665431',
    'b1000000-0000-4000-8000-000000000003',
    4,
    110.00,
    14,
    NOW() - INTERVAL '24 days',
    'stage_1_sent',
    true,
    NOW() - INTERVAL '2 days',
    NULL,
    'Stage 1 message delivered. Customer checked message.'
),

-- 3. Stage 2 Sent (2)
(
    'c1000000-0000-4000-8000-000000000005',
    'e1000000-0000-4000-8000-000000000001',
    'Liam O''Connor',
    '+447955833211',
    'b1000000-0000-4000-8000-000000000003',
    14,
    420.00,
    14,
    NOW() - INTERVAL '38 days',
    'stage_2_sent',
    true,
    NOW() - INTERVAL '8 days',
    NOW() - INTERVAL '1 day',
    'Stage 2 incentive with 15% VIP discount code active.'
),
(
    'c1000000-0000-4000-8000-000000000006',
    'e1000000-0000-4000-8000-000000000001',
    'Natasha Romanoff',
    '+447811554322',
    'b1000000-0000-4000-8000-000000000005',
    5,
    625.00,
    42,
    NOW() - INTERVAL '62 days',
    'stage_2_sent',
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days',
    'Sent Stage 2 complimentary Olaplex booster incentive.'
),

-- 4. Recovered (2)
(
    'c1000000-0000-4000-8000-000000000007',
    'e1000000-0000-4000-8000-000000000001',
    'Alexandria Vance',
    '+447911234890',
    'b1000000-0000-4000-8000-000000000001',
    9,
    1125.00,
    28,
    NOW() - INTERVAL '1 hour',
    'recovered',
    true,
    NULL,
    NULL,
    'Successfully recovered after 52 days absent with 15% VIP offer.'
),
(
    'c1000000-0000-4000-8000-000000000008',
    'e1000000-0000-4000-8000-000000000001',
    'Daniel Craig',
    '+447711654321',
    'b1000000-0000-4000-8000-000000000003',
    8,
    336.00,
    21,
    NOW() - INTERVAL '3 hours',
    'recovered',
    true,
    NULL,
    NULL,
    'Recovered following Stage 1 reminder, completed visit today.'
),

-- 5. Active (2)
(
    'c1000000-0000-4000-8000-000000000009',
    'e1000000-0000-4000-8000-000000000001',
    'Priya Patel',
    '+447400119844',
    'b1000000-0000-4000-8000-000000000004',
    5,
    475.00,
    30,
    NOW() - INTERVAL '10 days',
    'active',
    true,
    NULL,
    NULL,
    'Regular client, visiting on schedule.'
),
(
    'c1000000-0000-4000-8000-000000000010',
    'e1000000-0000-4000-8000-000000000001',
    'Chloe Chen',
    '+447799441029',
    'b1000000-0000-4000-8000-000000000001',
    7,
    840.00,
    35,
    NOW() - INTERVAL '13 days',
    'active',
    true,
    NULL,
    NULL,
    'Active VIP client.'
),

-- 6. Churned (90d) (2)
(
    'c1000000-0000-4000-8000-000000000011',
    'e1000000-0000-4000-8000-000000000001',
    'David H. Miller',
    '+447711993422',
    'b1000000-0000-4000-8000-000000000003',
    4,
    120.00,
    16,
    NOW() - INTERVAL '110 days',
    'churned',
    true,
    NULL,
    NULL,
    'Reached 90-day cooldown period without booking. Suppressed from automated outreach.'
),
(
    'c1000000-0000-4000-8000-000000000012',
    'e1000000-0000-4000-8000-000000000001',
    'Oliver Queen',
    '+447855009812',
    'b1000000-0000-4000-8000-000000000003',
    3,
    210.00,
    28,
    NOW() - INTERVAL '117 days',
    'churned',
    true,
    NULL,
    NULL,
    '90+ days inactive. Placed in cooldown archive.'
),

-- 7. Opted Out (2)
(
    'c1000000-0000-4000-8000-000000000013',
    'e1000000-0000-4000-8000-000000000001',
    'Robert MacIntyre',
    '+447900882311',
    'b1000000-0000-4000-8000-000000000004',
    2,
    160.00,
    30,
    NOW() - INTERVAL '92 days',
    'opted_out',
    false,
    NULL,
    NULL,
    'Sent STOP on WhatsApp. Suppressed from all future outreach.'
),
(
    'c1000000-0000-4000-8000-000000000014',
    'e1000000-0000-4000-8000-000000000001',
    'Emma Watson',
    '+447933112244',
    'b1000000-0000-4000-8000-000000000001',
    3,
    195.00,
    28,
    NOW() - INTERVAL '86 days',
    'opted_out',
    false,
    NULL,
    NULL,
    'Replied STOP to unsubscribe. Compliance block in effect.'
)
ON CONFLICT (organization_id, phone_number) DO UPDATE
SET status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- 5. Insert Sample Visits for Auditing
INSERT INTO silent_churn.visits (
    organization_id, customer_id, visit_date, spend_amount, service_name, logged_by
) VALUES
(
    'e1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000007',
    NOW() - INTERVAL '1 hour',
    125.00,
    'Colour, Balayage & Cut',
    'staff_whatsapp'
),
(
    'e1000000-0000-4000-8000-000000000001',
    'c1000000-0000-4000-8000-000000000008',
    NOW() - INTERVAL '3 hours',
    42.00,
    'Precision Barbering & Shave',
    'qr_self'
);
