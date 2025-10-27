const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['work', 'break', 'longBreak'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 180 // 3 hours max
  },
  completedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  efficiency: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
sessionSchema.index({ userId: 1, completedAt: -1 });
sessionSchema.index({ userId: 1, sessionType: 1, completedAt: -1 });
sessionSchema.index({ completedAt: 1, sessionType: 1 });

// Virtual for formatted date
sessionSchema.virtual('formattedDate').get(function() {
  return this.completedAt.toISOString().split('T')[0];
});

// Static method to get user's total focus time
sessionSchema.statics.getTotalFocusTime = function(userId, startDate = null) {
  const match = { userId, sessionType: 'work' };
  if (startDate) {
    match.completedAt = { $gte: startDate };
  }
  
  return this.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$duration' } } }
  ]);
};

// Instance method to check if session has reflection
sessionSchema.methods.hasReflection = async function() {
  const Reflection = mongoose.model('Reflection');
  const reflection = await Reflection.findOne({ sessionId: this._id });
  return !!reflection;
};

// Pre-save middleware to validate data
sessionSchema.pre('save', function(next) {
  // Ensure completedAt is not in the future
  if (this.completedAt > new Date()) {
    this.completedAt = new Date();
  }
  
  // Validate that break sessions are not too long
  if (this.sessionType !== 'work' && this.duration > 60) {
    next(new Error('Break sessions cannot be longer than 60 minutes'));
  }
  
  next();
});

module.exports = mongoose.model('Session', sessionSchema);