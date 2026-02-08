# Integration Guide: Adding Real-Time Cases to Your Pages

## Overview

This guide shows you how to add the real-time case synchronization to your existing case display pages.

## Integration Points

### 1. In Citizen Portal - Existing Case Pages

#### Update CaseLawDatabase.tsx or Similar

```typescript
import { MyCasesRealTime } from './MyCasesRealTime';
import { useAuth } from '../contexts/AuthContext';

export const CitizenCases = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view your cases</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <MyCasesRealTime citizenId={user.uid} />
    </div>
  );
};
```

#### Or Add to HomePage as a Section

```typescript
import { MyCasesRealTime } from './MyCasesRealTime';
import { useAuth } from '../contexts/AuthContext';

export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Existing homepage content */}
      
      {user && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Your Active Cases (Live Updates)</h2>
          <MyCasesRealTime citizenId={user.uid} />
        </div>
      )}
    </div>
  );
};
```

### 2. In Court Portal - Already Integrated!

CaseStatusTracking.tsx is already fully integrated with real-time Firestore sync.

**To verify it's working:**
```typescript
// In CaseStatusTracking.tsx (already done)
useEffect(() => {
  const unsub = subscribeToRealTimeCases((updatedCases) => {
    setCases(updatedCases);
  });
  return () => unsub();
}, []);
```

### 3. Access Cases from Any Component

Use the global CasesContext:

```typescript
import { useCases } from '../contexts/CasesContext';

function MyComponent() {
  const { cases, loading, getCaseById, getCasesByUserId } = useCases();

  // All cases with real-time updates
  const allCases = cases;

  // Get specific case
  const myCase = getCaseById('case-123');

  // Get cases by user
  const userCases = getCasesByUserId('user-123');

  return (
    <div>
      {loading && <p>Loading...</p>}
      {cases.map(c => (
        <div key={c.id}>{c.caseTitle}</div>
      ))}
    </div>
  );
}
```

## Usage Examples

### Example 1: Display User's Cases in Dashboard

```typescript
import { useCases } from '../contexts/CasesContext';
import { useAuth } from '../contexts/AuthContext';

export const UserCasesDashboard = () => {
  const { user } = useAuth();
  const { cases, loading } = useCases();

  // Filter cases for this user
  const userCases = cases.filter(c => 
    c.respondent?.citizenPortalUserId === user?.uid
  );

  if (loading) return <div>Loading cases...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {userCases.map(c => (
        <div key={c.id} className="border rounded-lg p-4">
          <h3>{c.caseTitle}</h3>
          <p>Status: {c.status}</p>
          <p>Next Hearing: {c.nextHearingDate.toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 2: Show Cases by Status

```typescript
import { useCases } from '../contexts/CasesContext';

export const PendingCases = () => {
  const { cases } = useCases();

  const pendingCases = cases.filter(c => c.status === 'under_trial');

  return (
    <div>
      <h2>Cases Under Trial ({pendingCases.length})</h2>
      {pendingCases.map(c => (
        <div key={c.id} className="mb-4 p-4 border-l-4 border-purple-500">
          <h3>{c.caseTitle}</h3>
          <p>Court: {c.courtName}</p>
          <p>Judge: {c.judgeName}</p>
        </div>
      ))}
    </div>
  );
};
```

### Example 3: Real-Time Case Statistics

```typescript
import { useCases } from '../contexts/CasesContext';

export const CaseStatistics = () => {
  const { cases } = useCases();

  const stats = {
    total: cases.length,
    disposed: cases.filter(c => c.status === 'disposed').length,
    underTrial: cases.filter(c => c.status === 'under_trial').length,
    adjourned: cases.filter(c => c.status === 'adjourned').length,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm text-blue-600">Total Cases</p>
        <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
      </div>
      <div className="bg-green-50 p-4 rounded">
        <p className="text-sm text-green-600">Disposed</p>
        <p className="text-3xl font-bold text-green-900">{stats.disposed}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded">
        <p className="text-sm text-purple-600">Under Trial</p>
        <p className="text-3xl font-bold text-purple-900">{stats.underTrial}</p>
      </div>
      <div className="bg-orange-50 p-4 rounded">
        <p className="text-sm text-orange-600">Adjourned</p>
        <p className="text-3xl font-bold text-orange-900">{stats.adjourned}</p>
      </div>
    </div>
  );
};
```

### Example 4: Case Update Notification

```typescript
import { updateCaseStatus } from '../services/casesService';
import { useCourtAuth } from '../contexts/CourtAuthContext';

