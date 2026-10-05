# ⚖️ Nyay Sathi (न्याय साथी) — Citizen Legal Buddy

> **Access Justice Anytime, Anywhere.**  
> An AI-powered legal assistance and rights awareness platform designed to democratize legal guidance for Indian citizens.

---

## 🌟 Overview

**Nyay Sathi** bridges the gap between citizens and the legal system by providing accessible, fast, and reliable AI-driven legal tools. Built tailored to the Indian legal context—including the **Bharatiya Nyaya Sanhita (BNS)** and **Indian Penal Code (IPC)**—Nyay Sathi enables users to understand their rights, generate legal drafts, analyze documents, predict case outcomes, and connect with legal advocates.

---

## ✨ Key Features

### 🤖 1. Smart Legal AI Assistant
- Interactive, multi-lingual conversational AI tailored for Indian law.
- Answers legal questions, explains fundamental rights, and provides step-by-step procedural advice.
- Powered by Google Gemini AI with fallback models and context preservation.

### 📄 2. Legal Document Generator
- Instantly generate customizable, ready-to-use legal drafts:
  - Consumer Complaints & RTI Applications
  - Rental / Lease Agreements
  - Legal Notices (Recovery of Dues, Property Disputes)
  - Affidavits & Power of Attorney
- Export options available for easy editing and sharing.

### 🔮 3. IPC/BNS Case & Outcome Predictor
- Describe a legal issue or incident in plain language.
- AI analyzes the scenario against applicable laws (IPC / BNS).
- Provides legal sections, potential liabilities, remedies, and estimated case progression.

### 📋 4. Legal Document Summarizer & Analyzer
- Upload legal notices, contracts, court orders, or PDFs.
- Receives instant plain-language summaries, key risk flags, important deadlines, and highlighted obligations.

### 👨‍⚖️ 5. Advocate Finder & Directory
- Search and filter verified legal professionals by specialization, city, court, and experience.
- Direct contact options to consult with trusted lawyers.

### 📚 6. Legal Rights & Knowledge Hub
- Simplified guides on consumer rights, tenant rights, labor laws, women's legal protection, and traffic regulations.
- Access to recent summaries of landmark Indian court verdicts.

### 🔐 7. Case Dashboard & Secure Auth
- Personal user dashboard for tracking consultations, generated documents, and saved cases.
- Powered by **Firebase Authentication** (Email/Password, Google, and GitHub social logins) and **Firestore** real-time storage.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling & UI**: Tailwind CSS, Lucide React Icons, Radix UI primitives
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Backend Architecture**: Vercel Serverless Functions (`/api/*`)
- **Auth & Database**: Firebase Auth, Firebase Firestore
- **Hosting & Deployment**: Vercel

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Gemini API Key**: Get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sarveshk-2006/NyaySathi.git
   cd NyaySathi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   # Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key_here

   # Firebase Configuration (Optional if using default fallback)
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## ☁️ Deployment

Nyay Sathi is configured for zero-setup serverless deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project in your [Vercel Dashboard](https://vercel.com/new).
3. Set the `GEMINI_API_KEY` environment variable in Vercel project settings.
4. Deploy! All API endpoints (`/api/*`) are handled seamlessly by Vercel Serverless Functions.

---

## 📜 Disclaimer

*Nyay Sathi provides AI-generated legal information and draft assistance for educational and guidance purposes only. It does not constitute formal legal advice or create an attorney-client relationship. For formal legal representation, always consult a qualified legal advocate.*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
