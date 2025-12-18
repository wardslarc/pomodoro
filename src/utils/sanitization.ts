/**
 * Security utilities for XSS prevention
 * Sanitizes user-generated content to prevent Cross-Site Scripting attacks
 */

import DOMPurify from 'dompurify';

/**
 * Configure DOMPurify with strict security settings
 */
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
  ALLOWED_ATTR: ['href', 'title'],
  ALLOW_DATA_ATTR: false,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
};

/**
 * Sanitize user-generated text content
 * Escapes HTML special characters and removes potentially dangerous tags
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  // Use DOMPurify to sanitize while removing all HTML tags
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true 
  }).trim();
};

/**
 * Sanitize HTML content while allowing safe formatting tags
 * Use this only when you intentionally want to allow some HTML formatting
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  return DOMPurify.sanitize(html, purifyConfig);
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeURL = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmedURL = url.trim().toLowerCase();

  // Prevent javascript: and data: URLs
  if (
    trimmedURL.startsWith('javascript:') ||
    trimmedURL.startsWith('data:') ||
    trimmedURL.startsWith('vbscript:') ||
    trimmedURL.startsWith('file:')
  ) {
    return '';
  }

  // Allow relative URLs and safe absolute URLs
  if (trimmedURL.startsWith('http://') || trimmedURL.startsWith('https://')) {
    try {
      new URL(url);
      return url;
    } catch {
      return '';
    }
  }

  // Allow relative URLs
  if (trimmedURL.startsWith('/') || trimmedURL.startsWith('#')) {
    return url;
  }

  return '';
};

/**
 * Sanitize user name or identifier
 * Removes any HTML/script tags
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return 'Anonymous';
  }
  return sanitizeText(name).slice(0, 100); // Limit to 100 chars
};

/**
 * Sanitize tag/hashtag
 * Ensures tag contains only alphanumeric characters and hyphens
 */
export const sanitizeTag = (tag: string): string => {
  if (!tag || typeof tag !== 'string') {
    return '';
  }
  
  // Remove any non-alphanumeric characters except hyphens and underscores
  const sanitized = tag.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
  
  // Limit tag length to 30 characters
  return sanitized.slice(0, 30);
};

/**
 * Sanitize array of tags
 */
export const sanitizeTags = (tags: string[] | unknown): string[] => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags
    .filter((tag) => typeof tag === 'string' && tag.length > 0)
    .map(sanitizeTag)
    .filter((tag) => tag.length > 0);
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmedEmail)) {
    return '';
  }

  return trimmedEmail;
};

/**
 * Escape HTML entities for display in text
 * Useful when you need to display user content as plain text
 */
export const escapeHTML = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize search query to prevent injection
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove HTML tags and special characters that could cause XSS
  const sanitized = sanitizeText(query);

  // Limit query length to 200 characters
  return sanitized.slice(0, 200);
};

/**
 * Validate object ID format (MongoDB ObjectId or UUID)
 */
export const isValidObjectId = (id: string | unknown): boolean => {
  if (typeof id !== 'string') {
    return false;
  }

  // MongoDB ObjectId: 24 hex characters
  const mongoObjectIdRegex = /^[0-9a-fA-F]{24}$/;

  // UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return mongoObjectIdRegex.test(id) || uuidRegex.test(id);
};

/**
 * Sanitize API response data
 * Clean user-generated fields from API responses
 */
export const sanitizeAPIResponse = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeAPIResponse);
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      // Sanitize string fields that are likely user-generated
      if (
        key.toLowerCase().includes('text') ||
        key.toLowerCase().includes('content') ||
        key.toLowerCase().includes('comment') ||
        key.toLowerCase().includes('message') ||
        key.toLowerCase().includes('learnings') ||
        key.toLowerCase().includes('description')
      ) {
        sanitized[key] = sanitizeText(value);
      } else if (key.toLowerCase().includes('name') || key.toLowerCase().includes('username')) {
        sanitized[key] = sanitizeName(value);
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
        sanitized[key] = sanitizeURL(value);
      } else if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else {
        sanitized[key] = value;
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeAPIResponse(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeAPIResponse(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export default {
  sanitizeText,
  sanitizeHTML,
  sanitizeURL,
  sanitizeName,
  sanitizeTag,
  sanitizeTags,
  sanitizeEmail,
  escapeHTML,
  sanitizeSearchQuery,
  isValidObjectId,
  sanitizeAPIResponse,
};
