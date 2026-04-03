const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  timestamp: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  transcript: {
    type: String,
    required: true,
  },
  is_financial: {
    type: Boolean,
    required: true,
  },
  entities: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  financial_advice: {
    type: String,
    default: null,
  },
  decision: {
    type: String,
    required: true,
  },
  risk_level: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  sentiment: {
    type: String,
    required: true,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
  },
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Conversation', conversationSchema);
