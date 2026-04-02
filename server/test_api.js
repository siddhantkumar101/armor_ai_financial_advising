const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Say hello');
    console.log(`✅ ${modelName} works! Response: ${result.response.text()}`);
  } catch (err) {
    console.error(`❌ ${modelName} failed: ${err.message}`);
  }
}

async function run() {
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-flash-8b');
  await testModel('gemini-2.0-flash-lite-preview-02-05');
  await testModel('gemini-2.5-flash');
}

run();
