# Academic Calendar Parser

A comprehensive PDF calendar parser that uses LLM (OpenRouter) to extract and structure academic calendar data from PDF files.

## Features

- **PDF Text Extraction**: Uses `pdfjs-dist` to extract text from PDF files
- **LLM Structuring**: Uses OpenRouter API to intelligently structure calendar data
- **Multiple Date Formats**: Handles various date formats (full months, abbreviations, numeric)
- **Database Integration**: Saves structured data to PostgreSQL via existing Knex configuration
- **Validation**: Comprehensive data validation before database storage
- **Error Handling**: Robust error handling and logging

## API Endpoints

### 1. Parse PDF Calendar

```
POST /api/calendar/parse
```

**Request:**

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `pdf`: PDF file (max 10MB)
  - `institutionId`: Institution ID for database storage

**Response:**

```json
{
  "success": true,
  "data": {
    "academic_year": "2024/2025",
    "semesters": [
      {
        "name": "SEMESTER 1",
        "events": [
          {
            "name": "Event Name",
            "start_date": "2024-10-12",
            "end_date": "2024-10-12",
            "semester": 1,
            "holiday": false
          }
        ]
      }
    ]
  },
  "institutionId": 1,
  "metadata": {
    "parsed_at": "2024-01-01T00:00:00.000Z",
    "parsing_method": "pdfjs-dist",
    "input_type": "pdf",
    "llm_processed": true,
    "text_length": 1500
  },
  "message": "Calendar data parsed successfully. Use a separate API call to save to database."
}
```

### 2. Save Calendar Data

```
POST /api/calendar/save
```

**Request:**

```json
{
  "institutionId": 1,
  "calendarData": {
    "academic_year": "2024/2025",
    "semesters": [...]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Calendar data saved successfully",
  "data": {
    "institutionId": 1,
    "academic_year": "2024/2025",
    "semesters_count": 2,
    "total_events": 15,
    "saved_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Get Calendar Data

```
GET /api/calendar/get?institutionId=1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "academic_year": "2024/2025",
    "semesters": [...]
  },
  "institution": {
    "id": 1,
    "name": "Institution Name"
  },
  "metadata": {
    "retrieved_at": "2024-01-01T00:00:00.000Z",
    "academic_year": "2024/2025",
    "semesters_count": 2,
    "total_events": 15
  }
}
```

## Database Schema

Calendar data is stored in the `institution` table as JSON in the `calendar_data` column:

```sql
ALTER TABLE institution ADD COLUMN calendar_data JSON;
```

## Environment Variables

Required environment variables for LLM integration:

```env
OPENROUTER_LLM_KEY=your_openrouter_api_key
OPENROUTER_LLM_MODEL=deepseek/deepseek-chat-v3-0324:free
APP_URL=http://localhost:3000
```

## Testing

Run the complete flow test:

```bash
node test-complete-calendar.js
```

## File Structure

```
helpers/
├── calendar-parser.js          # Main parser with LLM integration
app/api/calendar/
├── parse/route.js             # PDF parsing endpoint
├── save/route.js              # Database save endpoint
└── get/route.js               # Database retrieval endpoint
backend/
├── config/connection.js       # Existing Knex configuration
└── db/migrations/
    └── 20241225000000_add_calendar_data_to_institution.js
```

## Usage Flow

1. **Upload PDF**: Send PDF file to `/api/calendar/parse`
2. **LLM Processing**: System extracts text and sends to OpenRouter API
3. **Structured Output**: LLM returns properly formatted JSON
4. **Save to Database**: Send structured data to `/api/calendar/save`
5. **Retrieve Data**: Get calendar data from `/api/calendar/get`

## LLM Prompt Engineering

The system uses a carefully crafted prompt to ensure consistent JSON output:

- **System Prompt**: Defines the expected JSON structure and rules
- **User Prompt**: Contains the raw extracted text
- **Temperature**: Set to 0.1 for consistent structured output
- **Validation**: JSON extraction and structure validation

## Error Handling

- **PDF Parsing Errors**: Fallback to text processing
- **LLM API Errors**: Detailed error logging
- **Database Errors**: Transaction rollback
- **Validation Errors**: Structure validation before saving

## Supported Date Formats

- Full month names: "15th January 2024"
- Abbreviated months: "15 Jan 2024"
- Numeric dates: "15/01/2024", "15-01-2024"
- Date ranges: "15-20 January 2024"

## Holiday Detection

The LLM automatically identifies holidays based on keywords:

- Breaks, vacations, recess
- Christmas, Easter, Eid
- Independence, Democracy, Workers Day
- Semester breaks, session breaks
