# Setting Up Real-Time Case Synchronization

## Quick Start (5 minutes)

### Step 1: Wrap Your App with CasesProvider

Edit [src/main.tsx](src/main.tsx):

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { CasesProvider } from './contexts/CasesContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CasesProvider>
      <App />
    </CasesProvider>
  </React.StrictMode>,
)
```

### Step 2: Create Firestore Collection

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database
4. Create new collection called `cases`
5. Add a test document with sample case data

### Step 3: Set Up Security Rules

In Firestore Console, go to **Rules** and paste:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cases collection - accessible by authenticated users
    match /cases/{caseId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if 
        request.auth.uid != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'court' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Users collection - stores user roles
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

Click **Publish** to save.

### Step 4: Use Real-Time Cases in Components

**In Court Portal (CaseStatusTracking):**

Already implemented! Cases load from Firestore with real-time updates.

**In Citizen Portal (New Component):**

```typescript
import { MyCasesRealTime } from '../MyCasesRealTime';
import { useAuth } from '../contexts/AuthContext';

export const MyCases = () => {
  const { user } = useAuth();

  return (
    <MyCasesRealTime citizenId={user?.uid} />
  );
};
```

### Step 5: Populate Firestore with Mock Data

Create an admin initialization script:

```typescript
// src/utils/initializeFirestore.ts
import { initializeFirestoreWithMockCases } from '../data/mockCases';

export const initCases = async (userId: string, userName: string) => {
  try {
    const success = await initializeFirestoreWithMockCases(userId, userName);
    if (success) {
      console.log('✓ Firestore initialized with mock cases');
      return true;
    }
  } catch (error) {
    console.error('✗ Failed to initialize Firestore:', error);
    return false;
  }
};
```

Then call it once from an admin component:

```typescript
// In your admin panel or first-time setup
const handleInitialize = async () => {
  await initCases(courtUser?.uid, courtUser?.name);
  alert('Cases loaded!');
};
```

## Complete Step-by-Step Guide

### 1. Update App Wrapper (main.tsx)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import { CasesProvider } from './contexts/CasesContext'  // ADD THIS
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CasesProvider>  {/* ADD THIS WRAPPER */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </CasesProvider>
  </React.StrictMode>,
)
```

### 2. Configure Firebase Firestore

#### Option A: Use Firebase Console (Recommended for First Time)

```
1. Go to https://console.firebase.google.com
2. Select your project
3. Click "Firestore Database" in left menu
4. Click "Create Database"
5. Choose "Start in production mode"
6. Select region (closest to your users)
7. Click "Create"
```

#### Option B: Using Firebase CLI

```bash
firebase init firestore
firebase firestore:indexes
```

### 3. Update Firestore Security Rules

```
1. In Firebase Console, click "Firestore Database"
2. Go to "Rules" tab
3. Replace all content with rules above
4. Click "Publish"
```

**Verify Rules are Working:**
- Login as judge/court user → Should have write access
- Login as citizen → Should have read-only access
- Not logged in → Should have no access

### 4. Test Connection

Create a test component to verify Firestore is working:

```typescript
// src/components/FirestoreTest.tsx
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const FirestoreTest = () => {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cases'));
        setCases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError(err.message);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="p-4 bg-slate-50 rounded-lg">
      <h3 className="font-bold mb-2">Firestore Connection Test</h3>
      {error && <p className="text-red-600">Error: {error}</p>}
      {cases.length > 0 && (
        <>
          <p className="text-green-600">✓ Connected! Found {cases.length} cases</p>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(cases.slice(0, 1), null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};
```

### 5. Initialize with Mock Cases

Add a one-time initialization button (remove after first run):

```typescript
// src/components/InitializeData.tsx
import { initializeFirestoreWithMockCases } from '../data/mockCases';
import { useCourtAuth } from '../contexts/CourtAuthContext';

export const InitializeData = () => {
  const { courtUser } = useCourtAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const result = await initializeFirestoreWithMockCases(
        courtUser?.uid || 'admin',
        courtUser?.name || 'Admin'
      );
      setSuccess(result);
    } catch (error) {
      console.error('Failed to initialize:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-semibold text-blue-900 mb-3">
        Initialize Firestore with Sample Cases (Run Once)
      </p>
      <button
        onClick={handleInitialize}
        disabled={loading || success}
        className="px-4 py-2 bg-blue-600 text-white rounded font-semibold disabled:opacity-50"
      >
        {loading ? 'Initializing...' : success ? 'Initialized ✓' : 'Initialize'}
      </button>
      {success && (
        <p className="text-green-600 text-sm mt-2">
          ✓ Cases loaded! You can now see real-time updates.
        </p>
      )}
    </div>
  );
};
```

