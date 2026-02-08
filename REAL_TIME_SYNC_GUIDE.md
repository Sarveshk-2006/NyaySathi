# Real-Time Case Synchronization Guide

## Overview

The Nyay Sathi platform now features **bidirectional real-time case synchronization** between the Citizen Portal and Court Portal using Firebase Firestore. Any updates made by judges/court staff in the court portal are instantly reflected in the citizen portal, and vice versa.

## Architecture

### Data Flow

```
Citizen Portal (Cases)
        ↓
    Firestore Collection: "cases"
        ↓
    Real-time Listeners (onSnapshot)
        ↓
Court Portal (Case Management)
```

### Key Components

1. **Firestore Collection**: `cases`
   - Single source of truth for all case data
   - Real-time updates via Cloud Firestore listeners
   - Role-based access control (via security rules)

2. **CasesService** (`src/services/casesService.ts`)
   - Handles all Firestore operations
   - Real-time subscription management
   - Case CRUD operations

3. **CasesContext** (`src/contexts/CasesContext.tsx`)
   - Global state management for cases
   - Provides real-time cases across the application
   - Available to both portals

4. **CaseStatusTracking** (Court Portal)
   - Displays cases from Firestore in real-time
   - Updates case status with automatic Firestore sync
   - Shows which user last modified the case

## How It Works

### Real-Time Synchronization

When a judge updates a case status in the Court Portal:

```typescript
// In CaseStatusTracking component
await updateCaseStatus(
  caseId,
  'disposed',
  courtUser?.uid,
  courtUser?.name
);
```

This triggers:
1. Firestore document update with `updatedAt` timestamp
2. All subscribed listeners (real-time) get notified
3. Citizen portal automatically shows the updated status
4. Case marked with judge's name and update timestamp

### Subscription Pattern

```typescript
// In CaseStatusTracking useEffect
const unsub = subscribeToRealTimeCases((cases) => {
  setCases(cases);  // Auto-updates when Firestore changes
});

// Cleanup on unmount
return () => unsub();
```

## Service Functions

### Load Real-Time Cases

```typescript
import { subscribeToRealTimeCases } from '../services/casesService';

const unsubscribe = subscribeToRealTimeCases((cases: Case[]) => {
  setCases(cases);  // Called whenever Firestore updates
});
```

### Update Case Status

```typescript
import { updateCaseStatus } from '../services/casesService';

await updateCaseStatus(
  caseId,
  'disposed',  // New status
  userId,      // Judge's ID
  userName     // Judge's name (optional)
);
```

### Update Specific Fields

```typescript
import { updateCaseField } from '../services/casesService';

await updateCaseField(
  caseId,
  {
    status: 'disposed',
    completedHearings: 5,
    synopsis: 'Updated synopsis'
  },
  userId,
  userName
);
```

### Create New Case

```typescript
import { createCase } from '../services/casesService';

const newCaseId = await createCase(
  caseData,  // Case object without ID
  userId,
  userName
);
```

### Get Cases for Specific Court

```typescript
import { getCasesForCourt } from '../services/casesService';

const unsubscribe = getCasesForCourt('court-dhi-001');
```

### Get Cases for Specific Citizen

```typescript
import { getCasesForCitizen } from '../services/casesService';

const unsubscribe = getCasesForCitizen('citizen-123');
```

## Using CasesContext (Global)

Instead of subscribing in every component, use the global CasesContext:

```typescript
import { useCases } from '../contexts/CasesContext';

function MyComponent() {
  const { cases, loading, getCaseById, refreshCases } = useCases();

  // Access all cases
  const allCases = cases;

  // Get specific case
  const myCase = getCaseById('case-123');

  // Refresh cases manually
  const handleRefresh = () => refreshCases();

  return (
    <div>
      {loading && <p>Loading...</p>}
      {cases.map(c => <div key={c.id}>{c.caseTitle}</div>)}
    </div>
  );
}
```

## Setup & Initialization

### 1. Wrap App with CasesProvider

In [main.tsx](../main.tsx):

```typescript
import { CasesProvider } from './contexts/CasesContext';

<CasesProvider>
  <App />
</CasesProvider>
```

### 2. Migrate Mock Cases to Firestore (One-time)

```typescript
import { initializeFirestoreWithMockCases } from './data/mockCases';

// In your admin/setup component
await initializeFirestoreWithMockCases('admin-uid', 'Admin Name');
```

### 3. Configure Firestore Security Rules

Rules should allow:
- Judges to read/update/create cases for their court
- Citizens to read their own cases
- Admins to manage all cases

```firebase-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cases/{caseId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if 
        request.auth.customClaims.role == 'court' ||
        request.auth.customClaims.role == 'admin';
    }
  }
}
```

## Firestore Collection Schema

### Collection: `cases`

