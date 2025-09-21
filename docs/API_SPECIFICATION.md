# PinDown.ai API Specification

## Overview
Backend API for PinDown.ai - a platform for transforming automation outputs into shareable, readable pins using AI-powered template variables.

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: `https://api.pindown.ai`

---

## Authentication

### POST `/api/auth/login`
User authentication
```json
{
  "email": "string",
  "password": "string"
}
```
**Response**: JWT token + user info

### POST `/api/auth/register`
User registration
```json
{
  "email": "string", 
  "password": "string",
  "name": "string"
}
```

### POST `/api/auth/logout`
Logout user (invalidate token)

---

## Pins Management

### GET `/api/pins`
Get all pins for authenticated user
**Query Parameters**:
- `page`: number (pagination)
- `limit`: number (per page)
- `search`: string (search query)
- `status`: "active" | "draft" | "archived"
- `type`: "template" | "document" | "prompt" | "workflow"

**Response**:
```json
{
  "pins": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "content": "string", // Markdown content
      "type": "template" | "document" | "prompt" | "workflow",
      "status": "active" | "draft" | "archived",
      "tags": ["string"],
      "templateVars": {}, // Variable definitions
      "isPublished": boolean,
      "views": number,
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "userId": "string"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

### POST `/api/pins`
Create new pin
```json
{
  "title": "string",
  "description": "string",
  "content": "string",
  "type": "template" | "document" | "prompt" | "workflow",
  "tags": ["string"],
  "templateVars": {},
  "status": "active" | "draft"
}
```

### GET `/api/pins/:id`
Get specific pin by ID

### PUT `/api/pins/:id`
Update existing pin
```json
{
  "title": "string",
  "description": "string", 
  "content": "string",
  "tags": ["string"],
  "templateVars": {},
  "status": "active" | "draft" | "archived"
}
```

### DELETE `/api/pins/:id`
Delete pin

### POST `/api/pins/:id/publish`
Publish/unpublish pin
```json
{
  "isPublished": boolean,
  "shareSettings": {
    "isPublic": boolean,
    "allowComments": boolean,
    "expiresAt": "ISO date"
  }
}
```

### POST `/api/pins/:id/duplicate`
Duplicate an existing pin

---

## Templates & Blocks

### GET `/api/templates`
Get templates list with blocks

### POST `/api/templates`
Create template with blocks
```json
{
  "name": "string",
  "description": "string",
  "blocks": [
    {
      "id": "string",
      "name": "string",
      "type": "header" | "content" | "data" | "chart",
      "prompt": "string", // AI generation prompt
      "content": "string", // Generated content
      "order": number,
      "templateVars": {}
    }
  ]
}
```

### PUT `/api/templates/:id/blocks/:blockId`
Update specific block in template

### POST `/api/templates/:id/blocks`
Add new block to template

### DELETE `/api/templates/:id/blocks/:blockId`
Remove block from template

### POST `/api/templates/:id/blocks/reorder`
Reorder blocks in template
```json
{
  "blockOrder": ["blockId1", "blockId2", "blockId3"]
}
```

---

## AI Generation

### POST `/api/ai/generate-block`
Generate content for a block using AI
```json
{
  "prompt": "string",
  "blockType": "header" | "content" | "data" | "chart",
  "dataSources": ["string"], // Connected data source IDs
  "templateVars": {}
}
```

### POST `/api/ai/generate-template`
Generate complete template from prompt
```json
{
  "prompt": "string",
  "type": "automation" | "report" | "document",
  "dataSources": ["string"]
}
```

### POST `/api/ai/improve-content`
Improve existing content using AI
```json
{
  "content": "string",
  "improvementType": "clarity" | "formatting" | "structure" | "data-focus"
}
```

---

## Data Sources & Integrations

### GET `/api/integrations`
Get available integrations

### POST `/api/integrations/:provider/connect`
Connect to external service
```json
{
  "credentials": {}, // Provider-specific auth data
  "settings": {}
}
```

### GET `/api/integrations/:provider/data`
Fetch data from connected integration
**Query Parameters**:
- `dataset`: string (specific dataset to fetch)
- `limit`: number
- `since`: ISO date

### POST `/api/data-sources`
Add manual data source
```json
{
  "name": "string",
  "type": "webhook" | "upload" | "manual",
  "data": {}, // Structured data
  "schema": {} // Data structure definition
}
```

### GET `/api/data-sources`
Get all data sources for user

### PUT `/api/data-sources/:id`
Update data source

### DELETE `/api/data-sources/:id`
Remove data source

---

## API Keys Management

### GET `/api/api-keys`
Get user's API keys (masked)
```json
{
  "apiKeys": [
    {
      "id": "string",
      "provider": "openai" | "anthropic" | "google" | "perplexity",
      "name": "string",
      "isValid": boolean,
      "lastChecked": "ISO date",
      "maskedKey": "string"
    }
  ]
}
```

### POST `/api/api-keys`
Add/update API key
```json
{
  "provider": "openai" | "anthropic" | "google" | "perplexity",
  "key": "string"
}
```

### POST `/api/api-keys/:id/test`
Test API key validity

### DELETE `/api/api-keys/:id`
Remove API key

---

## Prompts Management

### GET `/api/prompts`
Get saved prompts
**Query Parameters**:
- `category`: string
- `search`: string

### POST `/api/prompts`
Create new prompt
```json
{
  "name": "string",
  "description": "string",
  "content": "string",
  "category": "string",
  "variables": ["string"] // Template variables used
}
```

### PUT `/api/prompts/:id`
Update prompt

### DELETE `/api/prompts/:id`
Delete prompt

### POST `/api/prompts/:id/use`
Track prompt usage

---

## Documents Management

### GET `/api/documents`
Get uploaded documents

### POST `/api/documents/upload`
Upload document for data extraction
**Content-Type**: `multipart/form-data`

### GET `/api/documents/:id/extract`
Extract data from document

### DELETE `/api/documents/:id`
Remove document

---

## Analytics & Monitoring

### GET `/api/analytics/dashboard`
Get dashboard analytics
```json
{
  "totalPins": number,
  "totalViews": number,
  "recentActivity": [],
  "topPins": [],
  "usageStats": {}
}
```

### GET `/api/analytics/pins/:id`
Get analytics for specific pin

### GET `/api/logs`
Get system logs
**Query Parameters**:
- `level`: "info" | "warn" | "error"
- `since`: ISO date
- `limit`: number

---

## Sharing & Collaboration

### GET `/api/shared/:shareId`
Get shared pin (public access)

### POST `/api/pins/:id/share`
Generate share link
```json
{
  "isPublic": boolean,
  "expiresAt": "ISO date",
  "allowComments": boolean
}
```

### GET `/api/pins/:id/comments`
Get comments on shared pin

### POST `/api/pins/:id/comments`
Add comment to shared pin
```json
{
  "content": "string",
  "author": "string"
}
```

---

## Real-time Features

### WebSocket `/ws`
Real-time updates for:
- Live data updates in pins
- Collaboration features
- Processing status
- Notifications

**Events**:
- `pin:updated`
- `data:refreshed` 
- `generation:complete`
- `collaboration:join`

---

## Webhooks

### POST `/api/webhooks/receive/:sourceId`
Receive webhook data from external services
**Headers**: Signature verification required

### GET `/api/webhooks`
Get webhook endpoints for user

### POST `/api/webhooks`
Create new webhook endpoint
```json
{
  "name": "string",
  "description": "string",
  "targetPins": ["string"], // Pins to update with this data
  "transformRules": {} // Data transformation rules
}
```

---

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": "string",
  "message": "string", 
  "statusCode": number,
  "timestamp": "ISO date",
  "details": {} // Optional additional info
}
```

