const { callGeminiAPI } = require('./_lib/gemini');

// Vercel serverless: parse multipart form data manually
const parseMultipartBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      resolve(body);
    });
    req.on('error', reject);
  });
};

const extractTextFromBuffer = (buffer, mimetype) => {
  if (mimetype === 'text/plain' || mimetype === 'text/markdown') {
    return buffer.toString('utf8');
  }
  // For PDF and DOC, extract printable text (basic extraction)
  return buffer.toString('utf8', 0, Math.min(50000, buffer.length))
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

// Parse multipart/form-data to extract file buffer
const parseMultipartFormData = (body, contentType) => {
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/);
  if (!boundaryMatch) return null;

  const boundary = boundaryMatch[1];
  const bodyStr = body.toString('binary');
  const parts = bodyStr.split(`--${boundary}`);

  for (const part of parts) {
    if (part.includes('Content-Disposition') && part.includes('filename=')) {
      const filenameMatch = part.match(/filename="([^"]+)"/);
      const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/i);
      const filename = filenameMatch ? filenameMatch[1] : 'unknown';
      const fileContentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

      // Find the actual data after double CRLF
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;

      const fileData = part.substring(headerEnd + 4, part.lastIndexOf('\r\n'));
      const fileBuffer = Buffer.from(fileData, 'binary');

      return { filename, mimetype: fileContentType, buffer: fileBuffer };
    }
  }
  return null;
};

const handler = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const contentType = req.headers['content-type'] || '';
    const rawBody = await parseMultipartBody(req);

    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Request must be multipart/form-data' });
    }

    const fileInfo = parseMultipartFormData(rawBody, contentType);
    if (!fileInfo) {
      return res.status(400).json({ error: 'No file found in request.' });
    }

    const { filename, mimetype, buffer } = fileInfo;

    const supportedTypes = [
      'application/pdf', 'text/plain', 'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!supportedTypes.includes(mimetype)) {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF, TXT, or DOC file.' });
    }

    let documentText = extractTextFromBuffer(buffer, mimetype);
    documentText = documentText.replace(/\s+/g, ' ').trim();

    if (documentText.length < 50) {
      return res.status(400).json({ error: 'Document is too short or could not be read. Please ensure the document has sufficient content.' });
    }

    if (documentText.length > 50000) {
      documentText = documentText.substring(0, 50000);
    }

    const systemPrompt = `You are an expert Indian legal document analyzer. Analyze the provided legal document and provide a detailed analysis including:

## 1. Document Overview
- Document Type, Name/Title, Date, Jurisdiction

## 2. Parties Involved
- All parties, their roles and relationships

## 3. Summary
- Concise 2-3 sentence summary

## 4. Key Provisions & Clauses
- Most important clauses in simple terms
- Obligations and rights

## 5. Legal Implications
- Legal consequences, applicable laws

## 6. Potential Risks & Issues
- Ambiguous clauses, missing provisions, compliance concerns

## 7. Important Dates & Deadlines
- Key dates, validity period

## 8. Recommendations
- Actions to take, red flags, legal advice

Format with clear headings and bullet points.`;

    const { text, sources } = await callGeminiAPI(documentText, systemPrompt, false);

    if (text.startsWith('Error:')) {
      return res.status(500).json({ error: text });
    }

    res.json({ text, sources, fileName: filename });
  } catch (error) {
    console.error('[API] Error in /api/analyze-document:', error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
};

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
