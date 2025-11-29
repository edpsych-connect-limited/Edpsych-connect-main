/**
 * Integration Interfaces
 * Standardized format for syncing data from any MIS (Management Information System)
 */

export interface MISProvider {
  name: string;
  version: string;
  isConnected: () => Promise<boolean>;
  syncSchools: (laCode: string) => Promise<SyncResult>;
  syncStudents: (schoolId: string) => Promise<SyncResult>;
  syncStaff: (schoolId: string) => Promise<SyncResult>;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  timestamp: Date;
}

export interface ExternalStudent {
  mis_id: string;
  upn: string; // Unique Pupil Number (UK Standard)
  first_name: string;
  last_name: string;
  dob: Date;
  gender: string;
  year_group: string;
  form_group: string;
  sen_status?: string;
  attendance_percentage?: number;
}

export interface ExternalStaff {
  mis_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string; // 'teacher', 'headteacher', 'senco'
}
