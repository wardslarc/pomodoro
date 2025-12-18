# XSS Prevention & Security Guide

## Overview
This document outlines the security measures implemented to prevent Cross-Site Scripting (XSS) attacks in the Pomodoro application. XSS is a vulnerability where attackers inject malicious scripts into web pages, which can compromise user data and session security.

## Security Implementation

### 1. DOMPurify Library
- **Purpose**: Sanitizes HTML content to remove malicious scripts while preserving safe formatting
- **Configuration**: Whitelist approach with strict ALLOWED_TAGS and ALLOWED_ATTR
- **Allowed HTML Tags**: `b`, `i`, `em`, `strong`, `a`, `br`, `p`, `ul`, `ol`, `li`
- **Allowed Attributes**: `href`, `title` (URLs are validated to prevent javascript: and data: protocols)

### 2. Sanitization Utility (`src/utils/sanitization.ts`)
Created comprehensive utility with 11 XSS prevention functions:

#### **sanitizeText(text: string): string**
- Removes all HTML tags and dangerous characters
- Use for: User-generated text content (reflections, comments, descriptions)
- Returns: Plain text with HTML entities encoded
- Example: `<script>alert('xss')</script>` → `&lt;script&gt;alert('xss')&lt;/script&gt;`

#### **sanitizeHTML(html: string): string**
- Allows only safe formatting tags (b, i, em, strong, a, br, p, ul, ol, li)
- Use for: Rich text content where basic formatting is needed
- Returns: Safe HTML that can be rendered with dangerouslySetInnerHTML (with DOMPurify)
- Example: `<b>Bold</b><script>alert('xss')</script>` → `<b>Bold</b>`

#### **sanitizeURL(url: string): string**
- Prevents javascript:, data:, vbscript:, and file: protocol attacks
- Use for: URL attributes, links, redirects
- Returns: Safe URL or empty string if malicious
- Example: `javascript:alert('xss')` → `''`

#### **sanitizeName(name: string): string**
- Removes HTML tags and limits to 100 characters
- Use for: User names, display names, author names
- Returns: Plain text name safe for display
- Example: `<img src=x onerror="alert('xss')">John` → `John`

#### **sanitizeTag(tag: string): string**
- Allows only alphanumeric characters, hyphens, and underscores
- Converts to lowercase
- Limits to 30 characters
- Use for: Topic tags, category tags, hashtags
- Returns: Safe tag string
- Example: `<script>xss</script>Coding` → `scriptsxsscoding`

#### **sanitizeTags(tags: string[]): string[]**
- Batch sanitization for arrays of tags
- Use for: Multiple tags in one operation
- Returns: Array of sanitized tags

#### **sanitizeEmail(email: string): boolean**
- Validates email format using regex
- Use for: Email field validation before submission
- Returns: True if valid email, false otherwise

