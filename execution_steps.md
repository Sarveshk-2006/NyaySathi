# Project Execution Steps: Nyay Saathi
**Team:** G-12  
**Project:** Nyay Saathi - AI Legal Case Advisor for Citizens

## 1. Prerequisites
Ensure the following are installed on your system before proceeding:
- **Node.js** (v16+) or **Bun**
- **Python** (3.9+)
- **Git**

## 2. Frontend Execution Setup
1. Open a terminal and navigate to the main project directory:
   ```bash
   cd citizen-legal-buddy-main
   ```
2. Install the required NPM dependencies:
   ```bash
   npm install
   ```
3. Start the Vite frontend development server:
   ```bash
   npm run dev
   ```
4. The frontend application will now be running at: **http://localhost:5173**

## 3. Backend Execution Setup
1. Open a second terminal and navigate to the backend directory:
   ```bash
   cd citizen-legal-buddy-main/backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend/` folder and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Start the FastAPI backend server:
   ```bash
   python main.py
   ```
6. The backend API will now be running at: **http://localhost:8001**

## 4. System Verification
- **Frontend Check:** Open `http://localhost:5173` in your browser to verify the UI loads.
- **Backend Check:** Open `http://localhost:8001/docs` to view the FastAPI Swagger documentation.
- **Integration Check:** Navigate to the AI Chat feature on the frontend and send a test query to verify the end-to-end connection with the backend and Gemini API.
