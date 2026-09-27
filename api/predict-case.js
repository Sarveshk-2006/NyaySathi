const { callGeminiAPI } = require('./_lib/gemini');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { caseDescription } = req.body;
    if (!caseDescription) {
      return res.status(400).json({ error: 'Missing caseDescription' });
    }

    const systemPrompt = `You are an expert Indian legal analyst AI specializing in case outcome prediction.
- Analyze the case based on Indian law (IPC, CrPC, Civil Procedure Code, etc.)
- Reference relevant precedents and similar landmark cases
- Provide a structured prediction with confidence level
- Consider both prosecution and defense perspectives
- Include applicable IPC sections and potential penalties
- Always include a disclaimer that this is predictive analysis only`;

    const { text, sources } = await callGeminiAPI(caseDescription, systemPrompt, true);
    res.json({ text, sources });
  } catch (error) {
    console.error('[API] Error in /api/predict-case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
