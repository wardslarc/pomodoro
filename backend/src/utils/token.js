const jwt = require('jsonwebtoken');
const config = require('../config/env');
const logger = require('./logger');

class TokenUtils {
  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @param {Object} payload - Additional payload data
   * @returns {string} JWT token
   */
  static generateToken(userId, payload = {}) {
    try {
      const tokenPayload = {
        id: userId,
        ...payload,
      };

      return jwt.sign(tokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: 'pomodoro-app',
        subject: userId.toString(),
      });
    } catch (error) {
      logger.error('Token generation error:', error);
      throw new Error('Failed to generate token');
    }
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      logger.error('Token verification error:', error);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Decode token without verification (for inspection only)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded token payload
   */
  static decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }

    return null;
  }

  /**
   * Check if token is about to expire (within threshold)
   * @param {string} token - JWT token
   * @param {number} thresholdMs - Threshold in milliseconds (default: 5 minutes)
   * @returns {boolean} True if token is about to expire
   */
  static isTokenExpiringSoon(token, thresholdMs = 5 * 60 * 1000) {
    try {
      const decoded = this.verifyToken(token);
      const now = Date.now();
      const exp = decoded.exp * 1000; // Convert to milliseconds
      
      return (exp - now) <= thresholdMs;
    } catch (error) {
      return true; // If we can't verify, consider it expiring
    }
  }
}

module.exports = TokenUtils;