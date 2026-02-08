# 🚀 HOW TO RUN NYAY SAATHI

## System Requirements
- **Node.js** (v16+) or **Bun** (latest)
- **Python** (3.9+) - for backend
- **Git** (for version control)

---

## 📋 QUICK START (5 MINUTES)

### **Option A: Using NPM (Recommended)**

#### **Step 1: Install Frontend Dependencies**
```bash
cd d:\Nyay-Sathi\citizen-legal-buddy-main
npm install
```
*Takes ~2-3 minutes*

#### **Step 2: Setup Backend (Python)**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

#### **Step 3: Create .env file in backend/**
```
GEMINI_API_KEY=your_gemini_api_key_here
```

#### **Step 4: Start Backend (Terminal 1)**
```bash
cd backend
.venv\Scripts\activate
python main.py
```
*Backend runs on: http://localhost:8001*

#### **Step 5: Start Frontend (Terminal 2)**
```bash
npm run dev
```
*Frontend runs on: http://localhost:5173*

---

### **Option B: Using Bun (Faster)**

```bash
cd d:\Nyay-Sathi\citizen-legal-buddy-main
bun install
bun run dev
```

---

## 🔧 SETUP DETAILS

### **Frontend Setup**
```bash
# Navigate to project root
cd d:\Nyay-Sathi\citizen-legal-buddy-main

# Install dependencies
npm install

# Start dev server
npm run dev

# (Optional) Build for production
npm run build
```

### **Backend Setup**
```bash
# Navigate to backend
cd d:\Nyay-Sathi\citizen-legal-buddy-main\backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment (Windows)
.venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with Gemini API key
echo GEMINI_API_KEY=your_key_here > .env

# Run backend server
python main.py
```

---

## 📍 URLs AFTER RUNNING

| Service | URL | Port |
|---------|-----|------|
| **Frontend (React)** | http://localhost:5173 | 5173 |
| **Backend (FastAPI)** | http://localhost:8001 | 8001 |

---

## 🔑 CONFIGURATION

### **Firebase Setup**
1. Create Firebase project at https://console.firebase.google.com
2. Copy config to `src/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### **Gemini API Setup**
1. Get free API key at https://makersuite.google.com/app/apikey
2. Add to `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📂 PROJECT STRUCTURE

```
Nyay-Sathi/
├── citizen-legal-buddy-main/
│   ├── src/
│   │   ├── App.tsx (137 lines - clean router!)
│   │   ├── components/
│   │   │   ├── pages/ (18 components)
│   │   │   └── features/
│   │   ├── utils/
│   │   ├── types/
│   │   └── data/
│   ├── backend/
│   │   ├── main.py (FastAPI server)
│   │   ├── requirements.txt
│   │   └── .env (configuration)
│   ├── package.json
│   └── vite.config.ts
```

---

## ✅ VERIFICATION CHECKLIST

After running both services, verify:

- [ ] Frontend loads at http://localhost:5173
- [ ] Login page appears
- [ ] Firebase auth works
- [ ] Backend responds at http://localhost:8001
- [ ] AI chat works (requires Gemini API key)
- [ ] No errors in browser console
- [ ] No errors in terminal

---

## 🐛 TROUBLESHOOTING

### **Frontend Won't Start**
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### **Backend Port Already in Use**
```bash
# Find and kill process on port 8001
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### **Python Virtual Environment Issues**
```bash
# Deactivate and recreate
deactivate
rm -r .venv
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### **Firebase Connection Fails**
- Check Firebase config in `src/firebase.ts`
- Verify internet connection
- Check Firebase project exists

### **Gemini API Returns Error**
- Verify API key in `backend/.env`
- Check API key is enabled
- Visit https://makersuite.google.com/app/apikey

---

## 📊 EXPECTED OUTPUT

### **Frontend Console**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### **Backend Console**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete
```

---

## 🎯 NEXT STEPS (AFTER RUNNING)

Once everything is running:

1. **Test Features**
   - Login with email/password or OAuth
   - Try Smart Chat with AI
   - Test document upload
   - Try voice input

2. **Enhance Features** (we can work on this together)
   - Add new pages
   - Improve AI responses
   - Add new document types
   - Create new components
   - Add more languages

3. **Deploy**
   - Build frontend: `npm run build`
   - Deploy to Vercel/Netlify
   - Deploy backend to Heroku/Railway/Render

---

## 🔄 DEVELOPMENT WORKFLOW

### **Making Changes**

1. **Edit a component**:
   ```bash
   # Edit any file in src/components/pages/ or src/components/features/
   # Changes auto-refresh in browser!
   ```

2. **Add a new page**:
   ```bash
   # Create src/components/pages/NewPage.tsx
   # Export in src/components/pages/index.ts
   # Import and add route in src/App.tsx
   ```

3. **Update backend logic**:
   ```bash
   # Edit src/backend/main.py
   # Server auto-reloads
   ```

---

## 📱 FEATURES TO TEST

After starting:

| Feature | Path | Notes |
|---------|------|-------|
| **AI Chat** | /chat | Test with legal questions |
| **Document Generator** | /docs | Create legal documents |
| **Voice Assistant** | /voice | Speak legal query |
| **IPC Lookup** | /ipc | Search penal code |
| **Find Advocate** | /find | Search lawyers (demo) |
| **Learning** | /learn | Gamified lessons |
| **Forum** | /community | Discussion board |
| **Case Laws** | /cases | Court verdicts |

---

## ✨ PERFORMANCE TIPS

1. **Use Bun instead of NPM** (faster)
```bash
bun install
bun run dev
```

2. **Check bundle size**
```bash
npm run build
```

3. **Monitor performance**
- Open DevTools (F12)
- Check Network tab
- Check Console for errors

---

## 🎓 ARCHITECTURE

```
Frontend (React + Vite)
      ↓
  App.tsx (router)
      ↓
  Components (pages & features)
      ↓
  Firebase (auth & data)
      ↓
Backend (FastAPI + Python)
      ↓
  Google Gemini API (AI)
      ↓
  Database (SQLite)
```

---

## 💡 TIPS

- **Hot Reload**: Changes to files auto-refresh in browser
- **DevTools**: Use browser DevTools (F12) for debugging
- **API Testing**: Use Postman for backend API testing
- **Logs**: Check both frontend and backend console logs

---

## 🆘 NEED HELP?

Check these files:
- `QUICK_REFERENCE.md` - Quick lookup
- `ARCHITECTURE.md` - System design
- `README.md` - General info
- `IMPLEMENTATION_GUIDE.md` - Detailed setup

---

**Ready to run?** Start with Step 1 above! 🚀

*Last Updated: January 30, 2026*
