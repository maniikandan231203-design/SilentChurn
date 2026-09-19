-- =============================================================================
-- SILENT CHURN: ALL-IN-ONE PRODUCTION DATABASE MIGRATION & SEED
-- Schema: silent_churn
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

BEGIN;

-- 1. Create Dedicated silent_churn Schema
CREATE SCHEMA IF NOT EXISTS silent_churn;

-- Grant schema access to standard Supabase roles
GRANT USAGE ON SCHEMA silent_churn TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA silent_churn GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA silent_churn GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA silent_churn GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. Organizations Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry_type TEXT NOT NULL CHECK (industry_type IN (
        'Salon', 'Barber', 'Café', 'Restaurant', 'Gym', 
        'Spa', 'Clinic', 'Shisha Lounge', 'Hotel'
    )),
    currency TEXT NOT NULL DEFAULT 'GBP',
    reply_phone_number TEXT NOT NULL DEFAULT '+44 7700 900450',
    staff_logging_number TEXT DEFAULT NULL,
    whatsapp_phone_number_id TEXT DEFAULT NULL,
    whatsapp_business_account_id TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Organization Members Table (Multi-Tenant Access Control)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. Service Configurations Table (Retention Thresholds & Cycles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.service_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    default_cycle_days INT NOT NULL DEFAULT 28,
    overdue_threshold_percentage INT NOT NULL DEFAULT 40,
    stage_2_delay_days INT NOT NULL DEFAULT 7,
    cooldown_days INT NOT NULL DEFAULT 90,
    avg_ticket_price NUMERIC(10,2) NOT NULL DEFAULT 65.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. Customers Table (Customer Retention & Lifecycle State)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    primary_service_id UUID REFERENCES silent_churn.service_configurations(id) ON DELETE SET NULL,
    total_visits INT NOT NULL DEFAULT 0,
    total_spend NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    average_cycle_days INT NOT NULL DEFAULT 28,
    last_visit_at TIMESTAMPTZ DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
        'active', 'at_risk', 'stage_1_sent', 'stage_2_sent', 
        'recovered', 'churned', 'opted_out'
    )),
    opted_in BOOLEAN NOT NULL DEFAULT true,
    stage_1_sent_at TIMESTAMPTZ DEFAULT NULL,
    stage_2_sent_at TIMESTAMPTZ DEFAULT NULL,
    churned_at TIMESTAMPTZ DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, phone_number)
);

-- -----------------------------------------------------------------------------
-- 6. Visits Table (Audit Log of Every Registered Visit)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES silent_churn.customers(id) ON DELETE CASCADE,
    visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    spend_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    service_name TEXT DEFAULT NULL,
    logged_by TEXT NOT NULL DEFAULT 'manual_dashboard' CHECK (logged_by IN (
        'qr_self', 'staff_whatsapp', 'manual_dashboard'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. Message Templates Table (Personalized WhatsApp Outreach)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'welcome', 'name_request', 'stage_1', 'stage_2_offer', 'opt_out_confirm'
    )),
    system_prompt TEXT DEFAULT NULL,
    template_body TEXT NOT NULL,
    offer_details TEXT DEFAULT NULL,
    call_to_action TEXT DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, type)
);

