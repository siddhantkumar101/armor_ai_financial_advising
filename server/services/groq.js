/**
 * Groq Service – AI Analysis and Transcription.
 * Uses Llama 3.3 70B for analysis and Whisper Large V3 for transcription.
 */

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let ffmpegPath;
try {
  ffmpegPath = require('ffmpeg-static');
} catch { ffmpegPath = 'ffmpeg'; }

let groqClient = null;
function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'gsk_your_key_here') {
      throw new Error('GROQ_API_KEY is missing or invalid in .env');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Convert audio to WAV if it's in a format Whisper may not handle (WebM, OGG).
 * Returns the path to use (original or converted).
 */
function ensureCompatibleFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const needsConversion = ['.webm', '.ogg', '.m4a'].includes(ext);

  if (!needsConversion) return { path: filePath, cleanup: false };

  const wavPath = filePath.replace(ext, '.wav');
  console.log(`Converting ${ext} → .wav for Groq Whisper compatibility...`);

  try {
    execSync(
      `"${ffmpegPath}" -y -i "${filePath}" -ar 16000 -ac 1 -c:a pcm_s16le "${wavPath}"`,
      { stdio: 'pipe', timeout: 30000 }
    );
    console.log(`Conversion complete: ${wavPath} (${fs.statSync(wavPath).size} bytes)`);
    return { path: wavPath, cleanup: true };
  } catch (err) {
    console.warn('FFmpeg conversion failed, trying original file:', err.message);
    return { path: filePath, cleanup: false };
  }
}

/**
 * Transcribe audio using Groq Whisper.
 * @param {string} filePath 
 * @returns {Promise<{ transcript: string, language_detected: string|null }>}
 */
async function transcribeWithGroq(filePath, language) {
  let converted = null;
  try {
    const client = getGroqClient();
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    console.log(`Transcribing file: ${filePath} (${stats.size} bytes)`);

    if (stats.size === 0) {
      throw new Error('Audio file is empty. Please record for a longer duration.');
    }

    // Convert if needed (WebM → WAV)
    converted = ensureCompatibleFormat(filePath);

    const whisperOpts = {
      file: fs.createReadStream(converted.path),
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      // Whisper's prompt field acts as a style guide / context hint.
      // It tells Whisper what kind of text to expect, improving accuracy.
      prompt: 'Please transcribe exactly as spoken. Wait, if the person speaks Hinglish (a mix of Hindi and English), transcribe both languages exactly as spoken in Roman script. For example: "Mera naam Rahul hai and I want a car loan for 5 lakhs. Mera current SIP 15000 hai." Keep it entirely in Roman alphabet format. Do not translate Hindi into English.',
    };
    // Do NOT set language — Whisper auto-detects much better than forced mode.
    // Forced 'en' causes literal word-by-word Hindi→English translation.
    // Forced 'hi' outputs Devanagari script which breaks downstream processing.

    const transcription = await client.audio.transcriptions.create(whisperOpts);

    return {
      transcript: transcription.text,
      language_detected: transcription.language || 'unknown',
    };
  } catch (err) {
    console.error('Groq Transcription error:', err.message);
    if (err.message && err.message.includes('400')) {
      throw new Error('Audio format not supported. Please try uploading MP3 or WAV, or ensure your microphone is working.');
    }
    throw err;
  } finally {
    // Cleanup converted temp file
    if (converted && converted.cleanup) {
      try { fs.unlinkSync(converted.path); } catch (_) {}
    }
  }
}

/**
 * Analyze transcript using Groq Llama 3.3.
 * @param {string} transcript 
 * @param {string} systemPrompt 
 * @returns {Promise<object>}
 */
async function analyzeWithGroq(transcript, systemPrompt) {
  try {
    const client = getGroqClient();
    const finalSystemPrompt = systemPrompt.toLowerCase().includes('json') 
      ? systemPrompt 
      : systemPrompt + ' Respond in JSON format.';

    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: `Transcript: ${transcript}` }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    let content = completion.choices[0].message.content;
    // Sanitize unescaped physical newlines that crash JSON.parse
    content = content.replace(/[\n\r]+/g, ' ');
    return JSON.parse(content);
  } catch (err) {
    console.error('Groq Analysis error:', err.message);
    throw err;
  }
}

module.exports = { transcribeWithGroq, analyzeWithGroq, getGroqClient };

