const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String, // Changed to String to support both MongoDB IDs and local IDs
    required: true,
    unique: true // One reflection per session
  },
  learnings: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Add indexes for better performance
reflectionSchema.index({ userId: 1, createdAt: -1 });
reflectionSchema.index({ sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Reflection', reflectionSchema);