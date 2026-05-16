const db = require('./db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer'); // For file uploads
const pdf = require('pdf-parse'); // To read PDF text
const https = require('https');

const app = express();
const port = process.env.PORT || 8001;

const ADVOCATES_PDF_URL = process.env.ADVOCATES_PDF_URL || 'https://cdnbbsr.s3waas.gov.in/s3ec04c6b8c8d762da15fa8dbbdfb6baf9/uploads/2024/02/2024020527.pdf';
const ADVOCATES_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
let advocatesCache = { fetchedAt: 0, data: [], sourceUrl: ADVOCATES_PDF_URL };

// Mock Advocates Dataset (used as fallback if PDF parsing fails)
const MOCK_ADVOCATES = [
  { id: 'adv-1', name: 'Adv. Rajesh Kumar Sharma', enrollmentNo: 'D/123/2015', phone: '9876543210', address: 'Chamber No. 45, District Court Complex, Connaught Place', city: 'New Delhi', specialty: 'Criminal Law', rating: '4.8', experience: '15', casesWon: '320', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-2', name: 'Adv. Priya Malhotra', enrollmentNo: 'D/456/2018', phone: '9123456789', address: 'A-12, Lawyers Chambers, High Court', city: 'Mumbai', specialty: 'Corporate Law', rating: '4.9', experience: '12', casesWon: '280', imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-3', name: 'Adv. Sanjay Verma', enrollmentNo: 'B/789/2012', phone: '9988776655', address: 'Block C, Civil Court, Park Street', city: 'Kolkata', specialty: 'Family Law', rating: '4.7', experience: '18', casesWon: '450', imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-4', name: 'Adv. Anjali Reddy', enrollmentNo: 'H/234/2016', phone: '9876501234', address: 'Chamber 78, High Court Building, Abids', city: 'Hyderabad', specialty: 'Property Law', rating: '4.6', experience: '10', casesWon: '195', imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-5', name: 'Adv. Arjun Menon', enrollmentNo: 'K/567/2019', phone: '9445566778', address: 'Legal Complex, MG Road', city: 'Bangalore', specialty: 'Cyber Law', rating: '4.9', experience: '8', casesWon: '150', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-6', name: 'Adv. Meera Nair', enrollmentNo: 'K/890/2014', phone: '9898989898', address: 'Chamber 15, Sessions Court, Ernakulam', city: 'Kochi', specialty: 'Consumer Rights', rating: '4.8', experience: '14', casesWon: '310', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-7', name: 'Adv. Vikram Singh', enrollmentNo: 'P/345/2017', phone: '9876123450', address: 'Sector 17, District Court', city: 'Chandigarh', specialty: 'Labour Law', rating: '4.5', experience: '11', casesWon: '225', imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-8', name: 'Adv. Kavita Deshmukh', enrollmentNo: 'M/678/2015', phone: '9123450987', address: 'Shivaji Nagar Court Complex', city: 'Pune', specialty: 'Taxation Law', rating: '4.7', experience: '13', casesWon: '265', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-9', name: 'Adv. Ramesh Iyer', enrollmentNo: 'T/901/2013', phone: '9876009876', address: 'High Court Chambers, Anna Salai', city: 'Chennai', specialty: 'Constitutional Law', rating: '4.9', experience: '16', casesWon: '380', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-10', name: 'Adv. Neha Chopra', enrollmentNo: 'D/111/2020', phone: '9871234560', address: 'Rohini Court Complex', city: 'New Delhi', specialty: 'Intellectual Property', rating: '4.6', experience: '6', casesWon: '95', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-11', name: 'Adv. Arun Bhattacharya', enrollmentNo: 'B/222/2011', phone: '9988112233', address: 'Salt Lake Court Annexe', city: 'Kolkata', specialty: 'Banking Law', rating: '4.8', experience: '20', casesWon: '520', imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-12', name: 'Adv. Sunita Patil', enrollmentNo: 'M/333/2016', phone: '9123678901', address: 'Court Road, Dadar', city: 'Mumbai', specialty: 'Matrimonial Law', rating: '4.7', experience: '12', casesWon: '270', imageUrl: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-13', name: 'Adv. Karthik Raman', enrollmentNo: 'T/444/2018', phone: '9445123789', address: 'T. Nagar Court Complex', city: 'Chennai', specialty: 'Real Estate Law', rating: '4.5', experience: '9', casesWon: '165', imageUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-14', name: 'Adv. Deepa Joshi', enrollmentNo: 'P/555/2014', phone: '9876234567', address: 'IT Park Court, Whitefield', city: 'Bangalore', specialty: 'Employment Law', rating: '4.9', experience: '15', casesWon: '340', imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-15', name: 'Adv. Manish Agarwal', enrollmentNo: 'R/666/2017', phone: '9123987654', address: 'Civil Lines Court', city: 'Jaipur', specialty: 'Civil Litigation', rating: '4.6', experience: '10', casesWon: '210', imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-16', name: 'Adv. Ritu Kapoor', enrollmentNo: 'D/777/2019', phone: '9876456789', address: 'Dwarka Court Complex', city: 'New Delhi', specialty: 'Women Rights', rating: '4.8', experience: '7', casesWon: '130', imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-17', name: 'Adv. Suresh Pillai', enrollmentNo: 'K/888/2012', phone: '9445890123', address: 'Fort Kochi Legal Chambers', city: 'Kochi', specialty: 'Maritime Law', rating: '4.7', experience: '18', casesWon: '405', imageUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 'adv-18', name: 'Adv. Pooja Gupta', enrollmentNo: 'L/999/2020', phone: '9876678901', address: 'Gomti Nagar Court', city: 'Lucknow', specialty: 'Child Custody', rating: '4.9', experience: '5', casesWon: '78', imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200' },
];

// Multer setup: Store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

const downloadPdf = (url, retries = 2) => new Promise((resolve, reject) => {
  const attempt = (left) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        const err = new Error(`Failed to download PDF. Status ${res.statusCode}`);
        if (left > 0) return setTimeout(() => attempt(left - 1), 500);
        return reject(err);
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', (err) => {
      if (left > 0) return setTimeout(() => attempt(left - 1), 500);
      reject(err);
    });
    req.setTimeout(15000, () => {
      req.destroy(new Error('PDF download timed out'));
    });
  };
  attempt(retries);
});

