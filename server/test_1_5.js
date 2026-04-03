const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testOne() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('Gemini 1.5 Flash SUCCESS:', result.response.text().trim());
  } catch (err) {
    console.error('Gemini 1.5 Flash ERROR:', err.message);
  }
}

testOne();
