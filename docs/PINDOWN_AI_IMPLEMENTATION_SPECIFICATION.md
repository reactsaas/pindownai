# PinDown.ai Implementation Specification

## Overview
This is the final comprehensive specification for implementing PinDown.ai - a real-time data visualization platform that transforms automation outputs into shareable, dynamic pins with live template variable injection.

---

## 🎯 **System Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PinDown.ai Architecture                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │ Automation  │    │   Backend   │    │  Firebase   │    │  Frontend   │  │
│  │   Sources   │───▶│  Fastify    │───▶│  Realtime   │───▶│   Next.js   │  │
│  │             │    │     API     │    │  Database   │    │             │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                             │
│  Zapier, n8n,        • Pin CRUD           • Live Data       • Smart        │
│  Make.com,           • Authentication     • Subscriptions   Template       │
│  Custom Scripts      • API Keys           • Security Rules  Engine         │
│                      • Validation         • Real-time Sync  • UI Components│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📋 **Implementation Phases**

### **Phase 1: Core Backend (Week 1-2)**
✅ **Firebase Setup & Authentication**  
✅ **API Endpoints for Pin Data**  
✅ **Multi-Workflow Data Structure**  
✅ **Basic Security & Validation**  

### **Phase 2: Real-time System (Week 3-4)**
✅ **Firebase Realtime Database Integration**  
✅ **Selective Subscription System**  
✅ **Change Detection & Broadcasting**  
✅ **Connection Management**  

### **Phase 3: Frontend Template Engine (Week 5-6)**
✅ **Smart Template Processing**  
✅ **Variable Injection System**  
✅ **Real-time UI Updates**  
✅ **Animation & Visual Feedback**  

### **Phase 4: Production Ready (Week 7-8)**
✅ **Error Handling & Monitoring**  
✅ **Performance Optimization**  
✅ **Testing & Documentation**  
✅ **Deployment & CI/CD**  

---

## 🗄️ **Database Architecture**

### **Firebase Realtime Database Structure**
```json
{
  "pins": {
    "pin_usr123_wf001_1703584800": {
      "id": "pin_usr123_wf001_1703584800",
      "user_id": "usr_123",
      "data_type": "markdown",
      "content": "# Dashboard\n\n**Revenue**: {{wd_01.revenue | currency}}\n**Status**: {{wd_02.status | status_badge}}",
      "metadata": {
        "title": "Multi-Source Dashboard",
        "workflow_sources": ["wd_01", "wd_02", "wd_03"],
        "created_at": "2024-12-25T15:20:00Z",
        "tags": ["sales", "automation"]
      },
      "permissions": {
        "is_public": true,
        "created_by": "usr_123"
      }
    }
  },
  
  "workflow_data": {
    "pin_usr123_wf001_1703584800": {
      "wd_01": {
        "revenue": 45670.50,
        "conversion_rate": 0.124,
        "status": "running",
        "last_update": { ".sv": "timestamp" }
      },
      "wd_02": {
        "api_calls": 15420,
        "status": "healthy",
        "sync_status": "connected",
        "last_update": { ".sv": "timestamp" }
      },
      "wd_03": {
        "health_score": 8.5,
        "uptime": 99.9,
        "alerts": [],
        "last_update": { ".sv": "timestamp" }
      }
    }
  },
  
  "user_pins": {
    "usr_123": {
      "pin_usr123_wf001_1703584800": {
        "title": "Multi-Source Dashboard",
        "workflow_sources": ["wd_01", "wd_02", "wd_03"],
        "created_at": "2024-12-25T15:20:00Z",
        "is_active": true
      }
    }
  },
  
  "workflow_metadata": {
    "wd_01": {
      "name": "Primary Sales Data",
      "owner": "usr_123",
      "type": "sales_automation",
      "active_pins": ["pin_usr123_wf001_1703584800"]
    }
  },
  
  "api_keys": {
    "usr_123": {
      "key_abc123": {
        "name": "Production Automation",
        "permissions": ["workflow_data:write"],
        "key_hash": "hashed_value",
        "is_active": true,
        "usage_count": 156
      }
    }
  }
}
```

