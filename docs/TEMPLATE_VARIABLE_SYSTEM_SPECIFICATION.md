# Template Variable System Specification

## Overview
The Template Variable System provides real-time dynamic content rendering for markdown templates using Firebase Realtime Database. It supports both JSON data extraction and complete markdown content injection with sophisticated loading states and connection management.

---

## 🏗️ **System Architecture**

### **Core Components**

#### 1. **TemplateVariable** (`/components/TemplateVariable.tsx`)
**Purpose**: Renders individual template variables with real-time Firebase subscriptions

**Props**:
```typescript
interface TemplateVariableProps {
  variableType: 'dataset'
  datasetId: string
  pinId?: string
  jsonPath?: string
  fullPath: string
  currentPinId?: string
}
```

**Key Features**:
- ✅ Initial REST API fetch for fast first paint
- ✅ Firebase Realtime Database subscription for live updates
- ✅ Connection status tracking
- ✅ Error handling with fallback display
- ✅ Loading states (skeleton + mini-spinner)
- ✅ JSON path extraction for nested data
- ✅ Markdown content rendering

#### 2. **TemplateVariableLoadingProvider** (`/lib/template-variable-loading-context.tsx`)
**Purpose**: Coordinates loading states across multiple template variables

**State Management**:
```typescript
interface LoadingContextState {
  variables: Set<string>           // Registered variable IDs
  loadedVariables: Set<string>     // Variables that completed initial load
  connections: Set<string>         // Variables with active Firebase connections
  isInitialLoadComplete: boolean   // All expected variables loaded
  hasStartedLoading: boolean       // At least one variable registered
  anyConnected: boolean           // Any variable has Firebase connection
}
```

**Functions**:
- `registerVariable(id)` - Register expected variable
- `unregisterVariable(id)` - Remove variable
- `markVariableLoaded(id)` - Mark variable as loaded
- `seedVariables(ids[])` - Pre-register expected variables
- `setConnection(id, connected)` - Update connection status

#### 3. **PreviewContent** (`/app/(dashboard)/pins/[pinSlug]/[blockId]/page.tsx`)
**Purpose**: Orchestrates template rendering with loading coordination

**Features**:
- ✅ Seeds expected variables from template scanning
- ✅ Memoized ReactMarkdown components
- ✅ Loading skeleton until all variables load
- ✅ Smooth fade-in animations
- ✅ Live indicator integration
- ✅ Syntax highlighting for code blocks

#### 4. **LiveIndicator** (`/app/(dashboard)/pins/[pinSlug]/[blockId]/page.tsx`)
**Purpose**: Visual indicator of real-time connection status

**States**:
- 🟢 **"Live"** - Green pulsing dot when `anyConnected === true`
- ⚫ **"Offline"** - Gray dot when no Firebase connections

---

## 🔄 **Data Flow & State Management**

### **1. Template Parsing & Variable Discovery**
```typescript
// Remark plugin identifies {{dataset...}} patterns
const matches = template.matchAll(/\{\{(dataset\.[^}]+)\}\}/g)
const expectedVariables = matches.map(m => m[1])

// Seed loading context with expected variables
seedVariables(expectedVariables)
```

### **2. Variable Registration & Loading**
```typescript
// Each TemplateVariable registers itself
useEffect(() => {
  registerVariable(variableId)
  return () => unregisterVariable(variableId)
}, [variableId])

// Initial data fetch
const response = await fetch(`/api/pins/${targetPinId}/datasets/${datasetId}`)
const dataset = response.data.dataset

// Mark as loaded once initial data is available
markVariableLoaded(variableId)
```

### **3. Firebase Realtime Subscription**
```typescript
// Subscribe to specific dataset path
const unsubscribe = subscribeToWorkflowData(
  targetPinId,
  datasetId,
  (liveData) => {
    setConnection(variableId, true)  // Mark as connected
    updateDisplayValue(liveData)     // Update rendered content
  },
  (error) => {
    setConnection(variableId, false) // Mark as disconnected
  }
)
```

### **4. Loading State Coordination**
```typescript
// Loading context determines when to reveal content
const isInitialLoadComplete = useMemo(() => {
  return hasStartedLoading && 
         variables.size > 0 && 
         loadedVariables.size === variables.size
}, [hasStartedLoading, variables.size, loadedVariables.size])

// PreviewContent shows skeleton until complete
{!isInitialLoadComplete && <MarkdownLoadingSkeleton />}
<motion.div 
  animate={{ opacity: isInitialLoadComplete ? 1 : 0 }}
  className={!isInitialLoadComplete ? 'invisible absolute -z-10' : ''}
>
  <ReactMarkdown>{template}</ReactMarkdown>
</motion.div>
```

---

## 🔥 **Firebase Integration**

