/**
 * Armor – Financial Conversation Intelligence System
 * Express Application Entry Point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const transcribeRouter = require('./routes/transcribe');
const processRouter = require('./routes/process');
const historyRouter = require('./routes/history');
const authRouter = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', transcribeRouter);
app.use('/api', processRouter);
app.use('/api', historyRouter);
app.use('/api/auth', authRouter);

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Armor API' });
});

// ── MongoDB Connection & Server Start ──────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/armor_ai';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅  Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅  Armor backend is live at http://localhost:${PORT}`);
      console.log(`📖  Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = app;
