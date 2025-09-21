# Firebase Basic Setup - High Level Overview

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  Fastify API     │◄──►│  PostgreSQL     │
│                 │    │                  │    │                 │
│  - Pin Pages    │    │  - PUT /pins/:id │    │  - Pin Metadata │
│  - Auth Pages   │    │  - Authentication│    │  - User Data    │
│  - Real-time    │    │  - Validation    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       ▼
         ▼                ┌──────────────────┐
┌─────────────────┐       │  Firebase Admin  │
│ Firebase Auth   │       │  (Server)        │
│ (Client)        │       │                  │
│ - Login/Signup  │       │  - Update pins   │
│ - JWT Tokens    │       │  - Sync data     │
└─────────────────┘       └──────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────┐
│           Firebase Realtime DB              │
│                                             │
│  /pins/{pinId}/liveData                    │
│  /users/{userId}/profile                   │
└─────────────────────────────────────────────┘
```

---

## Setup Steps

### 1. Firebase Project Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and create project
firebase login
firebase init
```

**Firebase Console Setup:**
1. Create new project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password)
3. Enable **Realtime Database**
4. Generate **Service Account Key** for server

### 2. Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pindown-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://pindown-ai-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pindown-ai

# Backend (.env)
FIREBASE_PROJECT_ID=pindown-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@pindown-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----"
FIREBASE_DATABASE_URL=https://pindown-ai-default-rtdb.firebaseio.com
```

---

## Backend Implementation

### Install Dependencies
```bash
cd backend-api
npm install firebase-admin
```

### Firebase Plugin
```typescript
// plugins/firebase.ts
import { FastifyPluginAsync } from 'fastify';
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';

declare module 'fastify' {
  interface FastifyInstance {
    firebase: {
      auth: any;
      db: any;
      updatePinData: (pinId: string, data: any) => Promise<void>;
    };
  }
}

const firebasePlugin: FastifyPluginAsync = async (fastify) => {
  // Initialize Firebase Admin
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  const auth = getAuth(app);
  const db = getDatabase(app);

  fastify.decorate('firebase', {
    auth,
    db,
    
    async updatePinData(pinId: string, data: any) {
      const updates = {};
      
      // Flatten the data for Firebase
      Object.entries(data).forEach(([key, value]) => {
        updates[`pins/${pinId}/liveData/${key}`] = value;
      });
      
      updates[`pins/${pinId}/liveData/lastUpdate`] = {
        '.sv': 'timestamp'
      };
      
      await db.ref().update(updates);
      fastify.log.info(`Updated pin ${pinId} real-time data`);
    }
  });
};

export default firebasePlugin;
```

### Authentication Middleware
```typescript
// plugins/auth.ts
import { FastifyPluginAsync } from 'fastify';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: any, reply: any) => {
    try {
      const token = request.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return reply.code(401).send({ error: 'No token provided' });
      }
      
      // Verify Firebase token
      const decodedToken = await fastify.firebase.auth.verifyIdToken(token);
      request.user = decodedToken;
      
    } catch (error) {
      return reply.code(401).send({ error: 'Invalid token' });
    }
  });
};

export default authPlugin;
```

### Pin Update Route
```typescript
// routes/pins.ts
import { FastifyInstance } from 'fastify';

export async function pinRoutes(fastify: FastifyInstance) {
  // Update pin data (triggers real-time updates)
  fastify.put('/api/pins/:id', {
    preHandler: fastify.authenticate,
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          liveData: { type: 'object' }
        }
      }
    }
  }, async (request: any, reply) => {
    const { id } = request.params;
    const { title, content, liveData } = request.body;
    const userId = request.user.uid;
    
    try {
      // Update in PostgreSQL (your main database)
      const updatedPin = await fastify.db.query(
        'UPDATE pins SET title = $1, content = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
        [title, content, id, userId]
      );
      
      if (updatedPin.rows.length === 0) {
        return reply.code(404).send({ error: 'Pin not found' });
      }
      
      // Update Firebase for real-time updates
      if (liveData) {
        await fastify.firebase.updatePinData(id, liveData);
      }
      
      return {
        success: true,
        pin: updatedPin.rows[0]
      };
      
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update pin' });
    }
  });
  
  // Get pin data
  fastify.get('/api/pins/:id', {
    preHandler: fastify.authenticate
  }, async (request: any, reply) => {
    const { id } = request.params;
    const userId = request.user.uid;
    
    const pin = await fastify.db.query(
      'SELECT * FROM pins WHERE id = $1 AND (user_id = $2 OR is_public = true)',
      [id, userId]
    );
    
    if (pin.rows.length === 0) {
      return reply.code(404).send({ error: 'Pin not found' });
    }
    
    return pin.rows[0];
  });
}
```

### Main Server Setup
```typescript
// src/index.ts
import fastify from 'fastify';
import firebasePlugin from './plugins/firebase';
import authPlugin from './plugins/auth';
import { pinRoutes } from './routes/pins';

const server = fastify({ logger: true });

