# AGENTS.md - Development Guidelines

## 🔧 Logging System

### **WICHTIG: Verwende IMMER unser Logger System statt console.log**

#### **Frontend Logging (`frontend/src/lib/logger.ts`)**

```typescript
import { logVerbose, logInfo, logError } from '@/lib/logger'

// ✅ RICHTIG - Dev-only logs (nur in development sichtbar)
logVerbose('User clicked button', 'ComponentName', { userId: 'abc123' })
logVerbose('API response received', 'APIService', responseData)

// ✅ RICHTIG - Production logs (immer sichtbar)
logInfo('User logged in successfully', 'AuthContext', { userId: user.id })

// ✅ RICHTIG - Error logs
logError('Failed to fetch data', 'APIService', error)

// ❌ FALSCH - Verwende NIEMALS direkte console logs
console.log('Debug info')        // ❌ Nicht verwenden!
console.error('Error occurred')  // ❌ Nicht verwenden!
```

#### **Backend Logging (`backend-api/src/lib/logger.ts`)**

```typescript
import { logVerbose, logInfo, logError } from './lib/logger'

// ✅ RICHTIG - Mit schönen Farben und Formatierung
logVerbose('Processing request', 'APIController', { endpoint: '/api/pins' })
logInfo('User registered', 'AuthService', { userId: newUser.id })
logError('Database connection failed', 'DatabaseService', error)
```

---

## 📋 Logging Regeln

### **1. Verwende die richtigen Log-Level:**

- **`logVerbose`** 🛠️ - Debug/Development logs (nur in dev sichtbar)
  - API requests/responses
  - Component state changes
  - User interactions
  - Template variable registrations

- **`logInfo`** ℹ️ - Important production events
  - User login/logout
  - Successful operations
  - System notifications

- **`logError`** 🚨 - Errors and warnings
  - API failures
  - Authentication errors
  - Validation failures

### **2. Immer Context und strukturierte Daten verwenden:**

```typescript
// ✅ RICHTIG - Mit Context und strukturierten Daten
logVerbose('Pin clicked', 'PinboardPage', { 
  pinId: pin.id, 
  metadata: pin.metadata 
})

// ❌ FALSCH - Ohne Context
logVerbose('Pin clicked: ' + pin.id)
```

### **3. Konsistente Context Namen:**

- `'AuthContext'` - Authentication-related logs
- `'PinboardPage'` - Page component logs
- `'TemplateVariable'` - Template variable logs
- `'APIService'` - API call logs
- `'ComponentName'` - Für spezifische Components

---


## 🚫 Was NICHT tun

```typescript
// ❌ NIEMALS direkte console statements verwenden
console.log('Debug info')
console.warn('Warning message')
console.error('Error occurred')

// ❌ NIEMALS unstrukturierte Log-Messages
logVerbose('User: ' + user.name + ' clicked button: ' + button.id)

// ❌ NIEMALS ohne Context
logVerbose('Something happened')
```

---

## ✅ Migration von alten console.log

Wenn du alte `console.log` Statements findest:

1. **Prüfe den Zweck:**
   - Debug info → `logVerbose`
   - Important events → `logInfo` 
   - Errors → `logError`

2. **Füge Context hinzu:**
   - Bestimme den Component/Service Namen
   - Verwende konsistente Namenskonvention

3. **Strukturiere die Daten:**
   - Objekte statt String-Konkatenation
   - Relevante Properties extrahieren

**Beispiel Migration:**
```typescript
// Vorher
console.log('🔍 Pin clicked:', pin.id, 'Current metadata:', pin.metadata)

// Nachher  
logVerbose('Pin clicked', 'PinboardPage', { 
  pinId: pin.id, 
  metadata: pin.metadata 
})
```

---

## 🔄 Code Duplikation vermeiden

### **DRY Regel: 2+ mal derselbe Code = Shared Utility erstellen**

```typescript
// ✅ Frontend Utils: frontend/src/lib/utils/[name].ts
export const formatPinDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

// ✅ Backend Utils: backend-api/src/lib/utils/[name].ts  
export const validatePinId = (pinId: string): boolean => {
  return /^p-[a-zA-Z0-9_-]+$/.test(pinId)
}

// ❌ NIEMALS Code copy-pasten ohne Refactoring
// ❌ NIEMALS Utilities in Component-Dateien verstecken
```

**Kategorien:** Date/Time, Validation, Data transformation, UI helpers, API helpers

**Immer daran denken: Copy-Paste = Utility erstellen! 🛠️**

---