---

## 🚀 **Backend Implementation**

### **1. Project Structure**
```
backend-api/
├── src/
│   ├── plugins/
│   │   ├── firebase.ts       # Firebase Admin integration
│   │   ├── auth.ts           # Dual authentication system
│   │   └── cors.ts           # CORS configuration
│   ├── routes/
│   │   ├── pins.ts           # Pin CRUD operations
│   │   ├── workflow-data.ts  # Workflow data endpoints
│   │   └── auth.ts           # Authentication routes
│   ├── lib/
│   │   ├── validation.ts     # Schema validation
│   │   └── utils.ts          # Utility functions
│   └── index.ts              # Main server file
├── package.json
├── tsconfig.json
└── .env.example
```

### **2. Core Dependencies**
```json
{
  "dependencies": {
    "fastify": "^5.5.0",
    "firebase-admin": "^12.0.0",
    "@fastify/cors": "^11.1.0",
    "@fastify/helmet": "^13.0.1",
    "@fastify/rate-limit": "^10.3.0",
    "@fastify/swagger": "^9.5.1",
    "@fastify/swagger-ui": "^5.2.3",
    "zod": "^3.22.4",
    "uuid": "^9.0.1",
    "crypto": "^1.0.1"
  }
}
```

### **3. Key API Endpoints**

#### **Pin Management**
```typescript
POST   /api/pins/send                    # Create/update pin data
GET    /api/pins/:pinId                  # Get pin by ID
GET    /api/pins                         # List user's pins
DELETE /api/pins/:pinId                  # Delete pin
```

#### **Workflow Data**
```typescript
PUT    /api/workflow-data/:pinId/:workflowId    # Update specific workflow data
GET    /api/workflow-data/:pinId/:workflowId    # Get workflow data
GET    /api/workflow-data/:pinId                # Get all workflow data for pin
```

#### **Authentication**
```typescript
POST   /api/auth/api-keys               # Generate API key
GET    /api/auth/api-keys               # List API keys
DELETE /api/auth/api-keys/:keyId        # Revoke API key
```

### **4. Firebase Plugin Implementation**
```typescript
// src/plugins/firebase.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

declare module 'fastify' {
  interface FastifyInstance {
    firebase: {
      db: any;
      auth: any;
      updateWorkflowData: (pinId: string, workflowId: string, data: any) => Promise<void>;
      createPin: (pinData: any) => Promise<string>;
      validateApiKey: (apiKey: string) => Promise<{ user_id: string; permissions: string[] } | null>;
    };
  }
}

const firebasePlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize Firebase Admin
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  const db = getDatabase();
  const auth = getAuth();

  const firebaseHelpers = {
    db,
    auth,

    async updateWorkflowData(pinId: string, workflowId: string, data: any): Promise<void> {
      const updates = {};
      updates[`workflow_data/${pinId}/${workflowId}`] = {
        ...data,
        last_update: { '.sv': 'timestamp' }
      };
      
      await db.ref().update(updates);
      fastify.log.info(`Updated workflow data: ${pinId}/${workflowId}`);
    },

    async createPin(pinData: any): Promise<string> {
      const pinId = pinData.id;
      const updates = {};

      // Save main pin data
      updates[`pins/${pinId}`] = pinData;

      // Index by user
      updates[`user_pins/${pinData.user_id}/${pinId}`] = {
        title: pinData.metadata?.title || 'Untitled Pin',
        workflow_sources: pinData.metadata?.workflow_sources || [],
        created_at: pinData.metadata.created_at,
        is_active: true
      };

      await db.ref().update(updates);
      return pinId;
    },

    async validateApiKey(apiKey: string): Promise<{ user_id: string; permissions: string[] } | null> {
      const crypto = require('crypto');
      const hashedKey = crypto.createHash('sha256').update(apiKey + process.env.API_KEY_SALT).digest('hex');

      const apiKeysRef = db.ref('api_keys');
      const snapshot = await apiKeysRef.once('value');
      
      if (!snapshot.exists()) return null;

      const allApiKeys = snapshot.val();
      for (const userId of Object.keys(allApiKeys)) {
        const userKeys = allApiKeys[userId];
        for (const keyId of Object.keys(userKeys)) {
          const keyData = userKeys[keyId];
          if (keyData.key_hash === hashedKey && keyData.is_active) {
            return {
              user_id: userId,
              permissions: keyData.permissions || []
            };
          }
        }
      }

      return null;
    }
  };

  fastify.decorate('firebase', firebaseHelpers);
};

export default fp(firebasePlugin);
```

