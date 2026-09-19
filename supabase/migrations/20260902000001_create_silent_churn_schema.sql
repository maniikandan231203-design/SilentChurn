-- =============================================================================
-- SILENT CHURN: PHASE 2 DATABASE MIGRATION
-- Schema: silent_churn
-- Multi-Tenant Architecture with Strict RLS, Automated Triggers, and Indexes
-- =============================================================================

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

-- Updated_at Trigger Function
CREATE OR REPLACE FUNCTION silent_churn.fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON silent_churn.organizations
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

CREATE TRIGGER trg_service_configurations_updated_at
    BEFORE UPDATE ON silent_churn.service_configurations
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

CREATE TRIGGER trg_customers_updated_at
    BEFORE UPDATE ON silent_churn.customers
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

CREATE TRIGGER trg_message_templates_updated_at
    BEFORE UPDATE ON silent_churn.message_templates
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_set_updated_at();

-- -----------------------------------------------------------------------------
-- Customer Visit Metrics & Status Recalculation Trigger
-- Fired whenever a new visit is recorded in silent_churn.visits
-- -----------------------------------------------------------------------------
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
    -- 1. Fetch default cycle from service config or fallback to 28
    SELECT COALESCE(sc.default_cycle_days, 28)
    INTO v_default_cycle
    FROM silent_churn.customers c
    LEFT JOIN silent_churn.service_configurations sc ON sc.id = c.primary_service_id
    WHERE c.id = NEW.customer_id;

    IF v_default_cycle IS NULL THEN
        v_default_cycle := 28;
    END IF;

    -- 2. Fetch current customer status before this update
    SELECT status INTO v_previous_status
    FROM silent_churn.customers
    WHERE id = NEW.customer_id;

    -- 3. Calculate visit metrics
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

    -- 4. Calculate average cycle in days
    IF v_total_visits <= 1 THEN
        v_avg_cycle := v_default_cycle;
    ELSE
        -- Compute average interval between consecutive visits
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

    -- 5. Determine new status:
    -- If customer was in at_risk, stage_1_sent, or stage_2_sent, this visit marks them as 'recovered'
    IF v_previous_status IN ('at_risk', 'stage_1_sent', 'stage_2_sent') THEN
        v_new_status := 'recovered';
    ELSIF v_previous_status = 'opted_out' THEN
        -- Retain opt-out unless customer explicitly texts START
        v_new_status := 'opted_out';
    ELSE
        v_new_status := 'active';
    END IF;

    -- 6. Update Customer Record
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

CREATE TRIGGER trg_recalculate_customer_visit_metrics
    AFTER INSERT OR UPDATE OR DELETE ON silent_churn.visits
    FOR EACH ROW EXECUTE FUNCTION silent_churn.fn_calculate_customer_visit_metrics();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on every table in the silent_churn schema
ALTER TABLE silent_churn.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.service_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE silent_churn.messages_log ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current user is an organization member
CREATE OR REPLACE FUNCTION silent_churn.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow service_role key to bypass all checks
    IF auth.role() = 'service_role' THEN
        RETURN TRUE;
    END IF;

    -- Check if authenticated user belongs to the requested organization
    RETURN EXISTS (
        SELECT 1
        FROM silent_churn.organization_members
        WHERE organization_id = p_org_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- RLS Policies: Organizations
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_select_organization"
    ON silent_churn.organizations
    FOR SELECT
    USING (silent_churn.is_org_member(id));

CREATE POLICY "service_role_all_organizations"
    ON silent_churn.organizations
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Organization Members
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_select_membership"
    ON silent_churn.organization_members
    FOR SELECT
    USING (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_all_organization_members"
    ON silent_churn.organization_members
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Service Configurations
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_service_configs"
    ON silent_churn.service_configurations
    FOR ALL
    USING (silent_churn.is_org_member(organization_id))
    WITH CHECK (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_service_configs"
    ON silent_churn.service_configurations
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Customers
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_customers"
    ON silent_churn.customers
    FOR ALL
    USING (silent_churn.is_org_member(organization_id))
    WITH CHECK (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_customers"
    ON silent_churn.customers
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Visits
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_visits"
    ON silent_churn.visits
    FOR ALL
    USING (silent_churn.is_org_member(organization_id))
    WITH CHECK (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_visits"
    ON silent_churn.visits
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Message Templates
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_message_templates"
    ON silent_churn.message_templates
    FOR ALL
    USING (silent_churn.is_org_member(organization_id))
    WITH CHECK (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_message_templates"
    ON silent_churn.message_templates
    FOR ALL
    USING (auth.role() = 'service_role');

-- -----------------------------------------------------------------------------
-- RLS Policies: Messages Log
-- -----------------------------------------------------------------------------
CREATE POLICY "org_members_messages_log"
    ON silent_churn.messages_log
    FOR ALL
    USING (silent_churn.is_org_member(organization_id))
    WITH CHECK (silent_churn.is_org_member(organization_id));

CREATE POLICY "service_role_messages_log"
    ON silent_churn.messages_log
    FOR ALL
    USING (auth.role() = 'service_role');