### **Database Structure**
```json
{
  "pin_datasets": {
    "pin_123": {
      "dataset_456": {
        "data": {
          "revenue": 50000,
          "status": "running",
          "metrics": {
            "conversion_rate": 0.124,
            "users": 1847
          }
        },
        "metadata": {
          "name": "Sales Data",
          "type": "json",
          "created_at": "2024-12-25T10:00:00Z"
        }
      },
      "dataset_789": {
        "data": {
          "content": "# Dashboard\n\n## Current Metrics\n- Revenue: $50,000"
        },
        "metadata": {
          "name": "Report Content",
          "type": "markdown",
          "created_at": "2024-12-25T10:00:00Z"
        }
      }
    }
  }
}
```

### **Subscription Paths**
```typescript
// Each variable subscribes to its specific path
const path = `pin_datasets/${pinId}/${datasetId}/data`
const workflowRef = ref(database, path)

// Optimal performance - individual subscriptions share same WebSocket
onValue(workflowRef, callback, errorCallback)
```

### **Real-time Performance**
- ✅ **Single WebSocket Connection** - All subscriptions multiplex over one connection
- ✅ **Targeted Updates** - Only changed datasets trigger updates
- ✅ **Minimal Bandwidth** - Small payloads per update
- ✅ **Concurrent Safe** - Independent write paths prevent conflicts

---

## 📝 **Template Variable Syntax**

### **JSON Data Extraction**
```markdown
<!-- Simple value -->
Current revenue: {{dataset.current.dataset_123.revenue}}

<!-- Nested object access -->
Conversion rate: {{dataset.current.dataset_123.metrics.conversion_rate}}%

<!-- Cross-pin data -->
Partner revenue: {{dataset.pin.pin_456.dataset_789.revenue}}
```

### **Markdown Content Injection**
```markdown
<!-- Entire markdown content -->
{{dataset.current.dataset_456.markdown}}

<!-- Explicit content field -->
{{dataset.current.dataset_456.content}}
```

### **Variable Format Structure**
```
{{dataset.{scope}.{pin_id}.{dataset_id}.{json_path}}}

scope:      'current' | 'pin'
pin_id:     Pin identifier (omitted for 'current')
dataset_id: Dataset identifier
json_path:  'markdown' | object.property.path | omitted for entire object
```

---

## 🎛️ **Memoization & Performance**

### **Critical Memoization Points**

#### 1. **Template Variable Component Creation**
```typescript
// Prevents infinite re-renders from ReactMarkdown
const createTemplateVariableComponent = useCallback((props: any) => {
  return (
    <TemplateVariable
      variableType={props.variableType || props['variable-type']}
      datasetId={props.datasetId || props['data-set-id']}
      // ... other props
    />
  )
}, [pinData?.id])
```

#### 2. **ReactMarkdown Components**
```typescript
// Stable component mapping prevents re-creation
const markdownComponents = useMemo(() => ({
  'template-variable': createTemplateVariableComponent,
  h1: ({ children }: any) => <h1 className="...">{children}</h1>,
  // ... other components
}), [createTemplateVariableComponent, theme])
```

#### 3. **Loading Context Functions**
```typescript
// Prevent unnecessary re-renders of consuming components
const registerVariable = useCallback((id: string) => {
  setVariables(prev => new Set(prev).add(id))
}, [])

const contextValue = useMemo(() => ({
  registerVariable,
  unregisterVariable,
  markVariableLoaded,
  // ... other functions and state
}), [registerVariable, unregisterVariable, /* ... */])
```

#### 4. **TemplateVariable Component**
```typescript
// Stable ID prevents re-registration
const variableId = fullPath // Instead of useId()

// Memoized component prevents unnecessary re-renders
export default React.memo(TemplateVariable)
```

---

## 🔄 **Loading States & Animations**

### **Loading State Sequence**
1. **Initial Mount**: Show loading skeleton immediately
2. **Variable Discovery**: Scan template for `{{dataset...}}` patterns
3. **Registration**: Register expected variables with loading context
4. **Data Fetching**: Each variable fetches initial data via REST API
5. **Loading Completion**: When all variables loaded, fade in content
6. **Live Updates**: Real-time updates with mini-spinners

### **Animation Implementation**
```typescript
<AnimatePresence mode="wait">
  {!isInitialLoadComplete && (
    <motion.div
      key="loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MarkdownLoadingSkeleton />
    </motion.div>
  )}
  
  <motion.div
    key="content"
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: isInitialLoadComplete ? 1 : 0, 
      y: isInitialLoadComplete ? 0 : 20 
    }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={!isInitialLoadComplete ? 'invisible absolute -z-10' : ''}
  >
    <ReactMarkdown>{template}</ReactMarkdown>
  </motion.div>
</AnimatePresence>
```

### **Loading Visual States**
- 🔄 **Skeleton Loading**: Gray animated blocks mimicking content structure
- ⚡ **Mini Spinner**: Small spinner during real-time updates
- ❌ **Error State**: Red background with error message
- ✅ **Success State**: Normal content display

---

## 📊 **Data Processing**

### **JSON Path Extraction**
```typescript
// Navigate nested object paths
let value = dataset.data
if (jsonPath && jsonPath !== 'markdown') {
  const pathParts = jsonPath.split('.')
  for (const part of pathParts) {
    if (value && typeof value === 'object') {
      value = value[part]
    } else {
      return undefined
    }
  }
}
```

