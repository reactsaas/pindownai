# Realtime Implementation Strategy

## Current Share Page Analysis

After inspecting the current share page setup at `http://localhost:3000/share/pin/p-O_wlYSaXKksi4kqAL5t`, I can see:

### Current Architecture:
1. **Share Page Structure**: Uses ReactMarkdown to render pin blocks
2. **Existing Realtime System**: Already has Firebase realtime integration for workflow data
3. **Template Variables**: Currently stored in pin blocks as `template` content
4. **Data Sources**: Template data sources component manages datasets
5. **Realtime Display**: WorkflowDataRealtimeDisplay shows live data updates

### The Challenge: Targeting Template Variables in Rendered Markdown

The main challenge is that once markdown is rendered to React components via ReactMarkdown, we lose the ability to easily identify and update specific template variables. The current system shows realtime data in separate components, but doesn't update template variables within the rendered markdown content.

## Strategy 1: Custom ReactMarkdown Components with Realtime Updates

### Approach (Recommended for Current Setup)
- Create custom ReactMarkdown components that handle template variables
- Use existing Firebase realtime infrastructure
- Implement variable resolution and live updates within markdown rendering

### Implementation
```typescript
// Custom ReactMarkdown component for template variables
const TemplateVariable: React.FC<{
  variablePath: string
  pinId: string
  datasets: Record<string, any>
}> = ({ variablePath, pinId, datasets }) => {
  const [value, setValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Parse variable path (e.g., "dataset.sales.total" or "global.config.apiKey")
  const [type, datasetId, ...pathParts] = variablePath.split('.')
  
  useEffect(() => {
    if (type === 'dataset' && datasets[datasetId]) {
      const resolvedValue = getNestedValue(datasets[datasetId], pathParts)
      setValue(String(resolvedValue || ''))
      setIsLoading(false)
    } else if (type === 'global') {
      // Handle global variables
      setValue('Global variable not implemented yet')
      setIsLoading(false)
    }
  }, [variablePath, datasets, type, datasetId, pathParts])
  
  if (isLoading) {
    return <span className="animate-pulse bg-muted/50 px-1 rounded">...</span>
  }
  
  return (
    <span 
      className="template-variable bg-blue-50 dark:bg-blue-900/20 px-1 rounded text-blue-700 dark:text-blue-300"
      data-variable-path={variablePath}
      data-pin-id={pinId}
    >
      {value}
    </span>
  )
}

// Enhanced share page with realtime template variables
export default function SharePinPage() {
  const [pin, setPin] = useState<Pin | null>(null)
  const [datasets, setDatasets] = useState<Record<string, any>>({})
  const [templateVariables, setTemplateVariables] = useState<string[]>([])
  
  // Parse template variables from pin content
  useEffect(() => {
    if (pin) {
      const content = pin.blocks.map(b => b.template).join('\n\n')
      const variables = extractTemplateVariables(content)
      setTemplateVariables(variables)
    }
  }, [pin])
  
  // Subscribe to dataset updates for each variable
  useEffect(() => {
    if (!pin || templateVariables.length === 0) return
    
    const datasetIds = templateVariables
      .filter(v => v.startsWith('dataset.'))
      .map(v => v.split('.')[1])
      .filter((id, index, arr) => arr.indexOf(id) === index) // unique IDs
    
    const unsubscribes = datasetIds.map(datasetId => 
      subscribeToWorkflowData(pin.id, datasetId, (data) => {
        setDatasets(prev => ({ ...prev, [datasetId]: data }))
      })
    )
    
    return () => unsubscribes.forEach(unsub => unsub())
  }, [pin, templateVariables])
  
  // Custom ReactMarkdown components
  const markdownComponents = {
    // Override text rendering to detect template variables
    text: ({ children }: { children: string }) => {
      const text = String(children)
      if (text.includes('{{') && text.includes('}}')) {
        // Split text and render template variables
        const parts = text.split(/(\{\{[^}]+\}\})/g)
        return (
          <>
            {parts.map((part, index) => {
              if (part.startsWith('{{') && part.endsWith('}}')) {
                const variablePath = part.slice(2, -2)
                return (
                  <TemplateVariable
                    key={index}
                    variablePath={variablePath}
                    pinId={pin?.id || ''}
                    datasets={datasets}
                  />
                )
              }
              return part
            })}
          </>
        )
      }
      return text
    }
  }
  
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {pin?.blocks.map(b => b.template).join('\n\n')}
      </ReactMarkdown>
    </div>
  )
}
```

