# School Calendar Feature - Comprehensive Documentation

## Overview

The School Calendar feature is a comprehensive system that allows educational institutions to upload, parse, and structure academic calendar PDFs using AI-powered text extraction and LLM-based structuring. The system provides a seamless user experience with immediate feedback and robust error handling.

## Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   External      │
│   (Next.js)     │◄──►│   (Next.js API)  │◄──►│   Services      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
│                      │                      │
├─ PDF.js (Client)     ├─ LLM Processing      ├─ OpenRouter API
├─ Text Extraction     ├─ Database Storage    ├─ Cloudinary
├─ UI Components       ├─ Error Handling      └─ Institution DB
└─ State Management    └─ Validation
```

## Data Flow

### 1. File Selection & Text Extraction

```
User selects PDF → PDF.js extracts text → Store in component state
```

### 2. Upload & LLM Processing

```
User clicks upload → Send text to LLM → Structure calendar data → Save to database
```

### 3. Database Storage

```
PDF URL (Cloudinary) + Structured Calendar Data → Institution table
```

## Technical Implementation

### Frontend Components

#### Calendar Client (`app/(simple)/calendar/calendar-client.tsx`)

**Key Functions:**

1. **`extractTextFromPDF(file: File)`**

   - Uses `pdfjs-dist/webpack.mjs` for client-side PDF parsing
   - Extracts text from all pages
   - Returns raw text without LLM processing

2. **`handleFilesChange(files: any[])`**

   - Triggered when user selects a PDF file
   - Immediately extracts text (fast feedback)
   - Updates UI state with extraction status

3. **`handleUpload()`**
   - Uploads PDF to Cloudinary
   - Sends extracted text to LLM for structuring
   - Saves both PDF URL and structured data to database

**State Management:**

```typescript
const [parsedCalendarData, setParsedCalendarData] = useState<any>(null);
const [parsingStatus, setParsingStatus] = useState<
  "idle" | "parsing" | "success" | "error"
>("idle");
const [uploading, setUploading] = useState(false);
```

#### PDF.js Hook (`hooks/usePDFJS.ts`)

**Purpose:** Manages PDF.js library loading and initialization

```typescript
export const usePDFJS = (
  onLoad: (pdfjs: typeof PDFJS) => Promise<void>,
  deps: (string | number | boolean | undefined | null)[] = []
) => {
  // Loads pdfjs-dist/webpack.mjs which handles worker setup automatically
  // Provides PDF.js instance to components
};
```

### Backend API

#### Calendar Structure API (`app/api/calendar/structure/route.js`)

**Endpoint:** `POST /api/calendar/structure`

**Functions:**

1. **`structureCalendarWithLLM(rawText: string)`**

   - Uses OpenRouter API for LLM processing
   - Sends structured prompts for calendar parsing
   - Returns structured calendar data

2. **`structureCalendarWithFallback(rawText: string)`**
   - Basic fallback when LLM is unavailable
   - Returns default calendar structure

**LLM Prompt Structure:**

```javascript
const systemPrompt = `You are an expert academic calendar parser. Your task is to extract and structure academic calendar information from raw text into a specific JSON format.

Expected JSON structure:
{
  "academic_year": "YYYY/YYYY",
  "semesters": [
    {
      "name": "SEMESTER 1",
      "events": [
        {
          "name": "Event Name",
          "start_date": "YYYY-MM-DD",
          "end_date": "YYYY-MM-DD",
          "semester": 1,
          "holiday": false
        }
      ]
    }
  ]
}`;
```

### Database Schema

#### Institution Table

```sql
-- Existing fields
id, name, created_at, updated_at

-- Calendar-related fields
school_calendar: TEXT (Cloudinary URL)
calendar_data: JSON (Structured calendar data)
```

**Calendar Data Structure:**

```json
{
  "academic_year": "2024/2025",
  "semesters": [
    {
      "name": "SEMESTER 1",
      "events": [
        {
          "name": "Registration Period",
          "start_date": "2024-09-01",
          "end_date": "2024-09-15",
          "semester": 1,
          "holiday": false
        }
      ]
    }
  ],
  "raw_text": "Original extracted text",
  "parsed_at": "2024-01-15T10:30:00Z",
  "llm_processed": true
}
```

## User Experience Flow

### 1. Initial Setup

```
User navigates to /calendar
↓
System loads PDF.js library
↓
User sees calendar interface with upload option
```

### 2. File Selection

```
User clicks "Upload Calendar"
↓
File picker opens (PDF only)
↓
User selects PDF file
↓
System immediately extracts text
↓
UI shows: "PDF text extracted successfully! Ready for upload and AI structuring."
```

### 3. Upload Process

```
User clicks "Upload Calendar" button
↓
System uploads PDF to Cloudinary
↓
System sends extracted text to LLM
↓
UI shows: "Structuring calendar data with AI..."
↓
LLM returns structured data
↓
System saves to database
↓
UI shows success message with semester/event count
```

### 4. Error Handling

```
If LLM fails → Graceful fallback
↓
PDF still uploaded successfully
↓
UI shows: "School calendar uploaded successfully! (PDF only - AI structuring failed)"
```

## Configuration

### Environment Variables

**Required for LLM Processing:**

```bash
# .env.local
OPENROUTER_LLM_KEY=your_openrouter_api_key_here
```

**Optional Configuration:**

```bash
# .env.local
OPENROUTER_LLM_MODEL=moonshotai/kimi-k2:free  # Default model
APP_URL=http://localhost:3000                 # For API headers
```

### Next.js Configuration

**Webpack Configuration (`next.config.js`):**

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };
  }
  return config;
};
```

