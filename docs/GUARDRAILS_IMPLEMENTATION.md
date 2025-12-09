# Guardrails Implementation for AI Chat

## Overview

This document describes the comprehensive guardrails system implemented for the AI chat feature, ensuring both frontend and backend validation with proper security measures.

## Architecture

### 1. Shared Configuration (`lib/guardrails-config.ts`)

Centralized configuration that both frontend and backend use:

- **Validation Thresholds**: Configurable similarity scores for keywords, concepts, and topics
- **Response Templates**: Standardized error messages for different validation failures
- **Security Settings**: Rate limiting, origin validation, and user agent checks
- **Academic Terms**: Comprehensive list of educational and research-related terms
- **Question Patterns**: Regex patterns for classifying different types of questions
- **Off-topic Patterns**: Patterns that identify inappropriate or off-topic questions

### 2. Core Guardrails Engine (`lib/guardrails.ts`)

The main validation engine that:

- Extracts course content and identifies key concepts
- Classifies questions by type and relevance
- Calculates semantic similarity scores
- Validates questions against course content
- Provides detailed feedback and suggestions

### 3. Rate Limiting (`lib/rate-limiter.ts`)

In-memory rate limiting system with:

- Per-user request tracking
- Configurable time windows and limits
- Automatic cleanup of expired entries
- Detailed rate limit headers in responses

### 4. API Security (`app/api/ai-chat/route.ts`)

Enhanced API endpoints with multiple security layers:

#### Authentication

- Validates user authentication using secure cookie signatures
- Ensures only logged-in users can access the chat
- Verifies user ID matches authenticated user

#### Request Validation

- Origin header validation (configurable for production)
- User agent validation to block bots
- Referer header validation for additional security

#### Rate Limiting

- 10 requests per minute per user
- 100 requests per hour per user
- Proper HTTP headers for rate limit status

#### Guardrails Validation

- Validates questions against course content
- Blocks off-topic or inappropriate questions
- Provides helpful feedback for rejected questions

### 5. Frontend Integration (`use-ai-chat.ts`)

Updated frontend hook with:

- Shared validation patterns from config
- Enhanced error handling for different response types
- Proper handling of guardrails rejections
- Authentication and rate limiting error messages

## Security Features

### 1. Authentication

- Secure cookie-based authentication with HMAC signatures
- Prevents tampering with user data
- Automatic fallback for development mode

### 2. Request Validation

- Origin validation (configurable)
- User agent validation
- Referer validation
- Bot detection and blocking

### 3. Rate Limiting

- Per-user rate limiting
- Configurable limits and windows
- Proper HTTP status codes and headers
- Automatic cleanup of expired entries

### 4. Content Validation

- Question classification and validation
- Off-topic content detection
- Educational pattern recognition
- Course content relevance checking

## Configuration

### Environment Variables

```env
# Authentication
JWTSECRET=your-secret-key

# Development
NODE_ENV=development
DISABLE_API_AUTH=true  # Set to true to bypass auth in development

# Frontend Configuration
FRONTEND_URL=https://yourdomain.com  # Primary frontend URL
ALLOWED_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com  # Additional allowed origins (comma-separated)
```

**Development Mode Bypass:**
When `NODE_ENV=development` and `DISABLE_API_AUTH=true`, the following security measures are bypassed:

- Request origin validation
- User agent validation
- Rate limiting
- User ID verification
- Guardrails validation

This allows for easier development and testing without compromising production security.

### Rate Limiting Configuration

```typescript
const RATE_LIMIT_CONFIGS = {
  perMinute: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: "Rate limit exceeded",
  },
  perHour: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 100, // 100 requests per hour
    message: "Hourly limit exceeded",
  },
};
```

### Security Configuration

```typescript
const security = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  allowedOrigins: getAllowedOrigins(), // Dynamically loaded from environment
  requireValidOrigin: process.env.NODE_ENV === "production",
};
```

**Origin Configuration:**

- `FRONTEND_URL`: Primary frontend URL (e.g., `https://yourdomain.com`)
- `ALLOWED_ORIGINS`: Additional allowed origins, comma-separated (e.g., `https://app.yourdomain.com,https://admin.yourdomain.com`)
- Development mode automatically includes `localhost:3000` and `localhost:8080`
- If no origins are specified, defaults to `localhost:3000`

## Usage Examples

### Frontend Usage

```typescript
const { sendMessage } = useAIChat({
  courseData,
  currentLesson,
  student,
  enableGuardrails: true, // Enable guardrails validation
  guardrailsConfig: customConfig, // Optional custom config
});
```

### Backend Validation

```typescript
// Automatic validation in API route
const guardrailsResult = checkQuestion(
  userPrompt,
  guardrailsConfig,
  lessonContent
);

if (!guardrailsResult.allowed) {
  return NextResponse.json(
    {
      error: "Question not allowed",
      message: guardrailsResult.response,
    },
    { status: 400 }
  );
}
```

## Error Handling

### Frontend Error Types

- **Authentication Errors (401)**: User not logged in
- **Rate Limiting (429)**: Too many requests
- **Guardrails Rejection (400)**: Question not allowed
- **Validation Errors (403)**: Invalid request origin/agent

### Backend Response Format

```typescript
// Success
{ success: true, data: response }

// Guardrails Rejection
{
  error: "Question not allowed",
  message: "Helpful feedback message",
  confidence: 0.8
}

// Rate Limiting
{
  error: "Rate limit exceeded",
  resetTime: 1640995200000
}
```

## Monitoring and Logging

### Rate Limiting Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1640995200000
```

### Debug Information

- Guardrails validation results
- Rate limiting status
- Authentication status
- Request validation results

## Production Considerations

### 1. Rate Limiting

- Consider using Redis for distributed rate limiting
- Implement IP-based rate limiting for additional security
- Monitor rate limit violations for abuse detection

### 2. Security

- Enable origin validation in production
- Implement CSRF protection
- Add request signing for additional security
- Monitor for suspicious patterns

### 3. Performance

- Cache guardrails configurations
- Optimize content extraction algorithms
- Consider async processing for heavy validations

### 4. Monitoring

- Log all guardrails rejections
- Monitor rate limit violations
- Track authentication failures
- Alert on suspicious activity

## Testing

### Unit Tests

- Guardrails validation logic
- Rate limiting functionality
- Authentication validation
- Request validation

### Integration Tests

- End-to-end chat flow
- Error handling scenarios
- Rate limiting behavior
- Security validation

### Load Tests

- Rate limiting under load
- Concurrent user scenarios
- Memory usage of rate limiter
- Performance impact of guardrails

## Future Enhancements

### 1. Advanced Guardrails

- Machine learning-based content classification
- Dynamic threshold adjustment
- User-specific guardrails customization
- Multi-language support

### 2. Enhanced Security

- JWT-based authentication
- Request signing and verification
- Advanced bot detection
- Behavioral analysis

### 3. Analytics

- Guardrails effectiveness metrics
- User engagement patterns
- Content quality analysis
- Performance monitoring

### 4. Configuration Management

- Dynamic configuration updates
- A/B testing for guardrails
- User preference management
- Admin configuration interface
