# XSS Prevention Quick Reference

## ⚡ Quick Start

### Import the sanitization utility:
```tsx
import { sanitizeText, sanitizeName, sanitizeTag, sanitizeURL } from "@/utils/sanitization";
```

### Common Usage Patterns:

**User Comments/Posts:**
```tsx
const sanitized = sanitizeText(userInput);
```

**Usernames/Display Names:**
```tsx
const safeName = sanitizeName(userName);
```

**Tags/Categories:**
```tsx
const safeTag = sanitizeTag(tagInput);
```

**URLs/Links:**
```tsx
const safeURL = sanitizeURL(linkInput);
if (safeURL) {
  // Use the URL
}
```

**Email Validation:**
```tsx
if (sanitizeEmail(email)) {
  // Valid email
}
```

**Multiple Tags:**
```tsx
const safeTags = sanitizeTags(tagArray);
```

**Search Queries:**
```tsx
const safeSearch = sanitizeSearchQuery(searchInput);
```

---

## 🔍 Function Reference

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `sanitizeText()` | Any text | Plain text, HTML removed | Comments, reflections, descriptions |
| `sanitizeHTML()` | HTML | Safe formatted HTML | Rich text with basic formatting |
| `sanitizeURL()` | URL string | Safe URL or empty | Links, redirects, href attributes |
| `sanitizeName()` | User name | Plain text, max 100 chars | Usernames, display names |
| `sanitizeTag()` | Tag string | Alphanumeric, lowercase, max 30 chars | Topic tags, categories |
| `sanitizeTags()` | Tag array | Array of safe tags | Batch tag processing |
| `sanitizeEmail()` | Email | Boolean valid/invalid | Email validation |
| `escapeHTML()` | Text | HTML entities | HTML attributes |
| `sanitizeSearchQuery()` | Query string | Escaped, max 200 chars | Search input |
| `isValidObjectId()` | ID string | Boolean valid/invalid | MongoDB/UUID validation |
| `sanitizeAPIResponse()` | Any object | Deep sanitized copy | API response data |

---

## 📋 Implementation Checklist

When adding new user input fields:

- [ ] Identify data type (text/name/email/tag/URL)
- [ ] Choose sanitization function from table above
- [ ] Apply sanitization on input (form submission)
- [ ] Apply sanitization on output (API responses)
- [ ] Test with XSS payloads (see examples below)
- [ ] Review security documentation if needed

---

## 🎯 Where Sanitization is Applied

### ✅ Already Protected:
- **SocialFeed.tsx**: Comments, posts, usernames, tags, search
- **Dashboard.tsx**: Reflection learnings display
- **ReflectionContent.tsx**: Reflection input on submit

### 🔄 To Protect New Features:
- Any new comment/message fields
- New user profile fields
- New search/filter functionality
- API responses with user-generated content

---

## 🧪 Testing Payloads

Test these in input fields to verify sanitization:

```
<script>alert('xss')</script>
<img src=x onerror="alert('xss')">
<svg onload="alert('xss')">
javascript:alert('xss')
<iframe src="javascript:alert('xss')">
<body onload="alert('xss')">
'><script>alert('xss')</script>
"><script>alert('xss')</script>
<div onmouseover="alert('xss')">
```

**Expected Result**: All render as plain text, nothing executes

---

## 💡 Pro Tips

1. **Sanitize at entry, display safely**: Sanitize on form submit, React auto-escapes on render
2. **Always validate IDs**: Use `isValidObjectId()` before database operations
3. **Test with your data**: Run security payloads through your forms
4. **Reference the full guide**: See `XSS_PREVENTION_GUIDE.md` for detailed docs
5. **Keep DOMPurify updated**: Run `npm update dompurify` regularly

---

## ⚠️ Common Mistakes to Avoid

❌ **Don't**: `dangerouslySetInnerHTML` without DOMPurify
❌ **Don't**: Skip sanitization on API responses
❌ **Don't**: Trust client-side validation alone
❌ **Don't**: Use unsanitized user input in URLs
❌ **Don't**: Forget to sanitize on both input and output

---

## 📚 Full Documentation

For detailed information:
- 📖 `XSS_PREVENTION_GUIDE.md` - Comprehensive security guide
- 📋 `XSS_IMPLEMENTATION_SUMMARY.md` - What was implemented

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All files have no syntax errors
- [ ] Sanitization functions imported correctly
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] API response sanitization in place
- [ ] Form input sanitization implemented
- [ ] Testing payloads verified
- [ ] Review: XSS_PREVENTION_GUIDE.md
- [ ] Optional: Implement CSP headers (see guide)

---

## 🔗 Related Resources

- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [React Security Docs](https://react.dev/reference/react-dom#dangerously_set_inner_html)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Status**: ✅ XSS Prevention Complete
**Coverage**: Dashboard, ReflectionContent, SocialFeed
**Protection Level**: High (Multiple defense layers)
