# Workflow Datasets Integration Todo

## Overview
Integrate workflow datasets data into the markdown editor to allow users to select and insert dataset variables as template variables.

## Phase 1: Backend Infrastructure for Global Datasets

### 1.1 Create User Datasets Collection
- [ ] Create new `user_datasets` collection in Firebase
- [ ] Design schema for user datasets:
  ```typescript
  interface UserDataset {
    id: string
    user_id: string
    name: string
    description: string
    data: any // JSON data structure
    created_at: string
    updated_at: string
    is_public: boolean
    tags: string[]
  }
  ```

### 1.2 Backend API Endpoints for Datasets
- [ ] Create `/api/datasets` endpoint (GET, POST)
- [ ] Create `/api/datasets/{id}` endpoint (GET, PUT, DELETE)
- [ ] Add authentication middleware for dataset operations
- [ ] Implement data validation for dataset submissions
- [ ] Add pagination and filtering for datasets list

### 1.3 Dataset Management Features
- [ ] CRUD operations for user datasets
- [ ] Public/private dataset visibility
- [ ] Dataset sharing capabilities
- [ ] Dataset versioning (optional for future)

## Phase 2: Frontend Datasets Page Implementation

### 2.1 Create Datasets Route
- [ ] Create `frontend/src/app/(dashboard)/datasets/page.tsx`
- [ ] Implement datasets listing page with:
  - Grid/list view of datasets
  - Search and filter functionality
  - Add new dataset button
  - Dataset cards showing name, description, tags

### 2.2 Dataset Submission Modal
- [ ] Create `DatasetSubmissionModal` component
- [ ] Form fields:
  - Dataset name
  - Description
  - Data input (JSON editor or structured form)
  - Tags
  - Public/private toggle
- [ ] Data validation and submission
- [ ] Success/error handling

### 2.3 Dataset Management UI
- [ ] Dataset detail view
- [ ] Edit dataset functionality
- [ ] Delete dataset with confirmation
- [ ] Dataset sharing options
- [ ] Copy dataset ID functionality

## Phase 3: Pin-Specific Datasets Integration

### 3.1 Pin Dataset Association
- [ ] Modify pin schema to include dataset references:
  ```typescript
  interface Pin {
    // ... existing fields
    datasets: {
      user_datasets: string[] // IDs of user datasets
      global_datasets: string[] // IDs of global datasets
    }
  }
  ```

### 3.2 Pin Dataset Management
- [ ] Add dataset selection to pin creation/editing
- [ ] Display associated datasets in pin view
- [ ] Allow adding/removing datasets from pins
- [ ] Dataset preview in pin context

### 3.3 Pin Dataset API Integration
- [ ] Update pin endpoints to handle dataset associations
- [ ] Create endpoint to get datasets for a specific pin
- [ ] Implement dataset filtering by pin context

## Phase 4: Markdown Editor Plugin Development

### 4.1 Custom MDX Editor Plugin Architecture
- [ ] Create `WorkflowDatasetPlugin` using MDXEditor's realm plugin system
- [ ] Implement Gurx state management for dataset variables:
  ```typescript
  // Dataset state cells
  const availableDatasets$ = Cell<Dataset[]>([])
  const selectedDataset$ = Cell<Dataset | null>(null)
  const datasetVariables$ = Cell<DatasetVariable[]>([])
  
  // Dataset actions
  const insertDatasetVariable$ = Signal<string>((r) => {
    // Handle variable insertion logic
  })
  const loadDatasetsForPin$ = Signal<string>((r) => {
    // Load datasets when pin context changes
  })
  ```

### 4.2 Custom Lexical Node for Dataset Variables
- [ ] Create `DatasetVariableNode` extending Lexical's `TextNode`
- [ ] Implement node serialization/deserialization
- [ ] Add custom styling for dataset variables
- [ ] Support variable editing and validation
- [ ] Handle variable syntax: `{{dataset.name.field}}`

### 4.3 Markdown Import/Export Visitors
- [ ] Create `MdastDatasetVariableVisitor` for markdown import
- [ ] Create `LexicalDatasetVariableVisitor` for markdown export
- [ ] Handle variable syntax in markdown: `{{dataset.users[0].name}}`
- [ ] Support nested object access and array indexing
- [ ] Preserve variable formatting during import/export

