// Court Portal Type Definitions

export type UserRole = 'judge' | 'clerk' | 'admin' | 'citizen';

export type CaseStatus = 
  | 'filed'
  | 'pending_evidence'
  | 'under_trial'
  | 'adjourned'
  | 'arguments_completed'
  | 'reserved_for_judgment'
  | 'disposed'
  | 'dismissed'
  | 'withdrawn';

export type CaseCategory = 
  | 'civil'
  | 'criminal'
  | 'family'
  | 'constitutional'
  | 'consumer'
  | 'labor'
  | 'tax'
  | 'other';

export type CasePriority = 'urgent' | 'high' | 'normal' | 'low';

export type NoticeType = 
  | 'summons'
  | 'warrant'
  | 'adjournment'
  | 'judgment'
  | 'bail_order'
  | 'interim_order'
  | 'final_order';

export type HearingOutcome = 
  | 'completed'
  | 'adjourned'
  | 'dismissed'
  | 'disposed'
  | 'evidence_pending'
  | 'arguments_pending'
  | 'order_reserved';

export interface CourtUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  courtId?: string;
  courtName?: string;
  designation?: string; // District Judge, Civil Judge, etc.
  photoURL?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  permissions: string[];
  isActive: boolean;
}

export interface Case {
  id: string;
  caseNumber: string; // e.g., "CC-123/2026"
  caseType: CaseCategory;
  caseTitle: string; // "State vs John Doe"
  
  // Parties
  petitioner: Party;
  respondent: Party;
  
  // Status & Priority
  status: CaseStatus;
  priority: CasePriority;
  
  // Assignment
  judgeId: string;
  judgeName: string;
  courtId: string;
  courtName: string;
  
  // Dates
  filingDate: Date;
  firstHearingDate?: Date;
  nextHearingDate?: Date;
  lastHearingDate?: Date;
  disposalDate?: Date;
  
  // Case Details
  synopsis: string;
  ipcSections?: string[];
  lawSections?: string[];
  reliefSought?: string;
  
  // Tracking
  totalHearings: number;
  completedHearings: number;
  adjournmentCount: number;
  
  // Documents
  documentIds: string[];
  
  // Metadata
  isConfidential: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  lastModifiedByName?: string; // For display purposes
}

export interface Party {
  name: string;
  type: 'individual' | 'organization' | 'government';
  address: string;
  phone?: string;
  email?: string;
  lawyerId?: string;
  lawyerName?: string;
  lawyerPhone?: string;
  citizenPortalUserId?: string; // Link to citizen portal account
}

export interface Hearing {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  
  // Scheduling
  hearingDate: Date;
  hearingTime: string; // "10:30 AM"
  courtRoomNumber: string;
  
  // Judge & Parties
  judgeId: string;
  judgeName: string;
  partiesPresent: string[];
  lawyersPresent: string[];
  
  // Hearing Details
  purpose: string; // "Arguments", "Evidence", "Final Hearing"
  notes: string;
  orderPassed?: string;
  nextHearingDate?: Date;
  
  // Outcome
  outcome: HearingOutcome;
  isSuccessful: boolean; // Did case progress or just adjourned?
  
  // Documents
  documentsSubmitted: string[];
  orderDocumentId?: string;
  
  // Metadata
  duration?: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
  recordedBy: string;
}

export interface Notice {
  id: string;
  noticeNumber: string;
  noticeType: NoticeType;
  
  // Case Reference
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  
  // Recipient
  recipientName: string;
  recipientAddress: string;
  recipientEmail?: string;
  recipientPhone?: string;
  
  // Content
  subject: string;
  content: string;
  hearingDate?: Date;
  
  // Status
  issuedDate: Date;
  issuedBy: string; // Judge ID
  issuedByName: string;
  
  // Delivery
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
  deliveryDate?: Date;
  deliveryMethod?: 'email' | 'sms' | 'post' | 'hand_delivery';
  
  // E-signature
  isSigned: boolean;
  signedBy?: string;
  signatureId?: string;
  signedAt?: Date;
  
