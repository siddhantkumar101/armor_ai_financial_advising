/**
 * Keyword-based financial topic detector.
 * Supports Hindi, English, and Hinglish financial terms.
 * Port of Python nlp.py – pure rule-based NLP.
 */

const FINANCIAL_KEYWORDS = new Set([
  // English
  'emi', 'loan', 'sip', 'mutual fund', 'insurance', 'premium', 'investment',
  'interest', 'interest rate', 'tax', 'income tax', 'gst', 'salary', 'income',
  'expense', 'budget', 'credit card', 'debit card', 'bank', 'savings', 'fixed deposit',
  'fd', 'rd', 'recurring deposit', 'stock', 'share', 'equity', 'gold', 'property',
  'real estate', 'rent', 'mortgage', 'principal', 'tenure', 'installment', 'finance',
  'profit', 'loss', 'return', 'yield', 'portfolio', 'asset', 'liability', 'debt',
  'credit score', 'cibil', 'net worth', 'dividend', 'nifty', 'sensex', 'inflation',
  'ppf', 'epf', 'nps', 'retirement', 'pension',
  // Hindi / Hinglish
  'ब्याज', 'किश्त', 'क़र्ज़', 'कर्ज़', 'बचत', 'निवेश', 'बीमा', 'प्रीमियम',
  'वेतन', 'आय', 'खर्च', 'बजट', 'बैंक', 'ब्याज दर', 'मुनाफा', 'नुकसान',
  'emi bharna', 'loan lena', 'sip karna', 'paisa', 'rupaya', 'rupaye', 'lakhs',
  'lakh', 'crore', 'karod', 'हज़ार', 'लाख', 'करोड़', 'रुपये', 'पैसा',
  'investing', 'invest karna', 'policy', 'jama', 'udhaar', 'mahina',
  'monthly', 'yearly', 'sawal', 'percent', 'faida', 'invest',
]);

/**
 * Check if a conversation is financial using keyword matching.
 * @param {string} text
 * @returns {{ isFinancial: boolean, confidence: number }}
 */
function isFinancialConversation(text) {
  if (!text) return { isFinancial: false, confidence: 0.0 };

  const textLower = text.toLowerCase();
  let matchCount = 0;

  for (const kw of FINANCIAL_KEYWORDS) {
    if (textLower.includes(kw)) {
      matchCount++;
    }
  }

  const confidence = Math.min(1.0, matchCount * 0.15);
  const isFinancial = matchCount >= 1;

  return { isFinancial, confidence: Math.round(confidence * 100) / 100 };
}

/**
 * Extract monetary amounts from text using regex patterns.
 * @param {string} text
 * @returns {string[]}
 */
function extractAmountsFromText(text) {
  if (!text) return [];

  const patterns = [
    /₹\s?[\d,]+(?:\.\d+)?(?:\s?(?:lakh|crore|k|thousand|million))?/gi,
    /[\d,]+(?:\.\d+)?\s?(?:lakh|crore|k|thousand|rupees|rupay[ae]?|rs\.?)/gi,
    /rs\.?\s?[\d,]+(?:\.\d+)?/gi,
    /[\d,]+(?:\.\d+)?\s?(?:%|percent|प्रतिशत)/gi,
  ];

  const amounts = [];
  for (const pattern of patterns) {
    const found = text.match(pattern);
    if (found) {
      amounts.push(...found.map(a => a.trim()));
    }
  }

  // Deduplicate while preserving order
  const seen = new Set();
  const unique = [];
  for (const amt of amounts) {
    const key = amt.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(amt);
    }
  }

  return unique;
}

module.exports = { isFinancialConversation, extractAmountsFromText };
