# ⚡ URGENT: Fix Permission Error (2 Minutes)

## The Problem
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions
```

## The Solution (Copy-Paste)

### Step 1: Open Firebase Console
```
https://console.firebase.google.com
↓
Select: citizen-legal-buddy project
↓
Click: Firestore Database (left sidebar)
↓
Click: Rules tab
```

### Step 2: Copy This Code

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

### Step 3: Paste Into Firebase

1. **Select All** existing rules (Ctrl+A)
2. **Delete** them
3. **Paste** the code above (Ctrl+V)
4. **Click** the blue "Publish" button
5. **Wait** for "Rules updated" message

### Step 4: Refresh Your App
- Press **F5** in your browser
- Check console (F12) - error should be GONE ✓

## Done! 🎉

Your real-time case sync now works!

---

## Still Having Issues?

See: `FIX_PERMISSION_ERROR.md` for detailed troubleshooting

---

**Total time: 2 minutes**
**Difficulty: Very Easy**
**Result: Permission error fixed + real-time sync working ✓**
