# AI Case Outcome Prediction Strategy

This document outlines the strategy for sourcing real legal data and modifying the system to predict case outcomes using AI.

## 1. Sourcing Real Indian Legal Data

To train a highly accurate legal AI model, you need structured datasets of past cases, summaries, IPC sections, and ultimate judgments.

### Recommended Data Sources:

1. **Indian Kanoon API / Scraping**
   - **What it is:** The largest free repository of Indian court judgments.
   - **How to use:** You can use Python (`BeautifulSoup` or `Scrapy`) to fetch cases or use their official API. 
   - **Data points:** Case Title, Judge Name, Date, Full Text of Judgment.

2. **Kaggle Datasets (Ready-to-use)**
   - **ILDC (Indian Legal Documents Corpus):** A massive dataset of Supreme Court of India judgments specifically built for training legal AI models.
   - **Indian Supreme Court Judgments Dataset:** Contains thousands of structured case records.
   - *Search terms on Kaggle:* "Indian Court Judgments", "IPC cases dataset".

3. **eCourts Services (Govt. of India)**
   - **What it is:** Official repository.
   - **How to use:** Access summary case statuses, hearing history, and final orders. (Note: Scraping might be restricted; look for open-source dumps of this data on GitHub).

## 2. Preparing the Data for AI

Once you download the case data (typically as CSV or JSON), you need to process it into a format the model can learn from.

**Input Features (X):** 
- Case Category (criminal, civil, family)
- IPC Sections invoked (e.g., IPC 420, IPC 379)
- Case Synopsis / Facts
- Previous Adjournment Count

**Target Output (Y):** 
- Case Outcome (`disposed`, `dismissed`, `convicted`, `acquitted`)
- Estimated Duration (Time taken from filing to disposal)

## 3. Training the AI Model

For predicting case outcomes based on legal text, standard Machine Learning models (like Random Forest) work, but Large Language Models (LLMs) are far superior.

### Recommended Model: InLegalBERT
*InLegalBERT* is a pre-trained variant of BERT fine-tuned specifically on Indian legal documents.

**Setup Instructions (Python/PyTorch):**
1. Load `InLegalBERT` from HuggingFace (`AutoModelForSequenceClassification`).
2. Feed your dataset (`Synopsis + IPC sections`) into the model.
3. Fine-tune the model to predict the `Outcome` class.
4. Export the trained model as an API endpoint (using FastAPI or Flask) in the `backend/` folder.

### Integration with Court Portal
Once the model is running on your Python backend:
1. When a Clerk/Judge enters a new case's synopsis and sections on the frontend...
2. The frontend sends the synopsis to the Python backend via an API call (`POST /predict-outcome`).
3. The backend runs the AI model and returns:
   - *Predicted Outcome:* e.g., 85% probability of 'Disposed in favored of Plaintiff'.
   - *Estimated Time:* e.g., '14-18 months'.
4. Store these predictions in the Firebase `cases` document so they can be displayed on the Judge Dashboard analytics.

---

## 4. Current Real-Time Sync Architecture

Regarding the UI edit capabilities: The current architecture in the portal *already* supports real-time synchronization between the Judge and Citizen views.

### How it works:
1. **Editing:** On the Judge Dashboard -> **Case Management** tab, clicking the "Edit Case" (Pen icon) allows the judge to update Status, Next Hearing Date, and add Notes.
2. **Database:** This submits an `updateDoc` directly to the Firebase `cases` collection.
3. **Citizen View:** The Citizen Portal uses `onSnapshot` (Firebase's real-time WebSocket listener). The moment the judge saves the edit, Firebase pushes the updated case record to the citizen's browser instantly—no refresh required.