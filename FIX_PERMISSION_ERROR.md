# Fix: Permission Denied Error - Step by Step

## 🔴 Error You're Seeing

```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

## ✅ Quick Fix (2 minutes)

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project: **citizen-legal-buddy**
3. Go to **Firestore Database** (left sidebar)

### Step 2: Update Security Rules
1. Click on **Rules** tab at the top
2. Delete all existing content
3. **For Testing (Now)**, paste this:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

4. Click **Publish** button
5. Wait for rules to update (shows "Rules updated" message)

### Step 3: Test in Your App
1. Go back to your app in browser
2. Press **F5** to refresh
3. Check browser console (F12) - error should be gone!
4. Cases should now load ✓

---

## Why This Happened

Your Firestore collection (`cases`) exists, but the **security rules** were either:
- Not set up
- Too restrictive
- Blocking authenticated users

The temporary rules above allow any logged-in user to read/write to Firestore.

---

## 🔒 After Testing: Switch to Production Rules

Once you confirm the above works, replace with these safer rules:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Cases - readable by all authenticated users
    match /cases/{caseId} {
      allow read: if request.auth.uid != null;
      allow create, update, delete: if 
        request.auth.uid != null;
    }
    
  }
}
```

---

## Troubleshooting: Still Not Working?

### Issue 1: "Still getting permission denied"

**Check:**
```
1. Did you click "Publish" after pasting rules? (Important!)
2. Did you wait 5 seconds for rules to take effect?
3. Try refreshing page (F5)
4. Try clearing browser cache (Ctrl+Shift+Delete)
```

### Issue 2: "Cases still not showing"

**Check:**
```
1. Do you have any cases in Firestore?
   - Go to Firestore Database → Collections
   - Do you see a "cases" collection?
   - Do you see documents inside it?

2. If no cases exist, you need to add them:
   - Click "cases" collection
   - Click "+ Add Document"
   - Add sample case data
   - OR run: initializeFirestoreWithMockCases()
```

### Issue 3: "Can see cases but updates not syncing"

**Check:**
```
1. Are you making changes in court portal?
2. Try refreshing citizen portal (F5)
3. Check if change actually went to Firestore
   - Go to Firebase Console
   - Look at cases collection
   - Check if data updated
```

---

## Browser Console Debugging

Press **F12** to open Developer Console and run:

```javascript
// Check if you're logged in
firebase.auth().currentUser  // Should NOT be null

// Check Firestore connection
console.log('Firestore instance:', db)  // Should show instance

// Check cases are being queried
// Watch console for "Cases found: X" message
```

---

## If You Get Another Error

**Copy the error message** and check:

1. **"Collection not found"** → Create collection "cases" in Firebase Console
2. **"Document not found"** → Add sample cases to Firestore
3. **"Invalid Firebase config"** → Check firebase.ts has correct config
4. **"User not authenticated"** → Make sure you're logged into your app

---

## Reference Files

- **Current Rules**: Check Firebase Console → Firestore → Rules tab
- **Rules Help**: FIRESTORE_RULES_FIX.md (complete reference)
- **Setup Instructions**: SETUP_REALTIME_SYNC.md

---

## Quick Checklist

- [ ] Firebase Console open
- [ ] Selected correct project (citizen-legal-buddy)
- [ ] In Firestore → Rules tab
- [ ] Pasted temporary rules from above
- [ ] Clicked "Publish" button
- [ ] Waited for "Rules updated" message
- [ ] Refreshed browser (F5)
- [ ] Checked browser console (F12) for errors
- [ ] Cases now showing ✓

---

## Next Steps

1. ✅ Fix the permission error (above)
2. → Test real-time updates work
3. → Switch to production rules
4. → Deploy to users

**Estimated time**: 5 minutes

---

## Need More Help?

Check these in order:
1. FIRESTORE_RULES_FIX.md - Complete rules reference
2. SETUP_REALTIME_SYNC.md - Full setup guide
3. Browser console errors (F12)
4. Firebase Console logs