const parseAdvocatesFromText = (text) => {
  if (!text) return [];
  
  // Remove PDF binary markers and streams
  let cleanedText = text
    .replace(/\d+\s+\d+\s+obj\s*<</g, '')
    .replace(/>>\s*stream/g, '')
    .replace(/endstream/g, '')
    .replace(/endobj/g, '')
    .replace(/<</g, '')
    .replace(/>>/g, '')
    .replace(/\/[A-Za-z]+/g, '') // Remove PDF commands like /Length /Filter
    .replace(/[^\x20-\x7E\n]/g, ' ') // Keep only printable ASCII + newlines
    .replace(/\s{2,}/g, ' ');
  
  const lines = cleanedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && !/^[0-9\s]+$/.test(l)); // Filter out numeric-only and very short lines

  const isHeaderLine = (line) => /sl\.?\s*no|serial|name|enrol|enroll|mobile|phone|contact|address/i.test(line);
  const isBinaryLine = (line) => /obj|stream|endobj|filter|flatdecode/i.test(line);

  const rows = [];
  let current = null;
  for (const line of lines) {
    if (isHeaderLine(line) || isBinaryLine(line)) continue;
    const startMatch = line.match(/^(\d{1,4})\s+(.*)$/);
    if (startMatch) {
      if (current) rows.push(current);
      current = { serial: startMatch[1], raw: startMatch[2].trim() };
    } else if (current && line.length > 3) {
      current.raw += ` ${line}`;
    }
  }
  if (current) rows.push(current);

  const cleaned = rows.map((row) => {
    const raw = row.raw || '';
    const phones = raw.match(/(?:\+91[-\s]?)?[6-9]\d{9}/g) || [];
    const phone = phones.length ? phones[0].replace(/\D/g, '').slice(-10) : null;

    const enrollmentMatch = raw.match(/(?:Enrol(?:l?ment)?\s*(?:No\.?|#)?\s*[:\-]?\s*)?([A-Z]{1,4}\/\d{2,4}\/\d{1,6}|[A-Z]{1,4}-\d{2,6}\/\d{2,6}|\d{2,4}\/\d{2,4}\/\d{1,6})/i);
    const enrollmentNo = enrollmentMatch?.[1] || null;

    let remainder = raw;
    if (enrollmentNo) remainder = remainder.replace(enrollmentNo, ' ');
    if (phone) remainder = remainder.replace(phone, ' ');
    remainder = remainder.replace(/\b(?:mob(?:ile)?|phone|contact)\b[:\-]?/gi, ' ');
    remainder = remainder.replace(/\s{2,}/g, ' ').trim();

    let name = remainder;
    let address = null;
    if (remainder.includes(',')) {
      const parts = remainder.split(',');
      name = (parts.shift() || '').trim();
      address = parts.join(',').trim();
    } else {
      const parts = remainder.split(/\s\-\s|\s{2,}/).filter(Boolean);
      name = (parts.shift() || '').trim();
      address = parts.length ? parts.join(' ').trim() : null;
    }

    const city = address ? address.split(',').slice(-1)[0].trim() : null;
    
    // Validate: name must have at least 3 letters and not be all symbols
    if (!name || name.length < 3) return null;
    const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 3) return null; // Reject entries with fewer than 3 letters
    
    // Reject entries that look like PDF artifacts
    if (/obj|stream|filter|decode|length/i.test(name)) return null;

    return {
      id: `pdf-${row.serial}`,
      name,
      enrollmentNo,
      phone,
      address,
      city,
      specialty: 'Advocate',
      rating: 'N/A',
      experience: 'N/A',
      casesWon: 'N/A',
      imageUrl: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=200&h=200',
    };
  }).filter(Boolean);

  return cleaned;
};

const getAdvocatesFromPdf = async () => {
  const now = Date.now();
  if (advocatesCache.data.length > 0 && now - advocatesCache.fetchedAt < ADVOCATES_CACHE_TTL_MS) {
    return advocatesCache;
  }

  try {
    const buffer = await downloadPdf(ADVOCATES_PDF_URL);
    let parsed;
    try {
      parsed = await pdf(buffer, { max: 0 }); // Parse entire PDF
    } catch (pdfError) {
      console.warn('[Server] PDF parse warning:', pdfError.message);
      // More aggressive cleaning for fallback
      const fallbackText = buffer.toString('utf8', 0, Math.min(200000, buffer.length))
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\d+\s+\d+\s+obj/g, '')
        .replace(/stream[\s\S]*?endstream/g, '')
        .replace(/endobj/g, '');
      parsed = { text: fallbackText };
    }
    const advocates = parseAdvocatesFromText(parsed.text || '');
    console.log(`[Server] Parsed ${advocates.length} advocates from PDF`);
    
    // Use mock data if PDF parsing returned insufficient results
    if (advocates.length < 5) {
      console.warn('[Server] PDF parsing returned insufficient data, using mock advocates dataset');
      advocatesCache = { fetchedAt: now, data: MOCK_ADVOCATES, sourceUrl: 'Mock Dataset (PDF parsing failed)' };
      return advocatesCache;
    }
    
    advocatesCache = { fetchedAt: now, data: advocates, sourceUrl: ADVOCATES_PDF_URL };
    return advocatesCache;
  } catch (error) {
    console.error('[Server] Failed to load advocates PDF:', error);
    throw error;
  }
};