```typescript
{
  id: string;                          // Auto-generated doc ID
  caseNumber: string;                  // Unique case reference
  caseType: 'criminal' | 'civil' | 'family';
  caseTitle: string;
  
  petitioner: {
    name: string;
    type: 'individual' | 'organization' | 'government';
    address: string;
    lawyerName?: string;
  };
  
  respondent: {
    name: string;
    type: 'individual' | 'organization' | 'government';
    address: string;
    lawyerName?: string;
    citizenPortalUserId?: string;  // Links to citizen
  };
  
  status: CaseStatus;
  priority: CasePriority;
  
  // Court Info
  courtId: string;
  courtName: string;
  judgeId: string;
  judgeName: string;
  
  // Dates
  filingDate: Timestamp;
  nextHearingDate: Timestamp;
  lastHearingDate: Timestamp;
  
  // Details
  synopsis: string;
  reliefSought?: string;
  ipcSections?: string[];
  
  // Progress
  totalHearings: number;
  completedHearings: number;
  adjournmentCount: number;
  
  // Metadata
  documentIds: string[];
  isConfidential: boolean;
  tags: string[];
  
  // Audit Trail
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;        // User ID
  lastModifiedBy: string;   // User ID
  lastModifiedByName?: string;  // For display
}
```

## Real-Time Updates Flow

### Judge Updates Case in Court Portal

```
1. Judge clicks "Edit Status" → Modal opens
2. Judge selects new status (e.g., "disposed")
3. System calls: handleUpdateCaseStatus(caseId, 'disposed')
4. Service calls: updateCaseStatus(caseId, 'disposed', judgeId, judgeName)
5. Firestore updates document with:
   - status: 'disposed'
   - updatedAt: current timestamp
   - lastModifiedBy: judge's UID
   - lastModifiedByName: judge's name
6. All subscribed listeners get notified
7. Citizen portal case list auto-updates
8. Case shows: "Last updated by Hon. Justice X at [time]"
```

### Citizen Views Updated Case in Citizen Portal

```
1. Citizen portal has real-time listener active
2. Receives Firestore update event
3. Case automatically displays new status
4. Update timestamp shown to citizen
5. No page refresh needed - live update
```

## Features

✅ **Real-Time Sync**: Changes visible immediately across all active portals
✅ **Audit Trail**: Track who modified what and when
✅ **Offline Resilience**: Firestore queues updates when offline
✅ **Performance**: Indexed queries for fast data access
✅ **Security**: Role-based access control
✅ **Scalability**: Firestore handles thousands of concurrent updates

## Troubleshooting

### Cases Not Updating?

1. **Check subscription is active**: Ensure useEffect sets up listener
2. **Verify Firestore rules**: Allow read/write for user's role
3. **Check browser console**: Look for Firebase errors
4. **Verify Firestore connection**: Check Firebase console for data

### Real-Time Updates Delayed?

1. **Check network**: Ensure stable internet connection
2. **Firestore indexes**: Missing indexes slow queries
3. **Too many cases**: Paginate or filter queries
4. **Browser cache**: Clear cache and reload

### Permission Denied Errors?

1. **Update Firestore rules**: Add permissions for new roles
2. **Check user auth**: Verify user is logged in
3. **Verify custom claims**: Court users should have `role: 'court'`

## Performance Optimization

### Best Practices

1. **Use Constraints**: Filter queries to reduce data
   ```typescript
   const constraints = [
     where('courtId', '==', courtId),
     where('status', '!=', 'disposed')
   ];
   subscribeToRealTimeCases(callback, constraints);
   ```

2. **Implement Pagination**: For large case lists
   ```typescript
   const q = query(
     collection(db, 'cases'),
     where('courtId', '==', courtId),
     limit(50)
   );
   ```

3. **Unsubscribe on Unmount**: Prevent memory leaks
   ```typescript
   return () => unsub();
   ```

4. **Index Important Queries**: Set up Firestore indexes for frequent queries

## Data Migration

### From Mock Data to Firestore

```typescript
import { migrateCasesToFirestore } from './services/casesService';
import { MOCK_COURT_CASES } from './data/mockCases';

// One-time migration
await migrateCasesToFirestore(
  MOCK_COURT_CASES,
  'admin-uid',
  'System Admin'
);
```

## Example: Complete Integration

```typescript
import React, { useEffect, useState } from 'react';
import { useCases } from '../contexts/CasesContext';
import { updateCaseStatus } from '../services/casesService';

export const CaseList = () => {
  const { cases, loading } = useCases();
  const [selectedCase, setSelectedCase] = useState(null);

  if (loading) return <div>Loading cases...</div>;

  const handleStatusUpdate = async (caseId, newStatus) => {
    try {
      await updateCaseStatus(caseId, newStatus, userId, userName);
      // No need to refresh - real-time update will handle it
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  return (
    <div>
      {cases.map(c => (
        <div key={c.id} className="case-card">
          <h3>{c.caseTitle}</h3>
          <p>Status: {c.status}</p>
          <p>Last Modified: {c.lastModifiedByName} on {c.updatedAt.toLocaleString()}</p>
          <button onClick={() => handleStatusUpdate(c.id, 'disposed')}>
            Mark as Disposed
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Next Steps

1. ✅ Create Firestore `cases` collection
2. ✅ Add security rules for role-based access
3. ✅ Wrap app with CasesProvider
4. ✅ Migrate mock data to Firestore
5. ✅ Test real-time updates across portals
6. ✅ Monitor Firestore usage and indexes
7. ✅ Deploy to production

## Support

For issues or questions:
- Check Firestore Console: firebase.google.com
- Review Security Rules: FIRESTORE_RULES.txt
- Check browser DevTools: Network & Console tabs
- Review service documentation: src/services/casesService.ts