## Strategy 2: DOM Element Tracking with Data Attributes

### Approach
- Render template variables as custom React components with unique data attributes
- Track these elements in a registry for targeted updates
- Use React refs to maintain references to variable elements

### Implementation
```typescript
// Template variable component
const TemplateVariable: React.FC<{
  variableId: string
  datasetId: string
  path: string
  value: any
}> = ({ variableId, datasetId, path, value }) => {
  const elementRef = useRef<HTMLSpanElement>(null)
  
  useEffect(() => {
    // Register this variable element
    VariableRegistry.register(variableId, elementRef.current)
  }, [variableId])
  
  return (
    <span 
      ref={elementRef}
      data-variable-id={variableId}
      data-dataset-id={datasetId}
      data-path={path}
      className="template-variable"
    >
      {value}
    </span>
  )
}

// Variable registry for tracking
class VariableRegistry {
  private static elements = new Map<string, HTMLElement>()
  
  static register(id: string, element: HTMLElement | null) {
    if (element) {
      this.elements.set(id, element)
    }
  }
  
  static updateVariable(id: string, newValue: any) {
    const element = this.elements.get(id)
    if (element) {
      element.textContent = newValue
    }
  }
}
```

## Strategy 2: Custom Markdown Renderer with Variable Components

### Approach
- Create a custom markdown renderer that identifies template variables
- Replace variables with React components during rendering
- Maintain a mapping of variables to components

### Implementation
```typescript
// Custom markdown renderer
const RealtimeMarkdownRenderer: React.FC<{
  content: string
  variables: Map<string, any>
}> = ({ content, variables }) => {
  const [renderedContent, setRenderedContent] = useState<React.ReactNode[]>([])
  
  useEffect(() => {
    const parseContent = () => {
      const variableRegex = /\{\{([^}]+)\}\}/g
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      let match
      
      while ((match = variableRegex.exec(content)) !== null) {
        // Add text before variable
        if (match.index > lastIndex) {
          parts.push(content.slice(lastIndex, match.index))
        }
        
        // Add variable component
        const variablePath = match[1]
        const variableId = generateVariableId(variablePath)
        parts.push(
          <TemplateVariable
            key={variableId}
            variableId={variableId}
            variablePath={variablePath}
            value={variables.get(variablePath)}
          />
        )
        
        lastIndex = match.index + match[0].length
      }
      
      // Add remaining text
      if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex))
      }
      
      setRenderedContent(parts)
    }
    
    parseContent()
  }, [content, variables])
  
  return <div>{renderedContent}</div>
}
```

## Strategy 3: Virtual DOM Diffing with Template Variables

### Approach
- Use a virtual DOM approach to track template variables
- Implement diffing algorithm to identify changed variables
- Update only the changed variables in the real DOM

### Implementation
```typescript
// Virtual DOM for template variables
interface VirtualTemplateVariable {
  id: string
  path: string
  value: any
  domElement: HTMLElement | null
}

class TemplateVariableManager {
  private variables = new Map<string, VirtualTemplateVariable>()
  private updateQueue: string[] = []
  
  addVariable(id: string, path: string, domElement: HTMLElement) {
    this.variables.set(id, {
      id,
      path,
      value: null,
      domElement
    })
  }
  
  updateVariable(id: string, newValue: any) {
    const variable = this.variables.get(id)
    if (variable && variable.value !== newValue) {
      variable.value = newValue
      this.updateQueue.push(id)
      this.scheduleUpdate()
    }
  }
  
  private scheduleUpdate() {
    requestAnimationFrame(() => {
      this.processUpdateQueue()
    })
  }
  
  private processUpdateQueue() {
    this.updateQueue.forEach(id => {
      const variable = this.variables.get(id)
      if (variable?.domElement) {
        variable.domElement.textContent = variable.value
      }
    })
    this.updateQueue = []
  }
}
```

## Strategy 4: WebSocket-Based Real-Time Updates

### Approach
- Use WebSocket connections for real-time updates
- Send targeted updates for specific variables
- Implement efficient update batching

