/**
 * Transcription service using Google Gemini File API.
 * Port of Python transcription.py
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const path = require('path');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

/**
 * Transcribe an audio file using Gemini File API.
 * @param {string} filePath – absolute path to the audio file
 * @returns {Promise<{ transcript: string, language_detected: string|null, duration_seconds: number|null }>}
 */
async function transcribeAudio(filePath) {
  try {
    // Determine MIME type from extension
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.mp3': 'audio/mp3',
      '.wav': 'audio/wav',
      '.webm': 'audio/webm',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.mp4': 'audio/mp4',
      '.flac': 'audio/flac',
    };
    const mimeType = mimeMap[ext] || 'audio/mp3';

    // Upload file to Gemini
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName: path.basename(filePath),
    });

    // Wait for processing
    let file = uploadResult.file;
    while (file.state === 'PROCESSING') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      file = await fileManager.getFile(file.name);
    }

    if (file.state === 'FAILED') {
      throw new Error(`File processing failed: ${file.error || 'Unknown error'}`);
    }

    // Generate transcription
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      'You are an expert transcriber. Transcribe the spoken audio perfectly word-for-word in its original language (Hindi/English/Hinglish). Do not summarize, just output the exact words spoken. If there is barely any audio, return an empty string.',
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      },
    ]);

    const text = result.response.text();

    return {
      transcript: text.trim(),
      language_detected: 'unknown',
      duration_seconds: null,
    };
  } catch (err) {
    console.error('Transcription error:', err.message);
    return {
      transcript: `API Error: ${err.message}`,
      language_detected: null,
      duration_seconds: null,
    };
  }
}

module.exports = { transcribeAudio };
