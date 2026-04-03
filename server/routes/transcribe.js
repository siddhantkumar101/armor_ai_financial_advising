/**
 * POST /api/transcribe
 * Accepts an audio file, saves it, transcribes via Gemini, returns transcript.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { transcribeAudio } = require('../services/transcription');

const router = express.Router();

// Configure multer for file uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_AUDIO_SIZE_MB = parseInt(process.env.MAX_AUDIO_SIZE_MB || '25', 10);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_AUDIO_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.includes('application')
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported media type: ${file.mimetype}`), false);
    }
  },
});

const auth = require('../middleware/auth');

router.post('/transcribe', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded.' });
  }

  const filePath = req.file.path;
  const language = req.body.language || 'auto'; // 'en', 'hi', or 'auto'

  try {
    const result = await transcribeAudio(filePath, language);
    res.json({
      transcript: result.transcript,
      language_detected: result.language_detected,
      duration_seconds: result.duration_seconds,
    });
  } catch (err) {
    res.status(502).json({ detail: err.message || 'Transcription failed' });
  } finally {
    // Cleanup uploaded file
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (_) {}
  }
});

module.exports = router;
