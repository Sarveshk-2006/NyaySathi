const { callGeminiAPI } = require('./_lib/gemini');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

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
      verdicts = [
        { caseName: "Recent Verdicts Unavailable", court: "N/A", date: "N/A", summary: text.slice(0, 200) + "..." }
      ];
    }

    res.json({ verdicts, sources });
  } catch (error) {
    console.error('[API] Error in /api/recent-verdicts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
