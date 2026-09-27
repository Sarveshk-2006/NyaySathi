const { callGeminiAPI } = require('./_lib/gemini');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { caseType, description, evidence, defendant, plaintiff, state, facts } = req.body;

    if (!caseType || !description) {
      return res.status(400).json({ error: 'Missing required fields: caseType and description' });
    }

    const systemPrompt = `You are an expert Indian legal case outcome predictor with deep knowledge of:
- Indian Penal Code (IPC) and Criminal Procedure Code (CrPC)
- Case law precedents and judicial patterns
- Sentencing guidelines and factors affecting outcomes
- Evidence evaluation and case strength assessment

Your task is to predict the likely outcome of a legal case based on the details provided.

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

## RECOMMENDATIONS
1. Immediate actions to strengthen the case
2. Evidence to gather or preserve
3. Legal strategy suggestions
4. Potential challenges to prepare for

## IMPORTANT DISCLAIMER
This is a predictive analysis based on patterns and should not replace professional legal counsel.`;

    const userQuery = `Case Type: ${caseType}

Case Description:
${description}

${evidence ? `Evidence Available:\n${evidence}` : ''}
${plaintiff ? `Plaintiff: ${plaintiff}` : ''}
${defendant ? `Defendant: ${defendant}` : ''}
${state ? `Jurisdiction: ${state}` : ''}
${facts ? `Key Facts:\n${facts}` : ''}

Based on the above information, provide a comprehensive case outcome prediction.`;

    const { text, sources } = await callGeminiAPI(userQuery, systemPrompt, false);

    const outcomeMatch = text.match(/PREDICTED OUTCOME[\s\S]*?\[?([A-Za-z\/\s]+)\]?/i);
    const confidenceMatch = text.match(/CONFIDENCE LEVEL[\s\S]*?(\d+)[-–]?(\d+)?%/i);

    const predictedOutcome = outcomeMatch ? outcomeMatch[1].trim() : 'Analysis Required';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 60;

    res.json({
      prediction: predictedOutcome,
      confidence,
      analysis: text,
      sources,
      similarCasesCount: 0,
      similarCases: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error in /api/predict-outcome:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
