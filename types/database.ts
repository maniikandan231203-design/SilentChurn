export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CustomerStatus =
  | 'active'
  | 'at_risk'
  | 'stage_1_sent'
  | 'stage_2_sent'
  | 'recovered'
  | 'churned'
  | 'opted_out';

export type MessageTemplateType =
  | 'welcome'
  | 'name_request'
  | 'stage_1'
  | 'stage_2_offer'
  | 'opt_out_confirm';

export type VisitLoggedBy = 'qr_self' | 'staff_whatsapp' | 'manual_dashboard';
export type MessageDirection = 'outbound' | 'inbound';
export type MessageDeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface SilentChurnSchema {
  Tables: {
    organizations: {
      Row: {
        id: string;
        name: string;
        industry_type: string;
        currency: string;
        reply_phone_number: string;
        staff_logging_number: string | null;
        whatsapp_phone_number_id: string | null;
        whatsapp_business_account_id: string | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        industry_type: string;
        currency?: string;
        reply_phone_number?: string;
        staff_logging_number?: string | null;
        whatsapp_phone_number_id?: string | null;
        whatsapp_business_account_id?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        industry_type?: string;
        currency?: string;
        reply_phone_number?: string;
        staff_logging_number?: string | null;
        whatsapp_phone_number_id?: string | null;
        whatsapp_business_account_id?: string | null;
        created_at?: string;
        updated_at?: string;
      };
    };
    organization_members: {
      Row: {
        id: string;
        organization_id: string;
        user_id: string;
        role: 'owner' | 'staff';
        created_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        user_id: string;
        role?: 'owner' | 'staff';
        created_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        user_id?: string;
        role?: 'owner' | 'staff';
        created_at?: string;
      };
    };
    service_configurations: {
      Row: {
        id: string;
        organization_id: string;
        service_name: string;
        default_cycle_days: number;
        overdue_threshold_percentage: number;
        stage_2_delay_days: number;
        cooldown_days: number;
        avg_ticket_price: number;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        service_name: string;
        default_cycle_days?: number;
        overdue_threshold_percentage?: number;
        stage_2_delay_days?: number;
        cooldown_days?: number;
        avg_ticket_price?: number;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        service_name?: string;
        default_cycle_days?: number;
        overdue_threshold_percentage?: number;
        stage_2_delay_days?: number;
        cooldown_days?: number;
        avg_ticket_price?: number;
        created_at?: string;
        updated_at?: string;
      };
    };
    customers: {
      Row: {
        id: string;
        organization_id: string;
        name: string;
        phone_number: string;
        primary_service_id: string | null;
        total_visits: number;
        total_spend: number;
        average_cycle_days: number;
        last_visit_at: string | null;
        status: CustomerStatus;
        opted_in: boolean;
        stage_1_sent_at: string | null;
        stage_2_sent_at: string | null;
        churned_at: string | null;
        notes: string | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        name: string;
        phone_number: string;
        primary_service_id?: string | null;
        total_visits?: number;
        total_spend?: number;
        average_cycle_days?: number;
        last_visit_at?: string | null;
        status?: CustomerStatus;
        opted_in?: boolean;
        stage_1_sent_at?: string | null;
        stage_2_sent_at?: string | null;
        churned_at?: string | null;
        notes?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        name?: string;
        phone_number?: string;
        primary_service_id?: string | null;
        total_visits?: number;
        total_spend?: number;
        average_cycle_days?: number;
        last_visit_at?: string | null;
        status?: CustomerStatus;
        opted_in?: boolean;
        stage_1_sent_at?: string | null;
        stage_2_sent_at?: string | null;
        churned_at?: string | null;
        notes?: string | null;
        created_at?: string;
        updated_at?: string;
      };
    };
    visits: {
      Row: {
        id: string;
        organization_id: string;
        customer_id: string;
        visit_date: string;
        spend_amount: number;
        service_name: string | null;
        logged_by: VisitLoggedBy;
        created_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        customer_id: string;
        visit_date?: string;
        spend_amount?: number;
        service_name?: string | null;
        logged_by?: VisitLoggedBy;
        created_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        customer_id?: string;
        visit_date?: string;
        spend_amount?: number;
        service_name?: string | null;
        logged_by?: VisitLoggedBy;
        created_at?: string;
      };
    };
    message_templates: {
      Row: {
        id: string;
        organization_id: string;
        type: MessageTemplateType;
        system_prompt: string | null;
        template_body: string;
        offer_details: string | null;
        call_to_action: string | null;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        type: MessageTemplateType;
        system_prompt?: string | null;
        template_body: string;
        offer_details?: string | null;
        call_to_action?: string | null;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        type?: MessageTemplateType;
        system_prompt?: string | null;
        template_body?: string;
        offer_details?: string | null;
        call_to_action?: string | null;
        is_active?: boolean;
        created_at?: string;
        updated_at?: string;
      };
    };
    messages_log: {
      Row: {
        id: string;
        organization_id: string;
        customer_id: string;
        type: string;
        body: string;
        direction: MessageDirection;
        whatsapp_message_id: string | null;
        status: MessageDeliveryStatus;
        created_at: string;
      };
      Insert: {
        id?: string;
        organization_id: string;
        customer_id: string;
        type: string;
        body: string;
        direction: MessageDirection;
        whatsapp_message_id?: string | null;
        status?: MessageDeliveryStatus;
        created_at?: string;
      };
      Update: {
        id?: string;
        organization_id?: string;
        customer_id?: string;
        type?: string;
        body?: string;
        direction?: MessageDirection;
        whatsapp_message_id?: string | null;
        status?: MessageDeliveryStatus;
        created_at?: string;
      };
    };
  };
}

export interface Database {
  silent_churn: SilentChurnSchema;
  public: SilentChurnSchema;
}

