# Pin Request Flow mit Zod Validierung

## 🚀 **Request Flow für Pin Creation**

### **1. Request kommt an:**
```
POST /api/pins/send
Content-Type: application/json

{
  "wid": "test_workflow_01",
  "data_type": "json", 
  "content": "{\"user\": {\"name\": \"Test User\"}}",
  "metadata": {
    "title": "Test Pin",
    "is_public": true
  }
}
```

### **2. Zod Schema Validierung:**
```typescript
// src/lib/validation.ts
export const createPinSchema = z.object({
  wid: z.string().min(1, 'Workflow ID is required'),
  data_type: z.enum(['json', 'markdown', 'text']),
  content: z.string().min(1, 'Content is required'),
  api_key: z.string().optional(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    is_public: z.boolean().default(false)
  }).optional()
});
```

### **3. Route Handler:**
```typescript
// src/routes/pins.ts
fastify.post('/api/pins/send', {
  preHandler: fastify.authenticate,
  schema: {
    body: createPinSchema,  // ← Zod Schema wird verwendet
    response: { ... }
  }
}, async (request, reply) => {
  // request.body ist bereits validiert!
  const { wid, data_type, content, metadata } = request.body;
  // ...
});
```

### **4. Was passiert automatisch:**

1. **Request kommt an** → Fastify empfängt
2. **Zod Validierung** → `validatorCompiler` prüft Schema
3. **Bei Fehler** → 400 Bad Request mit Details
4. **Bei Erfolg** → Handler wird ausgeführt
5. **Response** → `serializerCompiler` validiert Response

### **5. Error Response (bei Validierungsfehler):**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body/wid: Workflow ID is required"
}
```

### **6. Success Response:**
```json
{
  "success": true,
  "pid": "-N1234567890abcdef",
  "message": "Pin created successfully",
  "data": { ... }
}
```

## 🎯 **Wichtige Punkte:**

- ✅ **Automatische Validierung** - Kein manuelles Prüfen nötig
- ✅ **Type Safety** - TypeScript kennt die Typen
- ✅ **Error Handling** - Automatische Fehler-Responses
- ✅ **Swagger Integration** - Schema wird in Docs angezeigt

## 🔧 **Konfiguration:**

```typescript
// src/index.ts
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const server = fastify().withTypeProvider<ZodTypeProvider>();
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
```

**Das war's! Einfach und sauber!** 🎉