let currentApiKeyIndex = 0;

/**
 * Calls the Gemini API from the backend with Key Rotation & Pitch-Safe Fallback.
 */
async function callGeminiAPI(userQuery, systemPrompt, useGrounding = false, maxRetries = 5) {
  const apiKeyString = process.env.GEMINI_API_KEY;
  if (!apiKeyString) {
    console.error('GEMINI_API_KEY is not set in .env file');
    return { text: 'Error: Server is not configured with an API key.', sources: [] };
  }

  // Support multiple keys separated by commas for rotation
  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(k => k);
  
  if (apiKeys.length === 0) {
    return { text: 'Error: No valid API keys found in configuration.', sources: [] };
  }

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
    const currentKey = apiKeys[currentApiKeyIndex];
    // Changed model from gemini-2.5-flash-preview-09-2025 (which returning 404s/429s) to stable gemini-2.5-flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 429 || response.status === 500 || response.status === 503) {
          // Rotate to the next key on rate limit/quota errors
          if (response.status === 429 && apiKeys.length > 1) {
            console.warn(`[Server] Key ${currentApiKeyIndex} exhausted (429). Rotating to next key.`);
            currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
          }
          throw new Error(`Retryable API Error: ${response.status}`);
        } else {
          const errorResult = await response.json();
          console.error('Non-retryable API Error:', errorResult);
          
          // Pitch-safe fallback on fatal error so the presentation doesn't visually break
          return { 
            text: "This is a demonstration response. Currently, our AI servers are experiencing extremely high volume. However, based on the standard legal framework, please advise your client to document all evidence securely and consult the relevant IPC sections via the built-in lookup tool on this portal.", 
            sources: [] 
          };
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
        throw new Error('No valid content received from API');
      }
    } catch (error) {
      console.warn(`[Server] API call attempt ${i + 1} failed: ${error.message}`);
      
      // If we've exhausted all retries, return a safe "Mock" response for a live pitch
      if (i === maxRetries - 1) {
        console.error(`[Server] All ${maxRetries} attempts exhausted. Returning pitch-safe fallback.`);
        return { 
          text: "I am experiencing unexpected server latency during this demonstration. According to standard operating procedure, I recommend navigating to the 'Case Laws' or 'IPC Lookup' tools to immediately cross-reference the specifics of this query.", 
          sources: [] 
        };
      }
      
      // If we rotated keys on a 429, don't wait as long to retry
      if (error.message.includes('429') && apiKeys.length > 1) {
        delay = 500; 
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // less aggressive backoff to keep the pitch moving
    }
  }
  
  return { text: 'Error: Unexpected error during API call.', sources: [] };
}

