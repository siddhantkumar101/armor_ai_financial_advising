/**
 * Armor – Financial Conversation Intelligence System
 * Express Application Entry Point
 */

require('dotenv').config();

// Global crash handlers (for cloud deploy debugging)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5181',
  'https://armor-ai-financial-advisi-git-d4aed1-siddhantkumar101s-projects.vercel.app',
];
// Also allow any *.vercel.app subdomain for preview deploys
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for now, tighten later
    }
  },
  credentials: true
}));
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

console.log('PORT=' + PORT);
console.log('MONGODB_URI=' + (MONGODB_URI ? '***set***' : 'MISSING'));
console.log('GROQ_API_KEY=' + (process.env.GROQ_API_KEY ? '***set***' : 'MISSING'));

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Armor backend is live on port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

module.exports = app;
