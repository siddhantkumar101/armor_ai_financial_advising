require('dotenv').config();
const { transcribeWithGroq, analyzeWithGroq } = require('./services/groq');

async function verify() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'gsk_your_key_here') {
    console.error('❌ Error: GROQ_API_KEY is not set in .env. Please add your key from https://console.groq.com/keys');
    return;
  }

  console.log('Testing Groq Analysis...');
  try {
    const result = await analyzeWithGroq('Testing 1 2 3', 'You are a tester. Respond with {"status": "ok"}');
    console.log('✅ Analysis Success:', result);
  } catch (err) {
    console.error('❌ Analysis Failed:', err.message);
  }
}

verify();