  // Document
  documentUrl?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ESignature {
  id: string;
  documentId: string;
  documentType: 'notice' | 'order' | 'judgment' | 'warrant';
  
  // Signer
  signerId: string;
  signerName: string;
  signerRole: UserRole;
  signerDesignation: string;
  
  // Signature Data
  signatureImageUrl?: string;
  certificateHash: string; // SHA-256 hash for verification
  timestamp: Date;
  
  // Verification
  isVerified: boolean;
  verificationMethod: 'digital_certificate' | 'otp' | 'biometric';
  
  // Metadata
  ipAddress: string;
  deviceInfo: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  
  createdAt: Date;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  caseNumber: string;
  
  // Document Details
  title: string;
  description?: string;
  documentType: 'petition' | 'evidence' | 'order' | 'notice' | 'judgment' | 'other';
  fileUrl: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  
  // Upload Info
  uploadedBy: string;
  uploadedByName: string;
  uploadedByRole: UserRole;
  uploadedAt: Date;
  
  // Signature
  signatures: string[]; // Array of ESignature IDs
  
  // Access Control
  isConfidential: boolean;
  accessibleTo: string[]; // Array of user IDs
  
  // Metadata
  tags: string[];
  version: number;
  previousVersionId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface HearingSuccessMetrics {
  judgeId: string;
  judgeName: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  
  // Metrics
  totalHearings: number;
  successfulHearings: number; // Case progressed
  adjournedHearings: number;
  disposedCases: number;
  
  // Success Rate
  successRate: number; // percentage
  averageHearingsPerCase: number;
  averageDisposalTime: number; // in days
  
  // Categories
  categoriesBreakdown: {
    category: CaseCategory;
    total: number;
    successful: number;
    successRate: number;
  }[];
  
  // Trends
  comparisonWithPrevious?: {
    period: string;
    successRate: number;
    percentageChange: number;
  };
  
  calculatedAt: Date;
}

export interface CourtCalendar {
  id: string;
  date: Date;
  judgeId: string;
  judgeName: string;
  courtRoomNumber: string;
  
  // Scheduled Hearings
  hearings: {
    hearingId: string;
    caseId: string;
    caseNumber: string;
    caseTitle: string;
    time: string;
    duration: number; // estimated in minutes
    status: 'scheduled' | 'in_progress' | 'completed' | 'postponed';
    priority: CasePriority;
  }[];
  
  // Day Summary
  totalCases: number;
  completedCases: number;
  estimatedWorkload: number; // total minutes
  
  // Availability
  isHoliday: boolean;
  isHalfDay: boolean;
  leaveType?: 'casual' | 'medical' | 'official';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  
  // User
  userId: string;
  userName: string;
  userRole: UserRole;
  
  // Action
  action: string; // 'case_created', 'hearing_scheduled', 'notice_issued', etc.
  module: 'cases' | 'hearings' | 'notices' | 'documents' | 'users' | 'settings';
  
  // Details
  entityType: string; // 'case', 'hearing', 'notice', etc.
  entityId: string;
  description: string;
  
  // Changes (for audit)
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  
  // Context
  ipAddress: string;
  deviceInfo: string;
  
  // Data Classification
  isSensitive: boolean;
}

export interface NotificationPreferences {
  userId: string;
  
  // Channels
  enableEmail: boolean;
  enableSMS: boolean;
  enableInApp: boolean;
  
  // Types
  hearingReminders: boolean;
  caseUpdates: boolean;
  documentSubmissions: boolean;
  urgentMatters: boolean;
  
  // Timing
  reminderDaysBefore: number; // Days before hearing
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  
  updatedAt: Date;
}

// Permissions for Role-Based Access Control
export const PERMISSIONS = {
  // Case Management
  CASE_CREATE: 'case:create',
  CASE_VIEW: 'case:view',
  CASE_EDIT: 'case:edit',
  CASE_DELETE: 'case:delete',
  CASE_ASSIGN: 'case:assign',
  
  // Hearing Management
  HEARING_SCHEDULE: 'hearing:schedule',
  HEARING_RECORD: 'hearing:record',
  HEARING_VIEW: 'hearing:view',
  HEARING_EDIT: 'hearing:edit',
  
  // Notice & Orders
  NOTICE_CREATE: 'notice:create',
  NOTICE_SIGN: 'notice:sign',
  NOTICE_SEND: 'notice:send',
  NOTICE_VIEW: 'notice:view',
  
  // Documents
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_SIGN: 'document:sign',
  DOCUMENT_DELETE: 'document:delete',
  
  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics:view',
  REPORTS_GENERATE: 'reports:generate',
  
  // User Management
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  
  // System
  SETTINGS_MANAGE: 'settings:manage',
  AUDIT_LOG_VIEW: 'audit:view',
} as const;

// Role-based default permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  judge: [
    PERMISSIONS.CASE_VIEW,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.CASE_ASSIGN,
    PERMISSIONS.HEARING_SCHEDULE,
    PERMISSIONS.HEARING_RECORD,
    PERMISSIONS.HEARING_VIEW,
    PERMISSIONS.HEARING_EDIT,
    PERMISSIONS.NOTICE_CREATE,
    PERMISSIONS.NOTICE_SIGN,
    PERMISSIONS.NOTICE_SEND,
    PERMISSIONS.NOTICE_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_SIGN,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
  ],
  clerk: [
    PERMISSIONS.CASE_VIEW,
    PERMISSIONS.CASE_CREATE,
    PERMISSIONS.CASE_EDIT,
    PERMISSIONS.HEARING_SCHEDULE,
    PERMISSIONS.HEARING_VIEW,
    PERMISSIONS.NOTICE_CREATE,
    PERMISSIONS.NOTICE_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_VIEW,
  ],
  admin: Object.values(PERMISSIONS),
  citizen: [
    PERMISSIONS.CASE_VIEW,
    PERMISSIONS.HEARING_VIEW,
    PERMISSIONS.NOTICE_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
  ],
};
