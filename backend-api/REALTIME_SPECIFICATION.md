# PinDown.ai Real-time Features Specification

## Overview
Real-time data streaming for live updates in pins, automation status, and system monitoring using **Server-Sent Events (SSE)** as the primary transport mechanism.

## Why SSE over WebSockets?

### ✅ **SSE Advantages for PinDown.ai:**
- **Unidirectional**: Perfect for server → client updates only
- **Auto-reconnection**: Built-in browser reconnection on connection loss
- **Simpler implementation**: Standard HTTP, no protocol upgrade needed
- **Better caching**: Works through proxies/CDNs
- **Lower overhead**: No handshake protocol required
- **Browser native**: EventSource API built into browsers
- **Authentication friendly**: Uses standard HTTP headers

### ❌ **WebSocket Overkill for:**
- Live data updates (one-way)
- Status notifications (one-way)
- Progress updates (one-way)
- Real-time charts (one-way)

### 🔄 **WebSockets Only If/When Needed:**
- Real-time collaboration (editing)
- Live chat/comments
- Interactive features requiring client → server communication

---

## SSE Implementation Architecture

### Base SSE Endpoint
```
GET /api/sse/stream
```

**Headers:**
```http
Authorization: Bearer <jwt_token>
Cache-Control: no-cache
Connection: keep-alive
Content-Type: text/event-stream
```

**Query Parameters:**
- `channels`: Comma-separated list of channels to subscribe to
- `pinId`: Specific pin ID for pin-scoped updates
- `userId`: User ID (auto-detected from JWT)

**Example:**
```
GET /api/sse/stream?channels=pins,automation,system&pinId=pin_123
```

---

## Event Channels & Types

### 1. **Pins Channel** (`pins`)
Live updates for pin content and metadata