## API Endpoints

### 1. Calendar Structure

```
POST /api/calendar/structure
Content-Type: application/json

Request:
{
  "rawText": "Extracted PDF text content"
}

Response:
{
  "success": true,
  "data": {
    "academic_year": "2024/2025",
    "semesters": [...]
  }
}
```

### 2. Institution Update

```
PUT /api/institution/:id
Content-Type: application/json

Request:
{
  "school_calendar": "https://cloudinary.com/...",
  "calendar_data": {
    "academic_year": "2024/2025",
    "semesters": [...]
  }
}
```

## Error Handling

### Client-Side Errors

1. **PDF.js Loading Failure**

   - Error: "PDF.js not loaded yet"
   - Solution: Wait for library to load

2. **Text Extraction Failure**

   - Error: "Failed to extract text from PDF"
   - Solution: Check PDF format and try again

3. **LLM Processing Failure**
   - Error: "Failed to structure calendar with AI"
   - Solution: Check API key configuration

### Server-Side Errors

1. **Missing API Key**

   - Falls back to basic structure
   - No error thrown, graceful degradation

2. **LLM API Errors**

   - Returns error response
   - Client handles gracefully

3. **Database Errors**
   - Returns 500 error
   - Client shows user-friendly message

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**

   - PDF.js loaded only when needed
   - LLM processing only on upload

2. **Caching**

   - Extracted text stored in component state
   - No re-extraction on re-renders

3. **Error Recovery**
   - Graceful fallbacks for all failure points
   - No data loss on partial failures

### Resource Usage

1. **Client-Side**

   - PDF.js: ~2MB bundle size
   - Text extraction: CPU intensive but fast

2. **Server-Side**
   - LLM API calls: ~2-5 seconds per request
   - Database: Minimal impact

## Security Considerations

### Data Protection

1. **File Validation**

   - Only PDF files accepted
   - File size limits enforced

2. **API Security**

   - Server-side API key storage
   - No client-side exposure of sensitive keys

3. **Input Sanitization**
   - Text extraction removes malicious content
   - LLM prompts structured to prevent injection

## Monitoring & Debugging

### Logging Strategy

1. **Production**

   - Minimal logging for performance
   - Error tracking for failures

2. **Development**
   - Detailed console logs (removed for production)
   - Step-by-step debugging information

### Debug Information

```javascript
// Available in development
console.log("PDF loaded successfully with X pages");
console.log("Text extraction completed");
console.log("LLM structuring started");
console.log("Backend LLM structuring completed");
```

## Deployment Checklist

### Pre-Deployment

- [ ] Set `OPENROUTER_LLM_KEY` environment variable
- [ ] Test with sample PDF files
- [ ] Verify database schema supports `calendar_data` field
- [ ] Check Cloudinary configuration

### Post-Deployment

- [ ] Monitor LLM API usage and costs
- [ ] Track upload success/failure rates
- [ ] Monitor database storage usage
- [ ] Test error scenarios

## Future Enhancements

### Potential Improvements

1. **Batch Processing**

   - Support for multiple calendar uploads
   - Background processing for large files

2. **Advanced Parsing**

   - Support for more calendar formats
   - Image-based calendar parsing

3. **Calendar Visualization**

   - Interactive calendar view
   - Export to different formats

4. **Integration**
   - Sync with external calendar systems
   - Mobile app support

## Troubleshooting Guide

### Common Issues

1. **"PDF.js not loaded yet"**

   - Wait for page to fully load
   - Check network connectivity

2. **"Failed to extract text from PDF"**

   - Verify PDF is not password-protected
   - Check if PDF contains text (not just images)

3. **"LLM structuring failed"**

   - Verify `OPENROUTER_LLM_KEY` is set
   - Check API key validity and quota

4. **"Upload failed"**
   - Check Cloudinary configuration
   - Verify database connectivity

### Debug Steps

1. **Check Browser Console**

   - Look for JavaScript errors
   - Verify API calls are being made

2. **Check Server Logs**

   - Monitor API endpoint responses
   - Check for LLM API errors

3. **Test API Endpoints**
   - Use curl or Postman to test directly
   - Verify environment variables

## File Structure

```
app/
├── (simple)/calendar/
│   └── calendar-client.tsx          # Main calendar component
├── api/calendar/structure/
│   └── route.js                     # LLM structuring API
hooks/
└── usePDFJS.ts                      # PDF.js hook
docs/
└── SCHOOL_CALENDAR_FEATURE.md       # This documentation
```

## Dependencies

### Frontend

- `pdfjs-dist`: PDF parsing library
- `react`: UI framework
- `next`: Full-stack framework

### Backend

- `openrouter`: LLM API integration
- `cloudinary`: File storage
- `fastify`: API framework

## Contributing

When contributing to the School Calendar feature:

1. **Follow the existing architecture**
2. **Test with various PDF formats**
3. **Update this documentation**
4. **Add error handling for new features**
5. **Consider performance implications**

---

_Last updated: January 2024_
_Version: 1.0.0_
