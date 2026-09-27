module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // MySQL database is not available in Vercel serverless environment.
  // Return an informative empty response.
  res.json({
    message: 'Case law database is not available in the cloud deployment. This feature requires a connected MySQL database.',
    cases: [],
    crimeType: req.query.crimeType || 'unknown',
  });
};