**Common Status Codes**:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `429`: Rate Limited
- `500`: Internal Server Error

---

## Rate Limits

- **Authenticated users**: 1000 requests/hour
- **AI Generation**: 50 requests/hour
- **Public endpoints**: 100 requests/hour
- **File uploads**: 10 MB max size, 20 uploads/hour

---

## Data Models

### Pin
```typescript
interface Pin {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown with template variables
  type: 'template' | 'document' | 'prompt' | 'workflow';
  status: 'active' | 'draft' | 'archived';
  tags: string[];
  templateVars: Record<string, any>;
  isPublished: boolean;
  shareSettings?: ShareSettings;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### Template Block
```typescript
interface TemplateBlock {
  id: string;
  name: string;
  type: 'header' | 'content' | 'data' | 'chart' | 'list';
  prompt: string;
  content: string;
  order: number;
  templateVars: Record<string, any>;
  dataSources: string[];
}
```

### Integration
```typescript
interface Integration {
  id: string;
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  credentials: Record<string, any>; // Encrypted
  settings: Record<string, any>;
  lastSync: Date;
  userId: string;
}
```

---

## Priority Implementation Order

### Phase 1 (MVP)
1. Authentication (`/api/auth/*`)
2. Basic pins CRUD (`/api/pins`)
3. Health check (`/api/health`)

### Phase 2 (Core Features)
1. Templates & blocks (`/api/templates/*`)
2. AI generation (`/api/ai/*`)
3. API keys management (`/api/api-keys`)

### Phase 3 (Advanced)
1. Data sources (`/api/data-sources`)
2. Integrations (`/api/integrations/*`)
3. Sharing features (`/api/shared/*`)

### Phase 4 (Scale)
1. Analytics (`/api/analytics/*`)
2. Webhooks (`/api/webhooks/*`)
3. Real-time features (WebSocket)

---

This specification covers all the features visible in the frontend application and provides a roadmap for implementation.