### Implementation
```typescript
// WebSocket manager for real-time updates
class RealtimeUpdateManager {
  private ws: WebSocket | null = null
  private variableSubscriptions = new Set<string>()
  private updateBuffer = new Map<string, any>()
  
  connect(sharePageId: string) {
    this.ws = new WebSocket(`ws://localhost:8000/share/${sharePageId}/realtime`)
    
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      this.handleVariableUpdate(update)
    }
  }
  
  subscribeToVariable(variableId: string) {
    this.variableSubscriptions.add(variableId)
    this.sendSubscription(variableId)
  }
  
  private handleVariableUpdate(update: { variableId: string; value: any }) {
    const { variableId, value } = update
    if (this.variableSubscriptions.has(variableId)) {
      VariableRegistry.updateVariable(variableId, value)
    }
  }
}
```

## Recommended Implementation Strategy

### **Hybrid Approach: Server-Side Resolution + Client-Side Realtime Updates**

The optimal strategy combines **server-side template resolution** for fast initial load with **client-side realtime updates** for live data:

#### **Phase 1: Server-Side Resolution (Initial Load)**
1. **Pre-resolve Template Variables**: Server fetches current data for all template variables
2. **Fast Initial Render**: Template variables show resolved values immediately
3. **No Layout Shift**: Users see final content without loading states
4. **Template Variables Preserved**: Markdown always contains `{{dataset.sales.total}}` syntax

#### **Phase 2: Client-Side Realtime Updates (Live Updates)**
1. **Custom ReactMarkdown Components**: Intercept template variables during rendering
2. **Realtime Subscriptions**: Subscribe to dataset changes after initial load
3. **Targeted Updates**: Update specific template variables when data changes
4. **Smooth Transitions**: Animate value changes for better UX

#### **Phase 3: Performance Optimization**
1. **Update Batching**: Batch multiple variable updates together
2. **Connection Management**: Handle Firebase connection drops gracefully
3. **Memory Management**: Clean up subscriptions when page unloads
4. **Caching**: Cache resolved data to reduce server requests

### **How Both Approaches Work Together**

The key insight is that **template variables are ALWAYS preserved** in the markdown content, allowing both approaches to work seamlessly:

```typescript
// 1. Markdown always contains template variables:
const markdown = "Sales: {{dataset.sales.total}}"

// 2. Server pre-resolves for initial load:
const resolvedData = { "sales": { total: 125000 } }

// 3. Client renders with resolved data:
<ReactMarkdown components={customComponents}>
  {markdown} // Still contains {{dataset.sales.total}}
</ReactMarkdown>