### 4.4 Dataset Panel Component
- [ ] Create `DatasetVariablePanel` React component
- [ ] Integrate with MDXEditor using Gurx hooks:
  ```typescript
  const availableDatasets = useCellValue(availableDatasets$)
  const insertVariable = usePublisher(insertDatasetVariable$)
  ```
- [ ] Features:
  - Dataset selection dropdown
  - Variable tree view (nested object structure)
  - Variable insertion buttons
  - Live preview of dataset data
  - Search/filter variables

### 4.5 Editor Integration & Toolbar
- [ ] Add dataset toolbar button to MDXEditor toolbar
- [ ] Implement keyboard shortcuts for variable insertion
- [ ] Add variable syntax highlighting
- [ ] Create variable autocomplete system
- [ ] Handle variable validation and error states

### 4.6 Dataset Context Management
- [ ] Implement pin-specific dataset loading
- [ ] Handle dataset switching in editor
- [ ] Cache dataset data for performance
- [ ] Support real-time dataset updates
- [ ] Manage dataset permissions and access

## Phase 5: Dataset Template System

### 5.1 Template Variable Engine
- [ ] Create template rendering engine
- [ ] Support for:
  - Simple variable substitution
  - Conditional rendering
  - Loops and iterations
  - Nested object access
- [ ] Error handling for missing variables

### 5.2 Dataset Context Management
- [ ] Pin-specific dataset context
- [ ] Global dataset context
- [ ] Dataset merging and priority rules
- [ ] Context switching in editor

### 5.3 Template Preview System
- [ ] Real-time template preview
- [ ] Dataset variable resolution
- [ ] Preview with sample data
- [ ] Export functionality

## Phase 6: Advanced Features

### 6.1 Dataset Relationships
- [ ] Dataset dependencies
- [ ] Cross-dataset references
- [ ] Dataset inheritance
- [ ] Dataset composition

### 6.2 Dataset Analytics
- [ ] Dataset usage tracking
- [ ] Popular datasets
- [ ] Dataset performance metrics
- [ ] User dataset statistics

### 6.3 Dataset Sharing & Collaboration
- [ ] Public dataset marketplace
- [ ] Dataset forking and versioning
- [ ] Dataset collaboration features
- [ ] Dataset import/export

## Technical Implementation Notes

### Database Schema Updates
```typescript
// Add to existing Pin interface
interface Pin {
  // ... existing fields
  datasets: {
    user_datasets: string[]
    global_datasets: string[]
  }
}

// New UserDataset interface
interface UserDataset {
  id: string
  user_id: string
  name: string
  description: string
  data: any
  created_at: string
  updated_at: string
  is_public: boolean
  tags: string[]
  usage_count: number
}
```

### API Endpoints to Create
```
GET    /api/datasets                    # List user datasets
POST   /api/datasets                    # Create new dataset
GET    /api/datasets/{id}               # Get specific dataset
PUT    /api/datasets/{id}               # Update dataset
DELETE /api/datasets/{id}               # Delete dataset
GET    /api/datasets/global             # List public datasets
GET    /api/pins/{id}/datasets          # Get datasets for pin
POST   /api/pins/{id}/datasets          # Associate dataset with pin
DELETE /api/pins/{id}/datasets/{dataset_id} # Remove dataset from pin
```

### Frontend Components to Create
- `DatasetSubmissionModal`
- `DatasetCard`
- `DatasetList`
- `DatasetSelector`
- `WorkflowDatasetPlugin` (MDX Editor plugin)
- `DatasetVariablePanel`
- `TemplatePreview`

## Technical Implementation Details

