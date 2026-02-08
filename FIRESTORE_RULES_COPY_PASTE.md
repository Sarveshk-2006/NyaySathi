# Copy-Paste: Firestore Security Rules

## 🚀 TESTING RULES (Copy these RIGHT NOW to fix your error)

Go to: Firebase Console → Firestore Database → Rules tab

**Delete everything and paste this:**

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

**Then click PUBLISH**

✅ Your error should be gone!

---

## ✅ PRODUCTION RULES (Use after testing)

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Cases collection - Real-time sync
    match /cases/{caseId} {
      allow read: if request.auth.uid != null;
      allow create, update: if request.auth.uid != null;
      allow delete: if request.auth.uid != null;
    }
    
    // Hearings collection
    match /hearings/{hearingId} {
      allow read: if request.auth.uid != null;
      allow create, update: if request.auth.uid != null;
    }
    
    // Notices collection
    match /notices/{noticeId} {
      allow read: if request.auth.uid != null;
      allow create, update: if request.auth.uid != null;
    }
    
  }
}
```

---

## How to Apply

1. **Open Firebase Console**: https://console.firebase.google.com
2. **Select Project**: citizen-legal-buddy
3. **Go to**: Firestore Database
4. **Click**: Rules tab
5. **Select All**: Ctrl+A
6. **Delete**: Press Delete
7. **Paste**: Ctrl+V (use rules above)
8. **Publish**: Click "Publish" button
9. **Wait**: For "Rules updated" message
10. **Refresh App**: F5 in browser
11. **Check**: Console should be error-free!

---

## Why This Works

| Rule | Meaning |
|------|---------|
| `match /{document=**}` | Match all documents |
| `allow read, write` | Allow reading and writing |
| `if request.auth.uid != null` | Only if user is logged in |

---

## Verify It Worked

After publishing and refreshing your app:

1. **Open browser console**: F12
2. **Check for errors**: Should be GONE ✓
3. **Check cases load**: Should show cases from Firestore
4. **Test update**: Change case status in court portal
5. **Verify sync**: Should update in citizen portal instantly

---

## That's It!

Your real-time case synchronization is now working! 🎉

---

## If Still Getting Error

1. **Check you clicked PUBLISH** (most common mistake!)
2. **Wait 10 seconds** for rules to take effect
3. **Refresh browser** (F5)
4. **Clear cache** (Ctrl+Shift+Delete)
5. **Check browser console** for the exact error message
6. See **FIX_PERMISSION_ERROR.md** for troubleshooting

---

## Once Working, Switch to Production Rules

Replace the testing rules with production rules above for better security. Testing rules allow any logged-in user to access everything.

**Timeline:**
1. Use TESTING rules now (quick fix)
2. Verify everything works
3. Switch to PRODUCTION rules
4. Deploy to users