async function start() {
  try {
    // Register plugins
    await server.register(firebasePlugin);
    await server.register(authPlugin);
    
    // Register routes
    await server.register(pinRoutes);
    
    await server.listen({ port: 8000, host: '0.0.0.0' });
    server.log.info('🚀 Server running on http://localhost:8000');
    
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
```

---

## Frontend Implementation

### Install Dependencies
```bash
cd frontend
npm install firebase
```

### Firebase Configuration
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

### Authentication Context
```typescript
// context/auth-context.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Login Component
```typescript
// components/login.tsx
'use client';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignup ? 'Sign Up' : 'Login'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Loading...' : (isSignup ? 'Sign Up' : 'Login')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Real-time Pin Page
```typescript
// components/live-pin.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface LivePinProps {
  pinId: string;
}

export function LivePin({ pinId }: LivePinProps) {
  const [liveData, setLiveData] = useState<any>(null);
  const [pinData, setPinData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getToken, user } = useAuth();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!pinId) return;

    const liveDataRef = ref(db, `pins/${pinId}/liveData`);
    
    const unsubscribe = onValue(
      liveDataRef,
      (snapshot) => {
        const data = snapshot.val();
        setLiveData(data);
        setIsConnected(true);
        console.log('Real-time update:', data);
      },
      (error) => {
        console.error('Firebase error:', error);
        setIsConnected(false);
      }
    );

    return unsubscribe;
  }, [pinId]);

  // Load pin data from your API
  useEffect(() => {
    const loadPin = async () => {
      if (!pinId) return;
      
      const token = await getToken();
      const response = await fetch(`/api/pins/${pinId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const pin = await response.json();
        setPinData(pin);
      }
    };

    loadPin();
  }, [pinId, getToken]);

  // Update pin data
  const updatePin = async (newLiveData: any) => {
    setLoading(true);
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/pins/${pinId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: pinData?.title,
          content: pinData?.content,
          liveData: newLiveData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update pin');
      }

      console.log('Pin updated successfully');
      
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update pin');
    } finally {
      setLoading(false);
    }
  };

  // Demo: Update automation status
  const updateAutomationStatus = () => {
    const newData = {
      automation: {
        status: 'running',
        recordsProcessed: Math.floor(Math.random() * 1000),
        progress: Math.floor(Math.random() * 100)
      },
      performance: {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100)
      }
    };

    updatePin(newData);
  };

  if (!user) {
    return <div>Please log in to view pins</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      {/* Pin Info */}
      <Card>
        <CardHeader>
          <CardTitle>{pinData?.title || 'Loading...'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{pinData?.content}</p>
        </CardContent>
      </Card>

      {/* Live Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Live Data</CardTitle>
        </CardHeader>
        <CardContent>
          {liveData ? (
            <div className="space-y-4">
              {/* Automation Status */}
              {liveData.automation && (
                <div>
                  <h3 className="font-semibold">Automation</h3>
                  <p>Status: <LiveValue value={liveData.automation.status} /></p>
                  <p>Progress: <LiveValue value={`${liveData.automation.progress}%`} /></p>
                  <p>Records: <LiveValue value={liveData.automation.recordsProcessed} /></p>
                </div>
              )}

              {/* Performance */}
              {liveData.performance && (
                <div>
                  <h3 className="font-semibold">Performance</h3>
                  <p>CPU: <LiveValue value={`${liveData.performance.cpu}%`} /></p>
                  <p>Memory: <LiveValue value={`${liveData.performance.memory}%`} /></p>
                </div>
              )}

              {/* Last Update */}
              {liveData.lastUpdate && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(liveData.lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>
          ) : (
            <p>No live data available</p>
          )}
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={updateAutomationStatus} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Updating...' : 'Update Automation Data'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Animated value component
function LiveValue({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsUpdating(true);
      setDisplayValue(value);
      
      const timer = setTimeout(() => setIsUpdating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [value, displayValue]);

  return (
    <span className={`inline-block transition-all duration-300 ${
      isUpdating ? 'bg-blue-100 text-blue-900 px-2 py-1 rounded' : ''
    }`}>
      {displayValue}
    </span>
  );
}
```

### Main Pin Page
```typescript
// app/pins/[id]/page.tsx
'use client';
import { useAuth } from '@/context/auth-context';
import { Login } from '@/components/login';
import { LivePin } from '@/components/live-pin';

export default function PinPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <LivePin pinId={params.id} />;
}
```

### Root Layout
```typescript
// app/layout.tsx
import { AuthProvider } from '@/context/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Firebase Database Structure

```json
{
  "pins": {
    "pin_123": {
      "liveData": {
        "automation": {
          "status": "running",
          "recordsProcessed": 1250,
          "progress": 83
        },
        "performance": {
          "cpu": 45,
          "memory": 67
        },
        "lastUpdate": 1705312345678
      }
    }
  }
}
```

---

## Firebase Security Rules

```javascript
{
  "rules": {
    "pins": {
      "$pinId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

---

## Testing the Setup

### 1. Start Backend
```bash
cd backend-api
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Test Flow
1. **Login**: Go to `http://localhost:3000` and login/signup
2. **View Pin**: Navigate to `http://localhost:3000/pins/pin_123`
3. **Update Data**: Click "Update Automation Data" button
4. **See Real-time**: Watch values update instantly with animation

### 4. Test API
```bash
# Get auth token from browser dev tools (Firebase Auth)
TOKEN="your_firebase_token"

# Update pin data
curl -X PUT http://localhost:8000/api/pins/pin_123 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Test Pin",
    "content": "Test content",
    "liveData": {
      "automation": {
        "status": "completed",
        "recordsProcessed": 1500,
        "progress": 100
      }
    }
  }'
```

---

## Next Steps

1. **Database Setup**: Create PostgreSQL tables for pins
2. **Security**: Implement proper Firebase security rules
3. **Error Handling**: Add comprehensive error handling
4. **Validation**: Add input validation schemas
5. **Testing**: Add unit and integration tests
6. **Deployment**: Deploy to production

This basic setup gives you:
- ✅ Firebase Authentication (login/signup)
- ✅ API endpoint to update pin data  
- ✅ Real-time updates on frontend
- ✅ Secure token-based authentication
- ✅ Animated UI updates

The foundation is ready - you can now build more features on top of this! 🚀
