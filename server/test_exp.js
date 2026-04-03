const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testExp() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent('ok');
    console.log('SUCCESS:', result.response.text().trim());
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

testExp();
