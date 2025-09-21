# Pins API Documentation

This directory contains the pins API endpoints for the PinDown.ai backend.

## Available Endpoints

### 1. GET /api/pins
**Purpose**: List user's pins  
**Auth**: Required (Bearer token or API key)

#### Success Response (200)
```json
{
  "success": true,
  "pins": [
    {
      "id": "string",
      "user_id": "string",
      "wid": "string|null",
      "data_type": "string",
      "content": "string",
      "metadata": {
        "title": "string",
        "description": "string",
        "tags": ["string"],
        "workflow_sources": ["string"],
        "created_at": "string",
        "is_public": boolean
      },
      "permissions": {
        "is_public": boolean,
        "created_by": "string"
      }
    }
  ],
  "count": number
}
```

#### Error Responses
- **401 Unauthorized**: Missing or invalid authentication
- **500 Internal Server Error**: Server error

### 2. POST /api/pins/send
**Purpose**: Create or update pin data  
**Auth**: Required (Bearer token or API key)

#### Input Body
```json
{
  "data_type": "json|markdown|text",  // Optional: Data type (default: "markdown")
  "metadata": {              // Optional: Pin metadata
    "title": "string",       // Optional: Pin title (default: "Untitled Pin")
    "description": "string", // Optional: Pin description
    "tags": ["string"],      // Optional: Array of tags
    "is_public": boolean     // Optional: Public visibility (default: false)
  }
}
```

#### Success Response (200)
```json
{
  "success": true,
  "pid": "string",           // Generated pin ID
  "message": "Pin created successfully",
  "data": {
    "id": "string",
    "user_id": "string",
    "wid": "string",
    "data_type": "string",
    "content": "string",
    "metadata": {
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "workflow_sources": ["string"],
      "created_at": "string",
      "is_public": boolean
    },
    "permissions": {
      "is_public": boolean,
      "created_by": "string"
    }
  }
}
```

#### Error Responses
- **400**: Validation failed (missing required fields, invalid data_type, etc.)
- **401**: Authentication required
- **500**: Internal server error

---

### 2. GET /api/pins/:pid
**Purpose**: Get pin by ID  
**Auth**: Required (must own pin or pin must be public)

#### URL Parameters
- `pid`: Pin ID (string)

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    // Same structure as POST /api/pins/send response data
  }
}
```

#### Error Responses
- **403**: Permission denied (not your pin and not public)
- **404**: Pin not found
- **500**: Internal server error

---

### 3. GET /api/pins
**Purpose**: List user's pins  
**Auth**: Required

#### Query Parameters
- `limit`: Number of pins to return (default: 50)
- `offset`: Number of pins to skip (default: 0)

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "pins": [
      {
        // Pin objects (same structure as individual pin)
      }
    ],
    "total": number
  }
}
```

#### Error Responses
- **500**: Internal server error

---

### 4. DELETE /api/pins/:pid
**Purpose**: Delete pin  
**Auth**: Required (must own pin)

#### URL Parameters
- `pid`: Pin ID (string)

#### Success Response (200)
```json
{
  "success": true,
  "message": "Pin deleted successfully"
}
```

#### Error Responses
- **403**: Permission denied (not your pin)
- **404**: Pin not found
- **500**: Internal server error

---

## Error Response Format

All error responses follow this structure:
```json
{
  "success": false,
  "error": {
    "code": "string",        // Error code (e.g., "VALIDATION_FAILED", "AUTH_REQUIRED")
    "type": "string",        // Error type (e.g., "validation", "authentication")
    "message": "string",     // Human-readable error message
    "details": any,          // Optional: Additional error details
    "timestamp": "string"    // ISO timestamp
  }
}
```

## Authentication

- **Bearer Token**: `Authorization: Bearer <firebase_token>`
- **API Key**: `Authorization: ApiKey <api_key>`
- **Development Mode**: Authentication is bypassed when `NODE_ENV=development`

## Example Usage

### List User's Pins
```bash
curl -X GET http://localhost:8000/api/pins \
  -H "Authorization: Bearer your-token"
```

### Create a New Pin
```bash
curl -X POST http://localhost:8000/api/pins/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "data_type": "markdown",
    "metadata": {
      "title": "Weekly Report",
      "description": "Weekly performance metrics",
      "tags": ["report", "weekly"],
      "is_public": false
    }
  }'
```

### Create a Simple Pin
```bash
curl -X POST http://localhost:8000/api/pins/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "metadata": {
      "title": "My New Pin",
      "description": "A simple pin for testing",
      "tags": ["research", "insights"]
    }
  }'
```

### Get a Pin
```bash
curl -X GET http://localhost:8000/api/pins/your-pin-id \
  -H "Authorization: Bearer your-token"
```

### List User's Pins
```bash
curl -X GET "http://localhost:8000/api/pins?limit=10&offset=0" \
  -H "Authorization: Bearer your-token"
```

### Delete a Pin
```bash
curl -X DELETE http://localhost:8000/api/pins/your-pin-id \
  -H "Authorization: Bearer your-token"
```

## Testing

Run the test suite to verify all endpoints work correctly:

```bash
npm test
```

The tests cover:
- Happy path scenarios (valid JSON and markdown data)
- Zod validation (missing fields, invalid data types)
- Authentication handling
- Error response formats