// 4. Custom components handle both:
//    - Initial resolved values (from server)
//    - Realtime updates (from client)
```

### **Complete Implementation Flow**

#### **Backend: Server-Side Resolution**
```typescript
export async function getPinWithResolvedData(pinId: string) {
  const pin = await getPin(pinId)
  
  // Extract all template variables from pin blocks
  const templateVariables = pin.blocks
    .map(block => extractTemplateVariables(block.template))
    .flat()
    .filter((v, index, arr) => arr.indexOf(v) === index) // unique
  
  // Resolve template variables with current data
  const resolvedData = await resolveTemplateVariables(templateVariables)
  
  return {
    pin, // Contains: "Sales: {{dataset.sales.total}}"
    resolvedData, // Contains: { "sales": { total: 125000 } }
    templateVariables // Contains: ["dataset.sales.total"]
  }
}
```

#### **Frontend: Enhanced Share Page with Individual Component Updates**
```typescript
export default function SharePinPage() {
  const [pin, setPin] = useState<Pin | null>(null)
  const [templateVariables, setTemplateVariables] = useState<string[]>([])
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Initial load with server-resolved data
  useEffect(() => {
    fetchPinWithResolvedData(pinId).then(data => {
      setPin(data.pin)
      setTemplateVariables(data.templateVariables)
      setIsInitialLoad(false)
    })
  }, [pinId])
  
  // Custom ReactMarkdown components
  const markdownComponents = {
    text: ({ children }: { children: string }) => {
      const text = String(children)
      
      if (text.includes('{{') && text.includes('}}')) {
        const parts = text.split(/(\{\{[^}]+\}\})/g)
        return (
          <>
            {parts.map((part, index) => {
              if (part.startsWith('{{') && part.endsWith('}}')) {
                const variablePath = part.slice(2, -2)
                return (
                  <TemplateVariable
                    key={index}
                    variablePath={variablePath}
                    pinId={pinId}
                    isInitialLoad={isInitialLoad}
                  />
                )
              }
              return part
            })}
          </>
        )
      }
      return text
    }
  }
  
  return (
    <div className="prose">
      <ReactMarkdown components={markdownComponents}>
        {pin?.blocks.map(b => b.template).join('\n\n')}
      </ReactMarkdown>
    </div>
  )
}
```

#### **TemplateVariable Component with Individual Updates**
```typescript
const TemplateVariable: React.FC<{
  variablePath: string
  pinId: string
  isInitialLoad: boolean
}> = ({ variablePath, pinId, isInitialLoad }) => {
  const [value, setValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [type, datasetId, ...pathParts] = variablePath.split('.')
  
  // Use existing realtime hook for individual component updates
  const { data, isLoading: dataLoading, error } = useWorkflowDataRealtime(
    pinId,
    datasetId,
    { enabled: type === 'dataset' && !isInitialLoad }
  )
  
  // Handle initial load with server-resolved data
  useEffect(() => {
    if (isInitialLoad) {
      // Get initial resolved data from server
      fetchInitialResolvedData(pinId, variablePath).then(resolvedValue => {
        setValue(String(resolvedValue || ''))
        setIsLoading(false)
      })
    }
  }, [isInitialLoad, variablePath, pinId])
  
  // Handle realtime updates for individual component
  useEffect(() => {
    if (isInitialLoad || type !== 'dataset') return
    
    if (data) {
      const newValue = getNestedValue(data, pathParts)
      const stringValue = String(newValue || '')
      
      // Only update if value actually changed
      if (stringValue !== value) {
        setIsUpdating(true)
        setValue(stringValue)
        
        // Reset updating state after animation
        const timer = setTimeout(() => setIsUpdating(false), 300)
        return () => clearTimeout(timer)
      }
    }
  }, [data, pathParts, value, isInitialLoad, type])
  
  // Handle loading states
  useEffect(() => {
    if (!isInitialLoad && dataLoading) {
      setIsLoading(true)
    } else if (!isInitialLoad && !dataLoading) {
      setIsLoading(false)
    }
  }, [isInitialLoad, dataLoading])
  
  return (
    <span className={`template-variable ${
      isLoading ? 'animate-pulse bg-muted/50' : 
      isUpdating ? 'bg-green-50 dark:bg-green-900/20 animate-pulse' :
      'bg-blue-50 dark:bg-blue-900/20'
    } px-1 rounded transition-all duration-300`}>
      {isLoading ? '...' : value}
    </span>
  )
}

// Helper function to fetch initial resolved data for individual variable
async function fetchInitialResolvedData(pinId: string, variablePath: string): Promise<any> {
  const [type, datasetId, ...pathParts] = variablePath.split('.')
  
  if (type === 'dataset') {
    // Fetch current dataset data
    const response = await fetch(`/api/datasets/${datasetId}`)
    if (response.ok) {
      const data = await response.json()
      return getNestedValue(data, pathParts)
    }
  }
  
  return null
}
```

### **Individual Component Updates**

The refined approach ensures that **each template variable component updates independently**:

#### **Key Improvements:**

1. **Individual Subscriptions**: Each `TemplateVariable` component subscribes to its own dataset
2. **Targeted Updates**: Only components using changed data re-render
3. **Efficient Re-rendering**: No unnecessary updates to unrelated components
4. **Visual Feedback**: Components show update animations when values change

#### **How Individual Updates Work:**

```typescript
// Each TemplateVariable component manages its own state
const TemplateVariable = ({ variablePath, pinId, isInitialLoad }) => {
  const [type, datasetId, ...pathParts] = variablePath.split('.')
  
  // Individual subscription to specific dataset
  const { data, isLoading } = useWorkflowDataRealtime(
    pinId,
    datasetId, // Only subscribes to its specific dataset
    { enabled: type === 'dataset' && !isInitialLoad }
  )
  
  // Only updates when its specific data changes
  useEffect(() => {
    if (data) {
      const newValue = getNestedValue(data, pathParts)
      if (newValue !== currentValue) {
        setValue(newValue) // Only this component updates
      }
    }
  }, [data]) // Only re-runs when its data changes
}
```

#### **Performance Benefits:**

- **✅ Granular Updates**: Only affected components re-render
- **✅ Efficient Subscriptions**: Each component subscribes to its specific dataset
- **✅ Memory Efficient**: No shared state causing unnecessary re-renders
- **✅ Scalable**: Performance doesn't degrade with more template variables

### **Benefits of This Hybrid Approach**

1. **✅ Fast Initial Load**: Server pre-resolves template variables
2. **✅ No Layout Shift**: Users see resolved values immediately
3. **✅ Live Updates**: Template variables update in real-time
4. **✅ Targetable Variables**: Template variables always preserved in markdown
5. **✅ Smooth UX**: Seamless transition from server data to realtime data
6. **✅ Performance**: Only subscribe to realtime after initial render
7. **✅ Fallback**: Graceful degradation if realtime fails
8. **✅ Individual Updates**: Each component updates independently
9. **✅ Efficient Re-rendering**: No unnecessary updates to unrelated components

## Technical Implementation Details

### 1. Template Variable Detection
```typescript
// Regex patterns for detecting template variables
const TEMPLATE_VARIABLE_REGEX = /\{\{([^}]+)\}\}/g
const DATASET_VARIABLE_REGEX = /\{\{dataset\.([^}]+)\}\}/g
const GLOBAL_VARIABLE_REGEX = /\{\{global\.([^}]+)\}\}/g

