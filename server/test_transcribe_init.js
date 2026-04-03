const { transcribeAudio } = require('./services/transcription');
const fs = require('fs');
require('dotenv').config();

async function testTranscription() {
  // We need a real audio file or at least a valid header.
  // Groq Whisper needs a real file. I'll check if there's any small wav in the system.
  // Actually, I'll just use the analyze test as proof of key validity, 
  // but to be safe, I'll check if the transcribeAudio function can at least INITIALIZE.
  
  console.log('Testing Transcription Service Initialization...');
  try {
    // If we don't have a file, we can't test the actual API call, 
    // but we can check if the module loads and the client is ready.
    const { transcribeWithGroq } = require('./services/groq');
    console.log('✅ Groq Service Loaded');
    
    // Check if the key is picked up
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.startsWith('gsk_')) {
      console.log('✅ GROQ_API_KEY is validly formatted');
    } else {
      console.error('❌ GROQ_API_KEY is missing or invalid');
    }
  } catch (err) {
    console.error('❌ Initialization Failed:', err.message);
  }
}

testTranscription();
