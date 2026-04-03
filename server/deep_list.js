const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Note: The SDK doesn't expose listModels directly easily without the client library, 
    // but we can try a few known ones.
    const candidates = [
      'gemini-1.5-flash', 
      'gemini-1.5-flash-latest', 
      'gemini-1.5-flash-001', 
      'gemini-1.5-flash-002', 
      'gemini-1.5-pro', 
      'gemini-1.5-pro-latest',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash-lite-preview-02-05',
      'gemini-2.0-flash-preview-05-14'
    ];
    
    for (const name of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: name });
        const res = await model.generateContent('ok');
        console.log(`✅ ${name} WORKS: ${res.response.text().trim()}`);
      } catch (e) {
        console.log(`❌ ${name} FAILED: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    console.error('List error:', err);
  }
}

listAll();
