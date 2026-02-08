import { migrateCasesToFirestore } from '../services/casesService';
import { Case } from '../types/court';

/**
 * Mock cases to seed Firestore with sample data
 * These are the sample court cases that will be synchronized between portals
 */
export const MOCK_COURT_CASES: Omit<Case, 'id'>[] = [
  {
    caseNumber: 'CC-DLI-12345/2026',
    caseType: 'criminal',
    caseTitle: 'State vs Rajesh Kumar',
    petitioner: {
      name: 'State of Delhi',
      type: 'government',
      address: 'Delhi High Court, New Delhi',
    },
    respondent: {
      name: 'Rajesh Kumar',
      type: 'individual',
      address: 'Dwarka, New Delhi',
      lawyerName: 'Adv. Sharma',
      citizenPortalUserId: 'citizen-123',
    },
    status: 'under_trial',
    priority: 'high',
    judgeId: 'judge-001',
    judgeName: 'Hon. Justice D. Singh',
    courtId: 'court-dhi-001',
    courtName: 'Delhi High Court',
    filingDate: new Date('2026-01-15'),
    nextHearingDate: new Date('2026-02-10'),
    lastHearingDate: new Date('2026-01-25'),
    synopsis: 'Case of assault under IPC Section 323. Victim sustained injuries. Medical evidence submitted.',
    ipcSections: ['323', '506'],
    totalHearings: 3,
    completedHearings: 2,
    adjournmentCount: 1,
    documentIds: ['doc1', 'doc2', 'doc3'],
    isConfidential: false,
    tags: ['assault', 'medical-evidence'],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-25'),
    createdBy: 'clerk-001',
    lastModifiedBy: 'judge-001',
  },
  {
    caseNumber: 'CV-DLI-45678/2026',
    caseType: 'civil',
    caseTitle: 'Ram Sharma vs XYZ Builder Ltd',
    petitioner: {
      name: 'Ram Sharma',
      type: 'individual',
      address: 'Rohini, Delhi',
      lawyerName: 'Adv. Verma',
      citizenPortalUserId: 'citizen-456',
    },
    respondent: {
      name: 'XYZ Builder Ltd',
      type: 'organization',
      address: 'Connaught Place, Delhi',
      lawyerName: 'Adv. Malhotra',
    },
    status: 'pending_evidence',
    priority: 'normal',
    judgeId: 'judge-002',
    judgeName: 'Hon. Justice S. Kumar',
    courtId: 'court-dhi-001',
    courtName: 'Delhi High Court',
    filingDate: new Date('2025-12-01'),
    nextHearingDate: new Date('2026-02-15'),
    lastHearingDate: new Date('2026-01-20'),
    synopsis: 'Property dispute regarding delayed possession. Builder failed to deliver apartment on promised date.',
    reliefSought: 'Compensation of Rs. 10,00,000 + possession',
    totalHearings: 5,
    completedHearings: 4,
    adjournmentCount: 2,
    documentIds: ['doc4', 'doc5'],
    isConfidential: false,
    tags: ['property', 'consumer'],
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2026-01-20'),
    createdBy: 'clerk-002',
    lastModifiedBy: 'judge-002',
  },
  {
    caseNumber: 'FM-DLI-99001/2026',
    caseType: 'family',
    caseTitle: 'Priya Gupta vs Amit Gupta',
    petitioner: {
      name: 'Priya Gupta',
      type: 'individual',
      address: 'Mayur Vihar, Delhi',
      lawyerName: 'Adv. Mehra',
      citizenPortalUserId: 'citizen-789',
    },
    respondent: {
      name: 'Amit Gupta',
      type: 'individual',
      address: 'Laxmi Nagar, Delhi',
      lawyerName: 'Adv. Kapoor',
    },
    status: 'adjourned',
    priority: 'urgent',
    judgeId: 'judge-003',
    judgeName: 'Hon. Justice P. Sharma',
    courtId: 'court-dhi-001',
    courtName: 'Delhi High Court',
    filingDate: new Date('2026-01-10'),
    nextHearingDate: new Date('2026-02-05'),
    lastHearingDate: new Date('2026-01-28'),
    synopsis: 'Divorce petition citing cruelty and desertion. Counseling sessions ongoing.',
    totalHearings: 2,
    completedHearings: 1,
    adjournmentCount: 3,
    documentIds: ['doc6'],
    isConfidential: true,
    tags: ['divorce', 'mediation'],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-28'),
    createdBy: 'clerk-001',
    lastModifiedBy: 'judge-003',
  },
  {
    caseNumber: 'CC-DLI-56789/2025',
    caseType: 'criminal',
    caseTitle: 'Govt of India vs ABC Ltd',
    petitioner: {
      name: 'Central Bureau of Investigation',
      type: 'government',
      address: 'New Delhi',
      lawyerName: 'Adv. Raj Singh',
    },
    respondent: {
      name: 'ABC Ltd',
      type: 'organization',
      address: 'Mumbai',
      lawyerName: 'Adv. Kapoor',
      citizenPortalUserId: 'citizen-999',
    },
    status: 'arguments_completed',
    priority: 'high',
    judgeId: 'judge-001',
    judgeName: 'Hon. Justice D. Singh',
    courtId: 'court-dhi-001',
    courtName: 'Delhi High Court',
    filingDate: new Date('2025-09-15'),
    nextHearingDate: new Date('2026-03-01'),
    lastHearingDate: new Date('2026-01-28'),
    synopsis: 'White collar crime case involving financial fraud and embezzlement. CBI chargesheet filed.',
    ipcSections: ['420', '406', '471'],
    totalHearings: 8,
    completedHearings: 8,
    adjournmentCount: 1,
    documentIds: ['doc7', 'doc8', 'doc9', 'doc10'],
    isConfidential: false,
    tags: ['fraud', 'cbi', 'financial-crime'],
    createdAt: new Date('2025-09-15'),
    updatedAt: new Date('2026-01-28'),
    createdBy: 'clerk-003',
    lastModifiedBy: 'judge-001',
  },
  {
    caseNumber: 'CV-DLI-23456/2025',
    caseType: 'civil',
    caseTitle: 'Delhi Metro Rail Corporation vs M/s Construction Co.',
    petitioner: {
      name: 'Delhi Metro Rail Corporation',
      type: 'government',
      address: 'New Delhi',
      lawyerName: 'Adv. Bansal',
    },
    respondent: {
      name: 'M/s Construction Co.',
      type: 'organization',
      address: 'Faridabad',
      lawyerName: 'Adv. Gupta',
    },
    status: 'reserved_for_judgment',
    priority: 'normal',
    judgeId: 'judge-002',
    judgeName: 'Hon. Justice S. Kumar',
    courtId: 'court-dhi-001',
    courtName: 'Delhi High Court',
    filingDate: new Date('2025-06-20'),
    nextHearingDate: new Date('2026-04-15'),
    lastHearingDate: new Date('2026-01-22'),
    synopsis: 'Construction contract dispute for metro line extension project. Completion delay penalties claimed.',
    reliefSought: 'Penalty damages of Rs. 50 crore',
    totalHearings: 12,
    completedHearings: 12,
    adjournmentCount: 0,
    documentIds: ['doc11', 'doc12', 'doc13'],
    isConfidential: false,
    tags: ['construction', 'contract', 'infrastructure'],
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2026-01-22'),
    createdBy: 'clerk-002',
    lastModifiedBy: 'judge-002',
  },
];