-- -----------------------------------------------------------------------------
-- 8. Messages Log Table (Inbound & Outbound Communication Audit)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS silent_churn.messages_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES silent_churn.organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES silent_churn.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    body TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    whatsapp_message_id TEXT DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user ON silent_churn.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_org_status ON silent_churn.customers(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON silent_churn.customers(organization_id, phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON silent_churn.customers(organization_id, last_visit_at);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON silent_churn.visits(customer_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_org ON silent_churn.visits(organization_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_customer ON silent_churn.messages_log(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_org ON silent_churn.messages_log(organization_id, created_at DESC);

-- =============================================================================
-- AUTOMATED TRIGGERS & RECALCULATION FUNCTIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION silent_churn.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON silent_churn.organizations;
CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON silent_churn.organizations
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_service_configurations_updated_at ON silent_churn.service_configurations;
CREATE TRIGGER trg_service_configurations_updated_at
    BEFORE UPDATE ON silent_churn.service_configurations
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON silent_churn.customers;
CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON silent_churn.customers
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_message_templates_updated_at ON silent_churn.message_templates;
CREATE TRIGGER trg_message_templates_updated_at
    BEFORE UPDATE ON silent_churn.message_templates
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

-- Customer Visit Metrics & Status Recalculation Trigger
CREATE OR REPLACE FUNCTION silent_churn.fn_calculate_customer_visit_metrics()
RETURNS TRIGGER AS $$
DECLARE
    v_total_visits INT;
    v_total_spend NUMERIC(10,2);
    v_last_visit TIMESTAMPTZ;
    v_avg_cycle INT;
    v_default_cycle INT;
    v_previous_status TEXT;
    v_new_status TEXT;
BEGIN
    SELECT COALESCE(sc.default_cycle_days, 28)
    INTO v_default_cycle
    FROM silent_churn.customers c
    LEFT JOIN silent_churn.service_configurations sc ON sc.id = c.primary_service_id
    WHERE c.id = NEW.customer_id;

    IF v_default_cycle IS NULL THEN
        v_default_cycle := 28;
    END IF;

    SELECT status INTO v_previous_status
    FROM silent_churn.customers
    WHERE id = NEW.customer_id;

    SELECT 
        COUNT(*),
        COALESCE(SUM(spend_amount), 0.00),
        MAX(visit_date)
    INTO 
        v_total_visits,
        v_total_spend,
        v_last_visit
    FROM silent_churn.visits
    WHERE customer_id = NEW.customer_id;

    IF v_total_visits <= 1 THEN
        v_avg_cycle := v_default_cycle;
    ELSE
        WITH ordered_visits AS (
            SELECT 
                visit_date,
                LAG(visit_date) OVER (ORDER BY visit_date ASC) AS prev_visit
            FROM silent_churn.visits
            WHERE customer_id = NEW.customer_id
        ),
        diffs AS (
            SELECT EXTRACT(DAY FROM (visit_date - prev_visit)) AS diff_days
            FROM ordered_visits
            WHERE prev_visit IS NOT NULL
        )
        SELECT COALESCE(ROUND(AVG(diff_days)), v_default_cycle)::INT
        INTO v_avg_cycle
        FROM diffs;

        IF v_avg_cycle < 1 THEN
            v_avg_cycle := v_default_cycle;
        END IF;
    END IF;

    IF v_previous_status IN ('at_risk', 'stage_1_sent', 'stage_2_sent') THEN
        v_new_status := 'recovered';
    ELSIF v_previous_status = 'opted_out' THEN
        v_new_status := 'opted_out';
    ELSE
        v_new_status := 'active';
    END IF;

    UPDATE silent_churn.customers
    SET 
        total_visits = v_total_visits,
        total_spend = v_total_spend,
        last_visit_at = v_last_visit,
        average_cycle_days = v_avg_cycle,
        status = v_new_status,
        stage_1_sent_at = NULL,
        stage_2_sent_at = NULL,
        churned_at = NULL,
        updated_at = NOW()
    WHERE id = NEW.customer_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_customer_visit_metrics ON silent_churn.visits;
CREATE TRIGGER trg_recalculate_customer_visit_metrics
    AFTER INSERT OR UPDATE OR DELETE ON silent_churn.visits
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_calculate_customer_visit_metrics();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

ALTER TABLE silent_churn.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.service_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.messages_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION silent_churn.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF auth.role() = 'service_role' THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM silent_churn.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations Policies
DROP POLICY IF EXISTS "org_members_select_organization" ON silent_churn.organizations;
CREATE POLICY "org_members_select_organization" ON silent_churn.organizations FOR SELECT USING (silent_churn.is_org_member(id));

DROP POLICY IF EXISTS "service_role_all_organizations" ON silent_churn.organizations;
CREATE POLICY "service_role_all_organizations" ON silent_churn.organizations FOR ALL USING (auth.role() = 'service_role');

-- Organization Members Policies
DROP POLICY IF EXISTS "org_members_select_membership" ON silent_churn.organization_members;
CREATE POLICY "org_members_select_membership" ON silent_churn.organization_members FOR SELECT USING (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_all_organization_members" ON silent_churn.organization_members;
CREATE POLICY "service_role_all_organization_members" ON silent_churn.organization_members FOR ALL USING (auth.role() = 'service_role');

-- Service Configurations Policies
DROP POLICY IF EXISTS "org_members_service_configs" ON silent_churn.service_configurations;
CREATE POLICY "org_members_service_configs" ON silent_churn.service_configurations FOR ALL USING (silent_churn.is_org_member(organization_id)) WITH CHECK (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_service_configs" ON silent_churn.service_configurations;
CREATE POLICY "service_role_service_configs" ON silent_churn.service_configurations FOR ALL USING (auth.role() = 'service_role');

-- Customers Policies
DROP POLICY IF EXISTS "org_members_customers" ON silent_churn.customers;
CREATE POLICY "org_members_customers" ON silent_churn.customers FOR ALL USING (silent_churn.is_org_member(organization_id)) WITH CHECK (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_customers" ON silent_churn.customers;
CREATE POLICY "service_role_customers" ON silent_churn.customers FOR ALL USING (auth.role() = 'service_role');

-- Visits Policies
DROP POLICY IF EXISTS "org_members_visits" ON silent_churn.visits;
CREATE POLICY "org_members_visits" ON silent_churn.visits FOR ALL USING (silent_churn.is_org_member(organization_id)) WITH CHECK (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_visits" ON silent_churn.visits;
CREATE POLICY "service_role_visits" ON silent_churn.visits FOR ALL USING (auth.role() = 'service_role');

-- Message Templates Policies
DROP POLICY IF EXISTS "org_members_message_templates" ON silent_churn.message_templates;
CREATE POLICY "org_members_message_templates" ON silent_churn.message_templates FOR ALL USING (silent_churn.is_org_member(organization_id)) WITH CHECK (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_message_templates" ON silent_churn.message_templates;
CREATE POLICY "service_role_message_templates" ON silent_churn.message_templates FOR ALL USING (auth.role() = 'service_role');

-- Messages Log Policies
DROP POLICY IF EXISTS "org_members_messages_log" ON silent_churn.messages_log;
CREATE POLICY "org_members_messages_log" ON silent_churn.messages_log FOR ALL USING (silent_churn.is_org_member(organization_id)) WITH CHECK (silent_churn.is_org_member(organization_id));

DROP POLICY IF EXISTS "service_role_messages_log" ON silent_churn.messages_log;
CREATE POLICY "service_role_messages_log" ON silent_churn.messages_log FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- SEED DATA: DEMO ORGANIZATION & 14 CUSTOMERS
-- =============================================================================

INSERT INTO silent_churn.organizations (
    id, name, industry_type, currency, reply_phone_number, staff_logging_number, whatsapp_phone_number_id, whatsapp_business_account_id
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

INSERT INTO silent_churn.service_configurations (
    id, organization_id, service_name, default_cycle_days, overdue_threshold_percentage, stage_2_delay_days, cooldown_days, avg_ticket_price
) VALUES 
('b1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'Colour, Balayage & Cut', 35, 40, 7, 90, 110.00),
('b1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000001', 'Gel Nails & Pedicure', 21, 40, 7, 90, 55.00),
('b1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000001', 'Precision Barbering & Shave', 14, 40, 7, 90, 30.00),
('b1000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000001', 'HydraFacial Deluxe', 30, 40, 7, 90, 95.00),
('b1000000-0000-4000-8000-000000000005', 'e1000000-0000-4000-8000-000000000001', 'Keratin Smoothing Treatment', 42, 40, 7, 90, 125.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO silent_churn.message_templates (
    id, organization_id, type, system_prompt, template_body, offer_details, call_to_action
) VALUES 
('d1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'welcome', 'Friendly counter greeting confirming VIP loyalty club enrolment.', 'Hi {{name}}! Thank you for visiting {{business_name}} today. We have registered your loyalty profile. You will receive VIP priority booking and exclusive member perks.\n\nReply with STOP anytime to opt out.', 'VIP Member Status', 'Save Contact Card'),
('d1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000001', 'name_request', 'Polite prompt asking for customer name after inbound QR scan.', 'Hey there! Thanks for reaching out to {{business_name}}. To save your loyalty profile and upcoming visit perks, what is your first and last name?', NULL, 'Reply with full name'),
('d1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000001', 'stage_1', 'Conversational rebooking reminder when customer is +40% overdue.', 'Hey {{name}}, it has been {{days_absent}} days since your last {{service_type}} with us! Life gets busy, but your hair/wellness deserves some TLC.\n\nWould you like us to hold a slot for you this week?', NULL, 'Book My Visit Now'),
('d1000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000001', 'stage_2_offer', 'Incentive win-back message with special discount voucher.', 'Hi {{name}}, we would love to see you again at {{business_name}}. To make your return extra sweet, here is {{offer}} for your next booking!\n\nJust show this message or click below to claim.', '15% off your next session (Code: WINBACK15)', 'Claim 15% Voucher'),
('d1000000-0000-4000-8000-000000000005', 'e1000000-0000-4000-8000-000000000001', 'opt_out_confirm', 'Compliance acknowledgment when STOP is received.', 'You have been unsubscribed from {{business_name}} automated messages. No further reminders will be sent. Reply START at any time to re-subscribe.', NULL, 'Unsubscribed')
ON CONFLICT (organization_id, type) DO UPDATE
SET template_body = EXCLUDED.template_body, offer_details = EXCLUDED.offer_details;

INSERT INTO silent_churn.customers (
    id, organization_id, name, phone_number, primary_service_id, 
    total_visits, total_spend, average_cycle_days, last_visit_at, 
    status, opted_in, notes
) VALUES
-- At Risk (2)
('c1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'Jessica Taylor', '+447833229100', 'b1000000-0000-4000-8000-000000000002', 3, 155.00, 21, NOW() - INTERVAL '32 days', 'at_risk', true, 'Overdue 21-day cycle by 11 days.'),
('c1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000001', 'Ethan Wright', '+447711334556', 'b1000000-0000-4000-8000-000000000003', 5, 140.00, 14, NOW() - INTERVAL '22 days', 'at_risk', true, 'Regular bi-weekly customer, now 8 days overdue.'),

-- Stage 1 Sent (2)
('c1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000001', 'Sarah Jenkins', '+447822411099', 'b1000000-0000-4000-8000-000000000001', 6, 480.00, 32, NOW() - INTERVAL '49 days', 'stage_1_sent', true, 'Stage 1 friendly reminder sent.'),
('c1000000-0000-4000-8000-000000000004', 'e1000000-0000-4000-8000-000000000001', 'Lucas Bennett', '+447922665431', 'b1000000-0000-4000-8000-000000000003', 4, 110.00, 14, NOW() - INTERVAL '24 days', 'stage_1_sent', true, 'Stage 1 delivered.'),

-- Stage 2 Sent (2)
('c1000000-0000-4000-8000-000000000005', 'e1000000-0000-4000-8000-000000000001', 'Liam O''Connor', '+447955833211', 'b1000000-0000-4000-8000-000000000003', 14, 420.00, 14, NOW() - INTERVAL '38 days', 'stage_2_sent', true, '15% VIP code sent.'),
('c1000000-0000-4000-8000-000000000006', 'e1000000-0000-4000-8000-000000000001', 'Natasha Romanoff', '+447811554322', 'b1000000-0000-4000-8000-000000000005', 5, 625.00, 42, NOW() - INTERVAL '62 days', 'stage_2_sent', true, 'Olaplex booster incentive sent.'),

-- Recovered (2)
('c1000000-0000-4000-8000-000000000007', 'e1000000-0000-4000-8000-000000000001', 'Alexandria Vance', '+447911234890', 'b1000000-0000-4000-8000-000000000001', 9, 1125.00, 28, NOW() - INTERVAL '1 hour', 'recovered', true, 'Recovered after 52 days absent.'),
('c1000000-0000-4000-8000-000000000008', 'e1000000-0000-4000-8000-000000000001', 'Daniel Craig', '+447711654321', 'b1000000-0000-4000-8000-000000000003', 8, 336.00, 21, NOW() - INTERVAL '3 hours', 'recovered', true, 'Completed visit today.'),

-- Active (2)
('c1000000-0000-4000-8000-000000000009', 'e1000000-0000-4000-8000-000000000001', 'Priya Patel', '+447400119844', 'b1000000-0000-4000-8000-000000000004', 5, 475.00, 30, NOW() - INTERVAL '10 days', 'active', true, 'Regular schedule.'),
('c1000000-0000-4000-8000-000000000010', 'e1000000-0000-4000-8000-000000000001', 'Chloe Chen', '+447799441029', 'b1000000-0000-4000-8000-000000000001', 7, 840.00, 35, NOW() - INTERVAL '13 days', 'active', true, 'VIP active.'),

-- Churned (90d) (2)
('c1000000-0000-4000-8000-000000000011', 'e1000000-0000-4000-8000-000000000001', 'David H. Miller', '+447711993422', 'b1000000-0000-4000-8000-000000000003', 4, 120.00, 16, NOW() - INTERVAL '110 days', 'churned', true, '90d cooldown active.'),
('c1000000-0000-4000-8000-000000000012', 'e1000000-0000-4000-8000-000000000001', 'Oliver Queen', '+447855009812', 'b1000000-0000-4000-8000-000000000003', 3, 210.00, 28, NOW() - INTERVAL '117 days', 'churned', true, 'Suppressed from outreach.'),

-- Opted Out (2)
('c1000000-0000-4000-8000-000000000013', 'e1000000-0000-4000-8000-000000000001', 'Robert MacIntyre', '+447900882311', 'b1000000-0000-4000-8000-000000000004', 2, 160.00, 30, NOW() - INTERVAL '92 days', 'opted_out', false, 'Sent STOP on WhatsApp.'),
('c1000000-0000-4000-8000-000000000014', 'e1000000-0000-4000-8000-000000000001', 'Emma Watson', '+447933112244', 'b1000000-0000-4000-8000-000000000001', 3, 195.00, 28, NOW() - INTERVAL '86 days', 'opted_out', false, 'Replied STOP.')
ON CONFLICT (organization_id, phone_number) DO UPDATE
SET status = EXCLUDED.status, notes = EXCLUDED.notes;

COMMIT;
