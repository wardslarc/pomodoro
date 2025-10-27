const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  learnings: {
    type: String,
    required: [true, 'Learnings are required'],
    trim: true,
    maxlength: [1000, 'Learnings cannot exceed 1000 characters']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }]
}, {
  timestamps: true
});

// Index for efficient queries
reflectionSchema.index({ userId: 1, createdAt: -1 });
reflectionSchema.index({ sessionId: 1 });

module.exports = mongoose.model('Reflection', reflectionSchema);