/**
 * Initialize Firestore with mock cases (one-time setup)
 */
export const initializeFirestoreWithMockCases = async (
  userId: string,
  userName: string = 'System Admin'
): Promise<boolean> => {
  try {
    console.log('Starting Firestore migration with mock cases...');
    
    // Add IDs to cases
    const casesWithIds = MOCK_COURT_CASES.map((caseData, index) => ({
      id: caseData.caseNumber || `case-${index}`,
      ...caseData,
    }));

    await migrateCasesToFirestore(casesWithIds, userId, userName);
    console.log('Successfully migrated mock cases to Firestore');
    return true;
  } catch (error) {
    console.error('Error initializing Firestore with mock cases:', error);
    return false;
  }
};

/**
 * Get sample case for documentation/testing
 */
export const getSampleCase = (): Case => ({
  id: '1',
  caseNumber: 'SAMPLE-001/2026',
  caseType: 'civil',
  caseTitle: 'Sample Case for Documentation',
  petitioner: {
    name: 'Sample Petitioner',
    type: 'individual',
    address: 'Delhi',
  },
  respondent: {
    name: 'Sample Respondent',
    type: 'individual',
    address: 'Delhi',
  },
  status: 'filed',
  priority: 'normal',
  judgeId: 'judge-sample',
  judgeName: 'Hon. Justice Sample',
  courtId: 'court-sample',
  courtName: 'Sample Court',
  filingDate: new Date(),
  nextHearingDate: new Date(),
  lastHearingDate: new Date(),
  synopsis: 'Sample case synopsis',
  totalHearings: 0,
  completedHearings: 0,
  adjournmentCount: 0,
  documentIds: [],
  isConfidential: false,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin',
  lastModifiedBy: 'admin',
});