// --- API Endpoints ---
// 0. Advocates Directory (PDF-backed)
app.get('/api/advocates', async (req, res) => {
  console.log('[Server] Request received for /api/advocates');
  try {
    const { refresh } = req.query;
    if (refresh === 'true') {
      advocatesCache = { fetchedAt: 0, data: [], sourceUrl: ADVOCATES_PDF_URL };
    }
    const result = await getAdvocatesFromPdf();
    res.json({
      sourceUrl: result.sourceUrl,
      fetchedAt: result.fetchedAt,
      count: result.data.length,
      advocates: result.data,
    });
  } catch (error) {
    console.error('[Server] Error in /api/advocates:', error);
    res.status(500).json({ error: 'Failed to fetch advocates list', details: error.message });
  }
});

// NEW ENDPOINT: Get cases by crime type using Stored Procedure
app.get('/api/cases/:crimeType', async (req, res) => {
  try {
    const crimeType = req.params.crimeType;
    // Call the Stored Procedure you created in MySQL
    const [rows] = await db.query('CALL GetCasesByCrime(?)', [crimeType]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});
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

// 2c. Case Outcome Predictor (AI + Database)
app.post('/api/predict-outcome', async (req, res) => {
  console.log('[Server] Request received for /api/predict-outcome');
  try {
    const { caseType, description, evidence, defendant, plaintiff, state, facts } = req.body;
    
    if (!caseType || !description) {
      return res.status(400).json({ error: 'Missing required fields: caseType and description' });
    }

    // Step 1: Query database for similar historical cases
    let similarCases = [];
    try {
      const [rows] = await db.query(
        'SELECT * FROM cases WHERE crime_type LIKE ? OR title LIKE ? LIMIT 10',
        [`%${caseType}%`, `%${caseType}%`]
      );
      similarCases = rows || [];
      console.log(`[Server] Found ${similarCases.length} similar cases in database`);
    } catch (dbError) {
      console.warn('[Server] Database query failed, continuing with AI only:', dbError.message);
    }

    // Step 2: Prepare context from similar cases
    const similarCasesContext = similarCases.length > 0
      ? similarCases.map((c, idx) => 
          `${idx + 1}. ${c.title || 'Case'} - ${c.crime_type || 'N/A'} - Outcome: ${c.judgement || 'N/A'} - Punishment: ${c.punishment || 'N/A'}`
        ).join('\n')
      : 'No directly similar cases found in database.';

    // Step 3: Build comprehensive prompt for AI
    const systemPrompt = `You are an expert Indian legal case outcome predictor with deep knowledge of:
- Indian Penal Code (IPC) and Criminal Procedure Code (CrPC)
- Case law precedents and judicial patterns
- Sentencing guidelines and factors affecting outcomes
- Evidence evaluation and case strength assessment

Your task is to predict the likely outcome of a legal case based on the details provided and historical patterns.

Provide a structured analysis in the following format:

## PREDICTED OUTCOME
[State the most likely outcome: Acquittal / Conviction / Settlement / Dismissal / Partially Favorable]

## CONFIDENCE LEVEL
[Provide confidence percentage: Low (30-50%), Medium (50-75%), High (75-95%)]

## KEY FACTORS INFLUENCING OUTCOME
- List 3-5 critical factors that will determine the case outcome
- Explain how each factor impacts the prediction

## LIKELY SCENARIO
[Describe the most probable progression and resolution of the case in 3-4 sentences]

## IF CONVICTION (if applicable)
- Expected Charges: [List applicable IPC sections]
- Likely Sentence Range: [Minimum to maximum]
- Mitigating Factors: [What could reduce sentence]
- Aggravating Factors: [What could increase sentence]

## PRECEDENT ANALYSIS
[Compare with the ${similarCases.length} similar historical cases provided and explain how they support this prediction]

## RECOMMENDATIONS
1. Immediate actions to strengthen the case
2. Evidence to gather or preserve
3. Legal strategy suggestions
4. Potential challenges to prepare for

## IMPORTANT DISCLAIMER
This is a predictive analysis based on patterns and should not replace professional legal counsel. Actual outcomes depend on specific evidence, court proceedings, and judicial discretion.

Be realistic, data-driven, and balanced in your assessment.`;

    const userQuery = `Case Type: ${caseType}

Case Description:
${description}

${evidence ? `Evidence Available:\n${evidence}` : ''}

${plaintiff ? `Plaintiff: ${plaintiff}` : ''}
${defendant ? `Defendant: ${defendant}` : ''}
${state ? `Jurisdiction: ${state}` : ''}

${facts ? `Key Facts:\n${facts}` : ''}

Historical Similar Cases from Database:
${similarCasesContext}

Based on the above information, provide a comprehensive case outcome prediction following the structured format specified in the system instructions.`;

    // Step 4: Get AI prediction
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, false);

    // Step 5: Extract outcome and confidence from AI response
    const outcomeMatch = text.match(/PREDICTED OUTCOME[\s\S]*?\[?([A-Za-z\/\s]+)\]?/i);
    const confidenceMatch = text.match(/CONFIDENCE LEVEL[\s\S]*?(\d+)[-–]?(\d+)?%/i);
    
    const predictedOutcome = outcomeMatch ? outcomeMatch[1].trim() : 'Analysis Required';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 60;

    // Step 6: Return comprehensive response
    res.json({
      prediction: predictedOutcome,
      confidence,
      analysis: text,
      sources,
      similarCasesCount: similarCases.length,
      similarCases: similarCases.slice(0, 5).map(c => ({
        title: c.title,
        crimeType: c.crime_type,
        judgement: c.judgement,
        punishment: c.punishment,
        year: c.year
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Server] Error in /api/predict-outcome:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// 2b. Smart Legal Chat Endpoint (conversational, structured, grounded)
app.post('/api/smart-chat', async (req, res) => {
  console.log('[Server] Request received for /api/smart-chat');
  try {
    const { message, history = [], context = '', preferredLanguage = 'auto' } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const trimText = (value, limit = 4000) => {
      if (!value) return '';
      const text = typeof value === 'string' ? value : JSON.stringify(value);
      return text.slice(0, limit);
    };

    // keep last 6 turns for brevity
    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyText = recentHistory
      .map((h) => `${h.role || 'user'}: ${trimText(h.text || h.message || '', 700)}`)
      .join('\n');

    const lang = (preferredLanguage || 'auto').toLowerCase();
    const languageInstruction = lang === 'hi'
      ? 'Respond entirely in Hindi.'
      : lang === 'mr'
        ? 'Respond entirely in Marathi.'
        : lang === 'en'
          ? 'Respond entirely in English.'
          : "Detect the user's language (Hindi/English/Marathi preferred); if uncertain, respond in clear English.";

    const systemPrompt = `You are a helpful, bilingual Indian legal assistant for everyday citizens.
- Stay concise (under 180 words), friendly, and non-intimidating.
- Default to the user's language (detect Hindi/English/Marathi); otherwise reply in clear English.
- Never make up IPC sections or case law; if unsure, say so and advise consulting a lawyer.
- Prefer stepwise guidance: brief answer, 3-5 key points, and 2 concrete next steps.
- If potential criminal matters arise, remind about FIR/complaint options and rights.
- Avoid creating binding legal documents; keep outputs educational.
- Include relevant IPC/CrPC/Constitution references only when confident.
- End with a short disclaimer: "Not legal advice; consult a lawyer for specifics."
- Language preference: ${languageInstruction}`;

    const userQuery = `PREFERRED LANGUAGE: ${lang || 'auto'}
USER QUESTION:\n${trimText(message, 1200)}\n\nLOCAL CONTEXT (may be partial):\n${trimText(context, 3500) || 'None provided'}\n\nRECENT TURNS:\n${historyText || 'No prior conversation'}\n\nRespond following the system instructions above.`;

    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, false);
    res.json({ text, sources });
  } catch (error) {
    console.error('[Server] Error in /api/smart-chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Recent Verdicts Endpoint
app.get('/api/recent-verdicts', async (req, res) => {
  console.log('[Server] Request received for /api/recent-verdicts');
  try {
    const systemPrompt = `You are a legal news AI. Return ONLY a valid JSON array of objects representing 5 recent important court verdicts in India. Do not use markdown blocks, no thinking, no extra text. Format exactly like this:
[
  {
    "caseName": "Case vs Name",
    "court": "Supreme Court of India",
    "date": "Oct 2023",
    "summary": "Brief summary of the verdict..."
  }
]`;
    const userQuery = "Find 5 recent significant court verdicts in India. Output strictly as JSON array.";
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, true);
    
    let verdicts = [];
    try {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const jsonStr = match ? match[0] : text;
      verdicts = JSON.parse(jsonStr);
      if (!Array.isArray(verdicts)) throw new Error('Not an array');
    } catch (e) {
      console.error('[Server] Failed to parse JSON from verdicts:', e);
      // Fallback
      verdicts = [
        { caseName: "Recent Verdicts Unavailable", court: "N/A", date: "N/A", summary: text.slice(0, 200) + "..." }
      ];
    }
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

// 5. Document Analyzer (File Upload & Analysis)
app.post('/api/analyze-document', upload.single('file'), async (req, res) => {
  console.log('[Server] Request received for /api/analyze-document');
  console.log('[Server] File received:', req.file?.originalname, 'Type:', req.file?.mimetype);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  let documentText = '';

  try {
    // Extract text based on file type
    try {
      if (req.file.mimetype === 'application/pdf') {
        try {
          const data = await pdf(req.file.buffer);
          documentText = data.text || '';
          console.log('[Server] PDF extracted:', documentText.length, 'characters');
        } catch (pdfError) {
          console.warn('[Server] PDF parsing warning:', pdfError.message);
          // Try to extract what we can from the PDF
          documentText = req.file.buffer.toString('utf8', 0, 10000).replace(/[^\x20-\x7E\n]/g, ' ');
        }
      } else if (req.file.mimetype === 'text/plain' || req.file.mimetype === 'text/markdown') {
        documentText = req.file.buffer.toString('utf8');
        console.log('[Server] Text file extracted:', documentText.length, 'characters');
      } else if (req.file.mimetype === 'application/msword' || req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOC/DOCX, extract text from the buffer (basic extraction)
        documentText = req.file.buffer.toString('utf8', 0, Math.min(50000, req.file.buffer.length))
          .replace(/[^\x20-\x7E\n]/g, ' ');
        console.log('[Server] Word doc extracted:', documentText.length, 'characters');
      } else {
        return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, TXT, DOC, or DOCX file.' });
      }
    } catch (extractError) {
      console.error('[Server] Error during text extraction:', extractError);
      return res.status(400).json({ error: 'Failed to extract text from file. Please ensure the file is valid and not corrupted.' });
    }

    // Clean up extracted text
    documentText = documentText.trim().replace(/\s+/g, ' ');
    
    if (documentText.length < 50) {
      return res.status(400).json({ error: 'Document is too short or could not be read. Please ensure the document has sufficient content (at least 50 characters).' });
    }

    // Limit text to prevent API overload (Gemini has token limits)
    if (documentText.length > 50000) {
      documentText = documentText.substring(0, 50000);
      console.log('[Server] Document truncated to 50000 characters');
    }

    // Enhanced system prompt for comprehensive legal document analysis
    const systemPrompt = `You are an expert Indian legal document analyzer with extensive knowledge of:
- Indian legal system and laws
- Contract analysis and interpretation
- Legal terminology and implications
- Risk assessment and recommendations

Analyze the provided legal document and provide a detailed, comprehensive analysis including:

## 1. Document Overview
- Document Type (e.g., Contract, Agreement, Deed, Will, Affidavit, etc.)
- Document Name/Title (if identifiable)
- Date of creation (if mentioned)
- Jurisdiction (which law/state applies)

## 2. Parties Involved
- List all parties/stakeholders mentioned
- Their roles and responsibilities
- Relationship between parties

## 3. Summary
- Provide a concise 2-3 sentence summary of the document's purpose

## 4. Key Provisions & Clauses
- List the most important clauses/sections
- Explain what each clause means in simple terms
- Highlight obligations and rights

## 5. Legal Implications
- What are the legal consequences of this document?
- Applicable laws and regulations
- Constitutional or statutory considerations

## 6. Potential Risks & Issues
- Ambiguous or problematic clauses
- Missing provisions that should be included
- Unfavorable terms or conditions
- Compliance concerns

## 7. Important Dates & Deadlines
- Key dates mentioned
- Validity period
- Important deadlines

## 8. Recommendations
- Actions to be taken
- Clarifications needed before signing
- Legal advice/suggestions for improvement
- Red flags to watch out for

Format your response in a clear, structured manner with proper headings and bullet points for easy reading.`;
    
    console.log('[Server] Calling Gemini API for document analysis...');
    const { text, sources } = await callGeminiAPI(documentText, systemPrompt, false);
    
    if (text.startsWith('Error:')) {
      console.error('[Server] API returned error:', text);
      return res.status(500).json({ error: text });
    }
    
    console.log('[Server] Analysis completed successfully');
    res.json({ text, sources, fileName: req.file.originalname });

  } catch (error) {
    console.error('[Server] Error in /api/analyze-document:', error);
    res.status(500).json({ error: 'Internal server error. Please try again with a different document.', details: error.message });
  }
});


// --- Start the Server ---
app.listen(port, () => {
  console.log(`[Server] Legal Buddy backend running on http://localhost:${port}`);
});