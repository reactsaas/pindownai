# Realtime Share Pages Integration Todo

## Overview
Integrate Firebase realtime capabilities with share pages to enable live updates of template variables when dataset data changes, while maintaining the ability to detect template changes and reload content.

## Phase 1: Template Variable Detection & Tracking

### 1.1 Template Variable Parsing System
- [ ] Create `TemplateVariableParser` utility to extract variables from markdown
- [ ] Implement regex patterns to identify template variables:
  ```typescript
  // Patterns to detect:
  // {{dataset.name.field}}
  // {{dataset.users[0].name}}
  // {{global.config.setting}}
  ```
- [ ] Create variable metadata structure:
  ```typescript
  interface TemplateVariable {
    id: string
    type: 'dataset' | 'global'
    datasetId?: string
    path: string
    fullMatch: string
    position: { start: number; end: number }
  }
  ```

### 1.2 Variable Reference Tracking
- [ ] Create `VariableTracker` class to maintain variable references
- [ ] Track which variables are used in each share page
- [ ] Map variables to their DOM elements for targeted updates
- [ ] Implement variable dependency graph for efficient updates

### 1.3 Share Page Variable Registry
- [ ] Create `SharePageVariableRegistry` to track all variables per share page
- [ ] Store variable metadata and their current values
- [ ] Track which datasets are being used
- [ ] Implement variable change detection

## Phase 2: Firebase Realtime Integration

### 2.1 Dataset Realtime Listeners
- [ ] Create `DatasetRealtimeManager` for Firebase listeners
- [ ] Implement listeners for dataset changes:
  ```typescript
  // Listen to dataset changes
  const unsubscribe = onValue(datasetRef, (snapshot) => {
    const newData = snapshot.val()
    updateTemplateVariables(newData)
  })
  ```
- [ ] Handle dataset deletion and error states
- [ ] Implement connection status monitoring

### 2.2 Pin Template Realtime Listeners
- [ ] Create `PinTemplateRealtimeManager` for pin content changes
- [ ] Listen to pin metadata and content changes
- [ ] Detect when template structure changes
- [ ] Trigger full page reload when template changes

### 2.3 Global Dataset Realtime Listeners
- [ ] Implement global dataset listeners
- [ ] Handle public dataset updates
- [ ] Manage global dataset permissions
- [ ] Cache global dataset data for performance

## Phase 3: Share Page Realtime Updates

### 3.1 Targeted Variable Updates
- [ ] Create `VariableUpdater` component for targeted DOM updates
- [ ] Implement selective variable replacement without full page reload
- [ ] Handle variable validation and error states
- [ ] Support nested object updates

### 3.2 Template Change Detection
- [ ] Create `TemplateChangeDetector` to monitor template changes
- [ ] Compare template structure before/after changes
- [ ] Trigger appropriate update strategy (variable-only vs full reload)
- [ ] Handle template variable additions/removals

### 3.3 Share Page State Management
- [ ] Create `SharePageStateManager` for share page state
- [ ] Track which variables are currently displayed
- [ ] Manage update queues to prevent conflicts
- [ ] Implement update batching for performance

## Phase 4: React Markdown Preview Integration

### 4.1 Custom Markdown Renderer
- [ ] Create `RealtimeMarkdownRenderer` component
- [ ] Integrate with existing markdown rendering
- [ ] Add variable highlighting and debugging
- [ ] Support variable editing in preview mode

### 4.2 Variable DOM Element Tracking
- [ ] Implement `VariableDOMTracker` to track rendered variables
- [ ] Create unique IDs for each variable instance
- [ ] Map variables to their DOM elements
- [ ] Handle variable re-rendering

### 4.3 Live Preview Updates
- [ ] Create `LivePreviewUpdater` for real-time updates
- [ ] Implement smooth variable transitions
- [ ] Add loading states for variable updates
- [ ] Handle update conflicts and race conditions

## Phase 5: Performance & Optimization

### 5.1 Update Batching & Debouncing
- [ ] Implement update batching to prevent excessive re-renders
- [ ] Add debouncing for rapid dataset changes
- [ ] Create update queues for efficient processing
- [ ] Implement smart update scheduling

### 5.2 Caching & Memory Management
- [ ] Create `DatasetCache` for efficient data storage
- [ ] Implement cache invalidation strategies
- [ ] Handle memory leaks in long-running share pages
- [ ] Optimize Firebase listener management

### 5.3 Connection Management
- [ ] Implement connection pooling for Firebase listeners
- [ ] Handle connection drops and reconnection
- [ ] Manage listener cleanup on page unload
- [ ] Add connection status indicators

## Phase 6: Advanced Features

### 6.1 Variable Validation & Error Handling
- [ ] Create `VariableValidator` for data validation
- [ ] Handle missing or invalid variables gracefully
- [ ] Implement fallback values for failed variables
- [ ] Add error reporting and logging

### 6.2 Template Versioning
- [ ] Implement template version tracking
- [ ] Handle template migration between versions
- [ ] Support backward compatibility
- [ ] Create template change history

### 6.3 Analytics & Monitoring
- [ ] Track variable usage and performance
- [ ] Monitor update frequency and patterns
- [ ] Add debugging tools for developers
- [ ] Implement performance metrics

## Technical Implementation Notes

### Core Components to Create
```typescript
// Core classes
class TemplateVariableParser
class VariableTracker
class SharePageVariableRegistry
class DatasetRealtimeManager
class PinTemplateRealtimeManager
class VariableUpdater
class TemplateChangeDetector
class SharePageStateManager
class RealtimeMarkdownRenderer
class VariableDOMTracker
class LivePreviewUpdater
class DatasetCache
class VariableValidator
```

### Firebase Realtime Structure
```typescript
// Firebase structure for realtime updates
interface RealtimeData {
  datasets: {
    [datasetId: string]: {
      data: any
      lastUpdated: string
      version: number
    }
  }
  pins: {
    [pinId: string]: {
      content: string
      metadata: any
      lastUpdated: string
      version: number
    }
  }
}
```

### API Endpoints to Create
```
GET    /api/share/{shareId}/variables     # Get variables for share page
POST   /api/share/{shareId}/subscribe    # Subscribe to realtime updates
DELETE /api/share/{shareId}/unsubscribe  # Unsubscribe from updates
GET    /api/share/{shareId}/status       # Get connection status
```

## Priority Order
1. **Phase 1**: Template variable detection (highest priority)
2. **Phase 2**: Firebase realtime integration
3. **Phase 3**: Share page realtime updates
4. **Phase 4**: React markdown preview integration
5. **Phase 5**: Performance optimization
6. **Phase 6**: Advanced features (lowest priority)

## Success Criteria
- Template variables update in real-time when dataset data changes
- Share pages detect template changes and reload appropriately
- System handles multiple concurrent updates efficiently
- Performance remains optimal with many active share pages
- Error handling is robust and user-friendly