### **5. Authentication Plugin**
```typescript
// src/plugins/auth.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      user_id: string;
      auth_method: 'firebase_token' | 'api_key';
      permissions: string[];
    };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      const authHeader = request.headers.authorization;
      const apiKeyFromBody = request.body?.api_key;

      let user = null;

      // Try Firebase token authentication
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '');
        try {
          const decodedToken = await fastify.firebase.auth.verifyIdToken(token);
          user = {
            user_id: decodedToken.uid,
            auth_method: 'firebase_token' as const,
            permissions: ['pins:read', 'pins:write', 'pins:delete', 'workflow_data:read', 'workflow_data:write']
          };
        } catch (error) {
          fastify.log.warn('Invalid Firebase token:', error.message);
        }
      }

      // Try API key authentication
      if (!user) {
        let apiKey = null;
        
        if (authHeader?.startsWith('ApiKey ')) {
          apiKey = authHeader.replace('ApiKey ', '');
        } else if (apiKeyFromBody) {
          apiKey = apiKeyFromBody;
        }

        if (apiKey) {
          const apiKeyData = await fastify.firebase.validateApiKey(apiKey);
          if (apiKeyData) {
            user = {
              user_id: apiKeyData.user_id,
              auth_method: 'api_key' as const,
              permissions: apiKeyData.permissions
            };
          }
        }
      }

      if (!user) {
        return reply.code(401).send({ 
          error: 'Unauthorized', 
          message: 'Valid Firebase token or API key required' 
        });
      }

      request.user = user;
    } catch (error) {
      fastify.log.error('Authentication error:', error);
      return reply.code(500).send({ error: 'Authentication failed' });
    }
  });
};

export default fp(authPlugin);
```

---

## 🎨 **Frontend Implementation**

### **1. Project Structure**
```
frontend/
├── src/
│   ├── app/
│   │   ├── share/
│   │   │   └── pin/
│   │   │       └── [pinId]/
│   │   │           └── page.tsx
│   │   └── (dashboard)/
│   │       ├── pins/
│   │       └── workflow-data/
│   ├── components/
│   │   ├── smart-real-time-pin.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── use-multi-workflow-data.ts
│   │   ├── use-smart-template-engine.ts
│   │   └── use-firebase-realtime.ts
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── template-engine.ts
│   │   └── auth-context.tsx
│   └── types/
│       └── index.ts
```

### **2. Core Dependencies**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "firebase": "^10.7.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "@radix-ui/react-badge": "^1.0.0",
    "@radix-ui/react-card": "^1.0.0",
    "@radix-ui/react-alert": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### **3. Firebase Configuration**
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

### **4. Template Engine**
```typescript
// src/lib/template-engine.ts
interface TemplateVariable {
  path: string;
  formatter?: string;
  defaultValue?: any;
  raw: string;
}

interface ParsedTemplate {
  ast: TemplateNode[];
  variables: string[];
}

class TemplateEngine {
  private formatters: Record<string, Function> = {
    currency: (value: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value),
    
    percentage: (value: number) => `${(value * 100).toFixed(1)}%`,
    
    status_badge: (status: string) => {
      const badges = {
        running: '🟢 Running',
        stopped: '🔴 Stopped',
        healthy: '🟢 Healthy',
        error: '🔴 Error'
      };
      return badges[status] || status;
    },
    
    relative_time: (timestamp: string) => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days}d ago`;
      if (hours > 0) return `${hours}h ago`;
      if (minutes > 0) return `${minutes}m ago`;
      return 'Just now';
    }
  };

  parseTemplate(template: string): ParsedTemplate {
    const variables: string[] = [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(template)) !== null) {
      const variableStr = match[1].trim();
      const variable = this.parseVariable(variableStr);
      variables.push(variable.path);
    }

    return {
      ast: template, // Simplified for this spec
      variables: [...new Set(variables)]
    };
  }

  injectVariables(template: string, data: any): { content: string; errors: string[] } {
    const errors: string[] = [];
    let processedContent = template;

    const variableRegex = /\{\{([^}]+)\}\}/g;
    processedContent = processedContent.replace(variableRegex, (match, variableStr) => {
      try {
        const variable = this.parseVariable(variableStr.trim());
        const value = this.getValue(data, variable.path);
        
        if (value === undefined && !variable.defaultValue) {
          errors.push(`Variable not found: ${variable.path}`);
          return match;
        }

        const finalValue = value !== undefined ? value : variable.defaultValue;
        return this.formatValue(finalValue, variable.formatter);
      } catch (error) {
        errors.push(`Error processing variable: ${error.message}`);
        return match;
      }
    });

    return { content: processedContent, errors };
  }

  private parseVariable(variableStr: string): TemplateVariable {
    const parts = variableStr.split('|');
    const path = parts[0].trim();
    const formatter = parts[1]?.trim();
    
    return { path, formatter, raw: variableStr };
  }

  private getValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  private formatValue(value: any, formatter?: string): string {
    if (!formatter) return String(value);
    
    const formatterFn = this.formatters[formatter];
    if (!formatterFn) return String(value);
    
    try {
      return formatterFn(value);
    } catch (error) {
      return String(value);
    }
  }
}