#### Events:
```typescript
// Pin content updated (template variables changed)
{
  event: "pin:content_updated",
  data: {
    pinId: "pin_123",
    updatedVars: {
      "automation.status": "completed",
      "automation.records_processed": 1500,
      "automation.last_run": "2024-01-15T10:30:00Z"
    },
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Pin views incremented
{
  event: "pin:views_updated", 
  data: {
    pinId: "pin_123",
    views: 156,
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Pin published/unpublished
{
  event: "pin:status_changed",
  data: {
    pinId: "pin_123", 
    status: "published",
    isPublic: true,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

### 2. **Automation Channel** (`automation`)
Live automation workflow updates

#### Events:
```typescript
// Automation pipeline status
{
  event: "automation:pipeline_status",
  data: {
    pipelineId: "pipe_456",
    stage: "data_processing",
    status: "running" | "completed" | "failed",
    progress: 75,
    message: "Processing MongoDB data: 7,500 / 10,000 records",
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Data source sync status  
{
  event: "automation:datasource_sync",
  data: {
    sourceId: "ds_789",
    sourceName: "Supabase Users",
    status: "syncing" | "completed" | "error",
    recordsProcessed: 1250,
    totalRecords: 1500,
    lastSync: "2024-01-15T10:30:00Z"
  }
}

// API integration status
{
  event: "automation:api_status", 
  data: {
    provider: "openai" | "stripe" | "hubspot",
    endpoint: "/v1/completions",
    status: "success" | "rate_limited" | "error",
    responseTime: 245,
    creditsUsed: 12,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

### 3. **System Channel** (`system`)
System-wide notifications and health

#### Events:
```typescript
// System health metrics
{
  event: "system:health_update",
  data: {
    cpu: 45.2,
    memory: 67.8,
    uptime: 86400,
    activeConnections: 23,
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Rate limit warnings
{
  event: "system:rate_limit_warning",
  data: {
    userId: "user_123",
    endpoint: "/api/ai/generate",
    remaining: 5,
    resetTime: "2024-01-15T11:00:00Z",
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Background job completion
{
  event: "system:job_completed",
  data: {
    jobId: "job_456",
    type: "document_processing" | "ai_generation" | "data_export",
    status: "completed" | "failed",
    result: {},
    duration: 5432,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

### 4. **AI Channel** (`ai`)
AI generation and processing updates

#### Events:
```typescript
// AI generation progress
{
  event: "ai:generation_progress",
  data: {
    requestId: "req_789",
    type: "template" | "block" | "improvement",
    stage: "analyzing" | "generating" | "formatting" | "complete",
    progress: 60,
    estimatedTime: 15,
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// AI generation completed
{
  event: "ai:generation_complete",
  data: {
    requestId: "req_789",
    result: {
      content: "Generated markdown content...",
      templateVars: {},
      tokensUsed: 1250
    },
    duration: 8500,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

### 5. **Analytics Channel** (`analytics`)
Real-time analytics updates

#### Events:
```typescript
// Live visitor count
{
  event: "analytics:active_users",
  data: {
    total: 45,
    authenticated: 23,
    anonymous: 22,
    timestamp: "2024-01-15T10:30:00Z"
  }
}

// Popular pins update
{
  event: "analytics:trending_pins",
  data: {
    pins: [
      { id: "pin_123", title: "Daily Report", views: 234, trend: "+15%" },
      { id: "pin_456", title: "Automation Status", views: 189, trend: "+8%" }
    ],
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

---

## Frontend Implementation

### JavaScript/TypeScript Client

```typescript
class PinDownSSEClient {
  private eventSource: EventSource | null = null;
  private baseUrl: string;
  private authToken: string;
  
  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }
  
  connect(channels: string[], pinId?: string) {
    const params = new URLSearchParams({
      channels: channels.join(','),
      ...(pinId && { pinId })
    });
    
    const url = `${this.baseUrl}/api/sse/stream?${params}`;
    
    this.eventSource = new EventSource(url, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });
    
    // Generic message handler
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data.event, data.data);
    };
    
    // Specific event handlers
    this.eventSource.addEventListener('pin:content_updated', (event) => {
      const data = JSON.parse(event.data);
      this.updatePinContent(data);
    });
    
    this.eventSource.addEventListener('automation:pipeline_status', (event) => {
      const data = JSON.parse(event.data);
      this.updateAutomationStatus(data);
    });
    
    // Connection management
    this.eventSource.onopen = () => {
      console.log('SSE Connected');
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // Browser will auto-reconnect
    };
  }
  
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
  
  private updatePinContent(data: any) {
    // Update live values in pin display
    Object.entries(data.updatedVars).forEach(([key, value]) => {
      const element = document.querySelector(`[data-var="${key}"]`);
      if (element) {
        element.textContent = value as string;
        element.classList.add('live-updating');
        setTimeout(() => element.classList.remove('live-updating'), 1000);
      }
    });
  }
  
  private updateAutomationStatus(data: any) {
    // Update progress bars, status indicators
    const progressBar = document.querySelector(`[data-pipeline="${data.pipelineId}"] .progress-bar`);
    if (progressBar) {
      (progressBar as HTMLElement).style.width = `${data.progress}%`;
    }
  }
}

// Usage
const sseClient = new PinDownSSEClient('http://localhost:8000', userToken);
sseClient.connect(['pins', 'automation'], 'pin_123');
```

### React Hook Implementation

```typescript
import { useEffect, useRef, useState } from 'react';

interface SSEOptions {
  channels: string[];
  pinId?: string;
  enabled?: boolean;
}

export function useSSE(options: SSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  
  useEffect(() => {
    if (!options.enabled) return;
    
    const params = new URLSearchParams({
      channels: options.channels.join(','),
      ...(options.pinId && { pinId: options.pinId })
    });
    
    const url = `/api/sse/stream?${params}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastEvent(data);
    };
    
    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [options.channels, options.pinId, options.enabled]);
  
  return { isConnected, lastEvent };
}

// Usage in component
function LivePinComponent({ pinId }: { pinId: string }) {
  const { isConnected, lastEvent } = useSSE({
    channels: ['pins', 'automation'],
    pinId,
    enabled: true
  });
  
  useEffect(() => {
    if (lastEvent?.event === 'pin:content_updated') {
      // Update local state with new values
      updatePinVariables(lastEvent.data.updatedVars);
    }
  }, [lastEvent]);
  
  return (
    <div>
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Live' : '🔴 Offline'}
      </div>
      {/* Pin content with live updates */}
    </div>
  );
}
```

---

## Backend Implementation

### Fastify SSE Plugin

```typescript
// plugins/sse.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

interface SSEConnection {
  id: string;
  userId: string;
  channels: string[];
  pinId?: string;
  response: any;
}

declare module 'fastify' {
  interface FastifyInstance {
    sse: {
      broadcast: (channel: string, event: string, data: any) => void;
      broadcastToPin: (pinId: string, event: string, data: any) => void;
      broadcastToUser: (userId: string, event: string, data: any) => void;
    };
  }
}

const ssePlugin: FastifyPluginAsync = async (fastify) => {
  const connections = new Map<string, SSEConnection>();
  
  // SSE endpoint
  fastify.get('/api/sse/stream', {
    preHandler: fastify.authenticate,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          channels: { type: 'string' },
          pinId: { type: 'string' }
        },
        required: ['channels']
      }
    }
  }, async (request, reply) => {
    const { channels, pinId } = request.query as any;
    const userId = (request as any).user.userId;
    const connectionId = `${userId}_${Date.now()}`;
    
    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });
    
    // Store connection
    connections.set(connectionId, {
      id: connectionId,
      userId,
      channels: channels.split(','),
      pinId,
      response: reply.raw
    });
    
    // Send initial connection confirmation
    reply.raw.write(`event: connected\ndata: ${JSON.stringify({ 
      connectionId, 
      timestamp: new Date().toISOString() 
    })}\n\n`);
    
    // Handle client disconnect
    request.raw.on('close', () => {
      connections.delete(connectionId);
      fastify.log.info(`SSE connection closed: ${connectionId}`);
    });
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      if (connections.has(connectionId)) {
        reply.raw.write(`event: ping\ndata: ${JSON.stringify({ 
          timestamp: new Date().toISOString() 
        })}\n\n`);
      } else {
        clearInterval(keepAlive);
      }
    }, 30000); // 30 second ping
  });
  
  // SSE broadcasting methods
  fastify.decorate('sse', {
    broadcast: (channel: string, event: string, data: any) => {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      for (const [connectionId, connection] of connections.entries()) {
        if (connection.channels.includes(channel)) {
          try {
            connection.response.write(message);
          } catch (error) {
            // Connection closed, remove it
            connections.delete(connectionId);
          }
        }
      }
    },
    
    broadcastToPin: (pinId: string, event: string, data: any) => {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      for (const [connectionId, connection] of connections.entries()) {
        if (connection.pinId === pinId) {
          try {
            connection.response.write(message);
          } catch (error) {
            connections.delete(connectionId);
          }
        }
      }
    },
    
    broadcastToUser: (userId: string, event: string, data: any) => {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      
      for (const [connectionId, connection] of connections.entries()) {
        if (connection.userId === userId) {
          try {
            connection.response.write(message);
          } catch (error) {
            connections.delete(connectionId);
          }
        }
      }
    }
  });
};

export default fp(ssePlugin);
```

### Usage in Route Handlers

```typescript
// When pin content is updated
fastify.put('/api/pins/:id', async (request, reply) => {
  const { id } = request.params;
  const updateData = request.body;
  
  // Update pin in database
  const updatedPin = await updatePin(id, updateData);
  
  // Broadcast to all subscribers of this pin
  fastify.sse.broadcastToPin(id, 'pin:content_updated', {
    pinId: id,
    updatedVars: updateData.templateVars,
    timestamp: new Date().toISOString()
  });
  
  return updatedPin;
});

// When automation status changes
async function updateAutomationStatus(pipelineId: string, status: any) {
  // Update in database
  await savePipelineStatus(pipelineId, status);
  
  // Broadcast to automation channel
  fastify.sse.broadcast('automation', 'automation:pipeline_status', {
    pipelineId,
    ...status,
    timestamp: new Date().toISOString()
  });
}
```

---

## Performance & Scaling

### Connection Management
- **Max connections per user**: 5 concurrent SSE connections
- **Connection timeout**: 5 minutes idle timeout
- **Keep-alive**: 30-second ping messages
- **Graceful disconnect**: Clean up on client close

### Memory Optimization
- **Connection pooling**: Efficient Map-based storage
- **Event queuing**: Buffer events for slow clients
- **Auto-cleanup**: Remove dead connections automatically

### Horizontal Scaling
For multiple server instances:

```typescript
// Redis pub/sub for multi-server SSE
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const pub = new Redis(process.env.REDIS_URL);

// Subscribe to SSE events
redis.subscribe('sse:broadcast', 'sse:pin', 'sse:user');

redis.on('message', (channel, message) => {
  const { event, data, targetChannel, targetPin, targetUser } = JSON.parse(message);
  
  switch (channel) {
    case 'sse:broadcast':
      fastify.sse.broadcast(targetChannel, event, data);
      break;
    case 'sse:pin':
      fastify.sse.broadcastToPin(targetPin, event, data);
      break;
    case 'sse:user':
      fastify.sse.broadcastToUser(targetUser, event, data);
      break;
  }
});

// Enhanced broadcast methods
fastify.decorate('sse', {
  broadcast: (channel: string, event: string, data: any) => {
    // Local broadcast
    localBroadcast(channel, event, data);
    
    // Redis broadcast for other servers
    pub.publish('sse:broadcast', JSON.stringify({
      event, data, targetChannel: channel
    }));
  }
  // ... other methods
});
```

---

## Monitoring & Debugging

### SSE Health Endpoint
```typescript
fastify.get('/api/sse/health', async (request, reply) => {
  return {
    activeConnections: connections.size,
    connectionsByChannel: getConnectionStats(),
    serverUptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  };
});
```

### Client-side Debugging
```typescript
// Enhanced client with debug logging
class PinDownSSEClient {
  private debug = process.env.NODE_ENV === 'development';
  
  connect(channels: string[], pinId?: string) {
    // ... connection setup
    
    this.eventSource.addEventListener('ping', () => {
      if (this.debug) console.log('SSE ping received');
    });
    
    this.eventSource.addEventListener('error', (event) => {
      if (this.debug) {
        console.error('SSE Error:', event);
        console.log('Ready state:', this.eventSource?.readyState);
      }
    });
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test SSE broadcasting
describe('SSE Plugin', () => {
  test('should broadcast to correct channels', async () => {
    const mockConnections = setupMockConnections();
    
    fastify.sse.broadcast('pins', 'pin:updated', { pinId: '123' });
    
    expect(mockConnections.pinsChannel.received).toContain('pin:updated');
    expect(mockConnections.automationChannel.received).not.toContain('pin:updated');
  });
});
```

### Integration Tests
```typescript
// Test full SSE flow
test('should receive live updates', async () => {
  const eventSource = new EventSource('/api/sse/stream?channels=pins');
  const events: any[] = [];
  
  eventSource.onmessage = (event) => {
    events.push(JSON.parse(event.data));
  };
  
  // Trigger update
  await fastify.inject({
    method: 'PUT',
    url: '/api/pins/123',
    payload: { templateVars: { status: 'updated' } }
  });
  
  await waitFor(() => events.length > 0);
  expect(events[0].event).toBe('pin:content_updated');
});
```

---

## Migration Path

### Phase 1: Core SSE
1. Implement basic SSE plugin
2. Add pin content updates
3. Add automation status updates

### Phase 2: Advanced Features  
1. Add system health monitoring
2. Add AI generation progress
3. Add analytics updates

### Phase 3: Optimization
1. Add Redis scaling support
2. Implement connection limits
3. Add monitoring dashboard

### Future: WebSocket Upgrade
Only if real-time collaboration features are needed:
- Live document editing
- Real-time comments/chat
- Interactive pin editing

---

This SSE-based approach provides excellent performance for one-way real-time updates while keeping the implementation simple and scalable.
