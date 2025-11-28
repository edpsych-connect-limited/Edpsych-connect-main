import { logger } from "@/lib/logger";
/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */

// EdPsych Connect World - Database Type Definitions
// Generated: August 29, 2025
// Environment: PRODUCTION
// Compliance: GDPR, ISO 27001, SOC 2

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          date_of_birth: string | null;
          phone: string | null;
          address: string | null;
          emergency_contact: string | null;
          created_at: string;
          updated_at: string;
          anonymized_at: string | null;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          date_of_birth?: string | null;
          phone?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          created_at?: string;
          updated_at?: string;
          anonymized_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          date_of_birth?: string | null;
          phone?: string | null;
          address?: string | null;
          emergency_contact?: string | null;
          created_at?: string;
          updated_at?: string;
          anonymized_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
  gdpr: {
    Tables: {
      consent_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          required: boolean;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          required?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          required?: boolean;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      consent_records: {
        Row: {
          id: string;
          user_id: string;
          consent_type_id: string;
          consented: boolean;
          consent_text: string;
          ip_address: string | null;
          user_agent: string | null;
          consent_method: string;
          consent_timestamp: string;
          withdrawal_timestamp: string | null;
          valid_until: string | null;
          consent_version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type_id: string;
          consented: boolean;
          consent_text: string;
          ip_address?: string | null;
          user_agent?: string | null;
          consent_method?: string;
          consent_timestamp?: string;
          withdrawal_timestamp?: string | null;
          valid_until?: string | null;
          consent_version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type_id?: string;
          consented?: boolean;
          consent_text?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          consent_method?: string;
          consent_timestamp?: string;
          withdrawal_timestamp?: string | null;
          valid_until?: string | null;
          consent_version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      data_subject_requests: {
        Row: {
          id: string;
          user_id: string;
          request_type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal';
          status: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
          request_details: any;
          identity_verification: any;
          submitted_at: string;
          processed_at: string | null;
          completed_at: string | null;
          expires_at: string;
          response_data: any;
          rejection_reason: string | null;
          processed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal';
          status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
          request_details?: any;
          identity_verification?: any;
          submitted_at?: string;
          processed_at?: string | null;
          completed_at?: string | null;
          expires_at?: string;
          response_data?: any;
          rejection_reason?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          request_type?: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal';
          status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
          request_details?: any;
          identity_verification?: any;
          submitted_at?: string;
          processed_at?: string | null;
          completed_at?: string | null;
          expires_at?: string;
          response_data?: any;
          rejection_reason?: string | null;
          processed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values: any;
          new_values: any;
          changed_by: string | null;
          changed_at: string;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
          transaction_id: string | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: string;
          old_values?: any;
          new_values?: any;
          changed_by?: string | null;
          changed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          transaction_id?: string | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: string;
          old_values?: any;
          new_values?: any;
          changed_by?: string | null;
          changed_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          session_id?: string | null;
          transaction_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      export_user_data: {
        Args: { user_uuid: string };
        Returns: any;
      };
      anonymize_user_data: {
        Args: { user_uuid: string };
        Returns: void;
      };
      schedule_data_deletion: {
        Args: Record<string, never>;
        Returns: void;
      };
      execute_scheduled_deletions: {
        Args: Record<string, never>;
        Returns: number;
      };
      daily_maintenance: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Enums: {
      request_status: 'pending' | 'processing' | 'completed' | 'rejected' | 'expired';
      request_type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection' | 'consent_withdrawal';
      breach_severity: 'low' | 'medium' | 'high' | 'critical';
    };
  };
}

// =================================================================
// DATABASE TYPE DEFINITIONS COMPLETE
// =================================================================

/*
DATABASE TYPE DEFINITIONS COMPLETE

This file provides:
- Type-safe database operations
- GDPR compliance schema types
- Supabase client integration
- TypeScript type safety
- Database function signatures

SECURITY FEATURES:
- Type-safe data access
- GDPR compliant schemas
- Audit trail types
- Consent management types

COMPLIANCE FEATURES:
- GDPR data subject request types
- Consent record types
- Audit logging types
- Data export types

Generated: August 29, 2025
Environment: PRODUCTION
Compliance: GDPR, ISO 27001, SOC 2
*/