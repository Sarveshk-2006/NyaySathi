const { callGeminiAPI } = require('./_lib/gemini');

// Same multipart parser as analyze-document
const parseMultipartBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
};

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

    let documentText = '';
    if (mimetype === 'application/pdf') {
      documentText = buffer.toString('utf8', 0, Math.min(50000, buffer.length))
        .replace(/[^\x20-\x7E\n]/g, ' ');
    } else if (mimetype === 'text/plain') {
      documentText = buffer.toString('utf8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or TXT file.' });
    }

    documentText = documentText.trim().replace(/\s+/g, ' ');

    if (documentText.length < 50) {
      return res.status(400).json({ error: 'Document is too short or could not be read.' });
    }

    const systemPrompt = `You are an expert legal AI assistant. Summarize the uploaded legal document in simple, easy-to-understand language.
- Identify the document type and purpose
- Explain key terms and clauses in plain language
- Highlight important dates, amounts, and obligations
- Point out any concerning clauses or risks
- Provide a brief overall assessment
Keep the summary concise but comprehensive.`;

    const { text, sources } = await callGeminiAPI(documentText, systemPrompt, false);
    res.json({ text, sources });
  } catch (error) {
    console.error('[API] Error in /api/upload-and-summarize:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };
