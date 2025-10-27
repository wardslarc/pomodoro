const express = require('express');
const Reflection = require('../models/Reflection');
const Session = require('../models/Session');
const auth = require('../middleware/auth');
const { validateReflection } = require('../middleware/validation');

const router = express.Router();

// Create reflection
router.post('/', auth, validateReflection, async (req, res) => {
  try {
    const { sessionId, learnings, createdAt } = req.body;

    console.log('💭 Creating reflection for session:', sessionId);

    // Check if it's a local session (starts with 'local-')
    const isLocalSession = sessionId.startsWith('local-');
    
    if (!isLocalSession) {
      // Verify the session belongs to the user (for database sessions only)
      const session = await Session.findOne({
        _id: sessionId,
        userId: req.user._id
      });

      if (!session) {
        console.log('❌ Session not found or does not belong to user');
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
    } else {
      console.log('🔧 Handling local session, skipping database session verification');
    }

    // Check if reflection already exists for this session
    const existingReflection = await Reflection.findOne({ sessionId });
    if (existingReflection) {
      console.log('❌ Reflection already exists for session:', sessionId);
      return res.status(400).json({
        success: false,
        message: 'Reflection already exists for this session'
      });
    }

    const reflection = new Reflection({
      userId: req.user._id,
      sessionId,
      learnings,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    await reflection.save();
    console.log('✅ Reflection created successfully');

    res.status(201).json({
      success: true,
      data: {
        reflection
      },
      message: 'Reflection saved successfully'
    });
  } catch (error) {
    console.error('❌ Error creating reflection:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating reflection: ' + error.message
    });
  }
});

// Get reflections for user
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    
    const reflections = await Reflection.find({ userId: req.user._id })
      .populate('sessionId', 'sessionType duration completedAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reflection.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        reflections,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reflections'
    });
  }
});

// Get reflection by session ID
router.get('/session/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const reflection = await Reflection.findOne({
      sessionId,
      userId: req.user._id
    }).populate('sessionId', 'sessionType duration completedAt');

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }

    res.json({
      success: true,
      data: {
        reflection
      }
    });
  } catch (error) {
    console.error('Error fetching reflection:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reflection'
    });
  }
});

// Update reflection
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { learnings } = req.body;

    // Basic validation
    if (!learnings || learnings.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Learnings content is required'
      });
    }

    const reflection = await Reflection.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { learnings, updatedAt: new Date() },
      { new: true }
    );

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }

    res.json({
      success: true,
      data: {
        reflection
      },
      message: 'Reflection updated successfully'
    });
  } catch (error) {
    console.error('Error updating reflection:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating reflection'
    });
  }
});

// Delete reflection
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const reflection = await Reflection.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }

    res.json({
      success: true,
      message: 'Reflection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reflection'
    });
  }
});

module.exports = router;