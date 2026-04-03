const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testBeta() {
  // Specify v1beta in the constructor
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const models = [
    'gemini-2.0-flash-lite', 
    'gemini-2.0-flash', 
    'gemini-1.5-flash', 
    'gemini-2.0-flash-exp'
  ];

  for (const name of models) {
    try {
      console.log(`\nTesting ${name} (v1beta)...`);
      // Use v1beta for the specific model if needed, or check the SDK docs.
      // In @google/generative-ai, you can pass apiVersion in the getGenerativeModel or constructor.
      const model = genAI.getGenerativeModel({ model: name }, { apiVersion: 'v1beta' });
      const result = await model.generateContent('Say ok');
      console.log(`✅ ${name} SUCCESS: ${result.response.text().trim()}`);
    } catch (err) {
      console.log(`❌ ${name} ERROR: ${err.message.split('\n')[0]}`);
    }
  }
}

testBeta();
