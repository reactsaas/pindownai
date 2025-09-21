# Workflow Data & Dataset Types Implementation TODO

## Overview
Implement workflow data submission functionality and add dataset type categorization system to properly organize different types of datasets in the frontend.

## Phase 1: Backend Dataset Type System ✅ IN PROGRESS
- [x] Update dataset schema to include `datasetType` field
- [x] Modify `createDatasetSchema` to accept `datasetType` parameter
- [x] Update Firebase dataset structure to store `datasetType`
- [x] Add validation for dataset types: `workflow`, `user`, `integration`, `document`, `research`
- [ ] Update existing datasets to have default `datasetType: 'user'`

## Phase 2: Backend Dataset Type Integration ✅ COMPLETED
- [x] Update existing dataset routes to handle `datasetType` field
- [x] Modify `POST /api/pins/:pid/datasets` to accept `datasetType` parameter
- [x] Update `PUT /api/pins/:pid/datasets/:datasetId` to handle `datasetType` updates
- [x] Ensure existing `DELETE /api/pins/:pid/datasets/:datasetId` works with typed datasets
- [x] Test all existing dataset routes with new `datasetType` field

## Phase 3: Frontend Dataset Type Categorization ✅ COMPLETED
- [x] Update `TemplateDataSources` component to categorize datasets by type
- [x] Create separate sections for each dataset type:
  - [x] **Workflow Data** - `datasetType: 'workflow'`
  - [x] **User Submitted Data** - `datasetType: 'user'` 
  - [x] **Integration Data** - `datasetType: 'integration'`
  - [x] **Document Data** - `datasetType: 'document'`
  - [x] **Research Data** - `datasetType: 'research'`
- [x] Update dataset submission modal to include dataset type selection
- [x] Remove placeholder workflow data items

## Phase 4: Workflow Data Modal Component ✅ PLANNED
- [ ] Create `WorkflowDataSubmissionModal` component
- [ ] Add fields for workflow data name and description
- [ ] Connect to existing dataset API with `datasetType: 'workflow'`
- [ ] Add "Add Item" button to Workflow Data section
- [ ] Implement workflow data CRUD operations using existing dataset routes

## Phase 5: Frontend Integration ✅ PLANNED
- [ ] Update pin detail page to fetch datasets by type
- [ ] Implement workflow data submission flow
- [ ] Add workflow data management (rename, delete)
- [ ] Update dataset display to show correct categories
- [ ] Test complete workflow data submission flow

## Phase 6: Advanced Features (Optional) ✅ PLANNED
- [ ] Add dataset type filtering
- [ ] Implement dataset type icons/colors
- [ ] Add dataset type statistics
- [ ] Create dataset type migration for existing data

---

## Technical Implementation Details

### Dataset Type Schema
```typescript
interface DatasetSubmission {
  name: string
  type: 'markdown' | 'json'
  datasetType: 'workflow' | 'user' | 'integration' | 'document' | 'research'
  data: string
  description?: string
}
```

### Firebase Database Structure
```json
{
  "pin_datasets": {
    "pinId": {
      "datasetId": {
        "id": "datasetId",
        "metadata": {
          "name": "Dataset Name",
          "type": "json|markdown",
          "datasetType": "workflow|user|integration|document|research",
          "description": "Description",
          "createdBy": "userId",
          "createdAt": "timestamp",
          "updatedAt": "timestamp",
          "status": "active"
        },
        "data": { /* parsed data */ },
        "permissions": {
          "viewers": ["userId"],
          "editors": ["userId"]
        }
      }
    }
  }
}
```

### Backend API Endpoints
```
POST   /api/pins/:pid/datasets                    # Create dataset (any type with datasetType)
GET    /api/pins/:pid/datasets                    # Get all datasets (filtered by datasetType)
GET    /api/pins/:pid/datasets/:datasetId         # Get specific dataset
PUT    /api/pins/:pid/datasets/:datasetId         # Update dataset (including datasetType)
DELETE /api/pins/:pid/datasets/:datasetId         # Delete dataset
```

### Frontend Component Structure
```
TemplateDataSources
├── Workflow Data Section
│   ├── Add Item Button → WorkflowDataSubmissionModal (datasetType: 'workflow')
│   └── Workflow Data Items (datasetType: 'workflow')
├── User Submitted Data Section  
│   ├── Add Item Button → DatasetSubmissionModal (datasetType: 'user')
│   └── User Data Items (datasetType: 'user')
├── Integration Data Section
│   ├── Add Item Button → DatasetSubmissionModal (datasetType: 'integration')
│   └── Integration Items (datasetType: 'integration')
├── Document Data Section
│   ├── Add Item Button → DatasetSubmissionModal (datasetType: 'document')
│   └── Document Items (datasetType: 'document')
└── Research Data Section
    ├── Add Item Button → DatasetSubmissionModal (datasetType: 'research')
    └── Research Items (datasetType: 'research')
```

---

**Current Status**: Phase 3 Complete, Ready to start Phase 4
**Next Action**: Create WorkflowDataSubmissionModal component
