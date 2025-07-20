# Workflows API Documentation

This directory contains the API endpoints for managing workflows in the ProductHunt Scraper application.

## Authentication

All endpoints require:
1. User authentication via Supabase
2. Admin role verification

The admin role is determined by:
- `user_metadata.role === 'admin'`
- `app_metadata.role === 'admin'`
- `user.email === process.env.ADMIN_EMAIL` (fallback)

## Endpoints

### GET /api/workflows
Get all workflows.

**Response:**
```json
{
  "workflows": [
    {
      "id": 1,
      "name": "Daily Product Scraper",
      "type": "products",
      "webhookUrl": "https://n8n.example.com/webhook/abc123",
      "isActive": true,
      "lastExecuted": "2024-01-20T10:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### POST /api/workflows
Create a new workflow.

**Request Body:**
```json
{
  "name": "New Workflow",
  "type": "products", // or "analysis"
  "webhookUrl": "https://n8n.example.com/webhook/xyz789",
  "isActive": true // optional, defaults to true
}
```

**Response:** 201 Created
```json
{
  "workflow": {
    "id": 2,
    "name": "New Workflow",
    "type": "products",
    "webhookUrl": "https://n8n.example.com/webhook/xyz789",
    "isActive": true,
    "lastExecuted": null,
    "createdAt": "2024-01-20T12:00:00Z",
    "updatedAt": "2024-01-20T12:00:00Z"
  }
}
```

### GET /api/workflows/[id]
Get a specific workflow by ID.

**Response:**
```json
{
  "workflow": {
    "id": 1,
    "name": "Daily Product Scraper",
    "type": "products",
    "webhookUrl": "https://n8n.example.com/webhook/abc123",
    "isActive": true,
    "lastExecuted": "2024-01-20T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

### PUT /api/workflows/[id]
Update a workflow.

**Request Body (all fields optional):**
```json
{
  "name": "Updated Workflow Name",
  "type": "analysis",
  "webhookUrl": "https://n8n.example.com/webhook/new-url",
  "isActive": false,
  "lastExecuted": "2024-01-20T15:00:00Z"
}
```

**Response:**
```json
{
  "workflow": {
    // Updated workflow object
  }
}
```

### DELETE /api/workflows/[id]
Delete a workflow.

**Note:** Cannot delete workflows that have associated products or analysis reports.

**Response:**
```json
{
  "message": "Workflow deleted successfully"
}
```

**Error Response (if has related data):**
```json
{
  "error": "Cannot delete workflow with existing products or analysis reports. Please delete related data first.",
  "details": {
    "productsCount": 5,
    "reportsCount": 2
  }
}
```

## Error Responses

All endpoints return standard HTTP error codes:

- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - User authenticated but not admin
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Testing with cURL

### Get all workflows
```bash
curl -X GET http://localhost:3000/api/workflows \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```

### Create a workflow
```bash
curl -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "name": "Test Workflow",
    "type": "products",
    "webhookUrl": "https://n8n.example.com/webhook/test"
  }'
```

### Update a workflow
```bash
curl -X PUT http://localhost:3000/api/workflows/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "name": "Updated Workflow",
    "isActive": false
  }'
```

### Delete a workflow
```bash
curl -X DELETE http://localhost:3000/api/workflows/1 \
  -H "Cookie: sb-access-token=YOUR_TOKEN"
```