const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test2_5() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('2.5 Response:', result.response.text());
  } catch (err) {
    console.error('2.5 Error:', err.message);
  }
}

test2_5();