export const QuickStatusUpdate = ({ caseId }: { caseId: string }) => {
  const { courtUser } = useCourtAuth();
  const [updating, setUpdating] = useState(false);

  const handleQuickUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateCaseStatus(
        caseId,
        newStatus,
        courtUser?.uid || '',
        courtUser?.name || ''
      );
      // No need to refresh - real-time update will handle it!
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleQuickUpdate('disposed')}
        disabled={updating}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        Mark Disposed
      </button>
      <button
        onClick={() => handleQuickUpdate('adjourned')}
        disabled={updating}
        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
      >
        Mark Adjourned
      </button>
    </div>
  );
};
```

### Example 5: Case Search with Real-Time Results

```typescript
import { useCases } from '../contexts/CasesContext';
import { useState } from 'react';

export const CaseSearch = () => {
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState('');

  const results = cases.filter(c =>
    c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.caseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search cases..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      <div className="mt-4 space-y-2">
        {results.map(c => (
          <div key={c.id} className="p-3 border rounded hover:bg-slate-50 cursor-pointer">
            <h4 className="font-bold">{c.caseNumber}</h4>
            <p className="text-sm text-slate-600">{c.caseTitle}</p>
            <p className="text-xs text-slate-500">
              {c.status} • Next: {c.nextHearingDate.toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Integration Checklist

- [ ] CasesProvider wraps app in main.tsx
- [ ] Firestore collection "cases" created
- [ ] Security rules published
- [ ] Mock data initialized (optional)
- [ ] Citizen portal component added
- [ ] Court portal tested (already integrated)
- [ ] Real-time updates verified
- [ ] No console errors
- [ ] App compiles successfully

## Common Integration Patterns

### Pattern 1: Conditional Rendering Based on Case Status

```typescript
{cases.map(c => (
  <div key={c.id} className={c.status === 'disposed' ? 'opacity-50' : ''}>
    {c.caseTitle}
    {c.status === 'urgent' && <span className="text-red-600">!</span>}
  </div>
))}
```

### Pattern 2: Real-Time Counter

```typescript
<div className="text-2xl font-bold">
  {cases.filter(c => c.status === 'under_trial').length} Active Cases
</div>
```

### Pattern 3: Status Badge

```typescript
const getStatusColor = (status: string) => {
  const colors = {
    filed: 'bg-blue-100 text-blue-800',
    under_trial: 'bg-purple-100 text-purple-800',
    disposed: 'bg-green-100 text-green-800',
    adjourned: 'bg-orange-100 text-orange-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

<span className={`px-2 py-1 rounded text-sm font-semibold ${getStatusColor(c.status)}`}>
  {c.status}
</span>
```

## Important Notes

1. **Always wrap components with CasesProvider** - Already done in main.tsx
2. **Use useCases() hook** - Don't create separate subscriptions
3. **No manual refresh needed** - Real-time updates are automatic
4. **Clean up listeners** - useEffect cleanup is automatic in CasesContext
5. **Check loading state** - Always show loading indicator while `loading === true`

## Troubleshooting Integration

**Problem**: "useCases is not defined"
**Solution**: Make sure CasesProvider wraps your app in main.tsx

**Problem**: "Cases are empty"
**Solution**: Check Firestore collection exists and has data

**Problem**: "Updates not showing"
**Solution**: Ensure listener cleanup is working (check useEffect return)

## Performance Tips

1. **Memoize filtered results**
   ```typescript
   const activeCases = useMemo(
     () => cases.filter(c => c.status === 'under_trial'),
     [cases]
   );
   ```

2. **Use useCallback for handlers**
   ```typescript
   const handleUpdate = useCallback((caseId) => {
     updateCaseStatus(caseId, 'disposed', userId, userName);
   }, [userId, userName]);
   ```

3. **Implement virtualization for large lists**
   ```typescript
   import { FixedSizeList } from 'react-window';
   // Render only visible items
   ```

## Next Steps

1. ✅ Add CasesProvider wrapper (done)
2. ✅ Create Firestore collection
3. ✅ Set security rules
4. ⏭️ Initialize with mock data
5. ⏭️ Integrate into your pages
6. ⏭️ Test real-time updates
7. ⏭️ Deploy to production

## Support Files

- **API Reference**: REAL_TIME_SYNC_GUIDE.md
- **Setup Guide**: SETUP_REALTIME_SYNC.md
- **Service Code**: src/services/casesService.ts
- **Context Code**: src/contexts/CasesContext.tsx
- **Component Code**: src/components/pages/MyCasesRealTime.tsx

---

**Ready to integrate? Start with the CaseLawDatabase page or create a new "My Cases" page!**