// Parse variables from markdown content
function parseTemplateVariables(content: string): TemplateVariable[] {
  const variables: TemplateVariable[] = []
  let match
  
  while ((match = TEMPLATE_VARIABLE_REGEX.exec(content)) !== null) {
    const fullMatch = match[0]
    const path = match[1]
    const type = path.startsWith('dataset.') ? 'dataset' : 'global'
    
    variables.push({
      id: generateVariableId(path),
      type,
      path,
      fullMatch,
      position: { start: match.index, end: match.index + fullMatch.length }
    })
  }
  
  return variables
}
```

### 2. Firebase Realtime Listeners
```typescript
// Firebase realtime listener setup
class FirebaseRealtimeManager {
  private listeners = new Map<string, () => void>()
  
  subscribeToDataset(datasetId: string, callback: (data: any) => void) {
    const datasetRef = ref(database, `datasets/${datasetId}`)
    const unsubscribe = onValue(datasetRef, (snapshot) => {
      const data = snapshot.val()
      callback(data)
    })
    
    this.listeners.set(datasetId, unsubscribe)
  }
  
  subscribeToPin(pinId: string, callback: (data: any) => void) {
    const pinRef = ref(database, `pins/${pinId}`)
    const unsubscribe = onValue(pinRef, (snapshot) => {
      const data = snapshot.val()
      callback(data)
    })
    
    this.listeners.set(pinId, unsubscribe)
  }
  
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }
}
```

### 3. Share Page State Management
```typescript
// Share page state manager
class SharePageStateManager {
  private variables = new Map<string, TemplateVariable>()
  private datasets = new Map<string, any>()
  private updateQueue: string[] = []
  
  addVariable(variable: TemplateVariable) {
    this.variables.set(variable.id, variable)
  }
  
  updateDataset(datasetId: string, data: any) {
    this.datasets.set(datasetId, data)
    this.updateAffectedVariables(datasetId)
  }
  
  private updateAffectedVariables(datasetId: string) {
    this.variables.forEach(variable => {
      if (variable.type === 'dataset' && variable.path.startsWith(`dataset.${datasetId}`)) {
        const newValue = this.resolveVariableValue(variable)
        this.updateVariable(variable.id, newValue)
      }
    })
  }
  
  private resolveVariableValue(variable: TemplateVariable): any {
    if (variable.type === 'dataset') {
      const datasetId = variable.path.split('.')[1]
      const dataset = this.datasets.get(datasetId)
      if (dataset) {
        return this.getNestedValue(dataset, variable.path.split('.').slice(2))
      }
    }
    return null
  }
}
```

## Conclusion

The recommended approach is to start with **Strategy 1 + 2** (DOM tracking + custom renderer) for immediate implementation, then add **Strategy 3** (virtual DOM diffing) for performance, and finally **Strategy 4** (WebSocket) for real-time updates.

This hybrid approach provides:
- ✅ Immediate implementation feasibility
- ✅ Good performance with targeted updates
- ✅ Real-time capabilities
- ✅ Scalability for multiple share pages
- ✅ Error handling and fallbacks
