const { callGeminiAPI } = require('./_lib/gemini');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

    const recentHistory = Array.isArray(history) ? history.slice(-6) : [];
    const historyText = recentHistory
      .map(h => `${h.role || 'user'}: ${trimText(h.text || h.message || '', 700)}`)
      .join('\n');

    const lang = (preferredLanguage || 'auto').toLowerCase();
    const languageInstruction =
      lang === 'hi' ? 'Respond entirely in Hindi.' :
      lang === 'mr' ? 'Respond entirely in Marathi.' :
      lang === 'en' ? 'Respond entirely in English.' :
      "Detect the user's language (Hindi/English/Marathi preferred); if uncertain, respond in clear English.";

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
    console.error('[API] Error in /api/smart-chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
