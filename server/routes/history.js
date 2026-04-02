/**
 * GET /api/history
 * Returns conversation history from MongoDB.
 */

const express = require('express');
const Conversation = require('../models/Conversation');

const router = express.Router();

router.get('/history', async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  try {
    const conversations = await Conversation.find()
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    // Transform _id to id for frontend compatibility
    const records = conversations.map(c => ({
      id: c._id.toString(),
      timestamp: c.timestamp,
      transcript: c.transcript,
      is_financial: c.is_financial,
      entities: c.entities,
      summary: c.summary,
      decision: c.decision,
      risk_level: c.risk_level,
      sentiment: c.sentiment,
      confidence_score: c.confidence_score,
    }));

    res.json({ total: records.length, conversations: records });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ detail: `Failed to fetch history: ${err.message}` });
  }
});

module.exports = router;
