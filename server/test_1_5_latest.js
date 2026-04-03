const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test1_5_latest() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model.generateContent('Say hello');
    console.log('1.5 Latest Response:', result.response.text());
  } catch (err) {
    console.error('1.5 Latest Error:', err.message);
  }
}

test1_5_latest();