### MDXEditor Plugin Implementation
```typescript
// WorkflowDatasetPlugin.ts
import { realmPlugin, Cell, Signal } from '@mdxeditor/editor'
import { DatasetVariableNode } from './DatasetVariableNode'
import { MdastDatasetVariableVisitor } from './MdastDatasetVariableVisitor'
import { LexicalDatasetVariableVisitor } from './LexicalDatasetVariableVisitor'

// State management cells
export const availableDatasets$ = Cell<Dataset[]>([])
export const selectedDataset$ = Cell<Dataset | null>(null)
export const datasetVariables$ = Cell<DatasetVariable[]>([])

// Actions
export const insertDatasetVariable$ = Signal<string>((r) => {
  // Insert variable at cursor position
  r.pub(createActiveEditorSubscription$, (editor) => {
    // Lexical command to insert DatasetVariableNode
  })
})

export const loadDatasetsForPin$ = Signal<string>((r) => {
  // Load datasets when pin context changes
  r.pipe(
    loadDatasetsForPin$,
    r.o.map(async (pinId) => {
      const datasets = await fetchDatasetsForPin(pinId)
      r.pub(availableDatasets$, datasets)
    })
  )
})

export const workflowDatasetPlugin = realmPlugin<{
  pinId?: string
  datasets?: Dataset[]
}>({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'workflowDataset',
      [addImportVisitor$]: MdastDatasetVariableVisitor,
      [addLexicalNode$]: DatasetVariableNode,
      [addExportVisitor$]: LexicalDatasetVariableVisitor
    })
  },
  update(realm, params) {
    if (params?.pinId) {
      realm.pub(loadDatasetsForPin$, params.pinId)
    }
    if (params?.datasets) {
      realm.pub(availableDatasets$, params.datasets)
    }
  }
})
```

### Custom Lexical Node
```typescript
// DatasetVariableNode.ts
import { TextNode } from 'lexical'

export class DatasetVariableNode extends TextNode {
  __variablePath: string
  __datasetName: string

  constructor(text: string, variablePath: string, datasetName: string) {
    super(text)
    this.__variablePath = variablePath
    this.__datasetName = datasetName
  }

  static getType(): string {
    return 'datasetVariable'
  }

  static clone(node: DatasetVariableNode): DatasetVariableNode {
    return new DatasetVariableNode(node.__text, node.__variablePath, node.__datasetName)
  }

  createDOM(): HTMLElement {
    const element = document.createElement('span')
    element.className = 'dataset-variable'
    element.setAttribute('data-variable-path', this.__variablePath)
    element.setAttribute('data-dataset-name', this.__datasetName)
    return element
  }

  updateDOM(prevNode: DatasetVariableNode, dom: HTMLElement): boolean {
    if (prevNode.__variablePath !== this.__variablePath) {
      dom.setAttribute('data-variable-path', this.__variablePath)
    }
    if (prevNode.__datasetName !== this.__datasetName) {
      dom.setAttribute('data-dataset-name', this.__datasetName)
    }
    return false
  }
}
```

### Dataset Panel Component
```typescript
// DatasetVariablePanel.tsx
import { useCellValue, usePublisher } from '@mdxeditor/editor'
import { availableDatasets$, selectedDataset$, insertDatasetVariable$ } from './WorkflowDatasetPlugin'

export const DatasetVariablePanel: React.FC = () => {
  const datasets = useCellValue(availableDatasets$)
  const selectedDataset = useCellValue(selectedDataset$)
  const insertVariable = usePublisher(insertDatasetVariable$)

  const handleVariableClick = (variablePath: string) => {
    insertVariable(variablePath)
  }

  return (
    <div className="dataset-panel">
      <select onChange={(e) => setSelectedDataset(e.target.value)}>
        {datasets.map(dataset => (
          <option key={dataset.id} value={dataset.id}>
            {dataset.name}
          </option>
        ))}
      </select>
      
      {selectedDataset && (
        <VariableTree 
          data={selectedDataset.data}
          onVariableClick={handleVariableClick}
        />
      )}
    </div>
  )
}
```

## Priority Order
1. **Phase 1**: Backend infrastructure (highest priority)
2. **Phase 2**: Frontend datasets page
3. **Phase 3**: Pin-dataset integration
4. **Phase 4**: Markdown editor plugin
5. **Phase 5**: Template system
6. **Phase 6**: Advanced features (lowest priority)

## Success Criteria
- Users can create and manage datasets
- Datasets can be associated with pins
- Markdown editor supports dataset variables
- Template rendering works with real data
- System is performant and user-friendly
