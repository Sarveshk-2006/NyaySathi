const { callGeminiAPI } = require('./_lib/gemini');

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { docType, formData } = req.body;
    if (!docType || !formData) {
      return res.status(400).json({ error: 'Missing docType or formData' });
    }

    const systemPrompt = `You are an expert Indian legal assistant AI. Generate professional, legally accurate documents based on the provided details.
- Use formal legal language appropriate for Indian courts and legal proceedings
- Include all standard legal clauses and provisions
- Format the document properly with headings, numbered clauses, and signatures
- Reference relevant Indian laws, acts, and IPC sections where applicable
- Include date, place, and party details as provided
- Make the document complete and ready to use`;

    const userQuery = `Generate a "${docType}" document with the following details: ${JSON.stringify(formData)}`;
    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, false);
    res.json({ text, sources });
  } catch (error) {
    console.error('[API] Error in /api/generate-document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
