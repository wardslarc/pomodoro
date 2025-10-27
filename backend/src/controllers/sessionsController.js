const Session = require('../models/Session');
const Reflection = require('../models/Reflection');
const { ApiResponse, created, ok, notFound } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @desc    Create a new session
 * @route   POST /api/sessions
 * @access  Private
 */
exports.createSession = async (req, res) => {
  try {
    const { sessionType, duration, completedAt, notes, tags } = req.body;

    const session = await Session.create({
      userId: req.user.id,
      sessionType,
      duration,
      completedAt: completedAt || new Date(),
      notes,
      tags
    });

    logger.info(`Session created for user ${req.user.id}`, {
      sessionId: session._id,
      sessionType,
      duration
    });

    return created('Session recorded successfully', session);
  } catch (error) {
    logger.error('Session creation error:', error);
    throw error;
  }
};

/**
 * @desc    Get user's sessions with filtering and pagination
 * @route   GET /api/sessions
 * @access  Private
 */
exports.getSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      sessionType, 
      startDate, 
      endDate,
      sortBy = 'completedAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter object
    const filter = { userId: req.user.id };
    
    if (sessionType) {
      filter.sessionType = sessionType;
    }
    
    if (startDate || endDate) {
      filter.completedAt = {};
      if (startDate) filter.completedAt.$gte = new Date(startDate);
      if (endDate) filter.completedAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const sessions = await Session.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Session.countDocuments(filter);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalSessions: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    };

    return ok('Sessions retrieved successfully', sessions, { pagination });
  } catch (error) {
    logger.error('Get sessions error:', error);
    throw error;
  }
};

/**
 * @desc    Get session statistics and analytics
 * @route   GET /api/sessions/stats
 * @access  Private
 */
exports.getSessionStats = async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    // Basic session type statistics
    const sessionStats = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$sessionType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Total sessions count
    const totalSessions = await Session.countDocuments({
      userId: req.user._id,
      completedAt: { $gte: startDate }
    });

    // Total focus time (work sessions only)
    const totalFocusTime = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          sessionType: 'work',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$duration' }
        }
      }
    ]);

    // Daily/weekly activity
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') {
      dateFormat = '%Y-%U'; // Year-Week number
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    const activityStats = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: dateFormat, date: '$completedAt' } }
          },
          totalSessions: { $sum: 1 },
          workSessions: {
            $sum: { $cond: [{ $eq: ['$sessionType', 'work'] }, 1, 0] }
          },
          breakSessions: {
            $sum: { $cond: [{ $eq: ['$sessionType', 'break'] }, 1, 0] }
          },
          longBreakSessions: {
            $sum: { $cond: [{ $eq: ['$sessionType', 'longBreak'] }, 1, 0] }
          },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Best day and time analysis
    const bestDayStats = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$completedAt' },
            hour: { $hour: '$completedAt' }
          },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { sessionCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Streak calculation
    const uniqueDates = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Calculate current streak
    let currentStreak = 0;
    let currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    const dateSet = new Set(uniqueDates.map(d => d._id));

    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (dateSet.has(dateString)) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return ok('Session statistics retrieved successfully', {
      overview: {
        totalSessions,
        totalFocusTime: totalFocusTime[0]?.total || 0,
        currentStreak,
        period: {
          startDate,
          endDate: new Date(),
          days: parseInt(days)
        }
      },
      byType: sessionStats,
      activity: activityStats,
      bestTimes: bestDayStats,
      uniqueDates: uniqueDates.length
    });
  } catch (error) {
    logger.error('Get session stats error:', error);
    throw error;
  }
};

/**
 * @desc    Get a specific session by ID
 * @route   GET /api/sessions/:id
 * @access  Private
 */
exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!session) {
      return notFound('Session not found');
    }

    // Get associated reflection if exists
    const reflection = await Reflection.findOne({
      sessionId: req.params.id,
      userId: req.user.id
    });

    return ok('Session retrieved successfully', {
      session,
      reflection
    });
  } catch (error) {
    logger.error('Get session by ID error:', error);
    throw error;
  }
};

/**
 * @desc    Update a session
 * @route   PUT /api/sessions/:id
 * @access  Private
 */
exports.updateSession = async (req, res) => {
  try {
    const { sessionType, duration, completedAt, notes, tags } = req.body;

    const session = await Session.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user.id 
      },
      { 
        sessionType, 
        duration, 
        completedAt, 
        notes, 
        tags 
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!session) {
      return notFound('Session not found');
    }

    logger.info(`Session updated for user ${req.user.id}`, {
      sessionId: session._id
    });

    return ok('Session updated successfully', session);
  } catch (error) {
    logger.error('Update session error:', error);
    throw error;
  }
};

/**
 * @desc    Delete a session
 * @route   DELETE /api/sessions/:id
 * @access  Private
 */
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!session) {
      return notFound('Session not found');
    }

    // Also delete associated reflection
    await Reflection.deleteOne({
      sessionId: req.params.id,
      userId: req.user.id
    });

    logger.info(`Session deleted for user ${req.user.id}`, {
      sessionId: req.params.id
    });

    return ok('Session deleted successfully');
  } catch (error) {
    logger.error('Delete session error:', error);
    throw error;
  }
};

/**
 * @desc    Get sessions for calendar view
 * @route   GET /api/sessions/calendar
 * @access  Private
 */
exports.getCalendarSessions = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let startDate, endDate;
    
    if (year && month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const sessions = await Session.aggregate([
      {
        $match: {
          userId: req.user._id,
          completedAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          count: { $sum: 1 },
          workSessions: {
            $sum: { $cond: [{ $eq: ['$sessionType', 'work'] }, 1, 0] }
          },
          breakSessions: {
            $sum: { $cond: [{ $eq: ['$sessionType', 'break'] }, 1, 0] }
          },
          sessions: {
            $push: {
              id: '$_id',
              type: '$sessionType',
              duration: '$duration',
              completedAt: '$completedAt'
            }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          workSessions: 1,
          breakSessions: 1,
          sessions: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    return ok('Calendar sessions retrieved successfully', {
      period: { startDate, endDate },
      sessions
    });
  } catch (error) {
    logger.error('Get calendar sessions error:', error);
    throw error;
  }
};