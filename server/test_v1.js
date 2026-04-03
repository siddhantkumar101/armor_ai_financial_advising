const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testV1() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Force v1 by using the models endpoint directly or checking if the SDK supports it
    // Actually, the SDK version I have might not support the apiVersion param easily in all versions, 
    // but I can use the fetch API to be sure.
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello' }] }] })
    });
    const data = await response.json();
    console.log('V1 Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('V1 Error:', err.message);
  }
}

testV1();