export const templateEngine = new TemplateEngine();
export const parseTemplate = (template: string) => templateEngine.parseTemplate(template);
export const injectVariables = (template: string, data: any) => templateEngine.injectVariables(template, data);
```

---

## 📡 **Real-time System Integration**

### **1. Multi-Workflow Data Hook**
```typescript
// src/hooks/use-multi-workflow-data.ts
import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export function useMultiWorkflowData({
  pinId,
  workflowIds,
  enabled = true
}: {
  pinId: string;
  workflowIds: string[];
  enabled?: boolean;
}) {
  const [workflowData, setWorkflowData] = useState<Record<string, any>>({});
  const [changedWorkflows, setChangedWorkflows] = useState<string[]>([]);
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const [lastUpdates, setLastUpdates] = useState<Record<string, Date>>({});
  
  const previousDataRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!enabled || !pinId || !workflowIds.length) return;

    const unsubscribes: (() => void)[] = [];

    workflowIds.forEach(workflowId => {
      const workflowRef = ref(db, `workflow_data/${pinId}/${workflowId}`);
      
      const unsubscribe = onValue(workflowRef, (snapshot) => {
        if (snapshot.exists()) {
          const newData = snapshot.val();
          const previousData = previousDataRef.current[workflowId];
          
          const hasChanged = JSON.stringify(previousData) !== JSON.stringify(newData);
          
          if (hasChanged) {
            setWorkflowData(prev => ({ ...prev, [workflowId]: newData }));
            setChangedWorkflows(prev => 
              prev.includes(workflowId) ? prev : [...prev, workflowId]
            );
            
            setTimeout(() => {
              setChangedWorkflows(prev => prev.filter(id => id !== workflowId));
            }, 3000);
            
            previousDataRef.current[workflowId] = newData;
            setLastUpdates(prev => ({ ...prev, [workflowId]: new Date() }));
          }
          
          setConnections(prev => ({ ...prev, [workflowId]: true }));
        }
      }, (error) => {
        console.error(`Error subscribing to ${workflowId}:`, error);
        setConnections(prev => ({ ...prev, [workflowId]: false }));
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [pinId, workflowIds, enabled]);

  return {
    workflowData,
    changedWorkflows,
    connections,
    lastUpdates,
    isConnected: Object.values(connections).some(connected => connected),
    allConnected: Object.values(connections).every(connected => connected)
  };
}
```

### **2. Smart Template Engine Hook**
```typescript
// src/hooks/use-smart-template-engine.ts
import { useState, useEffect, useRef } from 'react';
import { parseTemplate, injectVariables } from '@/lib/template-engine';

export function useSmartTemplateEngine({
  template,
  workflowData,
  changedWorkflows
}: {
  template: string;
  workflowData: Record<string, any>;
  changedWorkflows: string[];
}) {
  const [processedContent, setProcessedContent] = useState('');
  const [changedVariables, setChangedVariables] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const parsedTemplateRef = useRef<any>(null);
  const variableMapRef = useRef<Map<string, any>>(new Map());

  // Parse template once
  useEffect(() => {
    if (!template) return;

    const parsed = parseTemplate(template);
    parsedTemplateRef.current = parsed;

    const result = injectVariables(template, workflowData);
    setProcessedContent(result.content);
    setErrors(result.errors);

    // Create variable map
    const varMap = new Map();
    parsed.variables.forEach(variable => {
      const value = workflowData[variable.split('.')[0]]?.[variable.split('.').slice(1).join('.')];
      varMap.set(variable, value);
    });
    variableMapRef.current = varMap;
  }, [template]);

  // Smart updates when workflow data changes
  useEffect(() => {
    if (!changedWorkflows.length || !parsedTemplateRef.current) return;

    setIsProcessing(true);

    try {
      const parsed = parsedTemplateRef.current;
      const currentVariableMap = variableMapRef.current;
      let hasActualChanges = false;
      const newlyChangedVariables: string[] = [];

      // Check which variables changed
      const affectedVariables = parsed.variables.filter((variable: string) => {
        const workflowId = variable.split('.')[0];
        return changedWorkflows.includes(workflowId);
      });

      affectedVariables.forEach((variable: string) => {
        const workflowId = variable.split('.')[0];
        const fieldPath = variable.split('.').slice(1).join('.');
        const newValue = workflowData[workflowId]?.[fieldPath];
        const oldValue = currentVariableMap.get(variable);
        
        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          currentVariableMap.set(variable, newValue);
          newlyChangedVariables.push(variable);
          hasActualChanges = true;
        }
      });

      if (hasActualChanges) {
        const result = injectVariables(template, workflowData);
        setProcessedContent(result.content);
        setErrors(result.errors);
        
        setChangedVariables(newlyChangedVariables);
        setTimeout(() => setChangedVariables([]), 2000);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [workflowData, changedWorkflows, template]);

  return {
    processedContent,
    changedVariables,
    isProcessing,
    errors
  };
}
```

---

## 🧪 **Testing Strategy**

### **1. Backend Tests**
```typescript
// tests/backend/workflow-data.test.ts
import { build } from '../src/app';

describe('Workflow Data API', () => {
  let app;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  test('should update workflow data with valid auth', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/workflow-data/pin_test/wd_01',
      headers: {
        'Authorization': 'ApiKey test-api-key'
      },
      payload: {
        revenue: 50000,
        status: 'running'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });
});
```

### **2. Frontend Tests**
```typescript
// tests/frontend/template-engine.test.ts
import { parseTemplate, injectVariables } from '@/lib/template-engine';

describe('Template Engine', () => {
  test('should parse template variables correctly', () => {
    const template = 'Revenue: {{wd_01.revenue | currency}}';
    const parsed = parseTemplate(template);
    
    expect(parsed.variables).toContain('wd_01.revenue');
  });

  test('should inject variables with formatters', () => {
    const template = 'Revenue: {{wd_01.revenue | currency}}';
    const data = { wd_01: { revenue: 1000 } };
    
    const result = injectVariables(template, data);
    expect(result.content).toBe('Revenue: $1,000.00');
  });
});
```

---

## 🚀 **Deployment Configuration**

### **1. Environment Variables**
```bash
# Backend (.env)
FIREBASE_PROJECT_ID=pindown-ai-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@pindown-ai-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL=https://pindown-ai-prod-default-rtdb.firebaseio.com
API_KEY_SALT=your-secure-salt-string
PORT=8000

# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pindown-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://pindown-ai-prod-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pindown-ai-prod
NEXT_PUBLIC_API_URL=https://api.pindown.ai
```

### **2. Docker Configuration**
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 8000
CMD ["node", "dist/index.js"]

# Frontend Dockerfile  
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next ./.next
COPY public ./public
EXPOSE 3000
CMD ["npm", "start"]
```

### **3. Firebase Security Rules**
```javascript
{
  "rules": {
    "pins": {
      "$pinId": {
        ".read": "data.child('permissions/is_public').val() === true || (auth != null && data.child('user_id').val() === auth.uid)",
        ".write": "auth != null && data.child('user_id').val() === auth.uid"
      }
    },
    "workflow_data": {
      "$pinId": {
        ".read": "auth != null && (root.child('pins').child($pinId).child('user_id').val() === auth.uid || root.child('pins').child($pinId).child('permissions/is_public').val() === true)",
        "$workflowId": {
          ".write": "auth != null && root.child('pins').child($pinId).child('user_id').val() === auth.uid"
        }
      }
    },
    "user_pins": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

---

## 📊 **Performance Targets**

### **Backend Performance**
- ✅ **API Response Time**: <200ms (95th percentile)
- ✅ **Concurrent Users**: 10,000+ simultaneous connections
- ✅ **Data Throughput**: 1000+ workflow updates/second
- ✅ **Uptime**: 99.9% availability

### **Frontend Performance**
- ✅ **First Contentful Paint**: <1.5s
- ✅ **Template Processing**: <50ms initial, <15ms updates
- ✅ **Real-time Update Latency**: <500ms
- ✅ **Memory Usage**: <100MB per pin page

### **Firebase Performance**
- ✅ **Connection Time**: <2s initial connection
- ✅ **Update Propagation**: <300ms
- ✅ **Concurrent Subscriptions**: 1000+ per client
- ✅ **Data Transfer**: <5KB per workflow update

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- ✅ **99.9% Uptime** across all services
- ✅ **<500ms** end-to-end update latency
- ✅ **Zero data loss** during updates
- ✅ **<50MB** memory usage per connection

### **User Experience Metrics**
- ✅ **Real-time updates** working seamlessly
- ✅ **Smooth animations** without performance issues
- ✅ **No lost scroll positions** during updates
- ✅ **Clear visual feedback** for data changes

### **Business Metrics**
- ✅ **Support for 100+ concurrent pins**
- ✅ **Multiple workflow data sources per pin**
- ✅ **Scalable to thousands of users**
- ✅ **Production-ready monitoring & alerting**

---

## 🚀 **Launch Checklist**

### **Phase 1: Core Backend (Week 1-2)**
- [ ] Set up Firebase project and authentication
- [ ] Implement Fastify server with plugins
- [ ] Create pin CRUD endpoints
- [ ] Add workflow data endpoints
- [ ] Implement dual authentication system
- [ ] Add input validation and error handling
- [ ] Deploy to staging environment

### **Phase 2: Real-time System (Week 3-4)**
- [ ] Set up Firebase Realtime Database structure
- [ ] Implement security rules
- [ ] Create workflow data update system
- [ ] Add real-time subscriptions
- [ ] Test concurrent connections
- [ ] Performance testing and optimization

### **Phase 3: Frontend Template Engine (Week 5-6)**
- [ ] Implement template parsing engine
- [ ] Create smart template processing hooks
- [ ] Build real-time pin component
- [ ] Add animation and visual feedback
- [ ] Implement error boundaries
- [ ] Create debug tools

### **Phase 4: Production Ready (Week 7-8)**
- [ ] Comprehensive testing suite
- [ ] Performance monitoring
- [ ] Error tracking and logging
- [ ] CI/CD pipeline setup
- [ ] Production deployment
- [ ] Documentation and training

---

This comprehensive specification provides everything needed to build a **production-ready, high-performance real-time pin system** that scales efficiently and delivers an excellent user experience!
