// Bidirectional Sync Service between Court Portal and Citizen Portal

import { Case, CaseStatus, Hearing } from '../types/court';

export interface CitizenCaseUpdate {
  caseId: string;
  caseNumber: string;
  status: CaseStatus;
  nextHearingDate?: Date;
  lastUpdate: Date;
  updateMessage: string;
}

export interface CourtToPortalSync {
  type: 'status_update' | 'hearing_scheduled' | 'notice_issued' | 'order_passed' | 'judgment_delivered';
  caseId: string;
  caseNumber: string;
  citizenUserId: string;
  data: any;
  timestamp: Date;
}

export interface PortalToCourtSync {
  type: 'document_submitted' | 'application_filed' | 'query_raised';
  caseId: string;
  caseNumber: string;
  citizenUserId: string;
  data: any;
  timestamp: Date;
}

/**
 * Sync case status update to citizen portal
 */
export const syncCaseStatusToCitizen = async (
  caseData: Case,
  citizenUserId: string
): Promise<boolean> => {
  try {
    const update: CourtToPortalSync = {
      type: 'status_update',
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      citizenUserId,
      data: {
        status: caseData.status,
        statusLabel: getStatusLabel(caseData.status),
        nextHearingDate: caseData.nextHearingDate,
        lastHearingDate: caseData.lastHearingDate,
        progress: {
          completedHearings: caseData.completedHearings,
          totalHearings: caseData.totalHearings,
          percentage: (caseData.completedHearings / caseData.totalHearings) * 100,
        },
      },
      timestamp: new Date(),
    };

    // Send to backend API
    const response = await fetch('/api/sync/court-to-citizen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to sync to citizen portal');
    }

    // Send notification to citizen
    await sendNotificationToCitizen(citizenUserId, {
      title: 'Case Status Updated',
      message: `Your case ${caseData.caseNumber} status has been updated to: ${getStatusLabel(caseData.status)}`,
      caseNumber: caseData.caseNumber,
      type: 'status_update',
    });

    console.log('✅ Synced case status to citizen portal:', caseData.caseNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to sync case status:', error);
    return false;
  }
};

/**
 * Sync hearing schedule to citizen portal
 */
export const syncHearingScheduleToCitizen = async (
  hearing: Hearing,
  citizenUserId: string
): Promise<boolean> => {
  try {
    const update: CourtToPortalSync = {
      type: 'hearing_scheduled',
      caseId: hearing.caseId,
      caseNumber: hearing.caseNumber,
      citizenUserId,
      data: {
        hearingDate: hearing.hearingDate,
        hearingTime: hearing.hearingTime,
        courtRoomNumber: hearing.courtRoomNumber,
        judgeName: hearing.judgeName,
        purpose: hearing.purpose,
      },
      timestamp: new Date(),
    };

    const response = await fetch('/api/sync/court-to-citizen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to sync hearing schedule');
    }

    // Send notification
    await sendNotificationToCitizen(citizenUserId, {
      title: 'Hearing Scheduled',
      message: `Next hearing for case ${hearing.caseNumber} scheduled on ${new Date(hearing.hearingDate).toLocaleDateString('en-IN')} at ${hearing.hearingTime}`,
      caseNumber: hearing.caseNumber,
      type: 'hearing_scheduled',
    });

    // Send SMS/Email reminder
    await sendHearingReminder(citizenUserId, hearing);

    console.log('✅ Synced hearing schedule to citizen portal:', hearing.caseNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to sync hearing schedule:', error);
    return false;
  }
};

/**
 * Sync notice issued to citizen portal
 */
export const syncNoticeIssuedToCitizen = async (
  noticeId: string,
  caseNumber: string,
  citizenUserId: string,
  noticeType: string
): Promise<boolean> => {
  try {
    const update: CourtToPortalSync = {
      type: 'notice_issued',
      caseId: noticeId,
      caseNumber,
      citizenUserId,
      data: {
        noticeType,
        issuedDate: new Date(),
      },
      timestamp: new Date(),
    };

    const response = await fetch('/api/sync/court-to-citizen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to sync notice');
    }

    await sendNotificationToCitizen(citizenUserId, {
      title: 'Notice Issued',
      message: `A ${noticeType} has been issued for case ${caseNumber}. Please check your portal for details.`,
      caseNumber,
      type: 'notice_issued',
    });

    console.log('✅ Synced notice to citizen portal:', caseNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to sync notice:', error);
    return false;
  }
};

/**
 * Sync order/judgment to citizen portal
 */
