const Reflection = require('../models/Reflection');
const Session = require('../models/Session');

exports.createReflection = async (req, res, next) => {
  try {
    const { sessionId, learnings, rating, tags } = req.body;

    // Verify session exists and belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const reflection = await Reflection.create({
      userId: req.user.id,
      sessionId,
      learnings,
      rating,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Reflection created successfully',
      data: {
        reflection
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getReflections = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reflections = await Reflection.find({ userId: req.user.id })
      .populate('sessionId', 'sessionType duration completedAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Reflection.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        reflections,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReflection = async (req, res, next) => {
  try {
    const { learnings, rating, tags } = req.body;

    const reflection = await Reflection.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { learnings, rating, tags },
      { new: true, runValidators: true }
    ).populate('sessionId', 'sessionType duration completedAt');

    if (!reflection) {
      return res.status(404).json({
        success: false,
        message: 'Reflection not found'
      });
    }

    res.json({
      success: true,
      message: 'Reflection updated successfully',
      data: {
        reflection
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReflection = async (req, res, next) => {
  try {
    const reflection = await Reflection.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
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
    next(error);
  }
};