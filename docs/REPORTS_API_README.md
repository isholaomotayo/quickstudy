# Reports & Analytics API Documentation

This document describes the new Reports & Analytics API endpoints that have been created to work with the existing report controller structure but using Prisma for data fetching.

## API Endpoints

### 1. Analytics API (`/api/analytics`)

**GET** `/api/analytics?institutionId={id}&startDate={date}&endDate={date}`

Returns comprehensive analytics data for an institution.

**Parameters:**

- `institutionId` (required): The institution ID
- `startDate` (optional): Start date for filtering (YYYY-MM-DD format)
- `endDate` (optional): End date for filtering (YYYY-MM-DD format)

**Response:**

```json
{
  "summary": {
    "totalApplications": 1500,
    "ongoingApplications": 300,
    "completedApplications": 800,
    "admittedStudents": 400,
    "acceptanceFeePaid": 350,
    "conversionRate": 26.7,
    "completionRate": 53.3,
    "acceptanceRate": 87.5
  },
  "monthlyTrends": [
    {
      "month": "2024-01-01T00:00:00.000Z",
      "ongoing": 50,
      "completed": 120,
      "admitted": 80
    }
  ],
  "distributions": {
    "programmes": {
      "Computer Science": 200,
      "Engineering": 150
    },
    "departments": {
      "Computer Science": 200,
      "Electrical Engineering": 100
    },
    "faculties": {
      "Engineering": 300,
      "Sciences": 200
    },
    "status": {
      "ongoing": 300,
      "completed": 800,
      "admitted": 400,
      "acceptancePaid": 350
    }
  },
  "demographics": {
    "gender": {
      "male": 800,
      "female": 700
    },
    "ageGroups": {
      "18-25": 1000,
      "26-35": 400,
      "36-45": 80,
      "46+": 20
    }
  },
  "financial": {
    "totalRevenue": 50000000,
    "paymentCount": 350
  }
}
```

### 2. Reports API (`/api/reports`)

**GET** `/api/reports?institutionId={id}&type={type}&format={format}&startDate={date}&endDate={date}`

Generates and returns reports in various formats.

**Parameters:**

- `institutionId` (required): The institution ID
- `type` (optional): Report type - `academic`, `financial`, `enrollment`, `performance` (default: `academic`)
- `format` (optional): Output format - `json` or `csv` (default: `json`)
- `startDate` (optional): Start date for filtering (YYYY-MM-DD format)
- `endDate` (optional): End date for filtering (YYYY-MM-DD format)

**Report Types:**

#### Academic Report

Returns student performance and academic metrics including:

- Grade distribution
- Top performers
- Programme statistics
- Admission rates

#### Financial Report

Returns financial metrics including:

- Revenue breakdown
- Payment statistics
- Fee structure analysis

#### Enrollment Report

Returns enrollment data including:

- Enrollment by programme
- Enrollment by level
- Gender distribution
- Growth trends

#### Performance Report

Returns academic performance data including:

- Average GPA
- Academic standing distribution
- Performance by programme
- Top performers

## Usage Examples

### Frontend Component Usage

```typescript
import { useAnalyticsData, useReportsData } from "@/hooks/useDashboardData";
import { useInstitutionId } from "@/hooks/useInstitutionId";

function ReportsAnalytics() {
  const institutionId = useInstitutionId();
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useAnalyticsData(institutionId);

  const fetchReport = async (type: string) => {
    try {
      const response = await fetch(
        `/api/reports?institutionId=${institutionId}&type=${type}&format=csv`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return (
    <div>
      {/* Display analytics data */}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {analyticsData && (
        <div>
          <h2>Total Applications: {analyticsData.summary.totalApplications}</h2>
          <h3>Conversion Rate: {analyticsData.summary.conversionRate}%</h3>
        </div>
      )}

      {/* Generate reports */}
      <button onClick={() => fetchReport("academic")}>
        Generate Academic Report
      </button>
    </div>
  );
}
```

## Database Schema Requirements

The API endpoints use the following Prisma models:

- `student` - Student records
- `user` - User accounts
- `programme` - Academic programmes
- `department` - Academic departments
- `faculty` - Academic faculties
- `fee_student` - Fee records
- `fee_student_payment_frequency` - Payment frequency records
- `student_gpa` - GPA records
- `student_result` - Student results

## Error Handling

The API endpoints include comprehensive error handling:

- Missing required parameters return 400 errors
- Database errors are caught and logged
- Graceful fallbacks for missing data
- Detailed error messages for debugging

## Performance Considerations

- Analytics data is cached and refreshed every 2 minutes
- Reports are generated on-demand to avoid unnecessary processing
- Database queries are optimized with proper indexing
- Large datasets are paginated where appropriate

## Security

- Institution ID validation ensures data isolation
- Role-based access control should be implemented at the application level
- Input validation prevents SQL injection
- Error messages don't expose sensitive information
