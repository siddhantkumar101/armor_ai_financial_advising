const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test2_0_lite() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent('Say hello');
    console.log('2.0 Lite Response:', result.response.text());
  } catch (err) {
    console.error('2.0 Lite Error:', err.message);
  }
}

test2_0_lite();
