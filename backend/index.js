const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer'); // For file uploads
const pdf = require('pdf-parse'); // To read PDF text

const app = express();
const port = 8001;

// Multer setup: Store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

/**
 * Calls the Gemini API from the backend.
 */
async function callGeminiAPI(userQuery, systemPrompt, useGrounding = false, maxRetries = 5) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in .env file');
    return { text: 'Error: Server is not configured with an API key.', sources: [] };
  }
  
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
  };

  if (useGrounding) {
    payload.tools = [{ "google_search": {} }];
  }
  
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 500 || response.status === 503) {
          throw new Error(`Retryable API Error: ${response.status}`);
        } else {
          const errorResult = await response.json();
          console.error('Non-retryable API Error:', errorResult);
          return { text: `Error: ${errorResult.error?.message || 'Failed to get response.'}`, sources: [] };
        }
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        const text = candidate.content.parts[0].text;
        let sources = [];
        const groundingMetadata = candidate.groundingMetadata;

        if (useGrounding && groundingMetadata && groundingMetadata.groundingAttributions) {
          sources = groundingMetadata.groundingAttributions
            .map(attribution => ({
              uri: attribution.web?.uri,
              title: attribution.web?.title,
            }))
            .filter(source => source.uri && source.title);
        }
        return { text, sources };
      } else {
        return { text: 'Error: No valid content received from API.', sources: [] };
      }
    } catch (error) {
      console.warn(`[Server] API call attempt ${i + 1} failed: ${error.message}`);
      if (i === maxRetries - 1) {
        return { text: `Error: API request failed after ${maxRetries} attempts.`, sources: [] };
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  
  return { text: 'Error: Unexpected error during API call.', sources: [] };
}

// --- API Endpoints ---

// 1. Document Generator Endpoint
app.post('/api/generate-document', async (req, res) => {
  console.log('[Server] Request received for /api/generate-document');
  try {
    const { docType, formData } = req.body;
    if (!docType || !formData) {
      return res.status(400).json({ error: 'Missing docType or formData' });
    }
    const systemPrompt = `You are a legal assistant AI...`; // (Full prompt)
    const userQuery = `Generate a "${docType}" document with the following details: ${JSON.stringify(formData)}`;
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, false);
    res.json({ text, sources });
  } catch (error) {
    console.error('[Server] Error in /api/generate-document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Case Predictor Endpoint
app.post('/api/predict-case', async (req, res) => {
  console.log('[Server] Request received for /api/predict-case');
  try {
    const { caseDescription } = req.body;
    if (!caseDescription) {
      return res.status(400).json({ error: 'Missing caseDescription' });
    }
    const systemPrompt = `You are a legal analyst AI...`; // (Full prompt)
    const userQuery = caseDescription; 
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, true);
    res.json({ text, sources });
  } catch (error) {
    console.error('[Server] Error in /api/predict-case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Recent Verdicts Endpoint
app.get('/api/recent-verdicts', async (req, res) => {
  console.log('[Server] Request received for /api/recent-verdicts');
  try {
    const systemPrompt = `You are a legal news AI...`; // (Full prompt)
    const userQuery = "Find 5 recent significant court verdicts in India.";
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, true);
    // Sanitize text: remove repeated punctuation artifacts and collapse whitespace
    const sanitize = (s) => {
      if (!s) return s;
      let t = s.replace(/[\-_,]{2,}/g, ' '); // replace runs of - _ , with space
      t = t.replace(/\s{2,}/g, ' ');
      t = t.replace(/[\u200B-\u200D\uFEFF]/g, '');
      t = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      // remove sequences like '----,,,,'
      t = t.replace(/[-]{3,}|[,]{3,}|[.]{3,}/g, '');
      return t.trim();
    };

    const parseVerdictsFromText = (txt, sourcesArr = []) => {
      const cleaned = sanitize(txt || '');
      if (!cleaned) return [];

      // If markdown table present
      if (/\|\s*Case Name\s*\|/i.test(cleaned)) {
        const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l !== '');
        let headerIndex = lines.findIndex((l, i) => /\|\s*Case Name\s*\|/i.test(l) && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1] || ''));
        if (headerIndex === -1) headerIndex = lines.findIndex(l => l.startsWith('|'));
        const out = [];
        if (headerIndex !== -1) {
          for (let i = headerIndex + 2; i < lines.length; i++) {
            const ln = lines[i];
            if (!ln.startsWith('|')) continue;
            const cols = ln.split('|').slice(1, -1).map(c => c.trim());
            const caseName = cols[0] || 'N/A';
            const date = cols[1] || 'N/A';
            const court = cols[2] || 'N/A';
            const summary = cols.slice(3).join(' | ') || '';
            out.push({ caseName, court, date, summary });
          }
        }
        return out;
      }

      // If bold-field style
      if (/\*\*Case Name:\*\*/.test(cleaned)) {
        const blocks = cleaned.split(/\n(?=\d\.\s*\*\*Case Name:\*\*)/).map(b => b.trim()).filter(b => b !== '');
        return blocks.map((block, idx) => {
          const caseName = block.match(/\*\*Case Name:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || `Verdict ${idx + 1}`;
          const court = block.match(/\*\*Court:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
          const date = block.match(/\*\*Date:\*\* (.*?)\n/)?.[1]?.replace(/\*/g, '').trim() || 'N/A';
          const summary = block.match(/\*\*Summary:\*\* ([\s\S]*)/)?.[1]?.replace(/\*/g, '').trim() || block;
          return { caseName, court, date, summary };
        });
      }

      // Fallback: split by double newlines and treat each as an item
      const parts = cleaned.split(/\n{2,}/).map(p => p.trim()).filter(p => p !== '');
      if (parts.length > 1) {
        return parts.map((p, idx) => ({ caseName: p.split('\n')[0].slice(0, 120), court: 'N/A', date: 'N/A', summary: p }));
      }

      // Final fallback: single item with full cleaned text
      return [{ caseName: 'Recent Verdicts', court: 'N/A', date: 'N/A', summary: cleaned }];
    };

    const verdicts = parseVerdictsFromText(text, sources);
    res.json({ verdicts, sources });
  } catch (error) {
    console.error('[Server] Error in /api/recent-verdicts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Document Summarizer (File Upload)
app.post('/api/upload-and-summarize', upload.single('document'), async (req, res) => {
  console.log('[Server] Request received for /api/upload-and-summarize');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  let documentText = '';

  try {
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdf(req.file.buffer);
      documentText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      documentText = req.file.buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
    }

    if (documentText.trim().length < 50) {
      return res.status(400).json({ error: 'Document is too short or could not be read.' });
    }

    const systemPrompt = `You are an expert legal AI assistant. A user has uploaded a legal document. Your task is to provide a simple, easy-to-understand summary...`; // (Full prompt)
    
    const { text, sources } = await callGeminiAPI(documentText, systemPrompt, false);
    
    res.json({ text, sources });

  } catch (error) {
    console.error('[Server] Error in /api/upload-and-summarize:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`[Server] Legal Buddy backend running on http://localhost:${port}`);
});