#### **escapeHTML(text: string): string**
- Encodes HTML entities (&, <, >, ", ')
- Use for: When displaying user text in HTML attributes
- Returns: HTML-escaped string
- Example: `<script>` → `&lt;script&gt;`

#### **sanitizeSearchQuery(query: string): string**
- Escapes HTML and limits to 200 characters
- Use for: Search input to prevent stored/reflected XSS
- Returns: Safe search string
- Example: `<img src=x> coding` → `&lt;img src=x&gt; coding`

#### **isValidObjectId(id: string): boolean**
- Validates MongoDB ObjectId (24 hex characters) or UUID format
- Use for: ID validation before database operations
- Returns: True if valid ID format

#### **sanitizeAPIResponse(data: any): any**
- Recursively sanitizes entire API response objects
- Sanitizes all string values while preserving object structure
- Use for: API responses containing user-generated content
- Returns: Deeply sanitized copy of data object

## Implementation Locations

### SocialFeed.tsx
- **fetchPosts()**: Sanitizes all posts data, learnings, usernames, and comments
- **handleComment()**: Sanitizes comment text before submission and after receiving response
- **filteredPosts**: Sanitizes search queries
- **SearchAndFilterSection**: Input sanitization through callback
- **Sidebar**: Tag sanitization before display
- **PostComments**: Comments rendered through React (which auto-escapes)
- **PostContent**: Learnings text sanitized at fetch time, safe display through React

### Dashboard.tsx
- **Recent Reflections**: Sanitizes reflection.learnings before display
- All reflection data goes through sanitizeText()

### ReflectionContent.tsx
- **handleSubmit()**: Sanitizes user input before sending to API
- Learnings textarea input sanitized before database save
- Form validation preserves 2000 character limit

## Security Best Practices

### 1. Input Validation
- Always validate data type and format
- Check string length before processing
- Validate IDs against expected format (ObjectId/UUID)
- Validate email format before submission

### 2. Data Sanitization Points
- **On Entry**: Sanitize all user input when received from forms/textarea
- **From API**: Sanitize all user-generated content from API responses
- **On Display**: React auto-escapes text content; use sanitization for attributes/special cases
- **Before Submission**: Sanitize before sending user input back to API

### 3. React Security Advantages
- React automatically escapes text content in JSX
- Text rendered through {variable} is safe by default
- Use sanitization for attributes and special cases only
- Avoid dangerouslySetInnerHTML unless absolutely necessary

### 4. Common XSS Attack Vectors & Prevention

| Attack Vector | Example | Prevention |
|---|---|---|
| Script injection | `<script>alert('xss')</script>` | sanitizeText() removes all tags |
| Event handler injection | `<img onerror="alert('xss')">` | sanitizeText() removes tags and attributes |
| HTML injection | `<img src=x>` | sanitizeHTML() uses whitelist for safe tags |
| URL protocol attack | `<a href="javascript:alert('xss')">` | sanitizeURL() blocks dangerous protocols |
| Data URI attack | `<img src="data:text/html,<script>alert('xss')</script>">` | sanitizeURL() blocks data: protocol |
| Attribute attack | `<div onmouseover="alert('xss')">` | sanitizeText() removes all attributes |
| HTML entity bypass | `&#60;script&#62;alert('xss')&#60;/script&#62;` | DOMPurify decodes and validates |

## Content Security Policy (CSP) Headers

To further enhance security, implement these CSP headers on the server:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://www.reflectivepomodoro.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

## API Security Recommendations

### Backend Validation
1. **Validate input** on the server (never trust client-side validation)
2. **Sanitize before storing** in database
3. **Escape on output** when sending to clients
4. **Implement rate limiting** to prevent injection attacks at scale

### Response Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Testing XSS Vulnerabilities

### Manual Testing Payloads
Test these in user input fields to ensure sanitization:
- `<script>alert('xss')</script>`
- `<img src=x onerror="alert('xss')">`
- `<svg onload="alert('xss')">`
- `javascript:alert('xss')`
- `<iframe src="javascript:alert('xss')"></iframe>`
- `<body onload="alert('xss')">`
- `'><script>alert('xss')</script>`
- `"><script>alert('xss')</script>`

### Expected Results
All payloads should be:
1. Removed from text fields (sanitizeText)
2. Escaped in display
3. Rendered as plain text, not executed

## Future Enhancements

1. **Server-side Sanitization**: Implement complementary sanitization on backend
2. **CSP Headers**: Deploy Content Security Policy headers
3. **Security Audit**: Regular penetration testing
4. **Update Dependencies**: Keep DOMPurify and React updated
5. **Input Validation Framework**: Consider validation library like Zod or Yup
6. **Logging**: Log sanitization events for security monitoring

## Dependencies

- **DOMPurify**: ^3.0.0+ (HTML sanitization)
- **React**: 18.x+ (auto-escaping)
- **TypeScript**: For type safety in sanitization functions

## References

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [React Security Documentation](https://react.dev/reference/react-dom#dangerously_set_inner_html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Questions & Support

For security-related questions or to report vulnerabilities:
1. Review this guide first
2. Check existing sanitization patterns
3. Use appropriate sanitization function for your use case
4. Test thoroughly before deploying