### 6. Connect Citizen Portal to Real-Time Cases

Update citizen portal case display:

```typescript
// src/components/pages/CitizenCases.tsx
import { MyCasesRealTime } from '../MyCasesRealTime';
import { useAuth } from '../../contexts/AuthContext';

export const CitizenCases = () => {
  const { user } = useAuth();

  if (!user) return <div>Please login</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Cases (Real-Time)</h1>
        <MyCasesRealTime citizenId={user.uid} />
      </div>
    </div>
  );
};
```

### 7. Test End-to-End Synchronization

**Test Real-Time Updates:**

1. Open court portal in Chrome
2. Open citizen portal in Firefox (different window)
3. In court portal, update a case status (e.g., filed → disposed)
4. Check Firefox window - should show update immediately
5. No page refresh needed!

**Expected Behavior:**
```
Judge updates case in Court Portal
    ↓
Firestore document updates with timestamp + judge name
    ↓
Real-time listeners notified
    ↓
Citizen Portal refreshes case display
    ↓
Both portals show identical case status
    ↓
Timestamp shows when + by whom last updated
```

## Verification Checklist

- [ ] CasesProvider wraps main App
- [ ] Firestore collection "cases" exists
- [ ] Security rules published
- [ ] Test connection shows cases
- [ ] Mock data initialized
- [ ] Court portal updates trigger real-time listener
- [ ] Citizen portal shows updated cases
- [ ] No console errors
- [ ] Update timestamps appear correctly

## Troubleshooting

### Issue: "No matching documents found"

**Solution:**
```typescript
// Check if cases collection exists and has data
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const snapshot = await getDocs(collection(db, 'cases'));
console.log('Cases found:', snapshot.size);
```

### Issue: "Permission denied" error

**Solution:**
1. Check user is logged in: `console.log(user);`
2. Verify security rules allow the action
3. Check custom claims: `console.log(user.customClaims);`

### Issue: Real-time updates not showing

**Solution:**
1. Check browser console for Firebase errors
2. Ensure listener unsubscribe cleanup:
   ```typescript
   useEffect(() => {
     const unsub = subscribeToRealTimeCases(callback);
     return () => unsub(); // Cleanup
   }, []);
   ```
3. Check Firestore indexes are created (should auto-create)

### Issue: Slow initial load

**Solution:**
1. Reduce case query with filters:
   ```typescript
   const constraints = [
     where('courtId', '==', courtId),
     limit(50)
   ];
   subscribeToRealTimeCases(callback, constraints);
   ```
2. Add Firestore indexes for frequent queries
3. Implement pagination

## Performance Tips

1. **Index Important Queries**: Firestore will suggest indexes
2. **Use Query Constraints**: Filter by courtId, status, etc.
3. **Limit Results**: Start with `limit(50)` cases
4. **Paginate**: Implement cursor-based pagination for large datasets
5. **Cache Locally**: Use React Context or Redux for local cache

## Next Steps

1. ✅ Wrap app with CasesProvider
2. ✅ Configure Firestore
3. ✅ Set security rules
4. ✅ Initialize with mock data
5. ✅ Test real-time updates
6. ✅ Connect citizen portal
7. ⏭️ Implement real-time search
8. ⏭️ Add case filtering by court
9. ⏭️ Set up notifications for updates

## Support & Debugging

**Check Firestore Console:**
- View all documents
- See real-time updates
- Monitor read/write counts
- Check indexes

**Use Browser DevTools:**
- **Network tab**: Check Firestore requests
- **Console tab**: Check for Firebase errors
- **Storage tab**: Verify Firebase config

**Enable Firebase Debug Logging:**
```typescript
import { getFirestore, enableLogging } from 'firebase/firestore';

enableLogging(true); // Only in development
```

## Files Modified

1. ✅ `src/main.tsx` - Add CasesProvider
2. ✅ `src/services/casesService.ts` - Firestore operations
3. ✅ `src/contexts/CasesContext.tsx` - Global case state
4. ✅ `src/components/pages/court/CaseStatusTracking.tsx` - Real-time updates
5. ✅ `src/components/pages/MyCasesRealTime.tsx` - Citizen case display
6. ✅ `REAL_TIME_SYNC_GUIDE.md` - Complete documentation
7. ⏭️ Update any other case display components

## Questions?

See REAL_TIME_SYNC_GUIDE.md for detailed API documentation.
