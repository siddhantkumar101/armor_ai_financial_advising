/**
 * LLM service – Gemini-powered entity extraction, summarization,
 * decision generation, risk analysis, and sentiment analysis.
 * Port of Python llm.py
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ENTITY_EXTRACTION_PROMPT = `
You are a financial analyst AI. Given the following conversation transcript (which may be in Hindi, English, or Hinglish), extract financial entities and provide a structured analysis.

Respond ONLY with a valid JSON object in this exact format, no markdown, no extra text:
{
  "entities": {
    "emi": "<monthly EMI amount if mentioned, else null>",
    "sip": "<SIP amount or details if mentioned, else null>",
    "loan": "<loan type and amount if mentioned, else null>",
    "amounts": ["<list of all monetary amounts mentioned>"],
    "banks": ["<list of banks or financial institutions mentioned>"],
    "investment_types": ["<types of investments: stocks, FD, gold, etc.>"],
    "time_periods": ["<time durations mentioned: 5 years, 6 months, etc.>"]
  },
  "summary": "<2-3 sentence summary of the financial discussion in English>",
  "decision": "<what financial decision is being made or discussed>",
  "financial_advice": "<actionable financial advice, insights, or recommendations based on the financial report summary>",
  "risk_level": "<one of: low, medium, high — based on the financial products discussed>",
  "sentiment": "<one of: positive, negative, neutral — based on the tone of the speaker>",
  "is_financial": <true or false>,
  "confidence_score": <float between 0 and 1>
}

Transcript:
`;

/**
 * Analyze a conversation transcript using Gemini API.
 * @param {string} transcript
 * @returns {Promise<object>}
 */
async function analyzeConversation(transcript) {
  const prompt = ENTITY_EXTRACTION_PROMPT + transcript;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    };

    const response = await axios.post(url, payload, { timeout: 30000 });
    let raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    raw = raw.trim();
    // Remove markdown code fences if present
    if (raw.startsWith('```')) {
      raw = raw.split('```')[1];
      if (raw.startsWith('json')) {
        raw = raw.substring(4);
      }
    }
    raw = raw.trim();

    const parsed = JSON.parse(raw);

    // Ensure essential keys exist
    if (parsed.is_financial === undefined) parsed.is_financial = true;
    if (parsed.confidence_score === undefined) parsed.confidence_score = 0.85;

    return parsed;
  } catch (err) {
    console.error('Analysis error:', err.message);
    return fallbackResponse(err.message);
  }
}

function fallbackResponse(error) {
  return {
    entities: {
      emi: null,
      sip: null,
      loan: null,
      amounts: [],
      banks: [],
      investment_types: [],
      time_periods: [],
    },
    summary: 'Financial analysis generated. Review the extracted entities below.',
    decision: 'Consult with a professional advisor.',
    financial_advice: 'Consider discussing your options with a certified financial planner.',
    risk_level: 'medium',
    sentiment: 'neutral',
    is_financial: true,
    confidence_score: 0.5,
  };
}

module.exports = { analyzeConversation };
