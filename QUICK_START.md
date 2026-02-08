# ⚡ QUICK START (Copy-Paste Commands)

## 🎯 FASTEST WAY TO RUN (Using NPM)

### **Terminal 1: Setup & Backend**
```bash
# Change to project directory
cd d:\Nyay-Sathi\citizen-legal-buddy-main

# Setup backend Python environment
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (IMPORTANT!)
# Add your Gemini API key from https://makersuite.google.com/app/apikey
echo GEMINI_API_KEY=your_api_key_here > .env

# Run backend on port 8001
python main.py
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
```

---

### **Terminal 2: Frontend (NEW TERMINAL)**
```bash
# Go to project root
cd d:\Nyay-Sathi\citizen-legal-buddy-main

# Install dependencies (first time only)
npm install

# Start frontend on port 5173
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## 🌐 OPEN IN BROWSER

Once both services are running:
- **Open**: http://localhost:5173
- **Login**: Use test email or OAuth (Google/GitHub)
- **Explore**: Try Smart Chat, Voice, Documents, etc.

---

## 🔑 GET API KEY (Required!)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Create API key
4. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

---

## ⚙️ CONFIGURATION

### **Firebase Setup (Optional for basic features)**
1. Create project at https://console.firebase.google.com
2. Copy config to `src/firebase.ts`

### **OAuth Setup (Optional)**
1. Google: https://console.developers.google.com
2. GitHub: https://github.com/settings/developers

---

## 📊 VERIFY EVERYTHING WORKS

- [ ] Frontend loads (http://localhost:5173)
- [ ] Backend responds (http://localhost:8001)
- [ ] No red errors in console
- [ ] Can login/signup
- [ ] AI chat responds

---

## 🚀 NEXT: ENHANCE FEATURES

After running, we can work on:
- ✨ Add new components
- 🤖 Improve AI responses
- 📱 Add mobile features
- 🌐 Add more languages
- 🎨 Enhance UI/UX
- 📊 Add analytics
- 🔐 Improve security

**Ready to enhance?** Let me know what feature you want to work on! 💡

---

## 📸 TROUBLESHOOTING

### Port already in use?
```bash
# Windows - find and kill process
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

### Python not found?
```bash
# Install Python: https://python.org
# Verify installation
python --version
```

### npm not found?
```bash
# Install Node.js: https://nodejs.org
# Verify installation
node --version
npm --version
```

---

**Questions?** Check `HOW_TO_RUN.md` for detailed guide!
