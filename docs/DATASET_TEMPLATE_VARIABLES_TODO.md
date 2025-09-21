# Dataset and Template Variables + Real-time Sharing Implementation TODO

## Overview
Implement dataset management, template variable system, and real-time updates for PinDown.ai. This will allow users to create datasets, use template variables in markdown blocks, and see live updates on shared pages.

---

## Phase 1: Dataset View Implementation ✅ COMPLETED
- [x] Rename "Data" toggle to "Dataset" in pin detail page
- [x] Update URL routing to reflect dataset view (`/pins/:pinId?view=dataset`)
- [x] Create dataset view component with proper layout
- [x] Add dataset management UI (create, edit, delete datasets)
- [x] Add "Submitted Data" section with modal for data submission
- [x] Implement dataset submission modal with JSON/Markdown support
- [x] Add form validation and data type selection
- [x] Add approve/reject/delete functionality for submitted data
- [x] Add template variable preview in modal
- [ ] Implement dataset data structure in backend
- [ ] Test dataset view navigation and URL updates

## Phase 2: Dataset Management Backend ✅ COMPLETED
- [x] Create dataset CRUD API endpoints (`/api/pins/:pinId/datasets`)
- [x] Implement dataset data structure in Firebase (`pin_datasets` collection)
- [x] Add dataset validation schemas
- [ ] Connect frontend modal to backend API for dataset submission
- [ ] Replace placeholder data in "Submitted Data" section with real Firebase data
- [ ] Test complete flow: submit dataset → save to Firebase → display in UI
- [ ] Create dataset permissions system (owner, viewers, editors)
- [ ] Implement dataset versioning/history
- [ ] Add dataset import/export functionality

## Phase 3: Template Variable System
- [ ] Design template variable syntax (e.g., `{{variable_name}}`, `{{dataset.field}}`)
- [ ] Create template variable parser for markdown blocks
- [ ] Implement variable substitution in block rendering
- [ ] Add template variable validation and error handling
- [ ] Create template variable preview in markdown editor
- [ ] Test template variable rendering in both edit and view modes

## Phase 4: Real-time Data Updates
- [ ] Set up Firebase Realtime Database integration
- [ ] Create real-time data update system for datasets
- [ ] Implement webhook endpoints for external data sources
- [ ] Add real-time template variable updates
- [ ] Create data refresh mechanisms (manual, scheduled, webhook)
- [ ] Test real-time updates across multiple clients

## Phase 5: Share Page Real-time Integration
- [ ] Update share page to subscribe to real-time dataset changes
- [ ] Implement live template variable updates on shared pages
- [ ] Add real-time status indicators (live, offline, error)
- [ ] Create fallback mechanisms for when real-time fails
- [ ] Add real-time connection status UI
- [ ] Test real-time sharing with multiple viewers

## Phase 6: Advanced Features
- [ ] Add dataset templates and examples
- [ ] Implement data transformation functions in template variables
- [ ] Create dataset analytics and usage tracking
- [ ] Add dataset sharing and collaboration features
- [ ] Implement data caching and optimization
- [ ] Add dataset backup and restore functionality

---

## Technical Implementation Details

### Dataset Submission Modal Structure
```typescript
interface DatasetSubmissionModal {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DatasetSubmission) => void
}

interface DatasetSubmission {
  name: string
  type: 'markdown' | 'json'
  data: string
  description?: string
  pinId: string
}
```

### Firebase Database Schema
```json
{
  "pin_datasets": {
    "pin_123": {
      "dataset_456": {
        "metadata": {
          "name": "Q4 Sales Report",
          "type": "json",
          "description": "Quarterly sales performance data",
          "createdAt": "2024-01-15T10:00:00Z",
          "updatedAt": "2024-01-15T10:30:00Z",
          "createdBy": "user_789",
          "status": "active"
        },
        "data": {
          "totalSales": 125000,
          "newCustomers": 45,
          "conversionRate": 3.2,
          "topProduct": "Premium Plan"
        },
        "permissions": {
          "viewers": ["user_789"],
          "editors": ["user_789"]
        }
      }
    }
  }
}
```

### Template Variable Syntax Examples
```markdown
# Sales Report

## Summary
- **Total Sales**: {{datasets.q4_sales_report.totalSales}}
- **New Customers**: {{datasets.q4_sales_report.newCustomers}}
- **Conversion Rate**: {{datasets.q4_sales_report.conversionRate}}%

## Top Product
Our best performing product this quarter is **{{datasets.q4_sales_report.topProduct}}**.

## Live Data
Last updated: {{datasets.q4_sales_report.updatedAt}}
```

### Backend API Endpoints
```
POST /api/pins/:pinId/datasets - Create new dataset
GET /api/pins/:pinId/datasets - Get all datasets for pin
GET /api/pins/:pinId/datasets/:datasetId - Get specific dataset
PUT /api/pins/:pinId/datasets/:datasetId - Update dataset
DELETE /api/pins/:pinId/datasets/:datasetId - Delete dataset
```

### URL Structure
- **Blocks View**: `/pins/:pinId` (default)
- **Dataset View**: `/pins/:pinId?view=dataset`
- **Block Edit**: `/pins/:pinId/:blockId`
- **Share Page**: `/share/pin/:pinId`

### Implementation Order
1. **Modal Component** - User interface for data submission ✅ COMPLETED
2. **Backend API Routes** - Dataset CRUD operations ✅ IN PROGRESS
3. **Firebase Integration** - Backend storage and retrieval
4. **Template Variables** - Frontend parsing and rendering
5. **Real-time Updates** - Live data synchronization
6. **Share Page Integration** - Public access to live data
7. **Advanced Features** - Enhanced functionality and optimization

---

## Current Status: Phase 2 Complete, Starting Frontend Integration
**Next Action**: Connect frontend modal to backend API for dataset submission

## ✅ COMPLETED FEATURES:
- Dataset view with URL routing (`/pins/:pinId?view=dataset`)
- "Submitted Data" section with expandable entries
- Dataset submission modal with JSON/Markdown support
- Form validation and data type selection
- Approve/reject/delete functionality for submitted data
- Template variable preview in modal
- **Backend API endpoints** for dataset CRUD operations
- **Firebase database structure** for `pin_datasets` collection
- **Dataset validation schemas** with Zod

## Success Criteria
- [ ] Users can switch between blocks and dataset views
- [ ] URL reflects current view state
- [ ] Dataset view has proper UI for managing datasets
- [ ] Template variables work in markdown blocks
- [ ] Real-time updates work on shared pages
- [ ] System is performant and reliable
