# MDX Editor Template Variables Plugin Implementation TODO

## Overview

This document outlines the implementation of an MDX editor plugin that allows users to:
1. Fetch pin dataset data
2. Select JSON keys or entire datasets (for markdown)
3. Generate template variables for insertion into the markdown editor
4. Implement the hybrid template variable system with remark plugins

## Template Variable Format

### Full Format
```
{{dataset.pin.{pin_id}.{dataset_id}.{json_path}}}
{{dataset.pin.{pin_id}.{dataset_id}.markdown}}
```

### Shorthand for Current Pin
```
{{dataset.current.{dataset_id}.{json_path}}}
{{dataset.current.{dataset_id}.markdown}}
```

### Examples
```
{{dataset.pin.abc123.weather.temperature}}
{{dataset.pin.abc123.weather.markdown}}
{{dataset.current.weather.temperature}}
{{dataset.current.weather.markdown}}
```

---

## Phase 1: Core Plugin Infrastructure

### 1.1 Create MDX Editor Plugin Component
- [ ] Create `templateVariablePlugin` using `realmPlugin` from `@mdxeditor/editor`
- [ ] Implement plugin state management with Gurx (Cells, Signals, Actions)
- [ ] Create toolbar button component using `useCellValue` and `usePublisher`
- [ ] Add plugin modal/dropdown interface with proper state management
- [ ] Register plugin with MDXEditor using `addActivePlugin$` signal

### 1.2 Dataset Fetching System
- [ ] Create `usePinDatasets` hook for fetching available datasets
- [ ] Implement dataset fetching from current pin and other pins
- [ ] Add error handling for dataset fetch failures
- [ ] Cache dataset results for performance

### 1.3 Dataset Selection Interface
- [ ] Create `DatasetSelector` component
- [ ] Implement JSON key tree view for nested data
- [ ] Add markdown dataset toggle/selection
- [ ] Create preview of selected data

**Files to Create:**
```
frontend/src/components/mdx-editor/
├── templateVariablePlugin.ts
├── TemplateVariableToolbarButton.tsx
├── TemplateVariableModal.tsx
├── DatasetSelector.tsx
├── JsonKeyTree.tsx
└── TemplateVariablePreview.tsx

frontend/src/hooks/
└── usePinDatasets.ts
```

---

## Phase 2: Template Variable Generation

### 2.1 Variable Path Builder
- [ ] Create `TemplateVariableBuilder` utility
- [ ] Implement path generation logic
- [ ] Handle current pin vs other pin detection
- [ ] Add validation for generated paths

### 2.2 Editor Integration
- [ ] Use `createRootEditorSubscription$` to access Lexical editor instance
- [ ] Implement text insertion using Lexical `insertText` command
- [ ] Add cursor positioning after insertion using `moveSelectionToEnd` command
- [ ] Handle multiple variable insertions with proper selection management
- [ ] Add undo/redo support using Lexical's built-in history system

### 2.3 Variable Validation
- [ ] Create `validateTemplateVariable` function
- [ ] Check dataset existence and accessibility
- [ ] Validate JSON path structure
- [ ] Provide helpful error messages

**Files to Create:**
```
frontend/src/lib/
├── template-variable-builder.ts
└── template-variable-validator.ts

frontend/src/components/mdx-editor/
└── VariableInsertionHandler.tsx
```

---

## Phase 3: Hybrid Template Variable System

### 3.1 Remark Plugin Implementation
- [ ] Create `remarkTemplateVariables` plugin
- [ ] Implement AST node detection for `{{...}}` patterns
- [ ] Handle nested variable parsing
- [ ] Add support for different variable types

### 3.2 TemplateVariable Component
- [ ] Create `TemplateVariable` React component
- [ ] Implement Firebase realtime subscription
- [ ] Handle inline vs markdown variable rendering
- [ ] Add loading and error states

### 3.3 ReactMarkdown Integration
- [ ] Update existing ReactMarkdown usage
- [ ] Add remark plugin to markdown renderers
- [ ] Implement component mapping for variables
- [ ] Test with existing share pages

**Files to Create:**
```
frontend/src/lib/
├── remark-template-variables.ts
└── template-variable-component.tsx

frontend/src/components/
└── TemplateVariable.tsx
```

---

## Phase 4: Advanced Features

### 4.1 Variable Autocomplete
- [ ] Implement autocomplete in MDX editor
- [ ] Show available datasets and keys
- [ ] Add fuzzy search for large datasets
- [ ] Cache autocomplete suggestions

### 4.2 Variable Preview System
- [ ] Create live preview of template variables
- [ ] Show resolved values in editor
- [ ] Add preview toggle in editor
- [ ] Handle preview performance optimization

### 4.3 Variable Management
- [ ] Create variable usage tracking
- [ ] Add "Find and Replace" for variables
- [ ] Implement variable dependency analysis
- [ ] Add bulk variable operations

**Files to Create:**
```
frontend/src/components/mdx-editor/
├── VariableAutocomplete.tsx
├── VariablePreview.tsx
└── VariableManager.tsx

frontend/src/lib/
├── variable-usage-tracker.ts
└── variable-dependency-analyzer.ts
```

---

## Phase 5: Performance & Polish

### 5.1 Performance Optimization
- [ ] Implement variable update batching
- [ ] Add virtual scrolling for large datasets
- [ ] Optimize Firebase subscription management
- [ ] Add memoization for expensive operations

### 5.2 User Experience
- [ ] Add keyboard shortcuts for variable insertion
- [ ] Implement drag-and-drop for dataset selection
- [ ] Add variable syntax highlighting
- [ ] Create comprehensive help documentation

