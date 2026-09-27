// Shared Gemini API caller for Vercel serverless functions
let currentApiKeyIndex = 0;

/**
 * Calls the Gemini API with Model Fallback & Key Rotation
 */
async function callGeminiAPI(userQuery, systemPrompt, useGrounding = false) {
  const apiKeyString = process.env.GEMINI_API_KEY;
  if (!apiKeyString) {
    return { text: 'Error: Server is not configured with a GEMINI_API_KEY.', sources: [] };
  }

  const apiKeys = apiKeyString.split(',').map(k => k.trim()).filter(k => k);
  if (apiKeys.length === 0) {
    return { text: 'Error: No valid API keys found.', sources: [] };
  }

  const payload = {
    contents: [{ parts: [{ text: userQuery }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
  };

  if (useGrounding) {
    payload.tools = [{ "google_search": {} }];
  }

  const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'];
  let keyAttempts = 0;

  while (keyAttempts < apiKeys.length) {
    const currentKey = apiKeys[currentApiKeyIndex];

    for (const model of candidateModels) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentKey}`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          const candidate = result.candidates?.[0];
          if (candidate?.content?.parts?.[0]?.text) {
            const text = candidate.content.parts[0].text;
            let sources = [];
            const groundingMetadata = candidate.groundingMetadata;
            if (useGrounding && groundingMetadata?.groundingAttributions) {
              sources = groundingMetadata.groundingAttributions
                .map(a => ({ uri: a.web?.uri, title: a.web?.title }))
                .filter(s => s.uri && s.title);
            }
            return { text, sources };
          }
        }

        const errorResult = await response.json().catch(() => ({}));
        const errorMsg = errorResult.error?.message || response.statusText;

        if (response.status === 403 || (response.status === 400 && errorMsg.includes('API key not valid'))) {
          break;
        } else if (response.status === 429) {
          break;
        } else if (response.status === 404) {
          continue;
        }
      } catch (error) {
        // network error, try next model
      }
    }

    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    keyAttempts++;
  }

  return {
    text: "⚠️ Gemini API Key issue detected. Please check that GEMINI_API_KEY is set correctly in Vercel environment variables.",
    sources: [],
  };
}

module.exports = { callGeminiAPI };
