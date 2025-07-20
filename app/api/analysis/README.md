# Analysis API Endpoints

This directory contains the API endpoints for managing and retrieving analysis reports.

## Authentication

All endpoints require authentication via Supabase Auth. Include a valid authentication token in your requests.

## Endpoints

### GET /api/analysis

Retrieve a paginated list of analysis reports with optional filtering.

#### Query Parameters

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Number of items per page (default: 10, max: 100)
- `workflowId` (optional): Filter by workflow ID
- `startDate` (optional): Filter by start date (ISO 8601 format)
- `endDate` (optional): Filter by end date (ISO 8601 format)
- `sortBy` (optional): Sort field - `analyzedAt` or `productsAnalyzed` (default: `analyzedAt`)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: `desc`)

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Weekly Product Analysis",
      "content": {
        // Parsed JSON content
      },
      "productsAnalyzed": 25,
      "workflowId": 1,
      "analyzedAt": "2024-01-20T10:30:00Z",
      "createdAt": "2024-01-20T10:30:00Z",
      "workflow": {
        "id": 1,
        "name": "Weekly Analysis",
        "type": "analysis"
      }
    }
  ],
  "metadata": {
    "timestamp": "2024-01-20T12:00:00Z",
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### GET /api/analysis/[id]

Retrieve a specific analysis report by ID.

#### Parameters

- `id`: The analysis report ID (numeric)

#### Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Weekly Product Analysis",
    "content": {
      // Parsed JSON content
    },
    "productsAnalyzed": 25,
    "workflowId": 1,
    "analyzedAt": "2024-01-20T10:30:00Z",
    "createdAt": "2024-01-20T10:30:00Z",
    "workflow": {
      "id": 1,
      "name": "Weekly Analysis",
      "type": "analysis",
      "webhookUrl": "https://example.com/webhook",
      "isActive": true,
      "lastExecuted": "2024-01-20T10:00:00Z",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  },
  "metadata": {
    "timestamp": "2024-01-20T12:00:00Z"
  }
}
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional, only in development mode
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Authentication required or invalid token
- `VALIDATION_ERROR`: Invalid query parameters or request body
- `INVALID_ID`: Invalid ID format
- `NOT_FOUND`: Resource not found
- `INVALID_PAGINATION`: Invalid pagination parameters
- `INVALID_DATE`: Invalid date format
- `INTERNAL_ERROR`: Server error

## Usage Examples

### Fetch recent analysis reports

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analysis?page=1&pageSize=10&sortBy=analyzedAt&sortOrder=desc"
```

### Fetch analysis reports for a specific workflow

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analysis?workflowId=1"
```

### Fetch analysis reports within a date range

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analysis?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z"
```

### Fetch a specific analysis report

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/analysis/1"
```