### **Markdown Content Handling**
```typescript
// For markdown datasets
if (dataset?.metadata?.type === 'markdown') {
  if (jsonPath === 'markdown' || !jsonPath) {
    // Return content field directly
    return dataset.data?.content || ''
  }
  // Otherwise extract from data object
  return extractJsonPath(dataset.data, jsonPath)
}
```

### **Value Rendering**
```typescript
// Type-safe value display
if (value === null || value === undefined) return ''
if (typeof value === 'string') return value
if (typeof value === 'object') return JSON.stringify(value, null, 2)
return String(value)
```

---

## 🛡️ **Error Handling**

### **Connection Errors**
```typescript
const unsubscribe = subscribeToWorkflowData(
  pinId,
  datasetId,
  (data) => {
    setConnection(variableId, true)
    updateValue(data)
  },
  (error) => {
    console.error('Firebase subscription error:', error)
    setConnection(variableId, false)
    setError('Connection failed')
  }
)
```

### **Data Fetch Errors**
```typescript
try {
  const response = await fetch(`/api/pins/${pinId}/datasets/${datasetId}`)
  if (!response.ok) throw new Error('Fetch failed')
  const data = await response.json()
  // Process data...
} catch (error) {
  setError(error.message)
  setValue(`{{${fullPath}}}`) // Fallback to original syntax
}
```

### **Error Display**
```typescript
{error && (
  <span className="inline-block px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700 rounded">
    Error: {error}
  </span>
)}
```

---

## 🎨 **Theme Integration**

### **Dark Mode Support**
```typescript
// Syntax highlighting
<SyntaxHighlighter
  style={theme === 'dark' ? (oneDark as any) : (oneLight as any)}
  language={language}
  PreTag="div"
  className="rounded-lg my-4"
>
  {code}
</SyntaxHighlighter>

// Error states
className={`${error ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : ''}`}

// Loading skeleton
className="bg-muted/50 animate-pulse rounded"
```

---

## 🚀 **Usage for Share Pages**

### **Implementation Pattern**
```typescript
// 1. Wrap content with loading provider
<TemplateVariableLoadingProvider>
  <SharePageContent template={template} pinData={pinData} />
</TemplateVariableLoadingProvider>

// 2. Use PreviewContent pattern or create similar component
const SharePageContent = ({ template, pinData }) => {
  const { isInitialLoadComplete, seedVariables } = useTemplateVariableLoading()
  
  // Seed expected variables
  useEffect(() => {
    const matches = Array.from(template.matchAll(/\{\{(dataset\.[^}]+)\}\}/g))
    const ids = matches.map(m => m[1])
    if (ids.length > 0) seedVariables(ids)
  }, [template, seedVariables])
  
  // Render with loading states
  return (
    <AnimatePresence mode="wait">
      {!isInitialLoadComplete && <LoadingSkeleton />}
      <motion.div animate={{ opacity: isInitialLoadComplete ? 1 : 0 }}>
        <ReactMarkdown
          remarkPlugins={[remarkTemplateVariables]}
          components={{
            'template-variable': createTemplateVariableComponent
          }}
        >
          {template}
        </ReactMarkdown>
      </motion.div>
    </AnimatePresence>
  )
}
```

### **Required Components for Share Pages**
1. ✅ `TemplateVariableLoadingProvider` - State coordination
2. ✅ `TemplateVariable` - Individual variable rendering
3. ✅ `remarkTemplateVariables` - Markdown parsing
4. ✅ `LoadingSkeleton` - Loading state display
5. ✅ `LiveIndicator` (optional) - Connection status

---

## 📁 **File Structure**

```
frontend/src/
├── components/
│   ├── TemplateVariable.tsx           # Core variable component
│   ├── loading-skeleton.tsx           # Loading UI
│   └── mdx-editor/                    # Editor integration
├── lib/
│   ├── template-variable-loading-context.tsx  # State management
│   ├── remark-template-variables.ts           # Markdown parsing
│   └── firebase-realtime.ts                   # Firebase integration
└── app/(dashboard)/pins/[pinSlug]/[blockId]/
    └── page.tsx                       # Preview implementation
```

---

## 🔧 **Configuration Requirements**

### **Environment Variables**
```env
# Firebase Realtime Database
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://project-id-default-rtdb.firebaseio.com
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

### **Dependencies**
```json
{
  "firebase": "^10.x",
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "framer-motion": "^11.x",
  "react-syntax-highlighter": "^15.x"
}
```

---

## 🎯 **Best Practices**

1. **Always wrap with TemplateVariableLoadingProvider**
2. **Seed expected variables from template scanning**
3. **Memoize ReactMarkdown components to prevent infinite loops**
4. **Use stable IDs for template variables (fullPath, not useId)**
5. **Handle loading states with skeletons and smooth animations**
6. **Subscribe to specific dataset paths for optimal Firebase performance**
7. **Implement proper error handling and fallback displays**
8. **Use theme-aware styling for dark mode compatibility**

This system provides a robust, performant, and user-friendly way to render dynamic content with real-time updates while maintaining excellent loading states and visual feedback.
