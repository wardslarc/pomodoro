// src/routes/users.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const User = require('../models/User');

// Import your existing auth middleware - make sure the path is correct
const auth = require('../middleware/auth'); // 👈 This should point to your auth file

// GET /api/users/leaderboard - Get leaderboard data
router.get('/leaderboard', auth, async (req, res) => {
  try {
    console.log('🏆 Fetching leaderboard data...');

    // Aggregate user data for leaderboard
    const leaderboardData = await Session.aggregate([
      {
        $match: {
          sessionType: 'work' // Only count work sessions for productivity
        }
      },
      {
        $group: {
          _id: '$userId',
          totalFocusMinutes: { $sum: '$duration' },
          completedPomodoros: { $count: {} },
          lastActivity: { $max: '$completedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          totalFocusMinutes: 1,
          completedPomodoros: 1,
          lastActivity: 1
        }
      },
      {
        $sort: { totalFocusMinutes: -1 } // Sort by total focus time
      },
      {
        $limit: 50 // Limit to top 50 users
      }
    ]);

    // Calculate streaks and productivity scores
    const usersWithStats = await Promise.all(
      leaderboardData.map(async (userData, index) => {
        // Calculate current streak
        const streak = await calculateUserStreak(userData._id);
        
        // Calculate productivity score (0-100)
        const totalSessions = await Session.countDocuments({ 
          userId: userData._id 
        });
        const productivityScore = totalSessions > 0 
          ? Math.min(100, Math.round((userData.completedPomodoros / totalSessions) * 100))
          : 0;

        return {
          ...userData,
          rank: index + 1,
          currentStreak: streak,
          productivityScore: productivityScore
        };
      })
    );

    console.log(`✅ Leaderboard data fetched: ${usersWithStats.length} users`);

    res.json({
      success: true,
      data: {
        users: usersWithStats
      }
    });

  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard data',
      error: error.message
    });
  }
});

// Helper function to calculate user streak
async function calculateUserStreak(userId) {
  try {
    const sessions = await Session.find({ 
      userId: userId,
      sessionType: 'work'
    }).sort({ completedAt: -1 }).limit(100);

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);

    const uniqueDates = new Set();
    sessions.forEach(session => {
      const dateKey = session.completedAt.toDateString();
      uniqueDates.add(dateKey);
    });

    // Calculate streak by checking consecutive days from today backwards
    while (true) {
      const dateString = currentDate.toDateString();
      if (uniqueDates.has(dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        currentDate.setHours(23, 59, 59, 999);
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

module.exports = router;