export const syncOrderToCitizen = async (
  caseData: Case,
  orderDetails: string,
  citizenUserId: string
): Promise<boolean> => {
  try {
    const update: CourtToPortalSync = {
      type: 'order_passed',
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      citizenUserId,
      data: {
        orderDetails,
        orderDate: new Date(),
        status: caseData.status,
      },
      timestamp: new Date(),
    };

    const response = await fetch('/api/sync/court-to-citizen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error('Failed to sync order');
    }

    await sendNotificationToCitizen(citizenUserId, {
      title: 'Order Passed',
      message: `An order has been passed in case ${caseData.caseNumber}. View details in your portal.`,
      caseNumber: caseData.caseNumber,
      type: 'order_passed',
    });

    console.log('✅ Synced order to citizen portal:', caseData.caseNumber);
    return true;
  } catch (error) {
    console.error('❌ Failed to sync order:', error);
    return false;
  }
};

/**
 * Receive document submission from citizen portal
 */
export const receiveDocumentFromCitizen = async (
  sync: PortalToCourtSync
): Promise<boolean> => {
  try {
    console.log('📥 Document received from citizen portal:', sync);
    
    // Process document submission
    // Update case with new document
    // Notify judge/clerk
    
    return true;
  } catch (error) {
    console.error('❌ Failed to receive document:', error);
    return false;
  }
};

/**
 * Receive application from citizen portal
 */
export const receiveApplicationFromCitizen = async (
  sync: PortalToCourtSync
): Promise<boolean> => {
  try {
    console.log('📥 Application received from citizen portal:', sync);
    
    // Process application
    // Create case entry or update existing case
    // Notify judge for review
    
    return true;
  } catch (error) {
    console.error('❌ Failed to receive application:', error);
    return false;
  }
};

/**
 * Send notification to citizen
 */
const sendNotificationToCitizen = async (
  citizenUserId: string,
  notification: {
    title: string;
    message: string;
    caseNumber: string;
    type: string;
  }
): Promise<void> => {
  try {
    // Send in-app notification
    await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: citizenUserId,
        ...notification,
      }),
    });

    console.log('✅ Notification sent to citizen:', notification.title);
  } catch (error) {
    console.error('❌ Failed to send notification:', error);
  }
};

/**
 * Send SMS/Email hearing reminder
 */
const sendHearingReminder = async (
  citizenUserId: string,
  hearing: Hearing
): Promise<void> => {
  try {
    // Send SMS
    await fetch('/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: citizenUserId,
        message: `Reminder: Your hearing for case ${hearing.caseNumber} is scheduled on ${new Date(hearing.hearingDate).toLocaleDateString('en-IN')} at ${hearing.hearingTime}. Courtroom: ${hearing.courtRoomNumber}`,
      }),
    });

    // Send Email
    await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: citizenUserId,
        subject: `Hearing Reminder - Case ${hearing.caseNumber}`,
        body: `Dear Citizen,\n\nThis is to remind you that your hearing for case ${hearing.caseNumber} is scheduled on:\n\nDate: ${new Date(hearing.hearingDate).toLocaleDateString('en-IN')}\nTime: ${hearing.hearingTime}\nCourtroom: ${hearing.courtRoomNumber}\nJudge: ${hearing.judgeName}\n\nPlease arrive at the court 30 minutes before the scheduled time.\n\nRegards,\nNyay Saathi`,
      }),
    });

    console.log('✅ Hearing reminder sent');
  } catch (error) {
    console.error('❌ Failed to send hearing reminder:', error);
  }
};

/**
 * Get user-friendly status label
 */
const getStatusLabel = (status: CaseStatus): string => {
  const labels: Record<CaseStatus, string> = {
    filed: 'Filed',
    pending_evidence: 'Pending Evidence',
    under_trial: 'Under Trial',
    adjourned: 'Adjourned',
    arguments_completed: 'Arguments Completed',
    reserved_for_judgment: 'Reserved for Judgment',
    disposed: 'Disposed',
    dismissed: 'Dismissed',
    withdrawn: 'Withdrawn',
  };
  return labels[status];
};

/**
 * Sync all updates for a case
 */
export const syncAllCaseUpdates = async (
  caseData: Case,
  citizenUserId: string
): Promise<void> => {
  await syncCaseStatusToCitizen(caseData, citizenUserId);
  
  if (caseData.nextHearingDate) {
    // Create hearing object
    const hearing: Hearing = {
      id: `hearing-${Date.now()}`,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      caseTitle: caseData.caseTitle,
      hearingDate: caseData.nextHearingDate,
      hearingTime: '10:30 AM',
      courtRoomNumber: '1',
      judgeId: caseData.judgeId,
      judgeName: caseData.judgeName,
      partiesPresent: [],
      lawyersPresent: [],
      purpose: 'Regular Hearing',
      notes: '',
      outcome: 'completed',
      isSuccessful: true,
      documentsSubmitted: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      recordedBy: caseData.judgeId,
    };
    
    await syncHearingScheduleToCitizen(hearing, citizenUserId);
  }
};
