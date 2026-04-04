/**
 * POST /api/process
 * Accepts a transcript string, runs NLP detection + LLM analysis,
 * saves the record to MongoDB, and returns structured output.
 */

const express = require('express');
const { isFinancialConversation, extractAmountsFromText } = require('../services/nlp');
const { analyzeConversation, generateAdvancedAdvice } = require('../services/llm');
const Conversation = require('../models/Conversation');

const auth = require('../middleware/auth');

const router = express.Router();

router.post('/process', auth, async (req, res) => {
  const { transcript } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ detail: 'Transcript cannot be empty.' });
  }

  const text = transcript.trim();

  try {
    // Step 1: Keyword-based financial detection
    const { isFinancial: isFin, confidence: baseConfidence } = isFinancialConversation(text);

    // Step 2: Extract amounts using regex (fast, no API call)
    const amountsFromRegex = extractAmountsFromText(text);

    // Step 3: LLM Full Analysis
    const llmResult = await analyzeConversation(text);

    const rawEntities = llmResult.entities || {};

    // Merge regex-found amounts with LLM-found amounts (dedupe, preserve order)
    const llmAmounts = rawEntities.amounts || [];
    const mergedAmounts = [...new Set([...llmAmounts, ...amountsFromRegex])];

    const entities = {
      emi: rawEntities.emi || null,
      sip: rawEntities.sip || null,
      loan: rawEntities.loan || null,
      amounts: mergedAmounts,
      banks: rawEntities.banks || [],
      investment_types: rawEntities.investment_types || [],
      time_periods: rawEntities.time_periods || [],
    };

    let summary = llmResult.summary || 'No summary available.';
    let decision = llmResult.decision || 'No decision identified.';
    let risk_level = llmResult.risk_level || 'medium';
    let sentiment = llmResult.sentiment || 'neutral';

    let isFinancial = isFin;
    let confidence = baseConfidence;
    if (entities.amounts.length > 0 || entities.emi || entities.sip || entities.loan || entities.banks.length > 0 || entities.investment_types.length > 0) {
      isFinancial = true;
      if (confidence < 0.7) confidence = 0.85;
    }
    
    // Robust numeric sanitization to prevent Mongoose ValidationErrors
    const sanitizeNum = (val) => {
      if (val === null || val === undefined || val === '') return null;
      if (typeof val === 'number') return val;
      const numStr = String(val).replace(/[^0-9.]/g, '');
      const parsed = parseFloat(numStr);
      return isNaN(parsed) ? null : parsed;
    };
    
    entities.emi = sanitizeNum(entities.emi);
    entities.sip = sanitizeNum(entities.sip);
    entities.loan = sanitizeNum(entities.loan);
    const safeIncome = sanitizeNum(llmResult.estimated_income);
    const safeRiskScore = sanitizeNum(llmResult.risk_score);

    // Step 3.5: If financial, generate highly advanced narrative advice safetly
    let financial_advice = llmResult.financial_advice || null;
    if (isFinancial) {
       financial_advice = await generateAdvancedAdvice(text, entities);
    }

    // Normalize
    if (!['low', 'medium', 'high'].includes(risk_level)) risk_level = 'medium';
    if (!['positive', 'negative', 'neutral'].includes(sentiment)) sentiment = 'neutral';

    // Step 4: Save to MongoDB
    const record = new Conversation({
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      transcript: text,
      is_financial: isFinancial,
      entities,
      summary,
      decision,
      financial_advice,
      risk_level,
      risk_score: safeRiskScore,
      risk_explanation: llmResult.risk_explanation || null,
      estimated_income: safeIncome,
      sentiment,
      emotion: llmResult.emotion || 'neutral',
      confidence_score: confidence,
    });

    await record.save();

    res.json({
      is_financial: isFinancial,
      entities,
      summary,
      decision,
      financial_advice,
      risk_level,
      risk_score: safeRiskScore,
      risk_explanation: llmResult.risk_explanation || null,
      estimated_income: safeIncome,
      sentiment,
      emotion: llmResult.emotion || 'neutral',
      confidence_score: confidence,
    });
  } catch (err) {
    console.error('Process error:', err);
    res.status(502).json({ detail: err.message || 'Analysis failed' });
  }
});

module.exports = router;
