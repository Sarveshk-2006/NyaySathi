# Firestore Security Rules - QUICK FIX

## ⚠️ TEMPORARY (Development Only) - Full Permissions

Copy this to Firebase Console → Firestore → Rules tab:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users to read and write
    match /{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

Click **Publish** to save.

---

## ✅ PRODUCTION (After Testing) - Secure Rules

Once your real-time sync is working, switch to these rules:

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - for storing user info and roles
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Cases collection - real-time sync
    match /cases/{caseId} {
      // Everyone can read cases
      allow read: if request.auth.uid != null;
      
      // Only judges/admins can create/update/delete
      allow create, update: if 
        request.auth.uid != null && 
        (request.auth.token.role == 'court' || request.auth.token.role == 'admin');
      
      allow delete: if 
        request.auth.uid != null && 
        request.auth.token.role == 'admin';
    }
    
    // Hearings collection
    match /hearings/{hearingId} {
      allow read: if request.auth.uid != null;
      allow create, update: if 
        request.auth.uid != null && 
        (request.auth.token.role == 'court' || request.auth.token.role == 'admin');
    }
    
    // Notices collection
    match /notices/{noticeId} {
      allow read: if request.auth.uid != null;
      allow create, update: if 
        request.auth.uid != null && 
        (request.auth.token.role == 'court' || request.auth.token.role == 'admin');
    }
    
  }
}
```

---

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **citizen-legal-buddy**
3. Go to **Firestore Database**
4. Click **Rules** tab
5. Replace all content with the rules above (start with TEMPORARY for quick fix)
6. Click **Publish**

---

## Troubleshooting

### If still getting permission denied:

1. **Check you're logged in**
   - Open browser console: `F12`
   - Type: `firebase.auth().currentUser` 
   - Should show your user, not `null`

2. **Check custom claims are set**
   - In Firebase Auth, click your user
   - Check "Custom claims" - should have `role: 'court'` or `role: 'citizen'`
   - If not, ask your admin to set it

3. **Try the temporary rules first**
   - Allows all authenticated users full access
   - If this works, your authentication is good
   - Then switch to production rules

---

## Step-by-Step Fix

### Step 1: Apply Temporary Rules (Right Now)
Copy the **TEMPORARY** rules above and paste into Firebase Console → Rules tab → Publish

### Step 2: Test in Browser
- Press `F5` to refresh app
- Check browser console for errors
- Cases should load now!

### Step 3: Verify It Works
- Open court portal
- Cases should show from Firestore
- Open citizen portal
- Update case status in court portal
- Citizen portal should update in real-time

### Step 4: Switch to Production Rules
Once working, replace temporary rules with **PRODUCTION** rules above

---

## Quick Rules Explanation

| Rule | Means |
|------|-------|
| `allow read` | Anyone authenticated can see |
| `allow write` | Anyone authenticated can change |
| `request.auth.uid != null` | User must be logged in |
| `request.auth.token.role == 'court'` | User must be a judge/court staff |

---

## If You Need Help

Check these files:
- Current rules: SETUP_REALTIME_SYNC.md
- Firebase console: https://console.firebase.google.com
- Your project: citizen-legal-buddy
