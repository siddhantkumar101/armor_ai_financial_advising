/**
 * LLM service – Gemini-powered entity extraction, summarization,
 * decision generation, risk analysis, and sentiment analysis.
 * Port of Python llm.py
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { analyzeWithGroq } = require('./groq');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const ENTITY_EXTRACTION_PROMPT = `
You are an expert financial analyst AI. Given the following conversation transcript (which may be in Hindi, English, or Hinglish), extract financial entities and provide a structured analysis.

IMPORTANT RULES:
- All monetary values (emi, sip, loan, estimated_income) MUST be pure numbers (e.g. 50000), NOT strings with currency symbols.
- If no value is mentioned, use null.
- Always write summary and advice in English.
- Be as accurate as possible — do not hallucinate or invent values not in the transcript.

Respond ONLY with a valid JSON object in this exact format:
{
  "entities": {
    "emi": <monthly EMI as a number, e.g. 45000, or null>,
    "sip": <SIP amount as a number, e.g. 15000, or null>,
    "loan": <loan amount as a number, e.g. 500000, or null>,
    "loan_type": "<type of loan: home, car, personal, education, etc. or null>",
    "amounts": ["<list of all monetary amounts mentioned as strings>"],
    "banks": ["<list of banks or financial institutions mentioned>"],
    "investment_types": ["<types of investments: stocks, FD, gold, mutual funds, etc.>"],
    "time_periods": ["<time durations mentioned: 5 years, 6 months, etc.>"]
  },
  "summary": "<2-3 sentence summary of the financial discussion in English>",
  "decision": "<what financial decision is being made or discussed>",
  "financial_advice": "<actionable financial advice based on the conversation>",
  "risk_level": "<one of: low, medium, high>",
  "risk_score": <integer 0-100>,
  "risk_explanation": "<brief explanation for the risk score>",
  "estimated_income": <monthly income as a number, or null if not mentioned>,
  "sentiment": "<one of: positive, negative, neutral>",
  "emotion": "<one of: confident, stressed, confused, curious, anxious>",
  "is_financial": <true or false>,
  "confidence_score": <float between 0.0 and 1.0>
}
`;

/**
 * Analyze a conversation transcript using Gemini API.
 * @param {string} transcript
 * @returns {Promise<object>}
 */
async function analyzeConversation(transcript) {
  const prompt = ENTITY_EXTRACTION_PROMPT + '\nTranscript:\n' + transcript;

  try {
    // Primary: Groq
    if (GROQ_API_KEY && GROQ_API_KEY !== 'gsk_your_key_here') {
      return await analyzeWithGroq(transcript, ENTITY_EXTRACTION_PROMPT);
    }

    // Fallback: Gemini (Quota limited to 20/day)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const result = await model.generateContent(prompt);
    let raw = result.response.text() || '{}';

    raw = raw.trim();
    // Remove markdown code fences if present (SDK usually handles this with responseMimeType, but safety first)
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

/**
 * Secondary LLM pass designed exclusively for producing high-level narrative advice.
 * @param {string} transcript 
 * @param {object} entities 
 * @returns {Promise<string>}
 */
async function generateAdvancedAdvice(transcript, entities) {
  const prompt = `You are an elite financial advisor. Based on this transcript and extracted data, provide highly sophisticated and specific financial advice in 4-6 bullet points. 
DO NOT respond in JSON. Respond only with the formatted bullet points.
Include:
1) Assessment of financial health and liquidity. 
2) Debt-to-Income (DTI) ratio analysis if numbers are present. 
3) Sophisticated investment strategies (asset allocation, index vs active funds).
4) Risk mitigation and portfolio diversification.
5) Long-term wealth creation strategies.

Extracted Data: ${JSON.stringify(entities, null, 2)}
Transcript: ${transcript}
`;

  try {
    if (GROQ_API_KEY && GROQ_API_KEY !== 'gsk_your_key_here') {
      const { getGroqClient } = require('./groq');
      const client = getGroqClient();
      const completion = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
      });
      return completion.choices[0].message.content.trim();
    }
    
    // Fallback: Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Advanced Advice generation failed:', err.message);
    return "Advanced financial analysis could not be generated at this time. Please consult a human advisor for deep strategic planning.";
  }
}

module.exports = { analyzeConversation, generateAdvancedAdvice };