### 5.3 Testing & Quality
- [ ] Add unit tests for template variable system
- [ ] Create integration tests for MDX editor
- [ ] Add E2E tests for variable workflow
- [ ] Performance testing with large datasets

**Files to Create:**
```
frontend/src/components/mdx-editor/
├── VariableKeyboardShortcuts.tsx
└── VariableSyntaxHighlighter.tsx

frontend/src/__tests__/
├── template-variables.test.tsx
├── mdx-editor-plugin.test.tsx
└── variable-system.integration.test.tsx
```

---

## Implementation Dependencies

### Required Packages
```json
{
  "@mdxeditor/editor": "^3.0.0",
  "remark": "^15.0.0",
  "unified": "^10.0.0",
  "unist-util-visit": "^4.0.0",
  "react-markdown": "^9.0.0"
}
```

### Existing Dependencies
- Firebase Realtime Database
- React Context (PinboardContext, PinsContext)
- Existing MDX editor setup
- Workflow data system

---

## Success Criteria

### Phase 1-2 (Core Functionality)
- [ ] Users can open plugin and see available datasets
- [ ] Users can select JSON keys or markdown datasets
- [ ] Template variables are correctly generated and inserted
- [ ] Variables use proper shorthand for current pin

### Phase 3 (Hybrid System)
- [ ] Template variables render correctly in share pages
- [ ] Live updates work without re-rendering entire markdown
- [ ] Inline variables update efficiently
- [ ] Markdown variables re-parse only themselves

### Phase 4-5 (Advanced Features)
- [ ] Autocomplete works smoothly
- [ ] Performance is acceptable with large datasets
- [ ] User experience is intuitive and fast
- [ ] System is robust and well-tested

---

## MDXEditor Plugin Architecture

### Plugin Structure
```typescript
// templateVariablePlugin.ts
import { realmPlugin, Cell, Signal } from '@mdxeditor/editor'

// Plugin state cells
const isModalOpen$ = Cell(false)
const selectedDataset$ = Cell<string | null>(null)
const selectedJsonPath$ = Cell<string | null>(null)

// Plugin signals
const openModal$ = Signal<boolean>((r) => {
  r.link(r.pipe(openModal$, r.o.map(v => v)), isModalOpen$)
})

const insertVariable$ = Signal<string>((r) => {
  r.pub(createRootEditorSubscription$, (editor) => {
    return editor.registerCommand(
      INSERT_TEXT_COMMAND,
      (text) => {
        // Insert template variable into editor
        editor.dispatchCommand(INSERT_TEXT_COMMAND, text)
      },
      COMMAND_PRIORITY_LOW
    )
  })
})

export const templateVariablePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'templateVariable',
      // Add toolbar button
      [addToolbarItem$]: {
        id: 'templateVariable',
        group: 'formatting',
        item: <TemplateVariableToolbarButton />
      }
    })
  }
})
```

### Toolbar Button Component
```typescript
// TemplateVariableToolbarButton.tsx
import { useCellValue, usePublisher } from '@mdxeditor/editor'

export const TemplateVariableToolbarButton: React.FC = () => {
  const isModalOpen = useCellValue(isModalOpen$)
  const openModal = usePublisher(openModal$)
  
  return (
    <button
      onClick={() => openModal(true)}
      className="toolbar-button"
      title="Insert Template Variable"
    >
      <VariableIcon />
    </button>
  )
}
```

### Modal Component
```typescript
// TemplateVariableModal.tsx
export const TemplateVariableModal: React.FC = () => {
  const isOpen = useCellValue(isModalOpen$)
  const closeModal = usePublisher(isModalOpen$)
  const insertVariable = usePublisher(insertVariable$)
  
  const handleInsert = (variablePath: string) => {
    insertVariable(`{{${variablePath}}}`)
    closeModal(false)
  }
  
  if (!isOpen) return null
  
  return (
    <Modal onClose={() => closeModal(false)}>
      <DatasetSelector onSelect={handleInsert} />
    </Modal>
  )
}
```

---

## Technical Notes

### Variable Path Resolution
1. Parse variable path: `dataset.pin.{pin_id}.{dataset_id}.{json_path}`
2. Resolve pin_id (use current pin if shorthand)
3. Fetch dataset from Firebase
4. Navigate JSON path to get value
5. Handle markdown vs inline rendering

### Firebase Integration
- Use existing `useWorkflowDataRealtime` hook
- Subscribe to specific dataset paths
- Handle connection states and errors
- Implement efficient update batching

### Editor Integration
- MDXEditor: Use `createRootEditorSubscription$` to access Lexical editor
- Lexical Commands: Use `insertText` and `moveSelectionToEnd` commands
- State Management: Use Gurx cells/signals for plugin state
- Ensure proper cursor positioning and undo support via Lexical's history system

---

## Future Enhancements

### Advanced Variable Types
- [ ] Array iteration variables: `{{dataset.current.users[].name}}`
- [ ] Conditional variables: `{{dataset.current.weather.temp > 20 ? 'hot' : 'cold'}}`
- [ ] Computed variables: `{{dataset.current.stats.avg}}`

### Integration Features
- [ ] Variable sharing between pins
- [ ] Global variable definitions
- [ ] Variable versioning and history
- [ ] Export/import variable configurations

### Developer Experience
- [ ] Variable debugging tools
- [ ] Performance monitoring
- [ ] Variable usage analytics
- [ ] API for custom variable types
